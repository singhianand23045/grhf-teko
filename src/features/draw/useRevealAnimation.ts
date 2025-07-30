import { useRef, useState, useEffect } from "react";
import { REVEAL_PER_NUMBER_SEC, SETS_PER_CYCLE, SET_SIZE } from "./drawConstants";

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
 */
export function useRevealAnimation(
  sets: number[][],
  SETS_PER_CYCLE: number,
  SET_SIZE: number,
  confirmedTickets: number[][], // Changed from userNumbers
  cycleIndex: number // new param to track cycle changes
) {
  // Animates reveal of numbers for a given cycle
  const [drawnNumbers, setDrawnNumbers] = useState<RevealedNumber[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);
  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const highlightTimeouts = useRef<NodeJS.Timeout[]>([]); // New for highlight overlays
  const revealStartedForCycle = useRef<number | null>(null);

  const REVEAL_TOTAL_NUMBERS = SETS_PER_CYCLE * SET_SIZE; // e.g. 18
  // REVEAL_DURATION_SEC and REVEAL_PER_NUMBER_SEC are now imported from drawConstants.ts

  // PHASE 9: Highlight overlay timings (relative to REVEAL start at 0:45)
  const TICKET2_HIGHLIGHT_START_SEC = 10; // 0:35 on timer (0:45 - 10s)
  const TICKET3_HIGHLIGHT_START_SEC = 13; // 0:32 on timer (0:45 - 13s)

  // Reset reveal state when cycle changes to prevent premature prize awarding
  useEffect(() => {
    setIsRevealDone(false);
    setDrawnNumbers([]);
    revealStartedForCycle.current = null;
    // Clear any pending timeouts
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    highlightTimeouts.current.forEach(clearTimeout); // Clear highlight timeouts
    highlightTimeouts.current = [];
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

    // Schedule highlight overlays for Ticket 2 and Ticket 3
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
        }, TICKET2_HIGHLIGHT_START_SEC * 1000)
      );
    }

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
        }, TICKET3_HIGHLIGHT_START_SEC * 1000)
      );
    }
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
  }

  // cleanup
  function cleanupRevealTimeouts() {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    highlightTimeouts.current.forEach(clearTimeout);
    highlightTimeouts.current = [];
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