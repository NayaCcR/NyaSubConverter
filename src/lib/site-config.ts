import type { LucideIcon } from "lucide-react";
import { History, House, ServerCog, Settings, SlidersHorizontal } from "lucide-react";

/**
 * The one file to edit when reusing this template.
 * Everything below is a compile-time default; anything the backend returns from
 * its site-config endpoint overrides it at runtime (see `resolveBranding`).
 */

export type LayoutStyle = "sidebar" | "topbar";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  /** Only render when the viewer is signed in. */
  private?: boolean;
};

export type NavGroup = {
  id: string;
  labelKey: string;
  items: NavItem[];
};

export type Branding = {
  appName: string;
  /** Shown under the app name in the sidebar header. */
  taglineKey: string;
  /** Path or absolute URL. Empty string falls back to `logoFallbackText`. */
  logoUrl: string;
  /** Rendered in a rounded tile when no logo image is available or it fails to load. */
  logoFallbackText: string;
  /** Square logo edge length in px, per layout. */
  logoSize: { sidebar: number; topbar: number };
  faviconUrl: string;
};

export type SiteConfig = {
  branding: Branding;
  /**
   * Which shell to render by default. Viewers may switch it when
   * `layoutSwitchable` is enabled.
   */
  layout: LayoutStyle;
  /** Allow viewers to switch between the two template shell variants. */
  layoutSwitchable: boolean;
  navGroups: NavGroup[];
  footer: {
    /** Rendered as `{app} by {author}` through the `layout.footer.credit` message. */
    author: string;
    repositoryUrl: string;
    credits: { label: string; url: string; prefix: string; noteKey: string }[];
  };
};

export const siteConfig: SiteConfig = {
  branding: {
    appName: "NyaSubConverter",
    taglineKey: "layout.header.console",
    logoUrl: "/logo.png",
    logoFallbackText: "N",
    logoSize: { sidebar: 36, topbar: 32 },
    faviconUrl: "/favicon.ico",
  },

  layout: "sidebar",
  layoutSwitchable: true,

  navGroups: [
    {
      id: "convert",
      labelKey: "layout.groups.convert",
      items: [
        { href: "/", labelKey: "nav.home", icon: House },
        { href: "/providers", labelKey: "nav.providers", icon: ServerCog },
        { href: "/profiles", labelKey: "nav.profiles", icon: SlidersHorizontal },
      ],
    },
    {
      id: "records",
      labelKey: "layout.groups.records",
      items: [
        { href: "/history", labelKey: "nav.history", icon: History },
        { href: "/settings", labelKey: "nav.settings", icon: Settings },
      ],
    },
  ],

  footer: {
    author: "NayaCcR",
    repositoryUrl: "https://github.com/NayaCcR/NyaSubConverter",
    credits: [],
  },
};

/** Runtime overrides a backend may supply. Every field is optional. */
export type BrandingOverrides = {
  app_name?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  layout?: string | null;
  repository?: string | null;
};

export function resolveBranding(overrides?: BrandingOverrides | null): Branding {
  const base = siteConfig.branding;
  return {
    ...base,
    appName: trimmed(overrides?.app_name) ?? base.appName,
    logoUrl: trimmed(overrides?.logo_url) ?? base.logoUrl,
    faviconUrl: trimmed(overrides?.favicon_url) ?? base.faviconUrl,
  };
}

export function resolveLayout(overrides?: BrandingOverrides | null): LayoutStyle {
  return isLayoutStyle(overrides?.layout) ? overrides.layout : siteConfig.layout;
}

export function isLayoutStyle(value: unknown): value is LayoutStyle {
  return value === "sidebar" || value === "topbar";
}

function trimmed(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  return text || null;
}
