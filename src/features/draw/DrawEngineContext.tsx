import React, { createContext, useContext, useEffect, useRef } from "react";
import { useTimer } from "../timer/timer-context";
import { useWallet } from "../wallet/WalletContext";
import { useJackpot } from "../jackpot/JackpotContext";
import { getCreditsForMatches } from "./getCreditsForMatches";
import { calculateWinnings } from "./calculateWinnings";
import { useRevealAnimation } from "./useRevealAnimation";
import { shouldAwardTicket } from "./walletAwardUtils";
import { useJackpotHandlers } from "./useJackpotHandlers";
import { useResultBar } from "./useResultBar";

// === new hooks and constants extracted ===
import {
  SETS_COUNT,
  SET_SIZE,
  SETS_PER_CYCLE,
  REVEAL_TOTAL_NUMBERS,
  REVEAL_DURATION_SEC,
  REVEAL_PER_NUMBER_SEC,
} from "./drawConstants";
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

const DrawEngineContext = createContext<DrawEngineContextType | undefined>(
  undefined
);

export function DrawEngineProvider({ children }: { children: React.ReactNode }) {
  const { state, cycleIndex } = useTimer();
  const wallet = useWallet();
  const jackpotContext = useJackpot();

  // Add a ref to keep track of last processed cycleIndex for result logic
  const resultAwardedForCycle = useRef<number | null>(null);

  // Modular constants and hooks
  const sets = useDrawSets();
  const { lastPickedPerCycle, picked } = useTicketSelectionManager(cycleIndex);

  const {
    resultBar,
    showResultBar,
    triggerResultBar,
    cleanup: cleanupResultBarTimeout,
    setResultBar,
  } = useResultBar({ show: false, credits: null }, 5000);

  // Reveal animation logic: always use last picked per cycle if available
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
  } = useRevealAnimation(
    sets,
    SETS_PER_CYCLE,
    SET_SIZE,
    confirmedUserNumbers
  );

  // Ticket commit/confirmation and pending tracking
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

  // === FIX: Trigger reveal when entering REVEAL state ===
  React.useEffect(() => {
    if (state === "REVEAL") {
      startReveal(cycleIndex);
    }
    // Optionally, cleanup reveal timeouts when leaving REVEAL state:
    if (state !== "REVEAL") {
      cleanupRevealTimeouts();
    }
    // eslint-disable-next-line
  }, [state, cycleIndex]);

  // On demo reset, also reset committed-cycle tracking so tickets get allowed/incremented on new demo start
  useEffect(() => {
    if (cycleIndex === 0) {
      console.log("[DrawEngineContext] Demo RESET: all ticket counts reset");
    }
    // Reset awarded flag on game reset:
    resultAwardedForCycle.current = null;
  }, [cycleIndex]);

  // On REVEAL DONE, process credits logic -- but only once per cycle!
  useEffect(() => {
    if (
      isRevealDone &&
      cycleIndex !== null &&
      resultAwardedForCycle.current !== cycleIndex
    ) {
      // Only process once for this cycle
      resultAwardedForCycle.current = cycleIndex;

      const startSet = cycleIndex * SETS_PER_CYCLE;
      const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);

      let userNumbers: number[] = [];
      if (
        lastPickedPerCycle[cycleIndex] &&
        lastPickedPerCycle[cycleIndex].length === 6
      ) {
        userNumbers = lastPickedPerCycle[cycleIndex];
      } else if (
        pendingTicketRef.current &&
        pendingTicketRef.current.cycle === cycleIndex &&
        pendingTicketRef.current.ticket.numbers.length === 6
      ) {
        userNumbers = pendingTicketRef.current.ticket.numbers;
      }

      // ONCE PER CYCLE, only now DEDUCT CREDITS and add ticket
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
      }

      // Calculate and award winnings
      const { jackpotWon, rowWinnings, totalWinnings, resultType } =
        calculateWinnings(userNumbers, activeSets, jackpotContext.jackpot);

      if (userNumbers.length === 6 && ticketWasEntered) {
        if (jackpotWon) {
          wallet.awardTicketWinnings(activeSets, [0, 0, 0], totalWinnings);
          jackpotContext.resetJackpot();
        } else {
          wallet.awardTicketWinnings(activeSets, rowWinnings, totalWinnings);
        }
      }

      showResultBar(
        resultType === "jackpot"
          ? jackpotContext.jackpot
          : totalWinnings
      );
    }
    return () => {
      cleanupResultBarTimeout();
    };
    // eslint-disable-next-line
  }, [
    isRevealDone,
    cycleIndex,
    sets,
    wallet,
    jackpotContext,
    lastPickedPerCycle,
    pendingTicketRef,
    SETS_PER_CYCLE,
    SET_SIZE,
    showResultBar,
    cleanupResultBarTimeout
  ]);

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
  if (!ctx)
    throw new Error("useDrawEngine must be used within DrawEngineProvider");
  return ctx;
}
