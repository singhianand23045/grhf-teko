import { supabase } from "@/integrations/supabase/client";

// System prompt moved to Edge Function

// Get draws from localStorage
export function getDrawsFromLocalStorage(): number[][] {
  try {
    const data = localStorage.getItem("draw_history");
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.every(
      (draw) => Array.isArray(draw) && draw.every((n) => typeof n === "number")
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

// Format session data for LLM context
export function formatDataForLLM(sessionData: {
  currentBalance: number;
  ticketHistory: any[];
  currentPicked: number[];
  isCurrentTicketConfirmed: boolean;
  drawHistory: number[][];
}) {
  const { currentBalance, ticketHistory, currentPicked, isCurrentTicketConfirmed, drawHistory } = sessionData;

  let context = `## Current Session Data

**Current Balance:** ${currentBalance} credits

**Draw History:** ${drawHistory.length} total draws have occurred
`;

  if (drawHistory.length > 0) {
    context += `Recent draws: ${drawHistory.slice(-5).map(draw => `[${draw.join(', ')}]`).join(', ')}\n`;
    
    // Calculate hot numbers from recent draws
    const recentDraws = drawHistory.slice(-20); // Last 20 draws
    const frequency: Record<number, number> = {};
    recentDraws.flat().forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
    
    const hotNumbers = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([num, count]) => `${num}(${count}x)`);
    
    if (hotNumbers.length > 0) {
      context += `Hot numbers in last 20 draws: ${hotNumbers.join(', ')}\n`;
    }

    // Calculate cold/overdue numbers
    const allNumbers = Array.from({ length: 99 }, (_, i) => i + 1);
    const recentNumbers = new Set(recentDraws.flat());
    const coldNumbers = allNumbers.filter(num => !recentNumbers.has(num)).slice(0, 10);
    
    if (coldNumbers.length > 0) {
      context += `Overdue numbers (not in last 20 draws): ${coldNumbers.join(', ')}\n`;
    }
  }

  context += `
**Session Tickets Played:** ${ticketHistory.length}
`;

  if (ticketHistory.length > 0) {
    context += `**Ticket History:**\n`;
    ticketHistory.slice(0, 10).forEach((ticket, idx) => {
      context += `  ${idx + 1}. Numbers: [${ticket.numbers?.join(', ') || 'N/A'}], Matches: ${ticket.matches || 0}, Winnings: ${ticket.winnings || 0} credits\n`;
    });

    // Calculate session performance
    const totalWinnings = ticketHistory.reduce((sum, ticket) => sum + (ticket.winnings || 0), 0);
    const totalSpent = ticketHistory.length * 30; // 30 credits per ticket
    const netResult = totalWinnings - totalSpent;
    
    context += `**Session Performance:** Spent ${totalSpent} credits, Won ${totalWinnings} credits, Net: ${netResult >= 0 ? '+' : ''}${netResult} credits\n`;

    // Find near misses (3+ matches)
    const nearMisses = ticketHistory.filter(ticket => (ticket.matches || 0) >= 3);
    if (nearMisses.length > 0) {
      context += `**Near Misses:** ${nearMisses.length} tickets with 3+ matches\n`;
    }

    // Most played numbers this session
    const sessionNumbers: Record<number, number> = {};
    ticketHistory.forEach(ticket => {
      if (ticket.numbers) {
        ticket.numbers.forEach((num: number) => {
          sessionNumbers[num] = (sessionNumbers[num] || 0) + 1;
        });
      }
    });
    
    const favoriteNumbers = Object.entries(sessionNumbers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([num, count]) => `${num}(${count}x)`);
    
    if (favoriteNumbers.length > 0) {
      context += `**Your Favorite Numbers This Session:** ${favoriteNumbers.join(', ')}\n`;
    }
  }

  if (currentPicked.length > 0) {
    context += `
**Current Selection:** [${currentPicked.join(', ')}] (${isCurrentTicketConfirmed ? 'Confirmed' : 'Not confirmed yet'})
`;
  }

  return context;
}

// Send message to LLM via Supabase Edge Function
export async function sendToLLM(userMessage: string, contextData: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('chat-assistant', {
      body: {
        message: userMessage,
        contextData: contextData
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to get response from assistant');
    }

    if (!data?.response) {
      throw new Error('Invalid response from assistant service');
    }

    return data.response;
  } catch (error: any) {
    console.error('LLM API Error:', error);
    throw new Error(error.message || 'Failed to connect to assistant service');
  }
}