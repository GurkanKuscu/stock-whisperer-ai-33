import { useState, useEffect } from "react";
import { fetchFinansAnaliz, deleteFinansAnaliz, fetchSnapshot } from "@/services/api";
import { useAppData } from "@/context/AppContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SnapshotData } from "@/types/stock";

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
  const [snapData, setSnapData] = useState<SnapshotData>({});
  const [loading, setLoading] = useState(true);
  const [openDetails, setOpenDetails] = useState<Set<string>>(new Set());
  const { portfolios, setPortfolios } = useAppData();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchFinansAnaliz().catch(() => ({})),
      fetchSnapshot().catch(() => ({})),
    ])
      .then(([analiz, snap]) => {
        setAnalizData(analiz);
        setSnapData(snap);
      })
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
    const stock = snapData[ticker];
    const defaultPortfolio = portfolios["varsayilan"] ?? { name: "Varsayılan", stocks: [] };
    if (defaultPortfolio.stocks.some(s => s.ticker === ticker)) return;
    defaultPortfolio.stocks.push({
      ticker,
      price: stock?.close ?? 0,
      date: new Date().toISOString().split("T")[0],
      note: "Finans analizinden eklendi",
      stop: stock?.stop_loss ?? 0,
      target: stock?.target ?? 0,
    });
    setPortfolios({ ...portfolios, varsayilan: defaultPortfolio });
  };

  const toggleDetail = (key: string) => {
    setOpenDetails(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
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

  const renderCard = (key: string, item: AnalizItem) => {
    const ticker = item.ticker ?? key.split("_")[0] ?? "";
    const stock = snapData[ticker];
    const zamanIcon = item.sinyal_zamani === "ERKEN" ? "🌱" : item.sinyal_zamani === "GEÇ" ? "🔔" : "";
    const temelIcon = (stock?.temel_puan ?? item.temel_puan ?? 0) >= 70 ? "💎" : "";
    const isOpen = openDetails.has(key);

    // Kombine karar badge
    const kombineKarar = stock?.kombine_karar ?? "";
    let kararBadge = <span className="inline-block px-2 py-0.5 rounded-[20px] text-[9px] font-medium" style={{ background: '#1e2d3d', color: '#64748b' }}>— VERİ YOK</span>;
    if ((kombineKarar.includes('GİRİLEBİLİR') || kombineKarar.includes('GİR')) && !kombineKarar.includes('GİRME')) {
      kararBadge = <span className="inline-block px-2 py-0.5 rounded-[20px] text-[9px] font-medium" style={{ background: '#0d2e1f', color: '#2CC98A' }}>✅ GİR</span>;
    } else if (kombineKarar.includes('BEKLE') || kombineKarar.includes('DİKKATLİ') || kombineKarar.includes('İZLE')) {
      kararBadge = <span className="inline-block px-2 py-0.5 rounded-[20px] text-[9px] font-medium" style={{ background: '#2e2a0d', color: '#F59E0B' }}>⚠️ BEKLE</span>;
    } else if (kombineKarar.includes('GİRME') || kombineKarar.includes('TEMEL ENGEL')) {
      kararBadge = <span className="inline-block px-2 py-0.5 rounded-[20px] text-[9px] font-medium" style={{ background: '#2e0d0d', color: '#E05252' }}>❌ GİRME</span>;
    }

    const rsColor = stock?.rs_signal === "GÜÇLÜ" ? "#2CC98A" : stock?.rs_signal === "ZAYIF" ? "#E05252" : "#60a5fa";

    return (
      <div key={key} className="rounded-xl overflow-hidden" style={{ background: "#0f1117", border: "0.5px solid #2d3748" }}>
        {/* Header */}
        <div className="p-3 flex items-start justify-between" style={{ borderBottom: "0.5px solid #1e2535" }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-syne text-[15px] font-bold" style={{ color: "#e2e8f0" }}>{ticker}</span>
              {zamanIcon && <span className="text-[12px]">{zamanIcon}</span>}
              {temelIcon && <span className="text-[12px]">{temelIcon}</span>}
            </div>
          </div>
          <div className="text-[9px] text-right" style={{ color: "#64748b" }}>{item.tarih}</div>
        </div>

        {/* Temel Karar */}
        {stock && (
          <div className="px-3 pt-2 pb-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[.5px]" style={{ color: "#64748b" }}>TEMEL KARAR</span>
              {kararBadge}
            </div>
            {kombineKarar && (
              <div className="text-[10px] mb-1.5 truncate" style={{ color: "#94a3b8" }}>{kombineKarar}</div>
            )}
          </div>
        )}

        {/* Skor satırı */}
        <div className="px-3 pb-1">
          <div className="flex flex-wrap items-center gap-1.5" style={{ fontSize: 9 }}>
            {stock && (
              <>
                <span className="px-[5px] py-[2px] rounded-[10px] font-semibold" style={{ background: "#0f1117", color: "#e2e8f0", border: "0.5px solid #2d3748" }}>
                  📊 Skor:{stock.score}p
                </span>
                <span className="px-[5px] py-[2px] rounded-[10px] font-semibold" style={{ background: "#0f1117", color: rsColor, border: "0.5px solid #2d3748" }}>
                  RS:{stock.rs_signal === "GÜÇLÜ" ? "🟢" : stock.rs_signal === "ZAYIF" ? "🔴" : "🔵"}
                </span>
              </>
            )}
            {stock?.piyasa_rejimi && (
              <span className="px-[5px] py-[2px] rounded-[10px] font-semibold" style={{
                background: stock.piyasa_rejimi === 'BULL' ? '#0d2e1f' : stock.piyasa_rejimi === 'BEAR' ? '#2e0d0d' : '#1e2535',
                color: stock.piyasa_rejimi === 'BULL' ? '#2CC98A' : stock.piyasa_rejimi === 'BEAR' ? '#E05252' : '#94a3b8'
              }}>
                {stock.piyasa_rejimi === 'BULL' ? '🟢' : stock.piyasa_rejimi === 'BEAR' ? '🔴' : '🟡'} {stock.piyasa_rejimi}
              </span>
            )}
            {stock?.pozisyon_pct != null && stock.pozisyon_pct > 0 && (
              <span className="px-[5px] py-[2px] rounded-[10px] font-semibold" style={{ background: '#1e2535', color: '#60a5fa' }}>
                Poz:%{stock.pozisyon_pct}
              </span>
            )}
          </div>
        </div>

        {/* Temel metrikleri */}
        {stock && (
          <div className="px-3 pb-2">
            <div className="flex flex-wrap gap-2.5" style={{ fontSize: 10, color: '#64748b' }}>
              {stock.temel_puan != null && <span>📋 {stock.temel_puan}p</span>}
              {stock.foreign_ratio != null && stock.foreign_ratio > 0 && <span>👥 %{stock.foreign_ratio.toFixed(1)}</span>}
              {stock.div_yield != null && stock.div_yield > 0 && <span>💰 %{stock.div_yield.toFixed(1)}</span>}
              {stock.week52_pct != null && stock.week52_pct > 0 && <span>📈 52H:%{stock.week52_pct.toFixed(0)}</span>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 p-3 pt-1" style={{ borderTop: "0.5px solid #1e2535" }}>
          <button onClick={() => handleAddPortfolio(ticker)}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all hover:opacity-90"
            style={{ background: "#0d2e1f", color: "#2CC98A", border: "1px solid rgba(44,201,138,.3)" }}>
            + Portföye Ekle
          </button>
          <button onClick={() => handleDelete(key)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all hover:opacity-90"
            style={{ background: "#2e0d0d", color: "#E05252", border: "1px solid rgba(224,82,82,.3)" }}>
            🗑️
          </button>
        </div>

        {/* Collapsible analysis */}
        <div>
          <button onClick={() => toggleDetail(key)}
            className="w-full py-2 text-[10px] font-semibold cursor-pointer transition-all hover:bg-[rgba(255,255,255,.03)]"
            style={{ background: "#0a0d14", color: "#64748b", borderTop: "0.5px solid #1e2535", border: "none", borderTopStyle: "solid", borderTopWidth: "0.5px", borderTopColor: "#1e2535" }}>
            {isOpen ? "▲ Finans Analizi Detayı" : "▼ Finans Analizi Detayı"}
          </button>
          {isOpen && (
            <div className="p-3 animate-fade-in" style={{ borderTop: "0.5px solid #1e2535", background: "#0a0d14" }}>
              <div className="text-[11px] leading-[1.7] whitespace-pre-wrap" style={{ color: "#94a3b8" }}>
                {item.analiz ?? "Analiz metni yok"}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            {bugunAnalizler.map(([key, item]) => renderCard(key, item))}
          </div>
        )}
      </div>

      {/* Arşiv */}
      {sortedArsivDays.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[1px] text-t-txt3 mb-3">
            📋 Analiz Geçmişi
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
                    {arsivGruplari[gun].map(([key, item]) => renderCard(key, item))}
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
