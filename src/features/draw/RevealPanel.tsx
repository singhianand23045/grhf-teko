import React from "react";
import { useDrawEngine } from "./DrawEngineContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";
import LotteryTicket from "../number-select/LotteryTicket";
import { useTimer } from "../timer/timer-context";

export default function RevealPanel() {
  const { drawnNumbers } = useDrawEngine();
  const { picked: userNumbers } = useNumberSelection();
  const { state } = useTimer();

  // Always maintain 18 slots (3 rows × 6 columns)
  // PHASE LOGIC: only fill with numbers if state is "REVEAL", otherwise all slots undefined for black circles
  const slots: (number | undefined)[] =
    state === "REVEAL"
      ? Array.from({ length: 18 }, (_, idx) =>
          drawnNumbers[idx] !== undefined ? drawnNumbers[idx] : undefined
        )
      : Array(18).fill(undefined);

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
    <div className="flex flex-col items-center w-full h-full overflow-y-auto">
      {/* Drawn Numbers Grid */}
      <div className="w-full max-w-full min-h-[130px] flex flex-col justify-center items-center py-2">
        <div className="w-full space-y-3">
          {drawnSets.map((set, rowIdx) => (
            <div
              key={rowIdx}
              className="flex flex-nowrap justify-center items-center gap-4 w-full max-w-full min-h-[40px]"
            >
              {set.map((n, colIdx) => {
                if (n === undefined) {
                  return (
                    <span
                      key={colIdx}
                      className="flex items-center justify-center rounded-full bg-black border-2 border-black select-none aspect-square transition-all"
                      style={{
                        width: "clamp(2.2rem, 7vw, 3rem)",
                        minWidth: 40,
                        height: "clamp(2.2rem, 7vw, 3rem)",
                        minHeight: 40,
                        fontSize: "clamp(0.9rem, 4.5vw, 1.1rem)",
                        lineHeight: 1.1,
                      }}
                      aria-hidden
                    ></span>
                  );
                }
                if (userSet.has(n)) {
                  return (
                    <span
                      key={colIdx}
                      className="flex items-center justify-center rounded-full bg-green-500 text-white font-black shadow-green-300 shadow-lg border-[2px] border-green-700 select-none transition-all aspect-square animate-scale-in"
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
                  );
                }
                return (
                  <span
                    key={colIdx}
                    className="flex items-center justify-center rounded-full bg-white text-black font-black border-[2.5px] border-black shadow-md select-none aspect-square animate-scale-in transition-all"
                    style={{
                      width: "clamp(2.2rem, 7vw, 3rem)",
                      minWidth: 40,
                      height: "clamp(2.2rem, 7vw, 3rem)",
                      minHeight: 40,
                      fontSize: "clamp(0.9rem, 4.5vw, 1.1rem)",
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
      {/* Ticket: reduce margin for vertical fit */}
      <div className="w-full max-w-md mt-2 mb-0">
        <LotteryTicket compact />
      </div>
      <div className="pt-2 text-center text-muted-foreground text-base">
        Numbers revealed in order—good luck!
      </div>
    </div>
  );
}
