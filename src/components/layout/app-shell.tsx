"use client";

import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { TopbarLayout } from "@/components/layout/topbar-layout";
import { resolveBranding, resolveLayout, siteConfig, type BrandingOverrides, type NavGroup } from "@/lib/site-config";

/**
 * Picks the shell variant from config. Both layouts render the same nav model,
 * so adding a third variant only means writing one more component and extending
 * LayoutStyle. There is deliberately no in-app switch: which shell to use is a
 * decision for whoever builds the site, not for its visitors.
 *
 * `overrides` is whatever your backend serves for branding (app name, logo,
 * layout). Pass it from a query hook; omit it for a static template.
 * `signedIn` gates nav items marked `private`.
 */
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
  const layout = resolveLayout(overrides);
  const branding = resolveBranding(overrides);
  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.private || signedIn) }))
    .filter((group) => group.items.length > 0);

  const Layout = layout === "topbar" ? TopbarLayout : SidebarLayout;
  return (
    <Layout branding={branding} groups={visibleGroups}>
      {children}
    </Layout>
  );
}
