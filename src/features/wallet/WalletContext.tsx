import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { getCreditsForMatches } from "../draw/getCreditsForMatches";

// Types
export type WalletType = {
  balance: number;
  history: TicketType[];
};

export type TicketType = {
  id: string;            // unique
  date: string;          // ISO string
  numbers: number[];     // picked ticket numbers
  matches: number;       // 0-6
  creditChange: number;  // -10 + payout (so: could be 990, 90, 30, 10, 0, -10)
};

type WalletContextType = {
  balance: number;
  history: TicketType[];
  addConfirmedTicket: (ticket: Omit<TicketType, "id" | "creditChange" | "matches">) => void;
  awardTicketWinnings: (cycleRows: number[][], rowWinnings: number[], totalWinnings: number) => void;
  resetWallet: () => void;
};

const LOCAL_STORAGE_KEY = "wallet";
// Set the default starting credits
const STARTING_BALANCE = 100;

// Payout map
function getCreditsForMatches_DEPRECATED(matches: number) {
  switch (matches) {
    case 6: return 1000;
    case 5: return 100;
    case 4: return 40;
    case 3: return 20;
    case 2: return 10;
    default: return 0;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function loadWalletFromStorage(): WalletType {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (
        typeof parsed.balance === "number" &&
        Array.isArray(parsed.history)
      ) {
        return parsed;
      }
    } catch {}
  }
  return { balance: STARTING_BALANCE, history: [] };
}

function saveWalletToStorage(wallet: WalletType) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wallet));
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Persist both balance and history.
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

  // Persist **both** balance and history when either changes.
  useEffect(() => {
    saveWalletToStorage({ balance, history });
  }, [balance, history]);

  // STEP 1: CONFIRM ticket — deduct 10 credits immediately, store ticket with matches: 0, creditChange: -10
  function addConfirmedTicket(ticketCore: Omit<TicketType, "id" | "creditChange" | "matches">) {
    const newTicket: TicketType = {
      ...ticketCore,
      id: Math.random().toString(36).slice(2) + Date.now(),
      matches: 0,
      creditChange: -10,
    };
    setBalance((prev) => prev - 10);
    setHistory(prev => [newTicket, ...prev]);
    console.log("[WalletContext] Confirmed ticket & deducted: ", newTicket);
  }

  // STEP 2: After REVEAL — find *most recent* ticket, update matches & add payout
  function awardTicketWinnings(cycleRows: number[][], rowWinnings: number[], totalWinnings: number) {
    setHistory(prevHistory => {
      if (!prevHistory.length) return prevHistory;
      const [latest, ...rest] = prevHistory;
      if (latest.matches !== 0 || latest.creditChange !== -10) return prevHistory; // Only award once

      // For display/history: count TOTAL matched numbers (any row, overlapping possible), 
      // but for actual winnings, use per-row sum
      let totalMatches = 0;
      if (cycleRows.length === 3) {
        for (let i = 0; i < 3; i++) {
          totalMatches += cycleRows[i].filter((n) => latest.numbers.includes(n)).length;
        }
      }

      // Award credits (already deducted -10 on confirm, only add winnings)
      if (totalWinnings > 0) {
        setBalance(prev => prev + totalWinnings);
      }

      const updatedTicket: TicketType = {
        ...latest,
        matches: totalMatches, // for .history/support info
        creditChange: -10 + totalWinnings,
      };
      console.log("[WalletContext] Awarded payout for all 3 rows: ", {rowWinnings, totalWinnings, updatedTicket});
      return [updatedTicket, ...rest];
    });
  }

  // Reset wallet (for demo restart)
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
