import { useState } from "react";
import { useAppData } from "@/context/AppContext";

interface Props {
  ticker: string;
  price: number;
  stop: number;
  target: number;
  onClose: () => void;
}

export default function AddToPortfolioModal({ ticker, price, stop, target, onClose }: Props) {
  const { portfolios, setPortfolios } = useAppData();
  const [selectedId, setSelectedId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [entryPrice, setEntryPrice] = useState(price.toFixed(2));
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(Object.keys(portfolios).length === 0);

  const pIds = Object.keys(portfolios);

  const handleAdd = () => {
    let pId = selectedId;
    if (creating && newName.trim()) {
      pId = `p_${Date.now()}`;
      portfolios[pId] = { name: newName.trim(), stocks: [] };
    }
    if (!pId || !portfolios[pId]) return;

    const exists = portfolios[pId].stocks.some(s => s.ticker === ticker);
    if (exists) { onClose(); return; }

    portfolios[pId].stocks.push({
      ticker,
      price: parseFloat(entryPrice) || price,
      date: new Date().toISOString(),
      note,
      stop,
      target,
    });
    setPortfolios({ ...portfolios });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(0,0,0,.7)]" />
      <div className="relative bg-t-bg2 rounded-2xl w-full max-w-[420px] shadow-t-lg animate-fade-in"
        style={{ border: "1px solid var(--bdr2)" }}
        onClick={e => e.stopPropagation()}>
        <div className="p-[18px_20px] flex justify-between items-center" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <div>
            <h3 className="font-syne text-[16px] font-bold text-t-txt">Portföye Ekle</h3>
            <p className="text-[11px] text-t-txt3 mt-1">{ticker} · {price.toFixed(2)} ₺</p>
          </div>
          <button onClick={onClose} className="text-t-txt3 hover:text-t-txt text-[18px] cursor-pointer bg-transparent border-none">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Portfolio selection */}
          {!creating && pIds.length > 0 ? (
            <div>
              <label className="text-[11px] text-t-txt2 font-semibold block mb-2">Portföy Seçin</label>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] font-semibold font-body cursor-pointer"
                style={{ border: "1px solid var(--bdr2)" }}>
                <option value="">Seçin...</option>
                {pIds.map(id => (
                  <option key={id} value={id}>{portfolios[id].name}</option>
                ))}
              </select>
              <button onClick={() => setCreating(true)}
                className="mt-2 text-[11px] text-t-accent font-semibold cursor-pointer bg-transparent border-none hover:opacity-80">
                + Yeni Portföy Oluştur
              </button>
            </div>
          ) : (
            <div>
              <label className="text-[11px] text-t-txt2 font-semibold block mb-2">Yeni Portföy Adı</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Örn: Enerji Oyunları"
                className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] font-semibold font-body outline-none placeholder:text-t-txt3"
                style={{ border: "1px solid var(--bdr2)" }} />
              {pIds.length > 0 && (
                <button onClick={() => setCreating(false)}
                  className="mt-2 text-[11px] text-t-accent font-semibold cursor-pointer bg-transparent border-none hover:opacity-80">
                  ← Mevcut portföyden seç
                </button>
              )}
            </div>
          )}

          {/* Entry price */}
          <div>
            <label className="text-[11px] text-t-txt2 font-semibold block mb-2">Giriş Fiyatı (₺)</label>
            <input type="number" step="0.01" value={entryPrice} onChange={e => setEntryPrice(e.target.value)}
              className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] font-bold font-mono outline-none"
              style={{ border: "1px solid var(--bdr2)" }} />
          </div>

          {/* Note */}
          <div>
            <label className="text-[11px] text-t-txt2 font-semibold block mb-2">Not (opsiyonel)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Breakout beklentisi..."
              className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] font-body outline-none placeholder:text-t-txt3"
              style={{ border: "1px solid var(--bdr2)" }} />
          </div>
        </div>

        <div className="p-[16px_20px] flex gap-3" style={{ borderTop: "1px solid var(--bdr)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-t-txt2 bg-t-bg3 cursor-pointer transition-all hover:bg-t-bg4 font-body"
            style={{ border: "1px solid var(--bdr2)" }}>İptal</button>
          <button onClick={handleAdd}
            className="flex-1 py-2.5 rounded-lg text-[12px] font-bold cursor-pointer transition-all hover:opacity-90 font-body"
            style={{ background: "linear-gradient(135deg, var(--c-accent), var(--accent-d))", color: "#fff", boxShadow: "0 4px 14px rgba(79,142,247,.3)" }}>
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
