
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { generateDrawSets } from "./numberPool";

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
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);
  
  // Generate 6 sets of 6 numbers, once per session
  const setsRef = useRef<number[][] | null>(null);
  if (!setsRef.current) {
    setsRef.current = generateDrawSets();
  }
  const sets = setsRef.current; // Array< [6 numbers], ... > length 6

  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const revealStartedForCycle = useRef<number | null>(null);

  // Reveal logic: sequentially unveil numbers over revealDurationSec.
  const startReveal = (cycle: number, revealDurationSec: number) => {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    // cycle 0: sets 0‒2, cycle 1: sets 3‒5
    const startSet = cycle * SETS_PER_CYCLE;
    const activeSets = sets.slice(startSet, startSet + SETS_PER_CYCLE);
    // Flatten the active sets
    const poolSlice = activeSets.flat();
    setDrawnNumbers([]);
    setIsRevealDone(false);

    const perNumber = revealDurationSec / poolSlice.length;
    for (let i = 0; i < poolSlice.length; i++) {
      revealTimeouts.current.push(
        setTimeout(() => {
          setDrawnNumbers((prev) => [...prev, poolSlice[i]]);
          if (i === poolSlice.length - 1) setIsRevealDone(true);
        }, perNumber * 1000 * i)
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
    if (state !== "REVEAL") {
      revealTimeouts.current.forEach(clearTimeout);
      revealTimeouts.current = [];
      setDrawnNumbers([]);
      setIsRevealDone(false);
      revealStartedForCycle.current = null;
      return;
    }
    const revealDurationSec = 45;
    startReveal(cycleIndex, revealDurationSec);

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && state === "REVEAL" && drawnNumbers.length < SETS_PER_CYCLE * SET_SIZE) {
        instantlyFinishReveal();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      revealTimeouts.current.forEach(clearTimeout);
      revealTimeouts.current = [];
    };
    // eslint-disable-next-line
  }, [state, cycleIndex]);

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
