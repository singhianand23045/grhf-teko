
import { useEffect, useRef } from "react";
import { useJackpot } from "../jackpot/JackpotContext";

/**
 * Handles increment/reset of jackpot based on confirmed ticket per cycle entry.
 * Relies on accurate lastPickedPerCycle data, which is robust to race conditions.
 */
export function useJackpotHandlers(
  cycleIndex: number,
  lastPickedPerCycle: { [cycle: number]: number[] }
) {
  const jackpotContext = useJackpot();
  // Track which cycles have already had their jackpot incremented
  const incrementedCycles = useRef<Set<number>>(new Set());

  useEffect(() => {
    // On new demo/game, clear tracking
    if (cycleIndex === 0) {
      incrementedCycles.current.clear();
      console.log("[useJackpotHandlers] cycleIndex 0, resetting for new demo/game.");
      return;
    }

    const prevCycle = cycleIndex - 1;
    const userNumbers = lastPickedPerCycle[prevCycle] || [];
    const hadValidTicket = userNumbers.length === 6;

    // Only increment jackpot ONCE per prevCycle
    if (hadValidTicket && !incrementedCycles.current.has(prevCycle)) {
      console.log(`[useJackpotHandlers] Adding $1 to jackpot for previous cycle ${prevCycle}`);
      jackpotContext.addToJackpot(1);
      incrementedCycles.current.add(prevCycle);
    }
    // eslint-disable-next-line
  }, [cycleIndex, jackpotContext]);
}
