"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/locale-provider";

const LABELS: Record<string, string> = {
  "zh-CN": "简体中文",
  "en-US": "English",
};

export function LanguageSelect() {
  const { locale, locales, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("common.switchLanguage")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="control-glow inline-flex h-9 min-w-[116px] items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/45 px-2.5 text-xs text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
      >
        <Languages className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{LABELS[locale] ?? locale}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t("common.switchLanguage")}
          className="language-popover absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[170px] overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-1.5 text-popover-foreground shadow-2xl backdrop-blur-xl"
        >
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={locale === code}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-2.5 text-left text-xs transition-colors ${locale === code ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"}`}
            >
              <span>{LABELS[code] ?? code}</span>
              {locale === code && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
