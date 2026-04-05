import { useAppData } from "@/context/AppContext";

export default function AlarmsTab() {
  const { data } = useAppData();

  // Generate alarms from data
  const alarms: { icon: string; title: string; sub: string; time: string; type: string }[] = [];

  Object.entries(data).forEach(([ticker, s]) => {
    if (s.confirmed && s.score >= 80) {
      alarms.push({ icon: "🟢", title: `${ticker} — Güçlü Sinyal Onaylandı`, sub: `Skor: ${s.score} · ${s.sector_name}`, time: "Bugün", type: "new" });
    }
    if (s.tavan_kapat) {
      alarms.push({ icon: "🔔", title: `${ticker} — Tavan Kapanış`, sub: `${s.close.toFixed(2)} ₺ · ${s.sector_name}`, time: "Bugün", type: "tavan" });
    }
    if (s.manip_detected) {
      alarms.push({ icon: "⚠️", title: `${ticker} — Manipülasyon Tespiti`, sub: `Dikkat: Anormal hacim hareketi`, time: "Bugün", type: "seri" });
    }
    if (s.rsi > 70) {
      alarms.push({ icon: "📊", title: `${ticker} — Aşırı Alım Bölgesi`, sub: `RSI: ${s.rsi} · Kâr al değerlendir`, time: "Bugün", type: "strong" });
    }
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-[18px] mt-8">
        <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px]"
          style={{ background: "var(--warn-bg)", border: "1px solid var(--warn-bdr)" }}>🔔</div>
        <div>
          <h2 className="font-syne text-[15px] font-bold text-t-txt">Alarmlar</h2>
          <p className="text-[11px] text-t-txt3 mt-[1px]">Snapshot karşılaştırması ve fiyat alarmları</p>
        </div>
      </div>

      {alarms.length === 0 ? (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">🔔</div>
          <div className="text-[14px] font-bold text-t-txt2">Aktif alarm yok</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {alarms.slice(0, 20).map((a, i) => (
            <div key={i} className="bg-t-card rounded-[10px] p-[10px_12px] transition-all hover:border-[var(--bdr2)]"
              style={{
                border: "1px solid var(--bdr)",
                borderTop: `2px solid ${a.type === "new" ? "var(--c-green)" : a.type === "tavan" ? "var(--c-warn)" : a.type === "seri" ? "var(--c-red)" : "var(--c-blue)"}`
              }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px]">{a.icon}</span>
                <span className="text-[13px] font-medium text-t-txt truncate">{a.title.split(' — ')[0]}</span>
              </div>
              <div className="text-[11px] text-t-txt2 truncate">{a.title.split(' — ')[1]}</div>
              <div className="text-[10px] text-t-txt3 mt-1">{a.sub} · {a.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
