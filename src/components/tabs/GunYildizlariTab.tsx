import { useState, useEffect } from "react";
import { fetchSinyalArsiv, fetchPortfolio, savePortfolioAPI, fetchFinansAnaliz } from "@/services/api";
import { useAppData } from "@/context/AppContext";
import PriceProgressBar from "@/components/PriceProgressBar";

interface SinyalRecord {
  hisse: string; tarih: string; saat: string; skor: number;
  giris: number; hedef: number; stop: number; sektor: string;
  durum: string; sonuc_tarih?: string; kap_kategori?: string;
  kar_bolgesi_aktif?: boolean; risk_bolgesi_aktif?: boolean;
  temel_tier?: string;
}

const NEG_KAP = ["devre_kesici","iceriden_satis","sermaye_artirimi","kritik_negatif"];
const POS_KAP = ["kurumsal_alim","temettu","pozitif_haber"];

function kriter_puani(r: SinyalRecord): number {
  let p = 0;
  if ((r.skor??0) >= 80) p += 3;
  else if ((r.skor??0) >= 75) p += 2;
  else p += 1;
  const kap = r.kap_kategori ?? "";
  if (!NEG_KAP.includes(kap)) p += 1;
  if (POS_KAP.includes(kap)) p += 1;
  if (!r.risk_bolgesi_aktif) p += 1;
  if (r.temel_tier !== "RED") p += 1;
  return p;
}

function KapBadge({ kategori }: { kategori?: string }) {
  if (!kategori) return null;
  const map: Record<string, { label: string; renk: string; bg: string }> = {
    devre_kesici:    { label: "DEVRE KESİCİ", renk: "#E05252", bg: "rgba(224,82,82,0.15)" },
    iceriden_satis:  { label: "İÇERİDEN SATIŞ", renk: "#E05252", bg: "rgba(224,82,82,0.15)" },
    sermaye_artirimi:{ label: "SERMAYE ARTIRIMI", renk: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
    kritik_negatif:  { label: "KRİTİK HABER", renk: "#E05252", bg: "rgba(224,82,82,0.15)" },
    kurumsal_alim:   { label: "KURUMSAL ALIM", renk: "#2CC98A", bg: "rgba(44,201,138,0.15)" },
    temettu:         { label: "TEMETTÜ", renk: "#2CC98A", bg: "rgba(44,201,138,0.15)" },
    pozitif_haber:   { label: "POZİTİF HABER", renk: "#2CC98A", bg: "rgba(44,201,138,0.15)" },
  };
  const m = map[kategori];
  if (!m) return null;
  return <span style={{fontSize:8,fontWeight:700,color:m.renk,background:m.bg,padding:"1px 5px",borderRadius:3,marginLeft:2}}>{NEG_KAP.includes(kategori) ? "🚫" : "✅"} {m.label}</span>;
}

function SinyalKart({ keyStr, rec, data, gizliOverlay, setGizliOverlay, onPortfoyEkle }: {
  keyStr: string; rec: SinyalRecord; data: Record<string, any>;
  gizliOverlay: Set<string>; setGizliOverlay: (fn: (p: Set<string>) => Set<string>) => void;
  onPortfoyEkle?: (rec: SinyalRecord) => void;
}) {
  const isClosed = rec.durum === "HEDEF TUTTU" || rec.durum === "STOP LOSS" || rec.durum === "TRAILING STOP";
  const currentPrice = data[rec.hisse]?.close ?? rec.giris;
  const pnlPct = rec.giris > 0 ? ((currentPrice - rec.giris) / rec.giris * 100) : 0;
  const pnlTL = currentPrice - rec.giris;
  const gunFarki = (() => { try { return Math.max(0,Math.floor((Date.now()-new Date(rec.tarih.split(".").reverse().join("-")).getTime())/86400000)); } catch { return 0; } })();

  let durum = "AÇIK 🔄";
  if (rec.durum === "HEDEF TUTTU") durum = "HEDEF TUTTU ✅";
  else if (rec.durum === "STOP LOSS") durum = "STOP OLDU ❌";
  else if (rec.durum === "TRAILING STOP") durum = "TRAILING ✅";

  const sureMetni = durum === "AÇIK 🔄" ? gunFarki + " gündür aktif"
    : durum.includes("HEDEF") || durum.includes("TRAILING") ? gunFarki + " günde başarıldı"
    : gunFarki + " günde stop oldu";

  const isHedef = rec.durum === "HEDEF TUTTU";
  const isStop = rec.durum === "STOP LOSS";
  const overlayVisible = (isHedef || isStop) && !gizliOverlay.has(keyStr);
  const sonucTarih = rec.sonuc_tarih || "";

  return (
    <div className="rounded-xl overflow-hidden" style={{border:"1px solid var(--bdr)", position:"relative", background:"var(--bg3)"}}>
      <div className="p-[10px_14px] flex items-center justify-between flex-wrap gap-2" style={{borderBottom:"1px solid var(--bdr)"}}>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-syne text-[14px] font-extrabold text-t-txt">{rec.hisse}</span>
          {rec.kar_bolgesi_aktif && rec.durum === "AÇIK" && <span style={{fontSize:8,color:"#2CC98A",fontWeight:700,background:"rgba(44,201,138,0.15)",padding:"1px 4px",borderRadius:3}}>🛡️ KÂR</span>}
          {rec.risk_bolgesi_aktif && rec.durum === "AÇIK" && <span style={{fontSize:8,color:"#F59E0B",fontWeight:700,background:"rgba(245,158,11,0.15)",padding:"1px 4px",borderRadius:3}}>⚠️ RİSK</span>}
          <KapBadge kategori={rec.kap_kategori} />
          <span className="text-[9px] text-t-txt3">{rec.sektor}</span>
          <span className="text-[9px] text-t-txt3 font-mono">{rec.tarih} {rec.saat}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] font-bold text-t-txt bg-t-bg4 px-2 py-0.5 rounded" style={{border:"1px solid var(--bdr2)"}}>{rec.skor}p</span>
          {gunFarki >= 15 && <span style={{fontSize:10,color:"#E05252",fontWeight:700}}>⏰ 15g+</span>}
          {gunFarki >= 10 && gunFarki < 15 && <span style={{fontSize:10,color:"#F97316",fontWeight:700}}>⏰ 10g</span>}
          {gunFarki >= 5 && gunFarki < 10 && <span style={{fontSize:10,color:"#F59E0B",fontWeight:700}}>⏰ 5g</span>}
          <span className={"text-[10px] font-bold px-2 py-0.5 rounded " + (durum.includes("HEDEF") || durum.includes("TRAILING") ? "bg-[var(--green-bg)] text-t-green border border-[var(--green-bdr)]" : durum.includes("STOP") ? "bg-[var(--red-bg)] text-t-red border border-[var(--red-bdr)]" : "bg-[var(--blue-bg)] text-t-blue-l border border-[rgba(59,130,246,.2)]")}>{durum}</span>
        </div>
      </div>
      <div className="p-[10px_14px]">
        <PriceProgressBar stop={rec.stop} giris={rec.giris} hedef={rec.hedef} currentPrice={currentPrice} durum={durum} />
      </div>
      <div className="p-[8px_14px] flex items-center justify-between flex-wrap gap-2 text-[11px]" style={{borderTop:"1px solid var(--bdr)"}}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={"font-mono font-bold " + (pnlPct >= 0 ? "text-t-green" : "text-t-red")}>{pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%</span>
          <span className={"font-mono font-bold " + (pnlTL >= 0 ? "text-t-green" : "text-t-red")}>{pnlTL >= 0 ? "+" : ""}{pnlTL.toFixed(2)} ₺</span>
          <span className="text-t-txt3">{sureMetni}</span>
          <span className="text-t-txt3 font-mono">{currentPrice.toFixed(2)} ₺</span>
        </div>
      </div>

      {overlayVisible && isHedef && (() => {
        const kapPnlTL = rec.hedef - rec.giris;
        const kapPnlPct = rec.giris > 0 ? (kapPnlTL / rec.giris * 100) : 0;
        let kapSure = 0;
        try { const [d,m,y]=rec.tarih.split(".").map(Number); const [d2,m2,y2]=(rec.sonuc_tarih||"").split(" ")[0].split(".").map(Number); kapSure=Math.max(0,Math.floor((new Date(y2,m2-1,d2).getTime()-new Date(y,m-1,d).getTime())/86400000)); } catch {}
        return (
          <div style={{position:"absolute",inset:0,borderRadius:12,background:"rgba(10,25,20,0.94)",border:"2px solid rgba(44,201,138,0.5)",backdropFilter:"blur(6px)",zIndex:30,display:"flex",flexDirection:"column"}}>
            <button onClick={() => setGizliOverlay(p => new Set(p).add(keyStr))} style={{position:"absolute",top:8,right:10,background:"none",border:"none",color:"rgba(44,201,138,0.6)",fontSize:18,cursor:"pointer",zIndex:31}}>✕</button>
            <div style={{textAlign:"center",padding:"6px 0 5px",borderBottom:"1px solid rgba(44,201,138,0.3)",background:"rgba(44,201,138,0.06)"}}>
              <span style={{fontSize:13,fontWeight:700,color:"#2CC98A",letterSpacing:2}}>🏆 {rec.hisse}</span>
            </div>
            <div style={{display:"flex",padding:"8px 14px 12px",gap:14,flex:1}}>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:4,paddingRight:12,borderRight:"1px solid rgba(44,201,138,0.3)"}}>
                <div style={{fontSize:10,color:"#2CC98A",fontWeight:700}}>KAPANIŞ</div>
                <div style={{fontSize:11,color:"#2CC98A"}}>Giriş: <b>{rec.giris.toFixed(2)} ₺</b> · {rec.tarih}</div>
                <div style={{fontSize:11,color:"#2CC98A"}}>Hedef: <b>{rec.hedef.toFixed(2)} ₺</b> · {sonucTarih}</div>
                <div style={{fontSize:12,color:"#2CC98A",fontWeight:700}}>+{kapPnlPct.toFixed(1)}% / +{kapPnlTL.toFixed(2)} ₺ · {kapSure} gün</div>
              </div>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontSize:10,color:"#2CC98A",fontWeight:700}}>📊 GÜNCEL</div>
                <div style={{fontSize:11,color:"#2CC98A"}}>Fiyat: <b>{currentPrice.toFixed(2)} ₺</b></div>
                <div style={{fontSize:11,color:"#2CC98A"}}>Giriş: <b>{rec.giris.toFixed(2)} ₺</b> · {rec.tarih}</div>
                <div style={{fontSize:12,color:pnlPct>=0?"#2CC98A":"#E05252",fontWeight:700}}>{pnlPct>=0?"+":""}{pnlPct.toFixed(1)}% / {pnlTL>=0?"+":""}{pnlTL.toFixed(2)} ₺ · {gunFarki} gün</div>
              </div>
            </div>
          </div>
        );
      })()}

      {overlayVisible && isStop && (() => {
        const kapPnlTL = rec.stop - rec.giris;
        const kapPnlPct = rec.giris > 0 ? (kapPnlTL / rec.giris * 100) : 0;
        let kapSure = 0;
        try { const [d,m,y]=rec.tarih.split(".").map(Number); const [d2,m2,y2]=(rec.sonuc_tarih||"").split(" ")[0].split(".").map(Number); kapSure=Math.max(0,Math.floor((new Date(y2,m2-1,d2).getTime()-new Date(y,m-1,d).getTime())/86400000)); } catch {}
        return (
          <div style={{position:"absolute",inset:0,borderRadius:12,background:"rgba(25,10,10,0.94)",border:"2px solid rgba(224,82,82,0.5)",backdropFilter:"blur(6px)",zIndex:30,display:"flex",flexDirection:"column"}}>
            <button onClick={() => setGizliOverlay(p => new Set(p).add(keyStr))} style={{position:"absolute",top:8,right:10,background:"none",border:"none",color:"rgba(224,82,82,0.6)",fontSize:18,cursor:"pointer",zIndex:31}}>✕</button>
            <div style={{textAlign:"center",padding:"6px 0 5px",borderBottom:"1px solid rgba(224,82,82,0.3)",background:"rgba(224,82,82,0.06)"}}>
              <span style={{fontSize:13,fontWeight:700,color:"#E05252",letterSpacing:2}}>💀 {rec.hisse}</span>
            </div>
            <div style={{display:"flex",padding:"8px 14px 12px",gap:14,flex:1}}>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:4,paddingRight:12,borderRight:"1px solid rgba(224,82,82,0.3)"}}>
                <div style={{fontSize:10,color:"#E05252",fontWeight:700}}>KAPANIŞ</div>
                <div style={{fontSize:11,color:"#E05252"}}>Giriş: <b>{rec.giris.toFixed(2)} ₺</b> · {rec.tarih}</div>
                <div style={{fontSize:11,color:"#E05252"}}>Stop: <b>{rec.stop.toFixed(2)} ₺</b> · {sonucTarih}</div>
                <div style={{fontSize:12,color:"#E05252",fontWeight:700}}>{kapPnlPct.toFixed(1)}% / {kapPnlTL.toFixed(2)} ₺ · {kapSure} gün</div>
              </div>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontSize:10,color:"#E05252",fontWeight:700}}>📊 GÜNCEL</div>
                <div style={{fontSize:11,color:"#E05252"}}>Fiyat: <b>{currentPrice.toFixed(2)} ₺</b></div>
                <div style={{fontSize:11,color:"#E05252"}}>Giriş: <b>{rec.giris.toFixed(2)} ₺</b> · {rec.tarih}</div>
                <div style={{fontSize:12,color:pnlPct>=0?"#2CC98A":"#E05252",fontWeight:700}}>{pnlPct>=0?"+":""}{pnlPct.toFixed(1)}% / {pnlTL>=0?"+":""}{pnlTL.toFixed(2)} ₺ · {gunFarki} gün</div>
              </div>
            </div>
          </div>
        );
      })()}
      {onPortfoyEkle && rec.durum === "AÇIK" && (
        <div style={{padding:"0 14px 10px"}}>
          <button onClick={() => onPortfoyEkle(rec)}
            style={{width:"100%",fontSize:10,fontWeight:700,padding:"6px",borderRadius:8,background:"rgba(44,201,138,0.1)",color:"#2CC98A",border:"1px solid rgba(44,201,138,0.3)",cursor:"pointer"}}>
            + Portföye Ekle
          </button>
        </div>
      )}
    </div>
  );
}


function PortfoyEkleModal({ rec, portfolyolar, onEkle, onKapat }: {
  rec: SinyalRecord;
  portfolyolar: Record<string, any>;
  onEkle: (pId: string, rec: SinyalRecord, not: string) => void;
  onKapat: () => void;
}) {
  const [seciliPortfoy, setSeciliPortfoy] = useState("");
  const [not, setNot] = useState("");
  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4" onClick={onKapat}>
      <div className="absolute inset-0 bg-[rgba(0,0,0,.7)]" />
      <div className="relative bg-t-bg2 rounded-2xl w-full max-w-[420px] animate-fade-in" style={{border:"1px solid var(--bdr2)"}} onClick={e => e.stopPropagation()}>
        <div className="p-[18px_20px] flex justify-between items-center" style={{borderBottom:"1px solid var(--bdr)"}}>
          <h3 className="font-syne text-[16px] font-bold text-t-txt">Portföye Ekle</h3>
          <button onClick={onKapat} className="text-t-txt3 text-[18px] cursor-pointer bg-transparent border-none">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="text-[12px] text-t-txt3 font-mono">{rec.hisse} · {rec.giris.toFixed(2)} ₺</div>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-t-txt3">
            <div>Stop: <b className="text-t-red">{rec.stop.toFixed(2)} ₺</b></div>
            <div>Hedef: <b className="text-t-green">{rec.hedef.toFixed(2)} ₺</b></div>
            <div>Skor: <b className="text-t-txt">{rec.skor}p</b></div>
          </div>
          <div>
            <label className="text-[11px] text-t-txt2 font-semibold block mb-1.5">Portföy Seçin</label>
            <select value={seciliPortfoy} onChange={e => setSeciliPortfoy(e.target.value)}
              className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[13px] outline-none"
              style={{border:"1px solid var(--bdr2)"}}>
              <option value="">Seçin...</option>
              {Object.entries(portfolyolar).map(([pId, p]: [string, any]) => (
                <option key={pId} value={pId}>{p.name} ({(p.stocks||[]).length} hisse)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-t-txt2 font-semibold block mb-1.5">Not (opsiyonel)</label>
            <input type="text" value={not} onChange={e => setNot(e.target.value)} placeholder="Breakout beklentisi..."
              className="w-full p-[8px_12px] bg-t-bg3 text-t-txt rounded-lg text-[12px] outline-none placeholder:text-t-txt3"
              style={{border:"1px solid var(--bdr2)"}} />
          </div>
        </div>
        <div className="p-[16px_20px] flex gap-3" style={{borderTop:"1px solid var(--bdr)"}}>
          <button onClick={onKapat} className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-t-txt2 bg-t-bg3 cursor-pointer" style={{border:"1px solid var(--bdr2)"}}>İptal</button>
          <button onClick={() => seciliPortfoy && onEkle(seciliPortfoy, rec, not)}
            className="flex-1 py-2.5 rounded-lg text-[12px] font-bold cursor-pointer"
            style={{background: seciliPortfoy ? "linear-gradient(135deg, var(--c-accent), var(--accent-d))" : "var(--bg3)", color: seciliPortfoy ? "#fff" : "var(--t-txt3)"}}>
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GunYildizlariTab() {
  const { data } = useAppData();
  const [sinyalArsiv, setSinyalArsiv] = useState<Record<string, SinyalRecord>>({});
  const [loading, setLoading] = useState(true);
  const [acikGunler, setAcikGunler] = useState<Record<string, boolean>>({});
  const [gizliOverlay, setGizliOverlay] = useState<Set<string>>(new Set());
  const [girmeHisseler, setGirmeHisseler] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFinansAnaliz().then(data => {
      const girme = new Set(
        Object.values(data)
          .filter((v: any) => v.karar === "GİRME" || v.karar === "GEÇ")
          .map((v: any) => v.hisse)
      );
      setGirmeHisseler(girme);
    }).catch(() => {});
  }, []);
  const [portfolyolar, setPortfolyolar] = useState<Record<string, any>>({});
  const [portfoyEkleRec, setPortfoyEkleRec] = useState<SinyalRecord | null>(null);

  useEffect(() => {
    fetchPortfolio().then(setPortfolyolar).catch(() => {});
  }, []);

  const portfoyeEkle = async (pId: string, rec: SinyalRecord, not: string = "") => {
    const guncel = portfolyolar[pId];
    if (!guncel) return;
    const yeniHisse = {
      ticker: rec.hisse,
      price: rec.giris,
      stop: rec.stop,
      target: rec.hedef,
      date: new Date().toISOString(),
      note: not,
    };
    const guncellenmis = {
      ...portfolyolar,
      [pId]: { ...guncel, stocks: [...(guncel.stocks || []), yeniHisse] }
    };
    await savePortfolioAPI(guncellenmis);
    setPortfolyolar(guncellenmis);
    setPortfoyEkleRec(null);
    alert(rec.hisse + " portföye eklendi!");
  };

  useEffect(() => {
    fetchSinyalArsiv().then(setSinyalArsiv).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const bugun = new Date();
  const bugunStr = String(bugun.getDate()).padStart(2,"0") + "." + String(bugun.getMonth()+1).padStart(2,"0") + "." + bugun.getFullYear();
  const allRecords = Object.entries(sinyalArsiv);
  const gunler: Record<string, [string, SinyalRecord][]> = {};
  allRecords.forEach(([key, rec]) => {
    if (!rec?.tarih) return;
    if (!gunler[rec.tarih]) gunler[rec.tarih] = [];
    if ((rec.skor ?? 0) >= 65) gunler[rec.tarih].push([key, rec]);
  });

  const siraliGunler = Object.keys(gunler).sort((a, b) => {
    const [da,ma,ya] = a.split(".").map(Number);
    const [db,mb,yb] = b.split(".").map(Number);
    return new Date(yb,mb-1,db).getTime() - new Date(ya,ma-1,da).getTime();
  });

  // Tum gunler default kapali, sadece bugun acik
  useEffect(() => {
    setAcikGunler(p => ({...p, [bugunStr]: true}));
  }, [bugunStr]);

  // En iyi adaylar — bugune ozel, kriterleri gecenler
  const tickers = Object.keys(data);
  const breadth = tickers.length > 0 ? Math.round(tickers.filter(t => (data[t] as any).close > (data[t] as any).prev_close).length / tickers.length * 100) : 50;
  const isRiskYuksek = breadth < 20;
  const bugunKayitlar = gunler[bugunStr] ?? [];
  const enIyiAdaylar = [...bugunKayitlar]
    .map(([k, r]) => ({ k, r, puan: kriter_puani(r) }))
    .filter(a => !NEG_KAP.includes(a.r.kap_kategori ?? "") && !a.r.risk_bolgesi_aktif && a.puan >= 5 && (a.r as any).confirmed === true && !girmeHisseler.has(a.r.hisse))
    .sort((a, b) => b.puan - a.puan);

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-t-txt3">Yükleniyor...</span></div>;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">⭐</span>
        <h2 className="font-syne text-lg font-bold text-t-txt">Günün Yıldızları</h2>
        <span className="text-xs text-t-txt3 bg-t-bg3 px-2 py-1 rounded" style={{border:"1px solid var(--bdr)"}}>
          {siraliGunler.length} gün · {allRecords.length} sinyal
        </span>
      </div>

      {/* EN IYI ADAYLAR */}
      <div className="rounded-xl overflow-hidden" style={{border:"2px solid rgba(44,201,138,0.3)", background:"var(--bg2)"}}>
        <div className="p-3 flex items-center gap-2 flex-wrap" style={{background:"rgba(44,201,138,0.06)", borderBottom:"1px solid rgba(44,201,138,0.2)"}}>
          <span className="text-sm">⭐</span>
          <span className="font-syne font-bold text-sm" style={{color:"#2CC98A"}}>BUGÜNÜN EN İYİ ADAYLARI</span>
          <span className="text-xs" style={{color:"#475569"}}>{bugunStr}</span>
          {enIyiAdaylar.length > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded" style={{background:"rgba(44,201,138,0.15)",color:"#2CC98A"}}>{enIyiAdaylar.length} aday</span>}
          {isRiskYuksek && <span className="text-xs font-bold px-2 py-0.5 rounded" style={{background:"rgba(224,82,82,0.15)",color:"#E05252"}}>⚠️ Risk Yüksek — Küçük Pozisyon</span>}
        </div>
        {enIyiAdaylar.length === 0 ? (
          <div className="p-6 text-center text-t-txt3 text-sm">Bugün kriterleri geçen aday yok</div>
        ) : (
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {enIyiAdaylar.map(({ k, r }) => (
              <SinyalKart key={k} keyStr={k} rec={r} data={data} gizliOverlay={gizliOverlay} setGizliOverlay={setGizliOverlay} onPortfoyEkle={setPortfoyEkleRec} />
            ))}
          </div>
        )}
      </div>

      <div style={{height:"1px", background:"var(--bdr)", margin:"8px 0"}}></div>

      {/* GUNLUK SINYALLER */}
      {siraliGunler.map(gun => {
        const kayitlar = gunler[gun] ?? [];
        const isToday = gun === bugunStr;
        const isAcik = acikGunler[gun] ?? false;
        const hedefSayisi = kayitlar.filter(([,r]) => r?.durum === "HEDEF TUTTU").length;
        const stopSayisi = kayitlar.filter(([,r]) => r?.durum === "STOP LOSS").length;
        const acikSayisi = kayitlar.filter(([,r]) => r?.durum === "AÇIK").length;
        const skorlar = kayitlar.map(([,r]) => r?.skor ?? 0).filter(s => s > 0);
        const maxSkor = skorlar.length > 0 ? Math.max(...skorlar) : 0;

        return (
          <div key={gun} className="rounded-xl overflow-hidden" style={{border:"1px solid " + (isToday ? "rgba(251,191,36,0.4)" : "var(--bdr)"), background:"var(--bg2)"}}>
            <button onClick={() => setAcikGunler(p => ({...p, [gun]: !p[gun]}))}
              className="w-full flex items-center justify-between p-3"
              style={{background: isToday ? "rgba(251,191,36,0.06)" : "var(--bg3)"}}>
              <div className="flex items-center gap-3">
                {isToday && <span className="text-yellow-400 text-sm font-bold">⭐ BUGÜN</span>}
                <span className="font-syne font-bold text-t-txt text-sm">{gun}</span>
                <span className="text-xs text-t-txt3">{kayitlar.length} sinyal</span>
                {maxSkor > 0 && <span className="text-xs font-mono" style={{color:"#2CC98A"}}>MAX {maxSkor}p</span>}
              </div>
              <div className="flex items-center gap-2">
                {hedefSayisi > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{background:"rgba(44,201,138,0.15)",color:"#2CC98A"}}>✅ {hedefSayisi}</span>}
                {stopSayisi > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{background:"rgba(224,82,82,0.15)",color:"#E05252"}}>🛑 {stopSayisi}</span>}
                {acikSayisi > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{background:"rgba(59,130,246,0.15)",color:"#60A5FA"}}>🔄 {acikSayisi}</span>}
                <span className="text-t-txt3 text-xs ml-2">{isAcik ? "▲" : "▼"}</span>
              </div>
            </button>
            {isAcik && (
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {[...kayitlar].sort((a,b) => (b[1]?.skor??0)-(a[1]?.skor??0)).map(([key, rec]) => {
                  if (!rec) return null;
                  if (isToday && enIyiAdaylar.some(a => a.k === key)) return null;
                  return <SinyalKart key={key} keyStr={key} rec={rec} data={data} gizliOverlay={gizliOverlay} setGizliOverlay={setGizliOverlay} onPortfoyEkle={setPortfoyEkleRec} />;
                })}
              </div>
            )}
          </div>
        );
      })}
      {siraliGunler.length === 0 && <div className="text-center text-t-txt3 py-12">Henüz sinyal arşivi yok</div>}

      {portfoyEkleRec && (
        <PortfoyEkleModal
          rec={portfoyEkleRec}
          portfolyolar={portfolyolar}
          onEkle={portfoyeEkle}
          onKapat={() => setPortfoyEkleRec(null)}
        />
      )}
    </div>
  );
}
