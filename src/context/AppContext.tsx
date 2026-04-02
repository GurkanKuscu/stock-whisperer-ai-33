import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import type { SnapshotData, PortfolioMap } from "@/types/stock";
import { fetchSnapshot, fetchPortfolio, savePortfolioAPI, fetchStatus, fetchPrices } from "@/services/api";
import { MOCK_DATA } from "@/data/mockData";

interface AppContextType {
  data: SnapshotData;
  loading: boolean;
  error: string | null;
  portfolios: PortfolioMap;
  setPortfolios: (p: PortfolioMap) => void;
  refresh: () => void;
  isMockMode: boolean;
}

const AppContext = createContext<AppContextType>({
  data: {},
  loading: true,
  error: null,
  portfolios: {},
  setPortfolios: () => {},
  refresh: () => {},
  isMockMode: false,
});

export const useAppData = () => useContext(AppContext);

const PORTFOLIO_KEY = "bisthinker_portfolios";

function loadLocalPortfolios(): PortfolioMap {
  try {
    const s = localStorage.getItem(PORTFOLIO_KEY);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SnapshotData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolios, setPortfoliosState] = useState<PortfolioMap>(loadLocalPortfolios);
  const [isMockMode, setIsMockMode] = useState(false);
  const lastTaramaRef = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await fetchSnapshot();
      try {
        const tickers = Object.keys(snap);
        if (tickers.length > 0) {
          const prices = await fetchPrices(tickers);
          tickers.forEach(t => {
            if (prices[t] && prices[t] > 0) snap[t].close = prices[t];
          });
        }
      } catch {}
      setData(snap);
      setIsMockMode(false);
    } catch (e: any) {
      console.warn("API unavailable, using mock data:", e.message);
      setData(MOCK_DATA);
      setIsMockMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const dataInterval = setInterval(loadData, 5 * 60 * 1000);
    const statusInterval = setInterval(async () => {
      try {
        const status = await fetchStatus();
        const newTarama = status.last_tarama ?? null;
        if (newTarama && newTarama !== lastTaramaRef.current) {
          lastTaramaRef.current = newTarama;
          loadData();
        }
      } catch {}
    }, 60 * 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(statusInterval);
    };
  }, [loadData]);

  // Load portfolios from API, fallback to localStorage
  useEffect(() => {
    fetchPortfolio()
      .then(p => { if (p && Object.keys(p).length) setPortfoliosState(p); })
      .catch(() => {/* use localStorage version */});
  }, []);

  const setPortfolios = useCallback((p: PortfolioMap) => {
    setPortfoliosState(p);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(p));
    savePortfolioAPI(p).catch(() => {/* silent */});
  }, []);

  return (
    <AppContext.Provider value={{ data, loading, error, portfolios, setPortfolios, refresh: loadData, isMockMode }}>
      {children}
    </AppContext.Provider>
  );
}
