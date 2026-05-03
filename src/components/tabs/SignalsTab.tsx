import { useState, useEffect } from "react";
import GunYildizlariTab from "@/components/tabs/GunYildizlariTab";
import { useAppData } from "@/context/AppContext";
import { fetchSinyalArsiv } from "@/services/api";
import SignalCard from "@/components/SignalCard";
import AddToPortfolioModal from "@/components/AddToPortfolioModal";
import MarketSummaryPanel from "@/components/MarketSummaryPanel";
import { usePrices } from "@/hooks/usePrices";
import LiveBadge from "@/components/LiveBadge";

export default function SignalsTab({ onTickerClick }: { onTickerClick?: (ticker: string) => void }) {
  const { data } = useAppData();
  const [bugunSayisi, setBugunSayisi] = useState(0);
  useEffect(() => {
    fetchSinyalArsiv().then(arsiv => {
      const b = new Date();
      const bs = String(b.getDate()).padStart(2,"0") + "." + String(b.getMonth()+1).padStart(2,"0") + "." + b.getFullYear();
      const sayi = Object.values(arsiv).filter((r: any) => String(r.tarih) === bs && Number(r.skor ?? 0) >= 65).length; console.log("bugun:", bs, "sayi:", sayi); setBugunSayisi(sayi);
    }).catch(() => {});
  }, []);
  const [addTicker, setAddTicker] = useState<string | null>(null);
  const [filter, setFilter] = useState<"diamond" | "gold" | "silver" | "bronze" | "yildizlar" | "dikkatli" | "pending">("diamond");

  const tickers = Object.keys(data);
  
  // Live prices for all signal tickers
  const { prices: livePrices, lastUpdate, isStale, borsaOpen, flashTickers } = usePrices(tickers);
  
  // Merge live prices into data for display
  const enrichedData: typeof data = { ...data };
  tickers.forEach(t => {
    // snapshot_close zaten AppContext'te set edildi, sadece live price güncelle
    if (livePrices[t] && livePrices[t] > 0) {
      // Preserve original snapshot price as snapshot_close
      enrichedData[t] = { ...data[t], close: livePrices[t], snapshot_close: data[t].close } as any;
      // Recalculate change_pct based on prev_close
      if (data[t].prev_close && data[t].prev_close! > 0) {
        enrichedData[t].change_pct = ((livePrices[t] - data[t].prev_close!) / data[t].prev_close!) * 100;
        enrichedData[t].change = livePrices[t] - data[t].prev_close!;
      }
    }
  });

  const top10 = [...tickers].sort((a, b) => enrichedData[b].score - enrichedData[a].score).slice(0, 10);
  const confirmed = tickers.filter(t => enrichedData[t].confirmed && enrichedData[t].score >= 70).sort((a, b) => enrichedData[b].score - enrichedData[a].score);
  const dikkatli = tickers.filter(t => (enrichedData[t] as any).dikkatli === true).sort((a, b) => enrichedData[b].score - enrichedData[a].score);
  const pending = tickers.filter(t => enrichedData[t].pending && !enrichedData[t].confirmed && enrichedData[t].score >= 60).sort((a, b) => enrichedData[b].score - enrichedData[a].score);
  const watchlist = tickers.filter(t => !enrichedData[t].confirmed && !enrichedData[t].pending && enrichedData[t].score >= 60).sort((a, b) => enrichedData[b].score - enrichedData[a].score);

  const diamonds = tickers.filter(t => enrichedData[t].score >= 80 && enrichedData[t].confirmed && (enrichedData[t] as any).kombine_karar?.includes('GİRİLEBİLİR')).sort((a,b) => enrichedData[b].score - enrichedData[a].score);
  const golds = tickers.filter(t => enrichedData[t].score >= 70 && enrichedData[t].score < 80 && enrichedData[t].confirmed && (enrichedData[t] as any).kombine_karar?.includes('GİRİLEBİLİR')).sort((a,b) => enrichedData[b].score - enrichedData[a].score);
  const silvers = tickers.filter(t => enrichedData[t].score >= 65 && enrichedData[t].score < 70 && (enrichedData[t] as any).kombine_karar?.includes('GİRİLEBİLİR') || (enrichedData[t] as any).kombine_karar?.includes('DİKKATLİ')).sort((a,b) => enrichedData[b].score - enrichedData[a].score);
  const bronzes = tickers.filter(t => enrichedData[t].score >= 60 && enrichedData[t].score < 65 && (enrichedData[t] as any).kombine_karar?.includes('GİRİLEBİLİR') || (enrichedData[t] as any).kombine_karar?.includes('DİKKATLİ')).sort((a,b) => enrichedData[b].score - enrichedData[a].score);
  const lists = { diamond: diamonds,
    gold: golds,
    silver: silvers,
    bronze: bronzes,
    yildizlar: [] as string[], top10, confirmed, dikkatli, pending, watchlist };
  const current = lists[filter];

  const tabs = [
    { id: "diamond" as const, icon: "💎", label: "Diamond", count: diamonds.length, sub: "Skor ≥80 + AI:GİR" },
    { id: "gold" as const, icon: "⭐", label: "Altın", count: golds.length, sub: "Skor 70-79 + AI:GİR" },
    { id: "silver" as const, icon: "🥈", label: "Gümüş", count: silvers.length, sub: "Skor 65-69 + AI:GİR" },
    { id: "bronze" as const, icon: "🥉", label: "Bronz", count: bronzes.length, sub: "Skor 60-64 + AI:GİR" },
    { id: "yildizlar" as const, icon: "⭐", label: "Günün Yıldızları", count: bugunSayisi, sub: "Günlük sinyal takibi" },
    { id: "dikkatli" as const, icon: "🔍", label: "Dikkatli", count: dikkatli.length, sub: "Dikkatli değerlendirme gerektiren sinyaller" },
    { id: "pending" as const, icon: "⏳", label: "Bekleyen", count: pending.length, sub: "Onay bekliyor · İzlemeye alın" },
  ];

  const activeTab = tabs.find(t => t.id === filter)!;

  return (
    <div>
      <div className="flex items-center justify-between mb-[18px] mt-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px]"
            style={{ background: filter === "dikkatli" ? "rgba(245,158,11,.08)" : "var(--green-bg)", border: filter === "dikkatli" ? "1px solid rgba(245,158,11,.25)" : "1px solid var(--green-bdr)" }}>
            {activeTab.icon}
          </div>
          <div>
            <h2 className="font-syne text-[15px] font-bold text-t-txt tracking-[-0.1px]">{activeTab.label}</h2>
            <p className="text-[11px] text-t-txt3 mt-[1px]">{activeTab.sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <LiveBadge lastUpdate={lastUpdate} isStale={isStale} borsaOpen={borsaOpen} />
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)}
                className={`px-3 py-[7px] rounded-lg text-[11.5px] font-semibold cursor-pointer transition-all ${
                  filter === t.id
                    ? "text-t-txt bg-t-bg4"
                    : "text-t-txt2 bg-t-bg3 hover:bg-t-bg4 hover:text-t-txt"
                }`}
                style={{
                  border: `1px solid ${filter === t.id ? (t.id === "dikkatli" ? "rgba(245,158,11,.3)" : "var(--bdr2)") : "var(--bdr)"}`,
                  ...(filter === t.id && t.id === "dikkatli" ? { background: "rgba(245,158,11,.08)" } : {})
                }}>
                {t.icon} {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {filter === "yildizlar" ? (
        <GunYildizlariTab />
      ) : current.length === 0 ? (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">{filter === "dikkatli" ? "🔍" : "📊"}</div>
          <div className="text-[14px] font-bold text-t-txt2 mb-[5px]">
            {filter === "dikkatli" ? "Şu an dikkatli sinyal yok." : "Bu kategoride sinyal yok"}
          </div>
          <div className="text-[11px]">Diğer kategorileri kontrol edin</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-2 animate-fade-in">
          {filter === "top10"
            ? current.map((ticker, index) => (
                <div key={ticker} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-mono text-t-txt"
                    style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-d))", boxShadow: "0 2px 8px rgba(201,148,58,.4)" }}>
                    {index + 1}
                  </div>
                  <div className={flashTickers[ticker] ? `animate-flash-${flashTickers[ticker]}` : ""}>
                    <SignalCard ticker={ticker} stock={enrichedData[ticker]} onAddPortfolio={setAddTicker} onTickerClick={onTickerClick} />
                  </div>
                </div>
              ))
            : filter === "dikkatli"
            ? current.map(ticker => (
                <div key={ticker} className="relative">
                  <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: "rgba(245,158,11,.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,.25)" }}>
                    🔍 DİKKATLİ
                  </div>
                  <div className={flashTickers[ticker] ? `animate-flash-${flashTickers[ticker]}` : ""}>
                    <SignalCard ticker={ticker} stock={enrichedData[ticker]} onAddPortfolio={setAddTicker} onTickerClick={onTickerClick} />
                  </div>
                </div>
              ))
            : current.map(ticker => (
                <div key={ticker} className={flashTickers[ticker] ? `animate-flash-${flashTickers[ticker]}` : ""}>
                  <SignalCard key={ticker} ticker={ticker} stock={enrichedData[ticker]} onAddPortfolio={setAddTicker} onTickerClick={onTickerClick} />
                </div>
              ))
          }
        </div>
      )}

      {addTicker && (
        <AddToPortfolioModal
          ticker={addTicker}
          price={enrichedData[addTicker]?.close ?? 0}
          stop={enrichedData[addTicker]?.stop_loss ?? 0}
          target={enrichedData[addTicker]?.target ?? 0}
          onClose={() => setAddTicker(null)}
        />
      )}

      {filter !== "yildizlar" && <MarketSummaryPanel />}
    </div>
  );
}
