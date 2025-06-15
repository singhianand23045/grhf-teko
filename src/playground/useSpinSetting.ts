
import { useRef, useEffect } from "react";

/**
 * Custom hook that handles swipe gestures for spin setting.
 * Returns ref callback, and current spinSetting, and a setter.
 */
export function useSpinSetting(
  reveal: boolean,
  setSpinSetting: (cb: (prev: number) => number) => void
) {
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 30;

  // The consuming component should use this ref for the grid
  function attachSwipeHandlers(grid: HTMLDivElement | null) {
    if (!grid) return;

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      touchStartX.current = e.touches[0].clientX;
    }
    function handleTouchEnd(e: TouchEvent) {
      if (touchStartX.current === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const dx = touchEndX - touchStartX.current;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        setSpinSetting((prev) => {
          let next = prev;
          if (dx < 0) {
            // swipe left
            if (prev > -3) {
              // special case: going from right slow (1) to left slow (-1)
              if (prev === 1) {
                next = -1;
              } else if (prev === 2) {
                next = 1;
              } else if (prev === 3) {
                next = 2;
              } else {
                next = prev - 1;
                if (next === 0) next = -1;
              }
            }
          } else {
            // swipe right
            if (prev < 3) {
              // special case: going from left slow (-1) to right slow (1)
              if (prev === -1) {
                next = 1;
              } else if (prev === -2) {
                next = -1;
              } else if (prev === -3) {
                next = -2;
              } else {
                next = prev + 1;
                if (next === 0) next = 1;
              }
            }
          }
          if (next < -3) next = -3;
          if (next > 3) next = 3;
          if (next === 0) next = prev < 0 ? -1 : 1; // just safety
          return next;
        });
      }
      touchStartX.current = null;
    }
    grid.addEventListener("touchstart", handleTouchStart);
    grid.addEventListener("touchend", handleTouchEnd);

    return () => {
      grid.removeEventListener("touchstart", handleTouchStart);
      grid.removeEventListener("touchend", handleTouchEnd);
    };
  }

  useEffect(() => {
    // No-op placeholder for now. The hook is entirely "imperative" for the time being.
  }, [reveal]);

  return { attachSwipeHandlers };
}
