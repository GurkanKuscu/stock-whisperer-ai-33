import { useState } from "react";
import type { StockData, PortfolioMap } from "@/types/stock";
import { useAppData } from "@/context/AppContext";
import { SIGNAL_TR, SMART_MONEY_TR, TREND_TR, tr } from "@/lib/translations";

interface SignalCardProps {
  ticker: string;
  stock: StockData;
  onAddPortfolio?: (ticker: string) => void;
  onTickerClick?: (ticker: string) => void;
}

function formatVol(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B ₺`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M ₺`;
  return `${(v / 1e3).toFixed(0)}K ₺`;
}

function getRsiMomentum(rsi: number) {
  if (rsi < 30) return { label: "🔴 Aşırı Satım", cls: "bg-[rgba(224,82,82,.12)] text-t-red" };
  if (rsi < 45) return { label: "🟢 Akım Bölgesi — Giriş Uygun", cls: "bg-[rgba(29,184,122,.1)] text-t-green-l" };
  if (rsi < 55) return { label: "🟢 Akım Bölgesi — Giriş Uygun", cls: "bg-[rgba(29,184,122,.15)] text-t-green" };
  if (rsi < 70) return { label: "⚠️ Dikkat — Momentum Yüksek", cls: "bg-[rgba(232,155,42,.12)] text-t-warn" };
  return { label: "🔴 Aşırı Alım", cls: "bg-[rgba(224,82,82,.12)] text-t-red" };
}

function getVerdictInfo(stock: StockData) {
  const tp = stock.temel_puan ?? 0;
  const kp = stock.kombine_puan ?? 0;
  if (stock.kombine_karar === "GİRİLEBİLİR" || tp >= 70) {
    return { label: `🟢 GİRİLEBİLİR`, cls: "bg-[var(--green-bg)] text-t-green-l border-[var(--green-bdr)]", sub: `Temel ${tp}p · Kombine ${kp}p` };
  }
  if (stock.kombine_karar === "İZLE" || tp >= 40) {
    return { label: "⚠️ İZLE", cls: "bg-[var(--warn-bg)] text-t-warn border-[var(--warn-bdr)]", sub: `Temel ${tp}p · Kombine ${kp}p` };
  }
  if (tp < 20 && stock.score >= 70) {
    return { label: "⚠️ TEKNİK GÜÇLÜ / TEMEL KÖTÜ", cls: "bg-[var(--purple-bg)] text-[#D4B8FF] border-[rgba(139,103,229,.2)]", sub: `Temel ${tp}p · Kombine ${kp}p` };
  }
  return { label: "🔴 GİRME", cls: "bg-[var(--red-bg)] text-t-red-l border-[var(--red-bdr)]", sub: `Temel ${tp}p · Kombine ${kp}p` };
}

export default function SignalCard({ ticker, stock, onAddPortfolio, onTickerClick }: SignalCardProps) {
  const [temelOpen, setTemelOpen] = useState(false);
  const rsiM = getRsiMomentum(stock.rsi);
  const verdict = getVerdictInfo(stock);
  const cardType = stock.confirmed ? "confirmed" : stock.pending ? "pending" : "watchlist";

  const topLineColor = cardType === "confirmed"
    ? "linear-gradient(90deg, var(--c-green), var(--green-l))"
    : cardType === "pending"
    ? "linear-gradient(90deg, var(--c-warn), var(--gold))"
    : "linear-gradient(90deg, var(--txt4), var(--txt3))";

  const badges: { label: string; cls: string }[] = [];
  if (stock.sector_champion) badges.push({ label: "🥇 Sektör Lideri", cls: "bg-[var(--green-bg)] text-t-green-l border-[var(--green-bdr)]" });
  if (stock.early_rally) badges.push({ label: "🚀 Early Rally", cls: "bg-[rgba(59,130,246,.08)] text-[#7EC8F7] border-[rgba(59,130,246,.2)]" });
  if (stock.inst_entry) badges.push({ label: "🏛️ Kurumsal Giriş", cls: "bg-[var(--purple-bg)] text-[#C4A8FF] border-[rgba(139,103,229,.2)]" });
  if (stock.weekly_bull) badges.push({ label: "📈 Haftalık Bull", cls: "bg-[var(--green-bg)] text-t-green-l border-[var(--green-bdr)]" });
  if (stock.is_spec) badges.push({ label: "🎲 Spekülatif", cls: "bg-[var(--warn-bg)] text-t-warn border-[var(--warn-bdr)]" });
  if (stock.manip_detected) badges.push({ label: "⚠️ Manip", cls: "bg-[var(--red-bg)] text-t-red-l border-[var(--red-bdr)]" });

  const volLabel = stock.avg_vol_tl > 200e6 ? "🔥 Yüksek" : stock.avg_vol_tl < 50e6 ? "⚠️ Düşük" : "";

  return (
    <div className="bg-t-card rounded-2xl overflow-hidden shadow-t-sm transition-all duration-300 hover:shadow-t hover:-translate-y-0.5 relative"
      style={{ border: "1px solid var(--bdr)" }}>
      {/* Top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: topLineColor }} />

      {/* Header */}
      <div className="p-[18px_20px] flex justify-between items-start" style={{ borderBottom: "1px solid var(--bdr)" }}>
        <div className="flex flex-col gap-[5px]">
          <div className="font-syne text-[24px] font-extrabold tracking-[-0.5px] leading-none text-t-txt cursor-pointer hover:underline"
            onClick={() => onTickerClick?.(ticker)}>{ticker}</div>
          <div className="flex items-center gap-[7px] text-[11px]">
            <span className="text-t-txt2 font-medium">{stock.sector_name}</span>
            <span className="px-[7px] py-[2px] bg-t-bg4 rounded text-t-txt3 font-semibold text-[9.5px] uppercase tracking-[.5px]">{tr(SIGNAL_TR, stock.signal)}</span>
          </div>
          {badges.length > 0 && (
            <div className="flex gap-[5px] mt-1 flex-wrap">
              {badges.map((b, i) => (
                <span key={i} className={`inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded text-[10px] font-semibold border ${b.cls}`}>{b.label}</span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="font-mono text-[28px] font-bold leading-none tracking-[-1px] text-t-txt">{stock.score}</div>
          <div className="text-[9px] text-t-txt3 font-semibold uppercase tracking-[.8px]">SKOR</div>
          <span className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-[20px] text-[9.5px] font-bold uppercase tracking-[.4px] border ${
            stock.confirmed ? "bg-[var(--green-bg)] text-t-green border-[var(--green-bdr)]" : "bg-[var(--warn-bg)] text-t-warn border-[var(--warn-bdr)]"
          }`}>
            {stock.confirmed ? "✅ CONF" : "⏳ PEND"}
          </span>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-4" style={{ borderBottom: "1px solid var(--bdr)" }}>
        <PriceCell label="Fiyat" value={`${stock.close.toFixed(2)} ₺`} />
        <PriceCell label="Stop" value={`${stock.stop_loss.toFixed(2)} ₺`} cls="text-t-red" />
        <PriceCell label="Hedef" value={`${stock.target.toFixed(2)} ₺`} cls="text-t-green" />
        <PriceCell label="R/R" value={`1:${stock.rr_ratio}`} cls="text-t-blue-l" last />
      </div>

      {/* RSI */}
      <div className="p-[12px_20px]" style={{ borderBottom: "1px solid var(--bdr)" }}>
        <div className="flex justify-between items-center mb-[5px]">
          <span className="text-[9px] text-t-txt3 font-semibold uppercase tracking-[.6px]">RSI</span>
          <span className={`font-mono text-[13px] font-bold ${stock.rsi < 45 ? "text-t-green" : stock.rsi < 65 ? "text-t-warn" : "text-t-red"}`}>
            {stock.rsi}
          </span>
        </div>
        <div className="h-[5px] bg-t-bg4 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{
            width: `${stock.rsi}%`,
            background: stock.rsi < 45 ? "var(--c-green)" : stock.rsi < 65 ? "var(--c-warn)" : "var(--c-red)"
          }} />
        </div>
        <span className={`text-[9px] font-bold px-[7px] py-[2px] rounded-full mt-[5px] inline-block ${rsiM.cls}`}>{rsiM.label}</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2" style={{ borderBottom: "1px solid var(--bdr)" }}>
        <div className="p-[12px_16px]" style={{ borderRight: "1px solid var(--bdr)" }}>
          <div className="text-[9px] text-t-txt3 font-semibold uppercase tracking-[.6px] mb-2">Smart$ & Teknik</div>
          <MetricRow k="Smart Money" v={tr(SMART_MONEY_TR, stock.smart_money)} />
          <MetricRow k="Squeeze" v={stock.squeeze} />
          <MetricRow k="Pump%" v={stock.pump} />
        </div>
        <div className="p-[12px_16px]">
          <div className="text-[9px] text-t-txt3 font-semibold uppercase tracking-[.6px] mb-2">Pozisyon</div>
          <MetricRow k="Hacim" v={`${formatVol(stock.avg_vol_tl)} ${volLabel}`} />
          <MetricRow k="Pos%" v={stock.pos_pct.toString()} />
          <MetricRow k="Holding" v={`~${stock.holding_rec} gün`} />
        </div>
      </div>

      {/* Performance */}
      {(stock.perf_5d !== undefined || stock.bist100_perf_5d !== undefined) && (
        <div className="p-[13px_20px] bg-t-bg2" style={{ borderBottom: "1px solid var(--bdr)" }}>
          <div className="text-[9px] font-bold uppercase tracking-[.6px] text-t-txt3 mb-[9px]">Göreli Performans — 5 Gün</div>
          {stock.bist100_perf_5d !== undefined && <PerfRow label="BIST100" value={stock.bist100_perf_5d} />}
          {stock.sector_perf_5d !== undefined && <PerfRow label={`${stock.sector_name} Sekt.`} value={stock.sector_perf_5d} />}
          {stock.perf_5d !== undefined && <PerfRow label={ticker} value={stock.perf_5d} />}
        </div>
      )}

      {/* Verdict — PROMPT K layout */}
      <div className="p-[8px_12px] cursor-pointer hover:opacity-90" style={{ borderTop: "0.5px solid var(--bdr)" }}
        onClick={() => setTemelOpen(!temelOpen)}>
        <div className="flex justify-between items-center gap-2">
          {/* Sol: Temel Karar + ok */}
          <div className="text-[11px] text-t-txt3 font-medium tracking-[1px] shrink-0">
            TEMEL KARAR {temelOpen ? "▲" : "▼"}
          </div>


          {/* Sağ: Temel sinyal + puan + badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[12px] font-semibold" style={{
              color: stock.temel_sinyal?.includes('GÜÇLÜ') ? '#2CC98A'
                : stock.temel_sinyal?.includes('ORTA') ? '#F59E0B'
                : stock.temel_sinyal?.includes('ZAYIF') ? '#F97316'
                : '#E05252'
            }}>
              {stock.temel_sinyal || '—'} {stock.temel_puan ? `${stock.temel_puan}p` : ''}
            </span>
            {(() => {
              const k = stock.kombine_karar ?? '';
              if ((k.includes('GİRİLEBİLİR') || k.includes('GİR')) && !k.includes('GİRME')) {
                return <span className="inline-block px-3 py-1 rounded-[20px] text-[11px] font-medium" style={{ background: '#0d2e1f', color: '#2CC98A' }}>✅ GİR</span>;
              } else if (k.includes('BEKLE') || k.includes('DİKKATLİ') || k.includes('İZLE')) {
                return <span className="inline-block px-3 py-1 rounded-[20px] text-[11px] font-medium" style={{ background: '#2e2a0d', color: '#F59E0B' }}>⚠️ BEKLE</span>;
              } else if (k.includes('GİRME') || k.includes('TEMEL ENGEL')) {
                return <span className="inline-block px-3 py-1 rounded-[20px] text-[11px] font-medium" style={{ background: '#2e0d0d', color: '#E05252' }}>❌ GİRME</span>;
              } else {
                return <span className="inline-block px-3 py-1 rounded-[20px] text-[11px] font-medium" style={{ background: '#1e2d3d', color: '#64748b' }}>— VERİ YOK</span>;
              }
            })()}
          </div>
        </div>
      </div>

      {/* Temel Detail (expandable) */}
      {temelOpen && (
        <div className="p-[12px_18px] bg-t-bg3 text-[11px] text-t-txt2 animate-fade-in" style={{ borderTop: "1px solid var(--bdr)" }}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-[3px]">
            {stock.fk != null && <div className="flex justify-between"><span className="text-t-txt3">F/K</span><strong className={stock.fk < 15 ? "text-t-green" : stock.fk < 25 ? "text-t-warn" : "text-t-red"}>{stock.fk} {stock.fk < 15 ? "✅" : "❌"}</strong></div>}
            {stock.pddd != null && <div className="flex justify-between"><span className="text-t-txt3">PD/DD</span><strong className={stock.pddd < 1 ? "text-t-green" : "text-t-red"}>{stock.pddd} {stock.pddd < 1 ? "✅" : "❌"}</strong></div>}
            {stock.fd_favok != null && <div className="flex justify-between"><span className="text-t-txt3">FD/FAVÖK</span><strong className="text-t-txt">{stock.fd_favok}</strong></div>}
            {stock.roe != null && <div className="flex justify-between"><span className="text-t-txt3">ROE</span><strong className="text-t-txt">%{stock.roe}</strong></div>}
            {stock.net_borc != null && <div className="flex justify-between"><span className="text-t-txt3">Net Borç</span><strong className={stock.net_borc < 0 ? "text-t-green" : "text-t-red"}>{stock.net_borc > 0 ? "+" : ""}{(stock.net_borc / 1e9).toFixed(1)}B {stock.net_borc < 0 ? "✅" : "❌"}</strong></div>}
            {stock.fcf != null && <div className="flex justify-between"><span className="text-t-txt3">FCF</span><strong className={stock.fcf > 0 ? "text-t-green" : "text-t-red"}>{stock.fcf > 0 ? "+" : ""}{(stock.fcf / 1e6).toFixed(0)}M {stock.fcf > 0 ? "✅" : "❌"}</strong></div>}
          </div>

          {/* Skor Breakdown */}
          {stock.breakdown && Object.keys(stock.breakdown).length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--bdr)" }}>
              <div className="text-[9px] font-bold uppercase tracking-[.6px] text-t-txt3 mb-1.5">Skor Breakdown</div>
              <div className="text-[10.5px] text-t-txt2 font-mono">
                {Object.entries(stock.breakdown)
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => `${k}:+${v}`)
                  .join(" · ")}
              </div>
            </div>
          )}

          {/* KAP Haberleri */}
          {stock.kap_haberler && stock.kap_haberler.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--bdr)" }}>
              <div className="text-[9px] font-bold uppercase tracking-[.6px] text-t-txt3 mb-2">KAP Haberleri</div>
              <div className="flex flex-col gap-1.5">
                {stock.kap_haberler.map((h, i) => {
                  const href = h.url ?? h.link;
                  const content = (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-t-bg4 hover:bg-t-bg5 transition-colors">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 text-t-blue-l"
                        style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.2)" }}>
                        {h.kaynak ?? "KAP"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-t-txt2 leading-relaxed">{h.baslik}</div>
                        <div className="text-[9px] text-t-txt3 font-mono mt-0.5">{h.tarih}</div>
                      </div>
                      {href && <span className="text-[11px] text-t-blue-l shrink-0">↗</span>}
                    </div>
                  );
                  return href
                    ? <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="no-underline">{content}</a>
                    : <div key={i}>{content}</div>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Piyasa + Sinyal Zamanı */}
      {(stock.piyasa_rejimi || (stock.sinyal_zamani && stock.sinyal_zamani !== 'NORMAL') || (stock.pozisyon_pct && stock.pozisyon_pct > 0)) && (
        <div className="px-5 pb-1 pt-2 flex flex-wrap gap-1" style={{ borderTop: "1px solid var(--bdr)" }}>
          {stock.piyasa_rejimi && (
            <span className="text-[9px] px-[5px] py-[2px] rounded-[10px] font-semibold" style={{
              background: stock.piyasa_rejimi === 'BULL' ? '#0d2e1f' : stock.piyasa_rejimi === 'BEAR' ? '#2e0d0d' : '#1e2535',
              color: stock.piyasa_rejimi === 'BULL' ? '#2CC98A' : stock.piyasa_rejimi === 'BEAR' ? '#E05252' : '#94a3b8'
            }}>
              {stock.piyasa_rejimi === 'BULL' ? '🟢' : stock.piyasa_rejimi === 'BEAR' ? '🔴' : '🟡'} {stock.piyasa_rejimi}
            </span>
          )}
          {stock.sinyal_zamani && stock.sinyal_zamani !== 'NORMAL' && (
            <span className="text-[9px] px-[5px] py-[2px] rounded-[10px] font-semibold" style={{ background: '#1e2535', color: '#94a3b8' }}>
              {stock.sinyal_zamani === 'ERKEN' ? '🌱 ERKEN' : '🔔 GEÇ'}
            </span>
          )}
          {stock.pozisyon_pct != null && stock.pozisyon_pct > 0 && (
            <span className="text-[9px] px-[5px] py-[2px] rounded-[10px] font-semibold" style={{ background: '#1e2535', color: '#60a5fa' }}>
              📊 Poz: %{stock.pozisyon_pct}
            </span>
          )}
        </div>
      )}

      {/* Yabancı + Temettü + 52H */}
      {((stock.foreign_ratio != null && stock.foreign_ratio > 0) || (stock.div_yield != null && stock.div_yield > 0) || (stock.week52_pct != null && stock.week52_pct > 0)) && (
        <div className="px-5 pb-2 pt-1 flex gap-3 text-[11px] text-t-txt3">
          {stock.foreign_ratio != null && stock.foreign_ratio > 0 && <span>👥 Yab: %{stock.foreign_ratio.toFixed(1)}</span>}
          {stock.div_yield != null && stock.div_yield > 0 && <span>💰 Tem: %{stock.div_yield.toFixed(1)}</span>}
          {stock.week52_pct != null && stock.week52_pct > 0 && <span>📈 52H: %{stock.week52_pct.toFixed(0)}</span>}
        </div>
      )}

      {/* Add to Portfolio */}
      {onAddPortfolio && (
        <div className="p-[8px_14px] bg-t-bg3" style={{ borderTop: "1px solid var(--bdr)" }}>
          <button onClick={() => onAddPortfolio(ticker)}
            className="w-full py-[5px] px-3 rounded-lg text-[11px] font-bold text-t-blue-l cursor-pointer transition-all hover:bg-[rgba(59,130,246,.25)]"
            style={{ background: "rgba(59,130,246,.15)", border: "1px solid rgba(59,130,246,.3)" }}>
            + Portföye Ekle
          </button>
        </div>
      )}
    </div>
  );
}

function PriceCell({ label, value, cls = "", last }: { label: string; value: string; cls?: string; last?: boolean }) {
  return (
    <div className="p-[11px_14px]" style={!last ? { borderRight: "1px solid var(--bdr)" } : {}}>
      <div className="text-[9px] text-t-txt3 font-semibold uppercase tracking-[.6px] mb-[5px]">{label}</div>
      <div className={`font-mono text-[13px] font-semibold ${cls || "text-t-txt"}`}>{value}</div>
    </div>
  );
}

function MetricRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-center mb-1">
      <span className="text-[11px] text-t-txt3">{k}</span>
      <span className="text-[11px] font-semibold text-t-txt">{v}</span>
    </div>
  );
}

function PerfRow({ label, value }: { label: string; value: number }) {
  const isPos = value >= 0;
  return (
    <div className="flex items-center gap-2.5 mb-1.5 last:mb-0">
      <span className="text-[11px] text-t-txt3 w-[100px] shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-t-bg4 rounded-full relative overflow-visible">
        <div className="absolute left-1/2 -top-0.5 w-px h-2" style={{ background: "var(--bdr2)" }} />
        <div className={`absolute top-0 h-full rounded-full ${isPos ? "left-1/2" : "right-1/2"}`}
          style={{
            width: `${Math.min(Math.abs(value) * 3, 50)}%`,
            background: isPos ? "var(--c-green)" : "var(--c-red)"
          }} />
      </div>
      <span className={`font-mono text-[11px] font-bold w-11 text-right shrink-0 ${isPos ? "text-t-green" : "text-t-red"}`}>
        {isPos ? "+" : ""}{value.toFixed(1)}%
      </span>
    </div>
  );
}
