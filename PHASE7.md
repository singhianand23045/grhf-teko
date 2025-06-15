
# Phase 7: Analytics Agent Prototype — Simplified Spec

## User Stories

- **US1:** As a user, I want to open a new “Analytics” tab and chat with an agent about draw statistics.
- **US2:** As a user, I want to type a question like “Which number was drawn most often in the last 50 games?” and get a clear answer.
- **US3:** As a user, I want fast responses based on the game’s draw history.

---

## Functional Requirements

- **FR1:** Add an “Analytics” tab featuring a chat interface connected to an agent.
- **FR2:** The agent can access the full history of all previous draws, up-to-date.
- **FR3:** The agent can compute and respond to user requests for draw statistics (frequency, streaks, summaries, etc.).
- **FR4:** Each conversation maintains a local history of prompts and agent responses (for just the current session or tab).
- **FR5:** There are NO requirements for token counting, usage metering, warnings, blocking usage, daily reset, rate limiting, logging, or persistence of usage.

---

## Acceptance Criteria

- [ ] There is an “Analytics” tab with a chat UI.
- [ ] The agent answers analytic queries about lottery draws accurately and understandably.
- [ ] Users can exchange multiple messages in one session; message history is visible in the chat window.
- [ ] There is no warning, error, or counter regarding usage or tokens.
- [ ] Refreshing the page clears the chat history (unless otherwise requested in future).
- [ ] No need to persist or enforce any usage/token/quota logic.

---

## Testing

- Test that agent responds correctly to typical analytic queries (“most frequent,” “summary,” “streak,” etc.).
- Test that chat UI works, interaction is smooth.
- Verify no usage counters, warnings, or blocks are present.
- Confirm full draw history is always available to the agent for every query.

