import { useEffect } from "react";
import { useJackpot } from "../jackpot/JackpotContext";
import { WalletType } from "../wallet/WalletContext";

// Encapsulates jackpot increment/reset logic for cycle changes
export function useJackpotHandlers(
  cycleIndex: number,
  cycleTicketCountRef: React.MutableRefObject<{ [cycle: number]: number }>,
  resetTicketCountForCycle: (cycle: number) => void
) {
  const jackpotContext = useJackpot();

  useEffect(() => {
    // On cycle change, possibly increase jackpot and clean up ticket states
    if (cycleIndex > 0) {
      const prevCycle = cycleIndex - 1;
      const tickets = cycleTicketCountRef.current[prevCycle] ? 1 : 0;
      console.log(`[useJackpotHandlers] On cycle change to ${cycleIndex}, checking previous cycle ${prevCycle}: ticket count = ${cycleTicketCountRef.current[prevCycle]}`);
      if (tickets > 0) {
        console.log(`[useJackpotHandlers] Adding $1 to jackpot for previous cycle ${prevCycle}`);
        jackpotContext.addToJackpot(1); // Add $1 for this user/cycle
        resetTicketCountForCycle(prevCycle);
      }
    }
    if (cycleIndex === 0) {
      cycleTicketCountRef.current = {};
      console.log("[useJackpotHandlers] cycleIndex 0, ticket count ref reset to empty.");
    }
    // eslint-disable-next-line
  }, [cycleIndex, jackpotContext]);
}

// Add more jackpot utilities if needed.
