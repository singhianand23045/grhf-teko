import React from "react";
import { useNumberSelection } from "./NumberSelectionContext";

export default function LotteryTicket({ compact = false }: { compact?: boolean }) {
  const { picked } = useNumberSelection();
  const sorted = [...picked].sort((a, b) => a - b);

  return (
    <div
      className={`w-full flex flex-col items-center justify-center px-2 ${compact ? "mt-0 mb-0" : ""}`}
      style={compact ? { marginTop: 0, marginBottom: 0 } : {}}
    >
      <div className={`mb-2 font-bold text-lg tracking-wide text-[#217d37] ${compact ? "mt-0" : ""}`}>
        Your Numbers
      </div>
      <div
        className="flex flex-nowrap justify-center items-center gap-4 bg-gradient-to-r from-green-100/70 via-white to-green-100/70 rounded-2xl shadow-inner px-1 py-3 w-full"
        style={{
          minHeight: 44,
        }}
      >
        {sorted.map((n) => (
          <span
            key={n}
            className="flex items-center justify-center rounded-full bg-green-500 text-white font-black shadow-green-300 shadow-lg border-[2px] border-green-700 select-none lottery-num transition-all aspect-square"
            style={{
              width: "clamp(2.2rem, 7vw, 3rem)",
              minWidth: 40,
              height: "clamp(2.2rem, 7vw, 3rem)",
              minHeight: 40,
              fontSize: "clamp(0.9rem, 4.5vw, 1.1rem)",
              lineHeight: 1.1,
              padding: 0,
            }}
          >
            {n}
          </span>
        ))}
      </div>
      <div className={`mt-2 text-sm text-muted-foreground text-center px-2 ${compact ? "mt-1" : ""}`}>
        Numbers locked in until next round!
      </div>
    </div>
  );
}
