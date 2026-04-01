export default function Footer() {
  return (
    <footer className="mt-12 py-6 px-4 text-center border-t" style={{ borderColor: "var(--bdr)" }}>
      <div className="text-[12px] font-semibold text-t-txt2 font-syne">
        BISThinker<span className="text-[8px] align-super text-t-gold">®</span> — Gürkan Kuşcu © 2026
      </div>
      <div className="text-[10px] text-t-txt3 mt-1 font-mono">
        Kuruluş: 31 Mart 2026 · Versiyon: v1.0
      </div>
    </footer>
  );
}
