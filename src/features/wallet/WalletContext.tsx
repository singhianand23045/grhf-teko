
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

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
  awardTicketWinnings: (cycleNumbers: number[]) => void;
  resetWallet: () => void;
};

const LOCAL_STORAGE_KEY = "wallet";

// Payout map
function getCreditsForMatches(matches: number) {
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
  return { balance: 1000, history: [] };
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
    return 1000;
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

  // STEP 2: After REVEAL — find *most recent* ticket, update with real matches and add payout
  function awardTicketWinnings(cycleNumbers: number[]) {
    // Find most recent ticket for this cycle (should be the most recent in history where matches === 0)
    setHistory(prevHistory => {
      if (!prevHistory.length) return prevHistory;
      const [latest, ...rest] = prevHistory;
      if (latest.matches !== 0) return prevHistory; // Already awarded
      // Count matches
      const matches = latest.numbers.filter((n) => cycleNumbers.includes(n)).length;
      const winnings = getCreditsForMatches(matches);
      if (winnings > 0) {
        setBalance(prev => prev + winnings);
      }
      const updatedTicket: TicketType = {
        ...latest,
        matches,
        creditChange: -10 + winnings,
      };
      console.log("[WalletContext] Awarded payout. New ticket: ", updatedTicket);
      return [updatedTicket, ...rest];
    });
  }

  // Reset wallet (for demo restart)
  function resetWallet() {
    setBalance(1000);
    setHistory([]);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ balance: 1000, history: [] }));
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
