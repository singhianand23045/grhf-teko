import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { generateDrawSets } from "./numberPool";
import { useWallet } from "../wallet/WalletContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";

const SETS_COUNT = 6;
const SET_SIZE = 6;
const SETS_PER_CYCLE = 3; // 18 numbers (3x6) per cycle

// Add payout rules (matches -> credits)
const getCreditsForMatches = (matches: number): number => {
  switch (matches) {
    case 6: return 1000;
    case 5: return 100;
    case 4: return 40;
    case 3: return 20;
    case 2: return 10;
    default: return 0;
  }
};

interface DrawEngineContextType {
  drawnNumbers: number[];
  isRevealDone: boolean;
  startReveal: (cycleIndex: number, revealDurationSec: number) => void;
  instantlyFinishReveal: () => void;
  sets: number[][];
  revealResult: { show: boolean; credits: number | null };
  triggerResultBar: () => void;
}

const DrawEngineContext = createContext<DrawEngineContextType | undefined>(undefined);

export function DrawEngineProvider({ children }: { children: React.ReactNode }) {
  const { state, cycleIndex } = useTimer();
  // Wallet & Confirmed numbers
  const wallet = useWallet();
  const { picked } = useNumberSelection();
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);
   const [resultBar, setResultBar] = useState<{ show: boolean; credits: number | null }>({ show: false, credits: null });
  const resultTimeout = useRef<NodeJS.Timeout | null>(null);

  // Generate 6 sets of 6 numbers, once per session
  const setsRef = useRef<number[][] | null>(null);
  if (!setsRef.current) {
    setsRef.current = generateDrawSets();
  }
  const sets = setsRef.current;

  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const revealStartedForCycle = useRef<number | null>(null);

  // --- NEW: Keep last picked numbers per cycle regardless of provider reset ---
  const lastPickedPerCycle = useRef<{ [cycle: number]: number[] }>({});

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

  // Save picked numbers in lastPickedPerCycle whenever they update, for current cycle
  useEffect(() => {
    // Only save if picked is 6 numbers (i.e., a complete pick)
    if (picked && picked.length === 6) {
      lastPickedPerCycle.current[cycleIndex] = picked.slice();
      console.log("[DrawEngineContext] Caching picked numbers for cycle", cycleIndex, "->", picked.slice());
    }
  }, [picked, cycleIndex]);

  // We'll track if a ticket for the current cycle was already committed
  const ticketCommittedCycle = useRef<number | null>(null);

  // Updated: As soon as picked.length === 6 (just after confirm), commit ticket and deduct credits
  useEffect(() => {
    // Only act if we're NOT waiting for reveal and the user just locked in 6 picks for this cycle
    if (picked && picked.length === 6 && cycleIndex !== ticketCommittedCycle.current) {
      // Only commit once per cycle!
      // The 18 drawn numbers for this cycle:
      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
      const allDrawn = activeSets.flat();
      // matches always zero until REVEAL
      const ticket = {
        date: new Date().toISOString(),
        numbers: picked.slice(),
        // matches and creditChange are handled by context
      };
      // Immediate -10 credit, will update with matches (if needed) in REVEAL
      wallet.addConfirmedTicket(ticket);
      ticketCommittedCycle.current = cycleIndex;
      lastPickedPerCycle.current[cycleIndex] = picked.slice();
      console.log("[DrawEngineContext] Committed ticket for cycle", cycleIndex, ticket);
    }
    // eslint-disable-next-line
  }, [picked, cycleIndex, wallet]);

  // REVEAL: When actual numbers are known, update last ticket record with matches/winnings (wallet history/winning payout can be calculated by wallet/history)
  useEffect(() => {
    if (state === "REVEAL") {
      const pickedNumbers =
        lastPickedPerCycle.current[cycleIndex] && lastPickedPerCycle.current[cycleIndex].length === 6
          ? lastPickedPerCycle.current[cycleIndex]
          : picked;
      if (pickedNumbers.length === 6) {
        const startSet = cycleIndex * SETS_PER_CYCLE;
        const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
        const allDrawn = activeSets.flat();
        const matches = pickedNumbers.filter((n) => allDrawn.includes(n)).length;

        // Update ticket in history: payout if needed. We'll leave history with correct match/payout info, but don't double-charge or double-pay.
        // As a prototype shortcut, don't update wallet balance here, since payout is handled in addTicket logic.
        // Optionally: show winnings UI separately if needed.

        // NO wallet.addTicket here -- it's already deducted.
        // Instead, update most recent ticket's matches for UX history display.
        // Real app would trigger payout here for matches === 6 with extra credit.
      }
    }
    // eslint-disable-next-line
  }, [state, cycleIndex, picked, sets, wallet]);

  useEffect(() => {
    // Log to debug ticket handling and wallet state
    console.log("[DrawEngineContext] Effect triggered. state:", state, "pendingTicketRef:", pendingTicketRef.current);

    if (
      state === "REVEAL"
    ) {
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
      // --- FIX: Use cached numbers, fallback to picked (to survive provider reset) ---
      const ticketNumbers =
        lastPickedPerCycle.current[cycleIndex] && lastPickedPerCycle.current[cycleIndex].length === 6
          ? lastPickedPerCycle.current[cycleIndex]
          : picked;

      if (
        ticketNumbers.length === 6 &&
        (!pendingTicketRef.current ||
          pendingTicketRef.current.cycle !== cycleIndex)
      ) {
        // The 18 drawn numbers for this cycle:
        const startSet = cycleIndex * SETS_PER_CYCLE;
        const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
        const allDrawn = activeSets.flat();
        // Count matches in ticketNumbers (intersection)
        const matches = ticketNumbers.filter((n) => allDrawn.includes(n)).length;

        pendingTicketRef.current = {
          cycle: cycleIndex,
          ticket: {
            date: new Date().toISOString(),
            numbers: ticketNumbers,
            // matches not passed here, handled later in context
          },
          entered: false, // pending
        };
        console.log(
          "[DrawEngineContext] Created pending ticket for cycle",
          cycleIndex,
          "numbers:",
          ticketNumbers,
          "matches:",
          matches
        );
      }

      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        revealTimeouts.current.forEach(clearTimeout);
        revealTimeouts.current = [];
      };
    } else if (
      pendingTicketRef.current &&
      !pendingTicketRef.current.entered
    ) {
      console.log("[DrawEngineContext] Adding ticket to wallet:", pendingTicketRef.current.ticket);
      wallet.addConfirmedTicket(pendingTicketRef.current.ticket);
      pendingTicketRef.current.entered = true;
    } else if (
      state === "OPEN" &&
      pendingTicketRef.current &&
      pendingTicketRef.current.entered
    ) {
      console.log("[DrawEngineContext] Clearing pending ticket ref");
      pendingTicketRef.current = null;
    }
    // eslint-disable-next-line
  }, [state, cycleIndex, wallet]);

  // New: Commit ticket to wallet/credit only AFTER REVEAL phase ends (when timer ticks to next cycle)
  useEffect(() => {
    // When leaving REVEAL (transition to OPEN/CUT_OFF/COMPLETE), if a pending ticket exists and not yet entered, add it.
    if (
      state !== "REVEAL" &&
      pendingTicketRef.current &&
      !pendingTicketRef.current.entered
    ) {
      wallet.addConfirmedTicket(pendingTicketRef.current.ticket);
      pendingTicketRef.current.entered = true;
    }

    // Only clear after ensuring ticket has been entered (not before!)
    if (
      state === "OPEN" &&
      pendingTicketRef.current &&
      pendingTicketRef.current.entered
    ) {
      pendingTicketRef.current = null;
    }
    // eslint-disable-next-line
  }, [state, cycleIndex, wallet]);

  // When all drawn numbers revealed, at timer = 0:25, show result message for 5s
  useEffect(() => {
    // Only show after all numbers revealed during REVEAL phase
    if (isRevealDone) {
      // Calculate credits for user ticket vs drawnNumbers (if a user ticket exists for this cycle)
      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
      const allDrawn = activeSets.flat();

      let userNumbers: number[] = [];
      if (
        lastPickedPerCycle.current[cycleIndex] &&
        lastPickedPerCycle.current[cycleIndex].length === 6
      ) {
        userNumbers = lastPickedPerCycle.current[cycleIndex];
      }

      // Sum winnings for user's ticket (if one exists, only 1 entry max allowed)
      const matches = userNumbers.filter((n) => allDrawn.includes(n)).length;
      const winnings = getCreditsForMatches(matches);

      // Show bar
      setResultBar({ show: true, credits: winnings });

      // Hide after 5 seconds
      if (resultTimeout.current) clearTimeout(resultTimeout.current);
      resultTimeout.current = setTimeout(() => {
        setResultBar({ show: false, credits: null });
      }, 5000);
    }
    // Clean up timeout if component unmounts
    return () => {
      if (resultTimeout.current) clearTimeout(resultTimeout.current);
    };
    // eslint-disable-next-line
  }, [isRevealDone, cycleIndex, sets]);

  // Helper for explicit triggering (could be used for test)
  function triggerResultBar() {
    setResultBar((curr) => ({ show: true, credits: curr.credits }));
    if (resultTimeout.current) clearTimeout(resultTimeout.current);
    resultTimeout.current = setTimeout(() => {
      setResultBar({ show: false, credits: null });
    }, 5000);
  }

  return (
    <DrawEngineContext.Provider
      value={{
        drawnNumbers,
        isRevealDone,
        startReveal,
        instantlyFinishReveal,
        sets,
        revealResult: resultBar,
        triggerResultBar,
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
