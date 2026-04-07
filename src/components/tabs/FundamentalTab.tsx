import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import AddToPortfolioModal from "@/components/AddToPortfolioModal";

const TEMEL_FILTRELER = ['TÜMÜ', 'TEMEL GÜÇLÜ', 'TEMEL ORTA', 'TEMEL ZAYIF', 'TEMEL KÖTÜ'];

export default function FundamentalTab() {
  const { data } = useAppData();
  const [temelFiltre, setTemelFiltre] = useState('TÜMÜ');
  const [addTicker, setAddTicker] = useState<string | null>(null);

  const tickers = Object.keys(data)
    .filter(t => data[t].fk != null || data[t].pddd != null || data[t].roe != null)
    .sort((a, b) => data[b].score - data[a].score);

  const filtered = tickers.filter(t => {
    if (temelFiltre === 'TÜMÜ') return true;
    const s = data[t].temel_sinyal ?? '';
    if (temelFiltre === 'TEMEL GÜÇLÜ') return s.includes('GÜÇLÜ') || s.includes('TEMEL GÜÇ');
    if (temelFiltre === 'TEMEL ORTA') return s.includes('ORTA');
    if (temelFiltre === 'TEMEL ZAYIF') return s.includes('ZAYIF');
    if (temelFiltre === 'TEMEL KÖTÜ') return s.includes('KÖTÜ');
    return true;
  });

  return (
    <div>
      <SectionHeader icon="📊" iconCls="gold" title="Temel Analiz" sub="API verisinden çekilen temel göstergeler" />

      {/* Filtre butonları */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TEMEL_FILTRELER.map(f => (
          <button key={f} onClick={() => setTemelFiltre(f)}
            className="text-[11px] px-3 py-1 rounded-md cursor-pointer font-semibold transition-all"
            style={{
              border: `0.5px solid ${temelFiltre === f ? '#60a5fa' : 'var(--bdr)'}`,
              background: temelFiltre === f ? 'rgba(59,130,246,.08)' : 'transparent',
              color: temelFiltre === f ? '#60a5fa'
                : f.includes('GÜÇLÜ') ? '#2CC98A'
                : f.includes('ORTA') ? '#F59E0B'
                : f.includes('ZAYIF') ? '#F97316'
                : f.includes('KÖTÜ') ? '#E05252'
                : 'var(--txt2)'
            }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">📊</div>
          <div className="text-[14px] font-bold text-t-txt2">Temel analiz verisi olan hisse bulunamadı</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--bdr)" }}>
          <table className="w-full text-[12px] border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-t-bg3">
                {["Hisse", "Skor", "T.Puan", "F/K", "PD/DD", "FD/FAVÖK", "ROE", "Sektör", "Karar", ""].map((h, i) => (
                  <th key={i} className="p-[10px_14px] text-left text-[10px] text-t-txt3 font-semibold uppercase tracking-[.6px]"
                    style={{ borderBottom: "1px solid var(--bdr)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticker, i) => {
                const s = data[ticker];
                return (
                  <tr key={ticker} className="hover:bg-t-bg3 transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                    <td className="p-[10px_14px]">
                      <div className="font-syne font-extrabold text-[13px] text-t-txt">{ticker}</div>
                      <div className="text-[9px] text-t-txt3 mt-0.5">{s.sector_name}</div>
                    </td>
                    <td className="p-[10px_14px] font-mono font-bold text-t-txt">{s.score}</td>
                    <td className="p-[10px_14px]">
                      <span className={`font-mono font-bold ${(s.temel_puan ?? 0) >= 60 ? "text-t-green" : (s.temel_puan ?? 0) >= 30 ? "text-t-warn" : "text-t-red"}`}>
                        {s.temel_puan ?? "—"}
                      </span>
                    </td>
                    <td className="p-[10px_14px]">
                      <span className={`font-mono ${s.fk != null ? (s.fk < 15 ? "text-t-green" : s.fk > 25 ? "text-t-red" : "text-t-warn") : "text-t-txt3"}`}>
                        {s.fk?.toFixed(1) ?? "—"}
                      </span>
                    </td>
                    <td className="p-[10px_14px]">
                      <span className="font-mono text-t-txt2">
                        {s.pddd?.toFixed(2) ?? "—"}
                      </span>
                    </td>
                    <td className="p-[10px_14px] font-mono text-t-txt2">{s.fd_favok?.toFixed(1) ?? "—"}</td>
                    <td className="p-[10px_14px]">
                      <span className={`font-mono font-bold ${(s.roe ?? 0) > 10 ? "text-t-green" : (s.roe ?? 0) > 0 ? "text-t-warn" : "text-t-red"}`}>
                        {s.roe != null ? `%${s.roe.toFixed(1)}` : "—"}
                      </span>
                    </td>
                    <td className="p-[10px_14px]">
                      <div className="text-[11px] font-semibold" style={{
                        color: s.kombine_karar?.includes('GÜÇLÜ') || s.kombine_karar?.includes('GİRİLEBİLİR') ? '#2CC98A'
                          : s.kombine_karar?.includes('DİKKATLİ') ? '#F59E0B'
                          : s.kombine_karar?.includes('BEKLE') ? '#F97316'
                          : s.kombine_karar?.includes('GIRME') || s.kombine_karar?.includes('GİRME') ? '#E05252'
                          : 'var(--txt2)'
                      }}>
                        {s.kombine_karar ?? "—"}
                      </div>
                      <div className="text-[9px] mt-0.5" style={{
                        color: s.temel_sinyal?.includes('GÜÇLÜ') ? '#2CC98A'
                          : s.temel_sinyal?.includes('ORTA') ? '#F59E0B'
                          : s.temel_sinyal?.includes('ZAYIF') ? '#F97316'
                          : '#E05252'
                      }}>
                        {s.temel_sinyal ?? ''}
                      </div>
                    </td>
                    <td className="p-[10px_14px]">
                      <button onClick={() => setAddTicker(ticker)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-t-blue-l cursor-pointer transition-all hover:opacity-80 whitespace-nowrap"
                        style={{ background: "rgba(59,130,246,.12)", border: "1px solid rgba(59,130,246,.25)" }}>
                        + Portföy
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {addTicker && (
        <AddToPortfolioModal
          ticker={addTicker}
          price={data[addTicker]?.close ?? 0}
          stop={data[addTicker]?.stop_loss ?? 0}
          target={data[addTicker]?.target ?? 0}
          onClose={() => setAddTicker(null)}
        />
      )}
    </div>
  );
}

function SectionHeader({ icon, iconCls, title, sub }: { icon: string; iconCls: string; title: string; sub: string }) {
  const bgMap: Record<string, string> = {
    gold: "var(--gold-bg)", green: "var(--green-bg)", warn: "var(--warn-bg)", red: "var(--red-bg)", blue: "var(--blue-bg)", neutral: "var(--bg4)"
  };
  const bdrMap: Record<string, string> = {
    gold: "rgba(201,148,58,.25)", green: "var(--green-bdr)", warn: "var(--warn-bdr)", red: "var(--red-bdr)", blue: "rgba(59,130,246,.25)", neutral: "var(--bdr)"
  };
  return (
    <div className="flex items-center gap-3 mb-[18px] mt-8">
      <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px]"
        style={{ background: bgMap[iconCls], border: `1px solid ${bdrMap[iconCls]}` }}>
        {icon}
      </div>
      <div>
        <h2 className="font-syne text-[15px] font-bold text-t-txt tracking-[-0.1px]">{title}</h2>
        <p className="text-[11px] text-t-txt3 mt-[1px]">{sub}</p>
      </div>
    </div>
  );
}
