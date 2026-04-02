import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import SignalCard from "@/components/SignalCard";
import AddToPortfolioModal from "@/components/AddToPortfolioModal";
import MarketSummaryPanel from "@/components/MarketSummaryPanel";

export default function SignalsTab() {
  const { data } = useAppData();
  const [addTicker, setAddTicker] = useState<string | null>(null);
  const [filter, setFilter] = useState<"top10" | "confirmed" | "pending" | "watchlist">("top10");

  const tickers = Object.keys(data);
  const top10 = [...tickers].sort((a, b) => data[b].score - data[a].score).slice(0, 10);
  const confirmed = tickers.filter(t => data[t].confirmed && data[t].score >= 70).sort((a, b) => data[b].score - data[a].score);
  const pending = tickers.filter(t => data[t].pending && !data[t].confirmed && data[t].score >= 60).sort((a, b) => data[b].score - data[a].score);
  const watchlist = tickers.filter(t => !data[t].confirmed && !data[t].pending && data[t].score >= 55).sort((a, b) => data[b].score - data[a].score);

  const lists = { top10, confirmed, pending, watchlist };
  const current = lists[filter];

  const tabs = [
    { id: "top10" as const, icon: "🏆", label: "Top 10", count: top10.length, sub: "En yüksek skorlu 10 hisse" },
    { id: "confirmed" as const, icon: "✅", label: "Onaylı Sinyaller", count: confirmed.length, sub: "Giriş değerlendirilebilir · Teknik ve temel onaylı" },
    { id: "pending" as const, icon: "⏳", label: "Bekleyen Sinyaller", count: pending.length, sub: "Onay bekliyor · İzlemeye alın" },
    { id: "watchlist" as const, icon: "👁️", label: "İzleme Listesi", count: watchlist.length, sub: "Potansiyel fırsatlar" },
  ];

  const activeTab = tabs.find(t => t.id === filter)!;

  return (
    <div>
      {/* Section Header with filter tabs */}
      <div className="flex items-center justify-between mb-[18px] mt-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px]"
            style={{ background: "var(--green-bg)", border: "1px solid var(--green-bdr)" }}>
            {activeTab.icon}
          </div>
          <div>
            <h2 className="font-syne text-[15px] font-bold text-t-txt tracking-[-0.1px]">{activeTab.label}</h2>
            <p className="text-[11px] text-t-txt3 mt-[1px]">{activeTab.sub}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`px-3 py-[7px] rounded-lg text-[11.5px] font-semibold cursor-pointer transition-all ${
                filter === t.id
                  ? "text-t-txt bg-t-bg4"
                  : "text-t-txt2 bg-t-bg3 hover:bg-t-bg4 hover:text-t-txt"
              }`}
              style={{ border: `1px solid ${filter === t.id ? "var(--bdr2)" : "var(--bdr)"}` }}>
              {t.icon} {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      {current.length === 0 ? (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">📊</div>
          <div className="text-[14px] font-bold text-t-txt2 mb-[5px]">Bu kategoride sinyal yok</div>
          <div className="text-[11px]">Diğer kategorileri kontrol edin</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 animate-fade-in">
          {filter === "top10"
            ? current.map((ticker, index) => (
                <div key={ticker} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-mono text-t-txt"
                    style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-d))", boxShadow: "0 2px 8px rgba(201,148,58,.4)" }}>
                    {index + 1}
                  </div>
                  <SignalCard ticker={ticker} stock={data[ticker]} onAddPortfolio={setAddTicker} />
                </div>
              ))
            : current.map(ticker => (
                <SignalCard key={ticker} ticker={ticker} stock={data[ticker]} onAddPortfolio={setAddTicker} />
              ))
          }
        </div>
      )}

      {addTicker && (
        <AddToPortfolioModal
          ticker={addTicker}
          price={data[addTicker]?.close ?? 0}
          stop={data[addTicker]?.stop_loss ?? 0}
          target={data[addTicker]?.target ?? 0}
          onClose={() => setAddTicker(null)}
        />
      )}

      <MarketSummaryPanel />
    </div>
  );
}
