"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Clipboard,
  ExternalLink,
  FileInput,
  Link2,
  LoaderCircle,
  RotateCcw,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { OptionFields } from "@/components/conversion/option-fields";
import { useAppData } from "@/components/providers/app-data-provider";
import { PageHeader, PrivacyBadge, SectionTitle, buttonPrimary, buttonSecondary, iconButton, inputClass } from "@/components/ui/app-ui";
import {
  buildConvertUrl,
  defaultOptions,
  normalizeOptions,
  parseConvertUrl,
  shortUrlServices,
  targets,
  type ConvertOptions,
  type Provider,
  uid,
} from "@/lib/app-data";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { providers, profiles, settings, setHistory, setProviders } = useAppData();
  const enabledProviders = providers.filter((item) => item.enabled);
  const defaultProvider = enabledProviders.find((item) => item.isDefault) ?? enabledProviders[0];
  const [source, setSource] = useState("");
  const [providerId, setProviderId] = useState(defaultProvider?.id ?? "");
  const [options, setOptions] = useState<ConvertOptions>(defaultOptions);
  const [advanced, setAdvanced] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortEndpoint, setShortEndpoint] = useState(settings.shortUrlEndpoint);
  const [shortSlug, setShortSlug] = useState("");
  const [shortening, setShortening] = useState(false);
  const [copied, setCopied] = useState<"long" | "short" | "">("");
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const provider = enabledProviders.find((item) => item.id === providerId) ?? defaultProvider;
  const sources = splitSources(source);
  const canGenerate = Boolean(provider && sources.length);
  const popularTargets = targets.filter((item) => item.popular);
  const otherTargets = targets.filter((item) => !item.popular);
  const isOtherTarget = otherTargets.some((item) => item.value === options.target);

  async function generate() {
    if (!provider || !sources.length) return;
    setError("");
    if (settings.checkBeforeConvert) {
      setConverting(true);
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 6000);
      try {
        await fetch(provider.endpoint.replace(/\/sub\/?$/i, "/version"), { mode: "no-cors", cache: "no-store", signal: controller.signal });
      } catch {
        setError("后端连通性检查失败，请更换后端或关闭转换前检查。");
        setConverting(false);
        window.clearTimeout(timer);
        return;
      }
      window.clearTimeout(timer);
      setConverting(false);
    }
    const joinedSource = sources.join("|");
    const url = buildConvertUrl(provider, joinedSource, options);
    setResultUrl(url);
    setShortUrl("");
    setHistory((items) => [{
      id: uid("history"), createdAt: new Date().toISOString(), providerId: provider.id,
      providerName: provider.name, target: options.target, sourceCount: sources.length,
      source: settings.rememberSource ? joinedSource : "", resultUrl: url,
    }, ...items].slice(0, 100));
  }

  async function copy(value: string, type: "long" | "short") {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(""), 1600);
  }

  async function createShortUrl() {
    if (!shortEndpoint.trim() || !resultUrl) return;
    setShortening(true);
    setError("");
    try {
      const body = new FormData();
      body.append("longUrl", btoa(resultUrl));
      if (shortSlug.trim() && !shortSlug.includes("http")) body.append("shortKey", shortSlug.trim());
      const response = await fetch(shortEndpoint.trim(), { method: "POST", body });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const value = data.ShortUrl || data.shortUrl || data.url;
      if ((data.Code !== undefined && data.Code !== 1) || !value) throw new Error(data.Message || "响应中没有短链接");
      setShortUrl(String(value));
    } catch (cause) {
      setError(`短链接生成失败：${cause instanceof Error ? cause.message : "请检查 API 与跨域设置"}`);
    } finally { setShortening(false); }
  }

  function applyImported(value: { endpoint: string; source: string; options: ConvertOptions }) {
    let matched = providers.find((item) => normalizeEndpoint(item.endpoint) === normalizeEndpoint(value.endpoint));
    if (!matched) {
      matched = {
        id: uid("imported-provider"), name: new URL(value.endpoint).host, type: "custom",
        endpoint: value.endpoint, enabled: true, status: "unknown", privacy_level: "high",
      } satisfies Provider;
      setProviders((items) => [...items, matched as Provider]);
    }
    setProviderId(matched.id);
    setSource(value.source.split("|").join("\n"));
    setOptions(value.options);
    setAdvanced(true);
    setResultUrl("");
    setShortUrl("");
  }

  const selectedTarget = useMemo(() => targets.find((item) => item.value === options.target)?.label ?? options.target, [options.target]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:py-9">
      <PageHeader
        title="订阅转换"
        description="支持 SubConverter 完整参数、远程配置与多订阅合并。数据直接发送到所选后端，不经过 NyaSub 中转。"
        action={<button type="button" onClick={() => setImportOpen(true)} className={buttonSecondary}><FileInput className="h-4 w-4" />从 URL 解析</button>}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <SectionTitle icon={Link2} title="订阅来源" description="支持订阅链接、单节点链接；每行一个或使用 | 分隔" action={<span className="text-xs text-muted-foreground">{sources.length} 个来源</span>} />
            <div className="relative">
              <textarea value={source} onChange={(event) => { setSource(event.target.value); setResultUrl(""); }} rows={5} spellCheck={false} placeholder={"https://example.com/subscribe?token=...\nvmess://..."} className="focus-ring w-full resize-y rounded-md border border-input bg-background px-3 py-3 font-mono text-sm leading-6 placeholder:font-sans placeholder:text-muted-foreground/55" />
              {source && <button type="button" onClick={() => { setSource(""); setResultUrl(""); }} className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"><RotateCcw className="h-3.5 w-3.5" />清空</button>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">目标客户端</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {popularTargets.map((target) => (
                  <button key={target.value} type="button" onClick={() => { setOptions((value) => ({ ...value, target: target.value })); setResultUrl(""); }} className={cn("focus-ring h-10 rounded-md border px-2 text-sm font-medium transition-colors", target.value === options.target ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")}>{target.label}</button>
                ))}
              </div>
              <select value={isOtherTarget ? options.target : ""} onChange={(event) => event.target.value && setOptions((value) => ({ ...value, target: event.target.value }))} className={inputClass}>
                <option value="">更多输出格式</option>
                {otherTargets.map((target) => <option key={target.value} value={target.value}>{target.label}</option>)}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium"><span>转换后端</span><div className="relative"><Server className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><select value={provider?.id ?? ""} onChange={(event) => { setProviderId(event.target.value); setResultUrl(""); }} className={cn(inputClass, "appearance-none pl-9 pr-9")}>{enabledProviders.length ? enabledProviders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>) : <option value="">暂无可用后端</option>}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" /></div></label>
              <label className="space-y-2 text-sm font-medium"><span>应用 Profile</span><div className="relative"><select defaultValue="" onChange={(event) => { const profile = profiles.find((item) => item.id === event.target.value); if (profile) setOptions(normalizeOptions(profile)); }} className={cn(inputClass, "appearance-none pr-9")}><option value="">不使用 Profile</option>{profiles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" /></div></label>
            </div>

            {provider && provider.privacy_level !== "low" && <PrivacyNotice provider={provider} />}

            <div className="border-t border-border pt-4">
              <button type="button" onClick={() => setAdvanced((value) => !value)} className="flex w-full items-center justify-between text-sm font-medium"><span className="inline-flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" />高级转换选项</span><ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", advanced && "rotate-180")} /></button>
              {advanced && <><OptionFields options={options} onChange={(value) => { setOptions(value); setResultUrl(""); }} /><div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4"><p className="text-xs leading-5 text-muted-foreground">可将自定义 INI 配置托管后直接填入远程配置。</p><button type="button" onClick={() => setUploadOpen(true)} className={buttonSecondary}><UploadCloud className="h-4 w-4" />上传配置</button></div></>}
            </div>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button type="button" onClick={generate} disabled={!canGenerate || converting} className={cn(buttonPrimary, "w-full sm:h-11")}><Sparkles className={cn("h-4 w-4", converting && "animate-spin")} />{converting ? "正在检查后端" : "生成订阅链接"}<ArrowRight className="h-4 w-4" /></button>
          </section>

          {resultUrl && (
            <section className="animate-fade-in space-y-5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6">
              <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-5 w-5" /></span><div><h2 className="font-semibold">订阅链接已生成</h2><p className="mt-1 text-xs text-muted-foreground">{selectedTarget} · {provider?.name} · {sources.length} 个来源</p></div></div>
              <ResultRow label="定制订阅" value={resultUrl} masked={settings.maskSource ? maskUrl(resultUrl) : resultUrl} copied={copied === "long"} onCopy={() => copy(resultUrl, "long")} />
              <div className="flex flex-wrap gap-2"><a href={resultUrl} target="_blank" rel="noreferrer" className={buttonPrimary}><ExternalLink className="h-4 w-4" />打开配置</a></div>

              <div className="space-y-3 border-t border-emerald-500/20 pt-5">
                <div><h3 className="text-sm font-semibold">生成短链接</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">短链服务会收到包含订阅凭证的完整转换 URL，仅使用你信任的服务。</p></div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                  <ShortEndpointField value={shortEndpoint} onChange={setShortEndpoint} />
                  <input value={shortSlug} onChange={(event) => setShortSlug(event.target.value)} placeholder="自定义后缀（可选）" className={inputClass} />
                  <button type="button" onClick={createShortUrl} disabled={!shortEndpoint.trim() || shortening} className={buttonSecondary}>{shortening ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}生成短链</button>
                </div>
                {shortUrl && <ResultRow label="订阅短链" value={shortUrl} masked={shortUrl} copied={copied === "short"} onCopy={() => copy(shortUrl, "short")} />}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="rounded-lg border border-border bg-card p-5"><SectionTitle icon={ShieldCheck} title="数据路径" description="NyaSub 只在浏览器中组装请求" /><div className="mt-5 space-y-4 text-xs">{["订阅信息保留在当前浏览器", "直接请求所选 Provider", "短链与托管服务独立配置"].map((label, index) => <div key={label} className="flex gap-3"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground">{index + 1}</span><span className="leading-5 text-muted-foreground">{label}</span></div>)}</div></section>
          <section className="rounded-lg border border-border bg-card p-5"><p className="text-xs font-medium text-muted-foreground">当前后端</p>{provider ? <div className="mt-3"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold">{provider.name}</p><span className={cn("h-2 w-2 rounded-full", provider.status === "online" ? "bg-emerald-500" : provider.status === "offline" ? "bg-destructive" : "bg-muted-foreground/40")} /></div><p className="mt-2 break-all font-mono text-[11px] leading-5 text-muted-foreground">{provider.endpoint}</p></div> : <p className="mt-3 text-sm text-muted-foreground">请先添加并启用转换后端</p>}</section>
        </aside>
      </div>

      {importOpen && <ImportUrlDialog onClose={() => setImportOpen(false)} onImport={(value) => { applyImported(value); setImportOpen(false); }} />}
      {uploadOpen && <UploadConfigDialog endpoint={settings.configUploadEndpoint} onClose={() => setUploadOpen(false)} onUploaded={(url) => { setOptions((value) => ({ ...value, config: url })); setUploadOpen(false); }} />}
    </div>
  );
}

function PrivacyNotice({ provider }: { provider: Provider }) {
  return <div className="flex gap-3 rounded-md border border-amber-500/25 bg-amber-500/8 p-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" /><div className="min-w-0 flex-1"><p className="font-medium">当前后端可能接触你的订阅地址</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{provider.type === "public" ? "公共服务由第三方运营，请仅在信任其运营方时继续。" : "该服务不由你直接控制，请确认其隐私政策。"}</p></div><PrivacyBadge level={provider.privacy_level} /></div>;
}

function ResultRow({ label, value, masked, copied, onCopy }: { label: string; value: string; masked: string; copied: boolean; onCopy: () => void }) {
  return <div className="space-y-2"><p className="text-xs font-medium text-muted-foreground">{label}</p><div className="flex items-stretch gap-2"><div title={value} className="min-w-0 flex-1 break-all rounded-md border border-border bg-background p-3 font-mono text-xs leading-5 text-muted-foreground">{masked}</div><button type="button" title="复制" onClick={onCopy} className={cn(iconButton, "h-auto")} >{copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Clipboard className="h-4 w-4" />}</button></div></div>;
}

function ShortEndpointField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const known = shortUrlServices.some((item) => item.value === value);
  const selection = !value ? "" : known ? value : "__custom__";
  return <div className="grid gap-2"><select value={selection} onChange={(event) => onChange(event.target.value === "__custom__" ? "https://" : event.target.value)} className={inputClass}><option value="">选择短链 API</option>{shortUrlServices.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}<option value="__custom__">自定义 API</option></select>{selection === "__custom__" && <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://example.com/short" className={inputClass} />}</div>;
}

function ImportUrlDialog({ onClose, onImport }: { onClose: () => void; onImport: (value: ReturnType<typeof parseConvertUrl>) => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      let resolved = value.trim();
      if (!new URL(resolved).searchParams.has("target")) {
        const response = await fetch(resolved, { method: "GET", redirect: "follow" });
        resolved = response.url;
      }
      onImport(parseConvertUrl(resolved));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "无法解析此 URL"); }
    finally { setLoading(false); }
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form onSubmit={submit} className="w-full max-w-xl animate-scale-in rounded-lg border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">从 URL 解析</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">支持 NyaSub/SubConverter 长链接；短链接服务必须允许跨域并返回最终跳转地址。</p></div><button type="button" onClick={onClose} className={iconButton}><X className="h-4 w-4" /></button></div><textarea autoFocus value={value} onChange={(event) => setValue(event.target.value)} rows={6} placeholder="https://sub.example.com/sub?target=clash&url=..." className="focus-ring mt-5 w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-5" />{error && <p className="mt-3 text-sm text-destructive">{error}</p>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className={buttonSecondary}>取消</button><button type="submit" disabled={!value.trim() || loading} className={buttonPrimary}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}解析并填入</button></div></form></div>;
}

function UploadConfigDialog({ endpoint, onClose, onUploaded }: { endpoint: string; onClose: () => void; onUploaded: (url: string) => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!endpoint) { setError("请先在设置中配置远程配置托管 API。"); return; }
    setLoading(true); setError("");
    try {
      const body = new FormData(); body.append("config", encodeURIComponent(content));
      const response = await fetch(endpoint, { method: "POST", body });
      const data = await response.json();
      if (!response.ok || (data.code !== undefined && data.code !== 0) || !data.data) throw new Error(data.msg || `HTTP ${response.status}`);
      onUploaded(String(data.data));
    } catch (cause) { setError(`上传失败：${cause instanceof Error ? cause.message : "请检查 API 与跨域设置"}`); }
    finally { setLoading(false); }
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-2xl animate-scale-in rounded-lg border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">上传远程配置</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">配置内容会发送到设置中指定的托管 API。请勿上传包含私密凭证的内容。</p></div><button type="button" onClick={onClose} className={iconButton}><X className="h-4 w-4" /></button></div><textarea autoFocus value={content} onChange={(event) => setContent(event.target.value)} rows={14} maxLength={50000} placeholder="粘贴 SubConverter INI 配置内容" className="focus-ring mt-5 w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-5" /><div className="mt-2 text-right text-[11px] text-muted-foreground">{content.length} / 50000</div>{!endpoint && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">尚未配置托管 API，保存地址后才能上传。</p>}{error && <p className="mt-3 text-sm text-destructive">{error}</p>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className={buttonSecondary}>取消</button><button type="submit" disabled={!content.trim() || loading} className={buttonPrimary}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}上传并应用</button></div></form></div>;
}

function splitSources(value: string) { return value.split(/\r?\n|\|/).map((item) => item.trim()).filter(Boolean); }
function normalizeEndpoint(value: string) { return value.replace(/\/$/, "").toLowerCase(); }
function maskUrl(value: string) { try { const url = new URL(value); if (url.searchParams.has("url")) url.searchParams.set("url", "••••••••"); return url.toString(); } catch { return value; } }
