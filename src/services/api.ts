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

export async function fetchStatus(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error("Status fetch failed");
  return res.json();
}
