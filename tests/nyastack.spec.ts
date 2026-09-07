import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
});

test("shared theme and shell preserve navigation, language, mode and control positions", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "订阅转换", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("--primary", "191 82% 36%");
  if (!isMobile) {
    const tools = page.locator(".desktop-shell-actions");
    const before = await tools.boundingBox();
    await page.getByRole("button", { name: "切换到顶部栏布局" }).click();
    await expect(page.locator(".desktop-page-tools")).toHaveCount(0);
    expect(await tools.boundingBox()).toEqual(before);
    await page.getByRole("button", { name: "切换到侧边栏布局" }).click();
    await page.getByRole("button", { name: "收起侧边栏" }).click();
    await expect(page.getByRole("button", { name: "展开侧边栏" }).locator("svg")).toHaveCSS("width", "20px");
    await page.reload();
    await expect(page.getByRole("button", { name: "展开侧边栏" })).toBeVisible();
  } else {
    await page.getByRole("button", { name: "打开导航" }).click();
  }
  const language = page.getByRole("button", { name: "切换语言" });
  await language.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  if (isMobile) await page.getByRole("button", { name: "打开导航" }).click();
  await language.click();
  await page.getByRole("menuitemradio", { name: "English" }).click();
  if (isMobile) await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "System", exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole("button", { name: "System", exact: true }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "Light", exact: true }).filter({ visible: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveCSS("--primary", "190 72% 53%");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

for (const entry of [
  { route: "/", trigger: "从 URL 解析", title: "从 URL 解析" },
  { route: "/", trigger: "上传配置", title: "上传远程配置", advanced: true },
  { route: "/profiles", trigger: "新建 Profile", title: "新建 Profile" },
  { route: "/providers", trigger: "添加后端", title: "添加转换后端" },
]) {
  test(`${entry.title}: ARIA, focus trap, Escape, overlay, focus restoration`, async ({ page }) => {
    await page.goto(entry.route);
    if (entry.advanced) await page.getByRole("button", { name: "高级转换选项" }).click();
    const trigger = page.getByRole("button", { name: entry.trigger, exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: entry.title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-describedby", /.+/);
    await expect(dialog.getByRole("button", { name: "关闭", exact: true })).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    for (let i = 0; i < 28; i++) {
      await page.keyboard.press(i < 14 ? "Tab" : "Shift+Tab");
      expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog).toBeVisible();
    // Locator clicks wait for the newly mounted overlay to be actionable.
    // Raw mouse coordinates can race the dialog's portal/effect setup.
    await page.locator('div[data-state="open"].fixed.inset-0').click({ position: { x: 3, y: 3 } });
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole("button", { name: "关闭", exact: true }).click();
    await expect(trigger).toBeFocused();
  });
}

test("provider editor saves native input values and persists across reload", async ({ page }) => {
  await page.goto("/providers");
  await page.getByRole("button", { name: "添加后端", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const save = dialog.getByRole("button", { name: "保存", exact: true });
  await expect(save).toBeDisabled();
  await dialog.getByLabel("名称", { exact: true }).fill("NyaStack test provider");
  await dialog.getByLabel("Endpoint", { exact: true }).fill("https://example.invalid/sub");
  await save.click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("NyaStack test provider", { exact: true })).toBeVisible();
});

test("shared controls keep glow, focus feedback and reduced motion", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("button", { name: "从 URL 解析", exact: true });
  await button.hover();
  await expect(button).not.toHaveCSS("box-shadow", "none");
  await expect(button).toHaveCSS("transform", "none");
  await page.keyboard.press("Tab");
  await button.focus();
  await expect(button).not.toHaveCSS("box-shadow", "none");
});
