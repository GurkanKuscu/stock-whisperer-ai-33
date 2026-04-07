import { useState, useEffect } from "react";
import { useAppData } from "@/context/AppContext";
import { fetchMarket, fetchBistChart } from "@/services/api";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface MarketItem {
  label: string;
  value: number;
  change: number;
}

export default function DashboardTab() {
  const { data } = useAppData();
  const [market, setMarket] = useState<MarketItem[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [chartPeriod, setChartPeriod] = useState("1A");
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    fetchMarket()
      .then(m => {
        const items: MarketItem[] = [
          { label: "BIST100", value: m.xu100?.value ?? 0, change: m.xu100?.change_pct ?? 0 },
          { label: "BIST30", value: m.xu030?.value ?? 0, change: m.xu030?.change_pct ?? 0 },
          { label: "USD/TRY", value: m.usdtry?.value ?? 0, change: m.usdtry?.change_pct ?? 0 },
          { label: "EUR/TRY", value: m.eurtry?.value ?? 0, change: m.eurtry?.change_pct ?? 0 },
          { label: "ALTIN (GR)", value: m.altin?.value ?? 0, change: m.altin?.change_pct ?? 0 },
          { label: "BRENT", value: m.brent?.value ?? 0, change: m.brent?.change_pct ?? 0 },
        ];
        setMarket(items);
      })
      .catch(() => {})
      .finally(() => setMarketLoading(false));
  }, []);

  useEffect(() => {
    setChartLoading(true);
    fetchBistChart(chartPeriod)
      .then(d => {
        if (d.dates && d.closes) {
          setChartData(d.dates.map((dt, i) => ({ date: dt, value: d.closes[i] })));
        }
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));
  }, [chartPeriod]);

  const tickers = Object.keys(data);

  // Sistem durumu
  const confirmed = tickers.filter(t => data[t].confirmed && data[t].score >= 70).length;
  const pending = tickers.filter(t => data[t].pending && data[t].score >= 60).length;
  const izleme = tickers.filter(t => !data[t].confirmed && !data[t].pending && data[t].score >= 55).length;
  const bullish = tickers.filter(t => data[t].score >= 60).length;
  const breadth = tickers.length > 0 ? Math.round((bullish / tickers.length) * 100) : 0;

  // En iyi sinyaller
  const topSignals = [...tickers]
    .sort((a, b) => data[b].score - data[a].score)
    .slice(0, 6)
    .map(t => ({ ticker: t, ...data[t] }));

  // Sektör gücü
  const sektorMap: Record<string, { toplam: number; count: number }> = {};
  tickers.forEach(t => {
    const s = data[t].sector_name;
    if (!s) return;
    if (!sektorMap[s]) sektorMap[s] = { toplam: 0, count: 0 };
    sektorMap[s].toplam += data[t].score || 0;
    sektorMap[s].count += 1;
  });
  const sektorSirali = Object.entries(sektorMap)
    .map(([ad, d]) => ({ ad, ort: Math.round(d.toplam / d.count) }))
    .sort((a, b) => b.ort - a.ort)
    .slice(0, 8);

  // Hacim liderleri
  const topVolume = [...tickers]
    .filter(t => data[t].avg_vol_tl > 0)
    .sort((a, b) => data[b].avg_vol_tl - data[a].avg_vol_tl)
    .slice(0, 6)
    .map(t => ({ ticker: t, avg_vol_tl: data[t].avg_vol_tl, chg: data[t].perf_1d ?? 0 }));

  // KAP haberleri
  const kapHaberler = tickers
    .flatMap(t => (data[t].kap_haberler ?? []).map(h => ({ ...h, ticker: t })))
    .filter(h => h?.baslik)
    .sort((a, b) => (b.tarih ?? "").localeCompare(a.tarih ?? ""))
    .slice(0, 8);

  const systemStats = [
    { label: "ONAYLI", val: confirmed, color: "#2CC98A" },
    { label: "BEKLEYEN", val: pending, color: "#F59E0B" },
    { label: "İZLEME", val: izleme, color: "#60a5fa" },
    { label: "BREADTH", val: `${breadth}%`, color: "#94a3b8" },
  ];

  return (
    <div className="animate-fade-in">
      {/* 1. Piyasa Özeti */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mb-3">
        {marketLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
                <div className="h-4 bg-t-bg4 rounded w-16 mb-2" />
                <div className="h-6 bg-t-bg4 rounded w-20" />
              </div>
            ))
          : market.map((item, i) => (
              <div key={i} className="rounded-xl p-[12px_16px]" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
                <div className="text-[10px] mb-1" style={{ color: "#64748b" }}>{item.label}</div>
                <div className="text-[20px] font-medium" style={{ color: "#e2e8f0" }}>
                  {item.value > 0 ? item.value.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : "—"}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: item.change >= 0 ? "#2CC98A" : "#E05252" }}>
                  {item.change >= 0 ? "+" : ""}{item.change?.toFixed(2)}%
                </div>
              </div>
            ))
        }
      </div>

      {/* 2. BIST100 Grafik + Sistem Durumu */}
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-2 mb-3">
        {/* Sol: BIST100 Grafik */}
        <div className="rounded-xl p-3.5" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[11px]" style={{ color: "#64748b" }}>BIST 100</div>
              <div className="text-[22px] font-medium" style={{ color: "#e2e8f0" }}>
                {market[0]?.value > 0 ? market[0].value.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : "—"}
                {market[0] && (
                  <span className="text-[13px] ml-2" style={{ color: market[0].change >= 0 ? "#2CC98A" : "#E05252" }}>
                    {market[0].change >= 0 ? "+" : ""}{market[0].change?.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {["1H", "1A", "3A", "6A", "1Y"].map(p => (
                <button key={p} onClick={() => setChartPeriod(p)}
                  className="border-none cursor-pointer"
                  style={{
                    padding: "3px 8px", borderRadius: 6, fontSize: 11,
                    background: chartPeriod === p ? "#C9943A" : "transparent",
                    color: chartPeriod === p ? "#000" : "#64748b",
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 160 }}>
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-[11px]" style={{ color: "#64748b" }}>Grafik yükleniyor...</div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="bistGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2CC98A" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2CC98A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={(v: string) => { const parts = v.split("-"); return parts.length >= 2 ? `${parts[2] ?? ""}/${parts[1]}` : v; }}
                    interval="preserveStartEnd" minTickGap={40} />
                  <YAxis orientation="right" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                    domain={["dataMin - 100", "dataMax + 100"]}
                    tickFormatter={(v: number) => v.toLocaleString("tr-TR")} width={55} />
                  <Tooltip
                    contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#64748b" }}
                    formatter={(v: number) => [v.toLocaleString("tr-TR", { maximumFractionDigits: 2 }), "BIST100"]} />
                  <Area type="monotone" dataKey="value" stroke="#2CC98A" strokeWidth={2} fill="url(#bistGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[11px]" style={{ color: "#64748b" }}>Grafik verisi bulunamadı</div>
            )}
          </div>
        </div>

        {/* Sağ: Sistem Durumu */}
        <div className="grid grid-cols-2 gap-1.5">
          {systemStats.map((item, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
              <div className="text-[26px] font-medium" style={{ color: item.color }}>{item.val}</div>
              <div className="text-[10px] mt-1 tracking-[0.5px]" style={{ color: "#64748b" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>


      {/* 3. Üçlü Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        {/* En İyi Sinyaller */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px]" style={{ color: "#64748b" }}>EN İYİ SİNYALLER</div>
          {topSignals.map((s, i) => (
            <div key={i} className="flex justify-between py-[5px]" style={{ borderBottom: "0.5px solid #1e2535" }}>
              <div>
                <div className="text-[13px] font-medium" style={{ color: "#e2e8f0" }}>{s.ticker}</div>
                <div className="text-[10px]" style={{ color: "#64748b" }}>{s.sector_name} · RSI {s.rsi}</div>
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-[10px] px-[7px] py-[2px] rounded-[20px]"
                  style={{
                    background: s.confirmed ? "#0d2e1f" : "#1e2535",
                    color: s.confirmed ? "#2CC98A" : "#60a5fa"
                  }}>
                  {s.confirmed ? "✅" : "⏳"}
                </span>
                <span className="text-[11px] px-[7px] py-[2px] rounded-md" style={{ background: "#0f1117", color: "#e2e8f0" }}>
                  {s.score}p
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sektör Gücü */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px]" style={{ color: "#64748b" }}>SEKTÖR GÜCÜ</div>
          {sektorSirali.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 py-[3px]">
              <div className="text-[11px] w-[90px] shrink-0 truncate" style={{ color: "#94a3b8" }}>{s.ad}</div>
              <div className="flex-1 h-[3px] rounded-sm" style={{ background: "#2d3748" }}>
                <div className="h-full rounded-sm" style={{
                  width: `${Math.min(100, s.ort / 60 * 100)}%`,
                  background: s.ort >= 50 ? "#2CC98A" : s.ort >= 40 ? "#F59E0B" : "#475569"
                }} />
              </div>
              <div className="text-[10px] w-7 text-right" style={{
                color: s.ort >= 50 ? "#2CC98A" : s.ort >= 40 ? "#F59E0B" : "#64748b"
              }}>{s.ort}</div>
            </div>
          ))}
        </div>

        {/* Hacim Liderleri */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px]" style={{ color: "#64748b" }}>HACİM LİDERLERİ</div>
          {topVolume.map((s, i) => (
            <div key={i} className="flex justify-between items-center py-[5px]" style={{ borderBottom: "0.5px solid #1e2535" }}>
              <div>
                <div className="text-[13px] font-medium" style={{ color: "#e2e8f0" }}>{s.ticker}</div>
                <div className="text-[10px]" style={{ color: "#64748b" }}>{(s.avg_vol_tl / 1e6).toFixed(1)}M ₺</div>
              </div>
              <div className="text-[12px] font-medium" style={{ color: s.chg >= 0 ? "#2CC98A" : "#E05252" }}>
                {s.chg >= 0 ? "+" : ""}{s.chg?.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. KAP Haberleri */}
      <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
        <div className="text-[10px] mb-2.5 tracking-[0.5px]" style={{ color: "#64748b" }}>SON KAP HABERLERİ</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {kapHaberler.map((h: any, i: number) => {
            const href = h.url ?? h.link;
            const inner = (
              <div className="flex gap-2 items-start py-1.5" style={{ borderBottom: "0.5px solid #1e2535" }}>
                <span className="text-[11px] font-medium shrink-0" style={{ color: "#60a5fa" }}>{h.ticker ?? ""}</span>
                <div>
                  <div className="text-[11px] leading-relaxed" style={{ color: "#e2e8f0" }}>{h.baslik}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>{h.tarih}</div>
                </div>
              </div>
            );
            return href
              ? <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="no-underline">{inner}</a>
              : <div key={i}>{inner}</div>;
          })}
          {kapHaberler.length === 0 && (
            <div className="text-[11px] py-4 text-center" style={{ color: "#64748b" }}>KAP haberi bulunamadı</div>
          )}
        </div>
      </div>
    </div>
  );
}
