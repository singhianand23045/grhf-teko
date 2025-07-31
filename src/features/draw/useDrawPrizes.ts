import { useEffect, useRef } from "react";
import { calculateWinnings } from "./calculateWinnings";
import { useDrawHistory } from "./DrawHistoryContext";

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
  cleanupResultBarTimeout: () => void;
  pendingTicketRef: React.MutableRefObject<{
    cycle: number;
    ticket: { date: string; numbers: number[] };
    entered: boolean;
  } | null>;
  revealStartedForCycle: React.MutableRefObject<number | null>; // New parameter
  confirmedTickets: number[][]; // New parameter
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
  cleanupResultBarTimeout,
  pendingTicketRef,
  revealStartedForCycle, // New parameter
  confirmedTickets // New parameter
}: UseDrawPrizesArgs) {
  const resultAwardedForCycle = useRef<number | null>(null);
  const { addDrawResult } = useDrawHistory();

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

      let totalWinningsAcrossAllTickets = 0;
      let anyJackpotWon = false;

      // Iterate through all confirmed tickets for this cycle to calculate overall winnings for history
      confirmedTickets.forEach((userNumbers, ticketIndex) => {
        // Ensure the ticket is valid (6 numbers)
        if (userNumbers.length !== 6) {
          console.warn(`[Prize] Ticket ${ticketIndex + 1} is invalid (not 6 numbers). Skipping.`);
          return;
        }

        const { jackpotWon, totalWinnings } =
          calculateWinnings(userNumbers, activeSets, jackpotContext.jackpot);

        if (jackpotWon) {
          anyJackpotWon = true;
          totalWinningsAcrossAllTickets += jackpotContext.jackpot; // Add jackpot amount
        } else {
          totalWinningsAcrossAllTickets += totalWinnings; // Add regular winnings
        }
      });

      // Record draw result in history (consolidated for the cycle)
      const winningNumbers = activeSets.flat();
      addDrawResult({
        cycle: cycleIndex,
        winningNumbers,
        jackpotWon: anyJackpotWon,
        totalWinnings: totalWinningsAcrossAllTickets
      });

      // Wallet crediting is now handled by useRevealAnimation for each ticket message.
      // No need to call wallet.awardTicketWinnings here.
    }
    // eslint-disable-next-line
  }, [
    isRevealDone,
    cycleIndex,
    sets,
    wallet, // Still needed for history lookup in useRevealAnimation
    jackpotContext,
    lastPickedPerCycle,
    pendingTicketRef,
    SETS_PER_CYCLE,
    cleanupResultBarTimeout,
    revealStartedForCycle,
    confirmedTickets // Add confirmedTickets to dependencies
  ]);
}