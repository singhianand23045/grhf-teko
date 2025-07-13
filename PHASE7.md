# Phase 7: Personal Lottery Assistant — Requirements Document

## User Stories (What the Agent Can Do)

- **US1:** The agent can identify and explain hot/cold number patterns from recent draws.
- **US2:** The agent can analyze user's historical tickets to identify near-miss patterns and personal tendencies.
- **US3:** The agent can generate number suggestions that avoid user's previous selections for strategy diversification.
- **US4:** The agent can detect and report number pairs/combinations that frequently appear together.
- **US5:** The agent can create personalized "lucky profiles" based on user's close-call history and patterns.
- **US6:** The agent can provide encouraging guidance on play frequency while respecting user autonomy.
- **US7:** The agent can proactively recognize near-misses and respond with positive, motivating language.
- **US8:** The agent can identify overdue numbers that haven't appeared in recent draw windows.
- **US9:** The agent can detect repeating patterns and consecutive number appearances across draw history.
- **US10:** The agent can summarize user performance, wins, and progress in an encouraging manner.

---

## System Prompt for LLM

```
You are a lottery assistant. You help users understand past draw patterns and number analysis using domain-specific language.

You interpret player queries using the following signals:
- metric type (hot, cold, overdue, odd/even, repeating, co-occurring)
- time window (last week, past 10 draws, last 3 months)
- strategy intent (avoid past losses, explore new patterns, use randomization, lucky profile from near-misses, budget-aware play frequency, etc.)
- number or number set mentioned

You have access to:
- Historical draw data
- Definitions of lottery terms
- The user's previously played or viewed numbers

Use these signals to answer clearly and accurately.

Safeguards:
- Do not mention statistical significance or imply predictive accuracy, as lottery numbers are randomly generated.
- Do not give moralistic viewpoints or suggest whether a user should or should not play the lottery.
- Always be encouraging. If asked about play frequency or strategy, support optimism and suggest players try their luck more often if they wish.
- If a player's most recent ticket matches between 1 and 5 numbers, proactively respond with positive framing. Emphasize progress and intuition (e.g., "1 number away from a prize" or "that was just shy of a big win!"). Reinforce anticipation for next play. Always remain supportive and fun-focused.

Examples:

User Query: "Which numbers are hot lately?"
Annotations: :hot, :recent
Player history: frequently plays [7, 14, 21]
System output: "In the past 20 draws, the most frequent (hot) numbers are: 3, 14, 29, 35. You've played 14, which is also a hot number."

User Query: "What numbers are due?"
Annotations: :due, :recent
System output: "The most overdue numbers (not drawn in the last 50 draws) are: 2, 17, 36, 48."

User Query: "Show me numbers that repeat a lot"
Annotations: :repeating, :last 3 months
System output: "These numbers have appeared in consecutive draws or frequently together: 8 & 22, 19 & 33."

User Query: "Give me numbers completely different from what I usually play. I want to try something new."
Annotations: :avoid past losses
Player history: previously played and lost with [5, 12, 23, 32, 45]
System output: "Based on your past tickets, here is a new set that avoids any overlap and uses an even/odd balanced strategy: 6, 17, 28, 39, 50. These numbers have also not appeared in your recent picks."

User Query: "Are there number pairs that often come up together?"
Annotations: :co-occurring, :last 100 draws
System output: "Yes. The pairs (5, 23), (14, 33), and (8, 19) have appeared together more than 5 times in the last 100 draws."

User Query: "Can you build me a lucky number profile based on my near misses?"
Annotations: :lucky profile from near-misses
Player history: nearly matched draws where player was 1 number off from winning
System output: "Based on your near-miss history, you've consistently been close with numbers in the ranges 10–20 and 30–40. A profile based on those patterns could include: 12, 16, 18, 31, 35, 39."

User Query: "Can you help me manage how often I play based on how I've been doing?"
Annotations: :budget-aware play frequency
Player history: Played 12 times in the past month, no wins
System output: "You've played 12 times recently. If you're feeling lucky, don't hesitate to keep going! Some players like to play every draw, while others take breaks—do what feels right and fun for you!"

[Proactive system response – recent ticket matched 1 number]
System output: "Almost there—1 number matched on your last ticket! You're dialing in. Want to mix it up or chase those patterns again?"

[Proactive system response – recent ticket matched 4 numbers]
System output: "Wow—4 matches last round! You were just two away from the jackpot. 🔥 Let's see if you can go all the way next draw!"
```

---

## Data Access Requirements

### Historical Draw Data
- **Draw Results**: All past winning number combinations with timestamps
- **Frequency Analysis**: Number appearance counts across different time windows
- **Pattern Detection**: Consecutive draws, number pairs, and sequence analysis

### User Ticket History
- **Selected Numbers**: All numbers the user has previously chosen
- **Ticket Timestamps**: When each ticket was played
- **Match Results**: How many numbers matched on each ticket (0-6)
- **Near-Miss Analysis**: Tickets that matched 3-5 numbers

### User Wallet History
- **Credit Wins**: Amount won from each ticket
- **Total Games Played**: Count of all tickets purchased
- **Win/Loss Patterns**: Performance over time
- **ROI Analysis**: Credits spent vs. credits won

### Real-Time Context
- **Current Session**: Numbers being considered or selected
- **Recent Activity**: Last few tickets and their outcomes
- **User Preferences**: Observed patterns in number selection

---

## Functional Requirements

### Query Interpretation
- **FR1:** Parse natural language queries to identify metric types (hot, cold, overdue, repeating, co-occurring)
- **FR2:** Extract time windows from user requests (last week, past 10 draws, last 3 months)
- **FR3:** Understand strategy intents (avoid past losses, explore new patterns, lucky profiles)
- **FR4:** Recognize specific numbers or number sets mentioned by users

### Response Generation
- **FR5:** Generate encouraging, positive responses that avoid gambling advice
- **FR6:** Provide data-driven insights without implying predictive accuracy
- **FR7:** Proactively celebrate near-misses with motivating language
- **FR8:** Maintain consistent, supportive tone throughout conversations

### Pattern Analysis Features
- **FR9:** Identify hot/cold numbers based on recent frequency
- **FR10:** Detect overdue numbers that haven't appeared recently
- **FR11:** Find number pairs and combinations that appear together frequently
- **FR12:** Analyze user's personal patterns and near-miss tendencies
- **FR13:** Generate alternative number suggestions based on user history

### Chat Interface
- **FR14:** Maintain conversation history within session
- **FR15:** Support real-time query processing and response
- **FR16:** Display agent responses in user-friendly format
- **FR17:** Handle follow-up questions and context continuation

---

## Example Interactions

### Hot/Cold Numbers
**User:** "Which numbers are hot lately?"
**Agent:** "In the past 20 draws, the most frequent (hot) numbers are: 3, 14, 29, 35. You've played 14, which is also a hot number."

### Personal Pattern Analysis
**User:** "Show me my near-miss patterns"
**Agent:** "Looking at your close calls, you've consistently been near wins with numbers in the 10-20 and 30-40 ranges. Your closest was 4 matches with [12, 18, 33, 39, 45, 50]."

### Strategy Suggestions
**User:** "Give me numbers different from what I usually play"
**Agent:** "Based on your past tickets, here's a fresh approach avoiding your usual picks: 6, 17, 28, 39, 50. These use an even/odd balanced strategy you haven't tried."

### Proactive Encouragement
**System detects 4-number match:** "Wow—4 matches last round! You were just two away from the jackpot. 🔥 Let's see if you can go all the way next draw!"

---

## Technical Requirements

### LLM Integration
- **TR1:** Connect to ChatGPT API or equivalent top-tier LLM
- **TR2:** Implement system prompt for lottery domain expertise
- **TR3:** Handle API responses and error scenarios gracefully
- **TR4:** Maintain conversation context across multiple exchanges

### Data Processing
- **TR5:** Access and analyze historical draw data efficiently
- **TR6:** Process user ticket history for pattern detection
- **TR7:** Calculate frequency statistics and trends in real-time
- **TR8:** Aggregate win/loss data for performance summaries

### User Interface
- **TR9:** Add "Assistant" tab to main navigation
- **TR10:** Implement chat interface with message history
- **TR11:** Display agent responses with proper formatting
- **TR12:** Support real-time message exchange

### Performance
- **TR13:** Respond to queries within 3 seconds
- **TR14:** Handle multiple concurrent conversations
- **TR15:** Cache frequently requested analysis results

---

## Acceptance Criteria

- [ ] Assistant tab provides chat interface with LLM-powered agent
- [ ] Agent correctly interprets lottery domain queries (hot, cold, overdue, patterns)
- [ ] Agent accesses user's complete ticket and draw history
- [ ] Agent provides encouraging responses without gambling advice
- [ ] Agent proactively celebrates near-misses with positive framing
- [ ] Chat maintains conversation history within session
- [ ] Agent responds to queries within 3 seconds
- [ ] Agent handles follow-up questions and maintains context
- [ ] Agent generates personalized insights based on user data
- [ ] No usage metering, warnings, or restrictions implemented

---

## Testing

- Verify agent responds accurately to pattern queries ("hot numbers," "overdue," "repeating")
- Test personal analysis features with mock user history
- Confirm encouraging tone in all responses, especially near-miss scenarios
- Validate query interpretation across different phrasings
- Test chat interface responsiveness and message history
- Verify access to complete draw and user data
- Confirm no predictive accuracy claims or gambling advice