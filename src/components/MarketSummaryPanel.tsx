import { useState, useEffect } from "react";
import { fetchMarket } from "@/services/api";
import { useAppData } from "@/context/AppContext";

const TABS = [
  { id: "endeks", icon: "📈", label: "Endeks & Döviz" },
  { id: "kap", icon: "📋", label: "KAP Duyuruları" },
];

const INDICES_FALLBACK = [
  { name: "BIST100", value: "9,842.15", change: "+1.24%", pos: true },
  { name: "BIST30", value: "10,156.30", change: "+1.08%", pos: true },
  { name: "USD/TRY", value: "38.42", change: "+0.15%", pos: false },
  { name: "EUR/TRY", value: "42.18", change: "+0.22%", pos: false },
  { name: "Altın (gr)", value: "3,215 ₺", change: "+0.85%", pos: true },
  { name: "Brent", value: "$74.20", change: "-0.32%", pos: false },
];

export default function MarketSummaryPanel() {
  const { data } = useAppData();
  const [activeTab, setActiveTab] = useState("endeks");
  const [indices, setIndices] = useState(INDICES_FALLBACK);

  useEffect(() => {
    fetchMarket()
      .then(d => {
        setIndices([
          { name: "BIST100",    value: d.BIST100?.value?.toLocaleString("tr-TR") ?? "—", change: `${(d.BIST100?.change_pct ?? 0) >= 0 ? "+" : ""}${d.BIST100?.change_pct?.toFixed(2) ?? "0"}%`, pos: (d.BIST100?.change_pct ?? 0) >= 0 },
          { name: "BIST30",     value: d.BIST30?.value?.toLocaleString("tr-TR") ?? "—",  change: `${(d.BIST30?.change_pct  ?? 0) >= 0 ? "+" : ""}${d.BIST30?.change_pct?.toFixed(2)  ?? "0"}%`, pos: (d.BIST30?.change_pct  ?? 0) >= 0 },
          { name: "USD/TRY",    value: d.USDTRY?.value?.toFixed(2) ?? "—",               change: `${(d.USDTRY?.change_pct  ?? 0) >= 0 ? "+" : ""}${d.USDTRY?.change_pct?.toFixed(2)  ?? "0"}%`, pos: (d.USDTRY?.change_pct  ?? 0) >= 0 },
          { name: "EUR/TRY",    value: d.EURTRY?.value?.toFixed(2) ?? "—",               change: `${(d.EURTRY?.change_pct  ?? 0) >= 0 ? "+" : ""}${d.EURTRY?.change_pct?.toFixed(2)  ?? "0"}%`, pos: (d.EURTRY?.change_pct  ?? 0) >= 0 },
          { name: "Altın (gr)", value: d.ALTIN?.value?.toLocaleString("tr-TR") ?? "—",   change: `${(d.ALTIN?.change_pct   ?? 0) >= 0 ? "+" : ""}${d.ALTIN?.change_pct?.toFixed(2)   ?? "0"}%`, pos: (d.ALTIN?.change_pct   ?? 0) >= 0 },
          { name: "Brent",      value: `$${d.BRENT?.value?.toFixed(2) ?? "—"}`,          change: `${(d.BRENT?.change_pct   ?? 0) >= 0 ? "+" : ""}${d.BRENT?.change_pct?.toFixed(2)   ?? "0"}%`, pos: (d.BRENT?.change_pct   ?? 0) >= 0 },
        ]);
      })
      .catch(() => {});
  }, []);

  const kapNews = Object.entries(data)
    .flatMap(([ticker, stock]) =>
      (stock.kap_haberler ?? []).map(h => ({ ...h, ticker }))
    )
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
    .slice(0, 20);

  return (
    <div className="mt-8 rounded-[22px] overflow-hidden"
      style={{ background: "var(--c-card)", border: "1px solid var(--bdr)", boxShadow: "0 1px 24px rgba(0,0,0,.3)" }}>
      
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3.5 border-b"
        style={{ background: "var(--bg2)", borderColor: "var(--bdr)" }}>
        <h3 className="font-syne text-[13px] font-bold text-t-txt">🏛️ Piyasa Özeti</h3>
        <span className="text-[10px] text-t-txt3 font-mono">CANLI</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--bdr)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-[11.5px] font-semibold cursor-pointer transition-all border-b-2 ${
              activeTab === t.id
                ? "text-t-txt border-t-accent"
                : "text-t-txt3 border-transparent hover:text-t-txt"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 animate-fade-in">
        {activeTab === "endeks" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {indices.map(idx => (
              <div key={idx.name} className="p-3.5 rounded-xl bg-t-bg3 border transition-colors hover:border-t-bg5"
                style={{ borderColor: "var(--bdr)" }}>
                <div className="text-[10px] text-t-txt3 font-semibold uppercase tracking-[.6px] mb-1.5">{idx.name}</div>
                <div className="font-mono text-[16px] font-bold text-t-txt mb-1">{idx.value}</div>
                <div className={`text-[11px] font-bold ${idx.pos ? "text-t-green" : "text-t-red"}`}>{idx.change}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "kap" && (
          <div className="flex flex-col gap-2">
            {kapNews.length === 0 ? (
              <div className="p-8 text-center text-t-txt3 text-[12px]">KAP haberi bulunamadı</div>
            ) : (
              kapNews.map((n, i) => {
                const href = n.url ?? n.link;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-t-bg3 border"
                    style={{ borderColor: "var(--bdr)" }}>
                    <span className="font-mono text-[11.5px] font-bold px-2 py-0.5 rounded bg-t-bg4 text-t-gold-l shrink-0 mt-0.5"
                      style={{ border: "1px solid var(--bdr2)" }}>{n.ticker}</span>
                    <div className="flex-1 min-w-0">
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[12px] text-t-txt2 leading-relaxed hover:text-t-txt transition-colors no-underline">
                          {n.baslik} ↗
                        </a>
                      ) : (
                        <div className="text-[12px] text-t-txt2 leading-relaxed">{n.baslik}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-t-blue-l"
                          style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.2)" }}>{n.kaynak}</span>
                        <span className="text-[10px] text-t-txt3 font-mono">{n.tarih}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
