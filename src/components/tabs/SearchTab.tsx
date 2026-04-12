import { useState, useEffect } from "react";
import { useAppData } from "@/context/AppContext";
import { SIGNAL_TR, SMART_MONEY_TR, TREND_TR, tr } from "@/lib/translations";
import { fetchFinansAnaliz } from "@/services/api";

export default function SearchTab({ onTickerClick }: { onTickerClick?: (ticker: string) => void }) {
  const { data } = useAppData();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [analizData, setAnalizData] = useState<Record<string, any>>({});
  const [analizLoading, setAnalizLoading] = useState(true);

  useEffect(() => {
    fetchFinansAnaliz()
      .then(d => setAnalizData(d))
      .catch(() => setAnalizData({}))
      .finally(() => setAnalizLoading(false));
  }, []);

  const tickers = Object.keys(data);
  const matched = query.trim() ? tickers.filter(t => t.toUpperCase().includes(query.toUpperCase().trim())) : [];
  const result = matched.length === 1 ? { ticker: matched[0], stock: data[matched[0]] } : null;

  const quickList = tickers.filter(t => data[t].score >= 70).sort((a, b) => data[b].score - data[a].score).slice(0, 8);

  // Find analysis for a ticker
  const getTickerAnaliz = (ticker: string) => {
    const entries = Object.entries(analizData);
    const found = entries.find(([key, val]) => {
      const t = val.ticker ?? key.split("_")[0] ?? "";
      return t.toUpperCase() === ticker.toUpperCase();
    });
    return found ? { key: found[0], ...found[1] } : null;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-[18px] mt-8">
        <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px]"
          style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.25)" }}>🔍</div>
        <div>
          <h2 className="font-syne text-[15px] font-bold text-t-txt">Hisse Ara</h2>
          <p className="text-[11px] text-t-txt3 mt-[1px]">Hisse kodu yazarak detaylı analiz görüntüle</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="flex items-center bg-t-card rounded-xl overflow-hidden mb-3 transition-all focus-within:shadow-[0_0_0_3px_rgba(79,142,247,.08)]"
        style={{ border: "1px solid var(--bdr)" }}>
        <span className="px-4 text-[15px] text-t-txt3">🔍</span>
        <input type="text" value={query}
          onChange={e => { setQuery(e.target.value); setSearched(false); }}
          onKeyDown={e => e.key === "Enter" && setSearched(true)}
          placeholder="Hisse kodu yazın... (örn: AYGAZ)"
          className="flex-1 border-none outline-none p-3.5 text-[15px] font-bold font-mono text-t-txt bg-transparent uppercase tracking-[.5px] placeholder:text-t-txt3 placeholder:font-body placeholder:font-normal placeholder:normal-case placeholder:tracking-normal" />
        <button onClick={() => setSearched(true)}
          className="px-6 py-3.5 text-[12px] font-bold cursor-pointer transition-opacity hover:opacity-90 font-body tracking-[.02em]"
          style={{ background: "linear-gradient(135deg, var(--c-accent), var(--accent-d))", color: "#fff" }}>
          Analiz Et
        </button>
      </div>

      {/* Quick list */}
      <div className="flex items-center gap-[7px] flex-wrap mb-6">
        <span className="text-[9.5px] text-t-txt3 font-semibold uppercase tracking-[.8px]">Popüler:</span>
        {quickList.map(t => (
          <span key={t} onClick={() => { setQuery(t); setSearched(true); }}
            className="px-2 py-[2px] bg-t-bg4 rounded font-bold text-[11px] text-t-gold-l font-mono cursor-pointer transition-all hover:bg-[rgba(201,148,58,.15)]"
            style={{ border: "1px solid var(--bdr2)" }}>{t}</span>
        ))}
      </div>

      {/* Results */}
      {searched && query.trim() && !result && matched.length === 0 && (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">🔍</div>
          <div className="text-[14px] font-bold text-t-txt2 mb-[5px]">"{query}" bulunamadı</div>
          <div className="text-[11px]">Farklı bir hisse kodu deneyin</div>
        </div>
      )}

      {/* Multiple matches */}
      {searched && matched.length > 1 && (
        <div className="space-y-2">
          {matched.slice(0, 10).map(t => (
            <div key={t} onClick={() => { setQuery(t); }}
              className="bg-t-card rounded-lg p-[12px_16px] flex items-center justify-between cursor-pointer transition-all hover:bg-t-bg3"
              style={{ border: "1px solid var(--bdr)" }}>
              <div>
                <span className="font-syne text-[16px] font-bold text-t-txt">{t}</span>
                <span className="text-[11px] text-t-txt3 ml-2">{data[t].sector_name}</span>
              </div>
              <span className="font-mono text-[14px] font-bold text-t-txt">{data[t].score}</span>
            </div>
          ))}
        </div>
      )}

      {/* Single result detail */}
      {result && (
        <div className="bg-t-card rounded-2xl overflow-hidden shadow-t animate-fade-in" style={{ border: "1px solid var(--bdr)" }}>
          <div className="p-[20px_24px] flex justify-between items-center flex-wrap gap-3" style={{ borderBottom: "1px solid var(--bdr)" }}>
            <div>
              <div className="font-syne text-[26px] font-extrabold tracking-[-0.5px] text-t-txt cursor-pointer hover:underline"
                onClick={() => onTickerClick?.(result.ticker)}>{result.ticker}</div>
              <div className="text-[12px] text-t-txt2 mt-1">{result.stock.sector_name} · {tr(SIGNAL_TR, result.stock.signal)}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-[20px] font-bold text-t-txt">{result.stock.close.toFixed(2)} ₺</div>
                <div className={`text-[12px] font-bold mt-[2px] ${result.stock.pos_pct >= 0 ? "text-t-green" : "text-t-red"}`}>
                  {result.stock.pos_pct >= 0 ? "+" : ""}{result.stock.pos_pct}%
                </div>
              </div>
              <div className="font-mono text-[18px] font-extrabold w-14 h-14 flex items-center justify-center bg-t-bg3 rounded-xl text-t-txt"
                style={{ border: "1px solid var(--bdr2)" }}>{result.stock.score}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderTop: "1px solid var(--bdr)" }}>
            <div className="p-[18px]" style={{ borderRight: "1px solid var(--bdr)" }}>
              <div className="text-[9px] font-bold uppercase tracking-[.7px] text-t-txt3 mb-3.5">Teknik Göstergeler</div>
              <SRRow k="RSI" v={result.stock.rsi.toString()} cls={result.stock.rsi < 45 ? "text-t-green" : result.stock.rsi < 65 ? "text-t-warn" : "text-t-red"} />
              <SRRow k="Smart Money" v={tr(SMART_MONEY_TR, result.stock.smart_money)} />
              <SRRow k="Squeeze" v={result.stock.squeeze} />
              <SRRow k="Trend" v={tr(TREND_TR, result.stock.trend)} cls="text-t-green" />
              <SRRow k="Stop Loss" v={`${result.stock.stop_loss.toFixed(2)} ₺`} cls="text-t-red" />
              <SRRow k="Hedef" v={`${result.stock.target.toFixed(2)} ₺`} cls="text-t-green" />
            </div>
            <div className="p-[18px]">
              <div className="text-[9px] font-bold uppercase tracking-[.7px] text-t-txt3 mb-3.5">Temel Göstergeler</div>
              {(result.stock.fk != null || result.stock.pddd != null || result.stock.roe != null || result.stock.fd_favok != null || result.stock.net_borc != null || result.stock.temel_puan != null) ? (
                <>
                  <SRRow k="F/K" v={result.stock.fk?.toFixed(1) ?? "—"} cls={result.stock.fk != null ? (result.stock.fk < 15 ? "text-t-green" : "text-t-red") : ""} />
                  <SRRow k="PD/DD" v={result.stock.pddd?.toFixed(2) ?? "—"} cls={result.stock.pddd != null ? (result.stock.pddd < 1 ? "text-t-green" : "text-t-red") : ""} />
                  <SRRow k="FD/FAVÖK" v={result.stock.fd_favok?.toFixed(1) ?? "—"} />
                  <SRRow k="ROE" v={result.stock.roe != null ? `%${result.stock.roe.toFixed(1)}` : "—"} />
                  <SRRow k="Net Borç" v={result.stock.net_borc != null ? `${(result.stock.net_borc / 1e9).toFixed(1)}B` : "—"} cls={result.stock.net_borc != null ? (result.stock.net_borc < 0 ? "text-t-green" : "text-t-red") : ""} />
                  <SRRow k="Temel Puan" v={result.stock.temel_puan?.toString() ?? "—"} cls={result.stock.temel_puan != null ? ((result.stock.temel_puan ?? 0) >= 60 ? "text-t-green" : (result.stock.temel_puan ?? 0) >= 30 ? "text-t-warn" : "text-t-red") : ""} />
                  <SRRow k="Kombine Karar" v={result.stock.kombine_karar ?? "—"} />
                </>
              ) : (
                <div className="text-[11px] text-t-txt3 py-4 text-center">Bu hisse için temel veri bulunamadı</div>
              )}
            </div>
          </div>

          {/* AI Analiz Bölümü */}
          <div className="p-[16px_24px]" style={{ borderTop: "1px solid var(--bdr)" }}>
            <div className="text-[9px] font-bold uppercase tracking-[.7px] text-t-txt3 mb-3">🤖 AI Finans Analizi</div>
            {analizLoading ? (
              <div className="text-[11px] text-t-txt3">Analiz yükleniyor...</div>
            ) : (() => {
              const analiz = getTickerAnaliz(result.ticker);
              if (analiz) {
                return (
                  <div className="rounded-lg p-3" style={{ background: "#131720", border: "0.5px solid #2d3748" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px]">🤖</span>
                      <span className="text-[11px] font-semibold" style={{ color: "#e2e8f0" }}>{result.ticker} Analizi</span>
                      <span className="text-[9px]" style={{ color: "#64748b" }}>{analiz.tarih}</span>
                    </div>
                    <div className="text-[11px] leading-[1.7] whitespace-pre-wrap" style={{ color: "#94a3b8", maxHeight: 200, overflowY: "auto" }}>
                      {analiz.analiz ?? "Analiz metni yok"}
                    </div>
                  </div>
                );
              }
              return (
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-t-txt3">Bu hisse için henüz AI analizi yok</span>
                  <button
                    onClick={() => {
                      window.open(`http://207.154.212.100:8080/api/finans-analiz?ticker=${result.ticker}`, "_blank");
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "#fff" }}>
                    🤖 Analiz Üret
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Verdict */}
          <div className="p-[16px_24px] flex items-center justify-between flex-wrap gap-3" style={{ borderTop: "1px solid var(--bdr)" }}>
            <div>
              <div className="text-[14px] font-bold text-t-txt">
                {result.stock.kombine_karar || (result.stock.score >= 70 ? "GİRİLEBİLİR" : "İZLE")}
              </div>
              <div className="text-[11px] text-t-txt2 mt-[3px]">
                Skor: {result.stock.score} · {result.stock.confirmed ? "Onaylı" : result.stock.pending ? "Bekleyen" : "İzleme"}
              </div>
            </div>
            <span className="text-[26px]">{result.stock.score >= 70 ? "🟢" : result.stock.score >= 55 ? "⚠️" : "🔴"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SRRow({ k, v, cls = "" }: { k: string; v: string; cls?: string }) {
  return (
    <div className="flex justify-between py-1.5" style={{ borderBottom: "1px solid var(--bdr)" }}>
      <span className="text-[11px] text-t-txt3">{k}</span>
      <span className={`text-[11px] font-bold font-mono ${cls || "text-t-txt"}`}>{v}</span>
    </div>
  );
}
