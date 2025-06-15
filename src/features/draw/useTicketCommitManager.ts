
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

  // On demo reset, reset committed ticket cycle and pending ref
  useEffect(() => {
    if (cycleIndex === 0) {
      ticketCommittedCycle.current = null;
      pendingTicketRef.current = null;
    }
  }, [cycleIndex]);

  // When user confirms a valid ticket (6 numbers), immediately deduct credits & commit ticket.
  useEffect(() => {
    // Only commit if:
    //  - Ticket is confirmed
    //  - Picked length is 6
    //  - Not already committed for this cycle
    if (
      picked.length === 6 &&
      isConfirmed &&
      ticketCommittedCycle.current !== cycleIndex
    ) {
      // Commit ticket and deduct credits
      wallet.addConfirmedTicket({
        date: new Date().toISOString(),
        numbers: picked.slice(),
      });
      ticketCommittedCycle.current = cycleIndex;

      // Store pending ticket for prize awarding (as before)
      pendingTicketRef.current = {
        cycle: cycleIndex,
        ticket: {
          date: new Date().toISOString(),
          numbers: picked.slice(),
        },
        entered: true, // It is now fully entered
      };
      console.log("[useTicketCommitManager] Confirmed ticket and deducted credits for cycle", cycleIndex, picked);
    }

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
