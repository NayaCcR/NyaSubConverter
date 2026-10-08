"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useEffect, useRef, useState } from "react";
import { Check, Database, Download, Eye, EyeOff, ExternalLink, KeyRound, Link2, Plus, RotateCcw, Settings, Shield, Trash2, Upload, X } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { catalogUrl } from "@/lib/rule-catalog";
import { PageHeader, SectionTitle, buttonSecondary, iconButton, inputClass } from "@/components/ui/app-ui";
import {
  defaultProfiles,
  defaultProviders,
  defaultSettings,
  getShortUrlServiceName,
  linkConsoleRegisterUrl,
  normalizeOptions,
  normalizeSettings,
  type CustomShortUrlService,
  uid,
} from "@/lib/app-data";
import {
  DEFAULT_SETTINGS_SECTION,
  getSettingsSectionElementId,
  getSettingsSectionHref,
  normalizeSettingsSection,
  SETTINGS_SECTIONS,
  type SettingsSection,
} from "@/lib/settings-sections";
import { cn } from "@/lib/utils";

type ShortServiceDraft = Omit<CustomShortUrlService, "id">;

function SettingsSectionNav({
  active,
  onSelect,
}: {
  active: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {SETTINGS_SECTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          aria-current={active === item.id ? "true" : undefined}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            active === item.id
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default function SettingsPage() {
  const { providers, profiles, history, settings, setProviders, setProfiles, setHistory, setSettings } = useAppData();
  const router = useRouter();
  // ?section= 只在客户端读取，避免 SSR 阶段拿不到参数而把整页渲染成空。
  const [section, setSection] = useState<SettingsSection>(DEFAULT_SETTINGS_SECTION);
  const sectionMounted = useRef(false);
  const [saved, setSaved] = useState(false);
  const [defaultTokenOpen, setDefaultTokenOpen] = useState(Boolean(settings.shortUrlToken));
  const [newService, setNewService] = useState<ShortServiceDraft | null>(null);

  // 首次挂载读一次地址栏，之后监听前进后退。
  useEffect(() => {
    const readSection = () =>
      normalizeSettingsSection(new URLSearchParams(window.location.search).get("section"));
    const onPopState = () => setSection(readSection());

    setSection(readSection());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // 直接带 ?section= 打开、切换段或前进后退时，滚到对应区块。
  useEffect(() => {
    if (!sectionMounted.current) {
      sectionMounted.current = true;
      if (!new URLSearchParams(window.location.search).get("section")) return;
    }
    document
      .getElementById(getSettingsSectionElementId(section))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [section]);

  function selectSection(next: SettingsSection) {
    setSection(next);
    router.replace(getSettingsSectionHref(next), { scroll: false });
  }
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings.shortUrlToken) setDefaultTokenOpen(true);
  }, [settings.shortUrlToken]);

  function change<K extends keyof typeof settings>(key: K, value: typeof settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  function updateShortService(service: CustomShortUrlService) {
    change("shortUrlServices", settings.shortUrlServices.map((item) => item.id === service.id ? service : item));
  }

  function addShortService() {
    if (!newService) setNewService({ name: "", endpoint: "", token: "" });
  }

  function saveNewShortService() {
    if (!newService?.endpoint.trim() || !/^https?:\/\//i.test(newService.endpoint.trim())) return;
    const endpoint = newService.endpoint.trim();
    change("shortUrlServices", [...settings.shortUrlServices, {
      id: uid("short-service"),
      name: newService.name.trim() || getShortUrlServiceName(endpoint),
      endpoint,
      token: newService.token.trim(),
    }]);
    setNewService(null);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), providers, profiles, history, settings }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nyasubconverter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importData(file?: File) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.providers)) setProviders(data.providers);
      if (Array.isArray(data.profiles)) setProfiles(data.profiles.map((profile: typeof defaultProfiles[number]) => ({ ...profile, ...normalizeOptions(profile) })));
      if (Array.isArray(data.history)) setHistory(data.history);
      if (data.settings) setSettings(normalizeSettings(data.settings));
      alert("数据导入完成");
    } catch {
      alert("无法读取此备份文件");
    }
  }

  function resetData() {
    if (!window.confirm("这会清除所有自定义数据并恢复初始状态，确定继续吗？")) return;
    setProviders(defaultProviders);
    setProfiles(defaultProfiles);
    setHistory([]);
    setSettings(defaultSettings);
    setDefaultTokenOpen(false);
    setNewService(null);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-7 sm:px-6 lg:py-9">
      <PageHeader title="设置" description="管理公共服务列表、本地隐私偏好和数据备份。更改会自动保存在当前浏览器。" action={saved ? <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4" />已保存</span> : undefined} />

      <SettingsSectionNav active={section} onSelect={selectSection} />

      <Card id={getSettingsSectionElementId("providers")} className="shadow-none scroll-mt-24 space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
        <SectionTitle icon={Settings} title="公共服务列表" description="填写返回 Provider 数组的 JSON 地址，可在转换后端页面手动更新" />
        <label className="block space-y-2 text-sm font-medium">
          <span>远程列表 URL</span>
          <Input value={settings.publicListUrl} onChange={(e) => change("publicListUrl", e.target.value)} placeholder="https://example.com/providers.json" className={inputClass} />
          <span className="block text-[11px] font-normal leading-5 text-muted-foreground">支持数组或 <code className="rounded bg-muted px-1">{"{ providers: [...] }"}</code>，远程项至少包含 name 与 endpoint。</span>
        </label>
      </Card>

      <div id={getSettingsSectionElementId("rules")} className="scroll-mt-24">
        <RuleCatalogSettings value={settings.ruleCatalogUrl} onSave={(value) => change("ruleCatalogUrl", value)} />
      </div>

      <Card id={getSettingsSectionElementId("services")} className="shadow-none scroll-mt-24 space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
        <SectionTitle icon={Link2} title="扩展服务" description="短链和配置托管不是 SubConverter 标准接口，按需接入你信任的服务" />

        <div className="space-y-5">
          <div className="space-y-3 rounded-md border border-border p-4">
            <div>
              <label className="block space-y-2 text-sm font-medium">
                <span>默认短链 API URL</span>
                <Input value={settings.shortUrlEndpoint} onChange={(event) => change("shortUrlEndpoint", event.target.value)} placeholder="https://example.com/short-urls" className={inputClass} />
              </label>
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">不填写 Token 时按兼容 sub-web-api 的表单方式请求；填写 Token 后按 Shlink / shlink-client-deck API 发送 JSON 请求。</p>
            </div>

            <div className="rounded-md border border-primary/25 bg-primary/5 p-3 text-xs leading-5">
              <p className="font-medium text-foreground">link.31n.cc</p>
              <p className="mt-1 text-muted-foreground">可以记录点击数据和使用记录的短链服务，快试试。</p>
              <a
                href={linkConsoleRegisterUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block underline underline-offset-2 hover:text-foreground"
              >
                去注册获取 Token
              </a>
            </div>
            <OptionalTokenField
              enabled={defaultTokenOpen}
              value={settings.shortUrlToken}
              onChange={(value) => change("shortUrlToken", value)}
              onToggle={setDefaultTokenOpen}
            />
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">更多短链服务</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">新增服务会按添加顺序出现在订阅转换页短链 API 下拉框的顶端。</p>
              </div>
              <Button variant="outline" type="button" onClick={addShortService} disabled={Boolean(newService)} className={buttonSecondary}><Plus className="h-4 w-4" />添加短链服务</Button>
            </div>

            {settings.shortUrlServices.map((service) => (
              <ShortServiceEditor key={service.id} service={service} onChange={updateShortService} onRemove={() => change("shortUrlServices", settings.shortUrlServices.filter((item) => item.id !== service.id))} />
            ))}

            {newService && (
              <div className="space-y-4 rounded-md border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-medium">添加短链服务</h4>
                  <Button variant="ghost" size="icon" type="button" onClick={() => setNewService(null)} className={iconButton} title="取消添加"><X className="h-4 w-4" /></Button>
                </div>
                <ShortServiceFields value={newService} onChange={setNewService} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setNewService(null)} className={buttonSecondary}>取消</Button>
                  <Button variant="outline" type="button" onClick={saveNewShortService} disabled={!newService.endpoint.trim() || !/^https?:\/\//i.test(newService.endpoint.trim())} className={buttonSecondary}><Check className="h-4 w-4" />保存服务</Button>
                </div>
              </div>
            )}

            {!settings.shortUrlServices.length && !newService && <p className="rounded-md border border-dashed border-border px-4 py-5 text-center text-xs text-muted-foreground">还没有额外短链服务</p>}
          </div>

          <div className="grid gap-4 border-t border-border pt-5">
            <ServiceField label="远程配置托管 API" value={settings.configUploadEndpoint} placeholder="https://example.com/sub.php" hint="接收 config 表单字段，返回 { code: 0, data: URL }。" onChange={(value) => change("configUploadEndpoint", value)} />
            <ServiceField label="脚本处理 API（预留）" value={settings.scriptApiEndpoint} placeholder="https://example.com/api.php" hint="参考项目的 JS 排序/筛选功能目前已暂停，此处只保留自建服务地址。" onChange={(value) => change("scriptApiEndpoint", value)} />
          </div>
        </div>

        <div className="rounded-md border border-amber-500/25 bg-amber-500/8 p-3 text-xs leading-5 text-muted-foreground">短链服务会收到完整转换链接，配置托管服务会收到配置正文。Token 仅保存在当前浏览器的本地数据中，导出备份时也会包含 Token，请妥善保管。</div>
      </Card>

      <Card id={getSettingsSectionElementId("privacy")} className="shadow-none scroll-mt-24 space-y-2 rounded-lg border border-border bg-card p-5 sm:p-6">
        <SectionTitle icon={Shield} title="隐私与转换" description="这些设置只影响当前浏览器" />
        <SettingToggle title="保存订阅来源" description="在历史记录中保留原始订阅地址，关闭后仅保存链接数量" checked={settings.rememberSource} onChange={(value) => change("rememberSource", value)} />
        <SettingToggle title="界面隐藏敏感链接" description="使用掩码显示生成链接与历史来源，复制和打开仍使用完整地址" checked={settings.maskSource} onChange={(value) => change("maskSource", value)} />
        <SettingToggle title="转换前检查后端" description="保留用于需要严格可用性检查的部署策略" checked={settings.checkBeforeConvert} onChange={(value) => change("checkBeforeConvert", value)} />
      </Card>

      <Card id={getSettingsSectionElementId("data")} className="shadow-none scroll-mt-24 space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
        <SectionTitle icon={Database} title="本地数据" description={`${providers.length} 个后端 · ${profiles.length} 个 Profile · ${history.length} 条历史`} />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={exportData} className={buttonSecondary}><Download className="h-4 w-4" />导出备份</Button>
          <Button variant="outline" type="button" onClick={() => inputRef.current?.click()} className={buttonSecondary}><Upload className="h-4 w-4" />导入备份</Button>
          <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(e) => importData(e.target.files?.[0])} />
          <Button variant="outline" type="button" onClick={resetData} className={buttonSecondary}><RotateCcw className="h-4 w-4" />恢复默认</Button>
        </div>
      </Card>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-sm font-semibold">NyaSubConverter</h2><p className="mt-1 text-xs text-muted-foreground">独立的开源订阅转换 Web Client</p></div>
        <a href="https://github.com/tindy2013/subconverter" target="_blank" rel="noreferrer" className={buttonSecondary}><ExternalLink className="h-4 w-4" />SubConverter 项目</a>
      </section>
    </div>
  );
}

function RuleCatalogSettings({ value, onSave }: { value: string; onSave: (url: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  useEffect(() => setDraft(value), [value]);
  function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      const trimmed = draft.trim() || defaultSettings.ruleCatalogUrl;
      const resolved = catalogUrl(trimmed, window.location.href);
      onSave(trimmed === defaultSettings.ruleCatalogUrl ? trimmed : resolved);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "规则目录地址无效"); }
  }
  return (
    <Card id="rule-catalog" className="shadow-none space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
      <SectionTitle icon={Download} title="在线规则目录" description="使用内置规则库，或填写 NyaSub 公开部署的目录地址。保存后自动拉取，更新失败时继续保留缓存。" />
      <form onSubmit={save} className="space-y-3">
        <label className="block space-y-2 text-sm font-medium"><span>规则目录 URL</span><Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="https://nyasub.example.com/rules/catalog.json" className={inputClass} /></label>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-2"><Button type="submit" variant="outline" className={buttonSecondary}>保存规则目录</Button><Button type="button" variant="outline" onClick={() => { setDraft(defaultSettings.ruleCatalogUrl); onSave(defaultSettings.ruleCatalogUrl); setError(""); }} className={buttonSecondary}>恢复内置目录</Button><Link href="/rules" className={buttonSecondary}>浏览规则库</Link></div>
      </form>
      <p className="text-[11px] leading-5 text-muted-foreground">默认 /rules/catalog.json 随源码部署。跨站点目录需允许 CORS；配置文件由转换后端拉取，请使用后端能够访问的域名。只支持 HTTP(S) 公共目录，不发送浏览器凭证。</p>
    </Card>
  );
}

function ShortServiceEditor({ service, onChange, onRemove }: { service: CustomShortUrlService; onChange: (service: CustomShortUrlService) => void; onRemove: () => void }) {
  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-medium">{service.name || getShortUrlServiceName(service.endpoint) || "短链服务"}</h4>
        <Button variant="ghost" size="icon" type="button" onClick={onRemove} className={iconButton} title="删除短链服务"><Trash2 className="h-4 w-4" /></Button>
      </div>
      <ShortServiceFields value={service} onChange={(value) => onChange({ ...service, ...value })} />
    </div>
  );
}

function ShortServiceFields({ value, onChange }: { value: ShortServiceDraft; onChange: (value: ShortServiceDraft) => void }) {
  const [tokenOpen, setTokenOpen] = useState(Boolean(value.token));

  useEffect(() => {
    if (value.token) setTokenOpen(true);
  }, [value.token]);

  return (
    <div className="space-y-4">
      <label className="block space-y-2 text-sm font-medium">
        <span>名称</span>
        <Input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} placeholder="例如 Link Console" className={inputClass} />
      </label>
      <div>
        <label className="block space-y-2 text-sm font-medium">
          <span>API URL</span>
          <Input value={value.endpoint} onChange={(event) => onChange({ ...value, endpoint: event.target.value })} placeholder="https://example.com/api/hosted/shlink/server-id/short-urls" className={inputClass} />
        </label>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">配置 Token 后将使用 Bearer Token 和 JSON 的 longUrl/customSlug 字段。</p>
      </div>
      <OptionalTokenField
        enabled={tokenOpen}
        value={value.token}
        onChange={(token) => onChange({ ...value, token })}
        onToggle={setTokenOpen}
      />
    </div>
  );
}

function OptionalTokenField({ enabled, value, onChange, onToggle }: { enabled: boolean; value: string; onChange: (value: string) => void; onToggle: (enabled: boolean) => void }) {
  const [visible, setVisible] = useState(false);

  if (!enabled) {
    return <Button variant="outline" type="button" onClick={() => onToggle(true)} className={buttonSecondary}><KeyRound className="h-4 w-4" />添加 Token（可选）</Button>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="inline-flex items-center gap-1.5 text-sm font-medium"><KeyRound className="h-4 w-4 text-muted-foreground" />Token（可选）</label>
        <button type="button" onClick={() => { onChange(""); onToggle(false); setVisible(false); }} className="text-xs text-muted-foreground hover:text-destructive">移除 Token</button>
      </div>
      <div className="flex gap-2">
        <Input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder="粘贴 API Token" autoComplete="new-password" className={inputClass} />
        <Button variant="ghost" size="icon" type="button" onClick={() => setVisible((current) => !current)} className={iconButton} title={visible ? "隐藏 Token" : "显示 Token"} aria-label={visible ? "隐藏 Token" : "显示 Token"}>{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
      </div>
      <p className="text-[11px] font-normal leading-5 text-muted-foreground">默认隐藏 Token；点击右侧按钮可临时显示。请求时会发送为 Authorization: Bearer Token。</p>
    </div>
  );
}

function SettingToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 border-t border-border py-4 first:border-0"><span><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span><button type="button" role="switch" aria-label={title} aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}><span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} /></button></div>;
}

function ServiceField({ label, value, placeholder, hint, onChange }: { label: string; value: string; placeholder: string; hint: string; onChange: (value: string) => void }) {
  return <label className="space-y-2 text-sm font-medium"><span>{label}</span><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClass} /><span className="block text-[11px] font-normal leading-5 text-muted-foreground">{hint}</span></label>;
}
