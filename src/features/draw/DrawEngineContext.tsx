import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { generateSecureShuffle } from "./numberPool";

// The master number pool (could be generated/shuffled -- here we fix it for demo)
// const NUMBER_POOL = Array.from({ length: 54 }, (_, i) => i + 1);

const NUMBER_POOL_SIZE = 36;
const NUMBER_POOL_MAX = 54;

interface DrawEngineContextType {
  drawnNumbers: number[];
  isRevealDone: boolean;
  startReveal: (cycleIndex: number, revealDurationSec: number) => void;
  instantlyFinishReveal: () => void;
  numberPool: number[]; // Add for possible debugging or UI
}

const DrawEngineContext = createContext<DrawEngineContextType | undefined>(undefined);

export function DrawEngineProvider({ children }: { children: React.ReactNode }) {
  const { state, cycleIndex } = useTimer();
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);
  
  // Number pool initialized ONLY ONCE for the session
  const poolRef = useRef<number[] | null>(null);
  if (poolRef.current === null) {
    poolRef.current = generateSecureShuffle(NUMBER_POOL_SIZE, NUMBER_POOL_MAX);
  }
  const numberPool = poolRef.current;

  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const revealStartedForCycle = useRef<number | null>(null);

  // Reveal logic: sequentially unveil numbers over revealDurationSec.
  const startReveal = (cycle: number, revealDurationSec: number) => {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];

    const offset = cycle * 18;
    const poolSlice = numberPool.slice(offset, offset + 18);
    setDrawnNumbers([]);
    setIsRevealDone(false);

    const perNumber = revealDurationSec / 18;
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
    const offset = cycle * 18;
    setDrawnNumbers(numberPool.slice(offset, offset + 18));
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
      if (document.visibilityState === "visible" && state === "REVEAL" && drawnNumbers.length < 18) {
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
        numberPool,
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
