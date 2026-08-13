"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/components/providers/locale-provider";
import { SidebarNavLink, isActivePath } from "@/components/layout/nav-links";
import type { NavGroup } from "@/lib/site-config";

export function MobileDrawer({
  open,
  groups,
  pathname,
  onClose,
  tools,
}: {
  open: boolean;
  groups: NavGroup[];
  pathname: string;
  onClose: () => void;
  tools: ReactNode;
}) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className="fixed inset-0 top-16 z-30 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
      />
      <aside
        id="mobile-navigation-drawer"
        aria-label={t("layout.nav.open")}
        className="mobile-drawer fixed inset-x-3 top-16 z-40 grid max-h-[calc(100vh-5rem)] gap-5 overflow-y-auto rounded-b-xl border border-border/80 bg-popover/95 p-4 text-popover-foreground shadow-2xl backdrop-blur-xl lg:hidden"
      >
        <nav className="space-y-5">
          {groups.map((group) => (
            <div key={group.id} className="space-y-1">
              <div className="px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t(group.labelKey)}
              </div>
              {group.items.map((item) => (
                <SidebarNavLink
                  key={item.href}
                  href={item.href}
                  active={isActivePath(pathname, item.href)}
                  icon={item.icon}
                  label={t(item.labelKey)}
                  onClick={onClose}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="grid gap-3 border-t border-border/80 pt-4">{tools}</div>
      </aside>
    </>
  );
}
