"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LayoutControl } from "@/components/layout/layout-control";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { ShellActions } from "@/components/layout/shell-actions";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { TopbarLayout } from "@/components/layout/topbar-layout";
import { LanguageSelect } from "@/components/layout/language-select";
import { useI18n } from "@/components/providers/locale-provider";
import {
  resolveBranding,
  resolveLayout,
  siteConfig,
  type BrandingOverrides,
  type LayoutStyle,
  type NavGroup,
} from "@/lib/site-config";

const LAYOUT_STORAGE_KEY = "nya.layout";
const SIDEBAR_STORAGE_KEY = "nya.sidebar-collapsed";

/** Shared shell state for sidebar/topbar layouts and their responsive controls. */
export function AppShell({
  children,
  overrides,
  signedIn = true,
  groups = siteConfig.navGroups,
}: {
  children: React.ReactNode;
  overrides?: BrandingOverrides | null;
  signedIn?: boolean;
  groups?: NavGroup[];
}) {
  const pathname = usePathname() || "/";
  const { t } = useI18n();
  const defaultLayout = resolveLayout(overrides);
  const branding = useMemo(() => resolveBranding(overrides), [overrides]);
  const switchable = siteConfig.layoutSwitchable;
  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.private || signedIn),
        }))
        .filter((group) => group.items.length > 0),
    [groups, signedIn]
  );

  const [layout, setLayout] = useState<LayoutStyle>(defaultLayout);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!switchable) {
      setLayout(defaultLayout);
      return;
    }
    const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    setLayout(stored === "sidebar" || stored === "topbar" ? stored : defaultLayout);
  }, [defaultLayout, switchable]);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const changeLayout = (nextLayout: LayoutStyle) => {
    if (!switchable) return;
    setLayout(nextLayout);
    setMobileOpen(false);
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, nextLayout);
  };

  const changeSidebar = (nextCollapsed: boolean) => {
    setSidebarCollapsed(nextCollapsed);
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextCollapsed));
  };

  const desktopActions = <ShellActions layout={layout} switchable={switchable} onChangeLayout={changeLayout} />;
  const mobileActions = (
    <ShellActions
      layout={layout}
      switchable={switchable}
      onChangeLayout={changeLayout}
      mobile
      mobileOpen={mobileOpen}
      onToggleMobile={() => setMobileOpen((value) => !value)}
    />
  );
  const mobileDrawer = (
    <MobileDrawer
      open={mobileOpen}
      groups={visibleGroups}
      pathname={pathname}
      onClose={() => setMobileOpen(false)}
      tools={
        <>
          <LanguageSelect />
          {switchable && <LayoutControl value={layout} onChange={changeLayout} />}
        </>
      }
    />
  );
  const pageLabel = currentPage(pathname, visibleGroups, t);

  if (layout === "topbar") {
    return (
      <TopbarLayout
        branding={branding}
        groups={visibleGroups}
        pathname={pathname}
        desktopActions={desktopActions}
        mobileActions={mobileActions}
        mobileDrawer={mobileDrawer}
      >
        {children}
      </TopbarLayout>
    );
  }

  return (
    <SidebarLayout
      branding={branding}
      groups={visibleGroups}
      pathname={pathname}
      pageLabel={pageLabel}
      collapsed={sidebarCollapsed}
      onCollapse={changeSidebar}
      desktopActions={desktopActions}
      mobileActions={mobileActions}
      mobileDrawer={mobileDrawer}
    >
      {children}
    </SidebarLayout>
  );
}

function currentPage(pathname: string, groups: NavGroup[], t: (key: string) => string): string {
  const item = groups.flatMap((group) => group.items).find((candidate) => {
    if (candidate.href === "/") return pathname === "/";
    return pathname === candidate.href || pathname.startsWith(`${candidate.href}/`);
  });
  return item ? t(item.labelKey) : t("nav.home");
}
