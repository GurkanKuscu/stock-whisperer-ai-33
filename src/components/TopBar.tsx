import { useState, useEffect, useMemo, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAppData } from "@/context/AppContext";
import { companyName } from "@/data/companyNames";

interface TopBarProps {
  onTickerSelect: (ticker: string) => void;
}

export default function TopBar({ onTickerSelect }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data } = useAppData();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const timeStr = time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

  const results = useMemo(() => {
    const term = q.trim().toUpperCase();
    if (!term) return [];
    const tickers = Object.keys(data);
    return tickers
      .map(t => ({ t, name: companyName(t) }))
      .filter(({ t, name }) => t.includes(term) || name.toUpperCase().includes(term))
      .slice(0, 8);
  }, [q, data]);

  const handlePick = (t: string) => {
    onTickerSelect(t);
    setQ("");
    setOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-30 h-[56px] flex items-center gap-3 px-4 max-md:pl-[60px]"
      style={{ background: "var(--bg)", borderBottom: "1px solid var(--bdr)" }}
    >
      {/* Search (left/center) */}
      <div ref={wrapRef} className="relative flex-1 max-w-[520px]">
        <input
          type="text"
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Enter" && results[0]) handlePick(results[0].t);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="🔍 Hisse Ara (örn: THYAO, Garanti)"
          className="w-full h-9 px-3 rounded-lg text-[12.5px] bg-t-bg3 text-t-txt placeholder:text-t-txt3 outline-none transition-colors focus:bg-t-bg4"
          style={{ border: "1px solid var(--bdr)" }}
        />
        {open && results.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-40 shadow-t"
            style={{ background: "var(--card)", border: "1px solid var(--bdr2)" }}
          >
            {results.map(({ t, name }) => (
              <button
                key={t}
                onClick={() => handlePick(t)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-t-bg3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[12.5px] font-bold text-t-txt">{t}</div>
                  <div className="text-[10.5px] text-t-txt3 truncate">{name}</div>
                </div>
                <span className="text-[10px] text-t-txt3">↵</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 hidden md:block" />

      {/* Right cluster */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-t-bg3 rounded-lg"
          style={{ border: "1px solid var(--bdr)" }}
        >
          <div
            className="w-1.5 h-1.5 bg-t-green rounded-full animate-pulse-dot"
            style={{ boxShadow: "0 0 6px var(--c-green)" }}
          />
          <span className="font-mono text-[11px] text-t-green-l font-semibold tracking-[.5px]">{timeStr}</span>
          <span className="text-[10px] text-t-txt3 hidden sm:inline">
            <span className="inline-block w-px h-3 mx-1.5" style={{ background: "var(--bdr2)" }} />
            {dateStr}
          </span>
        </div>
        <ThemeToggle />
        <button
          onClick={() => window.location.reload()}
          className="hidden sm:inline-flex px-3 py-[7px] rounded-lg text-[11px] font-semibold cursor-pointer transition-all text-t-txt2 bg-t-bg3 hover:bg-t-bg4 hover:text-t-txt"
          style={{ border: "1px solid var(--bdr2)" }}
        >
          ↻ Yenile
        </button>
      </div>
    </header>
  );
}
