
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
  creditChange: number;  // -10 or 100
};

type WalletContextType = {
  balance: number;
  history: TicketType[];
  addTicket: (ticket: Omit<TicketType, "id">) => void;
  resetWallet: () => void;
};

const LOCAL_STORAGE_KEY = "wallet";

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
  const [balance, setBalance] = useState<number>(() => loadWalletFromStorage().balance);
  const [history, setHistory] = useState<TicketType[]>(() => loadWalletFromStorage().history);

  // Save on change
  useEffect(() => {
    saveWalletToStorage({ balance, history });
  }, [balance, history]);

  // Add a ticket (draw result): handles the credit logic and updates state
  function addTicket(ticket: Omit<TicketType, "id">) {
    let creditChange = ticket.matches === 6 ? 100 : -10;
    const newTicket: TicketType = {
      ...ticket,
      id: Math.random().toString(36).slice(2) + Date.now(),
      creditChange,
    };
    setHistory(prev => [newTicket, ...prev]);
    setBalance(prev => prev + creditChange);
  }

  // Reset wallet (for demo restart)
  function resetWallet() {
    setBalance(1000);
    setHistory([]);
    saveWalletToStorage({ balance: 1000, history: [] });
  }

  return (
    <WalletContext.Provider value={{ balance, history, addTicket, resetWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
