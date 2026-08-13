"use client";

import type { ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SidebarNavLink, isActivePath } from "@/components/layout/nav-links";
import { SiteFooter } from "@/components/layout/site-footer";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { Branding, NavGroup } from "@/lib/site-config";

/** Fixed left rail with a compact desktop tools row and no desktop top-shell. */
export function SidebarLayout({
  branding,
  groups,
  pathname,
  pageLabel,
  collapsed,
  onCollapse,
  desktopActions,
  mobileActions,
  mobileDrawer,
  children,
}: {
  branding: Branding;
  groups: NavGroup[];
  pathname: string;
  pageLabel: string;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  desktopActions: ReactNode;
  mobileActions: ReactNode;
  mobileDrawer: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const collapseLabel = t(collapsed ? "layout.sidebar.expand" : "layout.sidebar.collapse");

  return (
    <div className="min-h-screen text-foreground">
      <aside
        aria-label={t("layout.header.workspace")}
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border/80 bg-card/75 backdrop-blur-xl transition-[width] duration-200 lg:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("border-b border-border/80 px-4 py-5", collapsed && "flex justify-center px-2")}>
          <BrandLogo
            branding={branding}
            variant="sidebar"
            subtitle={t(branding.taglineKey)}
            showWordmark={!collapsed}
            className={collapsed ? "justify-center" : undefined}
          />
        </div>

        <nav className={cn("flex-1 space-y-5 overflow-y-auto py-5", collapsed ? "px-2" : "px-3")}>
          {groups.map((group) => (
            <div key={group.id} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t(group.labelKey)}
                </div>
              )}
              {group.items.map((item) => (
                <SidebarNavLink
                  key={item.href}
                  href={item.href}
                  active={isActivePath(pathname, item.href)}
                  icon={item.icon}
                  label={t(item.labelKey)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className={cn("border-t border-border/80 p-3", collapsed && "px-2")}>
          {!collapsed && <p className="mb-3 px-2 text-[11px] leading-5 text-muted-foreground">{t("layout.header.workspace")}</p>}
          <button
            type="button"
            onClick={() => onCollapse(!collapsed)}
            title={collapseLabel}
            aria-label={collapseLabel}
            aria-pressed={collapsed}
            className={cn(
              "control-glow flex h-10 w-full items-center gap-3 rounded-lg border border-border/80 bg-muted/35 px-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
              collapsed && "justify-center px-0"
            )}
          >
            <CollapseIcon className={collapsed ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"} />
            <span className={collapsed ? "sr-only" : undefined}>{collapseLabel}</span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border/80 bg-background/75 px-4 backdrop-blur-xl lg:hidden">
        <BrandLogo branding={branding} variant="topbar" />
        <div className="flex items-center">{mobileActions}</div>
      </header>
      {mobileDrawer}

      <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Sidebar mode intentionally keeps only this compact action row on desktop. */}
        <div className="desktop-page-tools hidden h-16 items-center justify-between border-b border-border/80 px-6 lg:flex">
          <span className="text-xs text-muted-foreground">
            {t("layout.header.workspace")} <span className="px-1 text-border">/</span> {pageLabel}
          </span>
          <div className="desktop-shell-actions flex items-center rounded-lg border border-border/80 bg-muted/45 p-1 shadow-sm">{desktopActions}</div>
        </div>
        <main key={pathname} className="min-h-[calc(100vh-4rem)] bg-transparent">{children}</main>
        <SiteFooter branding={branding} className="lg:border-l" />
      </div>
    </div>
  );
}
