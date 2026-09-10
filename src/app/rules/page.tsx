"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink, Library, Plus, RefreshCw, Settings } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { useRuleCatalog } from "@/components/providers/rule-catalog-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, buttonPrimary, buttonSecondary, inputClass } from "@/components/ui/app-ui";
import { defaultOptions, uid } from "@/lib/app-data";
import { isLocalRuleUrl, type RuleTemplate } from "@/lib/rule-catalog";

export default function RulesPage() {
  const { ready, profiles, setProfiles, settings } = useAppData();
  const { snapshot, loading, error, storageWarning, fromCache, refresh, selectForConversion } = useRuleCatalog();
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const templates = snapshot?.catalog.templates ?? [];
  const filtered = templates.filter((item) => `${item.name} ${item.description} ${item.source?.name ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));

  function saveProfile(template: RuleTemplate) {
    const profile = { ...defaultOptions, id: uid("profile"), name: template.name, description: template.description, config: template.config_url, updatedAt: new Date().toISOString() };
    setProfiles((current) => [...current, profile]);
    setNotice(`已添加「${template.name}」到 Profile，可在配置页面继续编辑。`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:py-9">
      <PageHeader title="规则库" description="从 NyaSub 与公开规则方案中选一套分流配置，直接用于订阅转换，或保存为自己的 Profile。" action={<Button type="button" variant="outline" disabled={!ready || loading} onClick={refresh} className={buttonSecondary}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{loading ? "正在拉取" : "在线更新"}</Button>} />

      <section className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-xs leading-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{loading ? "正在检查在线目录…" : error ? snapshot ? "更新失败 · 使用上次成功的缓存" : "规则目录暂不可用" : fromCache ? "已加载缓存" : "在线目录已就绪"}</span><Link href="/settings#rule-catalog" className="inline-flex items-center gap-1 text-primary hover:underline"><Settings className="h-3.5 w-3.5" />更换规则目录</Link></div>
        <p className="break-all font-mono text-[11px] text-muted-foreground">{settings.ruleCatalogUrl}</p>
        {snapshot && <p className="text-muted-foreground">{templates.length} 套模板 · 目录发布于 {formatDate(snapshot.catalog.updated_at)} · 最近拉取 {formatDate(snapshot.fetched_at)}</p>}
        {error && <p role="alert" className="text-destructive">{error} {snapshot ? "缓存仍可选择，已保存的 Profile 不受影响。" : "请检查目录地址、网络和目录服务的 CORS 设置。"}</p>}
        {storageWarning && <p role="status" className="text-muted-foreground">当前浏览器未能保存缓存，本次拉取的模板仍可使用。</p>}
        <p className="text-muted-foreground">刷新只更新可选目录。已保存的 Profile 保留所选链接；转换后端按自身缓存周期更新该链接的规则。</p>
      </section>

      {notice && <p role="status" className="flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 p-3 text-sm"><Check className="h-4 w-4 shrink-0 text-primary" /><span>{notice} <Link href="/profiles" className="text-primary underline">查看 Profile</Link></span></p>}
      <label className="block"><span className="sr-only">搜索规则模板</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、用途或来源" className={inputClass} /></label>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((template) => {
          const existing = profiles.some((profile) => profile.config === template.config_url);
          return (
            <Card key={template.id} className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-none" data-testid={`rule-template-${template.id}`}>
              <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Library className="h-4 w-4" /></span><div className="min-w-0"><h2 className="text-sm font-semibold">{template.name}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{template.description}</p></div></div>
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">{template.rule_count !== undefined && <span className="rounded bg-muted px-2 py-1">{template.rule_count.toLocaleString()} 条规则</span>}{template.group_count !== undefined && <span className="rounded bg-muted px-2 py-1">{template.group_count} 个策略组</span>}{template.source?.license && <span className="rounded bg-muted px-2 py-1">{template.source.license}</span>}</div>
              {template.source && <div className="text-xs leading-5 text-muted-foreground"><a href={template.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{template.source.name}<ExternalLink className="h-3 w-3" /></a>{template.source.revision && <span className="ml-2 break-all font-mono text-[10px]">{template.source.revision}</span>}{template.source.retrieved_at && <span className="mt-1 block">来源抓取：{formatDate(template.source.retrieved_at)}</span>}</div>}
              {Boolean(template.warnings?.length) && <ul className="space-y-1 rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground">{template.warnings!.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
              {isLocalRuleUrl(template.config_url) && <p className="text-xs leading-5 text-muted-foreground">这份配置使用本机地址。远程转换后端无法读取你的 localhost，请先切换到公开部署的规则目录。</p>}
              <div className="mt-auto space-y-3 border-t border-border pt-4">
                <div className="flex flex-wrap gap-2"><Button type="button" onClick={() => { selectForConversion(template.config_url); router.push("/"); }} className={buttonPrimary}>用于转换<ArrowRight className="h-4 w-4" /></Button><Button type="button" variant="outline" disabled={existing || !ready} onClick={() => saveProfile(template)} className={buttonSecondary}>{existing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{existing ? "已保存 Profile" : "保存为 Profile"}</Button></div>
                <a href={template.config_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">查看 SubConverter INI<ExternalLink className="h-3 w-3" /></a>
                {template.payload_url && <a href={template.payload_url} target="_blank" rel="noreferrer" className="ml-4 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">NyaSub 模板 JSON<ExternalLink className="h-3 w-3" /></a>}
              </div>
            </Card>
          );
        })}
      </div>
      {!filtered.length && <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{loading ? "正在拉取规则模板…" : query ? "没有找到匹配的规则模板" : "暂无可用模板，可在线更新或更换目录地址。"}</p>}
      <p className="text-xs leading-5 text-muted-foreground">目录请求不包含订阅链接、节点或 Token。目录地址需支持浏览器跨域读取；INI 地址需能由所选转换后端访问。已有 ACL4SSR 等快捷配置仍保留在转换选项中。</p>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}
