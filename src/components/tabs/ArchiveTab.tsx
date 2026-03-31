import { useState, useEffect } from "react";
import { fetchArsiv, getDownloadUrl } from "@/services/api";
import { useAppData } from "@/context/AppContext";
import type { ArsivFile } from "@/types/stock";

export default function ArchiveTab() {
  const { data } = useAppData();
  const [arsivFiles, setArsivFiles] = useState<ArsivFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArsiv()
      .then(setArsivFiles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Signal history from confirmed signals
  const signalHistory = Object.entries(data)
    .filter(([, s]) => s.confirmed)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 20);

  return (
    <div>
      <div className="flex items-center gap-3 mb-[18px] mt-8">
        <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px] bg-t-bg4"
          style={{ border: "1px solid var(--bdr)" }}>📋</div>
        <div>
          <h2 className="font-syne text-[15px] font-bold text-t-txt">Arşiv</h2>
          <p className="text-[11px] text-t-txt3 mt-[1px]">Sinyal geçmişi ve tarama dosyaları</p>
        </div>
      </div>

      {/* Signal History */}
      <div className="bg-t-card rounded-xl overflow-hidden mb-5" style={{ border: "1px solid var(--bdr)" }}>
        <div className="p-[13px_20px] bg-t-bg2" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <h3 className="font-syne text-[13px] font-bold text-t-txt">Sinyal Geçmişi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-t-bg2">
                <th className="p-[9px_14px] text-[9.5px] font-bold uppercase tracking-[.6px] text-t-txt3 text-left" style={{ borderBottom: "1px solid var(--bdr)" }}>Hisse</th>
                <th className="p-[9px_14px] text-[9.5px] font-bold uppercase tracking-[.6px] text-t-txt3 text-left" style={{ borderBottom: "1px solid var(--bdr)" }}>Skor</th>
                <th className="p-[9px_14px] text-[9.5px] font-bold uppercase tracking-[.6px] text-t-txt3 text-left" style={{ borderBottom: "1px solid var(--bdr)" }}>Giriş</th>
                <th className="p-[9px_14px] text-[9.5px] font-bold uppercase tracking-[.6px] text-t-txt3 text-left" style={{ borderBottom: "1px solid var(--bdr)" }}>Hedef</th>
                <th className="p-[9px_14px] text-[9.5px] font-bold uppercase tracking-[.6px] text-t-txt3 text-left" style={{ borderBottom: "1px solid var(--bdr)" }}>Sektör</th>
                <th className="p-[9px_14px] text-[9.5px] font-bold uppercase tracking-[.6px] text-t-txt3 text-left" style={{ borderBottom: "1px solid var(--bdr)" }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {signalHistory.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-t-txt3 text-[12px]">Geçmiş sinyal yok</td></tr>
              ) : (
                signalHistory.map(([ticker, s]) => (
                  <tr key={ticker} className="hover:bg-t-bg3 transition-colors">
                    <td className="p-[10px_14px] text-[12px] text-t-txt font-bold font-mono" style={{ borderBottom: "1px solid var(--bdr)" }}>{ticker}</td>
                    <td className="p-[10px_14px] text-[12px] font-mono font-bold text-t-txt" style={{ borderBottom: "1px solid var(--bdr)" }}>{s.score}</td>
                    <td className="p-[10px_14px] text-[12px] text-t-txt2 font-mono" style={{ borderBottom: "1px solid var(--bdr)" }}>{s.close.toFixed(2)} ₺</td>
                    <td className="p-[10px_14px] text-[12px] text-t-green font-mono font-bold" style={{ borderBottom: "1px solid var(--bdr)" }}>{s.target.toFixed(2)} ₺</td>
                    <td className="p-[10px_14px] text-[12px] text-t-txt2" style={{ borderBottom: "1px solid var(--bdr)" }}>{s.sector_name}</td>
                    <td className="p-[10px_14px] text-[12px]" style={{ borderBottom: "1px solid var(--bdr)" }}>
                      <span className="text-t-green font-bold">✅ Onaylı</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Archive Files */}
      <div className="bg-t-card rounded-xl overflow-hidden" style={{ border: "1px solid var(--bdr)" }}>
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
    </div>
  );
}
