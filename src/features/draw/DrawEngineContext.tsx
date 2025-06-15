import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { generateDrawSets } from "./numberPool";
import { useWallet } from "../wallet/WalletContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";
import { useJackpot } from "../jackpot/JackpotContext";
import { getCreditsForMatches } from "./getCreditsForMatches";
import { calculateWinnings } from "./calculateWinnings";

// --- new imports from refactor ---
import { useRevealAnimation } from "./useRevealAnimation";
import { shouldAwardTicket } from "./walletAwardUtils";
import { useJackpotHandlers } from "./useJackpotHandlers";
import { useResultBar } from "./useResultBar";

const SETS_COUNT = 6;
const SET_SIZE = 6;
const SETS_PER_CYCLE = 3; // 18 numbers (3x6) per cycle

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

  // Count of tickets per cycle — for future multi-player
  const cycleTicketCountRef = useRef<{ [cycle: number]: number }>({});

  // Helpers for ticket count
  function incrementTicketCountForCycle(cycle: number, debugSource = "unknown") {
    if (!cycleTicketCountRef.current[cycle]) {
      cycleTicketCountRef.current[cycle] = 1;
      console.log(`[DrawEngineContext] First ticket for cycle ${cycle} from ${debugSource} - count=1`);
    } else {
      console.log(`[DrawEngineContext] Already have a ticket for cycle ${cycle} from ${debugSource} — no increment`);
    }
    console.log("[DrawEngineContext] cycleTicketCountRef after increment:", { ...cycleTicketCountRef.current });
  }

  function resetTicketCountForCycle(cycle: number) {
    console.log(`[DrawEngineContext] Resetting ticket count for cycle ${cycle}`);
    delete cycleTicketCountRef.current[cycle];
    console.log("[DrawEngineContext] cycleTicketCountRef after reset:", { ...cycleTicketCountRef.current });
  }

  // Use the custom result bar hook instead of legacy state/timeout logic
  const {
    resultBar,
    showResultBar,
    triggerResultBar,
    cleanup: cleanupResultBarTimeout,
    setResultBar,
  } = useResultBar({ show: false, credits: null }, 5000);

  // Generate 6 sets of 6 numbers, once per session
  const setsRef = useRef<number[][] | null>(null);
  if (!setsRef.current) {
    setsRef.current = generateDrawSets();
  }
  const sets = setsRef.current;

  // Use refactored custom hook for reveal
  const {
    drawnNumbers,
    isRevealDone,
    startReveal: hookStartReveal,
    instantlyFinishReveal: hookInstantlyFinishReveal,
    cleanupRevealTimeouts,
    revealStartedForCycle,
  } = useRevealAnimation(sets, SETS_PER_CYCLE, SET_SIZE);

  // Keep last picked numbers per cycle regardless of provider reset
  const lastPickedPerCycle = useRef<{ [cycle: number]: number[] }>({});

  // Helper: track pending wallet action per cycle for ticket entry
  const pendingTicketRef = useRef<{
    cycle: number;
    ticket: { date: string; numbers: number[]; matches: number };
    entered: boolean;
  } | null>(null);

  const startReveal = (cycle: number) => {
    hookStartReveal(cycle);
  };

  const instantlyFinishReveal = () => {
    hookInstantlyFinishReveal(cycleIndex);
  };

  // Save picked numbers in lastPickedPerCycle whenever they update, for current cycle
  useEffect(() => {
    if (picked && picked.length === 6) {
      lastPickedPerCycle.current[cycleIndex] = picked.slice();
      console.log("[DrawEngineContext] Caching picked numbers for cycle", cycleIndex, "->", picked.slice());
    }
  }, [picked, cycleIndex]);

  // We'll track if a ticket for the current cycle was already committed
  const ticketCommittedCycle = useRef<number | null>(null);

  // On demo reset, also reset committed-cycle tracking so that tickets get allowed/incremented on new demo start
  useEffect(() => {
    if (cycleIndex === 0) {
      ticketCommittedCycle.current = null;
      cycleTicketCountRef.current = {};
      console.log("[DrawEngineContext] Demo RESET: ticketCommittedCycle and all ticket counts reset");
    }
  }, [cycleIndex]);

  // PHASE 1: On ticket confirmation, deduct credits but don't increment jackpot yet
  useEffect(() => {
    if (
      picked.length === 6 &&
      ticketCommittedCycle.current !== cycleIndex
    ) {
      console.log(`[DrawEngineContext] Committing ticket (picked/confirmed) for cycle ${cycleIndex}:`, picked);
      wallet.addConfirmedTicket({
        date: new Date().toISOString(),
        numbers: picked.slice(),
      });
      incrementTicketCountForCycle(cycleIndex, "picked-confirm");
      ticketCommittedCycle.current = cycleIndex;
      lastPickedPerCycle.current[cycleIndex] = picked.slice();
      console.log("[DrawEngineContext] Committed ticket for cycle", cycleIndex, picked, ", ticketCommittedCycle now:", ticketCommittedCycle.current);
    } else {
      console.log(`[DrawEngineContext] Not committing ticket (picked.length: ${picked.length}, cycleIndex: ${cycleIndex}, ticketCommittedCycle: ${ticketCommittedCycle.current})`);
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
        // NO wallet.addTicket here -- it's already deducted.
      }
    }
    // eslint-disable-next-line
  }, [state, cycleIndex, picked, sets, wallet]);

  // UseEffect for handling "REVEAL" phase: ensure startReveal is called ONLY ONCE per cycle
  useEffect(() => {
    if (
      state === "REVEAL" &&
      revealStartedForCycle.current !== cycleIndex
    ) {
      startReveal(cycleIndex);

      const handleVisibility = () => {
        if (
          document.visibilityState === "visible" &&
          state === "REVEAL" &&
          drawnNumbers.length < SETS_PER_CYCLE * SET_SIZE
        ) {
          instantlyFinishReveal();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

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
            matches: 0,
          },
          entered: false,
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
        cleanupRevealTimeouts();
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
  }, [state, cycleIndex /*, wallet intentionally removed!*/]);

  // New: Commit ticket to wallet/credit only AFTER REVEAL phase ends (when timer ticks to next cycle)
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

  useJackpotHandlers(cycleIndex, cycleTicketCountRef, resetTicketCountForCycle);

  // PHASE 5 Payoff Handling: 
  useEffect(() => {
    if (isRevealDone) {
      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

      let userNumbers: number[] = [];
      if (lastPickedPerCycle.current[cycleIndex] && lastPickedPerCycle.current[cycleIndex].length === 6) {
        userNumbers = lastPickedPerCycle.current[cycleIndex];
      }

      const { jackpotWon, rowWinnings, totalWinnings, resultType } = calculateWinnings(
        userNumbers,
        activeSets,
        jackpotContext.jackpot
      );

      if (userNumbers.length === 6) {
        if (jackpotWon) {
          wallet.awardTicketWinnings(activeSets, [0,0,0], totalWinnings);
          jackpotContext.resetJackpot();
        } else {
          wallet.awardTicketWinnings(activeSets, rowWinnings, totalWinnings);
        }
      }

      showResultBar(resultType === "jackpot" ? jackpotContext.jackpot : totalWinnings);
    }
    return () => {
      cleanupResultBarTimeout();
    };
    // eslint-disable-next-line
  }, [isRevealDone, cycleIndex, sets, wallet, jackpotContext]);

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
