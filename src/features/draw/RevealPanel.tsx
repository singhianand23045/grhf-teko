
import React from "react";
import { useDrawEngine } from "./DrawEngineContext";
import LotteryTicket from "../number-select/LotteryTicket";

export default function RevealPanel() {
  const { drawnNumbers } = useDrawEngine();

  // Always create a grid of 3 rows × 6 columns (18 slots)
  // Fill with drawn numbers where available, otherwise undefined
  let slots: (number | undefined)[] = Array.from({ length: 18 }, (_, idx) => drawnNumbers[idx]);

  // Break into 3 sets of 6 numbers each
  const drawnSets: (number | undefined)[][] = [[], [], []];
  for (let row = 0; row < 3; row++) {
    drawnSets[row] = [];
    for (let col = 0; col < 6; col++) {
      drawnSets[row][col] = slots[row * 6 + col];
    }
  }

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
              {set.map((n, colIdx) =>
                n !== undefined ? (
                  <span
                    key={colIdx}
                    className="flex items-center justify-center rounded-full bg-green-600 text-white font-black shadow-green-300 shadow-lg border-[2.5px] border-green-900 select-none transition-all aspect-square animate-scale-in"
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
                ) : (
                  <span
                    key={colIdx}
                    className="flex items-center justify-center rounded-full bg-black text-gray-900 font-black border-[2px] border-black shadow-md shadow-black/25 select-none aspect-square opacity-80"
                    style={{
                      width: "clamp(2.2rem, 7vw, 3rem)",
                      minWidth: 40,
                      height: "clamp(2.2rem, 7vw, 3rem)",
                      minHeight: 40,
                      fontSize: "clamp(1.1rem, 6vw, 1.45rem)",
                      lineHeight: 1.1,
                    }}
                    aria-hidden
                  >
                    {/* Empty spot: "--" or blank */}
                    --
                  </span>
                )
              )}
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
