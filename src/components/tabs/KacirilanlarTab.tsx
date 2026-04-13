import { useState, useEffect } from "react";
import { fetchKacirilanFirsatlar } from "@/services/api";
import { usePrices } from "@/hooks/usePrices";
import LiveBadge from "@/components/LiveBadge";

interface Firsat {
  hisse: string;
  tarih: string;
  karar: string;
  teknik_skor: number;
  temel_puan: number;
  fiyat: number;
  guncel_fiyat: number;
  guncel_pct: number;
}

interface Rapor {
  tarih: string;
  icerik: string;
}

export default function KacirilanlarTab() {
  const [firsatlar, setFirsatlar] = useState<Record<string, Firsat>>({});
  const [raporlar, setRaporlar] = useState<Rapor[]>([]);
  const [acikRapor, setAcikRapor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKacirilanFirsatlar()
      .then((data) => {
        setFirsatlar(data.firsatlar || {});
        setRaporlar(data.raporlar || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Live prices for all firsatlar tickers
  const firsatTickers = [...new Set(Object.values(firsatlar).map(f => f.hisse))];
  const { prices: livePrices, lastUpdate, isStale, borsaOpen } = usePrices(firsatTickers);

  if (loading) {
    return (
      <div className="p-[80px_20px] text-center text-t-txt3">
        <div className="text-[44px] mb-4 animate-pulse">🎯</div>
        <div className="text-[14px] font-bold text-t-txt2">Kaçırılan fırsatlar yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-[80px_20px] text-center text-t-txt3">
        <div className="text-[44px] mb-4">⚠️</div>
        <div className="text-[14px] font-bold text-t-red mb-2">Bağlantı Hatası</div>
        <div className="text-[11px]">{error}</div>
      </div>
    );
  }

  const sortedFirsatlar = Object.entries(firsatlar).sort(
    ([, a], [, b]) => (b.teknik_skor || 0) - (a.teknik_skor || 0)
  );

  const getPctColor = (pct: number) => {
    if (pct >= 5) return "#E05252";
    if (pct <= -3) return "#2CC98A";
    return "#94a3b8";
  };

  const getPctIcon = (pct: number) => {
    if (pct >= 5) return "🔴";
    if (pct <= -3) return "🟢";
    return "⚪";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-[20px]">🎯</span>
        <h2 className="text-[16px] font-bold text-t-txt">Kaçırılan Fırsatlar</h2>
        <span className="text-[11px] text-t-txt3 ml-2">
          GİRME kararı verilmiş ama yükselen hisseler
        </span>
        <div className="ml-auto">
          <LiveBadge lastUpdate={lastUpdate} isStale={isStale} borsaOpen={borsaOpen} />
        </div>
      </div>

      {/* Haftalık Raporlar */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>📋 Haftalık Raporlar</h3>
        {raporlar.length > 0 ? (
          raporlar.map((r, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <button
                onClick={() => setAcikRapor(acikRapor === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 12px",
                  background: "#1e2535", border: "1px solid #334155",
                  borderRadius: 8, color: "#94a3b8", cursor: "pointer", fontSize: 12,
                }}
              >
                {acikRapor === i ? "▲" : "▶"} {r.tarih} Raporu
              </button>
              {acikRapor === i && (
                <pre style={{
                  background: "#0f172a", padding: 12, borderRadius: 8,
                  color: "#cbd5e1", fontSize: 11, whiteSpace: "pre-wrap", marginTop: 4,
                }}>
                  {r.icerik}
                </pre>
              )}
            </div>
          ))
        ) : (
          <div style={{ color: "#64748b", fontSize: 12, padding: "8px 12px" }}>
            Henüz haftalık rapor oluşmadı — her Pazar 12:00'de otomatik oluşur
          </div>
        )}
      </div>

      {/* Fırsatlar Tablosu */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--bdr)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-t-txt3 text-left" style={{ background: "var(--bg3)" }}>
                <th className="px-4 py-3 font-semibold">Hisse</th>
                <th className="px-3 py-3 font-semibold">Teknik</th>
                <th className="px-3 py-3 font-semibold">Karar</th>
                <th className="px-3 py-3 font-semibold text-right">Giriş₺</th>
                <th className="px-3 py-3 font-semibold text-right">Güncel₺</th>
                <th className="px-3 py-3 font-semibold text-right">Değişim</th>
                <th className="px-3 py-3 font-semibold">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {sortedFirsatlar.map(([key, f]) => {
                const livePrice = livePrices[f.hisse] && livePrices[f.hisse] > 0 ? livePrices[f.hisse] : f.guncel_fiyat;
                const livePct = f.fiyat > 0 ? ((livePrice - f.fiyat) / f.fiyat) * 100 : f.guncel_pct;
                return (
                <tr
                  key={key}
                  className="transition-colors hover:bg-t-bg3"
                  style={{ borderBottom: "1px solid var(--bdr)" }}
                >
                  <td className="px-4 py-3 font-bold text-[13px] text-t-txt">{f.hisse}</td>
                  <td className="px-3 py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{
                        background: f.teknik_skor >= 70 ? "#0d2e1f" : f.teknik_skor >= 50 ? "#2e2a0d" : "#1e2535",
                        color: f.teknik_skor >= 70 ? "#2CC98A" : f.teknik_skor >= 50 ? "#F59E0B" : "#94a3b8",
                      }}
                    >
                      {f.teknik_skor}p
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-t-txt3">{f.karar}</td>
                  <td className="px-3 py-3 text-right font-mono text-t-txt2">
                    {Number(f.fiyat).toFixed(2)}₺
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-t-txt">
                    {Number(livePrice).toFixed(2)}₺
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold" style={{ color: getPctColor(livePct) }}>
                    {getPctIcon(livePct)} {livePct >= 0 ? "+" : ""}{Number(livePct).toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 text-t-txt3">{f.tarih}</td>
                </tr>
                );
              })}
              {sortedFirsatlar.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-t-txt3 text-[13px]">
                    Henüz kaçırılan fırsat verisi yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
