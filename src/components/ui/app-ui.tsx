import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({ icon: Icon, title, description, action }: { icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        {Icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatusDot({ status }: { status: "online" | "offline" | "checking" | "unknown" }) {
  const label = { online: "在线", offline: "离线", checking: "检测中", unknown: "未检测" }[status];
  return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className={cn("h-2 w-2 rounded-full", status === "online" && "bg-emerald-500", status === "offline" && "bg-destructive", status === "checking" && "animate-pulse bg-amber-500", status === "unknown" && "bg-muted-foreground/40")} />{label}</span>;
}

export function PrivacyBadge({ level }: { level: "low" | "medium" | "high" }) {
  const styles = level === "low" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : level === "medium" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-destructive/10 text-destructive";
  const label = { low: "低风险", medium: "需留意", high: "高风险" }[level];
  return <span className={cn("inline-flex rounded-sm px-2 py-1 text-[11px] font-medium", styles)}>{label}</span>;
}

export const inputClass = "focus-ring h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/70";
export const buttonPrimary = "button-glow-primary focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-[background-color,box-shadow,transform] hover:-translate-y-px hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50";
export const buttonSecondary = "button-glow-secondary focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-px hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";
export const iconButton = "control-glow focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/80 bg-muted/45 text-muted-foreground shadow-sm transition-[background-color,border-color,box-shadow,transform,color] hover:-translate-y-px hover:bg-primary/10 hover:text-primary disabled:opacity-50";
