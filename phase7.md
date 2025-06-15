
# Phase 7: Analytics Agent Prototype — Simplified Local Storage Spec

## User Story

As a user, I want the Analytics Agent to answer questions based on my own draws from this session, and to be clearly notified if there isn’t enough data yet (i.e., if I haven’t played any games).

## Functional Requirements

- FR1: After each draw in the main game, save the draw data to local storage under a consistent key.
- FR2: When loading the Analytics/Ask Agent tab, check local storage for user draw data.
    - If draw data exists: The Analytics Agent analyzes and answers based on the real draw data.
    - If NO draw data exists: The agent responds to all queries with:
      "Please play some games and we will start generating insights."
- FR3: The agent must not use demo/sample data or generate fake answers.
- FR4: If the user clears their local storage, the Analytics Agent will again use only the above message until new draws are made.

## Acceptance Criteria

- Analytics Agent answers are always based on real game data from local storage.
- If no draw data is available in local storage, the agent always responds:
  "Please play some games and we will start generating insights."
- No demo/sample/fake data is used for analytics or agent answers, ever.
- The agent’s responses and behavior reset automatically if the user clears their browser storage, until the user plays again.

## Tests

- Play one or more games, visit the Analytics Agent tab, and verify the agent responds to questions using actual draw data.
- Visit the Analytics Agent tab before playing any games (or after clearing storage), and verify the agent always responds: "Please play some games and we will start generating insights."
- Confirm no fake, placeholder, or demo data is shown at any time.
