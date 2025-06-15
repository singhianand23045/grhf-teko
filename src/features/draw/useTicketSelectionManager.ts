
import { useEffect, useRef } from "react";
import { useWallet } from "../wallet/WalletContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";

/**
 * Manages ticket selection, last-picked-per-cycle caching, and ticket commit.
 * Returns last picked numbers per cycle, committed cycle ref,
 * and a function to update/persist picked numbers.
 */
export function useTicketSelectionManager(cycleIndex: number) {
  const wallet = useWallet();
  const { picked } = useNumberSelection();

  // Cache last picked numbers per cycle (persists across rerenders)
  const lastPickedPerCycle = useRef<{ [cycle: number]: number[] }>({});
  // Tracks whether a ticket is committed for current cycle
  const ticketCommittedCycle = useRef<number | null>(null);

  // When picked numbers update, record them for the current cycle
  useEffect(() => {
    if (picked && picked.length === 6) {
      lastPickedPerCycle.current[cycleIndex] = picked.slice();
      // Cache for future reference/recalc
    }
  }, [picked, cycleIndex]);

  // When picked changes & not yet committed this cycle, record ticket
  useEffect(() => {
    if (
      picked.length === 6 &&
      ticketCommittedCycle.current !== cycleIndex
    ) {
      wallet.addConfirmedTicket({
        date: new Date().toISOString(),
        numbers: picked.slice(),
      });
      ticketCommittedCycle.current = cycleIndex;
      lastPickedPerCycle.current[cycleIndex] = picked.slice();
    }
    // No else needed: purely initial commit logic
  }, [picked, cycleIndex, wallet]);

  // NEW: On cycle change, capture/transfer previous cycle's picks if still valid for jackpot
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
    // On demo reset, clear commit tracking
    if (cycleIndex === 0) {
      ticketCommittedCycle.current = null;
    }
  }, [cycleIndex, picked]);

  return {
    lastPickedPerCycle: lastPickedPerCycle.current,
    ticketCommittedCycle,
    picked,
  };
}

