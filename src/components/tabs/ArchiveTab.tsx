import { useState, useEffect, useRef } from "react";
import { fetchArsiv, getDownloadUrl, fetchSinyalArsiv, deleteSinyalArsiv } from "@/services/api";
import { useAppData } from "@/context/AppContext";
import type { ArsivFile } from "@/types/stock";

interface ManualFile {
  name: string;
  size: string;
  date: string;
  url: string;
}

interface SinyalRecord {
  hisse: string;
  tarih: string;
  saat: string;
  skor: number;
  giris: number;
  hedef: number;
  stop: number;
  sektor: string;
  fk?: number;
  temel_puan?: number;
  kombine_karar?: string;
  durum: string;
}

const STORAGE_KEY = "bisthinker-manual-files";

function loadManualFiles(): ManualFile[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

export default function ArchiveTab() {
  const { data } = useAppData();
  const [arsivFiles, setArsivFiles] = useState<ArsivFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualFiles, setManualFiles] = useState<ManualFile[]>(loadManualFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sinyalArsiv, setSinyalArsiv] = useState<Record<string, SinyalRecord>>({});
  const [sinyalLoading, setSinyalLoading] = useState(true);

  useEffect(() => {
    fetchArsiv()
      .then(setArsivFiles)
      .catch(() => {})
      .finally(() => setLoading(false));
    fetchSinyalArsiv()
      .then(setSinyalArsiv)
      .catch(() => {})
      .finally(() => setSinyalLoading(false));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: ManualFile[] = [];
    Array.from(files).forEach(file => {
      const size = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      newFiles.push({
        name: file.name,
        size,
        date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }),
        url: URL.createObjectURL(file),
      });
    });
    const updated = [...manualFiles, ...newFiles];
    setManualFiles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeManualFile = (index: number) => {
    const updated = manualFiles.filter((_, i) => i !== index);
    setManualFiles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleDeleteSinyal = async (key: string) => {
    try {
      await deleteSinyalArsiv(key);
      const copy = { ...sinyalArsiv };
      delete copy[key];
      setSinyalArsiv(copy);
    } catch {}
  };

  const sinyalEntries = Object.entries(sinyalArsiv).sort(([, a], [, b]) => {
    const dateA = a.tarih.split('.').reverse().join('-') + 'T' + (a.saat || '00:00');
    const dateB = b.tarih.split('.').reverse().join('-') + 'T' + (b.saat || '00:00');
    return dateB.localeCompare(dateA);
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-[18px] mt-8">
        <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px] bg-t-bg4"
          style={{ border: "1px solid var(--bdr)" }}>📋</div>
        <div>
          <h2 className="font-syne text-[15px] font-bold text-t-txt">Arşiv</h2>
          <p className="text-[11px] text-t-txt3 mt-[1px]">Sinyal arşivi ve tarama dosyaları</p>
        </div>
      </div>

      {/* Sinyal Arşivi */}
      <div className="bg-t-card rounded-xl overflow-hidden mb-5" style={{ border: "1px solid var(--bdr)" }}>
        <div className="p-[13px_20px] bg-t-bg2" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <h3 className="font-syne text-[13px] font-bold text-t-txt">⚡ Sinyal Arşivi</h3>
        </div>
        {sinyalLoading ? (
          <div className="p-8 text-center text-t-txt3 text-[12px]">Yükleniyor...</div>
        ) : sinyalEntries.length === 0 ? (
          <div className="p-8 text-center text-t-txt3">
            <div className="text-[32px] mb-2 opacity-40">📋</div>
            <div className="text-[12px] font-semibold text-t-txt2 mb-1">Henüz onaylı sinyal arşivi yok</div>
            <div className="text-[10px]">Taramalar sonrası otomatik dolacak.</div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {sinyalEntries.map(([key, rec]) => {
              const currentPrice = data[rec.hisse]?.close ?? rec.giris;
              const pnlPct = ((currentPrice - rec.giris) / rec.giris) * 100;
              const pnlTL = currentPrice - rec.giris;
              const gunFarki = Math.floor((Date.now() - new Date(rec.tarih.split('.').reverse().join('-')).getTime()) / 86400000);

              let durum = "AÇIK 🔄";
              if (currentPrice >= rec.hedef) durum = "HEDEF TUTTU ✅";
              if (currentPrice <= rec.stop) durum = "STOP OLDU ❌";

              const sureMetni = durum === "AÇIK 🔄"
                ? gunFarki + " gündür aktif"
                : durum === "HEDEF TUTTU ✅"
                ? gunFarki + " günde başarıldı"
                : gunFarki + " günde stop oldu";

              const range = rec.hedef - rec.stop;
              const currentPos = range > 0 ? Math.max(0, Math.min(100, ((currentPrice - rec.stop) / range) * 100)) : 50;
              const entryPos = range > 0 ? Math.max(0, Math.min(100, ((rec.giris - rec.stop) / range) * 100)) : 50;

              return (
                <div key={key} className="bg-t-bg3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
                  {/* Top */}
                  <div className="p-[12px_16px] flex items-center justify-between flex-wrap gap-2" style={{ borderBottom: "1px solid var(--bdr)" }}>
                    <div className="flex items-center gap-2.5">
                      <span className="font-syne text-[16px] font-extrabold text-t-txt">{rec.hisse}</span>
                      <span className="text-[10px] text-t-txt3">{rec.sektor}</span>
                      <span className="text-[10px] text-t-txt3 font-mono">{rec.tarih} {rec.saat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[14px] font-bold text-t-txt bg-t-bg4 px-2 py-0.5 rounded"
                        style={{ border: "1px solid var(--bdr2)" }}>{rec.skor}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        durum.includes("HEDEF") ? "bg-[var(--green-bg)] text-t-green border border-[var(--green-bdr)]" :
                        durum.includes("STOP") ? "bg-[var(--red-bg)] text-t-red border border-[var(--red-bdr)]" :
                        "bg-[var(--blue-bg)] text-t-blue-l border border-[rgba(59,130,246,.2)]"
                      }`}>{durum}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="p-[12px_16px]">
                    <div className="flex items-center gap-2 text-[10px] text-t-txt3 mb-1.5">
                      <span className="font-mono text-t-red">{rec.stop.toFixed(2)}</span>
                      <span className="flex-1 text-center text-[9px]">STOP → GİRİŞ → HEDEF</span>
                      <span className="font-mono text-t-green">{rec.hedef.toFixed(2)}</span>
                    </div>
                    <div className="relative h-[6px] bg-t-bg4 rounded-full overflow-visible">
                      {/* Entry marker */}
                      <div className="absolute top-[-2px] w-[2px] h-[10px] bg-t-txt3 rounded-full z-10" style={{ left: `${entryPos}%` }} />
                      {/* Fill */}
                      <div className="absolute top-0 left-0 h-full rounded-full" style={{
                        width: `${currentPos}%`,
                        background: currentPos >= entryPos ? "var(--c-green)" : "var(--c-red)",
                      }} />
                      {/* Current marker */}
                      <div className="absolute top-[-4px] w-[10px] h-[14px] rounded-sm z-20 flex items-center justify-center"
                        style={{ left: `calc(${currentPos}% - 5px)`, background: currentPos >= entryPos ? "var(--c-green)" : "var(--c-red)" }}>
                        <span className="text-[6px] font-bold text-white">●</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-t-txt3 text-center mt-1 font-mono">
                      Giriş: {rec.giris.toFixed(2)} · Güncel: {currentPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Bottom stats */}
                  <div className="p-[10px_16px] flex items-center justify-between flex-wrap gap-2 text-[11px]" style={{ borderTop: "1px solid var(--bdr)" }}>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold ${pnlPct >= 0 ? "text-t-green" : "text-t-red"}`}>
                        {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                      </span>
                      <span className={`font-mono font-bold ${pnlTL >= 0 ? "text-t-green" : "text-t-red"}`}>
                        {pnlTL >= 0 ? "+" : ""}{pnlTL.toFixed(2)} ₺
                      </span>
                      <span className="text-t-txt3">{sureMetni}</span>
                      {rec.fk != null && <span className="text-t-txt3">F/K: {rec.fk.toFixed(1)}</span>}
                    </div>
                    <button onClick={() => handleDeleteSinyal(key)}
                      className="text-[10px] font-bold cursor-pointer px-2 py-1 rounded transition-all bg-transparent border-none"
                      style={{ color: "var(--c-red)" }}>
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archive Files from API */}
      <div className="bg-t-card rounded-xl overflow-hidden mb-5" style={{ border: "1px solid var(--bdr)" }}>
        <div className="p-[13px_20px] bg-t-bg2" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <h3 className="font-syne text-[13px] font-bold text-t-txt">Tarama Geçmişi — Excel Dosyaları</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-t-txt3">Yükleniyor...</div>
        ) : arsivFiles.length === 0 ? (
          <div className="p-8 text-center text-t-txt3">Arşiv dosyası bulunamadı</div>
        ) : (
          <div className="p-4 space-y-2">
            {arsivFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-[12px_16px] bg-t-bg3 rounded-lg"
                style={{ border: "1px solid var(--bdr)" }}>
                <div>
                  <div className="text-[12px] font-semibold text-t-txt">{f.ad}</div>
                  <div className="text-[10px] text-t-txt3">{f.boyut}</div>
                </div>
                <a href={getDownloadUrl(f.ad)} download
                  className="px-3 py-[5px] rounded-lg text-[11px] font-bold text-t-accent cursor-pointer no-underline transition-all hover:opacity-80"
                  style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.25)" }}>
                  📥 İndir
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual File Upload */}
      <div className="bg-t-card rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
        <div className="p-[13px_20px] bg-t-bg2 flex items-center justify-between" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <h3 className="font-syne text-[13px] font-bold text-t-txt">📎 Manuel Dosya Ekleme</h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-[6px] rounded-lg text-[11px] font-bold cursor-pointer transition-all"
            style={{
              background: "linear-gradient(135deg, var(--c-accent), var(--accent-d))",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(79,142,247,.3)",
              border: "none",
            }}>
            + Dosya Yükle
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,.pdf,.txt,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {manualFiles.length === 0 ? (
          <div className="p-8 text-center text-t-txt3">
            <div className="text-[32px] mb-2 opacity-40">📂</div>
            <div className="text-[12px] font-semibold text-t-txt2 mb-1">Henüz dosya eklenmedi</div>
            <div className="text-[10px]">Excel, CSV, PDF veya diğer dosyaları buraya yükleyebilirsiniz</div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {manualFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-[12px_16px] bg-t-bg3 rounded-lg"
                style={{ border: "1px solid var(--bdr)" }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-t-txt truncate">{f.name}</div>
                  <div className="text-[10px] text-t-txt3">{f.size} · {f.date}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {f.url.startsWith("blob:") && (
                    <a href={f.url} download={f.name}
                      className="px-2.5 py-[4px] rounded-lg text-[10px] font-bold text-t-accent cursor-pointer no-underline transition-all hover:opacity-80"
                      style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.25)" }}>
                      📥
                    </a>
                  )}
                  <button onClick={() => removeManualFile(i)}
                    className="px-2.5 py-[4px] rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    style={{ background: "var(--red-bg)", color: "var(--c-red)", border: "1px solid var(--red-bdr)" }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
