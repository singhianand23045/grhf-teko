
## Phase 4 Specification: Result & Wallet – Credit Accounting, Match Algorithm, CoreData Wallet/History

### 1. User Stories

- **As a player**, I want my ticket’s outcome (number of matches) to be evaluated after each draw, so I know if I won or lost.
- **As a player**, I want the app to automatically keep track of my balance, deducting -10 credits per entry and adding +100 credits if I get 6 matches, so my spending/winnings are always clear.
- **As a player**, I want my balance to be preserved if I reload or reopen the app, so my progress is never lost.
- **As a player**, I want my ticket selection to reset for the next draw cycle, so I can choose new numbers each round.
- **As a player**, I want my credits/balance to be visible in a dedicated section between the drawn numbers and my confirmed numbers, where I can always see and easily add to my balance.

---

### 2. Functional Requirements

- Define CoreData entities:
  - `Wallet(balance: Int)`
  - `Ticket(date: string, numbers: [Int], matches: Int, creditChange: Int)`
- **Balance Management:**
  - Start with `balance = 1000` credits for every new player/session.
  - For each draw in which the player participates (submits a 6-number ticket):
    - Subtract 10 credits (`creditChange = -10`).
    - If the ticket has exactly 6 matches, award +100 credits instead of subtracting 10 (`creditChange = +100`).
  - Balance is updated after each result.
- **Persistence:**
  - Wallet balance must persist between app reloads (e.g., use localStorage).
- **Reset Behavior:**
  - After each draw cycle, the user’s ticket selection and confirmation are reset (balance remains).
- **UI/UX:**
  - There must be a separate "Credits" section inserted between the drawn numbers and confirmed numbers, occupying 5% of the total screen height.
  - This Credits section must show an "Add credits" label aligned to the extreme left, and the credits/balance remaining (e.g., "1750 credits") aligned to the extreme right.
  - The visual layout should resemble the "add to balance" bar in the Robinhood app.
  - The Credits section must always be visible except during demo restart.

---

### 3. Acceptance Criteria

- [ ] When a user enters a valid ticket and the draw occurs, their balance is reduced by 10 credits OR increases by 100 credits if they hit all 6 matches.
- [ ] The wallet balance is restored correctly on app reload.
- [ ] Ticket selection resets automatically at the start of each new draw cycle; previous balance remains unchanged.
- [ ] The Credits section appears at all times (except demo restart), is visually separated, takes up 5% of the total logical height, and "Add credits" and the credit number are properly positioned.

---

### 4. Tests

#### Unit/Logic Tests

- [ ] Submitting a ticket with <6 numbers does not affect balance.
- [ ] Submitting a ticket with 6 numbers and 0–5 matches subtracts 10 credits from balance and records the ticket with correct values.
- [ ] Submitting a ticket with 6 numbers and 6 matches adds 100 credits to balance and records the ticket.
- [ ] Balance is restored after simulating an app reload.
- [ ] After the draw, ticket selection resets but balance does not.

#### UI/UX Tests

- [ ] On app launch or reload, wallet is consistent with prior play.
- [ ] The credits section always appears, takes up 5% of the total logical height, and "Add credits" and the credit number are properly positioned.
