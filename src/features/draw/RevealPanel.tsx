
import React from "react";
import { useDrawEngine } from "./DrawEngineContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";
import LotteryTicket from "../number-select/LotteryTicket";

export default function RevealPanel() {
  const { drawnNumbers } = useDrawEngine();
  const { picked: userNumbers } = useNumberSelection();

  // 3 rows × 6 columns grid (18 slots)
  const slots: (number | undefined)[] = Array.from({ length: 18 }, (_, idx) => drawnNumbers[idx]);

  // Break into 3 sets of 6 numbers each for display
  const drawnSets: (number | undefined)[][] = [[], [], []];
  for (let row = 0; row < 3; row++) {
    drawnSets[row] = [];
    for (let col = 0; col < 6; col++) {
      drawnSets[row][col] = slots[row * 6 + col];
    }
  }

  // Used to highlight slots matching user ticket
  const userSet = new Set(userNumbers);

  return (
    <div className="flex flex-col items-center">
      {/* Drawn Numbers Grid */}
      <div className="w-full max-w-full min-h-[238px] flex flex-col justify-center items-center py-8">
        <div className="w-full space-y-6">
          {drawnSets.map((set, rowIdx) => (
            <div
              key={rowIdx}
              className="flex flex-nowrap justify-center items-center gap-4 w-full max-w-full min-h-[56px]"
            >
              {set.map((n, colIdx) => {
                // Before reveal: n === undefined for all slots
                if (n === undefined) {
                  // Phase 3 spec: always show fixed, filled black circles for unrevealed slots
                  return (
                    <span
                      key={colIdx}
                      className="flex items-center justify-center rounded-full bg-black border-2 border-black select-none aspect-square transition-all"
                      style={{
                        width: "clamp(2.2rem, 7vw, 3rem)",
                        minWidth: 40,
                        height: "clamp(2.2rem, 7vw, 3rem)",
                        minHeight: 40,
                        fontSize: "clamp(1.1rem, 6vw, 1.45rem)",
                        lineHeight: 1.1,
                      }}
                      aria-hidden
                    ></span>
                  );
                }
                // Revealed numbers:
                // If it's a user's number, use "ticket" style (green, same as user's), else white circle, black border, black text
                if (userSet.has(n)) {
                  // Match userTicket style
                  return (
                    <span
                      key={colIdx}
                      className="flex items-center justify-center rounded-full bg-green-500 text-white font-black shadow-green-300 shadow-lg border-[2px] border-green-700 select-none transition-all aspect-square animate-scale-in"
                      style={{
                        width: "clamp(2rem, 9vw, 2.25rem)",
                        minWidth: 28,
                        height: "clamp(2rem, 9vw, 2.25rem)",
                        minHeight: 28,
                        fontSize: "clamp(0.90rem, 4vw, 1.1rem)",
                        lineHeight: 1.1,
                        padding: 0,
                      }}
                    >
                      {n}
                    </span>
                  );
                }
                // Normal revealed number (not user's): white background, black border, black text, bold, black circle
                return (
                  <span
                    key={colIdx}
                    className="flex items-center justify-center rounded-full bg-white text-black font-black border-[2.5px] border-black shadow-md select-none aspect-square animate-scale-in transition-all"
                    style={{
                      width: "clamp(2.2rem, 7vw, 3rem)",
                      minWidth: 40,
                      height: "clamp(2.2rem, 7vw, 3rem)",
                      minHeight: 40,
                      fontSize: "clamp(1.1rem, 6vw, 1.45rem)",
                      lineHeight: 1.1,
                    }}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* User's Confirmed Numbers: always visible, well-separated */}
      <div className="w-full max-w-md mt-6">
        <LotteryTicket />
      </div>
      <div className="pt-6 text-center text-muted-foreground text-base">
        Numbers revealed in order—good luck!
      </div>
    </div>
  );
}

