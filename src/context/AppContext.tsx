import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { SnapshotData, PortfolioMap } from "@/types/stock";
import { fetchSnapshot, fetchPortfolio, savePortfolioAPI } from "@/services/api";
import { MOCK_DATA } from "@/data/mockData";

interface AppContextType {
  data: SnapshotData;
  loading: boolean;
  error: string | null;
  portfolios: PortfolioMap;
  setPortfolios: (p: PortfolioMap) => void;
  refresh: () => void;
}

const AppContext = createContext<AppContextType>({
  data: {},
  loading: true,
  error: null,
  portfolios: {},
  setPortfolios: () => {},
  refresh: () => {},
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await fetchSnapshot();
      setData(snap);
    } catch (e: any) {
      setError(e.message || "Veri yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
    <AppContext.Provider value={{ data, loading, error, portfolios, setPortfolios, refresh: loadData }}>
      {children}
    </AppContext.Provider>
  );
}
