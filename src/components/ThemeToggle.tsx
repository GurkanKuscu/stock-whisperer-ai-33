import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bisthinker-theme") !== "light";
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove("light-theme");
      localStorage.setItem("bisthinker-theme", "dark");
    } else {
      root.classList.add("light-theme");
      localStorage.setItem("bisthinker-theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      className="px-2.5 py-[7px] rounded-lg text-[14px] cursor-pointer transition-all bg-t-bg3 hover:bg-t-bg4"
      style={{ border: "1px solid var(--bdr2)" }}
      title={dark ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
