// Sektör adı -> emoji + renkli arka plan
// Eşleşme case-insensitive, kısmi anahtar kelime tabanlı.

export interface SectorVisual {
  emoji: string;
  bg: string; // background HSL/HEX
  fg: string; // foreground (emoji rengi etrafı)
}

const RAW: Array<{ keys: string[]; v: SectorVisual }> = [
  { keys: ["banka", "bankacılık", "finansal kiralama", "faktoring"], v: { emoji: "🏦", bg: "#1e293b", fg: "#60a5fa" } },
  { keys: ["holding"], v: { emoji: "🏢", bg: "#1f2937", fg: "#a78bfa" } },
  { keys: ["sigorta"], v: { emoji: "🛡️", bg: "#1e2535", fg: "#7dd3fc" } },
  { keys: ["gayrimenkul", "gyo", "inşaat"], v: { emoji: "🏗️", bg: "#2a2317", fg: "#fbbf24" } },
  { keys: ["çimento", "cimento", "yapı malzeme"], v: { emoji: "🧱", bg: "#2a1f17", fg: "#f59e0b" } },
  { keys: ["otomotiv", "otomobil", "araç"], v: { emoji: "🚗", bg: "#1f1a2e", fg: "#c084fc" } },
  { keys: ["havayolu", "ulaştırma", "ulastirma", "lojistik"], v: { emoji: "✈️", bg: "#1a2535", fg: "#7ec8f7" } },
  { keys: ["telekom", "iletişim"], v: { emoji: "📡", bg: "#1e293b", fg: "#38bdf8" } },
  { keys: ["teknoloji", "yazılım", "bilişim", "bilgisayar", "elektronik"], v: { emoji: "💻", bg: "#1a2030", fg: "#22d3ee" } },
  { keys: ["savunma"], v: { emoji: "🛡️", bg: "#1f2520", fg: "#84cc16" } },
  { keys: ["enerji", "elektrik", "petrol", "akaryakıt"], v: { emoji: "⚡", bg: "#2a2410", fg: "#facc15" } },
  { keys: ["madencilik", "altın", "maden"], v: { emoji: "⛏️", bg: "#2a1e10", fg: "#f59e0b" } },
  { keys: ["demir", "çelik", "metal", "döküm"], v: { emoji: "🏭", bg: "#202020", fg: "#94a3b8" } },
  { keys: ["kimya", "petrokimya", "ilaç", "ilac"], v: { emoji: "🧪", bg: "#1e2a25", fg: "#34d399" } },
  { keys: ["gıda", "içecek", "tarım", "et", "süt"], v: { emoji: "🍞", bg: "#2a2010", fg: "#fbbf24" } },
  { keys: ["perakende", "ticaret", "mağaza"], v: { emoji: "🛒", bg: "#1f2a1f", fg: "#86efac" } },
  { keys: ["tekstil", "giyim", "deri"], v: { emoji: "👕", bg: "#2a1a25", fg: "#f472b6" } },
  { keys: ["plastik", "ambalaj", "kağıt"], v: { emoji: "📦", bg: "#1f2a2a", fg: "#67e8f9" } },
  { keys: ["sağlık", "hastane"], v: { emoji: "🏥", bg: "#2a1a1a", fg: "#fb7185" } },
  { keys: ["turizm", "otel", "konaklama"], v: { emoji: "🏨", bg: "#1f2030", fg: "#a5b4fc" } },
  { keys: ["medya", "yayıncılık"], v: { emoji: "📺", bg: "#2a1f2a", fg: "#e879f9" } },
  { keys: ["spor"], v: { emoji: "⚽", bg: "#1a2a1f", fg: "#4ade80" } },
];

const FALLBACK: SectorVisual = { emoji: "📊", bg: "#1e2535", fg: "#94a3b8" };

const cache = new Map<string, SectorVisual>();

export function sectorVisual(sector?: string | null): SectorVisual {
  if (!sector) return FALLBACK;
  const key = sector.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;
  for (const { keys, v } of RAW) {
    if (keys.some(k => key.includes(k))) {
      cache.set(key, v);
      return v;
    }
  }
  cache.set(key, FALLBACK);
  return FALLBACK;
}
