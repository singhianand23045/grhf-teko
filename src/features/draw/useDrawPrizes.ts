
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
  revealStartedForCycle: React.MutableRefObject<number | null>; // New parameter
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
  revealStartedForCycle, // New parameter
}: UseDrawPrizesArgs) {
  const resultAwardedForCycle = useRef<number | null>(null);

  // Reset resultAwardedForCycle when cycle changes
  useEffect(() => {
    resultAwardedForCycle.current = null;
  }, [cycleIndex]);

  useEffect(() => {
    if (
      isRevealDone &&
      revealStartedForCycle.current === cycleIndex && // Ensure reveal really started for this cycle
      cycleIndex !== null &&
      resultAwardedForCycle.current !== cycleIndex
    ) {
      resultAwardedForCycle.current = cycleIndex;

      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

      // Always strictly require 6 numbers and verify an actual ticket exists
      let userNumbers: number[] = [];
      let hasValidTicket = false;
      
      // Check if there's a valid ticket for this cycle in wallet history
      const hasUnprocessedTicket = wallet.history.some(
        (ticket: any) => !ticket.processed && ticket.cycle === cycleIndex && ticket.creditChange === -30
      );

      if (
        lastPickedPerCycle[cycleIndex] &&
        lastPickedPerCycle[cycleIndex].length === 6 &&
        hasUnprocessedTicket
      ) {
        userNumbers = lastPickedPerCycle[cycleIndex];
        hasValidTicket = true;
      } else if (
        pendingTicketRef.current &&
        pendingTicketRef.current.cycle === cycleIndex &&
        pendingTicketRef.current.ticket.numbers.length === 6 &&
        hasUnprocessedTicket
      ) {
        userNumbers = pendingTicketRef.current.ticket.numbers;
        hasValidTicket = true;
      }

      // Only proceed if we have both valid numbers AND a confirmed ticket
      if (userNumbers.length !== 6 || !hasValidTicket) {
        showResultBar(0);
        return;
      }

      // Calculate winnings; never grant both types for same ticket
      const { jackpotWon, rowWinnings, totalWinnings, resultType } =
        calculateWinnings(userNumbers, activeSets, jackpotContext.jackpot);

      // PHASE 5 handle: only award EITHER jackpot OR credits
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
    cleanupResultBarTimeout,
    revealStartedForCycle
  ]);
}
