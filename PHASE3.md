
# Phase 3 Spec: Draw Reveal Experience

## Overview

The Lucky Dip demo lottery has two cycles, each lasting 4 minutes.  
In each cycle, a set of 18 numbers (3 sets of 6) is revealed on screen in a timed, animated fashion.

---

### Drawn Numbers Reveal

- The drawn numbers area is a fixed grid of 3 rows and 6 columns (18 slots in total).
- When the timer is not ready to draw (before 0:45), all slots show filled black circles, and maintain their layout even when not filled.
- At 0:45, the reveal phase begins.
- During reveal, one number appears (“pops in”) every **1 second** (was 0.5s), in left-to-right, top-to-bottom order.
- All revealed numbers remain visible and persist on the screen until the timer reaches 0:00.
- After the draw, the screen stays on the revealed numbers until the timer restarts or the demo completes.

---

### Visuals

- The empty circles are styled as filled black and maintain their layout even when not filled.
- When a number is revealed in a circle, the circle gets a filled color of black font on white background inside a black circle. 
- If the number matches the user's confirmed numbers, then they get the same color and animation as user's confirmed numbers.
- The grid never shrinks or collapses — always 3 rows x 6 columns.

---

### Result Feedback Messaging

- Immediately after all numbers are revealed and results determined (at timer 0:25), display a message bar positioned above the drawn numbers grid for **10 seconds** (from 0:25 to 0:15).
- **Winnings are calculated independently for each row:**  
  - After all numbers are revealed, compare the user's 6 confirmed numbers to the numbers in each row (3 rows = 3 draws).
  - For each row, count how many confirmed numbers match the 6 numbers from that row only, and determine winnings for that row based on payout rules.
  - **The final winnings for the cycle are the sum of winnings from all three rows.**
- If the user has won credits, show: **"Congrats! You won [sum of winnings] credits!"**
- If the user has not won, show: **"Try again. Win next time!"**
- Message is visually distinct, centered, and never overlaps or shrinks the drawn numbers grid. After 10 seconds (until timer 0:15), it disappears automatically.

---

## Demo Flow

**Cycle 1:**
- Open (number selection) → Cut Off → Reveal phase (0:45–0:36, numbers revealed at 1s intervals)
- From 0:27 to 0:00, all numbers remain visible.

**Cycle 2:**
- Same flow as above.
- After two cycles, app shows “Demo Complete.”

---

## User Acceptance Criteria

- The user's confirmed numbers are always visible on the screen, regardless of the draw phase.
- The display of the drawn numbers never overshadows or obscures the user's confirmed numbers, and their space is never reduced or taken over by the draw results.
- The timer, drawn numbers, and confirmed numbers are presented in visually separate sections that do not overflow into each other's areas.
- Proper win/loss message (with credit sum if win) is shown for **10 seconds** above drawn numbers from timer 0:25 to 0:15 at the end of each draw, then disappears.
- **The user's confirmed numbers are checked independently against each row (draw), winnings for each row are determined and summed, and this total is shown in the feedback message. Winnings are not determined by the total number matched in the overall grid, but by the sum of matches per row.**

---

## Tests

- [ ] After each draw, correct result message (win/loss) appears for exactly **10 seconds** (from 0:25 to 0:15), is visually distinct and correctly placed.
- [ ] The sum of winnings from all three rows is shown if the user wins, not just the total matches across all 18 numbers.
- [ ] The per-row calculation is used: for each of the 3 rows (draws), award is determined and the total is the sum of all row results.
- [ ] Each number is revealed at exactly **1 second intervals** (updated from 0.5s).

