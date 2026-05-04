import { useState } from "react";

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

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const W = collapsed ? 64 : 220;

  const NavList = (
    <nav className="flex flex-col gap-[2px] px-2">
      {TABS.map(t => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => { onTabChange(t.id); setMobileOpen(false); }}
            title={collapsed ? t.label : undefined}
            className={`flex items-center gap-3 rounded-lg cursor-pointer transition-all whitespace-nowrap text-[12.5px] font-medium ${
              collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
            } ${
              active
                ? "text-white bg-t-bg4"
                : "text-t-txt2 hover:text-t-txt hover:bg-t-bg3"
            }`}
            style={active ? { border: "1px solid var(--bdr2)" } : { border: "1px solid transparent" }}
          >
            <span className="text-[15px] leading-none w-5 text-center shrink-0">{t.icon}</span>
            {!collapsed && <span className="tracking-[.01em] truncate">{t.label}</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger (top-left, fixed) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-[60] md:hidden flex flex-col gap-[5px] p-2.5 rounded-lg bg-t-bg3"
        style={{ border: "1px solid var(--bdr)" }}
        aria-label="Menüyü aç"
      >
        <span className="block w-[18px] h-[2px] bg-t-txt rounded-full" />
        <span className="block w-[18px] h-[2px] bg-t-txt rounded-full" />
        <span className="block w-[18px] h-[2px] bg-t-txt rounded-full" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 z-40 flex-col py-4"
        style={{
          width: W,
          background: "var(--bg)",
          borderRight: "1px solid var(--bdr)",
          transition: "width .2s ease",
        }}
      >
        {/* Brand */}
        <div
          className={`flex items-center gap-3 px-3 mb-4 cursor-pointer ${collapsed ? "justify-center" : ""}`}
          onClick={() => onTabChange("anasayfa")}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[17px] shrink-0"
            style={{
              background: "linear-gradient(135deg, #C9943A, #8A6420)",
              boxShadow: "0 0 18px rgba(201,148,58,.3), inset 0 1px 0 rgba(255,255,255,.15)",
            }}
          >
            ⚡
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-syne text-[14.5px] font-extrabold tracking-[.5px] truncate">
                BISTHINKER<span className="text-[9px] align-super text-t-gold opacity-70">®</span>
              </div>
              <div className="text-[8.5px] text-t-txt3 font-medium uppercase tracking-[1px] mt-[1px] truncate">
                Yatırım Platformu
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">{NavList}</div>

        {/* Collapse toggle */}
        <div className="px-2 pt-2 mt-2" style={{ borderTop: "1px solid var(--bdr)" }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`flex items-center gap-2 w-full rounded-lg cursor-pointer text-[11px] font-semibold text-t-txt3 hover:text-t-txt hover:bg-t-bg3 transition-all ${
              collapsed ? "justify-center px-0 py-2" : "px-3 py-2"
            }`}
            title={collapsed ? "Genişlet" : "Daralt"}
          >
            <span className="text-[13px]">{collapsed ? "›" : "‹"}</span>
            {!collapsed && <span>Daralt</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[70] md:hidden"
            style={{ background: "rgba(0,0,0,.6)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed top-0 left-0 bottom-0 z-[80] md:hidden flex flex-col py-4 w-[240px] animate-slide-in-right"
            style={{ background: "var(--bg)", borderRight: "1px solid var(--bdr)" }}
          >
            <div className="flex items-center gap-3 px-3 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[17px]"
                style={{ background: "linear-gradient(135deg, #C9943A, #8A6420)" }}
              >
                ⚡
              </div>
              <div className="font-syne text-[14.5px] font-extrabold">BISTHINKER</div>
              <button
                onClick={() => setMobileOpen(false)}
                className="ml-auto text-t-txt2 text-[20px] px-2"
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{NavList}</div>
          </aside>
        </>
      )}
    </>
  );
}

export const SIDEBAR_WIDTHS = { collapsed: 64, expanded: 220 };
