"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SidebarNavLink, isActivePath } from "@/components/layout/nav-links";
import { SiteFooter } from "@/components/layout/site-footer";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { Branding, NavGroup, NavItem } from "@/lib/site-config";

const CONTAINER = "w-full px-4 lg:px-6";

/** Full-width shell with the template's right-side management controls. */
export function TopbarLayout({
  branding,
  groups,
  pathname,
  desktopActions,
  mobileActions,
  mobileDrawer,
  children,
}: {
  branding: Branding;
  groups: NavGroup[];
  pathname: string;
  desktopActions: ReactNode;
  mobileActions: ReactNode;
  mobileDrawer: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const flatItems = groups.flatMap((group) => group.items);

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className={cn(CONTAINER, "flex min-h-16 items-center gap-3 py-2")}>
          <BrandLogo branding={branding} variant="topbar" className="shrink-0" />
          <span aria-hidden="true" className="hidden h-6 w-px shrink-0 bg-border md:block" />

          <nav className="scrollbar-none hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
            {flatItems.map((item) => (
              <TopbarNavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} t={t} />
            ))}
          </nav>

          <div className="ml-auto shrink-0 md:ml-0">
            <div className="desktop-shell-actions hidden items-center rounded-lg border border-border/80 bg-muted/45 p-1 shadow-sm md:flex">
              {desktopActions}
            </div>
            <div className="flex items-center md:hidden">{mobileActions}</div>
          </div>
        </div>
      </header>
      {mobileDrawer}

      <main className="flex-1">{children}</main>
      <SiteFooter branding={branding} />
    </div>
  );
}

function TopbarNavLink({
  item,
  active,
  t,
}: {
  item: NavItem;
  active: boolean;
  t: (key: string) => string;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{t(item.labelKey)}</span>
    </Link>
  );
}
