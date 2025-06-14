
## Phase 4 Spec: Result & Wallet

### 1. User Stories

- **As a player**, I want my ticket’s outcome (number of matches) to be evaluated after each draw, so I know if I won or lost.
- **As a player**, I want the app to automatically keep track of my balance, awarding credits according to how many numbers I match, and deducting a participation fee on entry, so my spending/winnings are always clear.
- **As a player**, I want my balance to be preserved if I reload or reopen the app, so my progress is never lost.
- **As a player**, I want my ticket selection to reset for the next draw cycle, so I can choose new numbers each round.
- **As a player**, I want my credits/balance to be visible in a dedicated section between the drawn numbers and my confirmed numbers, where I can always see and easily add to my balance.

---

### 2. Functional Requirements

- Define CoreData entities:
  - `Wallet(balance: Int)`
  - `Ticket(date: string, numbers: [Int], matches: Int, creditChange: Int)`

- **Entry Rules:**
  - For a ticket to be valid in a draw, the user must select **and confirm** exactly 6 numbers before the cut-off.  
  - If the user selects fewer than 6 numbers by the cut-off, the entry is **discarded**—no credits are deducted, no ticket is recorded.
  - If the user selects 6 numbers but **does not confirm** before cut-off, the entry is **discarded**—no credits are deducted, no ticket is recorded.
- **Balance Management:**
  - Start with `balance = 100` credits for every new player/session.
  - For each draw in which the player participates (i.e., submits and confirms a 6-number ticket):
    - **Deduct 10 credits** from the balance upon confirmation, regardless of results.
    - After the draw, **award credits based on number of matches**:
      - 6 matches: **+1000 credits**
      - 5 matches: **+100 credits**
      - 4 matches: **+40 credits**
      - 3 matches: **+20 credits**
      - 2 matches: **+10 credits**
      - 1 or 0 matches: **0 credits**
    - If the user wins in multiple draws, winnings are added for each draw.
  - No credits are deducted for non-valid entries (unconfirmed or <6 selections).
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

- [ ] Submitting fewer than 6 numbers for a draw does **not** deduct credits or submit a ticket.
- [ ] Submitting and **confirming 6 numbers** for a draw deducts **10 credits** regardless of outcome; ticket is recorded and eligible for winnings.
- [ ] Submitting 6 numbers but **not confirming** before cut-off results in **no deduction**, entry is discarded, and no ticket is recorded.
- [ ] If a user's confirmed ticket matches numbers, winnings are awarded as follows:
    - 6/6: +1000 credits
    - 5/6: +100 credits
    - 4/6: +40 credits
    - 3/6: +20 credits
    - 2/6: +10 credits
    - 1 or 0/6: no credit awarded
- [ ] Multiple wins in multiple draws are credited to balance additively.
- [ ] The wallet balance is restored correctly on app reload.
- [ ] Ticket selection resets automatically at the start of each new draw cycle; previous balance remains unchanged.
- [ ] The Credits section appears at all times (except demo restart), is visually separated, takes up 5% of the total logical height, and "Add credits" and the credit number are properly positioned.

---

### 4. Tests

#### Unit/Logic Tests

- [ ] Submitting a ticket with <6 numbers does not affect balance.
- [ ] Submitting and confirming a ticket with exactly 6 numbers immediately subtracts 10 credits from balance and records the ticket (regardless of matches).
- [ ] Submitting a ticket with 6 numbers and matches awards winnings according to the rules above, and records the ticket with correct values.
- [ ] Submitting 6 numbers but not confirming: balance/history unchanged, nothing recorded.
- [ ] Multiple wins in multiple draws are credited to balance additively.
- [ ] Balance is restored after simulating an app reload.
- [ ] After the draw, ticket selection resets but balance does not.

#### UI/UX Tests

- [ ] On app launch or reload, wallet is consistent with prior play.
- [ ] The credits section always appears, takes up 5% of the total logical height, and "Add credits" and the credit number are properly positioned.

