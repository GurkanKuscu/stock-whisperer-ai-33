interface PriceProgressBarProps {
  stop: number;
  giris: number;
  hedef: number;
  currentPrice: number;
  durum: string;
}

export default function PriceProgressBar({ stop, giris, hedef, currentPrice, durum }: PriceProgressBarProps) {
  const range = hedef - stop;
  const entryPos = range > 0 ? Math.max(0, Math.min(100, ((giris - stop) / range) * 100)) : 50;
  const currentPos = range > 0 ? Math.max(0, Math.min(100, ((currentPrice - stop) / range) * 100)) : 50;
  const isPositive = currentPos >= entryPos;

  return (
    <div>
      <div className="relative h-[5px] bg-t-bg4 rounded-full overflow-visible">
        {/* Entry marker - white vertical line */}
        <div className="absolute top-[-3px] w-[2px] h-[11px] rounded-full z-10"
          style={{ left: `${entryPos}%`, background: "rgba(255,255,255,.5)" }} />
        {/* Fill */}
        <div className="absolute top-0 left-0 h-full rounded-full transition-all" style={{
          width: `${currentPos}%`,
          background: isPositive ? "#2CC98A" : "#E05252",
        }} />
        {/* Current marker */}
        <div className="absolute top-[-4px] w-[10px] h-[13px] rounded-sm z-20 flex items-center justify-center"
          style={{ left: `calc(${currentPos}% - 5px)`, background: isPositive ? "#2CC98A" : "#E05252" }}>
          <span className="text-[6px] font-bold text-white">●</span>
        </div>
      </div>
      {/* Labels under bar */}
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[9px] font-mono" style={{ color: "#E05252" }}>{stop.toFixed(2)}</span>
        <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,.5)" }}>
          Giriş: {giris.toFixed(2)} · Güncel: {currentPrice.toFixed(2)}
        </span>
        <span className="text-[9px] font-mono" style={{ color: "#2CC98A" }}>{hedef.toFixed(2)}</span>
      </div>
    </div>
  );
}
