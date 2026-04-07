export interface StockData {
  score: number;
  signal: string;
  close: number;
  prev_close?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  change?: number;
  change_pct?: number;
  market_cap?: number;
  week52_high?: number;
  week52_low?: number;
  stop_loss: number;
  target: number;
  rr_ratio: number;
  pos_pct: number;
  rsi: number;
  pump: string;
  squeeze: string;
  avg_vol_tl: number;
  holding_rec: number;
  sector_name: string;
  trend: string;
  smart_money: string;
  weekly_bull: boolean;
  confirmed: boolean;
  pending: boolean;
  sector_champion: boolean;
  inst_entry: boolean;
  early_rally: boolean;
  is_spec: boolean;
  manip_detected: boolean;
  tavan_kapat: boolean;
  tavan_seri: boolean;
  high_atr_risk: boolean;
  dikkatli?: boolean;
  // Fundamental
  fk?: number | null;
  pddd?: number | null;
  fd_favok?: number | null;
  roe?: number | null;
  net_borc?: number | null;
  fcf?: number | null;
  favok_marj?: number | null;
  temel_puan?: number | null;
  kombine_puan?: number | null;
  temel_sinyal?: string;
  kombine_karar?: string;
  // KAP
  kap_haberler?: KapHaber[];
  breakdown?: Record<string, number>;
  weekly_trend?: string;
  kap_badge?: string;
  // Performance
  perf_1d?: number;
  perf_5d?: number;
  perf_1m?: number;
  bist100_perf_5d?: number;
  sector_perf_5d?: number;
}

export interface KapHaber {
  baslik: string;
  kaynak: string;
  tarih: string;
  url?: string;
  link?: string;
}

export type SnapshotData = Record<string, StockData>;

export interface ArsivFile {
  ad: string;
  boyut: string;
}

export interface PortfolioStock {
  ticker: string;
  price: number;
  date: string;
  note: string;
  stop: number;
  target: number;
}

export interface Portfolio {
  name: string;
  stocks: PortfolioStock[];
  createdAt?: string;
}

export type PortfolioMap = Record<string, Portfolio>;
