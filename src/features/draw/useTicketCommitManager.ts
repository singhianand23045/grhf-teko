
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

  // Track "pending confirmed ticket" per cycle (WAIT to actually store/deduct until draw is finished)
  useEffect(() => {
    // Only save pending if user confirmed 6 numbers for this cycle and not already saved
    if (
      picked.length === 6 &&
      isConfirmed &&
      (!pendingTicketRef.current || pendingTicketRef.current.cycle !== cycleIndex)
    ) {
      pendingTicketRef.current = {
        cycle: cycleIndex,
        ticket: {
          date: new Date().toISOString(),
          numbers: picked.slice(),
        },
        entered: false,
      };
    }
    // If user unconfirms, or unselects numbers, or on new cycle, clear pending ref unless it's for THIS cycle and still confirmed
    if (
      (!isConfirmed || picked.length !== 6) ||
      (pendingTicketRef.current && pendingTicketRef.current.cycle !== cycleIndex)
    ) {
      pendingTicketRef.current = null;
    }
  }, [picked, isConfirmed, cycleIndex]);

  // No-op on state change (all handling done in DrawEngineContext now)

  return {
    ticketCommittedCycle,
    pendingTicketRef,
  };
}
