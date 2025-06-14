
# Phase 3 Spec: Draw Reveal Experience

## Overview

The Lucky Dip demo lottery has two cycles, each lasting 4 minutes.  
In each cycle, a set of 18 numbers (3 sets of 6) is revealed on screen in a timed, animated fashion.

---

### Drawn Numbers Reveal

- The drawn numbers area is a fixed grid of 3 rows and 6 columns (18 slots in total).
- When the timer is not ready to draw (before 0:45), all slots show filled black circles, and maintain their layout even when not filled.
- At 0:45, the reveal phase begins.
- During reveal, one number appears (“pops in”) every 0.5 seconds, in left-to-right, top-to-bottom order.
- All revealed numbers remain visible and persist on the screen until the timer reaches 0:00.
- After the draw, the screen stays on the revealed numbers until the timer restarts or the demo completes.

---

### Visuals

- The empty circles are styled as filled black and maintain their layout even when not filled.
- When a number is revealed in a circle, the circle gets a filled color of black font on white background inside a black circle. 
- If the number matches the user's confirmed numbers, then they get the same color and animation as user's confirmed numbers.
- The grid never shrinks or collapses — always 3 rows x 6 columns.

---

## Demo Flow

**Cycle 1:**
- Open (number selection) → Cut Off → Reveal phase (0:45–0:36, numbers revealed)
- From 0:36 to 0:00, all numbers remain visible.

**Cycle 2:**
- Same flow as above.
- After two cycles, app shows “Demo Complete.”

---

## User Acceptance Criteria

- The user's confirmed numbers are always visible on the screen, regardless of the draw phase.
- The display of the drawn numbers never overshadows or obscures the user's confirmed numbers, and their space is never reduced or taken over by the draw results.
- The timer, drawn numbers, and confirmed numbers are presented in visually separate sections that do not overflow into each other's areas.
