"use client";

import Link from "next/link";
import { Database } from "lucide-react";

/**
 * Slot component. Swap this for your own auth-aware menu — the layouts only
 * expect something roughly 36px square.
 */
export function UserMenu({ href = "/settings", label = "本地数据设置" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-md border border-border bg-muted/35 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
    >
      <Database className="h-4 w-4" />
    </Link>
  );
}
