import { useState } from "react";
import { useAppData } from "@/context/AppContext";

export default function PortfolioTab() {
  const { data, portfolios, setPortfolios } = useAppData();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const pIds = Object.keys(portfolios);

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
    const current = data[ticker]?.close;
    if (!current) return { pnl: 0, pnlPct: 0, currentPrice: entryPrice };
    const pnl = current - entryPrice;
    const pnlPct = (pnl / entryPrice) * 100;
    return { pnl, pnlPct, currentPrice: current };
  };

  const getPortfolioPnl = (pId: string) => {
    const stocks = portfolios[pId].stocks;
    if (!stocks.length) return 0;
    let totalPnl = 0;
    stocks.forEach(s => { totalPnl += getStockPnl(s.ticker, s.price).pnlPct; });
    return totalPnl / stocks.length;
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
            const pPnl = getPortfolioPnl(pId);
            const isEditing = editingId === pId;

            return (
              <div key={pId} className="bg-t-card2 rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
                {/* Portfolio header */}
                <div className="p-[14px_18px] bg-t-bg3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--bdr)" }}>
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
                    <span className={`text-[13px] font-bold font-mono ${pPnl >= 0 ? "text-t-green" : "text-t-red"}`}>
                      {pPnl >= 0 ? "+" : ""}{pPnl.toFixed(1)}%
                    </span>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditingId(pId); setEditName(p.name); }}
                        className="text-[11px] text-t-txt3 cursor-pointer bg-transparent border-none hover:text-t-txt">✏️</button>
                      <button onClick={() => deletePortfolio(pId)}
                        className="text-[11px] text-t-txt3 cursor-pointer bg-transparent border-none hover:text-t-red">🗑️</button>
                    </div>
                  </div>
                </div>

                {/* Table header */}
                {p.stocks.length > 0 && (
                  <div className="grid grid-cols-[80px_70px_70px_70px_1fr_60px] gap-2 items-center p-[10px_18px] bg-t-bg3 text-[10px] text-t-txt3 font-semibold uppercase tracking-[.5px]"
                    style={{ borderBottom: "1px solid var(--bdr)" }}>
                    <span>Hisse</span><span>Giriş</span><span>Güncel</span><span>K/Z</span><span>Not</span><span></span>
                  </div>
                )}

                {/* Stocks */}
                {p.stocks.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-t-txt3">
                    Portföyde hisse yok · Sinyal kartlarından "Portföye Ekle" ile ekleyin
                  </div>
                ) : (
                  p.stocks.map((s, i) => {
                    const { pnlPct, currentPrice } = getStockPnl(s.ticker, s.price);
                    return (
                      <div key={i} className="grid grid-cols-[80px_70px_70px_70px_1fr_60px] gap-2 items-center p-[10px_18px] text-[12px] hover:bg-t-bg3 transition-colors"
                        style={{ borderBottom: i < p.stocks.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                        <span className="font-extrabold font-mono text-[13px] text-t-txt">{s.ticker}</span>
                        <span className="text-t-txt2 font-mono">{s.price.toFixed(2)}</span>
                        <span className="text-t-txt font-mono font-bold">{currentPrice.toFixed(2)}</span>
                        <span className={`font-bold font-mono ${pnlPct >= 0 ? "text-t-green" : "text-t-red"}`}>
                          {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                        </span>
                        <span className="text-t-txt3 text-[11px] truncate">{s.note || s.date}</span>
                        <button onClick={() => removeStock(pId, s.ticker)}
                          className="text-[10px] text-t-red font-bold cursor-pointer bg-transparent border-none hover:opacity-80 text-right">
                          Çıkar
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
