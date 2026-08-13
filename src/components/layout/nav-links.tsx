"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNavLink({
  href,
  active,
  icon: Icon,
  label,
  nested = false,
  collapsed = false,
  onClick,
}: {
  href: string;
  active: boolean;
  icon: LucideIcon;
  label: string;
  nested?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg border-l-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
        nested && "h-9 text-xs",
        collapsed && "justify-center border-l-0 px-0",
        active && "border-primary bg-primary/10 text-primary shadow-sm"
      )}
    >
      <Icon className={collapsed ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"} />
      <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
    </Link>
  );
}

/** Horizontal link used by the topbar layout. */
export function InlineNavLink({
  href,
  active,
  icon: Icon,
  label,
  compact = false,
}: {
  href: string;
  active: boolean;
  icon: LucideIcon;
  label: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : compact
            ? "bg-muted/60 text-muted-foreground hover:text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href.includes("?")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
