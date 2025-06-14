
import React from "react";
import { useNumberSelection } from "./NumberSelectionContext";

export default function LotteryTicket() {
  const { picked } = useNumberSelection();

  // Sort numbers for ticket display
  const sorted = [...picked].sort((a, b) => a - b);

  return (
    <div className="w-full flex flex-col items-center justify-center px-2">
      <div className="mb-4 font-bold text-lg tracking-wide text-[#217d37]">Your Numbers</div>
      <div
        className="flex flex-wrap justify-center items-center gap-3 bg-gradient-to-r from-green-100/70 via-white to-green-100/70 rounded-2xl shadow-inner px-2 py-6 max-w-full"
        style={{ width: "100%", maxWidth: 400 }}
      >
        {sorted.map(n => (
          <span
            key={n}
            className="flex items-center justify-center rounded-full bg-green-500 text-white text-2xl font-black shadow-green-300 shadow-lg border-[3px] border-green-700 select-none lottery-num"
            style={{
              width: "min(3.3rem, 16vw)",
              height: "min(3.3rem, 16vw)",
              minWidth: 44,
              minHeight: 44,
              fontSize: "clamp(1.1rem, 6vw, 2rem)"
            }}
          >
            {n}
          </span>
        ))}
      </div>
      <div className="mt-4 text-sm text-muted-foreground text-center px-2">Numbers locked in until next round!</div>
    </div>
  );
}
