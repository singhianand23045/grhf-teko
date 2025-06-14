
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { generateDrawSets } from "./numberPool";
import { useWallet } from "../wallet/WalletContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";

const SETS_COUNT = 6;
const SET_SIZE = 6;
const SETS_PER_CYCLE = 3; // 18 numbers (3x6) per cycle

interface DrawEngineContextType {
  drawnNumbers: number[];
  isRevealDone: boolean;
  startReveal: (cycleIndex: number, revealDurationSec: number) => void;
  instantlyFinishReveal: () => void;
  sets: number[][];
}

const DrawEngineContext = createContext<DrawEngineContextType | undefined>(undefined);

export function DrawEngineProvider({ children }: { children: React.ReactNode }) {
  const { state, cycleIndex } = useTimer();
  // Wallet & Confirmed numbers
  const wallet = useWallet();
  const { picked } = useNumberSelection();
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);

  // Generate 6 sets of 6 numbers, once per session
  const setsRef = useRef<number[][] | null>(null);
  if (!setsRef.current) {
    setsRef.current = generateDrawSets();
  }
  const sets = setsRef.current;

  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const revealStartedForCycle = useRef<number | null>(null);

  // Helper: track pending wallet action per cycle for ticket entry
  // Each element: { cycleIndex, ticketData }
  const pendingTicketRef = useRef<{
    cycle: number;
    ticket: { date: string; numbers: number[]; matches: number };
    entered: boolean;
  } | null>(null);

  // Reveal logic: reveal all numbers in 9 seconds, one every 0.5s (18 numbers)
  const REVEAL_TOTAL_NUMBERS = SETS_PER_CYCLE * SET_SIZE; // 18
  const REVEAL_DURATION_SEC = 9; // 0:45 to 0:36 = 9 seconds
  const REVEAL_PER_NUMBER_SEC = REVEAL_DURATION_SEC / REVEAL_TOTAL_NUMBERS; // 0.5s per number

  const startReveal = (cycle: number) => {
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
  };

  const instantlyFinishReveal = () => {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    const cycle = revealStartedForCycle.current ?? cycleIndex;
    const startSet = cycle * SETS_PER_CYCLE;
    const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
    setDrawnNumbers(activeSets.flat());
    setIsRevealDone(true);
  };

  useEffect(() => {
    if (state === "REVEAL") {
      startReveal(cycleIndex);
      const handleVisibility = () => {
        if (
          document.visibilityState === "visible" &&
          state === "REVEAL" &&
          drawnNumbers.length < REVEAL_TOTAL_NUMBERS
        ) {
          instantlyFinishReveal();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

      // DEFERS TICKET capture: don't add to wallet yet; instead save "pending" info if needed
      // Only run if 6 picked, and user hasn't already submitted for this cycle
      if (
        picked?.length === 6 &&
        (!pendingTicketRef.current ||
          pendingTicketRef.current.cycle !== cycleIndex)
      ) {
        // The 18 drawn numbers for this cycle:
        const startSet = cycleIndex * SETS_PER_CYCLE;
        const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
        const allDrawn = activeSets.flat();
        // Count matches in picked ticket (intersection)
        const matches = picked.filter((n) => allDrawn.includes(n)).length;

        pendingTicketRef.current = {
          cycle: cycleIndex,
          ticket: {
            date: new Date().toISOString(),
            numbers: picked,
            matches,
          },
          entered: false, // pending
        };
      }

      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        revealTimeouts.current.forEach(clearTimeout);
        revealTimeouts.current = [];
      };
    } else if (
      state === "OPEN" ||
      state === "CUT_OFF" ||
      state === "COMPLETE"
    ) {
      // Only clear when leaving REVEAL
      setDrawnNumbers([]);
      setIsRevealDone(false);
      revealStartedForCycle.current = null;
      revealTimeouts.current.forEach(clearTimeout);
      revealTimeouts.current = [];
    }
    // eslint-disable-next-line
  }, [state, cycleIndex]);

  // New: Commit ticket to wallet/credit only AFTER REVEAL phase ends (when timer ticks to next cycle)
  useEffect(() => {
    // When leaving REVEAL (transition to OPEN/CUT_OFF/COMPLETE), if a pending ticket exists and not yet entered, add it
    if (
      state !== "REVEAL" &&
      pendingTicketRef.current &&
      !pendingTicketRef.current.entered
    ) {
      wallet.addTicket(pendingTicketRef.current.ticket);
      pendingTicketRef.current.entered = true;
    }
    // When cycling to new cycle, also clear any "old" pending ticket
    if (state === "OPEN" && pendingTicketRef.current) {
      pendingTicketRef.current = null;
    }
    // eslint-disable-next-line
  }, [state, cycleIndex, wallet]);

  return (
    <DrawEngineContext.Provider
      value={{
        drawnNumbers,
        isRevealDone,
        startReveal,
        instantlyFinishReveal,
        sets,
      }}
    >
      {children}
    </DrawEngineContext.Provider>
  );
}

export function useDrawEngine() {
  const ctx = useContext(DrawEngineContext);
  if (!ctx) throw new Error("useDrawEngine must be used within DrawEngineProvider");
  return ctx;
}

