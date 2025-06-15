
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
  // DEBUG: Give a visible runtime warning
  let ctx;
  try {
    ctx = useDrawEngine();
  } catch (e) {
    // Console error and throw
    console.error("[RevealPanel] useDrawEngine context error! Is RevealPanel rendered outside DrawEngineProvider?");
    throw e;
  }

  const { drawnNumbers, revealResult } = ctx;
  const { picked: userNumbers } = useNumberSelection();
  const { state } = useTimer();

  if (ENABLE_ROULETTE_ANIMATION) {
    return <RevealRoulettePanel />;
  }

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

  // Define the ResultBar's height (adjust as needed for nice appearance)
  const RESULT_BAR_HEIGHT = 44; // px, fits 1-line ResultBar text + spacing

  // Spacing between message and ball grid: only 0.5% of screen height
  const DRAWN_GRID_MARGIN_TOP = "0.5vh";

  return (
    <div className="flex flex-col items-center w-full h-full overflow-y-hidden">
      {/* Reserve vertical space for ResultBar always, to anchor the ball grid */}
      <div
        className="w-full flex justify-center items-center"
        style={{
          height: RESULT_BAR_HEIGHT,
          minHeight: RESULT_BAR_HEIGHT,
          maxHeight: RESULT_BAR_HEIGHT
        }}
      >
        <ResultBar
          visible={!!revealResult.show}
          creditsWon={revealResult.credits}
          jackpot={Boolean(revealResult.credits && revealResult.credits > 0 && revealResult.credits >= 1000)}
        />
      </div>
      {/* Grid wrapper -- ensure full height & center grid, now grid never jumps */}
      <div
        className="flex-1 w-full flex items-center justify-center py-0"
        style={{
          marginTop: DRAWN_GRID_MARGIN_TOP
        }}
      >
        <div className="w-full space-y-1 flex flex-col items-center justify-center">
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                };
                if (n === undefined) {
                  return (
                    <span
                      key={colIdx}
                      className="flex items-center justify-center rounded-full bg-robinhood-black border-2 border-robinhood-black select-none aspect-square transition-all"
                      style={baseCircleStyle}
                      aria-hidden
                    ></span>
                  );
                }
                if (userSet.has(n)) {
                  return (
                    <span
                      key={colIdx}
                      className="flex items-center justify-center rounded-full bg-robinhood-green text-white font-black shadow-robinhood-green/30 shadow-lg border-2 border-robinhood-green select-none transition-all aspect-square animate-scale-in"
                      style={baseCircleStyle}
                    >
                      {n}
                    </span>
                  );
                }
                return (
                  <span
                    key={colIdx}
                    className="flex items-center justify-center rounded-full bg-white text-robinhood-black font-black border-2.5 border-robinhood-black shadow-md select-none aspect-square animate-scale-in transition-all"
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
