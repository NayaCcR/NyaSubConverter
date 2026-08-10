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
}: {
  href: string;
  active: boolean;
  icon: LucideIcon;
  label: string;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        nested && "h-9 text-xs",
        active && "bg-primary/10 text-primary"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

/** Horizontal pill used by the topbar layout and the mobile nav row. */
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
