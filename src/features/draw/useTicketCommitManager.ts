
import { useRef, useEffect } from "react";
import { useWallet } from "../wallet/WalletContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";

export function useTicketCommitManager(
  cycleIndex: number,
  sets: number[][],
  SETS_PER_CYCLE: number,
  SET_SIZE: number,
  state: string,
  lastPickedPerCycle: { [cycle: number]: number[] },
  picked: number[],
  incrementTicketCountForCycle: (cycle: number, debugSource?: string) => void
) {
  const wallet = useWallet();
  const { isConfirmed } = useNumberSelection();
  const ticketCommittedCycle = useRef<number | null>(null);

  // pendingTicketRef: helper to track ticket to be entered post-reveal
  const pendingTicketRef = useRef<{
    cycle: number;
    ticket: { date: string; numbers: number[] };
    entered: boolean;
  } | null>(null);

  // *** FIX: Prevent phantom ticket deduction at new cycle by tracking prior confirmed state ***
  const prevIsConfirmed = useRef<boolean>(false);

  // Track whether we've committed a ticket for this cycle to avoid duplicates (extra defense).
  useEffect(() => {
    // Reset on new cycle
    ticketCommittedCycle.current = null;
    pendingTicketRef.current = null;
    // FIX: Keep prevIsConfirmed in sync with actual confirmation state at cycle change
    prevIsConfirmed.current = isConfirmed;
  }, [cycleIndex]); // Only depend on cycleIndex, not isConfirmed

  useEffect(() => {
    // Only commit if transitioning from NOT confirmed to confirmed (user action)
    if (
      picked.length === 6 &&
      isConfirmed &&
      !prevIsConfirmed.current &&
      ticketCommittedCycle.current !== cycleIndex
    ) {
      // Commit ticket and deduct credits - SET THE CYCLE PROPERTY
      wallet.addConfirmedTicket({
        date: new Date().toISOString(),
        numbers: picked.slice(),
        cycle: cycleIndex, // Ensure cycle is set for proper matching
      });
      ticketCommittedCycle.current = cycleIndex;

      // Store pending ticket for prize awarding (as before)
      pendingTicketRef.current = {
        cycle: cycleIndex,
        ticket: {
          date: new Date().toISOString(),
          numbers: picked.slice(),
        },
        entered: true, // ticket was entered for this cycle
      };
      console.log("[useTicketCommitManager] Confirmed ticket and deducted credits for cycle", cycleIndex, picked);
    }

    prevIsConfirmed.current = isConfirmed;

    // If not confirmed, reset pending ticket if present & not for the current cycle
    if (
      (!isConfirmed || picked.length !== 6) &&
      pendingTicketRef.current && pendingTicketRef.current.cycle !== cycleIndex
    ) {
      pendingTicketRef.current = null;
    }
  }, [picked, isConfirmed, cycleIndex, wallet]);

  return {
    ticketCommittedCycle,
    pendingTicketRef,
  };
}
