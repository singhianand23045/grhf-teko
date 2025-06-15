import React from "react";
import { useDrawEngine } from "./DrawEngineContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";
import { useTimer } from "../timer/timer-context";
import RevealRoulettePanel from "./RevealRoulettePanel";
import ResultBar from "./ResultBar";

// Use a single global font/circle size in this file
const BASE_FONT_SIZE = "1rem";
const BASE_DIAM = "2.2rem"; // same as used elsewhere (LotteryTicket)

const ENABLE_ROULETTE_ANIMATION = false;

export default function RevealPanel() {
  const { drawnNumbers, revealResult } = useDrawEngine();
  const { picked: userNumbers } = useNumberSelection();
  const { state } = useTimer();

  if (ENABLE_ROULETTE_ANIMATION) {
    return <RevealRoulettePanel />;
  }

  // --- Legacy fallback, unreachable with ENABLE_ROULETTE_ANIMATION true ---
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
    <div className="flex flex-col items-center w-full h-full overflow-y-hidden">
      <ResultBar
        visible={!!revealResult.show}
        creditsWon={revealResult.credits}
        jackpot={Boolean(revealResult.credits && revealResult.credits > 0 && revealResult.credits >= 1000)}
      />
      <div className="w-full max-w-full flex flex-col justify-center items-center py-0">
        <div className="w-full space-y-1">
          {drawnSets.map((set, rowIdx) => (
            <div
              key={rowIdx}
              className="flex flex-nowrap justify-center items-center gap-2 w-full max-w-full min-h-[30px]"
            >
              {set.map((n, colIdx) => {
                const baseCircleStyle = {
                  width: BASE_DIAM,
                  minWidth: 28,
                  height: BASE_DIAM,
                  minHeight: 28,
                  fontSize: BASE_FONT_SIZE,
                  lineHeight: 1.05,
                  padding: 0,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                };
                if (n === undefined) {
                  return (
                    <span
                      key={colIdx}
                      className="flex items-center justify-center rounded-full bg-black border-2 border-black select-none aspect-square transition-all"
                      style={baseCircleStyle}
                      aria-hidden
                    ></span>
                  );
                }
                if (userSet.has(n)) {
                  return (
                    <span
                      key={colIdx}
                      className="flex items-center justify-center rounded-full bg-green-500 text-white font-black shadow-green-300 shadow-lg border-[2px] border-green-700 select-none transition-all aspect-square animate-scale-in"
                      style={baseCircleStyle}
                    >
                      {n}
                    </span>
                  );
                }
                return (
                  <span
                    key={colIdx}
                    className="flex items-center justify-center rounded-full bg-white text-black font-black border-[2.5px] border-black shadow-md select-none aspect-square animate-scale-in transition-all"
                    style={baseCircleStyle}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
