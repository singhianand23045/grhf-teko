
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
  awardTicketWinnings: (cycleRows: number[][], rowWinnings: number[], totalWinnings: number, currentCycle: number) => void;
  resetWallet: () => void;
};

const LOCAL_STORAGE_KEY = "wallet";
const STARTING_BALANCE = 100;

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
   * Awards winnings for the FIRST unprocessed ticket from the specified cycle, and marks it as processed.
   */
  function awardTicketWinnings(cycleRows: number[][], rowWinnings: number[], totalWinnings: number, currentCycle: number) {
    setHistory(prevHistory => {
      if (!prevHistory.length) return prevHistory;
      
      // Find the FIRST unprocessed ticket for the current cycle
      const idx = prevHistory.findIndex(
        (t) => !t.processed && t.creditChange === -30 && t.cycle === currentCycle
      );
      
      if (idx === -1) {
        console.log("[WalletContext] No unprocessed ticket found for cycle", currentCycle, "skipping.");
        return prevHistory;
      }
      
      const ticketToAward = prevHistory[idx];

      let totalMatches = 0;
      if (cycleRows.length === 3) {
        for (let i = 0; i < 3; i++) {
          totalMatches += cycleRows[i].filter((n) => ticketToAward.numbers.includes(n)).length;
        }
      }

      // Update the ticket with matches, winnings, and mark as processed
      const updatedTicket: TicketType = {
        ...ticketToAward,
        matches: totalMatches,
        winnings: totalWinnings, // for display ONLY
        processed: true, // Mark as processed to prevent reuse
      };

      const updatedHistory = [...prevHistory];
      updatedHistory[idx] = updatedTicket;

      // Award winnings to balance (separate from ticket's creditChange)
      if (totalWinnings > 0) {
        setBalance((prevBal) => {
          const newBal = prevBal + totalWinnings;
          console.log("[WalletContext] Awarding winnings:", totalWinnings, "Old balance:", prevBal, "New balance:", newBal);
          return newBal;
        });
      } else {
        console.log("[WalletContext] No winnings to add. Balance remains unchanged.");
      }

      console.log("[WalletContext] Processed ticket for cycle", currentCycle, ":", updatedTicket, "rowWinnings:", rowWinnings, "totalWinnings:", totalWinnings, "Updated history:", updatedHistory);
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
