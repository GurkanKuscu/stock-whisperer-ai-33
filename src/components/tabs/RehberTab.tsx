import { useState } from "react";

const bolumler = [
  { id: "sistem", ikon: "🚀", baslik: "Sistem Nedir" },
  { id: "sinyal", ikon: "📊", baslik: "Sinyal Kartı" },
  { id: "karar", ikon: "🎯", baslik: "Karar İfadeleri" },
  { id: "finans", ikon: "🤖", baslik: "Finans Analizi" },
  { id: "pozisyon", ikon: "📐", baslik: "Pozisyon Büyüklüğü" },
  { id: "cikis", ikon: "🚪", baslik: "Çıkış Kuralları" },
  { id: "rejim", ikon: "📈", baslik: "Piyasa Rejimi" },
  { id: "rutin", ikon: "📅", baslik: "Haftalık Rutin" },
];

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    green: { bg: "rgba(44,201,138,0.15)", text: "#2CC98A" },
    red: { bg: "rgba(224,82,82,0.15)", text: "#E05252" },
    yellow: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
    orange: { bg: "rgba(249,115,22,0.15)", text: "#F97316" },
    blue: { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
    gray: { bg: "rgba(148,163,184,0.15)", text: "#94a3b8" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 700, background: c.bg, color: c.text }}>
      {children}
    </span>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #334155", color: "#64748b", fontSize: 11, fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(51,65,85,0.4)" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 12px", color: "#cbd5e1" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SistemNedir() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>🚀 Sistem Nedir</h2>
      <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.8 }}>
        BISThinker, Borsa İstanbul'da yükseliş potansiyeli taşıyan hisseleri otomatik tarayan bir <strong style={{ color: "#60a5fa" }}>karar destek sistemidir</strong>.
      </p>
      <div style={{ marginTop: 16, padding: 16, background: "rgba(30,58,95,0.3)", borderRadius: 12, border: "1px solid #334155" }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>⏰ Günlük Tarama Saatleri</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["10:30", "12:00", "15:00", "17:30", "18:10", "18:30"].map(s => (
            <span key={s} style={{ padding: "4px 12px", background: "rgba(96,165,250,0.15)", color: "#60a5fa", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{s}</span>
          ))}
        </div>
      </div>
      <ul style={{ marginTop: 16, color: "#94a3b8", fontSize: 13, lineHeight: 2, listStyle: "none", padding: 0 }}>
        <li>✦ Her sinyal için <strong style={{ color: "#cbd5e1" }}>teknik analiz</strong>, <strong style={{ color: "#cbd5e1" }}>temel analiz</strong> ve <strong style={{ color: "#cbd5e1" }}>AI Finans Analizi</strong> üretir</li>
        <li>✦ Nihai karar her zaman <strong style={{ color: "#F59E0B" }}>kullanıcıya aittir</strong></li>
      </ul>
    </div>
  );
}

function SinyalKarti() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>📊 Sinyal Kartı Nasıl Okunur</h2>
      <Table
        headers={["İkon / Alan", "Anlamı"]}
        rows={[
          ["💎", "BIST30 hissesi — daha likit, daha güvenilir"],
          [<Badge color="green">🌱 ERKEN</Badge>, "Hareket henüz başlamamış, erken giriş fırsatı"],
          [<Badge color="orange">🔔 GEÇ</Badge>, "Hareket başlamış, momentum devam edebilir"],
          [<Badge color="green">🟢 BULL</Badge>, "Piyasa yükseliş trendinde"],
          [<Badge color="red">🔴 BEAR</Badge>, "Piyasa düşüş trendinde — dikkatli ol"],
          [<Badge color="yellow">🟡 NÖTR</Badge>, "Piyasa yönü belirsiz"],
          ["Poz:%", "Önerilen pozisyon büyüklüğü"],
          ["⏰ 5g / 10g / 15g+", "Sinyalin kaç gündür aktif olduğu"],
        ]}
      />
    </div>
  );
}

function KararIfadeleri() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>🎯 Karar İfadeleri</h2>
      <Table
        headers={["Karar", "Renk", "Anlamı"]}
        rows={[
          [<Badge color="green">✅ GÜÇLÜ GİRİŞ</Badge>, "Yeşil", "Teknik + Temel uyumlu, en güçlü sinyal"],
          [<Badge color="green">🟢 GİRİLEBİLİR</Badge>, "Yeşil", "Normal giriş, temel destekliyor"],
          [<Badge color="yellow">🟡 DİKKATLİ</Badge>, "Sarı", "Temel zayıf, küçük pozisyon önerilir"],
          [<Badge color="orange">⚠️ BEKLE</Badge>, "Turuncu", "Teknik gelişmeli, henüz erken"],
          [<Badge color="red">❌ GİRME</Badge>, "Kırmızı", "Temel engel var"],
          [<Badge color="orange">⚠️ TEKNİK GÜÇLÜ AMA TEMEL KÖTÜ</Badge>, "Turuncu", "Momentum var ama temel zayıf"],
          [<Badge color="blue">🔍 İZLE</Badge>, "Mavi", "Temel iyi, teknik gelişmeli"],
        ]}
      />
    </div>
  );
}

function FinansAnalizi() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>🤖 Finans Analizi Nasıl Kullanılır</h2>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>Her confirmed sinyal için AI otomatik analiz üretir:</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 24 }}>
        {["TEZ: Neden şimdi bu hisse?", "KARŞI TEZ: Ne olursa kapat?", "3 SENARYO: Baz / Olumsuz / Şok", "RİSK SINIRI: Max zarar, çıkış", "KARAR: GİR / BEKLE / GEÇ"].map(t => (
          <div key={t} style={{ padding: "10px 14px", background: "rgba(30,58,95,0.3)", borderRadius: 8, border: "1px solid #334155", color: "#cbd5e1", fontSize: 12 }}>{t}</div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>BISThinker + AI Kararı Birlikte Okunursa:</div>
      <Table
        headers={["BISThinker", "AI", "Öneri"]}
        rows={[
          [<Badge color="green">GİRİLEBİLİR</Badge>, <Badge color="green">🟢 GİR</Badge>, "Güçlü sinyal — tam pozisyon"],
          [<Badge color="green">GİRİLEBİLİR</Badge>, <Badge color="orange">⚠️ BEKLE</Badge>, "Dikkatli — yarım pozisyon"],
          [<Badge color="yellow">DİKKATLİ</Badge>, <Badge color="green">🟢 GİR</Badge>, "Küçük pozisyon"],
          [<Badge color="red">GİRME</Badge>, <Badge color="red">❌ GEÇ</Badge>, "Geç"],
        ]}
      />
    </div>
  );
}

function PozisyonBuyuklugu() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>📐 Pozisyon Büyüklüğü</h2>
      <div style={{ padding: 16, background: "rgba(30,58,95,0.3)", borderRadius: 12, border: "1px solid #334155", marginBottom: 16 }}>
        <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.8 }}>
          <strong style={{ color: "#60a5fa" }}>Poz:%</strong> = ATR bazlı hesaplanmış önerilen pozisyon yüzdesi.
        </p>
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>
          Örnek: <strong style={{ color: "#cbd5e1" }}>Poz:%15</strong> → 10.000 TL portföyde <strong style={{ color: "#2CC98A" }}>1.500 TL</strong> gir.
        </p>
      </div>
      <ul style={{ color: "#94a3b8", fontSize: 13, lineHeight: 2.2, listStyle: "none", padding: 0 }}>
        <li>🔴 <strong style={{ color: "#E05252" }}>BEAR</strong> modunda otomatik yarıya iner</li>
        <li>🌱 <strong style={{ color: "#2CC98A" }}>ERKEN</strong> sinyallerde %25 küçültülür</li>
        <li>🔔 <strong style={{ color: "#F97316" }}>GEÇ</strong> sinyallerde %25 büyütülür (max %25)</li>
      </ul>
    </div>
  );
}

function CikisKurallari() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>🚪 Çıkış Kuralları</h2>
      <Table
        headers={["Durum", "Aksiyon"]}
        rows={[
          ["Hedef fiyata ulaştı", <span style={{ color: "#2CC98A" }}>Çık — HEDEF TUTTU</span>],
          ["Stop fiyatına düştü", <span style={{ color: "#E05252" }}>Çık — STOP LOSS</span>],
          ["Hedefe %50 ulaştı", <span style={{ color: "#60a5fa" }}>Trailing stop devreye girer — stop girişe çekilir</span>],
          ["⏰ 15g+", <span style={{ color: "#F59E0B" }}>15 gün geçti, karar ver — kapat veya devam et</span>],
        ]}
      />
    </div>
  );
}

function PiyasaRejimi() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>📈 Piyasa Rejimi</h2>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>Backtest verisi: BULL dönemlerde %57-71, BEAR dönemlerde %6-17 başarı.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "🟢", label: "BULL", desc: "Normal işlem yap", color: "#2CC98A" },
          { icon: "🔴", label: "BEAR", desc: "Sadece 75+ puanlı sinyaller geçer, pozisyon yarıya iner", color: "#E05252" },
          { icon: "🟡", label: "NÖTR", desc: "Dikkatli ol, 70+ puanlı sinyallere bak", color: "#F59E0B" },
        ].map(r => (
          <div key={r.label} style={{ padding: "12px 16px", background: "rgba(30,58,95,0.2)", borderRadius: 10, border: "1px solid #334155", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{r.icon}</span>
            <div>
              <strong style={{ color: r.color, fontSize: 14 }}>{r.label}</strong>
              <span style={{ color: "#94a3b8", fontSize: 13, marginLeft: 8 }}>→ {r.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HaftalikRutin() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>📅 Haftalık Rutin</h2>
      <Table
        headers={["Gün", "Yapılacak"]}
        rows={[
          [<strong style={{ color: "#60a5fa" }}>Pazartesi 10:30</strong>, "İlk tarama — günün sinyal listesine bak"],
          [<strong style={{ color: "#cbd5e1" }}>Hafta içi</strong>, "Telegram bildirimlerini takip et"],
          [<strong style={{ color: "#F59E0B" }}>Pazar 10:30</strong>, "Backtest sonuçlarına bak"],
          [<strong style={{ color: "#2CC98A" }}>Pazar 12:00</strong>, "Kaçırılan fırsat raporunu oku"],
        ]}
      />
    </div>
  );
}

const sections: Record<string, () => JSX.Element> = {
  sistem: SistemNedir,
  sinyal: SinyalKarti,
  karar: KararIfadeleri,
  finans: FinansAnalizi,
  pozisyon: PozisyonBuyuklugu,
  cikis: CikisKurallari,
  rejim: PiyasaRejimi,
  rutin: HaftalikRutin,
};

export default function RehberTab() {
  const [aktif, setAktif] = useState("sistem");
  const Section = sections[aktif] || SistemNedir;

  return (
    <div style={{ display: "flex", gap: 24, minHeight: "70vh" }} className="max-md:flex-col max-md:gap-4">
      {/* Sol menü */}
      <div className="max-md:flex max-md:overflow-x-auto max-md:gap-1 max-md:pb-2" style={{ width: 220, flexShrink: 0 }}>
        <div className="max-md:flex max-md:gap-1 max-md:w-max" style={{ position: "sticky", top: 80 }}>
          {bolumler.map(b => (
            <div
              key={b.id}
              onClick={() => setAktif(b.id)}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 4,
                background: aktif === b.id ? "rgba(30,58,95,0.5)" : "transparent",
                color: aktif === b.id ? "#60a5fa" : "#64748b",
                fontSize: 13,
                fontWeight: aktif === b.id ? 600 : 400,
                transition: "all 0.15s",
                border: aktif === b.id ? "1px solid rgba(96,165,250,0.2)" : "1px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {b.ikon} {b.baslik}
            </div>
          ))}
        </div>
      </div>

      {/* Sağ içerik */}
      <div style={{ flex: 1, padding: "20px 24px", background: "rgba(15,23,42,0.5)", borderRadius: 16, border: "1px solid #334155" }} className="max-md:p-4">
        <Section />
      </div>
    </div>
  );
}
