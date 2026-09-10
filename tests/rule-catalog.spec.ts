import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test, type Page, type Request } from "@playwright/test";
import { CATALOG_CACHE_KEY, parseRuleCatalog, catalogUrl } from "../src/lib/rule-catalog";

const remote = "https://rules.example.test/library/catalog.json";
const fixture = (name = "测试分流", config = "configs/test.ini") => ({
  version: 1,
  updated_at: "2026-09-11T00:00:00Z",
  templates: [{ id: "test", name, description: "按应用与地区分组", config_url: config, payload_url: "payloads/test.json", rule_count: 23, group_count: 4, source: { name: "NyaSub", url: "https://example.test/source" }, warnings: ["规则顺序影响分流结果"] }],
});

async function mockCatalog(page: Page, url = "**/rules/catalog.json", value = fixture()) {
  await page.route(url, (route) => route.fulfill({ contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(value) }));
}

async function useRemote(page: Page, url = remote) {
  await page.addInitScript((catalog) => {
    localStorage.setItem("nya-subconverter.data.v1", JSON.stringify({ settings: { ruleCatalogUrl: catalog } }));
  }, url);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  // Tests generate links locally; any accidental conversion request is blocked.
  await page.route(/\/(sub|version)(\?|$)/, (route) => route.abort());
});

test("catalog schema resolves relative links and rejects unsafe or duplicate entries", () => {
  expect(parseRuleCatalog(fixture(), remote).templates[0].config_url).toBe("https://rules.example.test/library/configs/test.ini");
  expect(() => parseRuleCatalog(fixture("unsafe", "javascript:alert(1)"), remote)).toThrow(/HTTP/);
  expect(() => catalogUrl("https://name:password@example.test/rules", remote)).toThrow(/HTTP/);
  const duplicate = fixture();
  duplicate.templates.push(duplicate.templates[0]);
  expect(() => parseRuleCatalog(duplicate, remote)).toThrow(/重复/);
  expect(() => parseRuleCatalog({ ...fixture(), version: 2 }, remote)).toThrow(/version/);
});

test("catalog redirect resolves final path, omits credentials and applies only config", async ({ page, context }) => {
  // Playwright only routes the first request of a redirect chain. A real local
  // fixture exercises browser redirects without contacting an external host.
  const received: { path: string; cookie?: string; authorization?: string; referer?: string }[] = [];
  const server = createServer((request, response) => {
    received.push({ path: request.url ?? "", cookie: request.headers.cookie, authorization: request.headers.authorization, referer: request.headers.referer });
    response.setHeader("Access-Control-Allow-Origin", "*");
    if (request.url === "/start.json") {
      response.writeHead(302, { location: "/library/catalog.json" });
      response.end();
    } else if (request.url === "/library/catalog.json") {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(fixture()));
    } else {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const configUrl = `${origin}/library/configs/test.ini`;
  try {
    await useRemote(page, `${origin}/start.json`);
    await context.addCookies([{ name: "catalog-private", value: "must-not-send", url: origin }]);
    const requests: Request[] = [];
    page.on("request", (request) => { if (request.url().startsWith(`${origin}/`)) requests.push(request); });
    await page.goto("/rules");
    const card = page.getByTestId("rule-template-test");
    await expect(card.getByRole("heading", { name: "测试分流" })).toBeVisible();
    await expect(card.getByRole("link", { name: "查看 SubConverter INI" })).toHaveAttribute("href", configUrl);
    await card.getByRole("button", { name: "用于转换" }).click();
    await expect(page.getByLabel("远程规则配置")).toHaveValue(configUrl);
    await page.locator("textarea").first().fill("https://subscription.example.test/private?token=subscription-secret");
    await page.getByRole("button", { name: "生成订阅链接" }).click();
    await expect(page.getByRole("heading", { name: "订阅链接已生成" })).toBeVisible();
    const result = await page.evaluate(() => JSON.parse(localStorage.getItem("nya-subconverter.data.v1")!).history[0].resultUrl as string);
    expect(new URL(result).searchParams.get("config")).toBe(configUrl);
    expect(new URL(result).searchParams.get("url")).toContain("subscription-secret");
    await page.getByRole("link", { name: "浏览规则库" }).click();
    await page.getByRole("button", { name: "在线更新", exact: true }).click();
    await expect(page.getByText("在线目录已就绪", { exact: true })).toBeVisible();
    expect(requests.length).toBeGreaterThanOrEqual(4);
    for (const request of requests) {
      const headers = await request.allHeaders();
      expect(JSON.stringify({ url: request.url(), headers, body: request.postData() })).not.toContain("subscription-secret");
      expect(headers.cookie).toBeUndefined();
      expect(headers.authorization).toBeUndefined();
      expect(headers.referer).toBeUndefined();
      expect(request.postData()).toBeNull();
    }
    expect(received.filter((request) => request.path === "/library/catalog.json")).toHaveLength(2);
    for (const request of received) {
      expect(request.cookie).toBeUndefined();
      expect(request.authorization).toBeUndefined();
      expect(request.referer).toBeUndefined();
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("failed and malformed updates preserve cache and personal profiles", async ({ page }) => {
  let response = "ok";
  await page.route("**/rules/catalog.json", (route) => {
    if (response === "offline") return route.abort();
    if (response === "large") return route.fulfill({ contentType: "application/json", headers: { "content-length": String(3 * 1024 * 1024) }, body: JSON.stringify(fixture("too large")) });
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(response === "invalid" ? fixture("invalid", "file:///private") : fixture()) });
  });
  await page.goto("/rules");
  const card = page.getByTestId("rule-template-test");
  await card.getByRole("button", { name: "保存为 Profile" }).click();
  await expect(card.getByRole("button", { name: "已保存 Profile" })).toBeDisabled();
  const profiles = await page.evaluate(() => JSON.parse(localStorage.getItem("nya-subconverter.data.v1")!).profiles);
  for (const failure of ["offline", "invalid", "large"]) {
    response = failure;
    await page.getByRole("button", { name: "在线更新", exact: true }).click();
    await expect(page.getByText("更新失败 · 使用上次成功的缓存", { exact: true })).toBeVisible();
    await expect(card.getByRole("heading", { name: "测试分流" })).toBeVisible();
  }
  response = "offline";
  await page.reload();
  await expect(page.getByText("更新失败 · 使用上次成功的缓存", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("nya-subconverter.data.v1")!).profiles)).toEqual(profiles);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("late responses from a previous catalog cannot replace the selected directory", async ({ page }) => {
  const oldUrl = "https://rules.example.test/slow.json";
  await useRemote(page, oldUrl);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let oldStarted = false;
  let oldFinished = false;
  await page.route(oldUrl, async (route) => {
    oldStarted = true;
    await gate;
    await route.fulfill({ contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(fixture("迟到的旧目录")) }).catch(() => undefined);
    oldFinished = true;
  });
  await mockCatalog(page, remote, fixture("当前目录"));
  await page.goto("/settings");
  await expect.poll(() => oldStarted).toBe(true);
  await page.getByLabel("规则目录 URL").fill(remote);
  await page.getByRole("button", { name: "保存规则目录", exact: true }).click();
  await page.getByRole("link", { name: "浏览规则库", exact: true }).click();
  await expect(page.getByRole("heading", { name: "当前目录", exact: true })).toBeVisible();
  release();
  await expect.poll(() => oldFinished).toBe(true);
  await expect(page.getByRole("heading", { name: "当前目录", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "迟到的旧目录", exact: true })).toHaveCount(0);
});

test("settings changes isolate caches and recover from corrupted cache", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "corrupted-json"), CATALOG_CACHE_KEY);
  await mockCatalog(page);
  await mockCatalog(page, remote, fixture("第二个目录", "configs/second.ini"));
  await page.goto("/rules");
  await expect(page.getByRole("heading", { name: "测试分流", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "更换规则目录" }).click();
  await page.getByLabel("规则目录 URL").fill(remote);
  await page.getByRole("button", { name: "保存规则目录", exact: true }).click();
  await page.getByRole("link", { name: "浏览规则库", exact: true }).click();
  await expect(page.getByRole("heading", { name: "第二个目录", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "测试分流", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "查看 SubConverter INI" })).toHaveAttribute("href", "https://rules.example.test/library/configs/second.ini");
});
