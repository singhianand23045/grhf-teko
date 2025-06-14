
import React, { createContext, useContext, useEffect, useState } from "react";
import { useTimer } from "../timer/timer-context";

type NumberSelectionContextType = {
  picked: number[];
  setPicked: (cb: (prev: number[]) => number[]) => void;
  isConfirmed: boolean;
  confirm: () => void;
  reset: () => void;
  canPick: boolean;
  canConfirm: boolean;
};

const NumberSelectionContext = createContext<NumberSelectionContextType | undefined>(undefined);

export function NumberSelectionProvider({ children }: { children: React.ReactNode }) {
  const { state: timerState, cycleIndex } = useTimer();
  const [picked, setPickedState] = useState<number[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const prevCycleRef = React.useRef(cycleIndex);

  // Reset selection on new timer cycle
  useEffect(() => {
    if (prevCycleRef.current !== cycleIndex) {
      setPickedState([]);
      setIsConfirmed(false);
      prevCycleRef.current = cycleIndex;
    }
  }, [cycleIndex]);

  function setPicked(fn: (prev: number[]) => number[]) {
    setPickedState(prev => {
      if (isConfirmed) return prev;
      return fn(prev);
    });
  }

  function confirm() {
    if (picked.length === 6 && timerState === "OPEN" && !isConfirmed) {
      setIsConfirmed(true);
    }
  }

  function reset() {
    setPickedState([]);
    setIsConfirmed(false);
  }

  const canPick = timerState === "OPEN" && !isConfirmed;
  const canConfirm = timerState === "OPEN" && picked.length === 6 && !isConfirmed;

  // Debugging: Log whenever picked changes
  React.useEffect(() => {
    console.log("[NumberSelectionProvider] Picked numbers:", picked, "isConfirmed:", isConfirmed, "timerState:", timerState, "cycleIndex:", cycleIndex);
  }, [picked, isConfirmed, timerState, cycleIndex]);

  return (
    <NumberSelectionContext.Provider
      value={{ picked, setPicked, isConfirmed, confirm, reset, canPick, canConfirm }}
    >
      {children}
    </NumberSelectionContext.Provider>
  );
}

export function useNumberSelection() {
  const ctx = useContext(NumberSelectionContext);
  if (!ctx) throw new Error("useNumberSelection must be used within NumberSelectionProvider");
  return ctx;
}
