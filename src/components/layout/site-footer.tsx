"use client";

import { Github } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";
import { siteConfig, type Branding } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteFooter({
  branding,
  icpBeian,
  repositoryUrl,
  className,
}: {
  branding: Branding;
  icpBeian?: string | null;
  repositoryUrl?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const repo = repositoryUrl || siteConfig.footer.repositoryUrl;

  return (
    <footer
      className={cn(
        "border-t border-border bg-background px-4 py-5 text-xs text-muted-foreground",
        className
      )}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
          <span>{t("layout.footer.credit", { app: branding.appName, author: siteConfig.footer.author })}</span>
          {repo && (
            <a
              href={repo}
              target="_blank"
              rel="noreferrer"
              aria-label={t("layout.footer.repoLabel")}
              className="grid h-7 w-7 place-items-center rounded-md border border-border bg-muted/35 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="min-h-5 text-center">
          {icpBeian && (
            <a
              href="http://beian.miit.gov.cn"
              rel="external nofollow"
              target="_blank"
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {icpBeian}
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
          {siteConfig.footer.credits.map((credit) => (
            <a
              key={credit.url}
              href={credit.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <span aria-hidden="true">{credit.prefix}</span>
              <span>{t(credit.noteKey)}</span>
              <span className="font-medium text-foreground">{credit.label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
