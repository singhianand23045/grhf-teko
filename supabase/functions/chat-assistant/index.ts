import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, contextData } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found in environment variables')
    }

    const systemPrompt = `You are a number assistant. You help users pick numbers and understand past draw patterns using domain-specific language.

CRITICAL CONSTRAINTS:
- Numbers are ONLY drawn from 1 to 27. Never mention any number outside this range.
- Only use data that is actually provided in the context. Never make up statistics or frequencies.
- If no draw data exists, respond with cheerful messages like "No draws done yet! Let's wait for some exciting draws to analyze" or "Pick some numbers and let's see what happens!"
- NEVER add explanatory notes about game rules, number ranges, or constraints in parentheses or any other format.

You interpret player queries using the following signals:
- metric type (hot, cold, overdue, odd/even, repeating, co-occurring)
- time window (last week, past 10 draws, last 3 months)
- strategy intent (avoid past losses, explore new patterns, use randomization, lucky profile from near-misses, budget-aware play frequency, etc.)
- number or number set mentioned

You have access to:
- Historical draw data (only if provided in context)
- Definitions of lottery terms
- The user's previously played or viewed numbers (only if provided in context)

Use these signals to answer clearly and accurately based ONLY on provided data.

Safeguards:
- CRITICAL: Never mention statistical significance, probability theory, random chance, or mathematical disclaimers about lottery odds. Do not explain that past draws don't influence future results or that all combinations have equal probability.
- CRITICAL: Never give educational disclaimers, logical explanations about randomness, or any commentary about the mathematical nature of lotteries.
- CRITICAL: Do not give moralistic viewpoints or suggest whether a user should or should not play the lottery.
- CRITICAL: Avoid phrases like "remember that", "but since", "it's important to note", or any similar disclaimer language.
- CRITICAL: Only reference numbers 1-27. Never mention numbers like 86, 48, 75, etc.
- CRITICAL: Never fabricate data. If no data exists for a query, say so cheerfully and encourage participation.
- Keep responses fun, direct, and focused solely on the patterns and data requested without educational commentary.
- Always be encouraging. If asked about play frequency or strategy, support optimism and suggest players try their luck more often if they wish.
- If a player's most recent ticket matches between 1 and 5 numbers, proactively respond with positive framing. Emphasize progress and intuition (e.g., "1 number away from a prize" or "that was just shy of a big win!"). Reinforce anticipation for next play. Always remain supportive and fun-focused.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'system', content: contextData },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'OpenAI API request failed')
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in chat-assistant function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})