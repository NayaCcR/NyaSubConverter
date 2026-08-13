"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/components/providers/theme-provider";
import { useI18n } from "@/components/providers/locale-provider";

const ORDER: ThemeMode[] = ["system", "light", "dark"];
const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      aria-label={t(`theme.${theme === "system" ? "system" : theme}`)}
      title={t(`theme.${theme === "system" ? "system" : theme}`)}
      onClick={() => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
      className="control-glow grid h-9 w-9 place-items-center rounded-lg border border-border/80 bg-muted/45 text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
