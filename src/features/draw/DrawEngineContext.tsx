
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTimer } from "../timer/timer-context";

// The master number pool (could be generated/shuffled -- here we fix it for demo)
const NUMBER_POOL = Array.from({ length: 54 }, (_, i) => i + 1); // 54 numbers for 2 cycles (2*18=36, but can make it longer for future proof)

interface DrawEngineContextType {
  drawnNumbers: number[];
  isRevealDone: boolean;
  startReveal: (cycleIndex: number, revealDurationSec: number) => void;
  instantlyFinishReveal: () => void;
}

const DrawEngineContext = createContext<DrawEngineContextType | undefined>(undefined);

export function DrawEngineProvider({ children }: { children: React.ReactNode }) {
  const { state, cycleIndex } = useTimer();
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isRevealDone, setIsRevealDone] = useState(false);

  const revealTimeouts = useRef<NodeJS.Timeout[]>([]);
  const revealStartedForCycle = useRef<number | null>(null);

  // Reveal logic: sequentially unveil numbers over revealDurationSec.
  const startReveal = (cycle: number, revealDurationSec: number) => {
    // Clean up previous reveals before starting a new one
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];

    const offset = cycle * 18;
    const poolSlice = NUMBER_POOL.slice(offset, offset + 18);
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
    // Mark that reveal logic is underway for this cycle.
    revealStartedForCycle.current = cycle;
  };

  // Instantly reveal all for current cycle
  const instantlyFinishReveal = () => {
    revealTimeouts.current.forEach(clearTimeout);
    revealTimeouts.current = [];
    // Use revealed cycle (if exists) or fallback to latest cycleIndex
    const cycle = revealStartedForCycle.current ?? cycleIndex;
    const offset = cycle * 18;
    setDrawnNumbers(NUMBER_POOL.slice(offset, offset + 18));
    setIsRevealDone(true);
  };

  // Respond to timer -> REVEAL state change
  useEffect(() => {
    if (state !== "REVEAL") {
      // not revealing: reset drawn numbers, timers
      revealTimeouts.current.forEach(clearTimeout);
      revealTimeouts.current = [];
      setDrawnNumbers([]);
      setIsRevealDone(false);
      revealStartedForCycle.current = null;
      return;
    }
    // How long is the reveal phase? (tied to your timer spec: CUT_OFF_END = 45s, so reveal is from 45..0 = 45 sec)
    const revealDurationSec = 45;
    startReveal(cycleIndex, revealDurationSec);

    // Listen for tab visibility changes
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
