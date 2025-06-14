import React from "react";
import { useNumberSelection } from "./NumberSelectionContext";

export default function LotteryTicket() {
  const { picked } = useNumberSelection();

  // Sort numbers for ticket display
  const sorted = [...picked].sort((a, b) => a - b);

  return (
    <div className="w-full flex flex-col items-center justify-center px-2">
      <div className="mb-4 font-bold text-lg tracking-wide text-[#217d37]">
        Your Numbers
      </div>
      <div
        className="flex flex-nowrap justify-center items-center gap-2 bg-gradient-to-r from-green-100/70 via-white to-green-100/70 rounded-2xl shadow-inner px-1 py-4 w-full"
        // Height limited to help always keep them centered
        style={{
          minHeight: 44,
        }}
      >
        {sorted.map((n) => (
          <span
            key={n}
            className="flex items-center justify-center rounded-full bg-green-500 text-white font-black shadow-green-300 shadow-lg border-[2px] border-green-700 select-none lottery-num transition-all aspect-square"
            style={{
              width: "clamp(2rem, 9vw, 2.25rem)",  // fixed and small for circles
              minWidth: 28,
              height: "clamp(2rem, 9vw, 2.25rem)",
              minHeight: 28,
              fontSize: "clamp(0.90rem, 4vw, 1.1rem)", // noticeably smaller
              lineHeight: 1.1,
              padding: 0,
            }}
          >
            {n}
          </span>
        ))}
      </div>
      <div className="mt-4 text-sm text-muted-foreground text-center px-2">
        Numbers locked in until next round!
      </div>
    </div>
  );
}
