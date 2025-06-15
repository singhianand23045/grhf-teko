# Phase 6: Roulette Ball Draw Animation (Prototype)

## Feature Spec: Roulette Ball Draw Animation (Prototype)

### User Stories
- **As a user**, when the game is in the countdown phase before the draw, I see 18 spinning roulette balls (instead of static black circles), creating a sense of anticipation.
- **As a user**, when the draw begins, each roulette ball visually stops spinning one after another, revealing the drawn number in its place.
- **As a user**, I want any matched user numbers to be clearly highlighted so I can see if I won.

### Functional Requirements
1. **Roulette Balls Visual State**
    - Before the draw, all 18 grid slots display animated, spinning roulette balls (black, with roulette-style visuals).
    - The grid layout is always 3 rows × 6 columns.
2. **Ball Reveal Animation**
    - When drawing starts, roulette balls stop spinning one at a time, left-to-right and top-to-bottom, at the exact reveal sequence.
    - When a ball stops spinning, the corresponding number appears in its place.
    - The stopped ball visually transitions from the spinning style to a static style.
    - **Each ball now stops at an exact 1 second interval** (updated from 0.5s), to match current app timing.
3. **Number Highlight**
    - Numbers that match the user’s picks are highlighted (e.g., green color/border as currently done).
4. **Grid Consistency**
    - The layout always remains fixed as a grid; no overlaps or shifting.

### User Acceptance Criteria
- [ ] Before the reveal, all 18 balls spin; no numbers are shown.
- [ ] During the reveal, each ball stops spinning and reveals its number one after the other at **1s per ball** (updated; was 0.5s), with the drawn number displayed.
- [ ] Numbers that match the user's selection are highlighted visually.
- [ ] The display is visually stable throughout all phases; no layout issues occur.
- [ ] All revealed numbers remain visible until the next game round.
- [ ] Result message ("Congrats" or "Try again") is shown above the numbers for **10 seconds** (from 0:25 to 0:15 on the timer), then disappears.

### Tests
- **Visual / Unit**
  - [ ] 18 balls render and spin prior to the reveal.
  - [ ] Balls stop spinning in correct order, one at a time, at **1s per ball** (updated; was 0.5s), with the drawn number displayed.
  - [ ] User-picked numbers are highlighted as described.
  - [ ] **Result message ("Congrats!" or "Try again") is visible for exactly 10 seconds, from 0:25 to 0:15.**
- **Integration**
  - [ ] Switching between game phases correctly swaps between spinning balls and revealed numbers.
  - [ ] Grid layout remains correct and unchanged throughout.
- **Regression**
  - [ ] Removing or editing this feature doesn’t break existing reveal/grid drawing features.
