"use client";

import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { InlineNavLink, SidebarNavLink, isActivePath } from "@/components/layout/nav-links";
import { SiteFooter } from "@/components/layout/site-footer";
import { LanguageSelect } from "@/components/layout/language-select";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useI18n } from "@/components/providers/locale-provider";
import type { Branding, NavGroup } from "@/lib/site-config";

/** Fixed left rail on desktop, header + scrolling nav row on mobile. */
export function SidebarLayout({
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
  const flatItems = groups.flatMap((group) => group.items);

  return (
    <div className="min-h-screen bg-muted/25 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background lg:flex lg:flex-col">
        <div className="border-b border-border px-5 py-5">
          <BrandLogo branding={branding} variant="sidebar" subtitle={t(branding.taglineKey)} />
          <div className="mt-4 flex items-center justify-center gap-2 rounded-md border border-border bg-muted/35 p-2">
            <LanguageSelect />
            <UserMenu />
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
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
        </nav>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="relative flex h-14 items-center gap-2 px-3 lg:justify-center lg:px-5">
            <BrandLogo branding={branding} variant="topbar" className="lg:hidden" />
            <div className="hidden min-w-0 items-center gap-3 text-center lg:flex">
              <BrandLogo
                branding={branding}
                variant="topbar"
                showWordmark={false}
              />
              <span>
                <span className="block text-sm font-medium leading-5">
                  {currentLabel(pathname, flatItems, t, branding.appName)}
                </span>
                <span className="block text-[11px] text-muted-foreground">{t("layout.header.workspace")}</span>
              </span>
            </div>
            <div className="hidden lg:absolute lg:right-5 lg:flex lg:items-center">
              <ThemeToggle />
            </div>
            <div className="ml-auto flex items-center gap-1 lg:absolute lg:right-5 lg:hidden">
              <ThemeToggle />
              <LanguageSelect />
              <UserMenu />
            </div>
          </div>
          <nav className="scrollbar-none flex gap-1 overflow-x-auto border-t border-border px-2 py-2 lg:hidden">
            {flatItems.map((item) => (
              <InlineNavLink
                key={item.href}
                href={item.href}
                active={isActivePath(pathname, item.href)}
                icon={item.icon}
                label={t(item.labelKey)}
                compact
              />
            ))}
          </nav>
        </header>

        <main className="min-w-0 flex-1 bg-background lg:rounded-l-xl lg:border-l lg:border-border">{children}</main>
        <SiteFooter branding={branding} className="lg:border-l" />
      </div>
    </div>
  );
}

function currentLabel(
  pathname: string | null,
  items: { href: string; labelKey: string }[],
  t: (key: string) => string,
  fallback: string
): string {
  const item = items.find((nav) => isActivePath(pathname, nav.href));
  return item ? t(item.labelKey) : fallback;
}
