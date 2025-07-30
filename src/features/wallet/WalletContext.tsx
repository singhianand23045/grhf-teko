import React, { createContext, useContext, useEffect, useState } from "react";
import { getCreditsForMatches } from "../draw/getCreditsForMatches";

export type WalletType = {
  balance: number;
  history: TicketType[];
};

export type TicketType = {
  id: string;
  date: string;
  numbers: number[];
  matches: number;
  creditChange: number;
  winnings?: number; // <-- for display only
  processed?: boolean; // <-- to track if ticket has been processed for winnings
  cycle?: number; // <-- to track which cycle this ticket belongs to
};

type WalletContextType = {
  balance: number;
  history: TicketType[];
  addConfirmedTicket: (ticket: Omit<TicketType, "id" | "creditChange" | "matches" | "winnings" | "processed">) => void;
  awardTicketWinnings: (cycleRows: number[][], totalWinningsForCycle: number, currentCycle: number, jackpotWon: boolean) => void; // Updated signature
  resetWallet: () => void;
};

const LOCAL_STORAGE_KEY = "wallet";
const STARTING_BALANCE = 200;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function saveWalletToStorage(wallet: WalletType) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wallet));
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed.balance === "number") {
          return parsed.balance;
        }
      } catch {}
    }
    return STARTING_BALANCE;
  });
  const [history, setHistory] = useState<TicketType[]>(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed.history)) {
          return parsed.history;
        }
      } catch {}
    }
    return [];
  });

  // Save wallet state when either balance or history changes
  useEffect(() => {
    saveWalletToStorage({ balance, history });
    console.log("[WalletContext] useEffect saveWalletToStorage called. balance:", balance, "history:", history);
  }, [balance, history]);

  useEffect(() => {
    console.log("[WalletContext] Provider rendered with balance:", balance, "history:", history);
  });

  function addConfirmedTicket(ticketCore: Omit<TicketType, "id" | "creditChange" | "matches" | "winnings" | "processed">) {
    const newTicket: TicketType = {
      ...ticketCore,
      id: Math.random().toString(36).slice(2) + Date.now(),
      matches: 0,
      creditChange: -30, // Always -30 for ticket purchase
      winnings: 0,
      processed: false, // Mark as unprocessed initially
    };
    setBalance(prev => {
      const newBal = prev - 30;
      console.log("[WalletContext] Deducting 30 credits. Old:", prev, "New:", newBal);
      return newBal;
    });
    setHistory(prev => {
      const updated = [newTicket, ...prev];
      console.log("[WalletContext] Confirmed ticket & deducted:", newTicket, "Updated history:", updated);
      return updated;
    });
  }

  /**
   * Awards winnings for ALL unprocessed tickets from the specified cycle, and marks them as processed.
   * totalWinningsForCycle here is the SUM of winnings across all tickets for the cycle.
   */
  function awardTicketWinnings(cycleRows: number[][], totalWinningsForCycle: number, currentCycle: number, jackpotWon: boolean) {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.map(ticket => {
        if (!ticket.processed && ticket.creditChange === -30 && ticket.cycle === currentCycle) {
          // Calculate matches for this specific ticket against each drawn row
          let ticketMatches = 0;
          if (cycleRows.length === 3) {
            for (let i = 0; i < 3; i++) {
              ticketMatches += cycleRows[i].filter((n) => ticket.numbers.includes(n)).length;
            }
          }
          
          // If jackpot was won by ANY ticket in this cycle, this specific ticket gets 0 regular winnings
          // The totalWinningsForCycle passed from useDrawPrizes already accounts for jackpot vs regular.
          // Here, we just need to store the individual ticket's winnings for history.
          // For simplicity, if jackpotWon is true, this ticket's individual winnings are 0 (as per spec, only jackpot is awarded).
          // If not jackpot, then calculate based on matches.
          const individualTicketWinnings = jackpotWon ? 0 : getCreditsForMatches(ticketMatches);

          return {
            ...ticket,
            matches: ticketMatches,
            winnings: individualTicketWinnings, // Store individual ticket winnings for history
            processed: true, // Mark as processed
          };
        }
        return ticket;
      });

      // Award the total winnings to balance (only once per cycle, as calculated in useDrawPrizes)
      if (totalWinningsForCycle > 0) {
        setBalance((prevBal) => {
          const newBal = prevBal + totalWinningsForCycle;
          console.log("[WalletContext] Awarding total winnings for cycle:", totalWinningsForCycle, "Old balance:", prevBal, "New balance:", newBal);
          return newBal;
        });
      } else {
        console.log("[WalletContext] No total winnings to add for cycle. Balance remains unchanged.");
      }

      console.log("[WalletContext] Processed all tickets for cycle", currentCycle, ". Total awarded:", totalWinningsForCycle, "Updated history:", updatedHistory);
      return updatedHistory;
    });
  }

  function resetWallet() {
    setBalance(STARTING_BALANCE);
    setHistory([]);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ balance: STARTING_BALANCE, history: [] }));
    console.log("[WalletContext] resetWallet called, set balance/history to starting values.");
  }

  return (
    <WalletContext.Provider value={{ balance, history, addConfirmedTicket, awardTicketWinnings, resetWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}