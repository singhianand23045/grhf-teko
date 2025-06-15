import { useRef, useState } from "react";

export function useRevealAnimation(sets: number[][], SETS_PER_CYCLE: number, SET_SIZE: number) {
  // Animates reveal of numbers for a given cycle
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);
  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const revealStartedForCycle = useRef<number | null>(null);

  // These will now be set by the new constants:
  const REVEAL_TOTAL_NUMBERS = SETS_PER_CYCLE * SET_SIZE; // e.g. 18
  const REVEAL_DURATION_SEC = 18; // Changed to 18s for 1 second per number
  const REVEAL_PER_NUMBER_SEC = REVEAL_DURATION_SEC / REVEAL_TOTAL_NUMBERS; // 1s per number

  function startReveal(cycle: number) {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    // cycle 0: sets 0‒2, cycle 1: sets 3‒5
    const startSet = cycle * SETS_PER_CYCLE;
    const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
    // Flatten the active sets
    const poolSlice = activeSets.flat();
    setDrawnNumbers([]);
    setIsRevealDone(false);

    for (let i = 0; i < poolSlice.length; i++) {
      revealTimeouts.current.push(
        setTimeout(() => {
          setDrawnNumbers((prev) => [...prev, poolSlice[i]]);
          if (i === poolSlice.length - 1) setIsRevealDone(true);
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
    setDrawnNumbers(activeSets.flat());
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
