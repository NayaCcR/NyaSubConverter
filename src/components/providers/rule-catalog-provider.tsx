"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAppData } from "./app-data-provider";
import { catalogUrl, fetchRuleCatalog, readCatalogCache, writeCatalogCache, type CatalogSnapshot } from "@/lib/rule-catalog";

type CatalogState = { snapshot?: CatalogSnapshot; loading: boolean; error: string; storageWarning: boolean; fromCache: boolean };
type CatalogContext = CatalogState & {
  refresh: () => void;
  selectedConfig: string | null;
  selectForConversion: (url: string) => void;
  clearSelection: () => void;
};
const Context = createContext<CatalogContext | null>(null);
const empty: CatalogState = { loading: false, error: "", storageWarning: false, fromCache: false };

export function RuleCatalogProvider({ children }: { children: React.ReactNode }) {
  const { ready, settings } = useAppData();
  const [state, setState] = useState<CatalogState>(empty);
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const sequence = useRef(0);
  const latest = useRef<CatalogSnapshot>();
  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);
  const clearSelection = useCallback(() => setSelectedConfig(null), []);

  useEffect(() => {
    if (!ready) return;
    const requestId = ++sequence.current;
    let url: string;
    try { url = catalogUrl(settings.ruleCatalogUrl || "/rules/catalog.json", window.location.href); }
    catch (error) {
      setState({ ...empty, error: error instanceof Error ? error.message : "规则目录地址无效" });
      return;
    }
    const cached = latest.current?.url === url ? latest.current : readCatalogCache(url);
    latest.current = cached;
    setState({ ...empty, snapshot: cached, loading: true, fromCache: Boolean(cached) });
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    fetchRuleCatalog(url, controller.signal).then((snapshot) => {
      if (sequence.current !== requestId) return;
      latest.current = snapshot;
      const stored = writeCatalogCache(snapshot);
      setState({ ...empty, snapshot, storageWarning: !stored });
    }).catch((error: unknown) => {
      if (sequence.current !== requestId) return;
      setState({ ...empty, snapshot: cached, fromCache: Boolean(cached), error: controller.signal.aborted ? "拉取超时，请稍后重试。" : error instanceof Error ? error.message : "拉取失败，请检查网络和跨域设置。" });
    }).finally(() => window.clearTimeout(timer));
    return () => { sequence.current = requestId + 1; controller.abort(); window.clearTimeout(timer); };
  }, [ready, settings.ruleCatalogUrl, refreshToken]);

  return <Context.Provider value={{ ...state, refresh, selectedConfig, selectForConversion: setSelectedConfig, clearSelection }}>{children}</Context.Provider>;
}

export function useRuleCatalog() {
  const context = useContext(Context);
  if (!context) throw new Error("useRuleCatalog requires RuleCatalogProvider");
  return context;
}
