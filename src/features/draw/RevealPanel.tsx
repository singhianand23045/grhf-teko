
import React from "react";
import { useDrawEngine } from "./DrawEngineContext";
import LotteryTicket from "../number-select/LotteryTicket";

export default function RevealPanel() {
  const { drawnNumbers } = useDrawEngine();

  // Prepare drawn sets: always 3 sets, 6 numbers each for display
  let drawnSets: (number | undefined)[][] = [[], [], []];
  for (let row = 0; row < 3; row++) {
    drawnSets[row] = [];
    for (let col = 0; col < 6; col++) {
      // Get the (row*6 + col)-th number, or undefined if not yet drawn
      drawnSets[row].push(drawnNumbers[row * 6 + col]);
    }
  }

  return (
    <div className="flex flex-col items-center py-3 w-full animate-fade-in">
      <div className="font-bold text-lg text-[#217d37] pb-1">Lucky Numbers</div>
      <div className="space-y-2 w-full max-w-full">
        {drawnSets.map((set, i) => (
          <div
            key={i}
            className="flex flex-nowrap justify-center items-center gap-2 bg-gradient-to-r from-green-100/80 via-white to-green-100/80 rounded-xl shadow-inner px-1 py-2 w-full max-w-full min-h-[44px]"
          >
            {set.map((n, j) =>
              n !== undefined ? (
                <span
                  key={j}
                  className="flex items-center justify-center rounded-full bg-green-600 text-white font-black shadow-green-300 shadow-lg border-[2px] border-green-900 select-none transition-all aspect-square animate-scale-in"
                  style={{
                    width: "clamp(2.1rem, 6vw, 2.6rem)",
                    minWidth: 32,
                    height: "clamp(2.1rem, 6vw, 2.6rem)",
                    minHeight: 32,
                    fontSize: "clamp(1rem, 5vw, 1.25rem)",
                    lineHeight: 1.1,
                  }}
                >
                  {n}
                </span>
              ) : (
                <span
                  key={j}
                  className="flex items-center justify-center rounded-full bg-gray-200 text-gray-300 font-black border-[2px] border-gray-300 select-none aspect-square opacity-80"
                  style={{
                    width: "clamp(2.1rem, 6vw, 2.6rem)",
                    minWidth: 32,
                    height: "clamp(2.1rem, 6vw, 2.6rem)",
                    minHeight: 32,
                    fontSize: "clamp(1rem, 5vw, 1.25rem)",
                    lineHeight: 1.1,
                  }}
                  aria-hidden
                >
                  --
                </span>
              )
            )}
          </div>
        ))}
      </div>
      <div className="pt-4 w-full">
        <LotteryTicket />
      </div>
      <div className="pt-3 text-center text-muted-foreground text-sm">
        Numbers revealed in order—good luck!
      </div>
    </div>
  );
}
