
import { useEffect, useRef } from "react";
import { useJackpot } from "../jackpot/JackpotContext";

/**
 * Handles increment/reset of jackpot based on confirmed ticket per cycle entry.
 * The jackpot increments (for the PREVIOUS cycle) ONLY after the timer hits 0:00 and advances,
 * i.e., when cycleIndex increments.
 */
export function useJackpotHandlers(
  cycleIndex: number,
  lastPickedPerCycle: { [cycle: number]: number[] }
) {
  const jackpotContext = useJackpot();
  // Track which cycles have already had their jackpot incremented
  const incrementedCycles = useRef<Set<number>>(new Set());
  // Track previous cycleIndex to detect *actual* transitions
  const prevCycleIndex = useRef<number | null>(null);

  useEffect(() => {
    // On new demo/game, clear tracking and reset prevCycleIndex
    if (cycleIndex === 0) {
      incrementedCycles.current.clear();
      prevCycleIndex.current = 0;
      console.log("[useJackpotHandlers] cycleIndex 0, resetting for new demo/game.");
      return;
    }

    // Only run logic when the cycleIndex transitions (not just from a re-render)
    if (
      prevCycleIndex.current !== null &&
      cycleIndex === prevCycleIndex.current + 1
    ) {
      // Just AFTER timer hits 0:00 and the new cycle starts
      const prevCycle = cycleIndex - 1;
      const userNumbers = lastPickedPerCycle[prevCycle] || [];
      const hadValidTicket = userNumbers.length === 6;

      // Only increment jackpot ONCE per prevCycle
      if (hadValidTicket && !incrementedCycles.current.has(prevCycle)) {
        console.log(`[useJackpotHandlers] Adding $1 to jackpot for previous cycle ${prevCycle}`);
        jackpotContext.addToJackpot(1);
        incrementedCycles.current.add(prevCycle);
      }
    }
    prevCycleIndex.current = cycleIndex;
    // eslint-disable-next-line
  }, [cycleIndex, jackpotContext]);
}
