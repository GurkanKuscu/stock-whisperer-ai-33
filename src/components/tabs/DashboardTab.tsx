import { useState, useEffect } from "react";
import { useAppData } from "@/context/AppContext";
import { fetchMarket, fetchBistChart } from "@/services/api";
import { usePrices } from "@/hooks/usePrices";
import LiveBadge from "@/components/LiveBadge";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface MarketItem {
  label: string;
  value: number;
  change: number;
  symbol: string;
}

const SYMBOL_MAP: Record<string, string> = {
  "BIST100": "xu100",
  "BIST30": "xu030",
  "USD/TRY": "usdtry",
  "EUR/TRY": "eurtry",
  "ALTIN (GR)": "altin",
  "BRENT": "brent",
};

export default function DashboardTab({ onTickerClick }: { onTickerClick?: (ticker: string) => void }) {
  const { data } = useAppData();
  const [market, setMarket] = useState<MarketItem[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [chartPeriod, setChartPeriod] = useState("1A");
  const [chartSymbol, setChartSymbol] = useState("xu100");
  const [chartLabel, setChartLabel] = useState("BIST100");
  const [chartLoading, setChartLoading] = useState(true);

  const tickers = Object.keys(data);
  
  // Live prices for dashboard tickers
  const { prices: livePrices, lastUpdate, isStale, borsaOpen } = usePrices(tickers);
  
  // Enrich data with live prices
  const enriched: Record<string, any> = {};
  tickers.forEach(t => {
    const lp = livePrices[t] && livePrices[t] > 0 ? livePrices[t] : data[t].close;
    enriched[t] = { ...data[t], close: lp };
  });
  useEffect(() => {
    fetchMarket()
      .then(m => {
        const items: MarketItem[] = [
          { label: "BIST100", value: m.BIST100?.value ?? 0, change: m.BIST100?.change_pct ?? 0, symbol: "xu100" },
          { label: "BIST30", value: m.BIST30?.value ?? 0, change: m.BIST30?.change_pct ?? 0, symbol: "xu030" },
          { label: "USD/TRY", value: m.USDTRY?.value ?? 0, change: m.USDTRY?.change_pct ?? 0, symbol: "usdtry" },
          { label: "EUR/TRY", value: m.EURTRY?.value ?? 0, change: m.EURTRY?.change_pct ?? 0, symbol: "eurtry" },
          { label: "ALTIN (GR)", value: m.ALTIN?.value ?? 0, change: m.ALTIN?.change_pct ?? 0, symbol: "altin" },
          { label: "BRENT", value: m.BRENT?.value ?? 0, change: m.BRENT?.change_pct ?? 0, symbol: "brent" },
        ];
        setMarket(items);
      })
      .catch(() => {})
      .finally(() => setMarketLoading(false));
  }, []);

  useEffect(() => {
    setChartLoading(true);
    fetchBistChart(chartPeriod, chartSymbol)
      .then(d => {
        if (d.dates && d.closes) {
          setChartData(d.dates.map((dt, i) => ({ date: dt, value: d.closes[i] })));
        }
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));
  }, [chartPeriod, chartSymbol]);

  // Sistem durumu
  const confirmed = tickers.filter(t => enriched[t].confirmed && enriched[t].score >= 70).length;
  const pending = tickers.filter(t => enriched[t].pending && enriched[t].score >= 60).length;
  const izleme = tickers.filter(t => !enriched[t].confirmed && !enriched[t].pending && enriched[t].score >= 55).length;
  const bullish = tickers.filter(t => enriched[t].score >= 60).length;
  const breadth = tickers.length > 0 ? Math.round((bullish / tickers.length) * 100) : 0;

  // En iyi sinyaller
  const topSignals = [...tickers]
    .sort((a, b) => enriched[b].score - enriched[a].score)
    .slice(0, 6)
    .map(t => ({ ticker: t, ...enriched[t] }));

  // Sektör gücü
  const sektorMap: Record<string, { toplam: number; count: number }> = {};
  tickers.forEach(t => {
    const s = enriched[t].sector_name;
    if (!s) return;
    if (!sektorMap[s]) sektorMap[s] = { toplam: 0, count: 0 };
    sektorMap[s].toplam += enriched[t].score || 0;
    sektorMap[s].count += 1;
  });
  const sektorSirali = Object.entries(sektorMap)
    .map(([ad, d]) => ({ ad, ort: Math.round(d.toplam / d.count) }))
    .sort((a, b) => b.ort - a.ort)
    .slice(0, 8);

  // Günlük değişim hesapla
  const withChange = tickers
    .filter(t => enriched[t].prev_close && enriched[t].prev_close! > 0 && enriched[t].close > 0)
    .map(t => {
      const d = enriched[t];
      const chg = ((d.close - d.prev_close!) / d.prev_close!) * 100;
      return { ticker: t, close: d.close, chg, sector_name: d.sector_name };
    });

  const topGainers = [...withChange].sort((a, b) => b.chg - a.chg).slice(0, 6);
  const topLosers = [...withChange].sort((a, b) => a.chg - b.chg).slice(0, 6);

  // Hacim Liderleri — hacimTL = volume * close
  const topVolume = [...tickers]
    .filter(t => (enriched[t].volume ?? 0) > 0 && enriched[t].close > 0)
    .map(t => {
      const d = enriched[t];
      const hacimTL = (d.volume ?? 0) * d.close;
      const chg = d.prev_close && d.prev_close > 0 ? ((d.close - d.prev_close) / d.prev_close) * 100 : 0;
      return { ticker: t, hacimTL, chg };
    })
    .sort((a, b) => b.hacimTL - a.hacimTL)
    .slice(0, 6);

  const fmtVol = (v: number) => v >= 1e9 ? (v / 1e9).toFixed(1) + " Mr ₺" : (v / 1e6).toFixed(0) + " Mn ₺";

  // KAP haberleri
  const kapHaberler = tickers
    .flatMap(t => (enriched[t].kap_haberler ?? []).map((h: any) => ({ ...h, ticker: t })))
    .filter((h: any) => h?.baslik)
    .sort((a: any, b: any) => (b.tarih ?? "").localeCompare(a.tarih ?? ""))
    .slice(0, 8);

  const systemStats = [
    { label: "ONAYLI", val: confirmed, color: "#2CC98A" },
    { label: "BEKLEYEN", val: pending, color: "#F59E0B" },
    { label: "İZLEME", val: izleme, color: "#60a5fa" },
    { label: "PİYASA GENİŞLİĞİ", val: `${breadth}%`, color: "#94a3b8" },
  ];

  // Alarmlar
  const alarms: { icon: string; title: string; sub: string; type: string }[] = [];
  Object.entries(enriched).forEach(([ticker, s]: [string, any]) => {
    if (s.confirmed && s.score >= 80) alarms.push({ icon: "🟢", title: `${ticker} — Güçlü Sinyal`, sub: `Skor: ${s.score}`, type: "new" });
    if (s.tavan_kapat) alarms.push({ icon: "🔔", title: `${ticker} — Tavan`, sub: `${s.close.toFixed(2)} ₺`, type: "tavan" });
    if (s.manip_detected) alarms.push({ icon: "⚠️", title: `${ticker} — Manip`, sub: "Anormal hacim", type: "seri" });
    if (s.rsi > 70) alarms.push({ icon: "📊", title: `${ticker} — Aşırı Alım`, sub: `RSI: ${s.rsi}`, type: "strong" });
  });


  return (
    <div className="animate-fade-in">
      {/* Live badge */}
      <div className="flex justify-end mb-2">
        <LiveBadge lastUpdate={lastUpdate} isStale={isStale} borsaOpen={borsaOpen} />
      </div>
      {/* 1. BIST100 Grafik + Piyasa Özeti üstte */}
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-2 mb-3">
        {/* Sol: Piyasa ticker bar + Grafik */}
        <div className="rounded-xl" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          {/* Piyasa Özeti — yatay bar */}
          <div className="flex flex-wrap gap-0" style={{ borderBottom: "0.5px solid #2d3748" }}>
            {marketLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-1 min-w-[100px] p-[10px_14px] animate-pulse" style={{ borderRight: i < 5 ? "0.5px solid #2d3748" : "none" }}>
                    <div className="h-3 bg-t-bg4 rounded w-12 mb-1" />
                    <div className="h-4 bg-t-bg4 rounded w-16" />
                  </div>
                ))
              : market.map((item, i) => (
                  <div key={i} className={`flex-1 min-w-[100px] p-[10px_14px] transition-all ${item.symbol === "xu100" ? "cursor-pointer hover:bg-[rgba(255,255,255,.03)]" : ""}`}
                    onClick={() => { if (item.symbol === "xu100") { setChartSymbol(item.symbol); setChartLabel(item.label); } }}
                    style={{
                      borderRight: i < market.length - 1 ? "0.5px solid #2d3748" : "none",
                      background: chartSymbol === item.symbol ? "rgba(201,148,58,.06)" : "transparent",
                      borderBottom: chartSymbol === item.symbol ? "2px solid #C9943A" : "2px solid transparent",
                    }}>
                    <div className="text-[9px] mb-0.5" style={{ color: chartSymbol === item.symbol ? "#C9943A" : "#64748b" }}>{item.label}</div>
                    <div className="text-[15px] font-medium" style={{ color: "#e2e8f0" }}>
                      {item.value > 0 ? item.value.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : "—"}
                    </div>
                    <div className="text-[10px]" style={{ color: item.change >= 0 ? "#2CC98A" : "#E05252" }}>
                      {item.change >= 0 ? "+" : ""}{item.change?.toFixed(2)}%
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Grafik header + chart */}
          <div className="p-3.5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[11px]" style={{ color: "#64748b" }}>{chartLabel}</div>
                <div className="text-[22px] font-medium" style={{ color: "#e2e8f0" }}>
                  {(() => { const sel = market.find(m => m.symbol === chartSymbol); return sel && sel.value > 0 ? sel.value.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : "—"; })()}
                  {(() => { const sel = market.find(m => m.symbol === chartSymbol); return sel ? <span className="text-[13px] ml-2" style={{ color: sel.change >= 0 ? "#2CC98A" : "#E05252" }}>{sel.change >= 0 ? "+" : ""}{sel.change?.toFixed(2)}%</span> : null; })()}
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
                      formatter={(v: number) => [v.toLocaleString("tr-TR", { maximumFractionDigits: 2 }), chartLabel]} />
                    <Area type="monotone" dataKey="value" stroke="#2CC98A" strokeWidth={2} fill="url(#bistGradient)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[11px]" style={{ color: "#64748b" }}>Grafik verisi bulunamadı</div>
              )}
            </div>
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


      {/* 3. Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2 mb-3">
        {/* En İyi Sinyaller */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px]" style={{ color: "#64748b" }}>EN İYİ SİNYALLER</div>
          {topSignals.map((s, i) => (
            <div key={i} className="flex justify-between py-[5px]" style={{ borderBottom: "0.5px solid #1e2535" }}>
              <div>
                <div className="text-[13px] font-medium cursor-pointer hover:underline" style={{ color: "#e2e8f0" }} onClick={() => onTickerClick?.(s.ticker)}>{s.ticker}</div>
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
                <div className="text-[13px] font-medium cursor-pointer hover:underline" style={{ color: "#e2e8f0" }} onClick={() => onTickerClick?.(s.ticker)}>{s.ticker}</div>
                <div className="text-[10px]" style={{ color: s.chg >= 0 ? "#2CC98A" : "#E05252" }}>
                  {s.chg >= 0 ? "+" : ""}{s.chg.toFixed(2)}%
                </div>
              </div>
              <div className="text-[12px] font-medium font-mono" style={{ color: "#e2e8f0" }}>
                {fmtVol(s.hacimTL)}
              </div>
            </div>
          ))}
        </div>

        {/* En Çok Yükselenler */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px]" style={{ color: "#64748b" }}>EN ÇOK YÜKSELENLER 📈</div>
          {topGainers.map((s, i) => (
            <div key={i} className="flex justify-between items-center py-[5px]" style={{ borderBottom: "0.5px solid #1e2535" }}>
              <div>
                <div className="text-[13px] font-medium cursor-pointer hover:underline" style={{ color: "#e2e8f0" }} onClick={() => onTickerClick?.(s.ticker)}>{s.ticker}</div>
                <div className="text-[10px]" style={{ color: "#64748b" }}>{s.sector_name ?? ""}</div>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-mono" style={{ color: "#e2e8f0" }}>{s.close.toFixed(2)} ₺</div>
                <div className="text-[11px] font-medium" style={{ color: "#2CC98A" }}>+{s.chg.toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* En Çok Düşenler */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px]" style={{ color: "#64748b" }}>EN ÇOK DÜŞENLER 📉</div>
          {topLosers.map((s, i) => (
            <div key={i} className="flex justify-between items-center py-[5px]" style={{ borderBottom: "0.5px solid #1e2535" }}>
              <div>
                <div className="text-[13px] font-medium cursor-pointer hover:underline" style={{ color: "#e2e8f0" }} onClick={() => onTickerClick?.(s.ticker)}>{s.ticker}</div>
                <div className="text-[10px]" style={{ color: "#64748b" }}>{s.sector_name ?? ""}</div>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-mono" style={{ color: "#e2e8f0" }}>{s.close.toFixed(2)} ₺</div>
                <div className="text-[11px] font-medium" style={{ color: "#E05252" }}>{s.chg.toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Alt Bölüm — 3 Sütun: Alarmlar, KAP, Piyasa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Alarmlar */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px] flex items-center gap-1.5" style={{ color: "#64748b" }}>
            🔔 ALARMLAR
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#1e293b" }}>{alarms.length}</span>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }} className="space-y-1">
            {alarms.slice(0, 10).map((a, i) => (
              <div key={i} className="p-2 rounded-lg" style={{ background: "#0f1117", borderLeft: `2px solid ${a.type === "new" ? "#2CC98A" : a.type === "tavan" ? "#F59E0B" : a.type === "seri" ? "#E05252" : "#60a5fa"}` }}>
                <div className="text-[11px] font-medium truncate" style={{ color: "#e2e8f0" }}>{a.icon} {a.title}</div>
                <div className="text-[9px] mt-0.5" style={{ color: "#64748b" }}>{a.sub}</div>
              </div>
            ))}
            {alarms.length === 0 && <div className="text-[11px] py-4 text-center" style={{ color: "#64748b" }}>Aktif alarm yok</div>}
          </div>
        </div>

        {/* KAP Haberleri */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px] flex items-center gap-1.5" style={{ color: "#64748b" }}>
            📰 KAP HABERLERİ
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#1e293b" }}>{kapHaberler.length}</span>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }} className="space-y-1">
            {kapHaberler.slice(0, 10).map((h: any, i: number) => {
              const href = h.url ?? h.link;
              const inner = (
                <div key={i} className="p-2 rounded-lg hover:bg-[#1a2235]" style={{ background: "#0f1117" }}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-bold font-mono px-1.5 py-px rounded" style={{ background: "#1e293b", color: "#60a5fa" }}>{h.ticker}</span>
                    {h.kaynak && <span className="text-[8px] px-1 py-px rounded" style={{ background: "#1e293b", color: "#94a3b8" }}>{h.kaynak}</span>}
                  </div>
                  <div className="text-[10px] leading-[1.5] truncate" style={{ color: "#e2e8f0" }}>{h.baslik}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "#475569" }}>{h.tarih}</div>
                </div>
              );
              return href
                ? <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="no-underline block">{inner}</a>
                : <div key={i}>{inner}</div>;
            })}
            {kapHaberler.length === 0 && <div className="text-[11px] py-4 text-center" style={{ color: "#64748b" }}>KAP haberi yok</div>}
          </div>
        </div>

        {/* Piyasa Durumu */}
        <div className="rounded-xl p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[10px] mb-2 tracking-[0.5px] flex items-center gap-1.5" style={{ color: "#64748b" }}>
            📊 PİYASA DURUMU
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }} className="space-y-1.5">
            {market.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-lg" style={{ background: "#0f1117" }}>
                <div>
                  <div className="text-[10px] font-semibold" style={{ color: "#94a3b8" }}>{item.label}</div>
                  <div className="text-[14px] font-medium font-mono" style={{ color: "#e2e8f0" }}>
                    {item.value > 0 ? item.value.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : "—"}
                  </div>
                </div>
                <div className="text-[11px] font-bold" style={{ color: item.change >= 0 ? "#2CC98A" : "#E05252" }}>
                  {item.change >= 0 ? "+" : ""}{item.change?.toFixed(2)}%
                </div>
              </div>
            ))}
            {/* Piyasa genişliği */}
            <div className="p-2 rounded-lg" style={{ background: "#0f1117" }}>
              <div className="text-[10px] font-semibold mb-1" style={{ color: "#94a3b8" }}>Piyasa Genişliği</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[4px] rounded-full" style={{ background: "#2d3748" }}>
                  <div className="h-full rounded-full" style={{ width: `${breadth}%`, background: breadth > 50 ? "#2CC98A" : "#F59E0B" }} />
                </div>
                <span className="text-[12px] font-bold font-mono" style={{ color: breadth > 50 ? "#2CC98A" : "#F59E0B" }}>{breadth}%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {systemStats.slice(0, 3).map((s, i) => (
                <div key={i} className="text-center p-1.5 rounded-lg" style={{ background: "#0f1117" }}>
                  <div className="text-[16px] font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-[8px]" style={{ color: "#64748b" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
