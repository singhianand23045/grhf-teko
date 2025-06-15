
## Phase 4 Spec: Result & Wallet

### 1. User Stories

- **As a player**, I want my ticket’s outcome (number of matches) to be evaluated after each draw, so I know if I won or lost.
- **As a player**, I want the app to automatically keep track of my balance, awarding credits according to how many numbers I match, and deducting a participation fee on entry, so my spending/winnings are always clear.
- **As a player**, I want my balance to be preserved if I reload or reopen the app, so my progress is never lost.
- **As a player**, I want my ticket selection to reset for the next draw cycle, so I can choose new numbers each round.
- **As a player**, I want my credits/balance to be visible in a dedicated section between the drawn numbers and my confirmed numbers, where I can always see and easily add to my balance.
- **As a player**, I want a clear, timely message after each draw stating if I won and how much, or encouraging me to try again if I lost.
- **As a player**, I want to win a rolling jackpot if I match all 6 numbers in any row, instead of the regular row credit payout.

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
    - **Add $1 to the jackpot after each draw with a confirmed ticket.**  
    - **Winnings Calculation:** 
      - **Jackpot Rule:**  
        - If the user matches exactly 6 out of 6 numbers in **any one row**, they win the **full current jackpot** for that draw (instead of receiving ANY regular row winnings).
        - After a jackpot win, the pool resets to its base value (e.g. $1000) for the next draw.
      - **Otherwise:**  
        - For each row, count how many confirmed numbers match the 6 numbers from that row only.
        - For each row, award credits according to payout rules:
          - 5 matches: **+100 credits**
          - 4 matches: **+40 credits**
          - 3 matches: **+20 credits**
          - 2 matches: **+10 credits**
          - 1 or 0 matches: **0 credits**
        - **Sum the total winnings across all three rows for the cycle.**
      - The message and wallet adjustment should reflect either the jackpot award or the summed row prize total (but NEVER both for a single ticket).
    - No credits are deducted for non-valid entries (unconfirmed or <6 selections).
    - Balance is updated after each result.

- **Persistence:**
  - Wallet balance and current jackpot value must persist between app reloads (e.g., use localStorage).

- **Reset Behavior:**
  - After each draw cycle, the user’s ticket selection and confirmation are reset (balance and jackpot remain).

- **UI/UX:**
  - There must be a separate "Credits" section inserted between the drawn numbers and confirmed numbers, occupying 5% of the total screen height.
  - This Credits section must show an "Add credits" label aligned to the extreme left, and the credits/balance remaining (e.g., "1750 credits") aligned to the extreme right.
  - The visual layout should resemble the "add to balance" bar in the Robinhood app.
  - The Credits section must always be visible except during demo restart.
  - After each draw, a feedback message appears above drawn numbers for 5 seconds summarizing the result:
    - If the jackpot is won: "Congrats! You won the jackpot of $X!"
    - If not: "Congrats! You won [sum of winnings] credits!" or "Try again. Win next time!" (if lost).
  - The outcome message and wallet update must reflect either the jackpot OR the summed regular credit winnings, never both together.
  - Winnings are NOT calculated based on the total matches among all 18 numbers in the grid; winnings are computed per row and then summed, unless the jackpot condition is met.

---

### 3. Acceptance Criteria

- [ ] Submitting fewer than 6 numbers for a draw does **not** deduct credits or submit a ticket.
- [ ] Submitting and **confirming 6 numbers** for a draw deducts **10 credits** regardless of outcome; ticket is recorded and eligible for winnings.
- [ ] Submitting a ticket with 6 numbers but **not confirming** before cut-off results in **no deduction**, entry is discarded, and no ticket is recorded.
- [ ] After each draw, the user's ticket is checked **independently against each of the 3 rows in the grid**.
  - [ ] If 6 out of 6 are matched in any row, the player wins the **full jackpot** (no regular row prizes are awarded for that ticket; the jackpot pool resets).
  - [ ] If less than 6 are matched in all rows, winnings are calculated using the standard payout rules **per row** (5→100, 4→40, 3→20, 2→10, 1/0→0), summed, and awarded to the wallet.
  - [ ] NEVER award both jackpot and regular row payouts for the same ticket.
- [ ] Multiple wins in multiple draws are credited to balance additively.
- [ ] The wallet balance and jackpot amount are restored correctly on app reload.
- [ ] Ticket selection resets automatically at the start of each new draw cycle; previous balance and jackpot remain unchanged.
- [ ] The Credits section always appears, takes up 5% of the total logical height, and "Add credits" and the credit number are properly positioned.
- [ ] The current jackpot value is always visible.
- [ ] The correct feedback message is displayed at the right time, with correct text and duration, and does not interfere with grid layout.
- [ ] Feedback message and credited amount are correct for either a jackpot or a sum of regular winnings as appropriate.

---

### 4. Tests

#### Unit/Logic Tests

- [ ] Submitting a ticket with <6 numbers does not affect balance or jackpot pool.
- [ ] Submitting and confirming a ticket with exactly 6 numbers immediately subtracts 10 credits from balance, increases the jackpot pool by $1, and records the ticket.
- [ ] Submitting a ticket with 6 numbers and a 6/6 match in any row:
    - [ ] ONLY the jackpot is awarded, sum of regular row prizes is ignored for that ticket, jackpot resets to base value.
- [ ] Submitting a ticket with no 6/6 matches:
    - [ ] Regular row credit winnings are computed and summed.
    - [ ] If the user matches in multiple rows, total regular winnings are credited (no jackpot).
- [ ] The result message and credited amount reflect either the jackpot or summed regular winnings, never both for the same ticket.
- [ ] Balance and jackpot pool are restored after app reload.
- [ ] After the draw, ticket selection resets but balance/jackpot does not.

#### UI/UX Tests

- [ ] On app launch or reload, wallet and jackpot are consistent with prior play.
- [ ] The credits section always appears, takes up 5% of the total logical height, and "Add credits", the balance, and the jackpot are properly positioned.
- [ ] The current jackpot value is always visible and updates appropriately.
- [ ] The correct feedback message is displayed at the right time, with the correct text and duration, and does not interfere with grid layout.
- [ ] Feedback message and credited amount are correct for either a jackpot or the sum of row winnings, as appropriate.

