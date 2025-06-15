
import React from "react";
import { useNumberSelection } from "./NumberSelectionContext";

// Global circle/font constants
const CIRCLE_NUM_FONT_SIZE = "1rem";
const CIRCLE_NUM_DIAM = "2.2rem"; // 35px
const CIRCLE_DIAM_NUM = 35;
export default function LotteryTicket({ compact = false }: { compact?: boolean }) {
  const { picked } = useNumberSelection();
  const sorted = [...picked].sort((a, b) => a - b);

  return (
    <div
      className={`flex flex-col items-center justify-center w-full px-2 ${compact ? "" : "mt-2 mb-2"}`}
      style={{
        marginTop: compact ? 0 : undefined,
        marginBottom: compact ? 0 : undefined,
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <div className={`mb-2 font-bold text-lg tracking-wide text-[#217d37] ${compact ? "mt-0" : ""} text-center w-full`}>
        Your Numbers
      </div>
      <div
        className="flex flex-nowrap justify-center items-center gap-3 bg-gradient-to-r from-green-100/70 via-white to-green-100/70 rounded-2xl shadow-inner px-1 py-2 w-full"
        style={{
          minHeight: 38,
          paddingTop: compact ? 0 : undefined,
          paddingBottom: compact ? 0 : undefined,
        }}
      >
        {sorted.map((n) => (
          <span
            key={n}
            className="flex items-center justify-center rounded-full bg-green-500 text-white font-black shadow-green-300 shadow-lg border-[2px] border-green-700 select-none lottery-num transition-all aspect-square"
            style={{
              width: CIRCLE_NUM_DIAM,
              minWidth: CIRCLE_DIAM_NUM,
              height: CIRCLE_NUM_DIAM,
              minHeight: CIRCLE_DIAM_NUM,
              fontSize: CIRCLE_NUM_FONT_SIZE,
              lineHeight: 1.12,
              padding: 0,
              boxSizing: "border-box",
            }}
          >
            {n}
          </span>
        ))}
      </div>
      <div className={`mt-2 text-sm text-muted-foreground text-center px-2 ${compact ? "mt-1" : ""} w-full`}>
        Numbers locked in until next round!
      </div>
    </div>
  );
}
