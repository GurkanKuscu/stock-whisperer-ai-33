import { useState, useEffect } from "react";
import { useAppData } from "@/context/AppContext";
import { fetchPrices } from "@/services/api";

export default function PortfolioTab() {
  const { data, portfolios, setPortfolios } = useAppData();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  const pIds = Object.keys(portfolios);

  useEffect(() => {
    const allTickers = Object.values(portfolios).flatMap(p => p.stocks.map(s => s.ticker));
    const unique = [...new Set(allTickers)];
    if (!unique.length) return;
    const fetchLive = () => {
      fetchPrices(unique).then(setLivePrices).catch(() => {});
    };
    fetchLive();
    const interval = setInterval(fetchLive, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [portfolios]);

  const createPortfolio = () => {
    if (!newName.trim()) return;
    const id = `p_${Date.now()}`;
    setPortfolios({ ...portfolios, [id]: { name: newName.trim(), stocks: [] } });
    setNewName("");
  };

  const deletePortfolio = (id: string) => {
    const copy = { ...portfolios };
    delete copy[id];
    setPortfolios(copy);
  };

  const renamePortfolio = (id: string) => {
    if (!editName.trim()) return;
    portfolios[id].name = editName.trim();
    setPortfolios({ ...portfolios });
    setEditingId(null);
  };

  const removeStock = (pId: string, ticker: string) => {
    portfolios[pId].stocks = portfolios[pId].stocks.filter(s => s.ticker !== ticker);
    setPortfolios({ ...portfolios });
  };

  const getStockPnl = (ticker: string, entryPrice: number) => {
    const current = livePrices[ticker] ?? data[ticker]?.close ?? entryPrice;
    const pnl = current - entryPrice;
    const pnlPct = entryPrice > 0 ? (pnl / entryPrice) * 100 : 0;
    return { pnl, pnlPct, currentPrice: current };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-[18px] mt-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px]"
            style={{ background: "var(--green-bg)", border: "1px solid var(--green-bdr)" }}>📈</div>
          <div>
            <h2 className="font-syne text-[15px] font-bold text-t-txt">Sanal Portföy</h2>
            <p className="text-[11px] text-t-txt3 mt-[1px]">Portföylerinizi yönetin ve takip edin</p>
          </div>
        </div>
      </div>

      {/* Create new portfolio */}
      <div className="flex gap-2 mb-5">
        <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && createPortfolio()}
          placeholder="Yeni portföy adı..."
          className="flex-1 max-w-[300px] p-[10px_14px] bg-t-card text-t-txt rounded-lg text-[13px] font-semibold font-body outline-none placeholder:text-t-txt3 focus:shadow-[0_0_0_3px_rgba(79,142,247,.08)]"
          style={{ border: "1px solid var(--bdr)" }} />
        <button onClick={createPortfolio}
          className="px-4 py-2.5 rounded-lg text-[12px] font-bold cursor-pointer transition-all hover:opacity-90 font-body"
          style={{ background: "linear-gradient(135deg, var(--c-accent), var(--accent-d))", color: "#fff", boxShadow: "0 4px 14px rgba(79,142,247,.3)" }}>
          + Yeni Portföy
        </button>
      </div>

      {pIds.length === 0 ? (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">📈</div>
          <div className="text-[14px] font-bold text-t-txt2 mb-[5px]">Henüz portföy yok</div>
          <div className="text-[11px]">Yukarıdan yeni portföy oluşturun veya sinyal kartlarından hisse ekleyin</div>
        </div>
      ) : (
        <div className="space-y-4">
          {pIds.map(pId => {
            const p = portfolios[pId];
            const isEditing = editingId === pId;
            const stocks = p.stocks;

            // Total PnL
            const totalCost = stocks.reduce((s, x) => s + x.price, 0);
            const totalCurrent = stocks.reduce((s, x) => s + (livePrices[x.ticker] ?? data[x.ticker]?.close ?? x.price), 0);
            const totalPnlPct = totalCost > 0 ? ((totalCurrent - totalCost) / totalCost) * 100 : 0;
            const totalPnlTL = totalCurrent - totalCost;

            return (
              <div key={pId} className="bg-t-card2 rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
                {/* Portfolio header */}
                <div className="p-[14px_18px] bg-t-bg3 flex items-center justify-between flex-wrap gap-2" style={{ borderBottom: "1px solid var(--bdr)" }}>
                  {isEditing ? (
                    <div className="flex gap-2 items-center">
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && renamePortfolio(pId)}
                        className="p-[4px_8px] bg-t-bg4 text-t-txt rounded text-[13px] font-bold font-syne outline-none"
                        style={{ border: "1px solid var(--bdr2)" }} autoFocus />
                      <button onClick={() => renamePortfolio(pId)} className="text-[11px] text-t-green font-bold cursor-pointer bg-transparent border-none">✓</button>
                      <button onClick={() => setEditingId(null)} className="text-[11px] text-t-txt3 font-bold cursor-pointer bg-transparent border-none">✕</button>
                    </div>
                  ) : (
                    <span className="text-[15px] font-bold font-syne text-t-txt">{p.name}</span>
                  )}
                  <div className="flex items-center gap-3">
                    {stocks.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-bold font-mono ${totalPnlPct >= 0 ? "text-t-green" : "text-t-red"}`}>
                          {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(1)}%
                        </span>
                        <span className={`text-[11px] font-mono ${totalPnlTL >= 0 ? "text-t-green" : "text-t-red"}`}>
                          ({totalPnlTL >= 0 ? "+" : ""}{totalPnlTL.toFixed(2)} ₺)
                        </span>
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditingId(pId); setEditName(p.name); }}
                        className="text-[11px] text-t-txt3 cursor-pointer bg-transparent border-none hover:text-t-txt">✏️</button>
                      <button onClick={() => deletePortfolio(pId)}
                        className="text-[11px] text-t-txt3 cursor-pointer bg-transparent border-none hover:text-t-red">🗑️</button>
                    </div>
                  </div>
                </div>

                {/* Stocks */}
                {stocks.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-t-txt3">
                    Portföyde hisse yok · Sinyal kartlarından "Portföye Ekle" ile ekleyin
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {stocks.map((s, i) => {
                      const { pnlPct, currentPrice, pnl: pnlTL } = getStockPnl(s.ticker, s.price);
                      const range = s.target - s.stop;
                      const entryPos = range > 0 ? Math.max(0, Math.min(100, ((s.price - s.stop) / range) * 100)) : 50;
                      const currentPos = range > 0 ? Math.max(0, Math.min(100, ((currentPrice - s.stop) / range) * 100)) : 50;
                      const gunFarki = Math.floor((Date.now() - new Date(s.date).getTime()) / 86400000);

                      let durum = "AÇIK 🔄";
                      if (currentPrice >= s.target) durum = "HEDEF TUTTU ✅";
                      if (currentPrice <= s.stop) durum = "STOP OLDU ❌";

                      const sureMetni = durum === "AÇIK 🔄"
                        ? gunFarki + " gündür aktif"
                        : durum === "HEDEF TUTTU ✅"
                        ? gunFarki + " günde başarıldı"
                        : gunFarki + " günde stop oldu";

                      return (
                        <div key={i} className="bg-t-bg3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
                          {/* Stock header */}
                          <div className="p-[10px_14px] flex items-center justify-between" style={{ borderBottom: "1px solid var(--bdr)" }}>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold font-mono text-[14px] text-t-txt">{s.ticker}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                durum.includes("HEDEF") ? "bg-[var(--green-bg)] text-t-green" :
                                durum.includes("STOP") ? "bg-[var(--red-bg)] text-t-red" :
                                "bg-[var(--blue-bg)] text-t-blue-l"
                              }`}>{durum}</span>
                            </div>
                            <button onClick={() => removeStock(pId, s.ticker)}
                              className="text-[10px] text-t-red font-bold cursor-pointer bg-transparent border-none hover:opacity-80">
                              Çıkar
                            </button>
                          </div>

                          {/* Progress bar */}
                          <div className="p-[10px_14px]">
                            <div className="flex items-center gap-2 text-[9px] text-t-txt3 mb-1">
                              <span className="font-mono text-t-red">{s.stop.toFixed(2)}</span>
                              <span className="flex-1" />
                              <span className="font-mono text-t-green">{s.target.toFixed(2)}</span>
                            </div>
                            <div className="relative h-[5px] bg-t-bg4 rounded-full overflow-visible">
                              {/* Entry marker */}
                              <div className="absolute top-[-2px] w-[2px] h-[9px] bg-t-txt3 rounded-full z-10" style={{ left: `${entryPos}%` }} />
                              {/* Fill */}
                              <div className="absolute top-0 left-0 h-full rounded-full" style={{
                                width: `${currentPos}%`,
                                background: currentPos >= entryPos ? "var(--c-green)" : "var(--c-red)",
                              }} />
                              {/* Current dot */}
                              <div className="absolute top-[-3px] w-[8px] h-[11px] rounded-sm z-20"
                                style={{ left: `calc(${currentPos}% - 4px)`, background: currentPos >= entryPos ? "var(--c-green)" : "var(--c-red)" }} />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="p-[8px_14px] flex items-center justify-between flex-wrap gap-1 text-[10px]" style={{ borderTop: "1px solid var(--bdr)" }}>
                            <div className="flex items-center gap-2.5">
                              <span className={`font-mono font-bold ${pnlPct >= 0 ? "text-t-green" : "text-t-red"}`}>
                                {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                              </span>
                              <span className={`font-mono ${pnlTL >= 0 ? "text-t-green" : "text-t-red"}`}>
                                {pnlTL >= 0 ? "+" : ""}{pnlTL.toFixed(2)} ₺
                              </span>
                              <span className="text-t-txt3">{sureMetni}</span>
                            </div>
                            <span className="font-mono text-t-txt2">
                              Güncel: {currentPrice.toFixed(2)} ₺
                            </span>
                          </div>

                          {/* Note */}
                          {s.note && (
                            <div className="px-[14px] pb-2 text-[10px] text-t-txt3 truncate">💬 {s.note}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
