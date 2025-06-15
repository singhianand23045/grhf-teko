import React, { createContext, useContext, useEffect, useRef } from "react";
import { useTimer } from "../timer/timer-context";
import { useWallet } from "../wallet/WalletContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";
import { useJackpot } from "../jackpot/JackpotContext";
import { getCreditsForMatches } from "./getCreditsForMatches";
import { calculateWinnings } from "./calculateWinnings";

import { useRevealAnimation } from "./useRevealAnimation";
import { shouldAwardTicket } from "./walletAwardUtils";
import { useJackpotHandlers } from "./useJackpotHandlers";
import { useResultBar } from "./useResultBar";

// === new hooks and constants extracted ===
import { SETS_COUNT, SET_SIZE, SETS_PER_CYCLE, REVEAL_TOTAL_NUMBERS, REVEAL_DURATION_SEC, REVEAL_PER_NUMBER_SEC } from "./drawConstants";
import { useDrawSets } from "./useDrawSets";
import { useTicketSelectionManager } from "./useTicketSelectionManager";
import { useTicketCommitManager } from "./useTicketCommitManager";

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
  const wallet = useWallet();
  const jackpotContext = useJackpot();

  // --- Modular constants and hooks ---
  const sets = useDrawSets(); // replaces setsRef logic
  // FIX: Only extract lastPickedPerCycle and picked (NOT ticketCommittedCycle)
  const { lastPickedPerCycle, picked } = useTicketSelectionManager(cycleIndex);

  // Count of tickets per cycle (for jackpot add/reset logic)
  // const cycleTicketCountRef = useRef<{ [cycle: number]: number }>({});

  // function incrementTicketCountForCycle(cycle: number, debugSource = "unknown") {
  //   if (!cycleTicketCountRef.current[cycle]) {
  //     cycleTicketCountRef.current[cycle] = 1;
  //     console.log(`[DrawEngineContext] First ticket for cycle ${cycle} from ${debugSource} - count=1`);
  //   } else {
  //     console.log(`[DrawEngineContext] Already have a ticket for cycle ${cycle} from ${debugSource} — no increment`);
  //   }
  //   // Debug print state
  //   console.log("[DrawEngineContext] cycleTicketCountRef after increment:", { ...cycleTicketCountRef.current });
  // }

  // function resetTicketCountForCycle(cycle: number) {
  //   console.log(`[DrawEngineContext] Resetting ticket count for cycle ${cycle}`);
  //   delete cycleTicketCountRef.current[cycle];
  //   console.log("[DrawEngineContext] cycleTicketCountRef after reset:", { ...cycleTicketCountRef.current });
  // }

  // --- Ensure previous cycle ticket count is captured for jackpot increment logic ---
  // useEffect(() => {
  //   if (cycleIndex > 0) {
  //     const prevCycle = cycleIndex - 1;
  //     // Forcibly ensure ticket count is captured for prevCycle IF the user picked numbers for that cycle
  //     const userPicked = lastPickedPerCycle[prevCycle];
  //     if (userPicked && userPicked.length === 6 && !cycleTicketCountRef.current[prevCycle]) {
  //       console.log(`[DrawEngineContext] (cycle advance) Trying to increment ticket for previous cycle=${prevCycle}`);
  //       incrementTicketCountForCycle(prevCycle, "catchup-on-cycle-advance");
  //     }
  //   }
  //   // eslint-disable-next-line
  // }, [cycleIndex]);

  const {
    resultBar,
    showResultBar,
    triggerResultBar,
    cleanup: cleanupResultBarTimeout,
    setResultBar,
  } = useResultBar({ show: false, credits: null }, 5000);

  // Reveal animation logic
  const {
    drawnNumbers,
    isRevealDone,
    startReveal: hookStartReveal,
    instantlyFinishReveal: hookInstantlyFinishReveal,
    cleanupRevealTimeouts,
    revealStartedForCycle,
  } = useRevealAnimation(sets, SETS_PER_CYCLE, SET_SIZE);

  // Use new hook for ticket commit/confirmation and pending tracking
  const { ticketCommittedCycle, pendingTicketRef } = useTicketCommitManager(
    cycleIndex,
    sets,
    SETS_PER_CYCLE,
    SET_SIZE,
    state,
    lastPickedPerCycle,
    picked,
    () => {}
  );

  const startReveal = (cycle: number) => {
    hookStartReveal(cycle);
  };

  const instantlyFinishReveal = () => {
    hookInstantlyFinishReveal(cycleIndex);
  };

  // Remove all direct ticket commit/pendingTicket logic/coordinating useEffects—now handled in useTicketCommitManager

  // On demo reset, also reset committed-cycle tracking so that tickets get allowed/incremented on new demo start
  useEffect(() => {
    if (cycleIndex === 0) {
      // cycleTicketCountRef.current = {};
      console.log("[DrawEngineContext] Demo RESET: all ticket counts reset");
    }
  }, [cycleIndex]);

  // PHASE 1: On ticket confirmation, deduct credits but don't increment jackpot yet
  // Moved to useTicketCommitManager

  // REVEAL: When actual numbers are known, update last ticket record with matches/winnings (wallet history/winning payout can be calculated by wallet/history)
  useEffect(() => {
    if (state === "REVEAL") {
      const pickedNumbers =
        lastPickedPerCycle[cycleIndex] && lastPickedPerCycle[cycleIndex].length === 6
          ? lastPickedPerCycle[cycleIndex]
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

      // Pending ticket logic moved to useTicketCommitManager

      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        cleanupRevealTimeouts();
      };
    }
    // Rest of old pending ticket management logic moved to useTicketCommitManager
    // eslint-disable-next-line
  }, [state, cycleIndex /*, wallet intentionally removed!*/]);

  // New: Commit ticket to wallet/credit only AFTER REVEAL phase ends (when timer ticks to next cycle)
  // Moved to useTicketCommitManager

  // Enhanced logging for jackpot handlers effect
  useJackpotHandlers(cycleIndex, lastPickedPerCycle);

  // PHASE 5 Payoff Handling: 
  useEffect(() => {
    if (isRevealDone) {
      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

      let userNumbers: number[] = [];
      if (lastPickedPerCycle[cycleIndex] && lastPickedPerCycle[cycleIndex].length === 6) {
        userNumbers = lastPickedPerCycle[cycleIndex];
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
