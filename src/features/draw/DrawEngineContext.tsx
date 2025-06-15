
import React, { createContext, useContext } from "react";
import { useTimer } from "../timer/timer-context";
import { useWallet } from "../wallet/WalletContext";
import { useJackpot } from "../jackpot/JackpotContext";
import { useDrawSets } from "./useDrawSets";
import { useTicketSelectionManager } from "./useTicketSelectionManager";
import { useTicketCommitManager } from "./useTicketCommitManager";
import { useResultBar } from "./useResultBar";
import { useRevealAnimation } from "./useRevealAnimation";
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

  const resultBarTimeoutMs = 5000;
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
  } = useRevealAnimation(
    sets,
    SETS_PER_CYCLE,
    SET_SIZE,
    confirmedUserNumbers
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
  });

  // ResultBar phase visibility/cleanup
  useResultBarVisibility({
    state,
    cycleIndex,
    resultBar,
    hideResultBar
  });

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
