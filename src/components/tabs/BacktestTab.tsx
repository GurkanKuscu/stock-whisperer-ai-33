import { useState, useEffect } from "react";

export default function BacktestTab() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<string>("Ozet");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://207.154.212.100:8080/api/backtest")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (!data || !data.sheets) return <div className="p-8 text-center">Backtest verisi yok</div>;

  const sheets = data.sheets;
  const currentSheet = sheets[tab];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-[20px] font-bold mb-2">📊 Backtest Sonuçları</h2>
        <p className="text-[12px] text-t-txt3">Dosya: {data.file}</p>
      </div>

      <div className="flex gap-2 mb-4 border-b border-[var(--bdr)]">
        {Object.keys(sheets).map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-4 py-2 text-[13px] font-bold ${tab===s ? 'border-b-2 border-blue-500 text-blue-400' : 'text-t-txt3'}`}>
            {s}
          </button>
        ))}
      </div>

      {currentSheet && (
        <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
          <table className="w-full text-[12px]">
            <thead style={{ position: "sticky", top: 0, background: "var(--bg2)" }}>
              <tr>
                {currentSheet.headers.map((h: string, i: number) => (
                  <th key={i} className="px-3 py-2 text-left border-b border-[var(--bdr)] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSheet.rows.slice(0, 500).map((row: any, i: number) => (
                <tr key={i} className="hover:bg-[var(--bg3)]">
                  {currentSheet.headers.map((h: string, j: number) => (
                    <td key={j} className="px-3 py-2 border-b border-[var(--bdr)]">{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {currentSheet.rows.length > 500 && (
            <p className="text-center text-[11px] text-t-txt3 mt-2">İlk 500 satır gösteriliyor (toplam: {currentSheet.rows.length})</p>
          )}
        </div>
      )}
    </div>
  );
}
