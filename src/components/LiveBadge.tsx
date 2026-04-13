import { formatLastUpdate } from "@/hooks/usePrices";

interface LiveBadgeProps {
  lastUpdate: Date | null;
  isStale: boolean;
  borsaOpen: boolean;
}

export default function LiveBadge({ lastUpdate, isStale, borsaOpen }: LiveBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-[10px]" style={{ color: "#64748b" }}>
      {isStale && (
        <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: "rgba(245,158,11,.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,.2)" }}>
          (bayat)
        </span>
      )}
      {!borsaOpen && (
        <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: "rgba(100,116,139,.1)", color: "#94a3b8" }}>
          🔒 Borsa kapalı
        </span>
      )}
      <span>🔄 {formatLastUpdate(lastUpdate)}</span>
    </div>
  );
}
