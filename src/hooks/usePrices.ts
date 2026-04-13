import { useState, useEffect, useRef, useCallback } from "react";
import { fetchPrices } from "@/services/api";

// Global cache shared across all hook instances
let globalCache: Record<string, number> = {};
let globalLastFetch = 0;
let globalFetchPromise: Promise<Record<string, number>> | null = null;
let globalLastUpdate: Date | null = null;
let globalIsStale = false;

const REFRESH_INTERVAL = 60_000; // 60 seconds
const STALE_TIME = 60_000;

function isBorsaOpen(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const h = now.getHours();
  const m = now.getMinutes();
  const mins = h * 60 + m;
  // 10:00 - 18:30
  return mins >= 600 && mins <= 1110;
}

export function usePrices(tickers: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>(globalCache);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(globalLastUpdate);
  const [isStale, setIsStale] = useState(globalIsStale);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const [flashTickers, setFlashTickers] = useState<Record<string, "up" | "down">>({});
  const tickersKey = tickers.sort().join(",");
  const tickersRef = useRef(tickers);
  tickersRef.current = tickers;

  const doFetch = useCallback(async () => {
    const current = tickersRef.current;
    if (!current.length) return;

    // Deduplicate concurrent fetches
    const now = Date.now();
    if (now - globalLastFetch < 5000 && globalFetchPromise) {
      try {
        const result = await globalFetchPromise;
        globalCache = { ...globalCache, ...result };
        setPrices({ ...globalCache });
        setLastUpdate(globalLastUpdate);
        setIsStale(false);
      } catch {}
      return;
    }

    globalLastFetch = now;
    globalFetchPromise = fetchPrices(current);

    try {
      const result = await globalFetchPromise;
      // Detect changes for flash
      const flashes: Record<string, "up" | "down"> = {};
      for (const t of current) {
        if (result[t] && globalCache[t] && result[t] !== globalCache[t]) {
          flashes[t] = result[t] > globalCache[t] ? "up" : "down";
        }
      }
      if (Object.keys(flashes).length > 0) {
        setPrevPrices({ ...globalCache });
        setFlashTickers(flashes);
        setTimeout(() => setFlashTickers({}), 500);
      }

      globalCache = { ...globalCache, ...result };
      globalLastUpdate = new Date();
      globalIsStale = false;
      setPrices({ ...globalCache });
      setLastUpdate(globalLastUpdate);
      setIsStale(false);
    } catch (e) {
      console.warn("Live prices fetch failed, using cached/snapshot prices");
      globalIsStale = true;
      setIsStale(true);
    } finally {
      globalFetchPromise = null;
    }
  }, []);

  useEffect(() => {
    if (!tickers.length) return;
    doFetch();

    const interval = setInterval(() => {
      if (isBorsaOpen()) {
        doFetch();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [tickersKey, doFetch]);

  const getPrice = useCallback((ticker: string, fallback: number): number => {
    return prices[ticker] && prices[ticker] > 0 ? prices[ticker] : fallback;
  }, [prices]);

  return { prices, getPrice, lastUpdate, isStale, flashTickers, borsaOpen: isBorsaOpen() };
}

// Timestamp badge component helper
export function formatLastUpdate(date: Date | null): string {
  if (!date) return "--:--:--";
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
