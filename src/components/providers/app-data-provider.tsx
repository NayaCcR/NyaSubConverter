"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type AppSettings,
  type HistoryItem,
  type Profile,
  type Provider,
  defaultProfiles,
  defaultProviders,
  defaultSettings,
  normalizeOptions,
  normalizeSettings,
} from "@/lib/app-data";

type AppDataContextValue = {
  ready: boolean;
  providers: Provider[];
  profiles: Profile[];
  history: HistoryItem[];
  settings: AppSettings;
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);
const STORAGE_KEY = "nya-subconverter.data.v1";

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [providers, setProviders] = useState(defaultProviders);
  const [profiles, setProfiles] = useState(defaultProfiles);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.providers)) setProviders(data.providers);
        if (Array.isArray(data.profiles)) {
          setProfiles(data.profiles.map((profile: Profile) => ({ ...profile, ...normalizeOptions(profile) })));
        }
        if (Array.isArray(data.history)) setHistory(data.history);
        if (data.settings) setSettings(normalizeSettings(data.settings));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ providers, profiles, history, settings }));
  }, [ready, providers, profiles, history, settings]);

  const value = useMemo(
    () => ({ ready, providers, profiles, history, settings, setProviders, setProfiles, setHistory, setSettings }),
    [ready, providers, profiles, history, settings]
  );
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("useAppData must be used inside AppDataProvider");
  return value;
}
