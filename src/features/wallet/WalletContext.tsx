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
  processTicketResult: (ticketId: string, matches: number, winnings: number, jackpotWon: boolean) => void; // Updated signature
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
  }, [balance, history]);

  function addConfirmedTicket(ticketCore: Omit<TicketType, "id" | "creditChange" | "matches" | "winnings" | "processed">) {
    const newTicket: TicketType = {
      ...ticketCore,
      id: Math.random().toString(36).slice(2) + Date.now(),
      matches: 0,
      creditChange: -30, // Always -30 for ticket purchase
      winnings: 0,
      processed: false, // Mark as unprocessed initially
    };
    setBalance(prev => prev - 30);
    setHistory(prev => [newTicket, ...prev]);
  }

  /**
   * Processes the result for a single ticket, updates its status, and awards winnings.
   */
  function processTicketResult(ticketId: string, matches: number, winnings: number, jackpotWon: boolean) {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.map(ticket => {
        if (ticket.id === ticketId && !ticket.processed) {
          const awardedAmount = jackpotWon ? winnings : winnings; // If jackpot, winnings is already jackpot amount
          setBalance(prevBal => prevBal + awardedAmount);
          return {
            ...ticket,
            matches: matches,
            winnings: awardedAmount,
            processed: true,
          };
        }
        return ticket;
      });
      return updatedHistory;
    });
  }

  function resetWallet() {
    setBalance(STARTING_BALANCE);
    setHistory([]);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ balance: STARTING_BALANCE, history: [] }));
  }

  return (
    <WalletContext.Provider value={{ balance, history, addConfirmedTicket, processTicketResult, resetWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}