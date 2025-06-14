
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// PHASE 1 STATE MACHINE CONSTANTS
const LOOP_DURATION_SEC = 4 * 60; // 4 minutes
const CUT_OFF_START = 60; // 1:00 (starts at 1:00 ends at 0:46)
const CUT_OFF_END = 45; // 0:45 (ends at 0:45, reveal starts at 0:45)
const MAX_CYCLES = 2;

type TimerState = "OPEN" | "CUT_OFF" | "REVEAL" | "COMPLETE";
interface TimerContextType {
  state: TimerState;
  countdown: string; // "mm:ss"
  nextDrawTime: Date;
  cycleIndex: number;
  resetDemo: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

function getNextDrawAlignedTo4Min(now: Date) {
  const next = new Date(now);
  const m = next.getMinutes();
  // Next multiple of 4
  const nextMin = m - (m % 4) + 4;
  next.setMinutes(nextMin, 0, 0);
  if (next <= now) {
    next.setMinutes(next.getMinutes() + 4, 0, 0);
  }
  return next;
}

function formatCountdown(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [nextDrawTime, setNextDrawTime] = useState<Date>(() => getNextDrawAlignedTo4Min(new Date()));
  const [secondsLeft, setSecondsLeft] = useState<number>(() => Math.max(0, Math.round((getNextDrawAlignedTo4Min(new Date()).getTime() - Date.now()) / 1000)));
  const [cycleIndex, setCycleIndex] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state calculation
  let state: TimerState = "OPEN";
  if (cycleIndex >= MAX_CYCLES) state = "COMPLETE";
  else if (secondsLeft <= CUT_OFF_START && secondsLeft > CUT_OFF_END) state = "CUT_OFF";
  else if (secondsLeft <= CUT_OFF_END) state = "REVEAL";

  const resetDemo = () => {
    // restart at next multiple of 4 min
    const now = new Date();
    const next = getNextDrawAlignedTo4Min(now);
    setNextDrawTime(next);
    setSecondsLeft(Math.max(0, Math.round((next.getTime() - now.getTime()) / 1000)));
    setCycleIndex(0);
  };

  useEffect(() => {
    if (cycleIndex >= MAX_CYCLES) return; // stop timer at demo complete

    function tick() {
      const now = Date.now();
      const diffSec = Math.max(0, Math.round((nextDrawTime.getTime() - now) / 1000));
      setSecondsLeft(diffSec);

      if (diffSec === 0) {
        // Loop
        setTimeout(() => {
          setCycleIndex((i) => i + 1);
          if (cycleIndex + 1 < MAX_CYCLES) {
            const newNext = getNextDrawAlignedTo4Min(new Date());
            setNextDrawTime(newNext);
            setSecondsLeft(Math.max(0, Math.round((newNext.getTime() - Date.now()) / 1000)));
          }
        }, 0);
      }
    }

    intervalRef.current = setInterval(tick, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [nextDrawTime, cycleIndex]);

  return (
    <TimerContext.Provider
      value={{
        state,
        countdown: formatCountdown(secondsLeft),
        nextDrawTime,
        cycleIndex,
        resetDemo,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}
