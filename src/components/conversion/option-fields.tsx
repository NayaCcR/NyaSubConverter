"use client";

import { remoteConfigGroups, type ConvertOptions } from "@/lib/app-data";
import { inputClass } from "@/components/ui/app-ui";
import { cn } from "@/lib/utils";

type BooleanOptionKey = {
  [K in keyof ConvertOptions]: ConvertOptions[K] extends boolean ? K : never;
}[keyof ConvertOptions];

const toggles: { key: BooleanOptionKey; label: string; hint: string }[] = [
  { key: "emoji", label: "Emoji", hint: "节点名称添加旗帜" },
  { key: "udp", label: "UDP", hint: "启用 UDP 转发" },
  { key: "xudp", label: "XUDP", hint: "启用 Xray UDP" },
  { key: "tfo", label: "TCP Fast Open", hint: "启用 TCP 快速打开" },
  { key: "sort", label: "基础节点排序", hint: "由 SubConverter 排序" },
  { key: "list", label: "仅节点列表", hint: "不生成完整规则" },
  { key: "insert", label: "插入默认节点", hint: "合并配置中的 insert_url" },
  { key: "appendType", label: "插入节点类型", hint: "名称中附加协议类型" },
  { key: "tls13", label: "TLS 1.3", hint: "为支持的客户端启用" },
  { key: "expand", label: "展开规则全文", hint: "输出完整规则内容" },
  { key: "scv", label: "跳过证书验证", hint: "不验证节点 TLS 证书" },
  { key: "fdn", label: "过滤不支持节点", hint: "移除目标不支持的协议" },
  { key: "clashNewName", label: "Clash 新字段名", hint: "使用新格式字段名称" },
  { key: "clashDoh", label: "Clash DoH", hint: "DNS 查询使用 DoH" },
  { key: "surgeDoh", label: "Surge DoH", hint: "DNS 查询使用 DoH" },
  { key: "singboxIpv6", label: "sing-box IPv6", hint: "生成 IPv6 相关配置" },
];

export function OptionFields({ options, onChange }: { options: ConvertOptions; onChange: (options: ConvertOptions) => void }) {
  const knownConfig = remoteConfigGroups.flatMap((group) => group.options).some((item) => item.value === options.config);
  const configSelection = !options.config ? "" : knownConfig ? options.config : "__custom__";
  const set = <K extends keyof ConvertOptions>(key: K, value: ConvertOptions[K]) => onChange({ ...options, [key]: value });

  return (
    <div className="mt-4 space-y-5 border-t border-border pt-5">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground">远程配置</h3>
        <select
          value={configSelection}
          onChange={(event) => set("config", event.target.value === "__custom__" ? "https://" : event.target.value)}
          className={inputClass}
        >
          <option value="">不使用远程配置</option>
          {remoteConfigGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </optgroup>
          ))}
          <option value="__custom__">自定义 URL</option>
        </select>
        {configSelection === "__custom__" && (
          <input value={options.config} onChange={(event) => set("config", event.target.value)} placeholder="https://example.com/config.ini" className={inputClass} />
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground">筛选与命名</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="包含节点" value={options.include} placeholder="支持正则表达式" onChange={(value) => set("include", value)} />
          <TextField label="排除节点" value={options.exclude} placeholder="支持正则表达式" onChange={(value) => set("exclude", value)} />
          <TextField label="节点重命名" value={options.rename} placeholder="例如 `香港@HK`" onChange={(value) => set("rename", value)} />
          <TextField label="订阅文件名" value={options.filename} placeholder="例如 my-config.yaml" onChange={(value) => set("filename", value)} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground">请求与托管</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField label="自定义 User-Agent" value={options.userAgent} placeholder="例如 Shadowrocket" onChange={(value) => set("userAgent", value)} />
          <TextField label="远程设备 ID" value={options.devId} placeholder="Quantumult X" onChange={(value) => set("devId", value)} />
          <TextField label="更新间隔（天）" value={options.interval} placeholder="例如 1" inputMode="decimal" onChange={(value) => set("interval", value)} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground">输出选项</h3>
        <div className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-3">
          {toggles.map((item) => (
            <label key={item.key} className="flex min-h-16 cursor-pointer items-center justify-between gap-3 border-b border-border px-2 py-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0">
              <span className="min-w-0"><span className="block text-xs font-medium">{item.label}</span><span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{item.hint}</span></span>
              <input type="checkbox" checked={options[item.key]} onChange={(event) => set(item.key, event.target.checked)} className="h-4 w-4 shrink-0 accent-primary" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function TextField({ label, value, placeholder, inputMode, onChange }: { label: string; value: string; placeholder: string; inputMode?: "decimal"; onChange: (value: string) => void }) {
  return <label className="space-y-1.5 text-xs font-medium"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} className={cn(inputClass, "font-normal")} /></label>;
}
