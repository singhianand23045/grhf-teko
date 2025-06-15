import React, { useEffect, useState } from "react";
import RouletteBallGrid from "@/playground/RouletteBallGrid";
import { useDrawEngine } from "./DrawEngineContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";
import { useTimer } from "../timer/timer-context";
import ResultBar from "./ResultBar";

/**
 * A bridge between playground RouletteBallGrid and the app DrawEngine.
 * Used for mainline roulette animation merge. Allows rollback to legacy grid easily.
 */
export default function RevealRoulettePanel() {
  const { drawnNumbers, revealResult } = useDrawEngine();
  const { picked: userNumbers } = useNumberSelection();
  const { state } = useTimer();

  // State for controlling the reveal, numbersToReveal, user picks.
  // Only REVEAL phase triggers the full number sequence reveal.
  const [reveal, setReveal] = useState(false);

  // Local numbers to reveal to pass to RouletteBallGrid
  // These match "drawnNumbers" (always 18 in REVEAL phase)
  useEffect(() => {
    if (state === "REVEAL") setReveal(true);
    else setReveal(false);
  }, [state]);

  // This disables the grid entirely unless state === REVEAL
  // We keep drawnNumbers always at length 18 for consistency
  const numbersToReveal =
    state === "REVEAL" && drawnNumbers.length === 18 ? drawnNumbers : [];

  return (
    <div className="flex flex-col items-center w-full h-full overflow-y-hidden">
      {/* Result bar is unchanged */}
      <ResultBar visible={revealResult.show} creditsWon={revealResult.credits} />
      {/* Animated Roulette Ball Grid */}
      <div className="w-full flex flex-col items-center justify-center py-0">
        <RouletteBallGrid
          numbersToReveal={numbersToReveal}
          reveal={reveal}
          userPicks={userNumbers}
        />
      </div>
    </div>
  );
}
