
import React from "react";
import { useNumberSelection } from "./NumberSelectionContext";

export default function LotteryTicket() {
  const { picked } = useNumberSelection();

  // Sort numbers for ticket display
  const sorted = [...picked].sort((a, b) => a - b);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="mb-4 font-bold text-lg tracking-wide text-[#217d37]">Your Numbers</div>
      <div className="flex gap-4 justify-center items-center bg-gradient-to-r from-green-100/70 via-white to-green-100/70 rounded-2xl shadow-inner px-8 py-8">
        {sorted.map(n => (
          <span
            key={n}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-green-500 text-white text-2xl font-black shadow-green-300 shadow-lg border-[3px] border-green-700 select-none lottery-num"
          >
            {n}
          </span>
        ))}
      </div>
      <div className="mt-4 text-sm text-muted-foreground text-center">Numbers locked in until next round!</div>
    </div>
  );
}
