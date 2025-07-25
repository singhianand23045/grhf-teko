
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
  const { isConfirmed, confirmedCycle } = useNumberSelection();
  const ticketCommittedCycle = useRef<number | null>(null);

  // pendingTicketRef: helper to track ticket to be entered post-reveal
  const pendingTicketRef = useRef<{
    cycle: number;
    ticket: { date: string; numbers: number[] };
    entered: boolean;
  } | null>(null);

  // Track the last ticket committed to prevent duplicates
  const lastCommittedTicket = useRef<{ cycle: number; numbers: string } | null>(null);

  // Track whether we've committed a ticket for this cycle to avoid duplicates (extra defense).
  useEffect(() => {
    // Reset on new cycle
    ticketCommittedCycle.current = null;
    pendingTicketRef.current = null;
    lastCommittedTicket.current = null;
  }, [cycleIndex]);

  useEffect(() => {
    // More robust logic: commit if we have 6 numbers confirmed for this cycle and haven't already committed
    const numbersKey = picked.slice().sort((a, b) => a - b).join(',');
    const hasAlreadyCommitted = lastCommittedTicket.current?.cycle === cycleIndex && 
                               lastCommittedTicket.current?.numbers === numbersKey;

    if (
      picked.length === 6 &&
      isConfirmed &&
      confirmedCycle === cycleIndex &&
      ticketCommittedCycle.current !== cycleIndex &&
      !hasAlreadyCommitted
    ) {
      // Commit ticket and deduct credits - SET THE CYCLE PROPERTY
      wallet.addConfirmedTicket({
        date: new Date().toISOString(),
        numbers: picked.slice(),
        cycle: cycleIndex, // Ensure cycle is set for proper matching
      });
      ticketCommittedCycle.current = cycleIndex;
      lastCommittedTicket.current = { cycle: cycleIndex, numbers: numbersKey };

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
