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
  showResultBar: (credits: number | null, message?: string, duration?: number) => void; // Updated signature
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
  showResultBar,
  cleanupResultBarTimeout,
  pendingTicketRef,
  revealStartedForCycle, // New parameter
  confirmedTickets // New parameter
}: UseDrawPrizesArgs) {
  const resultAwardedForCycle = useRef<number | null>(null);
  const { addDrawResult } = useDrawHistory();
  const messageTimeouts = useRef<NodeJS.Timeout[]>([]); // New for message scheduling

  // Reset resultAwardedForCycle and clear message timeouts when cycle changes
  useEffect(() => {
    resultAwardedForCycle.current = null;
    messageTimeouts.current.forEach(clearTimeout);
    messageTimeouts.current = [];
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

      // Store individual ticket winnings for messages
      const individualTicketResults: { ticketIndex: number; winnings: number; jackpotWon: boolean }[] = [];

      // Iterate through all confirmed tickets for this cycle
      confirmedTickets.forEach((userNumbers, ticketIndex) => {
        // Ensure the ticket is valid (6 numbers)
        if (userNumbers.length !== 6) {
          console.warn(`[Prize] Ticket ${ticketIndex + 1} is invalid (not 6 numbers). Skipping.`);
          return;
        }

        // Check if this specific ticket has been processed for this cycle
        const hasUnprocessedTicket = wallet.history.some(
          (ticket: any) => !ticket.processed && ticket.cycle === cycleIndex && ticket.numbers.join(',') === userNumbers.join(',')
        );

        if (!hasUnprocessedTicket) {
          console.log(`[Prize] Ticket ${ticketIndex + 1} already processed or not found in wallet history for cycle ${cycleIndex}. Skipping.`);
          return;
        }

        const { jackpotWon, totalWinnings } =
          calculateWinnings(userNumbers, activeSets, jackpotContext.jackpot);

        individualTicketResults.push({ ticketIndex: ticketIndex + 1, winnings: totalWinnings, jackpotWon });

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

      // --- Schedule messages based on new timing requirements ---
      // Timer: 0:45 (reveal start)
      // Ticket 1 Message: 0:35 - 0:33 (2 seconds) -> 10s from 0:45 start
      // Ticket 2 Message: 0:25 - 0:23 (2 seconds) -> 20s from 0:45 start
      // Ticket 3 Message: 0:15 - 0:13 (2 seconds) -> 30s from 0:45 start
      // Final Result Message: 0:12 - 0:02 (10 seconds) -> 33s from 0:45 start

      const scheduleMessage = (delayMs: number, durationMs: number, message: string) => {
        messageTimeouts.current.push(
          setTimeout(() => {
            showResultBar(null, message, durationMs); // Pass durationMs here
          }, delayMs)
        );
      };

      // Calculate individual ticket winnings for messages
      const getTicketWinnings = (ticketIdx: number) => {
        const result = individualTicketResults.find(r => r.ticketIndex === ticketIdx);
        return result ? result.winnings : 0;
      };

      // Message for Ticket 1 (0:35 - 0:33)
      if (confirmedTickets.length > 0) {
        const t1Winnings = getTicketWinnings(1);
        const t1Message = t1Winnings > 0 ? `Congrats! You won ${t1Winnings} credits!` : "No matches. Wait for next set!";
        scheduleMessage(10 * 1000, 2 * 1000, t1Message);
      }

      // Message for Ticket 2 (0:25 - 0:23)
      if (confirmedTickets.length > 1) {
        const t2Winnings = getTicketWinnings(2);
        const t2Message = t2Winnings > 0 ? `Congrats! You won ${t2Winnings} credits!` : "No matches. Wait for next set!";
        scheduleMessage(20 * 1000, 2 * 1000, t2Message);
      }

      // Message for Ticket 3 (0:15 - 0:13)
      if (confirmedTickets.length > 2) {
        const t3Winnings = getTicketWinnings(3);
        const t3Message = t3Winnings > 0 ? `Congrats! You won ${t3Winnings} credits!` : "No matches. Wait for final result!";
        scheduleMessage(30 * 1000, 2 * 1000, t3Message);
      }

      // Final Result Message (0:12 - 0:02)
      messageTimeouts.current.push(
        setTimeout(() => {
          if (anyJackpotWon) {
            showResultBar(totalWinningsAcrossAllTickets, `Congrats! You won the jackpot of $${totalWinningsAcrossAllTickets}!`, 10 * 1000);
            jackpotContext.resetJackpot(); // Reset jackpot only on final message if won
          } else if (totalWinningsAcrossAllTickets > 0) {
            showResultBar(totalWinningsAcrossAllTickets, `Congrats! You won total of ${totalWinningsAcrossAllTickets} credits!`, 10 * 1000);
          } else {
            showResultBar(0, "Try again. Win next time!", 10 * 1000);
          }
          // Award winnings to wallet after final message is shown
          wallet.awardTicketWinnings(activeSets, totalWinningsAcrossAllTickets, cycleIndex, anyJackpotWon);
        }, 33 * 1000) // 33 seconds from reveal start (0:45 - 0:12)
      );
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
    revealStartedForCycle,
    confirmedTickets // Add confirmedTickets to dependencies
  ]);
}