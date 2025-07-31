import React, { createContext, useContext, useEffect, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { useWallet } from "../wallet/WalletContext"; // Import useWallet

type NumberSelectionContextType = {
  picked: number[];
  setPicked: (cb: (prev: number[]) => number[]) => void;
  isCurrentSelectionLocked: boolean; // Renamed from isConfirmed
  confirmedPicksSets: number[][]; // New: Stores all confirmed pick sets for the current cycle
  confirmedCycle: number | null;
  confirm: () => void;
  reset: () => void;
  canPick: boolean;
  canConfirm: boolean;
  startNewPickSetSelection: () => void; // New: To clear current pick and allow new selection
  isAddingNewPickSet: boolean; // New: Tracks if user is actively adding a new pick set
};

const NumberSelectionContext = createContext<NumberSelectionContextType | undefined>(undefined);

export function NumberSelectionProvider({ children }: { children: React.ReactNode }) {
  const { state: timerState, cycleIndex } = useTimer();
  const wallet = useWallet(); // Use wallet context
  const [picked, setPickedState] = useState<number[]>([]);
  const [isCurrentSelectionLocked, setIsCurrentSelectionLocked] = useState(false); // Renamed
  const [confirmedPicksSets, setConfirmedPicksSets] = useState<number[][]>([]); // Stores all confirmed pick sets
  const [confirmedCycle, setConfirmedCycle] = useState<number | null>(null);
  const [isAddingNewPickSet, setIsAddingNewPickSet] = useState(false); // New state
  const prevCycleRef = React.useRef(cycleIndex);

  // Reset selection and confirmed pick sets on new timer cycle
  useEffect(() => {
    if (prevCycleRef.current !== cycleIndex) {
      setPickedState([]);
      setIsCurrentSelectionLocked(false); // Reset lock
      setConfirmedPicksSets([]);
      setConfirmedCycle(null);
      setIsAddingNewPickSet(false); // Reset on new cycle
      prevCycleRef.current = cycleIndex;
    }
  }, [cycleIndex]);

  function setPicked(fn: (prev: number[]) => number[]) {
    setPickedState(prev => {
      if (isCurrentSelectionLocked) return prev; // Cannot change if locked
      return fn(prev);
    });
  }

  function confirm() {
    // Only allow confirmation if 6 numbers are picked, in OPEN state, and not already locked
    // Also, ensure we haven't reached the max number of pick sets
    if (
      picked.length === 6 &&
      timerState === "OPEN" &&
      !isCurrentSelectionLocked && // Use new name
      confirmedPicksSets.length < 3 // Max 3 pick sets
    ) {
      // Add the current picked numbers to the list of confirmed pick sets
      const newPickSetNumbers = picked.slice().sort((a, b) => a - b);
      setConfirmedPicksSets(prev => [...prev, newPickSetNumbers]);

      // Deduct credits and record entry in wallet history
      wallet.addConfirmedEntry({
        date: new Date().toISOString(),
        numbers: newPickSetNumbers,
        cycle: cycleIndex,
      });

      setPickedState([]); // Clear picked numbers for the next selection
      setIsCurrentSelectionLocked(false); // IMPORTANT: Unlock for next selection
      setConfirmedCycle(cycleIndex);
      setIsAddingNewPickSet(false); // Set to false after confirming a pick set
    }
  }

  function reset() {
    setPickedState([]);
    setIsCurrentSelectionLocked(false);
    setConfirmedPicksSets([]);
    setConfirmedCycle(null);
    setIsAddingNewPickSet(false);
  }

  function startNewPickSetSelection() {
    setPickedState([]); // Clear current picked numbers
    setIsCurrentSelectionLocked(false); // Ensure it's unlocked
    setIsAddingNewPickSet(true); // Set to true when user clicks "Add next set of numbers"
  }

  // Can pick if in OPEN state, and current selection is not locked, and (user is adding new pick set OR no pick sets confirmed yet)
  const canPick = timerState === "OPEN" && !isCurrentSelectionLocked && (isAddingNewPickSet || confirmedPicksSets.length === 0);
  // Can confirm if 6 numbers are picked, in OPEN state, current selection not locked, and (user is adding new pick set OR no pick sets confirmed yet)
  const canConfirm = timerState === "OPEN" && picked.length === 6 && !isCurrentSelectionLocked && (isAddingNewPickSet || confirmedPicksSets.length === 0);

  // Debugging: Log whenever relevant state changes
  React.useEffect(() => {
    console.log("[NumberSelectionProvider] Picked:", picked, "isCurrentSelectionLocked:", isCurrentSelectionLocked, "Confirmed Pick Sets:", confirmedPicksSets, "timerState:", timerState, "cycleIndex:", cycleIndex, "isAddingNewPickSet:", isAddingNewPickSet);
  }, [picked, isCurrentSelectionLocked, confirmedPicksSets, timerState, cycleIndex, isAddingNewPickSet]);

  return (
    <NumberSelectionContext.Provider
      value={{
        picked,
        setPicked,
        isCurrentSelectionLocked, // Provide new name
        confirmedPicksSets,
        confirmedCycle,
        confirm,
        reset,
        canPick,
        canConfirm,
        startNewPickSetSelection,
        isAddingNewPickSet, // Provide new state
      }}
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