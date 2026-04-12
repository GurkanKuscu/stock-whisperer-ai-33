import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const TABS = [
  { id: "anasayfa", icon: "🏠", label: "Ana Sayfa" },
  { id: "sinyaller", icon: "⚡", label: "Sinyaller" },
  { id: "finans", icon: "🤖", label: "Finans Analizi" },
  { id: "temel", icon: "📊", label: "Temel Analiz" },
  { id: "ara", icon: "🔍", label: "Hisse Ara" },
  { id: "portfolio", icon: "📈", label: "Portföy" },
  { id: "arsiv", icon: "📋", label: "Arşiv" },
  { id: "kacirilanlar", icon: "🎯", label: "Kaçırılanlar" },
  { id: "rehber", icon: "📖", label: "Rehber" },
];

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[60px] border-b backdrop-blur-[20px]"
        style={{ background: "var(--bg)", borderColor: "var(--bdr)", opacity: 0.96 }}>
        <div className="max-w-[1600px] mx-auto px-7 h-full flex items-center justify-between gap-4 max-md:px-3 max-md:gap-2">
          {/* Brand */}
          <div className="flex items-center shrink-0 cursor-pointer gap-3" onClick={() => onTabChange("anasayfa")}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[17px] relative"
              style={{
                background: "linear-gradient(135deg, #C9943A, #8A6420)",
                boxShadow: "0 0 20px rgba(201,148,58,.3), inset 0 1px 0 rgba(255,255,255,.15)"
              }}>
              ⚡
            </div>
            <div>
              <div className="font-syne text-[16px] font-extrabold tracking-[.5px]">
                BISTHINKER<span className="text-[10px] align-super text-t-gold opacity-70">®</span>
              </div>
              <div className="text-[9px] text-t-txt3 font-medium uppercase tracking-[1.2px] mt-[1px]">
                Kurumsal Yatırım Platformu
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-[1px] flex-1 justify-center">
            {TABS.map(t => (
              <button key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`px-3 py-[7px] text-[11px] font-medium cursor-pointer rounded-lg transition-all flex items-center gap-1 whitespace-nowrap tracking-[.01em] ${
                  activeTab === t.id
                    ? "text-white bg-t-bg4 border border-solid"
                    : "text-t-txt2 hover:text-t-txt hover:bg-t-bg3 border border-transparent"
                }`}
                style={activeTab === t.id ? { borderColor: "var(--bdr2)" } : {}}>
                <span className={`text-[12px] ${activeTab === t.id ? "opacity-100" : "opacity-80"}`}>{t.icon}</span>
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 max-md:gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-t-bg3 rounded-lg max-md:px-2"
              style={{ border: "1px solid var(--bdr)" }}>
              <div className="w-1.5 h-1.5 bg-t-green rounded-full animate-pulse-dot"
                style={{ boxShadow: "0 0 6px var(--c-green)" }} />
              <span className="font-mono text-[11px] text-t-green-l font-semibold tracking-[.5px]">{timeStr}</span>
              <span className="text-[10px] text-t-txt3 hidden sm:inline">
                <span className="inline-block w-px h-3 mx-1.5" style={{ background: "var(--bdr2)" }} />
                {dateStr}
              </span>
            </div>

            <ThemeToggle />

            <button onClick={() => window.location.reload()}
              className="hidden sm:inline-flex px-3.5 py-[7px] rounded-lg text-[11px] font-semibold cursor-pointer transition-all text-t-txt2 bg-t-bg3 hover:bg-t-bg4 hover:text-t-txt"
              style={{ border: "1px solid var(--bdr2)" }}>
              ↻ Yenile
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex md:hidden flex-col gap-[5px] cursor-pointer p-2 rounded-lg bg-t-bg3"
              style={{ border: "1px solid var(--bdr)" }}>
              <span className={`block w-[20px] h-[2px] bg-t-txt rounded-full transition-all ${menuOpen ? "rotate-45 translate-x-[5px] translate-y-[5px]" : ""}`} />
              <span className={`block w-[20px] h-[2px] bg-t-txt rounded-full transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-[20px] h-[2px] bg-t-txt rounded-full transition-all ${menuOpen ? "-rotate-45 translate-x-[5px] -translate-y-[5px]" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-[60px] left-0 right-0 bottom-0 z-[999] flex flex-col p-4 gap-1 overflow-y-auto md:hidden"
          style={{ background: "rgba(8,12,20,.97)" }}>
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => { onTabChange(t.id); setMenuOpen(false); }}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] font-semibold cursor-pointer transition-all ${
                activeTab === t.id
                  ? "bg-t-bg3 text-white"
                  : "text-t-txt2 hover:bg-t-bg3 hover:text-white"
              }`}
              style={activeTab === t.id ? { border: "1px solid var(--bdr2)" } : { border: "1px solid transparent" }}>
              <span className="text-[20px] w-7 text-center">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
