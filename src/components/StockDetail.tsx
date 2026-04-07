import { useState, useEffect } from "react";
import { useAppData } from "@/context/AppContext";
import { fetchStockChart } from "@/services/api";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { StockData } from "@/types/stock";
import AddToPortfolioModal from "@/components/AddToPortfolioModal";

interface Props {
  ticker: string;
  onBack: () => void;
}

export default function StockDetail({ ticker, onBack }: Props) {
  const { data } = useAppData();
  const snap = data[ticker] as StockData | undefined;

  const [chartType, setChartType] = useState<"fiyat" | "hacim">("fiyat");
  const [showAddModal, setShowAddModal] = useState(false);
  const [period, setPeriod] = useState("1A");
  const [chartData, setChartData] = useState<{ date: string; value: number; volume?: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    setChartLoading(true);
    fetchStockChart(ticker, period)
      .then(d => {
        if (d.dates && d.closes) {
          setChartData(d.dates.map((dt, i) => ({
            date: dt,
            value: d.closes[i],
            volume: d.volumes?.[i] ?? 0,
          })));
        }
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));
  }, [ticker, period]);

  if (!snap) {
    return (
      <div className="text-center p-10">
        <p className="text-t-txt3">Hisse verisi bulunamadı</p>
        <button onClick={onBack} className="mt-4 text-t-accent hover:underline">← Geri</button>
      </div>
    );
  }

  const close = snap.close ?? 0;
  const prevClose = snap.prev_close ?? close;
  const change = snap.change ?? (close - prevClose);
  const changePct = snap.change_pct ?? (prevClose > 0 ? ((close - prevClose) / prevClose) * 100 : 0);
  const isPositive = changePct >= 0;

  const low = snap.low ?? close;
  const high = snap.high ?? close;
  const priceRange = high - low;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl"
        style={{ background: "#131720", border: "1px solid #1e2535" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border-none cursor-pointer transition-all hover:opacity-80"
            style={{ background: "#1e293b", color: "#94a3b8" }}>
            ← Geri
          </button>
          <div>
            <div className="text-[20px] font-medium" style={{ color: "#e2e8f0" }}>{ticker}</div>
            <div className="text-[12px]" style={{ color: "#64748b" }}>{snap.sector_name ?? ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold border-none cursor-pointer transition-all hover:opacity-80"
            style={{ background: "rgba(59,130,246,.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,.25)" }}>
            + Portföye Ekle
          </button>
          <div className="text-right">
            <div className="text-[28px] font-medium" style={{ color: "#e2e8f0" }}>
              {close.toFixed(2)} ₺
            </div>
            <div className="text-[14px]" style={{ color: isPositive ? "#2CC98A" : "#E05252" }}>
              {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePct.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex gap-2">
            {(["fiyat", "hacim"] as const).map(t => (
              <button key={t} onClick={() => setChartType(t)}
                className="border-none cursor-pointer text-[11px] font-semibold px-3 py-1 rounded-md transition-all"
                style={{
                  background: chartType === t ? "#C9943A" : "transparent",
                  color: chartType === t ? "#000" : "#64748b",
                }}>
                {t === "fiyat" ? "Fiyat" : "Hacim"}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {["1H", "1A", "3A", "6A", "1Y"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="border-none cursor-pointer text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all"
                style={{
                  background: period === p ? "#C9943A" : "transparent",
                  color: period === p ? "#000" : "#64748b",
                }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[220px]">
          {chartLoading ? (
            <div className="h-full flex items-center justify-center text-t-txt3 text-[12px]">Grafik yükleniyor...</div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-t-txt3 text-[12px]">Grafik verisi bulunamadı</div>
          ) : chartType === "fiyat" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9943A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9943A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  orientation="right" tickFormatter={v => v.toLocaleString("tr-TR")} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #2d3748", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }} formatter={(v: number) => [v.toFixed(2) + " ₺", "Fiyat"]} />
                <Area type="monotone" dataKey="value" stroke="#C9943A" strokeWidth={2} fill={`url(#grad-${ticker})`} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  orientation="right" tickFormatter={v => (v / 1e6).toFixed(0) + "M"} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #2d3748", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [(v / 1e6).toFixed(2) + "M", "Hacim"]} />
                <Bar dataKey="volume" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gün Özeti + Piyasa Bilgisi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Gün Özeti */}
        <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>GÜN ÖZETİ</div>
          {/* Düşük-Yüksek bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] mb-1" style={{ color: "#64748b" }}>
              <span>Düşük: {low.toFixed(2)} ₺</span>
              <span>Yüksek: {high.toFixed(2)} ₺</span>
            </div>
            <div className="h-1 rounded-full relative" style={{ background: "#2d3748" }}>
              <div className="absolute w-2 h-2 rounded-full -top-0.5"
                style={{
                  background: "#e2e8f0",
                  left: priceRange > 0 ? `${((close - low) / priceRange) * 100}%` : "50%",
                }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["Açılış", (snap.open ?? close).toFixed(2) + " ₺"],
              ["Önceki Kapanış", prevClose.toFixed(2) + " ₺"],
              ["Hacim", snap.volume ? (snap.volume / 1e6).toFixed(1) + "M" : (snap.avg_vol_tl / 1e6).toFixed(1) + "M"],
              ["Değişim", (isPositive ? "+" : "") + change.toFixed(2)],
            ] as [string, string][]).map(([label, val]) => (
              <div key={label}>
                <div className="text-[10px]" style={{ color: "#64748b" }}>{label}</div>
                <div className="text-[13px] font-medium" style={{ color: "#e2e8f0" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Piyasa Bilgisi */}
        <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>PİYASA BİLGİSİ</div>
          {([
            ["Piyasa Değeri", snap.market_cap ? (snap.market_cap / 1e9).toFixed(2) + " Mr ₺" : "—"],
            ["F/K Oranı", snap.fk != null ? String(snap.fk) : "—"],
            ["PD/DD", snap.pddd != null ? String(snap.pddd) : "—"],
            ["52H Yüksek", snap.week52_high ? snap.week52_high.toFixed(2) + " ₺" : "—"],
            ["52H Düşük", snap.week52_low ? snap.week52_low.toFixed(2) + " ₺" : "—"],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} className="flex justify-between py-[5px]" style={{ borderBottom: "0.5px solid #1e2535" }}>
              <span className="text-[12px]" style={{ color: "#64748b" }}>{label}</span>
              <span className="text-[12px] font-medium" style={{ color: "#e2e8f0" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BISThinker Analizi */}
      <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>BISThinker ANALİZİ</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {([
            ["SKOR", snap.score + "p", snap.score >= 70 ? "#2CC98A" : snap.score >= 50 ? "#F59E0B" : "#E05252"],
            ["RSI", snap.rsi?.toFixed(1) ?? "—", "#e2e8f0"],
            ["STOP", snap.stop_loss ? snap.stop_loss.toFixed(2) + " ₺" : "—", "#E05252"],
            ["HEDEF", snap.target ? snap.target.toFixed(2) + " ₺" : "—", "#2CC98A"],
          ] as [string, string, string][]).map(([label, val, color]) => (
            <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: "#0f1117" }}>
              <div className="text-[10px]" style={{ color: "#64748b" }}>{label}</div>
              <div className="text-[16px] font-medium" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>
        {snap.kombine_karar && (
          <div className="mt-3 text-[12px] p-2.5 rounded-lg" style={{ background: "#0f1117", color: "#94a3b8" }}>
            {snap.kombine_karar}
          </div>
        )}
      </div>

      {/* KAP Haberleri */}
      {snap.kap_haberler && snap.kap_haberler.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>KAP HABERLERİ</div>
          {snap.kap_haberler.map((h, i) => (
            <div key={i} className="py-1.5" style={{ borderBottom: "0.5px solid #1e2535" }}>
              <div className="text-[12px]" style={{ color: "#e2e8f0" }}>
                {h.url || h.link ? (
                  <a href={h.url ?? h.link} target="_blank" rel="noopener" className="hover:underline" style={{ color: "#e2e8f0" }}>
                    {h.baslik}
                  </a>
                ) : h.baslik}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>{h.tarih}</div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddToPortfolioModal
          ticker={ticker}
          price={close}
          stop={snap.stop_loss ?? 0}
          target={snap.target ?? 0}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
