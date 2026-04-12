import { useState, useEffect } from "react";
import { fetchFinansAnaliz, deleteFinansAnaliz } from "@/services/api";
import { useAppData } from "@/context/AppContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AnalizItem {
  tarih: string;
  ticker?: string;
  analiz?: string;
  sinyal_zamani?: string;
  temel_puan?: number;
  [key: string]: any;
}

export default function FinansAnaliziTab() {
  const [analizData, setAnalizData] = useState<Record<string, AnalizItem>>({});
  const [loading, setLoading] = useState(true);
  const { portfolios, setPortfolios } = useAppData();

  const loadData = () => {
    setLoading(true);
    fetchFinansAnaliz()
      .then(d => setAnalizData(d))
      .catch(() => setAnalizData({}))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (key: string) => {
    try {
      await deleteFinansAnaliz(key);
      setAnalizData(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch {}
  };

  const handleAddPortfolio = (ticker: string) => {
    if (!ticker) return;
    const defaultPortfolio = portfolios["varsayilan"] ?? { name: "Varsayılan", stocks: [] };
    if (defaultPortfolio.stocks.some(s => s.ticker === ticker)) return;
    defaultPortfolio.stocks.push({
      ticker,
      price: 0,
      date: new Date().toISOString().split("T")[0],
      note: "Finans analizinden eklendi",
      stop: 0,
      target: 0,
    });
    setPortfolios({ ...portfolios, varsayilan: defaultPortfolio });
  };

  const now = new Date();
  const bugun = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
  const entries = Object.entries(analizData);
  const bugunAnalizler = entries.filter(([, v]) => v.tarih?.startsWith(bugun));
  const arsivGruplari = entries
    .filter(([, v]) => !v.tarih?.startsWith(bugun))
    .reduce<Record<string, [string, AnalizItem][]>>((acc, entry) => {
      const gun = entry[1].tarih?.split(" ")[0] ?? "Bilinmeyen";
      if (!acc[gun]) acc[gun] = [];
      acc[gun].push(entry);
      return acc;
    }, {});

  const sortedArsivDays = Object.keys(arsivGruplari).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="p-[80px_20px] text-center text-t-txt3">
        <div className="text-[44px] mb-4 animate-pulse">🤖</div>
        <div className="text-[14px] font-bold text-t-txt2">Analizler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 mt-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[17px]"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", boxShadow: "0 0 20px rgba(139,92,246,.3)" }}>
          🤖
        </div>
        <div>
          <h2 className="font-syne text-[16px] font-bold text-t-txt">Finans Analizi</h2>
          <p className="text-[10px] text-t-txt3 mt-[1px]">AI destekli hisse analiz raporları</p>
        </div>
        <button onClick={loadData}
          className="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer text-t-txt2 bg-t-bg3 hover:bg-t-bg4"
          style={{ border: "1px solid var(--bdr2)" }}>
          ↻ Yenile
        </button>
      </div>

      {/* Bugünün Analizleri */}
      <div className="mb-4">
        <div className="text-[11px] font-bold uppercase tracking-[1px] text-t-txt3 mb-3">
          📅 Bugünün Analizleri ({bugunAnalizler.length})
        </div>
        {bugunAnalizler.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
            <div className="text-[11px]" style={{ color: "#64748b" }}>Bugün henüz analiz yok</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {bugunAnalizler.map(([key, item]) => (
              <AnalizCard key={key} itemKey={key} item={item} onDelete={handleDelete} onAddPortfolio={handleAddPortfolio} />
            ))}
          </div>
        )}
      </div>

      {/* Arşiv */}
      {sortedArsivDays.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[1px] text-t-txt3 mb-3">
            📋 Analiz Arşivi
          </div>
          <Accordion type="multiple" className="space-y-1.5">
            {sortedArsivDays.map(gun => (
              <AccordionItem key={gun} value={gun} className="rounded-xl overflow-hidden border-0"
                style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline text-[12px] font-semibold" style={{ color: "#e2e8f0" }}>
                  📅 {gun} ({arsivGruplari[gun].length} analiz)
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {arsivGruplari[gun].map(([key, item]) => (
                      <AnalizCard key={key} itemKey={key} item={item} onDelete={handleDelete} onAddPortfolio={handleAddPortfolio} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {entries.length === 0 && (
        <div className="rounded-xl p-[60px_20px] text-center" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
          <div className="text-[44px] mb-3 opacity-50">🤖</div>
          <div className="text-[14px] font-bold text-t-txt2">Henüz analiz yok</div>
          <div className="text-[11px] text-t-txt3 mt-1">AI analizleri burada görünecek</div>
        </div>
      )}
    </div>
  );
}

function AnalizCard({ itemKey, item, onDelete, onAddPortfolio }: {
  itemKey: string;
  item: AnalizItem;
  onDelete: (key: string) => void;
  onAddPortfolio: (ticker: string) => void;
}) {
  const ticker = item.ticker ?? itemKey.split("_")[0] ?? "";
  const zamanIcon = item.sinyal_zamani === "ERKEN" ? "🌱" : item.sinyal_zamani === "GEÇ" ? "🔔" : "";
  const temelIcon = (item.temel_puan ?? 0) >= 70 ? "💎" : "";

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#0f1117", border: "0.5px solid #2d3748" }}>
      {/* Header */}
      <div className="p-3 flex items-start justify-between" style={{ borderBottom: "0.5px solid #1e2535" }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-syne text-[15px] font-bold" style={{ color: "#e2e8f0" }}>{ticker}</span>
            {zamanIcon && <span className="text-[12px]">{zamanIcon}</span>}
            {temelIcon && <span className="text-[12px]">{temelIcon}</span>}
          </div>
          <div className="text-[9px] mt-0.5" style={{ color: "#64748b" }}>{item.tarih}</div>
        </div>
      </div>

      {/* Analiz metni */}
      <div className="p-3">
        <div className="text-[11px] leading-[1.7] whitespace-pre-wrap" style={{ color: "#94a3b8" }}>
          {item.analiz ?? "Analiz metni yok"}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-3 pt-0">
        <button onClick={() => onAddPortfolio(ticker)}
          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all hover:opacity-90"
          style={{ background: "#0d2e1f", color: "#2CC98A", border: "1px solid rgba(44,201,138,.3)" }}>
          + Portföye Ekle
        </button>
        <button onClick={() => onDelete(itemKey)}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all hover:opacity-90"
          style={{ background: "#2e0d0d", color: "#E05252", border: "1px solid rgba(224,82,82,.3)" }}>
          🗑️
        </button>
      </div>
    </div>
  );
}
