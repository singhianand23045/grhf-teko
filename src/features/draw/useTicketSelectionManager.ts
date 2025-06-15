
import { useEffect, useRef } from "react";
import { useNumberSelection } from "../number-select/NumberSelectionContext";

/**
 * Tracks last picked numbers per cycle.
 * Does NOT commit tickets or deduct credits.
 */
export function useTicketSelectionManager(cycleIndex: number) {
  const { picked } = useNumberSelection();

  // Cache last picked numbers per cycle (persists across rerenders)
  const lastPickedPerCycle = useRef<{ [cycle: number]: number[] }>({});

  // When picked numbers update, record them for the current cycle
  useEffect(() => {
    if (picked && picked.length === 6) {
      lastPickedPerCycle.current[cycleIndex] = picked.slice();
      // Cache for future reference/recalc
    }
  }, [picked, cycleIndex]);

  // On cycle change, capture/transfer previous cycle's picks if still valid for jackpot
  useEffect(() => {
    if (cycleIndex > 0) {
      const prevCycle = cycleIndex - 1;
      // If no valid entry exists for prevCycle, but last entry for current cycle is valid, set it
      if (
        !lastPickedPerCycle.current[prevCycle] ||
        lastPickedPerCycle.current[prevCycle].length !== 6
      ) {
        // Try to use current cycle picks (should reflect last confirmed!)
        if (picked && picked.length === 6) {
          lastPickedPerCycle.current[prevCycle] = picked.slice();
          console.log(
            `[useTicketSelectionManager] Copied picked numbers for prevCycle ${prevCycle} on cycle change:`,
            lastPickedPerCycle.current[prevCycle]
          );
        }
      }
    }
  }, [cycleIndex, picked]);

  return {
    lastPickedPerCycle: lastPickedPerCycle.current,
    picked,
  };
}
