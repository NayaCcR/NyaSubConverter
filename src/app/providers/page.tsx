"use client";

import { useState } from "react";
import { AlertTriangle, Check, CloudDownload, Download, Pencil, Plus, RefreshCw, ServerCog, Star, Trash2, X } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { PageHeader, PrivacyBadge, StatusDot, buttonPrimary, buttonSecondary, iconButton, inputClass } from "@/components/ui/app-ui";
import { type PrivacyLevel, type Provider, type ProviderType, uid } from "@/lib/app-data";
import { cn } from "@/lib/utils";

const typeLabels: Record<ProviderType, string> = { self_hosted: "自建服务", third_party: "第三方服务", public: "公共服务", custom: "自定义" };
const isDevelopment = process.env.NODE_ENV === "development";

export default function ProvidersPage() {
  const { providers, setProviders, settings } = useAppData();
  const [editing, setEditing] = useState<Provider | null | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");

  async function testConnection(provider: Provider) {
    setProviders((items) => items.map((item) => item.id === provider.id ? { ...item, status: "checking", latency: undefined } : item));
    const started = performance.now();
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 6000);
    try {
      const versionUrl = provider.endpoint.replace(/\/sub\/?$/i, "/version");
      await fetch(versionUrl, { method: "GET", mode: "no-cors", signal: controller.signal, cache: "no-store" });
      const latency = Math.round(performance.now() - started);
      setProviders((items) => items.map((item) => item.id === provider.id ? { ...item, status: "online", latency, updatedAt: new Date().toISOString() } : item));
    } catch {
      setProviders((items) => items.map((item) => item.id === provider.id ? { ...item, status: "offline", latency: undefined, updatedAt: new Date().toISOString() } : item));
    } finally { window.clearTimeout(timer); }
  }

  async function refreshPublicList() {
    if (!settings.publicListUrl) { setNotice("请先在设置中填写公共服务列表地址"); return; }
    setRefreshing(true); setNotice("");
    try {
      const response = await fetch(settings.publicListUrl, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const body = await response.json();
      const list = Array.isArray(body) ? body : body.providers;
      if (!Array.isArray(list)) throw new Error();
      const remote = list.filter((item) => item.name && item.endpoint).map((item) => ({
        id: String(item.id || `remote-${btoa(item.endpoint).replace(/=/g, "")}`),
        name: String(item.name), type: "public" as const, endpoint: String(item.endpoint),
        enabled: item.enabled !== false, status: "unknown" as const,
        privacy_level: (["low", "medium", "high"].includes(item.privacy_level) ? item.privacy_level : "high") as PrivacyLevel,
        updatedAt: new Date().toISOString(),
      }));
      setProviders((items) => [...items.filter((item) => item.type !== "public" || !item.id.startsWith("remote-")), ...remote]);
      setNotice(`已更新 ${remote.length} 个公共服务`);
    } catch { setNotice("更新失败，请检查列表地址、格式或跨域设置"); }
    finally { setRefreshing(false); }
  }

  function exportPublicList() {
    const publishedProviders = providers
      .filter((provider) => provider.enabled)
      .map(({ id, name, endpoint, privacy_level }) => ({ id, name, type: "public", endpoint, enabled: true, privacy_level }));
    const blob = new Blob([JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), providers: publishedProviders }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nya-subconverter-providers.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`已导出 ${publishedProviders.length} 个启用后端`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:py-9">
      <PageHeader title="转换后端" description="集中管理所有 SubConverter 兼容服务。默认后端会优先出现在转换页。" action={<button type="button" onClick={() => setEditing(null)} className={buttonPrimary}><Plus className="h-4 w-4" />添加后端</button>} />

      <div className="flex flex-col gap-3 rounded-lg border border-amber-500/25 bg-amber-500/8 p-4 sm:flex-row sm:items-center">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1"><p className="text-sm font-medium">公共服务隐私提示</p><p className="mt-1 text-xs leading-5 text-muted-foreground">转换请求包含原始订阅地址及其中的访问凭证。公共服务运营方可能读取、记录或转发这些信息，敏感订阅建议使用自建服务。</p></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><ServerCog className="h-4 w-4" /><span>{providers.length} 个后端</span><span>·</span><span>{providers.filter((item) => item.enabled).length} 个已启用</span></div>
        <div className="flex flex-wrap items-center justify-end gap-2"><span className="text-xs text-muted-foreground">{notice}</span>{isDevelopment && <button type="button" onClick={exportPublicList} className={buttonSecondary}><Download className="h-4 w-4" />导出公共列表</button>}<button type="button" onClick={refreshPublicList} disabled={refreshing} className={buttonSecondary}><CloudDownload className={cn("h-4 w-4", refreshing && "animate-spin")} />更新公共列表</button></div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hidden grid-cols-[minmax(180px,1fr)_150px_120px_110px_160px] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[11px] font-medium uppercase text-muted-foreground md:grid"><span>名称 / Endpoint</span><span>类型</span><span>状态</span><span>隐私</span><span className="text-right">操作</span></div>
        <div className="divide-y divide-border">
          {providers.map((provider) => (
            <div key={provider.id} className={cn("grid gap-4 px-4 py-4 md:grid-cols-[minmax(180px,1fr)_150px_120px_110px_160px] md:items-center md:px-5", !provider.enabled && "opacity-55")}>
              <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{provider.name}</p>{provider.isDefault && <span title="默认后端" className="text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /></span>}</div><p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{provider.endpoint}</p></div>
              <div><span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">{typeLabels[provider.type]}</span></div>
              <div><StatusDot status={provider.status} />{provider.latency && <span className="ml-2 text-[11px] text-muted-foreground">{provider.latency}ms</span>}</div>
              <div><PrivacyBadge level={provider.privacy_level} /></div>
              <div className="flex items-center justify-end gap-1">
                <button type="button" title="测试连接" onClick={() => testConnection(provider)} disabled={provider.status === "checking"} className={iconButton}><RefreshCw className={cn("h-4 w-4", provider.status === "checking" && "animate-spin")} /></button>
                {!provider.isDefault && <button type="button" title="设为默认" onClick={() => setProviders((items) => items.map((item) => ({ ...item, isDefault: item.id === provider.id })))} className={iconButton}><Star className="h-4 w-4" /></button>}
                <button type="button" title="编辑" onClick={() => setEditing(provider)} className={iconButton}><Pencil className="h-4 w-4" /></button>
                <button type="button" title="删除" onClick={() => { if (window.confirm(`确定删除“${provider.name}”吗？`)) setProviders((items) => items.filter((item) => item.id !== provider.id)); }} className={cn(iconButton, "hover:text-destructive")}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editing !== undefined && <ProviderDialog provider={editing} onClose={() => setEditing(undefined)} onSave={(value) => { setProviders((items) => editing ? items.map((item) => item.id === editing.id ? value : item) : [...items, value]); setEditing(undefined); }} />}
    </div>
  );
}

function ProviderDialog({ provider, onClose, onSave }: { provider: Provider | null; onClose: () => void; onSave: (provider: Provider) => void }) {
  const [form, setForm] = useState<Provider>(provider ?? { id: uid("provider"), name: "", type: "self_hosted", endpoint: "", enabled: true, status: "unknown", privacy_level: "low" });
  const valid = form.name.trim() && /^https?:\/\//i.test(form.endpoint);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form onSubmit={(event) => { event.preventDefault(); if (valid) onSave({ ...form, name: form.name.trim(), endpoint: form.endpoint.trim().replace(/\/$/, "") }); }} className="w-full max-w-lg animate-scale-in rounded-lg border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">{provider ? "编辑后端" : "添加转换后端"}</h2><p className="mt-1 text-xs text-muted-foreground">Endpoint 请填写完整的 SubConverter /sub 地址</p></div><button type="button" onClick={onClose} className={iconButton}><X className="h-4 w-4" /></button></div><div className="mt-6 grid gap-4"><label className="space-y-2 text-sm font-medium"><span>名称</span><input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="我的 SubConverter" className={inputClass} /></label><label className="space-y-2 text-sm font-medium"><span>Endpoint</span><input value={form.endpoint} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} placeholder="https://sub.example.com/sub" className={inputClass} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span>类型</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProviderType })} className={inputClass}>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="space-y-2 text-sm font-medium"><span>隐私等级</span><select value={form.privacy_level} onChange={(e) => setForm({ ...form, privacy_level: e.target.value as PrivacyLevel })} className={inputClass}><option value="low">低风险</option><option value="medium">需留意</option><option value="high">高风险</option></select></label></div><label className="flex items-center justify-between rounded-md border border-border p-3 text-sm"><span><span className="block font-medium">启用此后端</span><span className="mt-0.5 block text-xs text-muted-foreground">启用后可在转换页选择</span></span><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="h-4 w-4 accent-primary" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className={buttonSecondary}>取消</button><button type="submit" disabled={!valid} className={buttonPrimary}><Check className="h-4 w-4" />保存</button></div></form></div>;
}
