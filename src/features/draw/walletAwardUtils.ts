
import { TicketType } from "../wallet/WalletContext";

// Utility wrapper to clarify awarding logic.
export function shouldAwardTicket(latestTicket: TicketType | undefined): boolean {
  if (!latestTicket) return false;
  // Only award ONCE if not already updated
  return latestTicket.matches === 0 && latestTicket.creditChange === -10;
}

// This file can include more helpers if wallet logic grows.
