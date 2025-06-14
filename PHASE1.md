
# Phase 1 Specification

## Timer, Draw Scheduling, and Number Selection

### User Stories

- As a player, I want to see a visible timer counting down to the next draw.
- As a player, I want to select 6 numbers from a pool before cut-off.
- As a player, I want picking to be locked during cut-off and draw phases.

### Functional Requirements

- Timer is visible and clearly indicates the time left until the next draw.
- Draws are scheduled to occur at regular intervals (e.g., every 2 minutes).
- Number selection interface allows picking up to 6 numbers (from a pool of 27).
- Number picking is disabled when cut-off or reveal starts; only enabled in OPEN state.
- Timer state machine transitions through OPEN, CUT_OFF, REVEAL, and (optionally) COMPLETE.

### Acceptance Criteria

- [x] Timer counts down and resets correctly each cycle.
- [x] Number picking is only enabled while the state is OPEN.
- [x] UI clearly indicates when the draw is in progress vs. selection phase.

---
