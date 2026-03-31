import { useAppData } from "@/context/AppContext";
import type { SnapshotData } from "@/types/stock";

function getMarketStats(data: SnapshotData) {
  const tickers = Object.keys(data);
  const total = tickers.length;
  const confirmed = tickers.filter(t => data[t].confirmed && data[t].score >= 70).length;
  const pending = tickers.filter(t => data[t].pending && data[t].score >= 60).length;
  const bullish = tickers.filter(t => data[t].score >= 60).length;
  const breadth = total > 0 ? Math.round((bullish / total) * 100) : 0;
  const champions = tickers.filter(t => data[t].sector_champion).sort((a, b) => data[b].score - data[a].score).slice(0, 5);

  let sentiment: "bullish" | "neutral" | "bearish" = "neutral";
  let sentimentLabel = "⚠️ Kısmi Pozitif";
  let sentimentSub = "BIST100 Zayıf — Seçici Hareket";
  if (breadth > 50) { sentiment = "bullish"; sentimentLabel = "🟢 Güçlü Pozitif"; sentimentSub = "Geniş Tabanlı Yükseliş"; }
  else if (breadth < 20) { sentiment = "bearish"; sentimentLabel = "🔴 Negatif"; sentimentSub = "Risk Yüksek — Savunma"; }

  return { total, confirmed, pending, breadth, champions, sentiment, sentimentLabel, sentimentSub };
}

export default function MarketBar() {
  const { data, loading } = useAppData();
  if (loading) return (
    <div className="bg-t-card rounded-2xl mb-5 overflow-hidden relative" style={{ border: "1px solid var(--bdr)", boxShadow: "0 1px 24px rgba(0,0,0,.3)" }}>
      <div className="p-6 text-center text-t-txt3">Veriler yükleniyor...</div>
    </div>
  );

  const stats = getMarketStats(data);

  const sentBg = stats.sentiment === "bullish" ? "var(--green-bg)" : stats.sentiment === "bearish" ? "var(--red-bg)" : "var(--warn-bg)";
  const sentBdr = stats.sentiment === "bullish" ? "var(--green-bdr)" : stats.sentiment === "bearish" ? "var(--red-bdr)" : "var(--warn-bdr)";
  const sentColor = stats.sentiment === "bullish" ? "var(--c-green)" : stats.sentiment === "bearish" ? "var(--c-red)" : "var(--c-warn)";

  return (
    <div className="bg-t-card rounded-2xl mb-5 overflow-hidden relative" style={{ border: "1px solid var(--bdr)", boxShadow: "0 1px 24px rgba(0,0,0,.3)" }}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40"
        style={{ background: "linear-gradient(90deg, transparent 0%, var(--gold) 30%, var(--c-green) 70%, transparent 100%)" }} />

      {/* Strip */}
      <div className="flex items-center justify-between px-[18px] py-2.5 flex-wrap gap-2.5 bg-t-bg3" style={{ borderBottom: "1px solid var(--bdr)" }}>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-[20px] text-[10px] font-bold uppercase tracking-[.8px]"
          style={{ background: sentBg, border: `1px solid ${sentBdr}`, color: sentColor }}>
          {stats.sentimentLabel}
        </span>
        <span className="font-mono text-[12px] font-semibold text-t-txt2">{stats.sentimentSub}</span>
        <div className="flex items-center gap-4 text-[11px] text-t-txt3">
          <span>Taranan: <strong className="text-t-txt2">{stats.total}</strong></span>
          <span>Breadth: <strong className="text-t-txt2">%{stats.breadth}</strong></span>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
        {/* Info */}
        <div className="p-[14px_18px]" style={{ borderRight: "1px solid var(--bdr)" }}>
          <div className="flex items-center gap-2 text-[11px] text-t-txt2 mb-2.5 flex-wrap">
            <span>✅ Onaylı: {stats.confirmed}</span>
            <span className="w-[2px] h-[2px] bg-t-txt4 rounded-full" />
            <span>⏳ Bekleyen: {stats.pending}</span>
          </div>
          {stats.champions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-t-txt3 text-[10px] uppercase tracking-[.8px] font-semibold">Şampiyonlar:</span>
              <div className="flex gap-1 flex-wrap">
                {stats.champions.map(t => (
                  <span key={t} className="px-2 py-[2px] bg-t-bg4 rounded font-bold text-[11px] text-t-gold-l font-mono cursor-pointer transition-all hover:bg-[rgba(201,148,58,.15)]"
                    style={{ border: "1px solid var(--bdr2)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-px" style={{ background: "var(--bdr)" }}>
          <StatBox value={stats.confirmed.toString()} label="✅ Onaylı" cls={stats.confirmed > 0 ? "text-t-green" : ""} />
          <StatBox value={stats.pending.toString()} label="⏳ Bekleyen" cls={stats.pending > 0 ? "text-t-warn" : ""} />
          <StatBox value={`${stats.total} hisse tarandı`} label="Son güncelleme" small />
        </div>
      </div>
    </div>
  );
}

function StatBox({ value, label, cls = "", small }: { value: string; label: string; cls?: string; small?: boolean }) {
  return (
    <div className={`p-[14px_16px] bg-t-card text-center ${small ? "col-span-2" : ""}`}>
      <div className={`font-mono font-bold leading-none tracking-[-0.5px] ${small ? "text-[14px]" : "text-[20px]"} ${cls || "text-t-txt"}`}>
        {value}
      </div>
      <div className="text-[9px] text-t-txt3 font-semibold uppercase tracking-[.8px] mt-1">{label}</div>
    </div>
  );
}
