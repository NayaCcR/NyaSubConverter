"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/ui/form-dialog";

import { useState } from "react";
import { Check, Copy, FileSliders, Pencil, Plus, Trash2 } from "lucide-react";
import { OptionFields } from "@/components/conversion/option-fields";
import { useAppData } from "@/components/providers/app-data-provider";
import { PageHeader, buttonPrimary, buttonSecondary, iconButton, inputClass } from "@/components/ui/app-ui";
import { defaultOptions, normalizeOptions, targets, type Profile, uid } from "@/lib/app-data";
import { cn } from "@/lib/utils";

export default function ProfilesPage() {
  const { profiles, setProfiles } = useAppData();
  const [editing, setEditing] = useState<Profile | null | undefined>();
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:py-9">
      <PageHeader title="配置 Profile" description="保存完整的转换参数，包括远程配置、节点筛选、命名规则和协议选项。" action={<Button type="button" onClick={() => setEditing(null)} className={buttonPrimary}><Plus className="h-4 w-4" />新建 Profile</Button>} />
      {profiles.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="flex min-h-52 flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary"><FileSliders className="h-5 w-5" /></span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" title="复制" type="button" onClick={() => setProfiles((items) => [...items, { ...profile, id: uid("profile"), name: `${profile.name} 副本`, updatedAt: new Date().toISOString() }])} className={iconButton}><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="编辑" type="button" onClick={() => setEditing(profile)} className={iconButton}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="删除" type="button" onClick={() => { if (window.confirm(`确定删除“${profile.name}”吗？`)) setProfiles((items) => items.filter((item) => item.id !== profile.id)); }} className={cn(iconButton, "hover:text-destructive")}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <h2 className="mt-5 text-sm font-semibold">{profile.name}</h2>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{profile.description || "未填写说明"}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                <Tag primary>{targets.find((item) => item.value === profile.target)?.label ?? profile.target}</Tag>
                {profile.config && <Tag>远程配置</Tag>}{profile.emoji && <Tag>Emoji</Tag>}{profile.udp && <Tag>UDP</Tag>}{profile.sort && <Tag>排序</Tag>}{(profile.include || profile.exclude) && <Tag>筛选</Tag>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-border"><div className="text-center"><FileSliders className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-3 text-sm font-medium">还没有 Profile</p><p className="mt-1 text-xs text-muted-foreground">保存一套常用转换选项</p></div></div>
      )}
      {editing !== undefined && <ProfileDialog profile={editing} onClose={() => setEditing(undefined)} onSave={(value) => { setProfiles((items) => editing ? items.map((item) => item.id === editing.id ? value : item) : [...items, value]); setEditing(undefined); }} />}
    </div>
  );
}

function Tag({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  return <span className={cn("rounded-sm px-2 py-1 text-[11px]", primary ? "bg-primary/10 font-medium text-primary" : "bg-muted text-muted-foreground")}>{children}</span>;
}

function ProfileDialog({ profile, onClose, onSave }: { profile: Profile | null; onClose: () => void; onSave: (profile: Profile) => void }) {
  const [form, setForm] = useState<Profile>(() => profile
    ? { ...profile, ...normalizeOptions(profile) }
    : { id: uid("profile"), name: "", description: "", ...defaultOptions, updatedAt: new Date().toISOString() }
  );
  return (
    <FormDialog title={profile ? "编辑 Profile" : "新建 Profile"} description="完整保存首页支持的全部 SubConverter 参数" className="max-w-4xl" onClose={onClose} onSubmit={(event) => { event.preventDefault(); if (form.name.trim()) onSave({ ...form, name: form.name.trim(), updatedAt: new Date().toISOString() }); }}>
        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span>名称</span><Input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="例如 Clash 日常配置" className={inputClass} /></label><label className="space-y-2 text-sm font-medium"><span>目标客户端</span><select value={form.target} onChange={(event) => setForm({ ...form, target: event.target.value })} className={inputClass}>{targets.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>
          <label className="space-y-2 text-sm font-medium"><span>说明</span><Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="这套配置适用于..." className={inputClass} /></label>
          <OptionFields options={form} onChange={(options) => setForm((value) => ({ ...value, ...options }))} />
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-border pt-5"><Button variant="outline" type="button" onClick={onClose} className={buttonSecondary}>取消</Button><Button type="submit" disabled={!form.name.trim()} className={buttonPrimary}><Check className="h-4 w-4" />保存</Button></div>
      </FormDialog>
  );
}
