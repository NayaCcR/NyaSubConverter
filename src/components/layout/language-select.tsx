"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";

export function LanguageSelect() {
  const { locale, locales, setLocale } = useI18n();

  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-muted/35 px-2 text-xs text-muted-foreground">
      <Languages className="h-4 w-4 shrink-0" />
      <select
        aria-label="Language"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className="bg-transparent text-xs outline-none"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  );
}
