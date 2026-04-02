import { useAppData } from "@/context/AppContext";

export default function FundamentalTab() {
  const { data } = useAppData();
  const tickers = Object.keys(data)
    .filter(t => data[t].temel_puan != null)
    .sort((a, b) => data[b].score - data[a].score);

  return (
    <div>
      <SectionHeader icon="📊" iconCls="gold" title="Temel Analiz" sub="API verisinden çekilen temel göstergeler" />

      {tickers.length === 0 ? (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">📊</div>
          <div className="text-[14px] font-bold text-t-txt2">Temel analiz verisi yok</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--bdr)" }}>
          <table className="w-full text-[12px] border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-t-bg3">
                {["Hisse", "Skor", "T.Puan", "F/K", "PD/DD", "FD/FAVÖK", "ROE", "Karar"].map((h, i) => (
                  <th key={i} className="p-[10px_14px] text-left text-[10px] text-t-txt3 font-semibold uppercase tracking-[.6px]"
                    style={{ borderBottom: "1px solid var(--bdr)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickers.map((ticker, i) => {
                const s = data[ticker];
                return (
                  <tr key={ticker} className="hover:bg-t-bg3 transition-colors"
                    style={{ borderBottom: i < tickers.length - 1 ? "1px solid var(--bdr)" : "none" }}>
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
                    <td className="p-[10px_14px] text-[11px] font-semibold text-t-txt2">{s.kombine_karar ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
