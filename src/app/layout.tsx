import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppDataProvider } from "@/components/providers/app-data-provider";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { default: siteConfig.branding.appName, template: `%s · ${siteConfig.branding.appName}` },
  applicationName: siteConfig.branding.appName,
  description: "独立、开放的订阅转换客户端",
  icons: {
    icon: siteConfig.branding.faviconUrl,
    shortcut: siteConfig.branding.faviconUrl,
    apple: siteConfig.branding.logoUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b10" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* Apply the theme before paint so it does not flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const v=localStorage.getItem('nya.theme')||'system';const m=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',v==='dark'||(v==='system'&&m));}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <LocaleProvider>
            <AppDataProvider>
              <AppShell>{children}</AppShell>
            </AppDataProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
