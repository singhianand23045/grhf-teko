import React, { useState, useEffect, useRef } from "react";
import Ball3D from "./Ball3D";
import { useSpinSetting } from "./useSpinSetting";

// Ball state per slot: spinning or stopped with a number
type GridBall =
  | { state: "spinning" }
  | { state: "stopped"; number: number; isUserPick: boolean };

type Props = {
  numbersToReveal?: number[];
  reveal: boolean;
  userPicks?: number[];
  onDone?: () => void;
};

const ROWS = 3;
const COLS = 6;

const SPIN_SETTINGS = [
  { label: "left fastest", direction: -1, speed: 0.22 },
  { label: "left fast", direction: -1, speed: 0.38 },
  { label: "left slow", direction: -1, speed: 0.65 },
  { label: "right slow", direction: 1, speed: 0.65 },
  { label: "right fast", direction: 1, speed: 0.38 },
  { label: "right fastest", direction: 1, speed: 0.22 },
];
// Index: 0..2 for left speeds, 3..5 for right

function getSpinConfig(spinLevel: number) {
  // spinLevel: -3..-1 for left, 1..3 for right. 0 forbidden.
  if (spinLevel < 0) return SPIN_SETTINGS[-spinLevel - 1];
  if (spinLevel > 0) return SPIN_SETTINGS[spinLevel + 2];
  // fallback right slow
  return SPIN_SETTINGS[3];
}

export default function RouletteBallGrid({
  numbersToReveal = [],
  reveal,
  userPicks = [],
  onDone,
}: Props) {
  const [balls, setBalls] = useState<GridBall[]>(
    Array(ROWS * COLS).fill({ state: "spinning" })
  );
  const [revealedCount, setRevealedCount] = useState(0);

  // New state: has the reveal animation finished this round?
  const [animationComplete, setAnimationComplete] = useState(false);

  // -3: left fastest, -2: left fast, -1: left slow; 1: right slow, 2: right fast, 3: right fastest
  const [spinSetting, setSpinSetting] = useState(1); // Start with right slow
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Attach swipe/touch handlers
  const { attachSwipeHandlers } = useSpinSetting(reveal, setSpinSetting);

  useEffect(() => {
    // Reset for new round
    if (!reveal) {
      setBalls(Array(ROWS * COLS).fill({ state: "spinning" }));
      setRevealedCount(0);
      setSpinSetting(1); // Reset to right slow
      setAnimationComplete(false); // Reset animation completion flag
    }
  }, [reveal, numbersToReveal]);

  useEffect(() => {
    // Only reveal if not already complete
    if (
      reveal &&
      numbersToReveal.length === ROWS * COLS &&
      !animationComplete
    ) {
      let cancelled = false;
      let idx = 0;
      function revealNext() {
        setBalls(prev =>
          prev.map((ball, i) =>
            i <= idx
              ? {
                  state: "stopped",
                  number: numbersToReveal[i],
                  isUserPick: userPicks.includes(numbersToReveal[i]),
                }
              : { state: "spinning" }
          )
        );
        setRevealedCount(idx + 1);
        idx++;
        if (idx < ROWS * COLS && !cancelled) {
          setTimeout(revealNext, 320);
        } else if (!cancelled) {
          setAnimationComplete(true); // Mark animation complete
          onDone?.();
        }
      }
      revealNext();
      return () => {
        cancelled = true;
      };
    }
    // Only run this if reveal/numbersToReveal/animationComplete changes. Remove userPicks/onDone from deps to avoid unwanted reruns.
    // eslint-disable-next-line
  }, [reveal, numbersToReveal, animationComplete]);

  const currentSpinConf = getSpinConfig(spinSetting);

  // Touch swipe handlers for the grid
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || reveal) return;
    const detach = attachSwipeHandlers(grid);
    return detach;
  }, [reveal, attachSwipeHandlers]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="inline-block p-2 bg-white rounded-xl shadow">
        <div
          className="grid grid-cols-6 grid-rows-3 gap-3 touch-pan-x"
          ref={gridRef}
        >
          {balls.map((ball, i) =>
            ball.state === "spinning" ? (
              <Ball3D
                key={"spin" + i}
                spinning
                spinConfig={!reveal ? getSpinConfig(spinSetting) : undefined}
              />
            ) : (
              <Ball3D
                key={"stop" + i}
                number={ball.number}
                highlight={ball.isUserPick}
              />
            )
          )}
        </div>
      </div>
      {/* Optional debug */}
      {/* <div className="mt-2 text-xs text-slate-500">{spinSetting < 0 ? "⟲" : "⟳"} {currentSpinConf.label}</div> */}
    </div>
  );
}
