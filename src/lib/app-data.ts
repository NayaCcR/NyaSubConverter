export type ProviderType = "self_hosted" | "third_party" | "public" | "custom";
export type ProviderStatus = "online" | "offline" | "checking" | "unknown";
export type PrivacyLevel = "low" | "medium" | "high";

export type Provider = {
  id: string;
  name: string;
  type: ProviderType;
  endpoint: string;
  enabled: boolean;
  status: ProviderStatus;
  privacy_level: PrivacyLevel;
  isDefault?: boolean;
  latency?: number;
  updatedAt?: string;
};

export type ConvertOptions = {
  target: string;
  config: string;
  filename: string;
  include: string;
  exclude: string;
  rename: string;
  devId: string;
  interval: string;
  userAgent: string;
  emoji: boolean;
  udp: boolean;
  xudp: boolean;
  scv: boolean;
  tfo: boolean;
  sort: boolean;
  list: boolean;
  insert: boolean;
  appendType: boolean;
  tls13: boolean;
  expand: boolean;
  fdn: boolean;
  clashDoh: boolean;
  surgeDoh: boolean;
  clashNewName: boolean;
  singboxIpv6: boolean;
};

export type Profile = ConvertOptions & {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
};

export type HistoryItem = {
  id: string;
  createdAt: string;
  providerId: string;
  providerName: string;
  target: string;
  sourceCount: number;
  source: string;
  resultUrl: string;
};

export type AppSettings = {
  publicListUrl: string;
  shortUrlEndpoint: string;
  shortUrlToken: string;
  shortUrlServices: CustomShortUrlService[];
  configUploadEndpoint: string;
  scriptApiEndpoint: string;
  rememberSource: boolean;
  maskSource: boolean;
  checkBeforeConvert: boolean;
};

export type CustomShortUrlService = {
  id: string;
  name: string;
  endpoint: string;
  token: string;
};

export type ShortUrlServiceOption = {
  id: string;
  label: string;
  endpoint: string;
  token: string;
};

export const defaultOptions: ConvertOptions = {
  target: "clash",
  config: "",
  filename: "",
  include: "",
  exclude: "",
  rename: "",
  devId: "",
  interval: "",
  userAgent: "",
  emoji: true,
  udp: true,
  xudp: false,
  scv: false,
  tfo: false,
  sort: false,
  list: false,
  insert: false,
  appendType: false,
  tls13: false,
  expand: true,
  fdn: false,
  clashDoh: false,
  surgeDoh: false,
  clashNewName: true,
  singboxIpv6: false,
};

/** Static providers shipped with the frontend. User changes are persisted separately in localStorage. */
export const defaultProviders: Provider[] = [
  {
    id: "local-subconverter",
    name: "本机 SubConverter",
    type: "self_hosted",
    endpoint: "http://127.0.0.1:25500/sub",
    enabled: true,
    status: "unknown",
    privacy_level: "low",
    isDefault: true,
  },
  {
    id: "public-sub-web",
    name: "sub-web作者提供",
    type: "public",
    endpoint: "https://api.wcc.best/sub",
    enabled: true,
    status: "unknown",
    privacy_level: "low",
  },
  {
    id: "public-feiyang1",
    name: "肥羊-增强型后端",
    type: "public",
    endpoint: "https://url.v1.mk/sub",
    enabled: true,
    status: "unknown",
    privacy_level: "low",
  },
  {
    id: "public-feiyang0",
    name: "肥羊-备用后端",
    type: "public",
    endpoint: "https://api.v1.mk/sub",
    enabled: true,
    status: "unknown",
    privacy_level: "low",
  },
];

export const defaultProfiles: Profile[] = [
  {
    id: "profile-clash",
    name: "Clash 日常配置",
    description: "启用 Emoji 与 UDP，使用 Clash 新字段名",
    ...defaultOptions,
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: "profile-surge",
    name: "Surge 4",
    description: "适用于 Surge 4 及更新版本",
    ...defaultOptions,
    target: "surge&ver=4",
    updatedAt: new Date(0).toISOString(),
  },
];

export const defaultSettings: AppSettings = {
  publicListUrl: "",
  shortUrlEndpoint: "",
  shortUrlToken: "",
  shortUrlServices: [],
  configUploadEndpoint: "",
  scriptApiEndpoint: "",
  rememberSource: true,
  maskSource: true,
  checkBeforeConvert: false,
};

export const targets = [
  { value: "clash", label: "Clash", popular: true },
  { value: "singbox", label: "sing-box", popular: true },
  { value: "surge&ver=4", label: "Surge 4/5", popular: true },
  { value: "quanx", label: "Quantumult X", popular: true },
  { value: "loon", label: "Loon", popular: true },
  { value: "shadowrocket", label: "Shadowrocket", popular: true },
  { value: "v2ray", label: "V2Ray", popular: true },
  { value: "auto", label: "自动判断", popular: true },
  { value: "clashr", label: "ClashR" },
  { value: "surge&ver=3", label: "Surge 3" },
  { value: "surge&ver=2", label: "Surge 2" },
  { value: "quan", label: "Quantumult" },
  { value: "surfboard", label: "Surfboard" },
  { value: "mellow", label: "Mellow" },
  { value: "trojan", label: "Trojan" },
  { value: "mixed", label: "混合订阅" },
  { value: "ss", label: "Shadowsocks (SIP002)" },
  { value: "sssub", label: "Shadowsocks Android" },
  { value: "ssd", label: "ShadowsocksD" },
  { value: "ssr", label: "ShadowsocksR" },
];

export const shortUrlServices = [
  { id: "builtin-v1-mk", label: "v1.mk", endpoint: "https://v1.mk/short", token: "" },
  { id: "builtin-d1-mk", label: "d1.mk", endpoint: "https://d1.mk/short", token: "" },
  { id: "builtin-dlj-tf", label: "dlj.tf", endpoint: "https://dlj.tf/short", token: "" },
  { id: "builtin-suo-yt", label: "suo.yt", endpoint: "https://suo.yt/short", token: "" },
  { id: "builtin-sub-cm", label: "sub.cm", endpoint: "https://sub.cm/short", token: "" },
] satisfies ShortUrlServiceOption[];

export function normalizeSettings(value?: Partial<AppSettings> | null): AppSettings {
  const merged = { ...defaultSettings, ...(value ?? {}) };
  const rawServices = Array.isArray(value?.shortUrlServices) ? value.shortUrlServices : [];
  const shortUrlServices = rawServices
    .map((service, index) => {
      const item = service as Partial<CustomShortUrlService>;
      const endpoint = typeof item.endpoint === "string" ? item.endpoint.trim() : "";
      return {
        id: typeof item.id === "string" && item.id.trim() ? item.id : `short-service-${index + 1}`,
        name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : getShortUrlServiceName(endpoint),
        endpoint,
        token: typeof item.token === "string" ? item.token : "",
      };
    })
    .filter((service) => service.endpoint);

  return {
    ...merged,
    shortUrlEndpoint: typeof merged.shortUrlEndpoint === "string" ? merged.shortUrlEndpoint : "",
    shortUrlToken: typeof merged.shortUrlToken === "string" ? merged.shortUrlToken : "",
    shortUrlServices,
  };
}

export function getShortUrlServiceName(endpoint: string) {
  try {
    return new URL(endpoint).host || endpoint;
  } catch {
    return endpoint || "短链服务";
  }
}

export function getShortUrlServiceOptions(settings: AppSettings): ShortUrlServiceOption[] {
  const configured: ShortUrlServiceOption[] = [];
  if (settings.shortUrlEndpoint.trim()) {
    configured.push({
      id: "configured-default",
      label: "默认短链 API",
      endpoint: settings.shortUrlEndpoint.trim(),
      token: settings.shortUrlToken,
    });
  }
  settings.shortUrlServices.forEach((service) => {
    if (!service.endpoint.trim()) return;
    configured.push({
      id: service.id,
      label: service.name.trim() || getShortUrlServiceName(service.endpoint),
      endpoint: service.endpoint.trim(),
      token: service.token,
    });
  });
  return [...configured, ...shortUrlServices];
}

export const remoteConfigGroups = [
  {
    label: "ACL4SSR 通用",
    options: [
      { label: "全分组 · 无自动测速", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini" },
      { label: "全分组 · 自动测速", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini" },
      { label: "在线默认版", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini" },
      { label: "在线默认版 · 无自动测速", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoAuto.ini" },
      { label: "去广告增强版", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_AdblockPlus.ini" },
      { label: "多国家分组", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_MultiCountry.ini" },
      { label: "无 Reject 规则", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoReject.ini" },
    ],
  },
  {
    label: "ACL4SSR 精简",
    options: [
      { label: "精简版", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Mini.ini" },
      { label: "精简版 · 无自动测速", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Mini_NoAuto.ini" },
      { label: "精简版 · 去广告", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Mini_AdblockPlus.ini" },
      { label: "精简版 · 多模式", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Mini_MultiMode.ini" },
    ],
  },
  {
    label: "特殊用途",
    options: [
      { label: "Basic", value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/special/basic.ini" },
      { label: "NeteaseUnblock", value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/special/netease.ini" },
      { label: "LHiE1", value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/lhie1_clash.ini" },
    ],
  },
];

export function normalizeOptions(value?: Partial<ConvertOptions> | null): ConvertOptions {
  return { ...defaultOptions, ...(value ?? {}) };
}

export function buildConvertUrl(provider: Provider, source: string, options: ConvertOptions) {
  const [target, embedded] = options.target.split("&");
  const params = new URLSearchParams({ target, url: source.trim(), insert: String(options.insert) });
  if (embedded) {
    const [key, value] = embedded.split("=");
    params.set(key, value);
  }

  setTextParam(params, "config", options.config);
  setTextParam(params, "filename", options.filename);
  setTextParam(params, "include", options.include);
  setTextParam(params, "exclude", options.exclude);
  setTextParam(params, "rename", options.rename);
  setTextParam(params, "dev_id", options.devId);
  setTextParam(params, "diyua", options.userAgent);
  if (options.interval.trim() && Number(options.interval) > 0) {
    params.set("interval", String(Math.round(Number(options.interval) * 86400)));
  }

  const booleans: [string, boolean][] = [
    ["emoji", options.emoji], ["list", options.list], ["xudp", options.xudp],
    ["udp", options.udp], ["tfo", options.tfo], ["expand", options.expand],
    ["scv", options.scv], ["fdn", options.fdn], ["sort", options.sort],
    ["append_type", options.appendType], ["tls13", options.tls13],
  ];
  booleans.forEach(([key, value]) => params.set(key, String(value)));
  if (target === "clash") {
    params.set("new_name", String(options.clashNewName));
    if (options.clashDoh) params.set("clash.doh", "true");
  }
  if (target === "surge" && options.surgeDoh) params.set("surge.doh", "true");
  if (target === "singbox" && options.singboxIpv6) params.set("singbox.ipv6", "1");
  return `${provider.endpoint.replace(/\/$/, "")}?${params.toString()}`;
}

export function parseConvertUrl(value: string): { endpoint: string; source: string; options: ConvertOptions } {
  const url = new URL(value.trim());
  const params = url.searchParams;
  if (!params.get("target") || !params.get("url")) throw new Error("URL 中缺少 target 或 url 参数");
  const target = params.get("target") === "surge"
    ? `surge&ver=${params.get("ver") || "4"}`
    : params.get("target") || "clash";
  const options = normalizeOptions({
    target,
    config: params.get("config") || "",
    filename: params.get("filename") || "",
    include: params.get("include") || "",
    exclude: params.get("exclude") || "",
    rename: params.get("rename") || "",
    devId: params.get("dev_id") || "",
    interval: params.get("interval") ? String(Math.ceil(Number(params.get("interval")) / 86400)) : "",
    userAgent: params.get("diyua") || "",
    emoji: readBoolean(params, "emoji", defaultOptions.emoji),
    udp: readBoolean(params, "udp", defaultOptions.udp),
    xudp: readBoolean(params, "xudp", defaultOptions.xudp),
    scv: readBoolean(params, "scv", defaultOptions.scv),
    tfo: readBoolean(params, "tfo", defaultOptions.tfo),
    sort: readBoolean(params, "sort", defaultOptions.sort),
    list: readBoolean(params, "list", defaultOptions.list),
    insert: readBoolean(params, "insert", defaultOptions.insert),
    appendType: readBoolean(params, "append_type", defaultOptions.appendType),
    tls13: readBoolean(params, "tls13", defaultOptions.tls13),
    expand: readBoolean(params, "expand", defaultOptions.expand),
    fdn: readBoolean(params, "fdn", defaultOptions.fdn),
    clashDoh: readBoolean(params, "clash.doh", defaultOptions.clashDoh),
    surgeDoh: readBoolean(params, "surge.doh", defaultOptions.surgeDoh),
    clashNewName: readBoolean(params, "new_name", defaultOptions.clashNewName),
    singboxIpv6: params.get("singbox.ipv6") === "1",
  });
  return { endpoint: `${url.origin}${url.pathname.replace(/\/$/, "")}`, source: params.get("url") || "", options };
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function setTextParam(params: URLSearchParams, key: string, value: string) {
  if (value.trim()) params.set(key, value.trim());
}

function readBoolean(params: URLSearchParams, key: string, fallback: boolean) {
  return params.has(key) ? params.get(key) === "true" || params.get(key) === "1" : fallback;
}
