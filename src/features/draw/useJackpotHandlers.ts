
import { useEffect } from "react";
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

  useEffect(() => {
    if (cycleIndex > 0) {
      const prevCycle = cycleIndex - 1;
      const userNumbers = lastPickedPerCycle[prevCycle] || [];
      const hadValidTicket = userNumbers.length === 6;
      console.log(
        `[useJackpotHandlers] cycle=${cycleIndex}, prevCycle=${prevCycle}, userNumbers: ${JSON.stringify(userNumbers)}, hadValidTicket: ${hadValidTicket}`
      );
      if (hadValidTicket) {
        console.log(`[useJackpotHandlers] Adding $1 to jackpot for previous cycle ${prevCycle}`);
        jackpotContext.addToJackpot(1);
      }
    }
    if (cycleIndex === 0) {
      console.log("[useJackpotHandlers] cycleIndex 0, resetting for new demo/game.");
    }
    // eslint-disable-next-line
  }, [cycleIndex, jackpotContext, lastPickedPerCycle]);
}
