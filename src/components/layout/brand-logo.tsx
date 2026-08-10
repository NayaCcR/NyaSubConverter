"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Branding, LayoutStyle } from "@/lib/site-config";

/**
 * Brand mark + wordmark. Falls back to a tinted tile with `logoFallbackText`
 * when no logo is configured or the image fails to load, so a fresh clone of
 * the template never renders a broken image.
 */
export function BrandLogo({
  branding,
  variant,
  href = "/",
  showWordmark = true,
  subtitle,
  className,
}: {
  branding: Branding;
  variant: LayoutStyle;
  href?: string;
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
}) {
  const size = branding.logoSize[variant];

  return (
    <Link href={href} className={cn("flex min-w-0 items-center gap-3", className)}>
      <BrandMark branding={branding} size={size} />
      {showWordmark && (
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate font-semibold text-primary",
              variant === "sidebar" ? "text-lg" : "text-sm"
            )}
          >
            {branding.appName}
          </span>
          {subtitle && (
            <span className="block truncate text-[11px] uppercase text-muted-foreground">{subtitle}</span>
          )}
        </span>
      )}
    </Link>
  );
}

export function BrandMark({ branding, size }: { branding: Branding; size: number }) {
  const [failed, setFailed] = useState(false);
  const dimension = { width: size, height: size };

  if (branding.logoUrl && !failed) {
    return (
      <Image
        src={branding.logoUrl}
        alt={branding.appName}
        width={size}
        height={size}
        style={dimension}
        onError={() => setFailed(true)}
        className="shrink-0 rounded-md object-contain"
      />
    );
  }

  return (
    <span
      style={dimension}
      className="grid shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
      aria-label={branding.appName}
    >
      {branding.logoFallbackText}
    </span>
  );
}
