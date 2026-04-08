import { useState, useEffect } from "react";
import { useAppData } from "@/context/AppContext";
import { fetchPrices } from "@/services/api";
import PriceProgressBar from "@/components/PriceProgressBar";

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-[rgba(0,0,0,.7)]" />
      <div className="relative bg-t-bg2 rounded-2xl w-full max-w-[380px] p-6 animate-fade-in" style={{ border: "1px solid var(--bdr2)" }} onClick={e => e.stopPropagation()}>
        <p className="text-[14px] text-t-txt mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-t-txt2 bg-t-bg3 cursor-pointer" style={{ border: "1px solid var(--bdr2)" }}>İptal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-[12px] font-bold cursor-pointer" style={{ background: "var(--c-red)", color: "#fff" }}>Sil</button>
        </div>
      </div>
    </div>
  );
}

function AddStockModal({ onAdd, onClose, data }: { onAdd: (s: any) => void; onClose: () => void; data: any }) {
  const [ticker, setTicker] = useState("");
  const [giris, setGiris] = useState("");
  const [stop, setStop] = useState("");
  const [hedef, setHedef] = useState("");
  const [note, setNote] = useState("");

  const onTickerChange = (val: string) => {
    const upper = val.toUpperCase();
    setTicker(upper);
    const stock = data[upper];
    if (stock) {
      setGiris(stock.close?.toFixed(2) ?? "");
      setStop(stock.stop_loss?.toFixed(2) ?? "");
      setHedef(stock.target?.toFixed(2) ?? "");
    }
  };

  const handleSubmit = () => {
    if (!ticker.trim()) return;
    onAdd({
      ticker: ticker.toUpperCase(),
      price: parseFloat(giris) || 0,
      stop: parseFloat(stop) || 0,
      target: parseFloat(hedef) || 0,
      date: new Date().toISOString(),
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(0,0,0,.7)]" />
      <div className="relative bg-t-bg2 rounded-2xl w-full max-w-[420px] animate-fade-in" style={{ border: "1px solid var(--bdr2)" }} onClick={e => e.stopPropagation()}>
        <div className="p-[18px_20px] flex justify-between items-center" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <h3 className="font-syne text-[16px] font-bold text-t-txt">Hisse Ekle</h3>
          <button onClick={onClose} className="text-t-txt3 hover:text-t-txt text-[18px] cursor-pointer bg-transparent border-none">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[11px] text-t-txt2 font-semibold block mb-1.5">Hisse Kodu</label>
            <input type="text" value={ticker} onChange={e => onTickerChange(e.target.value)} placeholder="Örn: AKSEN"
              className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[13px] font-bold font-mono uppercase outline-none" style={{ border: "1px solid var(--bdr2)" }} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-t-txt2 font-semibold block mb-1.5">Giriş (₺)</label>
              <input type="number" step="0.01" value={giris} onChange={e => setGiris(e.target.value)}
                className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] font-mono outline-none" style={{ border: "1px solid var(--bdr2)" }} />
            </div>
            <div>
              <label className="text-[11px] text-t-txt2 font-semibold block mb-1.5">Stop (₺)</label>
              <input type="number" step="0.01" value={stop} onChange={e => setStop(e.target.value)}
                className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] font-mono outline-none" style={{ border: "1px solid var(--bdr2)" }} />
            </div>
            <div>
              <label className="text-[11px] text-t-txt2 font-semibold block mb-1.5">Hedef (₺)</label>
              <input type="number" step="0.01" value={hedef} onChange={e => setHedef(e.target.value)}
                className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] font-mono outline-none" style={{ border: "1px solid var(--bdr2)" }} />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-t-txt2 font-semibold block mb-1.5">Not (opsiyonel)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Breakout beklentisi..."
              className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] outline-none placeholder:text-t-txt3" style={{ border: "1px solid var(--bdr2)" }} />
          </div>
        </div>
        <div className="p-[16px_20px] flex gap-3" style={{ borderTop: "1px solid var(--bdr)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-t-txt2 bg-t-bg3 cursor-pointer" style={{ border: "1px solid var(--bdr2)" }}>İptal</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg text-[12px] font-bold cursor-pointer"
            style={{ background: "linear-gradient(135deg, var(--c-accent), var(--accent-d))", color: "#fff" }}>Ekle</button>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioTab() {
  const { data, portfolios, setPortfolios } = useAppData();
  const [newName, setNewName] = useState("");
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [openPorts, setOpenPorts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<Record<string, "kart" | "tablo">>({});
  const [confirmDelete, setConfirmDelete] = useState<{ type: "port" | "stock"; pId: string; ticker?: string } | null>(null);
  const [addStockTo, setAddStockTo] = useState<string | null>(null);

  const pIds = Object.keys(portfolios);

  useEffect(() => {
    const allTickers = Object.values(portfolios).flatMap(p => p.stocks.map(s => s.ticker));
    const unique = [...new Set(allTickers)];
    if (!unique.length) return;
    const fetchLive = () => { fetchPrices(unique).then(setLivePrices).catch(() => {}); };
    fetchLive();
    const interval = setInterval(fetchLive, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [portfolios]);

  const createPortfolio = () => {
    if (!newName.trim()) return;
    const id = `p_${Date.now()}`;
    setPortfolios({ ...portfolios, [id]: { name: newName.trim(), stocks: [], createdAt: new Date().toISOString() } });
    setNewName("");
    setOpenPorts(prev => new Set(prev).add(id));
  };

  const deletePortfolio = (id: string) => { const copy = { ...portfolios }; delete copy[id]; setPortfolios(copy); };
  const removeStock = (pId: string, ticker: string) => { portfolios[pId].stocks = portfolios[pId].stocks.filter(s => s.ticker !== ticker); setPortfolios({ ...portfolios }); };

  const togglePort = (id: string) => {
    setOpenPorts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const getCalc = (s: any) => {
    const currentPrice = livePrices[s.ticker] ?? data[s.ticker]?.close ?? s.price;
    const pnlPct = s.price > 0 ? ((currentPrice - s.price) / s.price) * 100 : 0;
    const pnlTL = currentPrice - s.price;
    const range = s.target - s.stop;
    const entryPos = range > 0 ? Math.max(0, Math.min(100, ((s.price - s.stop) / range) * 100)) : 50;
    const currentPos = range > 0 ? Math.max(0, Math.min(100, ((currentPrice - s.stop) / range) * 100)) : 50;
    const gunFarki = (() => {
      try {
        const d = new Date(s.date ?? s.tarih ?? s.entry_date);
        if (isNaN(d.getTime())) return 0;
        return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
      } catch { return 0; }
    })();
    let durum = "AÇIK";
    if (currentPrice >= s.target) durum = "HEDEF TUTTU";
    if (currentPrice <= s.stop) durum = "STOP LOSS";
    return { currentPrice, pnlPct, pnlTL, entryPos, currentPos, gunFarki, durum };
  };

  const addStockHandler = (pId: string, stockData: any) => {
    const exists = portfolios[pId].stocks.some(s => s.ticker === stockData.ticker);
    if (exists) return;
    portfolios[pId].stocks.push(stockData);
    setPortfolios({ ...portfolios });
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

      {/* Create */}
      <div className="flex gap-2 mb-5">
        <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && createPortfolio()}
          placeholder="Yeni portföy adı..."
          className="flex-1 max-w-[300px] p-[10px_14px] bg-t-card text-t-txt rounded-lg text-[13px] font-semibold font-body outline-none placeholder:text-t-txt3"
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
            const stocks = p.stocks;
            const isOpen = openPorts.has(pId);
            const mode = viewMode[pId] ?? "kart";

            const totalCost = stocks.reduce((s, x) => s + x.price, 0);
            const totalCurrent = stocks.reduce((s, x) => s + (livePrices[x.ticker] ?? data[x.ticker]?.close ?? x.price), 0);
            const totalPnlPct = totalCost > 0 ? ((totalCurrent - totalCost) / totalCost) * 100 : 0;
            const totalPnlTL = totalCurrent - totalCost;

            return (
              <div key={pId} className="bg-t-card2 rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
                {/* Collapsed header */}
                <div className="p-[10px_16px] flex items-center gap-4 cursor-pointer" onClick={() => togglePort(pId)}
                  style={{ borderBottom: isOpen ? "1px solid var(--bdr)" : "none" }}>
                  {/* SOL: ok + portföy adı + meta */}
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0" style={{ minWidth: "180px" }}>
                    <span className="text-[11px] text-t-txt3">{isOpen ? "▼" : "▶"}</span>
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-t-txt">{p.name}</span>
                      <div className="text-[10px] text-t-txt3 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{(() => {
                          try {
const d = new Date(p.createdAt ?? '');
                            if (isNaN(d.getTime())) return '—';
                            const aylar = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
                            return `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}`;
                          } catch { return '—'; }
                        })()}</span>
                        <span style={{ color: "var(--bdr2)" }}>·</span>
                        <span>{stocks.length} hisse</span>
                        <span style={{ color: "var(--bdr2)" }}>·</span>
                        <span>Aktif Gün: {(() => {
                          try {
                            const d = new Date(p.createdAt ?? '');
                            if (isNaN(d.getTime())) return 0;
                            return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
                          } catch { return 0; }
                        })()}</span>
                      </div>
                    </div>
                  </div>

                  {/* ORTA: hisse chip'leri */}
                  <div className="flex gap-1.5 flex-1 overflow-hidden items-center flex-wrap" onClick={e => e.stopPropagation()}>
                    {stocks.map(s => {
                      const cp = livePrices[s.ticker] ?? data[s.ticker]?.close ?? s.price;
                      const deg = s.price > 0 ? ((cp - s.price) / s.price * 100) : 0;
                      return (
                        <div key={s.ticker} className="flex items-center gap-1.5 bg-t-bg3 rounded px-2 py-[3px] whitespace-nowrap"
                          style={{ border: "0.5px solid var(--bdr)" }}>
                          <span className="text-[11px] font-medium text-t-txt">{s.ticker}</span>
                          <span className="text-[10px] font-mono" style={{ color: deg >= 0 ? "#2CC98A" : "#E05252" }}>
                            {deg >= 0 ? "+" : ""}{deg.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* SAĞ: toplam değişim */}
                  {stocks.length > 0 && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] text-t-txt3">Değişim</span>
                      <span className={`text-[13px] font-medium font-mono ${totalPnlPct >= 0 ? "text-t-green" : "text-t-red"}`}>
                        {totalPnlPct >= 0 ? "↑" : "↓"} {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(1)}%
                      </span>
                      <span className={`text-[12px] font-mono ${totalPnlTL >= 0 ? "text-t-green" : "text-t-red"}`}>
                        {totalPnlTL >= 0 ? "+" : ""}{totalPnlTL.toFixed(2)} ₺
                      </span>
                    </div>
                  )}
                </div>

                {/* Open body */}
                {isOpen && (
                  <div className="p-4">
                    {/* View toggle + delete */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1">
                        <button onClick={() => setViewMode({ ...viewMode, [pId]: "kart" })}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${mode === "kart" ? "bg-t-bg4 text-t-txt" : "text-t-txt3 bg-t-bg3"}`}
                          style={{ border: "1px solid var(--bdr)" }}>Kart</button>
                        <button onClick={() => setViewMode({ ...viewMode, [pId]: "tablo" })}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${mode === "tablo" ? "bg-t-bg4 text-t-txt" : "text-t-txt3 bg-t-bg3"}`}
                          style={{ border: "1px solid var(--bdr)" }}>Tablo</button>
                      </div>
                      <button onClick={() => setConfirmDelete({ type: "port", pId })}
                        className="text-[11px] text-t-txt3 cursor-pointer bg-transparent border-none hover:text-t-red flex items-center gap-1">
                        🗑️ Portföyü Sil
                      </button>
                    </div>

                    {stocks.length === 0 ? (
                      <div className="p-6 text-center text-[11px] text-t-txt3">
                        Portföyde hisse yok
                      </div>
                    ) : mode === "kart" ? (
                      /* Card view */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {stocks.map((s, i) => {
                          const c = getCalc(s);
                          const bugun = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          const saat = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          const girisTarih = (() => {
                            try {
                              const d = new Date(s.date ?? '');
                              if (isNaN(d.getTime())) return '—';
                              return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            } catch { return '—'; }
                          })();
                          return (
                            <div key={i} className="rounded-xl p-3" style={{ background: "var(--bg3)", border: "0.5px solid var(--bdr2)", position: 'relative' }}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[14px] font-semibold text-t-txt">{s.ticker}</span>
                                <button onClick={() => setConfirmDelete({ type: "stock", pId, ticker: s.ticker })}
                                  className="text-t-txt3 hover:text-t-red cursor-pointer bg-transparent border-none text-[14px]">🗑️</button>
                              </div>
                              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mb-2 ${
                                c.durum === "HEDEF TUTTU" ? "bg-[var(--green-bg)] text-t-green" :
                                c.durum === "STOP LOSS" ? "bg-[var(--red-bg)] text-t-red" :
                                "bg-[var(--blue-bg)] text-t-blue-l"
                              }`}>{c.durum}</span>
                              <div className="text-[10px] text-t-txt3 mb-0.5">Güncel Fiyat</div>
                              <div className="text-[18px] font-medium font-mono mb-1" style={{ color: c.pnlTL >= 0 ? "#2CC98A" : "#E05252", whiteSpace: "nowrap" }}>
                                {c.currentPrice.toFixed(2)} ₺ {c.pnlTL >= 0 ? "↑" : "↓"}
                              </div>
                              <div className="flex gap-1.5 text-[12px] font-mono mb-2" style={{ whiteSpace: "nowrap" }}>
                                <span style={{ color: c.pnlPct >= 0 ? "#2CC98A" : "#E05252" }}>{c.pnlPct >= 0 ? "+" : ""}{c.pnlPct.toFixed(1)}%</span>
                                <span style={{ color: c.pnlTL >= 0 ? "#2CC98A" : "#E05252" }}>{c.pnlTL >= 0 ? "+" : ""}{c.pnlTL.toFixed(2)} ₺</span>
                              </div>
                              {/* Progress */}
                              <div className="mb-2">
                                <div className="h-[4px] rounded-sm overflow-hidden" style={{ background: "var(--bg4)" }}>
                                  <div className="h-full rounded-sm" style={{
                                    width: `${Math.min(100, Math.max(0, c.currentPos))}%`,
                                    background: c.currentPos >= c.entryPos ? "#2CC98A" : "#E05252"
                                  }} />
                                </div>
                              </div>
                              {/* STOP / GİRİŞ / HEDEF boxes */}
                              <div className="grid grid-cols-3 gap-1">
                                <div className="rounded-md p-1" style={{ background: "var(--bg)" }}>
                                  <div className="text-[9px] text-t-txt3">STOP</div>
                                  <div className="text-[11px] font-medium font-mono" style={{ color: "#E05252", whiteSpace: "nowrap" }}>{s.stop.toFixed(2)} ₺</div>
                                </div>
                                <div className="rounded-md p-1" style={{ background: "var(--bg)" }}>
                                  <div className="text-[9px] text-t-txt3">GİRİŞ</div>
                                  <div className="text-[11px] font-medium font-mono text-t-txt2" style={{ whiteSpace: "nowrap" }}>{s.price.toFixed(2)} ₺</div>
                                </div>
                                <div className="rounded-md p-1" style={{ background: "var(--bg)" }}>
                                  <div className="text-[9px] text-t-txt3">HEDEF</div>
                                  <div className="text-[11px] font-medium font-mono" style={{ color: "#2CC98A", whiteSpace: "nowrap" }}>{s.target.toFixed(2)} ₺</div>
                                </div>
                              </div>
                              <div className="text-[10px] text-t-txt3 mt-1.5">{c.gunFarki} gün · {c.durum === "AÇIK" ? "aktif" : c.durum === "HEDEF TUTTU" ? "başarılı" : "stop"}</div>
                              {s.note && <div className="text-[10px] text-t-txt3 mt-1 truncate">💬 {s.note}</div>}

                              {c.durum === "HEDEF TUTTU" && (
                                <div style={{
                                  position: 'absolute', inset: 0, borderRadius: 12,
                                  background: 'rgba(10,25,20,0.85)',
                                  border: '2px solid rgba(44,201,138,0.5)',
                                  pointerEvents: 'none',
                                  backdropFilter: 'blur(6px)',
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4
                                }}>
                                  <span style={{ fontSize: 13, color: '#2CC98A', fontWeight: 600 }}>🏆 Giriş: {s.price.toFixed(2)} ₺ · {girisTarih}</span>
                                  <span style={{ fontSize: 13, color: '#2CC98A' }}>Hedef: {s.target.toFixed(2)} ₺ · {bugun} {saat}</span>
                                  <span style={{ fontSize: 13, color: '#2CC98A', fontWeight: 600 }}>+{c.pnlPct.toFixed(1)}% | +{c.pnlTL.toFixed(2)} ₺ · {c.gunFarki} gün</span>
                                </div>
                              )}

                              {c.durum === "STOP LOSS" && (
                                <div style={{
                                  position: 'absolute', inset: 0, borderRadius: 12,
                                  background: 'rgba(25,10,10,0.85)',
                                  border: '2px solid rgba(224,82,82,0.5)',
                                  pointerEvents: 'none',
                                  backdropFilter: 'blur(6px)',
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4
                                }}>
                                  <span style={{ fontSize: 13, color: '#E05252', fontWeight: 600 }}>💀 Giriş: {s.price.toFixed(2)} ₺ · {girisTarih}</span>
                                  <span style={{ fontSize: 13, color: '#E05252' }}>Stop: {s.stop.toFixed(2)} ₺ · {bugun} {saat}</span>
                                  <span style={{ fontSize: 13, color: '#E05252', fontWeight: 600 }}>{c.pnlPct.toFixed(1)}% | {c.pnlTL.toFixed(2)} ₺ · {c.gunFarki} gün</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {/* Add stock button */}
                        <button onClick={() => setAddStockTo(pId)}
                          className="rounded-xl p-5 cursor-pointer transition-all hover:bg-t-bg4 flex items-center justify-center text-[14px] text-t-txt3"
                          style={{ border: "0.5px dashed var(--bdr2)", background: "transparent" }}>
                          + Hisse Ekle
                        </button>
                      </div>
                    ) : (
                      /* Table view */
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="text-t-txt3 text-left">
                              {["Hisse","Durum","Giriş","Stop","Hedef","Güncel","%","Gün",""].map(h => (
                                <th key={h} className="p-2 font-semibold text-[10px] uppercase tracking-[.5px]" style={{ borderBottom: "1px solid var(--bdr)" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {stocks.map((s, i) => {
                              const c = getCalc(s);
                              return (
                                <tr key={i} style={{ borderBottom: "1px solid var(--bdr)" }}>
                                  <td className="p-2 font-bold font-mono text-t-txt" style={{ whiteSpace: "nowrap" }}>{s.ticker}</td>
                                  <td className="p-2" style={{ whiteSpace: "nowrap" }}>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      c.durum === "HEDEF TUTTU" ? "bg-[var(--green-bg)] text-t-green" :
                                      c.durum === "STOP LOSS" ? "bg-[var(--red-bg)] text-t-red" :
                                      "bg-[var(--blue-bg)] text-t-blue-l"
                                    }`}>{c.durum}</span>
                                  </td>
                                  <td className="p-2 font-mono text-t-txt2" style={{ whiteSpace: "nowrap" }}>{s.price.toFixed(2)}</td>
                                  <td className="p-2 font-mono text-t-red" style={{ whiteSpace: "nowrap" }}>{s.stop.toFixed(2)}</td>
                                  <td className="p-2 font-mono text-t-green" style={{ whiteSpace: "nowrap" }}>{s.target.toFixed(2)}</td>
                                  <td className="p-2 font-mono text-t-txt" style={{ whiteSpace: "nowrap" }}>{c.currentPrice.toFixed(2)}</td>
                                  <td className={`p-2 font-mono font-bold ${c.pnlPct >= 0 ? "text-t-green" : "text-t-red"}`} style={{ whiteSpace: "nowrap" }}>
                                    {c.pnlPct >= 0 ? "+" : ""}{c.pnlPct.toFixed(1)}%
                                  </td>
                                  <td className="p-2 text-t-txt3" style={{ whiteSpace: "nowrap" }}>{c.gunFarki}</td>
                                  <td className="p-2">
                                    <button onClick={() => setConfirmDelete({ type: "stock", pId, ticker: s.ticker })}
                                      className="text-t-txt3 hover:text-t-red cursor-pointer bg-transparent border-none text-[12px]">🗑️</button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <button onClick={() => setAddStockTo(pId)}
                          className="mt-3 text-[11px] text-t-accent font-semibold cursor-pointer bg-transparent border-none hover:opacity-80">
                          + Hisse Ekle
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <ConfirmModal
          message={confirmDelete.type === "port"
            ? `"${portfolios[confirmDelete.pId]?.name}" portföyü silinsin mi? Tüm hisseler silinecek.`
            : `${confirmDelete.ticker} portföyden çıkarılsın mı?`}
          onConfirm={() => {
            if (confirmDelete.type === "port") deletePortfolio(confirmDelete.pId);
            else if (confirmDelete.ticker) removeStock(confirmDelete.pId, confirmDelete.ticker);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Add stock modal */}
      {addStockTo && (
        <AddStockModal
          data={data}
          onAdd={(s) => addStockHandler(addStockTo, s)}
          onClose={() => setAddStockTo(null)}
        />
      )}
    </div>
  );
}
