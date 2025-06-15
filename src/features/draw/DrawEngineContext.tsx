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
  // CHANGE: Always use last picked per cycle for this cycleIndex when available
  const confirmedUserNumbers =
    lastPickedPerCycle[cycleIndex] && lastPickedPerCycle[cycleIndex].length === 6
      ? lastPickedPerCycle[cycleIndex]
      : picked;

  const {
    drawnNumbers,
    isRevealDone,
    startReveal: hookStartReveal,
    instantlyFinishReveal: hookInstantlyFinishReveal,
    cleanupRevealTimeouts,
    revealStartedForCycle,
  } = useRevealAnimation(sets, SETS_PER_CYCLE, SET_SIZE, confirmedUserNumbers);

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
      // No-op: wallet actions deferred until after REVEAL is done
    }
    // eslint-disable-next-line
  }, [state, cycleIndex, picked, sets, wallet]);

  // On REVEAL DONE (drawn numbers settled, after animation), process credits logic
  useEffect(() => {
    if (isRevealDone) {
      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

      let userNumbers: number[] = [];
      if (lastPickedPerCycle[cycleIndex] && lastPickedPerCycle[cycleIndex].length === 6) {
        userNumbers = lastPickedPerCycle[cycleIndex];
      } else if (
        pendingTicketRef.current &&
        pendingTicketRef.current.cycle === cycleIndex &&
        pendingTicketRef.current.ticket.numbers.length === 6
      ) {
        userNumbers = pendingTicketRef.current.ticket.numbers;
      }

      // 1. ONCE PER CYCLE, only now DEDUCT CREDITS and add ticket
      let ticketWasEntered = false;
      if (
        pendingTicketRef.current &&
        pendingTicketRef.current.cycle === cycleIndex &&
        !pendingTicketRef.current.entered &&
        userNumbers.length === 6
      ) {
        wallet.addConfirmedTicket({
          date: pendingTicketRef.current.ticket.date,
          numbers: pendingTicketRef.current.ticket.numbers,
        });
        pendingTicketRef.current.entered = true;
        ticketWasEntered = true;
        // If needed, increment ticket count for jackpot logic (not used, can implement here if relevant)
      }

      // 2. Calculate and award winnings as before
      const { jackpotWon, rowWinnings, totalWinnings, resultType } = calculateWinnings(
        userNumbers,
        activeSets,
        jackpotContext.jackpot
      );

      if (userNumbers.length === 6 && ticketWasEntered) {
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
