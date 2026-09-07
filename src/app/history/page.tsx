"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useMemo, useState } from "react";
import { Check, Clipboard, ExternalLink, History, Search, Trash2 } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { PageHeader, buttonSecondary, iconButton, inputClass } from "@/components/ui/app-ui";
import { targets } from "@/lib/app-data";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { history, setHistory, settings } = useAppData();
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");
  const filtered = useMemo(() => history.filter((item) => `${item.providerName} ${item.target}`.toLowerCase().includes(query.toLowerCase())), [history, query]);
  async function copy(id: string, value: string) { await navigator.clipboard.writeText(value); setCopied(id); window.setTimeout(() => setCopied(""), 1500); }
  return <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:py-9"><PageHeader title="历史记录" description="最近生成的转换链接保存在当前浏览器中，最多保留 100 条。" action={history.length ? <Button variant="outline" type="button" onClick={() => { if (window.confirm("确定清空全部历史记录吗？")) setHistory([]); }} className={cn(buttonSecondary, "text-destructive")}><Trash2 className="h-4 w-4" />清空记录</Button> : undefined} />
    <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索后端或目标格式" className={cn(inputClass, "pl-9")} /></div>
    {filtered.length ? <div className="overflow-hidden rounded-lg border border-border bg-card"><div className="hidden grid-cols-[150px_minmax(150px,1fr)_120px_90px_120px] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[11px] font-medium uppercase text-muted-foreground md:grid"><span>时间</span><span>转换后端</span><span>目标</span><span>来源</span><span className="text-right">操作</span></div><div className="divide-y divide-border">{filtered.map((item) => <div key={item.id} className="grid gap-3 px-4 py-4 md:grid-cols-[150px_minmax(150px,1fr)_120px_90px_120px] md:items-center md:gap-4 md:px-5"><time className="text-xs text-muted-foreground">{formatTime(item.createdAt)}</time><div className="min-w-0"><p className="truncate text-sm font-medium">{item.providerName}</p>{item.source && <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{settings.maskSource ? maskSource(item.source) : item.source}</p>}</div><span className="w-fit rounded-sm bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{targets.find((target) => target.value === item.target)?.label ?? item.target}</span><span className="text-xs text-muted-foreground">{item.sourceCount} 个订阅</span><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" type="button" title="复制转换链接" onClick={() => copy(item.id, item.resultUrl)} className={iconButton}>{copied === item.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Clipboard className="h-4 w-4" />}</Button><a title="打开配置" href={item.resultUrl} target="_blank" rel="noreferrer" className={iconButton}><ExternalLink className="h-4 w-4" /></a><Button variant="ghost" size="icon" type="button" title="删除" onClick={() => setHistory((items) => items.filter((entry) => entry.id !== item.id))} className={cn(iconButton, "hover:text-destructive")}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div></div> : <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-border"><div className="text-center"><History className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-3 text-sm font-medium">{history.length ? "没有匹配的记录" : "还没有转换记录"}</p><p className="mt-1 text-xs text-muted-foreground">生成转换链接后会显示在这里</p></div></div>}
  </div>;
}

function formatTime(value: string) { return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
function maskSource(value: string) { return value.split("|").map((item) => { try { const url = new URL(item); return `${url.origin}/••••••`; } catch { return "••••••"; } }).join(" | "); }
