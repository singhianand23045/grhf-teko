
import React, { createContext, useContext, useEffect } from "react";
import { useTimer } from "../timer/timer-context";
import { useWallet } from "../wallet/WalletContext";
import { useJackpot } from "../jackpot/JackpotContext";
import { useDrawSets } from "./useDrawSets";
import { useTicketSelectionManager } from "./useTicketSelectionManager";
import { useTicketCommitManager } from "./useTicketCommitManager";
import { useResultBar } from "./useResultBar";
import { useRevealAnimation } from "./useRevealAnimation";
import { useJackpotHandlers } from "./useJackpotHandlers";
import { 
  SETS_PER_CYCLE, 
  SET_SIZE 
} from "./drawConstants";

// New hooks for separate logic
import { useDrawPrizes } from "./useDrawPrizes";
import { useResultBarVisibility } from "./useResultBarVisibility";

interface DrawEngineContextType {
  drawnNumbers: number[];
  isRevealDone: boolean;
  startReveal: (cycleIndex: number, revealDurationSec?: number) => void;
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
  const sets = useDrawSets();
  const { lastPickedPerCycle, picked } = useTicketSelectionManager(cycleIndex);

  const resultBarTimeoutMs = 10000;
  const {
    resultBar,
    showResultBar,
    triggerResultBar,
    cleanup: cleanupResultBarTimeout,
    setResultBar,
    hideResultBar,
  } = useResultBar({ show: false, credits: null }, resultBarTimeoutMs);

  // Reveal animation
  const confirmedUserNumbers =
    lastPickedPerCycle[cycleIndex] && lastPickedPerCycle[cycleIndex].length === 6
      ? lastPickedPerCycle[cycleIndex]
      : picked;

  const {
    drawnNumbers,
    isRevealDone,
    startReveal: _startReveal,
    instantlyFinishReveal: _instantlyFinishReveal,
    cleanupRevealTimeouts,
    revealStartedForCycle // <- needed to avoid retrigger
  } = useRevealAnimation(
    sets,
    SETS_PER_CYCLE,
    SET_SIZE,
    confirmedUserNumbers,
    cycleIndex // Pass cycleIndex to reset state on cycle changes
  );

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

  // Jackpot handlers - increment jackpot when cycle advances with valid tickets
  useJackpotHandlers(cycleIndex, lastPickedPerCycle);

  // Prize and awarding logic
  useDrawPrizes({
    isRevealDone,
    cycleIndex,
    sets,
    SETS_PER_CYCLE,
    SET_SIZE,
    lastPickedPerCycle,
    picked,
    wallet,
    jackpotContext,
    showResultBar,
    cleanupResultBarTimeout,
    pendingTicketRef,
    revealStartedForCycle, // Pass the ref to ensure reveal started
  });

  // ResultBar phase visibility/cleanup
  useResultBarVisibility({
    state,
    cycleIndex,
    resultBar,
    hideResultBar
  });

  // ---- FIX: Trigger startReveal when state transitions to "REVEAL" ----
  useEffect(() => {
    if (state === "REVEAL" && revealStartedForCycle.current !== cycleIndex) {
      _startReveal(cycleIndex);
    }
    // eslint-disable-next-line
  }, [state, cycleIndex]);
  // ----

  const startReveal = (cycleIdx: number) => {
    _startReveal(cycleIdx);
  };
  const instantlyFinishReveal = () => {
    _instantlyFinishReveal(cycleIndex);
  };

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
