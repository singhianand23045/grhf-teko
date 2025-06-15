
import { useEffect } from "react";

/**
 * Ensures ResultBar is always hidden/cleared on phase changes and resets.
 */
type Args = {
  state: string;
  cycleIndex: number;
  resultBar: { show: boolean; credits: number | null };
  hideResultBar: () => void;
};

export function useResultBarVisibility({
  state,
  cycleIndex,
  resultBar,
  hideResultBar
}: Args) {
  // Hide ResultBar immediately when not in REVEAL state
  useEffect(() => {
    if (state !== "REVEAL" && resultBar.show) {
      hideResultBar();
    }
    if (state === "OPEN" && resultBar.show) {
      hideResultBar();
    }
    if ((state === "CUT_OFF" || state === "COMPLETE") && resultBar.show) {
      hideResultBar();
    }
    // eslint-disable-next-line
  }, [state, cycleIndex]);

  // Always hide ResultBar on reset
  useEffect(() => {
    hideResultBar();
    // eslint-disable-next-line
  }, [cycleIndex]);
}
