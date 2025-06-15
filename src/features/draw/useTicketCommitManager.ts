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
  const ticketCommittedCycle = useRef<number | null>(null);

  // pendingTicketRef: helper to track ticket to be entered post-reveal
  const pendingTicketRef = useRef<{
    cycle: number;
    ticket: { date: string; numbers: number[]; matches: number };
    entered: boolean;
  } | null>(null);

  // On demo reset, reset committed ticket cycle and pending ref
  useEffect(() => {
    if (cycleIndex === 0) {
      ticketCommittedCycle.current = null;
      pendingTicketRef.current = null;
    }
  }, [cycleIndex]);

  // Commit ticket on confirmation, only once per cycle
  useEffect(() => {
    if (picked.length === 6 && ticketCommittedCycle.current !== cycleIndex) {
      wallet.addConfirmedTicket({
        date: new Date().toISOString(),
        numbers: picked.slice(),
      });
      incrementTicketCountForCycle(cycleIndex, "picked-confirm");
      ticketCommittedCycle.current = cycleIndex;
    }
    // eslint-disable-next-line
  }, [picked, cycleIndex, wallet]);

  // Handle pending ticket bookkeeping (commit to wallet after REVEAL phase, etc.)
  useEffect(() => {
    if (state === "REVEAL") {
      const ticketNumbers =
        lastPickedPerCycle[cycleIndex] && lastPickedPerCycle[cycleIndex].length === 6
          ? lastPickedPerCycle[cycleIndex]
          : picked;

      if (
        ticketNumbers.length === 6 &&
        (!pendingTicketRef.current ||
          pendingTicketRef.current.cycle !== cycleIndex)
      ) {
        const startSet = cycleIndex * SETS_PER_CYCLE;
        const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
        const allDrawn = activeSets.flat();
        const matches = ticketNumbers.filter((n) => allDrawn.includes(n)).length;

        pendingTicketRef.current = {
          cycle: cycleIndex,
          ticket: {
            date: new Date().toISOString(),
            numbers: ticketNumbers,
            matches: 0,
          },
          entered: false,
        };
      }
    } else if (
      pendingTicketRef.current &&
      !pendingTicketRef.current.entered
    ) {
      wallet.addConfirmedTicket(pendingTicketRef.current.ticket);
      pendingTicketRef.current.entered = true;
    } else if (
      state === "OPEN" &&
      pendingTicketRef.current &&
      pendingTicketRef.current.entered
    ) {
      pendingTicketRef.current = null;
    }
    // eslint-disable-next-line
  }, [state, cycleIndex]);

  // On non-REVEAL, commit any pending ticket if not entered yet
  useEffect(() => {
    if (
      state !== "REVEAL" &&
      pendingTicketRef.current &&
      !pendingTicketRef.current.entered
    ) {
      wallet.addConfirmedTicket(pendingTicketRef.current.ticket);
      pendingTicketRef.current.entered = true;
    }

    if (
      state === "OPEN" &&
      pendingTicketRef.current &&
      pendingTicketRef.current.entered
    ) {
      pendingTicketRef.current = null;
    }
    // eslint-disable-next-line
  }, [state, cycleIndex, wallet]);

  return {
    ticketCommittedCycle,
    pendingTicketRef,
  };
}
