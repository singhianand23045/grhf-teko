
import React, { useState, useEffect } from "react";

// Ball state per slot: spinning or stopped with a number
type GridBall =
  | { state: "spinning" }
  | { state: "stopped"; number: number; isUserPick: boolean };

type Props = {
  numbersToReveal?: number[];   // numbers to reveal (length 18)
  reveal: boolean;              // if true, start revealing
  userPicks?: number[];         // user's picked numbers to highlight
  onDone?: () => void;
};

const ROWS = 3;
const COLS = 6;

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

  useEffect(() => {
    // Reset on "new round"
    if (!reveal) {
      setBalls(Array(ROWS * COLS).fill({ state: "spinning" }));
      setRevealedCount(0);
    }
  }, [reveal, numbersToReveal]);

  useEffect(() => {
    if (reveal && numbersToReveal.length === ROWS * COLS) {
      // Reveal balls one by one:
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
          setTimeout(revealNext, 320); // 320ms per ball for anticipation
        } else if (!cancelled) {
          onDone?.();
        }
      }
      revealNext();
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line
  }, [reveal, numbersToReveal, userPicks, onDone]);

  // Style for grid shape
  return (
    <div className="flex flex-col items-center w-full">
      <div className="inline-block p-2 bg-white rounded-xl shadow">
        <div className="grid grid-cols-6 grid-rows-3 gap-3">
          {balls.map((ball, i) =>
            ball.state === "spinning" ? (
              <div
                key={"ball" + i}
                className="relative flex items-center justify-center"
                style={{
                  width: 38,
                  height: 38,
                  minWidth: 28,
                  minHeight: 28,
                }}
              >
                <span
                  className="block rounded-full bg-black border-2 border-black aspect-square w-full h-full animate-[roulette-spin_0.8s_linear_infinite]"
                  style={{
                    boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                  }}
                  aria-hidden
                />
                {/* Fake roulette tick marks */}
                <span className="absolute left-0 top-0 w-full h-full pointer-events-none">
                  <svg viewBox="0 0 38 38" width="38" height="38">
                    {[...Array(8)].map((_, j) => (
                      <rect
                        key={j}
                        x="18.2"
                        y="1.4"
                        width="1.6"
                        height="3.8"
                        rx="0.6"
                        fill="#eeeeee"
                        transform={`rotate(${j * 45} 19 19)`}
                        opacity="0.4"
                      />
                    ))}
                  </svg>
                </span>
              </div>
            ) : (
              <span
                key={"stop" + i}
                className={`flex items-center justify-center rounded-full 
                  text-base font-black aspect-square transition-all
                  ${
                    ball.isUserPick
                      ? "bg-green-500 text-white border-2 border-green-700 shadow-green-300 shadow-lg animate-scale-in"
                      : "bg-white text-black border-[2px] border-black shadow"
                  }`}
                style={{
                  width: 38,
                  height: 38,
                  minWidth: 28,
                  minHeight: 28,
                }}
              >
                {ball.number}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Tailwind animation override for spinning
// Add globally: 
// @keyframes roulette-spin { to { transform: rotate(1turn); } }
