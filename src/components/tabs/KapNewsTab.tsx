import { useAppData } from "@/context/AppContext";

export default function KapNewsTab() {
  const { data } = useAppData();

  // Collect KAP news from all stocks
  const allNews: { ticker: string; haber: { baslik: string; kaynak: string; tarih: string; link?: string } }[] = [];
  Object.entries(data).forEach(([ticker, s]) => {
    if (s.kap_haberler?.length) {
      s.kap_haberler.forEach(h => allNews.push({ ticker, haber: h }));
    }
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-[18px] mt-8">
        <div className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-[15px]"
          style={{ background: "var(--blue-bg)", border: "1px solid rgba(59,130,246,.25)" }}>📰</div>
        <div>
          <h2 className="font-syne text-[15px] font-bold text-t-txt">KAP Haberleri</h2>
          <p className="text-[11px] text-t-txt3 mt-[1px]">Kamuyu Aydınlatma Platformu bildirimleri</p>
        </div>
      </div>

      {allNews.length === 0 ? (
        <div className="p-[60px_20px] text-center text-t-txt3">
          <div className="text-[44px] mb-3 opacity-50">📰</div>
          <div className="text-[14px] font-bold text-t-txt2">KAP haberi yok</div>
          <div className="text-[11px]">Haberler snapshot'a eklendiğinde burada görünecek</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {allNews.map((n, i) => (
            <div key={i} className="bg-t-card rounded-xl p-[16px_20px] transition-all hover:border-[var(--bdr2)]"
              style={{ border: "1px solid var(--bdr)" }}>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11.5px] font-bold px-[9px] py-[3px] bg-t-bg4 text-t-txt rounded-md tracking-[.3px]"
                    style={{ border: "1px solid var(--bdr2)" }}>{n.ticker}</span>
                  <span className={`text-[9.5px] font-bold px-2 py-[2px] rounded ${
                    n.haber.kaynak === "Matriks" ? "bg-[var(--purple-bg)] text-[#C4A8FF] border border-[rgba(139,103,229,.2)]" : "bg-[var(--blue-bg)] text-t-blue-l border border-[rgba(59,130,246,.2)]"
                  }`}>{n.haber.kaynak}</span>
                </div>
                <span className="text-[10px] text-t-txt3 font-mono">{n.haber.tarih}</span>
              </div>
              <div className="text-[12px] leading-[1.7] text-t-txt2 mb-2">{n.haber.baslik}</div>
              {n.haber.link && (
                <a href={n.haber.link} target="_blank" rel="noopener" className="text-[11px] font-semibold text-t-accent opacity-90 hover:opacity-100 no-underline">
                  Detay →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
