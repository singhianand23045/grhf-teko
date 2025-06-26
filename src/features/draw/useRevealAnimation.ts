
import { useRef, useState, useEffect } from "react";

/**
 * Animates reveal of numbers, now in per-row order:
 * - For each row, reveal all numbers that are matches first, then non-matches, then next row.
 * @param sets - All 6x6 drawn numbers
 * @param SETS_PER_CYCLE - How many sets (rows) per draw
 * @param SET_SIZE - Size of each set (row)
 * @param userNumbers - Confirmed user's picks (6 numbers)
 * @param cycleIndex - Current cycle index to reset state on cycle changes
 */
export function useRevealAnimation(
  sets: number[][],
  SETS_PER_CYCLE: number,
  SET_SIZE: number,
  userNumbers: number[], // new param!
  cycleIndex: number // new param to track cycle changes
) {
  // Animates reveal of numbers for a given cycle
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);
  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const revealStartedForCycle = useRef<number | null>(null);

  // These will now be set by the new constants:
  const REVEAL_TOTAL_NUMBERS = SETS_PER_CYCLE * SET_SIZE; // e.g. 18
  const REVEAL_DURATION_SEC = 18; // Changed to 18s for 1 second per number
  const REVEAL_PER_NUMBER_SEC = REVEAL_DURATION_SEC / REVEAL_TOTAL_NUMBERS; // 1s per number

  // Reset reveal state when cycle changes to prevent premature prize awarding
  useEffect(() => {
    setIsRevealDone(false);
    setDrawnNumbers([]);
    revealStartedForCycle.current = null;
    // Clear any pending timeouts
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
  }, [cycleIndex]);

  // Helper: return the correct reveal sequence per requirements
  function buildRevealSequence(setsForDraw: number[][], userNums: number[]): number[] {
    if (!userNums || userNums.length !== 6) {
      // fallback: flat in order
      return setsForDraw.flat();
    }
    const revealSeq: number[] = [];
    for (const row of setsForDraw) {
      // Matches first
      const matches = row.filter((n) => userNums.includes(n));
      const rest = row.filter((n) => !userNums.includes(n));
      revealSeq.push(...matches, ...rest);
    }
    return revealSeq;
  }

  function startReveal(cycle: number) {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    // cycle 0: sets 0‒2, cycle 1: sets 3‒5
    const startSet = cycle * SETS_PER_CYCLE;
    const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

    // Find the correct sequence (matches in each row first, then the rest, per row)
    const sequence = buildRevealSequence(activeSets, userNumbers);

    setDrawnNumbers([]);
    setIsRevealDone(false);

    for (let i = 0; i < sequence.length; i++) {
      revealTimeouts.current.push(
        setTimeout(() => {
          setDrawnNumbers((prev) => [...prev, sequence[i]]);
          if (i === sequence.length - 1) setIsRevealDone(true);
        }, REVEAL_PER_NUMBER_SEC * 1000 * i)
      );
    }
    revealStartedForCycle.current = cycle;
  }

  function instantlyFinishReveal(cycle: number) {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    const startSet = cycle * SETS_PER_CYCLE;
    const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
    const sequence = buildRevealSequence(activeSets, userNumbers);
    setDrawnNumbers(sequence);
    setIsRevealDone(true);
  }

  // cleanup
  function cleanupRevealTimeouts() {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
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
