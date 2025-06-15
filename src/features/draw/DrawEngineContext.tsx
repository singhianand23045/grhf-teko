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
import { SETS_COUNT, SET_SIZE, SETS_PER_CYCLE } from "./drawConstants";
import { useDrawSets } from "./useDrawSets";
import { useTicketSelectionManager } from "./useTicketSelectionManager";

interface DrawEngineContextType {
  drawnNumbers: number[];
  isRevealDone: boolean;
  startReveal: (cycleIndex: number, revealDurationSec: number) => void;
  instantlyFinishReveal: () => void;
  sets: number[][];
  revealResult: { show: boolean; credits: number | null };
  triggerResultBar: () => void;
}

// === Helper Functions for Effect Extraction ===

// Ticket commit logic extracted from useEffect
function commitTicketForCycle({
  picked,
  cycleIndex,
  wallet,
  incrementTicketCountForCycle,
  ticketCommittedCycle,
  lastPickedPerCycle,
}: {
  picked: number[],
  cycleIndex: number,
  wallet: ReturnType<typeof useWallet>,
  incrementTicketCountForCycle: (cycle: number, debugSource?: string) => void,
  ticketCommittedCycle: React.MutableRefObject<number | null>,
  lastPickedPerCycle: { [cycle: number]: number[] },
}) {
  wallet.addConfirmedTicket({
    date: new Date().toISOString(),
    numbers: picked.slice(),
  });
  incrementTicketCountForCycle(cycleIndex, "picked-confirm");
  ticketCommittedCycle.current = cycleIndex;
  lastPickedPerCycle[cycleIndex] = picked.slice();
  console.log("[DrawEngineContext] Committed ticket for cycle", cycleIndex, picked, ", ticketCommittedCycle now:", ticketCommittedCycle.current);
}

// Demo reset logic extracted from useEffect
function resetDemoCycleStats({
  ticketCommittedCycle,
  cycleTicketCountRef,
}: {
  ticketCommittedCycle: React.MutableRefObject<number | null>,
  cycleTicketCountRef: React.MutableRefObject<{ [cycle: number]: number }>,
}) {
  ticketCommittedCycle.current = null;
  cycleTicketCountRef.current = {};
  console.log("[DrawEngineContext] Demo RESET: ticketCommittedCycle and all ticket counts reset");
}

const DrawEngineContext = createContext<DrawEngineContextType | undefined>(undefined);

export function DrawEngineProvider({ children }: { children: React.ReactNode }) {
  const { state, cycleIndex } = useTimer();
  const wallet = useWallet();
  const jackpotContext = useJackpot();

  // --- Modular constants and hooks ---
  const sets = useDrawSets(); // replaces setsRef logic
  const { lastPickedPerCycle, ticketCommittedCycle, picked } = useTicketSelectionManager(cycleIndex);

  // Count of tickets per cycle (for jackpot add/reset logic)
  const cycleTicketCountRef = useRef<{ [cycle: number]: number }>({});

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

  // On demo reset, also reset committed-cycle tracking so that tickets get allowed/incremented on new demo start
  useEffect(() => {
    if (cycleIndex === 0) {
      resetDemoCycleStats({ ticketCommittedCycle, cycleTicketCountRef });
    }
  }, [cycleIndex]);

  // PHASE 1: On ticket confirmation, deduct credits but don't increment jackpot yet
  useEffect(() => {
    if (
      picked.length === 6 &&
      ticketCommittedCycle.current !== cycleIndex
    ) {
      commitTicketForCycle({
        picked,
        cycleIndex,
        wallet,
        incrementTicketCountForCycle,
        ticketCommittedCycle,
        lastPickedPerCycle,
      });
    } else {
      console.log(`[DrawEngineContext] Not committing ticket (picked.length: ${picked.length}, cycleIndex: ${cycleIndex}, ticketCommittedCycle: ${ticketCommittedCycle.current})`);
    }
    // eslint-disable-next-line
  }, [picked, cycleIndex, wallet, jackpotContext]);

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
