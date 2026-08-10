"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SidebarNavLink, isActivePath } from "@/components/layout/nav-links";
import { SiteFooter } from "@/components/layout/site-footer";
import { LanguageSelect } from "@/components/layout/language-select";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { Branding, NavGroup, NavItem } from "@/lib/site-config";

const CONTAINER = "mx-auto w-full max-w-[1600px] px-4 lg:px-6";

/**
 * Full-width app bar instead of the left rail. Brand, primary nav, then a
 * grouped control cluster. Content spans the whole viewport, which suits wide
 * media grids better than the fixed rail.
 */
export function TopbarLayout({
  branding,
  groups,
  children,
}: {
  branding: Branding;
  groups: NavGroup[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const flatItems = groups.flatMap((group) => group.items);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className={cn(CONTAINER, "flex h-16 items-center gap-3")}>
          <BrandLogo branding={branding} variant="topbar" className="shrink-0" />

          <span aria-hidden="true" className="hidden h-6 w-px shrink-0 bg-border md:block" />

          <nav className="scrollbar-none hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex">
            {flatItems.map((item) => (
              <TopbarNavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} t={t} />
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
            <div className="hidden items-center gap-1 rounded-md border border-border bg-muted/35 p-1 md:flex">
              <ThemeToggle />
              <LanguageSelect />
              <UserMenu />
            </div>
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle />
              <UserMenu />
              <button
                type="button"
                aria-label={t(drawerOpen ? "common.close" : "layout.nav.open")}
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen((open) => !open)}
                className="grid h-9 w-9 place-items-center rounded-md border border-border bg-muted/35 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {drawerOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <nav className={cn(CONTAINER, "max-h-[70vh] space-y-4 overflow-y-auto py-4")}>
              {groups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <div className="px-3 text-[11px] font-medium uppercase text-muted-foreground">
                    {t(group.labelKey)}
                  </div>
                  {group.items.map((item) => (
                    <SidebarNavLink
                      key={item.href}
                      href={item.href}
                      active={isActivePath(pathname, item.href)}
                      icon={item.icon}
                      label={t(item.labelKey)}
                    />
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-center gap-2 border-t border-border pt-4">
                <LanguageSelect />
              </div>
            </nav>
          </div>
        )}
      </header>

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
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{t(item.labelKey)}</span>
    </Link>
  );
}
