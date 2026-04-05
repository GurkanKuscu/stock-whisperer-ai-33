import { useAppData } from "@/context/AppContext";

interface SectorInfo {
  name: string;
  tickers: string[];
  avgScore: number;
  maxScore: number;
  champion: string | null;
  bullCount: number;
}

export default function SectorsTab() {
  const { data } = useAppData();

  const sectorMap: Record<string, SectorInfo> = {};
  Object.entries(data).forEach(([ticker, s]) => {
    const sec = s.sector_name || "Diğer";
    if (!sectorMap[sec]) sectorMap[sec] = { name: sec, tickers: [], avgScore: 0, maxScore: 0, champion: null, bullCount: 0 };
    sectorMap[sec].tickers.push(ticker);
    if (s.score > sectorMap[sec].maxScore) { sectorMap[sec].maxScore = s.score; sectorMap[sec].champion = ticker; }
    if (s.score >= 60) sectorMap[sec].bullCount++;
  });

  const sectors = Object.values(sectorMap).map(sec => {
    sec.avgScore = Math.round(sec.tickers.reduce((sum, t) => sum + data[t].score, 0) / sec.tickers.length);
    return sec;
  }).sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div>
      <div className="flex items-center gap-3 mb-[18px] mt-8">
        <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px]"
          style={{ background: "var(--gold-bg)", border: "1px solid rgba(201,148,58,.25)" }}>🏭</div>
        <div>
          <h2 className="font-syne text-[15px] font-bold text-t-txt">Sektörler</h2>
          <p className="text-[11px] text-t-txt3 mt-[1px]">Sektör bazlı analiz ve şampiyonlar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {sectors.map(sec => {
          const strength = Math.min(sec.avgScore, 100);
          const sentiment = strength > 60 ? "bullish" : strength > 40 ? "neutral" : "bearish";
          const topTickers = sec.tickers.sort((a, b) => data[b].score - data[a].score).slice(0, 5);

          return (
            <div key={sec.name} className="bg-t-card rounded-xl p-[18px] transition-all hover:shadow-t-sm hover:-translate-y-[1px]"
              style={{ border: "1px solid var(--bdr)" }}>
              <div className="flex justify-between items-center mb-3.5">
                <span className="font-syne text-[14px] font-bold text-t-txt">{sec.name}</span>
                <span className={`px-[9px] py-[3px] rounded-[20px] text-[9.5px] font-bold border ${
                  sentiment === "bullish" ? "bg-[var(--green-bg)] text-t-green border-[var(--green-bdr)]"
                  : sentiment === "neutral" ? "bg-[var(--warn-bg)] text-t-warn border-[var(--warn-bdr)]"
                  : "bg-[var(--red-bg)] text-t-red-l border-[var(--red-bdr)]"
                }`}>
                  {sentiment === "bullish" ? "🟢 BULL" : sentiment === "neutral" ? "⚠️ NÖTR" : "🔴 BEAR"}
                </span>
              </div>

              <div className="text-[9px] text-t-txt3 font-semibold uppercase tracking-[.6px] mb-[7px]">Güç İndeksi</div>
              <div className="h-[5px] bg-t-bg4 rounded-full overflow-hidden mb-[7px]">
                <div className="h-full rounded-full" style={{
                  width: `${strength}%`,
                  background: strength > 60 ? "var(--c-green)" : strength > 40 ? "var(--c-warn)" : "var(--c-red)"
                }} />
              </div>
              <div className="font-mono text-[13px] font-bold text-t-txt mb-2.5">%{strength}</div>
              <div className="text-[10.5px] text-t-txt3 mb-2.5">{sec.tickers.length} hisse · Ort. skor: {sec.avgScore} · Max: {sec.maxScore}</div>

              <div className="flex gap-[5px] flex-wrap">
                {topTickers.map(t => {
                  const stock = data[t];
                  const degisim = (stock as any).perf_1d ?? 0;
                  return (
                    <div key={t} className="flex items-center gap-1.5 text-[10px] px-2 py-[3px] bg-t-bg3 rounded font-mono cursor-pointer transition-all hover:bg-t-bg5"
                      style={{ border: "1px solid var(--bdr2)" }}>
                      <span className="font-bold text-t-txt">{t}</span>
                      <span className="text-t-txt3">{stock.close?.toFixed(2)}₺</span>
                      <span style={{ color: degisim >= 0 ? "#2CC98A" : "#E05252" }}>
                        {degisim >= 0 ? "+" : ""}{degisim?.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
