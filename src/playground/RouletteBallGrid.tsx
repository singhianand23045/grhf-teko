
import React, { useState, useEffect } from "react";

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
    // Reset for new round
    if (!reveal) {
      setBalls(Array(ROWS * COLS).fill({ state: "spinning" }));
      setRevealedCount(0);
    }
  }, [reveal, numbersToReveal]);

  useEffect(() => {
    if (reveal && numbersToReveal.length === ROWS * COLS) {
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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="inline-block p-2 bg-white rounded-xl shadow">
        <div className="grid grid-cols-6 grid-rows-3 gap-3">
          {balls.map((ball, i) =>
            ball.state === "spinning" ? (
              <div
                key={"ball" + i}
                className="relative flex items-center justify-center"
                style={{ width: 38, height: 38, minWidth: 28, minHeight: 28 }}
              >
                {/* 3D white ball look: gradient + shadow + (animated) highlight gloss */}
                <span
                  className={`
                    absolute inset-0 rounded-full
                    bg-gradient-to-b from-white via-slate-100 to-slate-300 
                    shadow-lg border-[2.5px] border-slate-500/40
                    `}
                  style={{
                    boxShadow:
                      "0 3px 8px 2px rgba(80,90,120,0.20), 0 0.5px 2.8px 0px #eaf3fa",
                  }}
                  aria-hidden
                />
                {/* Animated left-to-right gloss highlight */}
                <span
                  className="absolute left-0 top-0 w-full h-full rounded-full pointer-events-none overflow-hidden"
                  aria-hidden
                  style={{
                    zIndex: 2,
                  }}
                >
                  <span
                    className="block absolute left-[-40%] top-1/4 w-2/3 h-1/2"
                    style={{
                      background:
                        "linear-gradient(100deg, rgba(255,255,255,0.33) 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.09) 100%)",
                      filter: "blur(2.5px)",
                      borderRadius: "40%",
                      transform: "rotate(-14deg)",
                      animation:
                        "roulette-ball-gloss-move 0.8s linear infinite",
                    }}
                  />
                </span>
                {/* Optional: subtle central specular dot for realism */}
                <span
                  className="absolute"
                  style={{
                    top: "18%",
                    left: "38%",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 40% 40%, #fff 85%, #e0ebfc11 100%)",
                    opacity: 0.85,
                    filter: "blur(1px)",
                  }}
                  aria-hidden
                />
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
      {/* Animation keyframes for roulette ball gloss */}
      <style>{`
        @keyframes roulette-ball-gloss-move {
          0%   { left: -45%; opacity: 0.2;}
          12%  { opacity: 0.5;}
          38%  { opacity: 0.98;}
          50%  { left: 55%; opacity: 1;}
          80%  { opacity: .5;}
          100% { left: 102%; opacity: 0.2;}
        }
      `}</style>
    </div>
  );
}
