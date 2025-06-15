
import { useEffect, useRef } from "react";
import { calculateWinnings } from "./calculateWinnings";

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

/**
 * Handles prize calculation and awarding after reveal phase for one ticket per cycle.
 * Does not show warnings—silently skips if userNumbers isn't exactly 6.
 */
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

      // Always strictly require 6 numbers, otherwise do nothing
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

      // If not valid, skip everything (no warnings)
      if (userNumbers.length !== 6) {
        showResultBar(0);
        cleanupResultBarTimeout();
        return;
      }

      // Only now (once per cycle) deduct/add ticket, and process win logic
      let ticketWasEntered = false;
      if (
        pendingTicketRef.current &&
        pendingTicketRef.current.cycle === cycleIndex &&
        !pendingTicketRef.current.entered &&
        userNumbers.length === 6
      ) {
        wallet.addConfirmedTicket({
          date: pendingTicketRef.current.ticket.date,
          numbers: pendingTicketRef.current.ticket.numbers,
        });
        pendingTicketRef.current.entered = true;
        ticketWasEntered = true;
      }

      const { jackpotWon, rowWinnings, totalWinnings, resultType } =
        calculateWinnings(userNumbers, activeSets, jackpotContext.jackpot);

      if (userNumbers.length === 6 && ticketWasEntered) {
        if (jackpotWon) {
          wallet.awardTicketWinnings(activeSets, [0, 0, 0], totalWinnings);
          jackpotContext.resetJackpot();
        } else {
          wallet.awardTicketWinnings(activeSets, rowWinnings, totalWinnings);
        }
      }
      showResultBar(
        resultType === "jackpot"
          ? jackpotContext.jackpot
          : totalWinnings
      );
    }
    // No-op cleanup
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
