# Phase 9: Multiple Tickets

## Overview

This phase introduces the ability for players to submit multiple tickets (up to three) for a single draw cycle. This enhances player engagement by allowing more chances to win and introduces a dynamic visual reveal for each ticket's matches during the draw phase.

## User Stories

*   As a player, I want to submit more than one set of numbers for a single draw, so I can increase my chances of winning.
*   As a player, I want to clearly see all my confirmed tickets displayed on screen, so I can keep track of my entries.
*   As a player, I want to easily add additional tickets after confirming my first one, without losing sight of my previous selections.
*   As a player, I want to see a distinct visual highlight for matches from each of my confirmed tickets during the draw reveal, so I can understand how each ticket performed.
*   As a player, I want the final result message to summarize the winnings for all my confirmed tickets in a draw.

## Functional Requirements

### 1. Ticket Submission & Management

*   **Maximum Tickets:** A user can confirm and submit a maximum of **three (3)** tickets per draw cycle.
*   **Confirmation Flow:**
    *   When the timer is in the "OPEN" phase (2:00 to 1:00), the user can select 6 numbers from the grid.
    *   Upon clicking "Confirm Numbers":
        *   The selected 6 numbers are recorded as a confirmed ticket.
        *   **30 credits** are immediately deducted from the user's wallet for each confirmed ticket.
        *   The `picked` numbers in the selection grid are cleared, and the grid is **hidden**.
        *   The newly confirmed ticket is displayed as a **row of circular chips**.
    *   If fewer than 3 tickets are confirmed and the timer is still in the "OPEN" phase, an "Add next ticket" button appears below the displayed tickets.
    *   Clicking "Add next ticket" makes the number selection grid reappear (empty), allowing the user to select a new set of 6 numbers for a subsequent ticket. The previously confirmed tickets remain visible above the grid.
    *   Once 3 tickets are confirmed, the "Add next ticket" button disappears.
*   **Invalid Entries:** If the user selects fewer than 6 numbers or does not confirm their selection before the "CUT_OFF" phase, the entry is discarded, and no credits are deducted.
*   **Reset on New Cycle:** At the start of each new draw cycle (when `cycleIndex` changes), all confirmed tickets for the previous cycle are cleared, and the number selection state resets to allow new entries.

### 2. Draw Reveal & Highlighting

*   **Initial Reveal (0:45 – 0:36):**
    *   The draw begins at 0:45. All 18 drawn numbers are revealed sequentially (row by row, matches first, then non-matches within each row) over 9 seconds.
    *   Numbers matching the **first confirmed ticket** are highlighted in **green** as they appear.
*   **Second Ticket Overlay (0:35 – 0:33):**
    *   Immediately after the initial reveal (at 0:35), a 2-second overlay pass begins.
    *   Numbers matching the **second confirmed ticket** are highlighted in **blue**.
    *   If a number matches both the first and second tickets, its visual representation splits into two semi-circles (left half green, right half blue).
*   **Third Ticket Overlay (0:32 – 0:30):**
    *   If a third ticket exists, a second 2-second overlay pass begins at 0:32.
    *   Numbers matching the **third confirmed ticket** are highlighted in **yellow**.
    *   For overlaps:
        *   If a number matches all three tickets, its visual representation divides into three equal wedges (green/blue/yellow).
        *   If it matches the third ticket and one other (e.g., Ticket 1 & 3, or Ticket 2 & 3), its visual representation splits into two halves (e.g., left half green, right half yellow for Ticket 1 & 3).
*   **Persistence:** All revealed numbers and their final highlight states remain visible until the next game round.

### 3. Prize Evaluation & Result Messaging

*   **Evaluation:** After the overlays complete (at 0:30), the system evaluates winnings for **each confirmed ticket** independently against the drawn numbers.
*   **Winnings Calculation:** The existing `calculateWinnings()` logic (including jackpot rules from Phase 5) is applied to each ticket.
*   **Result Message (0:30 – 0:20):**
    *   A feedback message appears above the drawn numbers for 10 seconds.
    *   This message will be **one consolidated message which sums up all the winning amount and show as the final winning amount**. If a jackpot is won by any ticket, the message prioritizes the jackpot win, and no regular credit winnings are displayed for that specific ticket.

## UI/UX Requirements

*   **Number Selection Panel:**
    *   Initially displays the 1-27 number grid and "Confirm Numbers" button.
    *   After a ticket is confirmed, the grid hides, and the confirmed ticket (**row of circular chips**) appears.
    *   The "Add next ticket" button appears below confirmed tickets if fewer than 3 are submitted and the timer is "OPEN".
    *   Clicking "Add next ticket" reveals an empty grid for new selection. The previously confirmed tickets remain visible above the grid.
    *   Confirmed tickets are displayed in a vertical stack, each as a compact `LotteryTicket` row.
    *   The entire confirmed tickets section (including the grid when visible) should be wrapped in a vertical scroll container if its content exceeds its allotted height, ensuring no horizontal scrolling and fixed UI elements (draw grid, credits bar) remain in place.
*   **`Ball3D` Component:**
    *   Must support rendering with multiple highlight colors (green, blue, yellow) and combinations thereof (split circles, wedges).
    *   Maintain perfectly circular chip shape and centered numbers regardless of highlight state or resizing.
*   **Result Bar:**
    *   The `ResultBar` component will be updated to display **one consolidated message** summarizing the total winnings across all confirmed tickets for the current draw.

## Acceptance Criteria

*   [ ] User can confirm up to 3 distinct tickets per draw cycle.
*   [ ] Each confirmed ticket deducts 30 credits from the wallet.
*   [ ] The number selection grid clears and hides after each ticket confirmation, reappearing only when "Add next ticket" is clicked.
*   [ ] "Add next ticket" button is visible only when fewer than 3 tickets are confirmed and the timer is "OPEN".
*   [ ] Confirmed tickets are displayed as compact rows of chips, stacked vertically.
*   [ ] The confirmed tickets section handles vertical overflow gracefully with scrolling, without affecting other UI sections.
*   [ ] During the reveal phase (0:45-0:30), numbers matching Ticket 1 are highlighted green.
*   [ ] From 0:35-0:33, numbers matching Ticket 2 are highlighted blue, with split circles for overlaps with Ticket 1.
*   [ ] From 0:32-0:30, numbers matching Ticket 3 are highlighted yellow, with split circles/wedges for overlaps with Ticket 1 and/or Ticket 2.
*   [ ] The result message (0:30-0:20) accurately summarizes winnings for all confirmed tickets, prioritizing jackpot wins.
*   [ ] All confirmed tickets are cleared at the start of a new draw cycle.

## Technical Considerations

*   **`NumberSelectionContext.tsx`**: Introduce `confirmedTickets: number[][]` state. Refactor `confirm()` and add `startNewTicketSelection()` for managing multiple entries.
*   **`WalletContext.tsx`**: `addConfirmedTicket` will be called multiple times per cycle. `awardTicketWinnings` will need to process all unprocessed tickets for the current cycle.
*   **`Ball3D.tsx`**: Significant refactor required to support multi-color highlighting (e.g., using SVG or advanced CSS gradients for split circles/wedges).
*   **`useRevealAnimation.ts`**: Update to manage timed highlight overlays for Ticket 2 and Ticket 3, requiring a more complex state for `drawnNumbers` (e.g., `number` + `matchStatus`).
*   **New Component**: `ConfirmedTicketsList.tsx` to display the stack of confirmed tickets, potentially using `shadcn/ui`'s `ScrollArea`.
*   **`useDrawPrizes.ts`**: Adapt to iterate through all confirmed tickets for the current cycle to calculate and award prizes.
*   **`ResultBar.tsx`**: Update to display a summary of multiple ticket outcomes.