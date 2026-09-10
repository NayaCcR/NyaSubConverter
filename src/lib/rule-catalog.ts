export type RuleTemplate = {
  id: string;
  name: string;
  description: string;
  config_url: string;
  payload_url?: string;
  rule_count?: number;
  group_count?: number;
  source?: { name: string; url: string; revision?: string; retrieved_at?: string; license?: string };
  warnings?: string[];
};

export type RuleCatalog = { version: 1; updated_at: string; templates: RuleTemplate[] };
export type CatalogSnapshot = { url: string; resolved_url: string; fetched_at: string; catalog: RuleCatalog };
export const CATALOG_CACHE_KEY = "nya-subconverter.rule-catalog.v1";
export const CATALOG_MAX_BYTES = 2 * 1024 * 1024;

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("规则目录结构无效");
  return value as Record<string, unknown>;
}

function text(value: unknown, name: string, max = 2000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`规则目录的 ${name} 无效`);
  return value.trim();
}

export function catalogUrl(value: string, base: string): string {
  const url = new URL(text(value, "URL", 4096), base);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("规则 URL 仅支持不含用户名和密码的 HTTP(S) 地址");
  url.hash = "";
  return url.href;
}

function date(value: unknown, name: string): string {
  const result = text(value, name, 64);
  if (!Number.isFinite(Date.parse(result))) throw new Error(`规则目录的 ${name} 日期无效`);
  return result;
}

function count(value: unknown, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error(`规则目录的 ${name} 无效`);
  return value;
}

export function parseRuleCatalog(value: unknown, base: string): RuleCatalog {
  const raw = object(value);
  if (raw.version !== 1 || !Array.isArray(raw.templates) || raw.templates.length > 200) throw new Error("仅支持 version: 1 且不超过 200 个模板的规则目录");
  const ids = new Set<string>();
  const templates = raw.templates.map((entry): RuleTemplate => {
    const item = object(entry);
    const id = text(item.id, "id", 100);
    if (ids.has(id)) throw new Error("规则目录包含重复模板 ID");
    ids.add(id);
    let source: RuleTemplate["source"];
    if (item.source !== undefined) {
      const rawSource = object(item.source);
      source = { name: text(rawSource.name, "source.name", 200), url: catalogUrl(text(rawSource.url, "source.url", 4096), base) };
      if (rawSource.revision !== undefined) source.revision = text(rawSource.revision, "revision", 200);
      if (rawSource.retrieved_at !== undefined) source.retrieved_at = date(rawSource.retrieved_at, "retrieved_at");
      if (rawSource.license !== undefined) source.license = text(rawSource.license, "license", 200);
    }
    let warnings: string[] | undefined;
    if (item.warnings !== undefined) {
      if (!Array.isArray(item.warnings) || item.warnings.length > 30) throw new Error("规则目录的 warnings 无效");
      warnings = item.warnings.map((warning) => text(warning, "warnings"));
    }
    return {
      id, name: text(item.name, "name", 200), description: text(item.description, "description", 4000),
      config_url: catalogUrl(text(item.config_url, "config_url", 4096), base),
      ...(item.payload_url !== undefined ? { payload_url: catalogUrl(text(item.payload_url, "payload_url", 4096), base) } : {}),
      rule_count: count(item.rule_count, "rule_count"), group_count: count(item.group_count, "group_count"), source, warnings,
    };
  });
  return { version: 1, updated_at: date(raw.updated_at, "updated_at"), templates };
}

/** Stream and bound the decoded body too; Content-Length may be absent or compressed. */
export async function fetchRuleCatalog(url: string, signal: AbortSignal): Promise<CatalogSnapshot> {
  const response = await fetch(url, { signal, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" });
  if (!response.ok) throw new Error(`规则目录请求失败（HTTP ${response.status}）`);
  if (Number(response.headers.get("content-length")) > CATALOG_MAX_BYTES) throw new Error("规则目录超过 2 MiB 限制");
  const resolved = catalogUrl(response.url || url, url);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("规则目录响应为空");
  let total = 0;
  let body = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > CATALOG_MAX_BYTES) throw new Error("规则目录超过 2 MiB 限制");
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
  let raw: unknown;
  try { raw = JSON.parse(body); } catch { throw new Error("规则目录不是有效的 JSON"); }
  return { url, resolved_url: resolved, fetched_at: new Date().toISOString(), catalog: parseRuleCatalog(raw, resolved) };
}

function readSnapshots(): CatalogSnapshot[] {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return [];
    if (raw.length > CATALOG_MAX_BYTES * 3) throw new Error("cache too large");
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length > 3) throw new Error("cache invalid");
    return entries.map((entry) => {
      const item = object(entry);
      const url = catalogUrl(text(item.url, "url", 4096), window.location.href);
      const resolved = catalogUrl(text(item.resolved_url, "resolved_url", 4096), url);
      return { url, resolved_url: resolved, fetched_at: date(item.fetched_at, "fetched_at"), catalog: parseRuleCatalog(item.catalog, resolved) };
    });
  } catch { return []; }
}

export function readCatalogCache(url: string): CatalogSnapshot | undefined {
  return readSnapshots().find((entry) => entry.url === url);
}

export function writeCatalogCache(snapshot: CatalogSnapshot): boolean {
  try {
    const entries = [snapshot, ...readSnapshots().filter((entry) => entry.url !== snapshot.url)].slice(0, 3);
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(entries));
    return true;
  } catch { return false; }
}

export function isLocalRuleUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || /^127\./.test(host) || host === "0.0.0.0";
  } catch { return false; }
}
