import { useRef, useState, useEffect } from "react";
import { REVEAL_PER_NUMBER_SEC, SETS_PER_CYCLE, SET_SIZE } from "./drawConstants";
import { calculateWinnings } from "./calculateWinnings"; // Import calculateWinnings
import { getCreditsForMatches } from "./getCreditsForMatches"; // Import getCreditsForMatches

// Define the structure for a revealed number with its highlight status
type RevealedNumber = {
  number: number;
  highlightMatches: {
    ticket1?: boolean;
    ticket2?: boolean;
    ticket3?: boolean;
  };
};

/**
 * Animates reveal of numbers, now in per-row order:
 * - For each row, reveal all numbers that are matches first, then non-matches, then next row.
 * @param sets - All 6x6 drawn numbers
 * @param SETS_PER_CYCLE - How many sets (rows) per draw
 * @param SET_SIZE - Size of each set (row)
 * @param confirmedTickets - All confirmed tickets by the user (array of number arrays)
 * @param cycleIndex - Current cycle index to reset state on cycle changes
 * @param showResultBar - Function to show the result bar message
 * @param hideResultBar - Function to hide the result bar message
 * @param wallet - Wallet context for accessing history and balance
 * @param jackpotContext - Jackpot context for jackpot amount
 */
export function useRevealAnimation(
  sets: number[][],
  SETS_PER_CYCLE: number,
  SET_SIZE: number,
  confirmedTickets: number[][],
  cycleIndex: number,
  showResultBar: (credits: number | null, message?: string, duration?: number) => void,
  hideResultBar: () => void,
  wallet: any, // Passed from DrawEngineContext
  jackpotContext: any // Passed from DrawEngineContext
) {
  const [drawnNumbers, setDrawnNumbers] = useState<RevealedNumber[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);
  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const highlightTimeouts = useRef<NodeJS.Timeout[]>([]);
  const messageTimeouts = useRef<NodeJS.Timeout[]>([]); // New for message scheduling
  const revealStartedForCycle = useRef<number | null>(null);

  const REVEAL_TOTAL_NUMBERS = SETS_PER_CYCLE * SET_SIZE;

  // PHASE 9: Highlight overlay timings (relative to REVEAL start at 0:45)
  // Ticket 1 Message: 0:35 - 0:33 (2 seconds) -> 10s from 0:45 start
  // Ticket 2 Highlight: 0:32 - 0:26 (6 seconds) -> 13s from 0:45 start, ends 19s from 0:45 start
  // Ticket 2 Message: 0:25 - 0:23 (2 seconds) -> 20s from 0:45 start
  // Ticket 3 Highlight: 0:22 - 0:16 (6 seconds) -> 23s from 0:45 start, ends 29s from 0:45 start
  // Ticket 3 Message: 0:15 - 0:13 (2 seconds) -> 30s from 0:45 start
  // Final Result Message: 0:12 - 0:02 (10 seconds) -> 33s from 0:45 start

  const TICKET1_MESSAGE_START_MS = 10 * 1000;
  const TICKET1_MESSAGE_DURATION_MS = 2 * 1000;

  const TICKET2_HIGHLIGHT_START_MS = 13 * 1000;
  const TICKET2_HIGHLIGHT_END_MS = 19 * 1000;
  const TICKET2_MESSAGE_START_MS = 20 * 1000;
  const TICKET2_MESSAGE_DURATION_MS = 2 * 1000;

  const TICKET3_HIGHLIGHT_START_MS = 23 * 1000;
  const TICKET3_HIGHLIGHT_END_MS = 29 * 1000;
  const TICKET3_MESSAGE_START_MS = 30 * 1000;
  const TICKET3_MESSAGE_DURATION_MS = 2 * 1000;

  const FINAL_MESSAGE_START_MS = 33 * 1000;
  const FINAL_MESSAGE_DURATION_MS = 10 * 1000;

  // Reset reveal state when cycle changes to prevent premature prize awarding
  useEffect(() => {
    setIsRevealDone(false);
    setDrawnNumbers([]);
    revealStartedForCycle.current = null;
    cleanupRevealTimeouts(); // Clear all pending timeouts
  }, [cycleIndex]);

  // Helper: return the correct reveal sequence per requirements
  function buildRevealSequence(setsForDraw: number[][], ticket1Numbers: number[]): number[] {
    if (!ticket1Numbers || ticket1Numbers.length !== 6) {
      // fallback: flat in order
      return setsForDraw.flat();
    }
    const revealSeq: number[] = [];
    for (const row of setsForDraw) {
      // Matches first
      const matches = row.filter((n) => ticket1Numbers.includes(n));
      const rest = row.filter((n) => !ticket1Numbers.includes(n));
      revealSeq.push(...matches, ...rest);
    }
    return revealSeq;
  }

  function startReveal(cycle: number) {
    cleanupRevealTimeouts(); // Clear all previous timeouts

    const startSet = cycle * SETS_PER_CYCLE;
    const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

    // Get the first ticket's numbers for the initial reveal sequence
    const ticket1Numbers = confirmedTickets[0] || [];
    const sequence = buildRevealSequence(activeSets, ticket1Numbers);

    setDrawnNumbers([]);
    setIsRevealDone(false);
    revealStartedForCycle.current = cycle;

    // Schedule number reveals
    for (let i = 0; i < sequence.length; i++) {
      revealTimeouts.current.push(
        setTimeout(() => {
          setDrawnNumbers((prev) => {
            const newDrawn = [...prev, { number: sequence[i], highlightMatches: { ticket1: ticket1Numbers.includes(sequence[i]) } }];
            return newDrawn;
          });
          if (i === sequence.length - 1) {
            setIsRevealDone(true);
          }
        }, REVEAL_PER_NUMBER_SEC * 1000 * i)
      );
    }

    // --- Schedule messages and highlight overlays ---
    const currentDrawnNumbers = activeSets.flat(); // All 18 numbers for prize calculation

    // Helper to calculate winnings for a specific ticket
    const getTicketWinnings = (ticketNumbers: number[]) => {
      if (!ticketNumbers || ticketNumbers.length !== 6) return 0;
      const { totalWinnings } = calculateWinnings(ticketNumbers, activeSets, jackpotContext.jackpot);
      return totalWinnings;
    };

    // Ticket 1 Message
    if (confirmedTickets.length > 0) {
      messageTimeouts.current.push(
        setTimeout(() => {
          const t1Winnings = getTicketWinnings(confirmedTickets[0]);
          const t1Message = t1Winnings > 0 ? `Congrats! You won ${t1Winnings} credits!` : "No matches. Wait for next set!";
          showResultBar(null, t1Message, TICKET1_MESSAGE_DURATION_MS);
        }, TICKET1_MESSAGE_START_MS)
      );
    }

    // Ticket 2 Highlight & Message
    if (confirmedTickets.length > 1) {
      highlightTimeouts.current.push(
        setTimeout(() => {
          setDrawnNumbers(prev => prev.map(dn => ({
            ...dn,
            highlightMatches: {
              ...dn.highlightMatches,
              ticket2: confirmedTickets[1].includes(dn.number)
            }
          })));
        }, TICKET2_HIGHLIGHT_START_MS)
      );
      highlightTimeouts.current.push(
        setTimeout(() => {
          setDrawnNumbers(prev => prev.map(dn => ({
            ...dn,
            highlightMatches: {
              ...dn.highlightMatches,
              ticket2: false // Remove highlight
            }
          })));
        }, TICKET2_HIGHLIGHT_END_MS)
      );
      messageTimeouts.current.push(
        setTimeout(() => {
          const t2Winnings = getTicketWinnings(confirmedTickets[1]);
          const t2Message = t2Winnings > 0 ? `Congrats! You won ${t2Winnings} credits!` : "No matches. Wait for next set!";
          showResultBar(null, t2Message, TICKET2_MESSAGE_DURATION_MS);
        }, TICKET2_MESSAGE_START_MS)
      );
    }

    // Ticket 3 Highlight & Message
    if (confirmedTickets.length > 2) {
      highlightTimeouts.current.push(
        setTimeout(() => {
          setDrawnNumbers(prev => prev.map(dn => ({
            ...dn,
            highlightMatches: {
              ...dn.highlightMatches,
              ticket3: confirmedTickets[2].includes(dn.number)
            }
          })));
        }, TICKET3_HIGHLIGHT_START_MS)
      );
      highlightTimeouts.current.push(
        setTimeout(() => {
          setDrawnNumbers(prev => prev.map(dn => ({
            ...dn,
            highlightMatches: {
              ...dn.highlightMatches,
              ticket3: false // Remove highlight
            }
          })));
        }, TICKET3_HIGHLIGHT_END_MS)
      );
      messageTimeouts.current.push(
        setTimeout(() => {
          const t3Winnings = getTicketWinnings(confirmedTickets[2]);
          const t3Message = t3Winnings > 0 ? `Congrats! You won ${t3Winnings} credits!` : "No matches. Wait for final result!";
          showResultBar(null, t3Message, TICKET3_MESSAGE_DURATION_MS);
        }, TICKET3_MESSAGE_START_MS)
      );
    }

    // Final Result Message (consolidated)
    messageTimeouts.current.push(
      setTimeout(() => {
        let totalWinningsAcrossAllTickets = 0;
        let anyJackpotWon = false;

        confirmedTickets.forEach(userNumbers => {
          if (userNumbers.length === 6) {
            const { jackpotWon, totalWinnings } = calculateWinnings(userNumbers, activeSets, jackpotContext.jackpot);
            if (jackpotWon) {
              anyJackpotWon = true;
              totalWinningsAcrossAllTickets += jackpotContext.jackpot;
            } else {
              totalWinningsAcrossAllTickets += totalWinnings;
            }
          }
        });

        if (anyJackpotWon) {
          showResultBar(totalWinningsAcrossAllTickets, `Congrats! You won the jackpot of $${totalWinningsAcrossAllTickets}!`, FINAL_MESSAGE_DURATION_MS);
          jackpotContext.resetJackpot();
        } else if (totalWinningsAcrossAllTickets > 0) {
          showResultBar(totalWinningsAcrossAllTickets, `Congrats! You won total of ${totalWinningsAcrossAllTickets} credits!`, FINAL_MESSAGE_DURATION_MS);
        } else {
          showResultBar(0, "Try again. Win next time!", FINAL_MESSAGE_DURATION_MS);
        }
      }, FINAL_MESSAGE_START_MS)
    );
  }

  function instantlyFinishReveal(cycle: number) {
    cleanupRevealTimeouts(); // Clear all timeouts

    const startSet = cycle * SETS_PER_CYCLE;
    const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
    const ticket1Numbers = confirmedTickets[0] || [];
    const sequence = buildRevealSequence(activeSets, ticket1Numbers);

    const finalDrawnNumbers: RevealedNumber[] = sequence.map(num => {
      const highlightMatches: HighlightMatches = {
        ticket1: confirmedTickets[0]?.includes(num),
        ticket2: confirmedTickets[1]?.includes(num),
        ticket3: confirmedTickets[2]?.includes(num),
      };
      return { number: num, highlightMatches };
    });

    setDrawnNumbers(finalDrawnNumbers);
    setIsRevealDone(true);
    revealStartedForCycle.current = cycle;

    // Trigger final message immediately if instantly finishing
    let totalWinningsAcrossAllTickets = 0;
    let anyJackpotWon = false;

    confirmedTickets.forEach(userNumbers => {
      if (userNumbers.length === 6) {
        const { jackpotWon, totalWinnings } = calculateWinnings(userNumbers, activeSets, jackpotContext.jackpot);
        if (jackpotWon) {
          anyJackpotWon = true;
          totalWinningsAcrossAllTickets += jackpotContext.jackpot;
        } else {
          totalWinningsAcrossAllTickets += totalWinnings;
        }
      }
    });

    if (anyJackpotWon) {
      showResultBar(totalWinningsAcrossAllTickets, `Congrats! You won the jackpot of $${totalWinningsAcrossAllTickets}!`, FINAL_MESSAGE_DURATION_MS);
      jackpotContext.resetJackpot();
    } else if (totalWinningsAcrossAllTickets > 0) {
      showResultBar(totalWinningsAcrossAllTickets, `Congrats! You won total of ${totalWinningsAcrossAllTickets} credits!`, FINAL_MESSAGE_DURATION_MS);
    } else {
      showResultBar(0, "Try again. Win next time!", FINAL_MESSAGE_DURATION_MS);
    }
  }

  // cleanup
  function cleanupRevealTimeouts() {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    highlightTimeouts.current.forEach(clearTimeout);
    highlightTimeouts.current = [];
    messageTimeouts.current.forEach(clearTimeout); // Clear message timeouts
    messageTimeouts.current = [];
    hideResultBar(); // Ensure result bar is hidden on cleanup
  }

  return {
    drawnNumbers,
    isRevealDone,
    startReveal,
    instantlyFinishReveal,
    cleanupRevealTimeouts,
    revealStartedForCycle
  };
}