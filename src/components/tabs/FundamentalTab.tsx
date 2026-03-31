import { useAppData } from "@/context/AppContext";

export default function FundamentalTab() {
  const { data } = useAppData();
  const tickers = Object.keys(data)
    .filter(t => data[t].temel_puan != null)
    .sort((a, b) => (data[b].temel_puan ?? 0) - (data[a].temel_puan ?? 0));

  return (
    <div>
      <SectionHeader icon="📊" iconCls="gold" title="Temel Analiz" sub="API verisinden çekilen temel göstergeler" />

      {tickers.length === 0 ? (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">📊</div>
          <div className="text-[14px] font-bold text-t-txt2">Temel analiz verisi yok</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tickers.slice(0, 30).map(ticker => {
            const s = data[ticker];
            return (
              <div key={ticker} className="bg-t-card rounded-2xl overflow-hidden transition-all hover:shadow-t-sm"
                style={{ border: "1px solid var(--bdr)" }}>
                <div className="flex justify-between items-center p-[16px_20px] bg-t-bg2" style={{ borderBottom: "1px solid var(--bdr)" }}>
                  <div>
                    <div className="font-syne text-[18px] font-extrabold text-t-txt">{ticker}</div>
                    <div className="text-[10px] text-t-txt3 mt-[2px]">{s.sector_name}</div>
                  </div>
                  <div className="font-mono text-[16px] font-bold text-t-txt">{s.close?.toFixed(2)} ₺</div>
                </div>
                <div className="p-[16px_20px]">
                  {s.fk != null && <FundRow k="F/K" v={s.fk.toFixed(1)} cls={s.fk < 15 ? "text-t-green" : s.fk > 25 ? "text-t-red" : "text-t-warn"} />}
                  {s.pddd != null && <FundRow k="PD/DD" v={s.pddd.toFixed(2)} cls={s.pddd < 1 ? "text-t-green" : "text-t-red"} />}
                  {s.fd_favok != null && <FundRow k="FD/FAVÖK" v={s.fd_favok.toFixed(1)} cls={s.fd_favok > 0 && s.fd_favok < 10 ? "text-t-green" : "text-t-red"} />}
                  {s.roe != null && <FundRow k="ROE" v={`%${s.roe.toFixed(1)}`} cls={s.roe > 10 ? "text-t-green" : s.roe > 0 ? "text-t-warn" : "text-t-red"} />}
                  {s.net_borc != null && <FundRow k="Net Borç" v={`${(s.net_borc / 1e9).toFixed(1)}B`} cls={s.net_borc < 0 ? "text-t-green" : "text-t-red"} />}
                  {s.fcf != null && <FundRow k="FCF" v={`${(s.fcf / 1e6).toFixed(0)}M`} cls={s.fcf > 0 ? "text-t-green" : "text-t-red"} />}
                  {s.temel_puan != null && (
                    <div className="mt-3">
                      <div className="text-[9px] text-t-txt3 font-semibold uppercase tracking-[.6px] mb-[7px]">Temel Puan</div>
                      <div className="h-[4px] bg-t-bg4 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${s.temel_puan}%`,
                          background: s.temel_puan > 60 ? "var(--c-green)" : s.temel_puan > 30 ? "var(--c-warn)" : "var(--c-red)"
                        }} />
                      </div>
                      <div className="font-mono text-[13px] font-bold text-t-txt mt-1">{s.temel_puan}/100</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FundRow({ k, v, cls }: { k: string; v: string; cls: string }) {
  return (
    <div className="flex justify-between py-1.5" style={{ borderBottom: "1px solid var(--bdr)" }}>
      <span className="text-[11.5px] text-t-txt3">{k}</span>
      <span className={`text-[11.5px] font-bold font-mono ${cls}`}>{v}</span>
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
