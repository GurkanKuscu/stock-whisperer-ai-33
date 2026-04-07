import type { SnapshotData, ArsivFile, PortfolioMap } from "@/types/stock";

const API_BASE = "http://207.154.212.100:8080";

export async function fetchSnapshot(): Promise<SnapshotData> {
  const res = await fetch(`${API_BASE}/api/snapshot`);
  if (!res.ok) throw new Error("Snapshot fetch failed");
  return res.json();
}

export async function fetchArsiv(): Promise<ArsivFile[]> {
  const res = await fetch(`${API_BASE}/api/arsiv`);
  if (!res.ok) throw new Error("Arsiv fetch failed");
  return res.json();
}

export function getDownloadUrl(filename: string): string {
  return `${API_BASE}/api/indir/${filename}`;
}

export async function fetchPortfolio(): Promise<PortfolioMap> {
  const res = await fetch(`${API_BASE}/api/portfolio`);
  if (!res.ok) throw new Error("Portfolio fetch failed");
  return res.json();
}

export async function savePortfolioAPI(data: PortfolioMap): Promise<void> {
  await fetch(`${API_BASE}/api/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function fetchStatus(): Promise<{ last_tarama?: string; status?: string }> {
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error("Status fetch failed");
  return res.json();
}

export async function fetchMarket(): Promise<Record<string, { value: number; change_pct: number }>> {
  const res = await fetch(`${API_BASE}/api/market`);
  if (!res.ok) throw new Error("Market fetch failed");
  return res.json();
}

export async function fetchPrices(tickers: string[]): Promise<Record<string, number>> {
  if (!tickers.length) return {};
  const res = await fetch(`${API_BASE}/api/prices?tickers=${tickers.join(",")}`);
  if (!res.ok) throw new Error("Prices fetch failed");
  return res.json();
}

export async function fetchSinyalArsiv(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/api/sinyal-arsiv`);
  if (!res.ok) throw new Error("Sinyal arsiv fetch failed");
  return res.json();
}

export async function deleteSinyalArsiv(key: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/sinyal-arsiv/${key}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

export async function fetchBistChart(period: string = "1A", symbol: string = "xu100"): Promise<{ dates: string[]; closes: number[] }> {
  const res = await fetch(`${API_BASE}/api/bist-chart?period=${period}&symbol=${symbol}`);
  if (!res.ok) throw new Error("BIST chart fetch failed");
  return res.json();
}

export async function fetchStockChart(ticker: string, period: string = "1A"): Promise<{ dates: string[]; closes: number[]; volumes?: number[] }> {
  const res = await fetch(`${API_BASE}/api/bist-chart?period=${period}&symbol=${ticker}`);
  if (!res.ok) throw new Error("Stock chart fetch failed");
  return res.json();
}
