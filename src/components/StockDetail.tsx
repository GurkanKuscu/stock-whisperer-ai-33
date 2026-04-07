import { useState, useEffect, useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { fetchStockChart } from "@/services/api";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell
} from "recharts";
import type { StockData } from "@/types/stock";
import AddToPortfolioModal from "@/components/AddToPortfolioModal";

interface Props {
  ticker: string;
  onBack: () => void;
}

// SMA hesaplama
function calcSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

// RSI hesaplama
function calcRSI(closes: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return rsi;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) avgGain += diff; else avgLoss -= diff;
  }
  avgGain /= period; avgLoss /= period;
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return rsi;
}

// MACD hesaplama
function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) ema.push(data[i] * k + ema[i - 1] * (1 - k));
  return ema;
}

function calcMACD(closes: number[]) {
  if (closes.length < 26) return { macd: [], signal: [], histogram: [] };
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calcEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macd: macdLine, signal: signalLine, histogram };
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

  // Teknik göstergeler
  const indicators = useMemo(() => {
    if (chartData.length < 2) return { rsi: [], macd: [], signal: [], histogram: [], sma20: [], sma50: [] };
    const closes = chartData.map(d => d.value);
    const rsi = calcRSI(closes);
    const { macd, signal, histogram } = calcMACD(closes);
    const sma20 = calcSMA(closes, 20);
    const sma50 = calcSMA(closes, 50);
    return { rsi, macd, signal, histogram, sma20, sma50 };
  }, [chartData]);

  const enrichedData = useMemo(() => chartData.map((d, i) => ({
    ...d,
    sma20: indicators.sma20[i],
    sma50: indicators.sma50[i],
    rsi: indicators.rsi[i],
    macd: indicators.macd[i],
    macdSignal: indicators.signal[i],
    macdHist: indicators.histogram[i],
  })), [chartData, indicators]);

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

  // Dinamik grafik rengi
  const chartColor = isPositive ? "#2CC98A" : "#E05252";

  const tooltipStyle = { background: "#1e293b", border: "1px solid #2d3748", borderRadius: 8, fontSize: 12 };

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

      {/* Fiyat Grafiği */}
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
              <AreaChart data={enrichedData}>
                <defs>
                  <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  orientation="right" tickFormatter={v => v.toLocaleString("tr-TR")} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#94a3b8" }}
                  formatter={(v: number, name: string) => {
                    if (name === "sma20") return [v?.toFixed(2), "SMA 20"];
                    if (name === "sma50") return [v?.toFixed(2), "SMA 50"];
                    return [v?.toFixed(2) + " ₺", "Fiyat"];
                  }} />
                <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill={`url(#grad-${ticker})`} dot={false} />
                <Line type="monotone" dataKey="sma20" stroke="#C9943A" strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls />
                <Line type="monotone" dataKey="sma50" stroke="#E05252" strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrichedData}>
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  orientation="right" tickFormatter={v => (v / 1e6).toFixed(0) + "M"} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v: number) => [(v / 1e6).toFixed(2) + "M", "Hacim"]} />
                <Bar dataKey="volume" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* SMA Lejant */}
        {chartType === "fiyat" && chartData.length > 0 && (
          <div className="flex gap-4 mt-2 text-[10px]" style={{ color: "#64748b" }}>
            <span><span className="inline-block w-3 h-[2px] mr-1 align-middle" style={{ background: chartColor }} />Fiyat</span>
            <span><span className="inline-block w-3 h-[2px] mr-1 align-middle" style={{ background: "#C9943A", borderTop: "1px dashed #C9943A" }} />SMA 20</span>
            <span><span className="inline-block w-3 h-[2px] mr-1 align-middle" style={{ background: "#E05252", borderTop: "1px dashed #E05252" }} />SMA 50</span>
          </div>
        )}
      </div>

      {/* RSI Paneli */}
      {enrichedData.some(d => d.rsi != null) && (
        <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>RSI (14)</div>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrichedData}>
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 9 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 9 }} tickLine={false} axisLine={false}
                  orientation="right" ticks={[0, 30, 50, 70, 100]} />
                <ReferenceLine y={70} stroke="#E05252" strokeDasharray="3 3" strokeWidth={1} />
                <ReferenceLine y={30} stroke="#2CC98A" strokeDasharray="3 3" strokeWidth={1} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v: number) => [v?.toFixed(1), "RSI"]} />
                <Line type="monotone" dataKey="rsi" stroke="#C9943A" strokeWidth={1.5} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MACD Paneli */}
      {enrichedData.some(d => d.macd != null && d.macd !== 0) && (
        <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>MACD (12, 26, 9)</div>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={enrichedData}>
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 9 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#475569", fontSize: 9 }} tickLine={false} axisLine={false}
                  orientation="right" />
                <ReferenceLine y={0} stroke="#2d3748" strokeWidth={1} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v: number, name: string) => {
                    const label = name === "macd" ? "MACD" : name === "macdSignal" ? "Sinyal" : "Histogram";
                    return [v?.toFixed(3), label];
                  }} />
                <Bar dataKey="macdHist" fill="#C9943A" opacity={0.6} radius={[1, 1, 0, 0]} />
                <Line type="monotone" dataKey="macd" stroke="#2CC98A" strokeWidth={1.5} dot={false} connectNulls />
                <Line type="monotone" dataKey="macdSignal" stroke="#E05252" strokeWidth={1.5} dot={false} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 text-[10px]" style={{ color: "#64748b" }}>
            <span><span className="inline-block w-3 h-[2px] mr-1 align-middle" style={{ background: "#2CC98A" }} />MACD</span>
            <span><span className="inline-block w-3 h-[2px] mr-1 align-middle" style={{ background: "#E05252" }} />Sinyal</span>
            <span><span className="inline-block w-3 h-[2px] mr-1 align-middle" style={{ background: "#C9943A" }} />Histogram</span>
          </div>
        </div>
      )}

      {/* Gün Özeti + BISThinker Analizi + Piyasa Bilgisi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gün Özeti */}
        <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>GÜN ÖZETİ</div>
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

        {/* BISThinker Analizi */}
        <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>BISThinker ANALİZİ</div>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["SKOR", snap.score + "p", snap.score >= 70 ? "#2CC98A" : snap.score >= 50 ? "#F59E0B" : "#E05252"],
              ["RSI", snap.rsi?.toFixed(1) ?? "—", snap.rsi < 30 ? "#2CC98A" : snap.rsi > 70 ? "#E05252" : "#e2e8f0"],
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
            <div className="mt-3 text-[12px] p-2.5 rounded-lg" style={{
              background: "#0f1117",
              color: snap.kombine_karar.includes("GİRİLEBİLİR") || snap.kombine_karar.includes("GÜÇLÜ") ? "#2CC98A"
                : snap.kombine_karar.includes("DİKKATLİ") ? "#F59E0B"
                : snap.kombine_karar.includes("BEKLE") ? "#F97316"
                : snap.kombine_karar.includes("GİRME") ? "#E05252"
                : "#94a3b8"
            }}>
              {snap.kombine_karar}
            </div>
          )}
        </div>

        {/* Piyasa Bilgisi */}
        <div className="rounded-xl p-4" style={{ background: "#131720", border: "1px solid #1e2535" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>PİYASA BİLGİSİ</div>
          {([
            ["Piyasa Değeri", snap.market_cap ? (snap.market_cap / 1e9).toFixed(2) + " Br ₺" : "—"],
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
