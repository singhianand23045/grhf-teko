
import { useEffect, useRef } from "react";
import { calculateWinnings } from "./calculateWinnings";

/*
 * Handles awarding prizes and triggering result bar after reveal.
 * Does NOT show warnings—silently skips if userNumbers isn't exactly 6.
 * PHASE 5: User either wins jackpot OR regular credits (not both).
 */
type UseDrawPrizesArgs = {
  isRevealDone: boolean;
  cycleIndex: number;
  sets: number[][];
  SETS_PER_CYCLE: number;
  SET_SIZE: number;
  lastPickedPerCycle: { [cycle: number]: number[] };
  picked: number[];
  wallet: any;
  jackpotContext: any;
  showResultBar: (credits: number | null) => void;
  cleanupResultBarTimeout: () => void;
  pendingTicketRef: React.MutableRefObject<{
    cycle: number;
    ticket: { date: string; numbers: number[] };
    entered: boolean;
  } | null>;
};

export function useDrawPrizes({
  isRevealDone,
  cycleIndex,
  sets,
  SETS_PER_CYCLE,
  lastPickedPerCycle,
  picked,
  wallet,
  jackpotContext,
  showResultBar,
  cleanupResultBarTimeout,
  pendingTicketRef,
}: UseDrawPrizesArgs) {
  const resultAwardedForCycle = useRef<number | null>(null);

  useEffect(() => {
    if (
      isRevealDone &&
      cycleIndex !== null &&
      resultAwardedForCycle.current !== cycleIndex
    ) {
      resultAwardedForCycle.current = cycleIndex;

      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

      // Always strictly require 6 numbers - skip if not valid
      let userNumbers: number[] = [];
      if (
        lastPickedPerCycle[cycleIndex] &&
        lastPickedPerCycle[cycleIndex].length === 6
      ) {
        userNumbers = lastPickedPerCycle[cycleIndex];
      } else if (
        pendingTicketRef.current &&
        pendingTicketRef.current.cycle === cycleIndex &&
        pendingTicketRef.current.ticket.numbers.length === 6
      ) {
        userNumbers = pendingTicketRef.current.ticket.numbers;
      }

      if (userNumbers.length !== 6) {
        showResultBar(0);
        cleanupResultBarTimeout();
        return;
      }

      // Calculate winnings; never grant both types for same ticket
      const { jackpotWon, rowWinnings, totalWinnings, resultType } =
        calculateWinnings(userNumbers, activeSets, jackpotContext.jackpot);

      // PHASE 5 handle: only award EITHER jackpot OR credits
      // Only grant winnings if there is a *confirmed* ticket for this cycle,
      // i.e., userNumbers length === 6 and ticket was already entered at confirmation.
      // (In the fixed logic, validation is handled at ticket entry. Award winnings only once.)
      if (userNumbers.length === 6 /* && ticketWasEntered */) {
        if (jackpotWon) {
          // Award jackpot ONLY, then reset pool - NO regular credits
          wallet.awardTicketWinnings(activeSets, [0, 0, 0], jackpotContext.jackpot, cycleIndex);
          // Don't forget to reset jackpot
          jackpotContext.resetJackpot();
          showResultBar(jackpotContext.jackpot);
          console.log("[Prize] JACKPOT WIN, awarded", jackpotContext.jackpot);
        } else if (totalWinnings > 0) {
          wallet.awardTicketWinnings(activeSets, rowWinnings, totalWinnings, cycleIndex);
          showResultBar(totalWinnings);
          console.log("[Prize] CREDIT WIN, awarded", totalWinnings, rowWinnings);
        } else {
          wallet.awardTicketWinnings(activeSets, [0,0,0], 0, cycleIndex);
          showResultBar(0);
          console.log("[Prize] NO WIN, awarded nothing.");
        }
      } else {
        // Not a valid or entered ticket: always show "try again"
        showResultBar(0);
        console.log("[Prize] Not a valid or entered ticket for prize awarding.");
      }
      cleanupResultBarTimeout();
    }
    // eslint-disable-next-line
  }, [
    isRevealDone,
    cycleIndex,
    sets,
    wallet,
    jackpotContext,
    lastPickedPerCycle,
    pendingTicketRef,
    SETS_PER_CYCLE,
    showResultBar,
    cleanupResultBarTimeout
  ]);
}
