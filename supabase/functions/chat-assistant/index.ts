import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Post-processing filters to remove forbidden patterns
const forbiddenPatterns = [
  /Remember,?\s*you can only pick numbers (?:from )?1 to 27\.?/gi,
  /\(remember,?\s*only numbers 1[- ]27 are valid.*?\)/gi,
  /\(numbers? 1[- ]27 only\)/gi,
  /Note that only numbers 1[- ]27 are valid/gi,
  /Keep in mind.*?numbers? 1[- ]27/gi,
  /\(only numbers? between 1 and 27.*?\)/gi,
  /\(valid range:? 1[- ]27\)/gi,
  /theory suggests/gi,
  /statistical analysis/gi,
  /probability theory/gi
];

function cleanResponse(text: string): string {
  let cleaned = text;
  
  // Apply forbidden pattern filters
  for (const pattern of forbiddenPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Clean up extra whitespace and punctuation
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/\.\s*\./g, '.');
  
  return cleaned;
}

const systemPrompt = `You are a lottery assistant that helps users pick numbers through natural conversation. You provide number recommendations and allow users to confirm them directly for gameplay.

CRITICAL CONSTRAINTS:
- Numbers are ONLY drawn from 1 to 27. Never mention any number outside this range.
- Only use data that is actually provided in the context. Never make up statistics or frequencies.
- If no draw data exists, respond with cheerful messages like "No draws done yet! Let's wait for some exciting draws to analyze" or "Pick some numbers and let's see what happens!"
- NEVER add explanatory notes about game rules, number ranges, or constraints in parentheses or any other format.

RESPONSE FORMAT REQUIREMENTS:
Your response must be exactly in this format:
- Direct answer to the user's question with fun, encouraging tone
- Only mention specific numbers if they are between 1-27 and based on provided data
- NO explanatory text about rules, ranges, or constraints
- NO text that starts with "Remember", "Note", "Keep in mind", or similar disclaimer phrases
- NO parenthetical explanations or reminders
- NO educational commentary about probability or randomness

FORBIDDEN PHRASES - Never include any of these:
- "Remember, you can only pick numbers from 1 to 27"
- "Note that only numbers 1-27 are valid"
- Any variation of explanatory text about the number range
- Any text in parentheses explaining game rules
- Academic language like "Hot numbers theory suggests"
- Educational disclaimers about probability or odds

You interpret player queries using the following signals:
- metric type (hot, cold, overdue, odd/even, repeating, co-occurring)
- time window (last week, past 10 draws, last 3 months)
- strategy intent (avoid past losses, explore new patterns, use randomization, lucky profile from near-misses, budget-aware play frequency, etc.)
- number or number set mentioned

Use these signals to provide number recommendations that can be directly confirmed for gameplay.

Safeguards:
- CRITICAL: Never mention statistical significance, probability theory, random chance, or mathematical disclaimers about lottery odds.
- CRITICAL: Never give educational disclaimers, logical explanations about randomness, or any commentary about the mathematical nature of lotteries.
- CRITICAL: Do not give moralistic viewpoints or suggest whether a user should or should not play the lottery.
- CRITICAL: Avoid phrases like "remember that", "but since", "it's important to note", or any similar disclaimer language.
- CRITICAL: Only reference numbers 1-27. Never mention numbers like 86, 48, 75, etc.
- CRITICAL: Never fabricate data. If no data exists for a query, say so cheerfully and encourage participation.
- Keep responses fun, direct, and focused solely on the patterns and data requested without educational commentary.
- Always be encouraging. Support optimism and suggest players try their luck.
- Use casual, exciting language: "These numbers are on fire!" instead of "Hot numbers theory suggests..."

When providing number recommendations, respond with a JSON object in this exact format:
{
  "message": "your encouraging response text",
  "recommendation": {
    "numbers": [1, 7, 14, 21, 23, 27],
    "type": "hot|cold|balanced|pattern|history",
    "reasoning": "brief fun explanation without academic language"
  }
}

If not providing recommendations, respond with just:
{
  "message": "your response text"
}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build enhanced context for LLM
    let contextString = '';
    if (context) {
      const { 
        timerState, 
        selectedNumbers, 
        balance, 
        userHistory = [], 
        drawHistory = [], 
        hotNumbers = [], 
        coldNumbers = [], 
        recentPatterns = "",
        cycleIndex = 0 
      } = context;

      contextString = `
Current Game Context:
- Timer State: ${timerState || 'unknown'}
- Current Cycle: ${cycleIndex}
- User's Selected Numbers: ${selectedNumbers?.join(', ') || 'none'}
- Balance: ${balance || 'unknown'} credits

Recent Draw Results:
${drawHistory.length > 0 ? drawHistory.slice(0, 5).map((draw: any) => {
  const numbers = draw.winningNumbers?.slice(0, 6)?.sort((a: number, b: number) => a - b)?.join(', ') || 'Unknown';
  return `Cycle ${draw.cycle}: [${numbers}] (${draw.jackpotWon ? 'JACKPOT!' : `${draw.totalWinnings} credits`})`;
}).join('\n') : 'No draws done yet!'}

Hot Numbers (most frequent): ${hotNumbers.slice(0, 10).join(', ') || 'none yet'}
Cold Numbers (overdue): ${coldNumbers.slice(0, 10).join(', ') || 'none yet'}

User's Recent Tickets:
${userHistory.length > 0 ? userHistory.slice(0, 3).map((ticket: any) => {
  const nums = ticket.numbers?.sort((a: number, b: number) => a - b)?.join(', ') || 'Unknown';
  return `[${nums}] - ${ticket.matches || 0} matches, ${ticket.winnings || 0} credits`;
}).join('\n') : 'No tickets played yet'}

${recentPatterns ? `Recent Patterns:\n${recentPatterns}` : ''}
`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'system', content: contextString },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let assistantResponse = data.choices[0].message.content;

    // Apply post-processing filters
    assistantResponse = cleanResponse(assistantResponse);

    // Try to parse as JSON first, fallback to plain text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(assistantResponse);
    } catch {
      // If not valid JSON, wrap in message object
      parsedResponse = { message: assistantResponse };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in lottery assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "I'm having trouble right now. Try asking for some number recommendations!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});