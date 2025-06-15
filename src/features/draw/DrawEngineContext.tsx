import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { generateDrawSets } from "./numberPool";
import { useWallet } from "../wallet/WalletContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";
import { useJackpot } from "../jackpot/JackpotContext";

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
  const jackpotContext = useJackpot();

  // Add this new ref to count tickets per cycle:
  const cycleTicketCountRef = useRef<{[cycle: number]: number}>({});
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

  // Helper: count ticket per cycle, initialize if missing
  function incrementTicketCountForCycle(cycle: number) {
    if (!cycleTicketCountRef.current[cycle]) {
      cycleTicketCountRef.current[cycle] = 1;
    } else {
      cycleTicketCountRef.current[cycle]++;
    }
  }
  function resetTicketCountForCycle(cycle: number) {
    delete cycleTicketCountRef.current[cycle];
  }

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

  // PHASE 1: On ticket confirmation, deduct credits but don't increment jackpot yet
  useEffect(() => {
    if (picked.length === 6 && cycleIndex !== ticketCommittedCycle.current) {
      // Only commit once per cycle!
      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
      const allDrawn = activeSets.flat();
      const ticket = {
        date: new Date().toISOString(),
        numbers: picked.slice(),
      };
      wallet.addConfirmedTicket(ticket);
      // Don't increase jackpot here!
      incrementTicketCountForCycle(cycleIndex);
      ticketCommittedCycle.current = cycleIndex;
      lastPickedPerCycle.current[cycleIndex] = picked.slice();
      console.log("[DrawEngineContext] Committed ticket for cycle", cycleIndex, picked);
    }
    // eslint-disable-next-line
  }, [picked, cycleIndex, wallet, jackpotContext]);

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

  // UseEffect for handling "REVEAL" phase: ensure startReveal is called ONLY ONCE per cycle
  useEffect(() => {
    // Only trigger reveal when entering "REVEAL" state and reveal hasn't started for this cycle
    if (
      state === "REVEAL" &&
      revealStartedForCycle.current !== cycleIndex
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

      // --- All pending ticket logic (cache, etc) ---
      const ticketNumbers =
        lastPickedPerCycle.current[cycleIndex] && lastPickedPerCycle.current[cycleIndex].length === 6
          ? lastPickedPerCycle.current[cycleIndex]
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
            matches: 0, // <--- FIXED: Add this field
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
      // When leaving REVEAL or no valid entry
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
    // Previous bug: DO NOT add wallet to the dependencies!
    // eslint-disable-next-line
  }, [state, cycleIndex /*, wallet intentionally removed!*/]);

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

  // NEW: When a new cycle begins (state goes from REVEAL/COMPLETE to OPEN), increase jackpot by #tickets from previous cycle
  useEffect(() => {
    // Whenever cycleIndex changes (a new draw cycle begins),
    // use the ticket count of previous cycle to increase the jackpot
    if (cycleIndex > 0) {
      const prevCycle = cycleIndex - 1;
      const tickets = cycleTicketCountRef.current[prevCycle] || 0;
      if (tickets > 0) {
        console.log(`[DrawEngineContext] Adding $${tickets} to jackpot for cycle ${prevCycle}`);
        jackpotContext.addToJackpot(tickets);
        resetTicketCountForCycle(prevCycle);
      }
    }
    // Also reset count if demo is reset (cycleIndex = 0)
    if (cycleIndex === 0) {
      cycleTicketCountRef.current = {};
    }
  // Only depend on cycleIndex and jackpotContext
  }, [cycleIndex, jackpotContext]);

  // PHASE 5 Payoff Handling: 
  // When all numbers are revealed, check for jackpot win and handle result/awards.
  useEffect(() => {
    // Only show after all numbers revealed during REVEAL phase
    if (isRevealDone) {
      // Which sets for this cycle?
      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

      let userNumbers: number[] = [];
      if (lastPickedPerCycle.current[cycleIndex] && lastPickedPerCycle.current[cycleIndex].length === 6) {
        userNumbers = lastPickedPerCycle.current[cycleIndex];
      }

      // PHASE 5 LOGIC — Check if any row is jackpot match
      let rowWinnings = [0, 0, 0];
      let jackpotWon = false;
      if (userNumbers.length === 6) {
        for (let i = 0; i < SETS_PER_CYCLE; i++) {
          const drawnRow = activeSets[i];
          const matches = drawnRow.filter((n) => userNumbers.includes(n)).length;
          if (matches === 6) {
            jackpotWon = true;
          }
          rowWinnings[i] = getCreditsForMatches(matches);
        }
      }

      let totalWinnings = 0;
      let resultType: "jackpot" | "credits" | "none" = "none";

      if (userNumbers.length === 6) {
        if (jackpotWon) {
          // Award jackpot only, NO regular credit payout
          totalWinnings = jackpotContext.jackpot;
          resultType = "jackpot";
          wallet.awardTicketWinnings(activeSets, [0,0,0], totalWinnings);
          jackpotContext.resetJackpot();
        } else {
          totalWinnings = rowWinnings.reduce((sum, w) => sum + w, 0);
          resultType = totalWinnings > 0 ? "credits" : "none";
          wallet.awardTicketWinnings(activeSets, rowWinnings, totalWinnings);
        }
      }

      // Show correct banner for 5s
      setResultBar(({ show }) => ({
        show: true,
        credits: resultType === "jackpot" ? jackpotContext.jackpot : totalWinnings
      }));
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
  }, [isRevealDone, cycleIndex, sets, wallet, jackpotContext]);

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
