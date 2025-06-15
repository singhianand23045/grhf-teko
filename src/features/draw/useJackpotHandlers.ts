
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
  const incrementedCycles = useRef<Set<number>>(new Set());
  const prevCycleIndex = useRef<number | null>(null);

  useEffect(() => {
    console.log("[useJackpotHandlers] --- DEBUG CYCLE ---");
    console.log(`[useJackpotHandlers] cycleIndex now: ${cycleIndex}, prevCycleIndex: ${prevCycleIndex.current}`);
    console.log("[useJackpotHandlers] lastPickedPerCycle snapshot:", JSON.stringify(lastPickedPerCycle));

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
      const prevCycle = cycleIndex - 1;
      const userNumbers = lastPickedPerCycle[prevCycle] || [];
      const hadValidTicket = userNumbers.length === 6;

      console.log(`[useJackpotHandlers] cycle advanced: previous cycle was ${prevCycle}.`);
      console.log(`[useJackpotHandlers] Previous cycle picked numbers: [${userNumbers.join(", ")}]`);
      console.log(`[useJackpotHandlers] hadValidTicket=${hadValidTicket}, incremented already? ${incrementedCycles.current.has(prevCycle)}`);

      // Only increment jackpot ONCE per prevCycle
      if (hadValidTicket && !incrementedCycles.current.has(prevCycle)) {
        console.log(`[useJackpotHandlers] Adding $1 to jackpot for previous cycle ${prevCycle}`);
        jackpotContext.addToJackpot(1);
        incrementedCycles.current.add(prevCycle);
      } else if (!hadValidTicket) {
        console.log(`[useJackpotHandlers] No valid ticket for prevCycle ${prevCycle}. Jackpot not incremented.`);
      } else if (incrementedCycles.current.has(prevCycle)) {
        console.log(`[useJackpotHandlers] Jackpot already incremented for prevCycle ${prevCycle}. No action taken.`);
      }
    } else {
      // Either initial mount or not a cycle transition
      console.log("[useJackpotHandlers] Not a cycle transition or first render; no jackpot check.");
    }

    prevCycleIndex.current = cycleIndex;
    // eslint-disable-next-line
  }, [cycleIndex, jackpotContext, lastPickedPerCycle]);
}

