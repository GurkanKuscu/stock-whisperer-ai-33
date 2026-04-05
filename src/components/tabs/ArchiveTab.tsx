import { useState, useEffect, useRef } from "react";
import { fetchArsiv, getDownloadUrl, fetchSinyalArsiv, deleteSinyalArsiv } from "@/services/api";
import { useAppData } from "@/context/AppContext";
import PriceProgressBar from "@/components/PriceProgressBar";
import type { ArsivFile } from "@/types/stock";

const API_BASE = "http://207.154.212.100:8080";

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
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function parseDateFromName(name: string): string {
  const m = name.match(/(\d{4})-(\d{2})-(\d{2})[_-](\d{2})-(\d{2})/);
  if (!m) return name;
  const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  return `${parseInt(m[3])} ${months[parseInt(m[2])-1]} · ${m[4]}:${m[5]}`;
}

const SLOTLAR = ['10:30', '12:00', '15:00', '18:30'];
const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];

const SABIT_TATILLER = ['01-01','04-23','05-01','05-19','07-15','08-30','10-29'];
const DEGISKEN_TATILLER_2026 = [
  '2026-06-05','2026-06-06','2026-06-07','2026-06-08','2026-06-09',
];

function isTatil(tarih: string): boolean {
  const ayGun = tarih.slice(5);
  if (SABIT_TATILLER.includes(ayGun)) return true;
  if (DEGISKEN_TATILLER_2026.includes(tarih)) return true;
  return false;
}

function getWeeks(files: ArsivFile[]): { label: string; gunler: { tarih: string; gunAdi: string; gun: string }[] }[] {
  // Collect all dates from files
  const dates = new Set<string>();
  files.forEach(f => {
    const m = f.ad.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) dates.add(`${m[1]}-${m[2]}-${m[3]}`);
  });
  // Add current week dates
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.add(d.toISOString().slice(0, 10));
  }
  // Group by ISO week
  const weekMap = new Map<string, { tarih: string; gunAdi: string; gun: string }[]>();
  const allDates = [...dates].sort().reverse();
  allDates.forEach(dateStr => {
    const d = new Date(dateStr);
    const day = d.getDay();
    if (day === 0 || day === 6) return; // skip weekends
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    const weekKey = monday.toISOString().slice(0, 10);
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    const gunAdi = GUNLER[(day + 6) % 7];
    const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
    weekMap.get(weekKey)!.push({ tarih: dateStr, gunAdi, gun: `${d.getDate()}` });
  });
  // Build week objects with full 5 days
  const weeks: { label: string; gunler: { tarih: string; gunAdi: string; gun: string }[] }[] = [];
  const sortedKeys = [...weekMap.keys()].sort().reverse();
  const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  sortedKeys.slice(0, 4).forEach(mondayStr => {
    const mon = new Date(mondayStr);
    const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    const label = `${mon.getDate()} ${months[mon.getMonth()]} – ${fri.getDate()} ${months[fri.getMonth()]} ${fri.getFullYear()}`;
    const gunler: { tarih: string; gunAdi: string; gun: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      const ds = d.toISOString().slice(0, 10);
      gunler.push({ tarih: ds, gunAdi: GUNLER[i], gun: `${d.getDate()}` });
    }
    weeks.push({ label, gunler });
  });
  return weeks;
}

export default function ArchiveTab() {
  const { data } = useAppData();
  const [arsivFiles, setArsivFiles] = useState<ArsivFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualFiles, setManualFiles] = useState<ManualFile[]>(loadManualFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sinyalArsiv, setSinyalArsiv] = useState<Record<string, SinyalRecord>>({});
  const [sinyalLoading, setSinyalLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchArsiv().then(setArsivFiles).catch(() => {}).finally(() => setLoading(false));
    fetchSinyalArsiv().then(setSinyalArsiv).catch(() => {}).finally(() => setSinyalLoading(false));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: ManualFile[] = [];
    Array.from(files).forEach(file => {
      const size = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
      newFiles.push({ name: file.name, size, date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }), url: URL.createObjectURL(file) });
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
    try { await deleteSinyalArsiv(key); const copy = { ...sinyalArsiv }; delete copy[key]; setSinyalArsiv(copy); } catch {}
  };

  const handleDeleteFile = async (name: string) => {
    try {
      await fetch(`${API_BASE}/api/arsiv/sil/${name}`);
      setArsivFiles(prev => prev.filter(f => f.ad !== name));
    } catch {}
  };

  const toggleSelect = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === arsivFiles.length) setSelected(new Set());
    else setSelected(new Set(arsivFiles.map(f => f.ad)));
  };

  const sinyalEntries = Object.entries(sinyalArsiv).sort(([, a], [, b]) => {
    const dateA = a.tarih.split('.').reverse().join('-') + 'T' + (a.saat || '00:00');
    const dateB = b.tarih.split('.').reverse().join('-') + 'T' + (b.saat || '00:00');
    return dateB.localeCompare(dateA);
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-[18px] mt-8">
        <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px] bg-t-bg4" style={{ border: "1px solid var(--bdr)" }}>📋</div>
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
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sinyalEntries.map(([key, rec]) => {
              const currentPrice = data[rec.hisse]?.close ?? rec.giris;
              const pnlPct = ((currentPrice - rec.giris) / rec.giris) * 100;
              const pnlTL = currentPrice - rec.giris;
              const gunFarki = Math.max(0, Math.floor((Date.now() - new Date(rec.tarih.split('.').reverse().join('-')).getTime()) / 86400000));

              let durum = "AÇIK 🔄";
              if (currentPrice >= rec.hedef) durum = "HEDEF TUTTU ✅";
              if (currentPrice <= rec.stop) durum = "STOP OLDU ❌";

              const sureMetni = durum === "AÇIK 🔄"
                ? gunFarki + " gündür aktif"
                : durum === "HEDEF TUTTU ✅"
                ? gunFarki + " günde başarıldı"
                : gunFarki + " günde stop oldu";

              return (
                <div key={key} className="bg-t-bg3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
                  {/* Top */}
                  <div className="p-[12px_16px] flex items-center justify-between flex-wrap gap-2" style={{ borderBottom: "1px solid var(--bdr)" }}>
                    <div className="flex items-center gap-2">
                      <span className="font-syne text-[15px] font-extrabold text-t-txt">{rec.hisse}</span>
                      <span className="text-[10px] text-t-txt3">{rec.sektor}</span>
                      <span className="text-[9px] text-t-txt3 font-mono">{rec.tarih} {rec.saat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-t-txt bg-t-bg4 px-2 py-0.5 rounded" style={{ border: "1px solid var(--bdr2)" }}>{rec.skor}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        durum.includes("HEDEF") ? "bg-[var(--green-bg)] text-t-green border border-[var(--green-bdr)]" :
                        durum.includes("STOP") ? "bg-[var(--red-bg)] text-t-red border border-[var(--red-bdr)]" :
                        "bg-[var(--blue-bg)] text-t-blue-l border border-[rgba(59,130,246,.2)]"
                      }`}>{durum}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="p-[12px_16px]">
                    <PriceProgressBar stop={rec.stop} giris={rec.giris} hedef={rec.hedef} currentPrice={currentPrice} durum={durum} />
                  </div>

                  {/* Bottom stats */}
                  <div className="p-[10px_16px] flex items-center justify-between flex-wrap gap-2 text-[11px]" style={{ borderTop: "1px solid var(--bdr)" }}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`font-mono font-bold ${pnlPct >= 0 ? "text-t-green" : "text-t-red"}`}>
                        {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                      </span>
                      <span className={`font-mono font-bold ${pnlTL >= 0 ? "text-t-green" : "text-t-red"}`}>
                        {pnlTL >= 0 ? "+" : ""}{pnlTL.toFixed(2)} ₺
                      </span>
                      <span className="text-t-txt3">{sureMetni}</span>
                      <span className="text-t-txt3 font-mono">{currentPrice.toFixed(2)} ₺</span>
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

      {/* Tarama Geçmişi — Takvim Görünümü */}
      <div className="bg-t-card rounded-xl overflow-hidden mb-5" style={{ border: "1px solid var(--bdr)" }}>
        <div className="p-[13px_20px] bg-t-bg2 flex items-center justify-between flex-wrap gap-2" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <h3 className="font-syne text-[13px] font-bold text-t-txt">📅 Tarama Geçmişi</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => window.open(`${API_BASE}/api/arsiv/tumu`)}
              className="px-3 py-[5px] rounded-lg text-[11px] font-bold cursor-pointer transition-all text-t-accent"
              style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.25)" }}>
              ⬇ Tümünü İndir (ZIP)
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-t-txt3">Yükleniyor...</div>
        ) : (() => {
          const taramaDosyalar = arsivFiles.filter(f => !f.ad.includes('backtest'));
          const backtestDosyalar = arsivFiles.filter(f => f.ad.includes('backtest'));

          // Build file map: "2026-04-03_10:30" => file
          const dosyaMap: Record<string, ArsivFile> = {};
          taramaDosyalar.forEach(d => {
            const m = d.ad.match(/(\d{4})-(\d{2})-(\d{2})[_-](\d{2})-(\d{2})/);
            if (!m) return;
            dosyaMap[`${m[1]}-${m[2]}-${m[3]}_${m[4]}:${m[5]}`] = d;
          });

          const haftalar = getWeeks(taramaDosyalar);

          return (
            <div className="p-4">
              {haftalar.length === 0 ? (
                <div className="p-8 text-center text-t-txt3">Arşiv dosyası bulunamadı</div>
              ) : (
                <>
                  {haftalar.map((hafta, hi) => (
                    <div key={hi} className="mb-6">
                      <div className="text-[11px] text-t-txt3 font-medium mb-2">{hafta.label}</div>
                      <div className="grid grid-cols-5 gap-1.5 max-md:grid-cols-2">
                        {hafta.gunler.map(gun => {
                          const tatil = isTatil(gun.tarih);
                          return (
                            <div key={gun.tarih}>
                              <div className="text-[11px] font-medium text-center mb-1"
                                style={{ color: tatil ? "#92400e" : "var(--txt3)" }}>
                                {gun.gunAdi} {gun.gun}
                                {tatil && <span className="block text-[9px]" style={{ color: "#fbbf24" }}>Tatil</span>}
                              </div>
                              {tatil ? (
                                <div className="rounded-md p-2.5 text-center" style={{ background: "#1a0f00", border: "0.5px solid #451a03" }}>
                                  <div className="text-[10px]" style={{ color: "#92400e" }}>🔴 Borsa</div>
                                  <div className="text-[9px]" style={{ color: "#78350f" }}>Kapalı</div>
                                </div>
                              ) : (
                                SLOTLAR.map(saat => {
                                  const key = `${gun.tarih}_${saat}`;
                                  const dosya = dosyaMap[key];
                                  return (
                                    <div key={saat} className="rounded-md p-[6px_8px] mb-1 transition-all"
                                      style={{
                                        background: dosya ? "var(--card)" : "var(--bg3)",
                                        border: `0.5px solid ${dosya ? "rgba(59,130,246,.2)" : "var(--bdr)"}`,
                                        opacity: dosya ? 1 : 0.4
                                      }}>
                                      <div className="text-[10px] font-medium" style={{ color: "var(--c-accent)" }}>{saat}</div>
                                      {dosya ? (
                                        <>
                                          <div className="text-[9px] text-t-txt3">{typeof dosya.boyut === 'string' ? dosya.boyut : `${(Number(dosya.boyut)/1024).toFixed(0)} KB`}</div>
                                          <div className="flex gap-1 mt-1">
                                            <a href={getDownloadUrl(dosya.ad)} download
                                              className="text-[9px] px-1.5 py-[2px] rounded text-t-accent no-underline cursor-pointer"
                                              style={{ background: "var(--blue-bg)" }}>⬇</a>
                                            <button onClick={() => handleDeleteFile(dosya.ad)}
                                              className="text-[9px] px-1.5 py-[2px] rounded cursor-pointer border-none"
                                              style={{ background: "var(--red-bg)", color: "var(--c-red)" }}>🗑</button>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="text-[9px] text-t-txt3 mt-0.5">—</div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Backtest Geçmişi */}
                  {backtestDosyalar.length > 0 && (
                    <div className="mt-8">
                      <div className="text-[13px] font-medium pb-2 mb-4" style={{ color: "#fbbf24", borderBottom: "0.5px solid #92400e" }}>
                        📊 Backtest Geçmişi
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {backtestDosyalar.map((d, i) => (
                          <div key={i} className="rounded-[10px] p-3" style={{ background: "var(--card)", border: "0.5px solid #92400e" }}>
                            <span className="inline-block text-[9px] font-semibold px-[7px] py-[2px] rounded mb-1.5"
                              style={{ background: "#451a03", color: "#fbbf24", border: "0.5px solid #92400e" }}>
                              📊 Haftalık Backtest
                            </span>
                            <div className="font-mono text-[13px] font-medium text-t-txt">{parseDateFromName(d.ad)}</div>
                            <div className="text-[11px] text-t-txt3 mb-2">{d.boyut}</div>
                            <div className="flex gap-1.5">
                              <a href={getDownloadUrl(d.ad)} download
                                className="px-2 py-[3px] rounded text-[10px] font-bold text-t-accent cursor-pointer no-underline"
                                style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.25)" }}>⬇ İndir</a>
                              <button onClick={() => handleDeleteFile(d.ad)}
                                className="px-2 py-[3px] rounded text-[10px] font-bold cursor-pointer border-none"
                                style={{ background: "var(--red-bg)", color: "var(--c-red)" }}>🗑 Sil</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </div>

      {/* Manual File Upload */}
      <div className="bg-t-card rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
        <div className="p-[13px_20px] bg-t-bg2 flex items-center justify-between" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <h3 className="font-syne text-[13px] font-bold text-t-txt">📎 Manuel Dosya Ekleme</h3>
          <button onClick={() => fileInputRef.current?.click()}
            className="px-3 py-[6px] rounded-lg text-[11px] font-bold cursor-pointer transition-all"
            style={{ background: "linear-gradient(135deg, var(--c-accent), var(--accent-d))", color: "#fff", boxShadow: "0 4px 14px rgba(79,142,247,.3)", border: "none" }}>
            + Dosya Yükle
          </button>
          <input ref={fileInputRef} type="file" multiple accept=".xlsx,.xls,.csv,.pdf,.txt,.json" onChange={handleFileUpload} className="hidden" />
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
              <div key={i} className="flex items-center justify-between p-[12px_16px] bg-t-bg3 rounded-lg" style={{ border: "1px solid var(--bdr)" }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-t-txt truncate">{f.name}</div>
                  <div className="text-[10px] text-t-txt3">{f.size} · {f.date}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {f.url.startsWith("blob:") && (
                    <a href={f.url} download={f.name}
                      className="px-2.5 py-[4px] rounded-lg text-[10px] font-bold text-t-accent cursor-pointer no-underline transition-all hover:opacity-80"
                      style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.25)" }}>📥</a>
                  )}
                  <button onClick={() => removeManualFile(i)}
                    className="px-2.5 py-[4px] rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    style={{ background: "var(--red-bg)", color: "var(--c-red)", border: "1px solid var(--red-bdr)" }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
