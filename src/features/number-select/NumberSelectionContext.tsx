import React, { createContext, useContext, useEffect, useState } from "react";
import { useTimer } from "../timer/timer-context";
import { useWallet } from "../wallet/WalletContext"; // Import useWallet

type NumberSelectionContextType = {
  picked: number[];
  setPicked: (cb: (prev: number[]) => number[]) => void;
  isCurrentSelectionLocked: boolean; // Renamed from isConfirmed
  confirmedTickets: number[][]; // New: Stores all confirmed tickets for the current cycle
  confirmedCycle: number | null;
  confirm: () => void;
  reset: () => void;
  canPick: boolean;
  canConfirm: boolean;
  startNewTicketSelection: () => void; // New: To clear current pick and allow new selection
  isAddingNewTicket: boolean; // New: Tracks if user is actively adding a new ticket
};

const NumberSelectionContext = createContext<NumberSelectionContextType | undefined>(undefined);

export function NumberSelectionProvider({ children }: { children: React.ReactNode }) {
  const { state: timerState, cycleIndex } = useTimer();
  const wallet = useWallet(); // Use wallet context
  const [picked, setPickedState] = useState<number[]>([]);
  const [isCurrentSelectionLocked, setIsCurrentSelectionLocked] = useState(false); // Renamed
  const [confirmedTickets, setConfirmedTickets] = useState<number[][]>([]); // Stores all confirmed tickets
  const [confirmedCycle, setConfirmedCycle] = useState<number | null>(null);
  const [isAddingNewTicket, setIsAddingNewTicket] = useState(false); // New state
  const prevCycleRef = React.useRef(cycleIndex);

  // Reset selection and confirmed tickets on new timer cycle
  useEffect(() => {
    if (prevCycleRef.current !== cycleIndex) {
      setPickedState([]);
      setIsCurrentSelectionLocked(false); // Reset lock
      setConfirmedTickets([]);
      setConfirmedCycle(null);
      setIsAddingNewTicket(false); // Reset on new cycle
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
    // Also, ensure we haven't reached the max number of tickets
    if (
      picked.length === 6 &&
      timerState === "OPEN" &&
      !isCurrentSelectionLocked && // Use new name
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

      setPickedState([]); // Clear picked numbers for the next selection
      setIsCurrentSelectionLocked(false); // IMPORTANT: Unlock for next selection
      setConfirmedCycle(cycleIndex);
      setIsAddingNewTicket(false); // Set to false after confirming a ticket
    }
  }

  function reset() {
    setPickedState([]);
    setIsCurrentSelectionLocked(false);
    setConfirmedTickets([]);
    setConfirmedCycle(null);
    setIsAddingNewTicket(false);
  }

  function startNewTicketSelection() {
    setPickedState([]); // Clear current picked numbers
    setIsCurrentSelectionLocked(false); // Ensure it's unlocked
    setIsAddingNewTicket(true); // Set to true when user clicks "Add next ticket"
  }

  // Can pick if in OPEN state, and current selection is not locked, and (user is adding new ticket OR no tickets confirmed yet)
  const canPick = timerState === "OPEN" && !isCurrentSelectionLocked && (isAddingNewTicket || confirmedTickets.length === 0);
  // Can confirm if 6 numbers are picked, in OPEN state, current selection not locked, and (user is adding new ticket OR no tickets confirmed yet)
  const canConfirm = timerState === "OPEN" && picked.length === 6 && !isCurrentSelectionLocked && (isAddingNewTicket || confirmedTickets.length === 0);

  // Debugging: Log whenever relevant state changes
  React.useEffect(() => {
    console.log("[NumberSelectionProvider] Picked:", picked, "isCurrentSelectionLocked:", isCurrentSelectionLocked, "Confirmed Tickets:", confirmedTickets, "timerState:", timerState, "cycleIndex:", cycleIndex, "isAddingNewTicket:", isAddingNewTicket);
  }, [picked, isCurrentSelectionLocked, confirmedTickets, timerState, cycleIndex, isAddingNewTicket]);

  return (
    <NumberSelectionContext.Provider
      value={{
        picked,
        setPicked,
        isCurrentSelectionLocked, // Provide new name
        confirmedTickets,
        confirmedCycle,
        confirm,
        reset,
        canPick,
        canConfirm,
        startNewTicketSelection,
        isAddingNewTicket, // Provide new state
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