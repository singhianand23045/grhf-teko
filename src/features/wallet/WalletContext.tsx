
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
};

type WalletContextType = {
  balance: number;
  history: TicketType[];
  addConfirmedTicket: (ticket: Omit<TicketType, "id" | "creditChange" | "matches">) => void;
  awardTicketWinnings: (cycleRows: number[][], rowWinnings: number[], totalWinnings: number) => void;
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
  }, [balance, history]);

  // Step 1: Confirmation deducts credits and records ticket
  function addConfirmedTicket(ticketCore: Omit<TicketType, "id" | "creditChange" | "matches">) {
    const newTicket: TicketType = {
      ...ticketCore,
      id: Math.random().toString(36).slice(2) + Date.now(),
      matches: 0,
      creditChange: -30,
    };
    setBalance(prev => {
      const newBal = prev - 30;
      console.log("[WalletContext] Deducting 30 credits. Old:", prev, "New:", newBal);
      return newBal;
    });
    setHistory(prev => {
      const updated = [newTicket, ...prev];
      console.log("[WalletContext] Confirmed ticket & deducted:", newTicket);
      return updated;
    });
  }

  /**
   * Step 2: Award winnings by updating most recent pending ticket, if eligible.
   * This function synchronizes updates to history and balance, ensuring both are in sync WITHOUT relying on setTimeout or batching.
   */
  function awardTicketWinnings(cycleRows: number[][], rowWinnings: number[], totalWinnings: number) {
    setHistory(prevHistory => {
      if (!prevHistory.length) return prevHistory;
      const idx = prevHistory.findIndex(
        (t) => t.matches === 0 && t.creditChange === -30
      );
      if (idx === -1) {
        console.log("[WalletContext] No pending ticket found for awarding, skipping.");
        return prevHistory;
      }
      const ticketToAward = prevHistory[idx];

      // For display/history: count total matched numbers (across all rows)
      let totalMatches = 0;
      if (cycleRows.length === 3) {
        for (let i = 0; i < 3; i++) {
          totalMatches += cycleRows[i].filter((n) => ticketToAward.numbers.includes(n)).length;
        }
      }

      const updatedTicket: TicketType = {
        ...ticketToAward,
        matches: totalMatches,
        creditChange: -30 + totalWinnings,
      };

      const updatedHistory = [...prevHistory];
      updatedHistory[idx] = updatedTicket;

      // --- Synchronize balance ---
      setBalance((prevBal) => {
        // Previous deduction already applied at confirmation.
        // Here we only add winnings (if any) to current balance.
        const newBal = prevBal + totalWinnings;
        console.log("[WalletContext] Awarding winnings:", totalWinnings, "Old balance:", prevBal, "New balance:", newBal);
        return newBal;
      });

      console.log("[WalletContext] Awarded payout for ticket:", updatedTicket, "rowWinnings:", rowWinnings, "totalWinnings:", totalWinnings);
      return updatedHistory;
    });
  }

  function resetWallet() {
    setBalance(STARTING_BALANCE);
    setHistory([]);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ balance: STARTING_BALANCE, history: [] }));
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

// ... (no changes below)
