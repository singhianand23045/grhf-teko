import React, { createContext, useContext, useEffect, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { useWallet } from "../wallet/WalletContext"; // Import useWallet

type NumberSelectionContextType = {
  picked: number[];
  setPicked: (cb: (prev: number[]) => number[]) => void;
  isConfirmed: boolean; // Refers to the *current* selection being confirmed
  confirmedTickets: number[][]; // New: Stores all confirmed tickets for the current cycle
  confirmedCycle: number | null;
  confirm: () => void;
  reset: () => void;
  canPick: boolean;
  canConfirm: boolean;
  startNewTicketSelection: () => void; // New: To clear current pick and allow new selection
};

const NumberSelectionContext = createContext<NumberSelectionContextType | undefined>(undefined);

export function NumberSelectionProvider({ children }: { children: React.ReactNode }) {
  const { state: timerState, cycleIndex } = useTimer();
  const wallet = useWallet(); // Use wallet context
  const [picked, setPickedState] = useState<number[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false); // Refers to the *current* selection
  const [confirmedTickets, setConfirmedTickets] = useState<number[][]>([]); // Stores all confirmed tickets
  const [confirmedCycle, setConfirmedCycle] = useState<number | null>(null);
  const prevCycleRef = React.useRef(cycleIndex);

  // Reset selection and confirmed tickets on new timer cycle
  useEffect(() => {
    if (prevCycleRef.current !== cycleIndex) {
      setPickedState([]);
      setIsConfirmed(false);
      setConfirmedTickets([]); // Clear all confirmed tickets for the new cycle
      setConfirmedCycle(null);
      prevCycleRef.current = cycleIndex;
    }
  }, [cycleIndex]);

  function setPicked(fn: (prev: number[]) => number[]) {
    setPickedState(prev => {
      if (isConfirmed) return prev; // Cannot change if current selection is confirmed
      return fn(prev);
    });
  }

  function confirm() {
    // Only allow confirmation if 6 numbers are picked, in OPEN state, and not already confirmed
    // Also, ensure we haven't reached the max number of tickets
    if (
      picked.length === 6 &&
      timerState === "OPEN" &&
      !isConfirmed &&
      confirmedTickets.length < 3 // Max 3 tickets
    ) {
      // Add the current picked numbers to the list of confirmed tickets
      const newTicketNumbers = picked.slice().sort((a, b) => a - b);
      setConfirmedTickets(prev => [...prev, newTicketNumbers]);

      // Deduct credits and record ticket in wallet history
      wallet.addConfirmedTicket({
        date: new Date().toISOString(),
        numbers: newTicketNumbers,
        cycle: cycleIndex,
      });

      // Reset current selection state to allow for a new pick
      setPickedState([]);
      setIsConfirmed(true); // Mark current selection as confirmed (even though it's cleared)
      setConfirmedCycle(cycleIndex);
    }
  }

  function reset() {
    setPickedState([]);
    setIsConfirmed(false);
    setConfirmedTickets([]);
    setConfirmedCycle(null);
  }

  function startNewTicketSelection() {
    setPickedState([]); // Clear current picked numbers
    setIsConfirmed(false); // Allow new selection
  }

  // Can pick if in OPEN state, and current selection is not confirmed, and less than 3 tickets confirmed
  const canPick = timerState === "OPEN" && !isConfirmed && confirmedTickets.length < 3;
  // Can confirm if 6 numbers are picked, in OPEN state, current selection not confirmed, and less than 3 tickets confirmed
  const canConfirm = timerState === "OPEN" && picked.length === 6 && !isConfirmed && confirmedTickets.length < 3;

  // Debugging: Log whenever relevant state changes
  React.useEffect(() => {
    console.log("[NumberSelectionProvider] Picked:", picked, "isConfirmed (current):", isConfirmed, "Confirmed Tickets:", confirmedTickets, "timerState:", timerState, "cycleIndex:", cycleIndex);
  }, [picked, isConfirmed, confirmedTickets, timerState, cycleIndex]);

  return (
    <NumberSelectionContext.Provider
      value={{
        picked,
        setPicked,
        isConfirmed,
        confirmedTickets, // Provide confirmedTickets
        confirmedCycle,
        confirm,
        reset,
        canPick,
        canConfirm,
        startNewTicketSelection, // Provide new function
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