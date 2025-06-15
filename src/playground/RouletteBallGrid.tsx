
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

  function Ball3D({
    spinning,
    number,
    highlight,
  }: {
    spinning?: boolean;
    number?: number;
    highlight?: boolean;
  }) {
    // Determine color based on user pick (highlight)
    const ballBackground = highlight
      ? "bg-green-500"
      : "bg-gradient-to-b from-white via-slate-100 to-slate-300";
    const borderColor = highlight
      ? "border-green-600/60"
      : "border-slate-500/40";
    const ballBoxShadow = highlight
      ? "0 3px 16px 2px rgba(34,197,94,0.28), 0 0.5px 2.8px 0px #eaf3fa"
      : "0 3px 8px 2px rgba(80,90,120,0.20), 0 0.5px 2.8px 0px #eaf3fa";

    return (
      <div
        className={`relative flex items-center justify-center aspect-square`}
        style={{
          width: 38,
          height: 38,
          minWidth: 28,
          minHeight: 28,
        }}
      >
        {/* Ball surface */}
        <span
          className={`
            absolute inset-0 rounded-full
            ${ballBackground}
            shadow-lg border-[2.5px] ${borderColor}
          `}
          style={{
            boxShadow: ballBoxShadow,
            transition: "background 0.3s",
          }}
          aria-hidden
        />
        {/* Gloss for spinning, static gloss for stopped */}
        <span
          className="absolute left-0 top-0 w-full h-full rounded-full pointer-events-none overflow-hidden"
          aria-hidden
          style={{ zIndex: 2 }}
        >
          {spinning ? (
            <span
              className="block absolute left-[-40%] top-1/4 w-2/3 h-1/2"
              style={{
                background:
                  "linear-gradient(100deg, rgba(255,255,255,0.33) 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.09) 100%)",
                filter: "blur(2.5px)",
                borderRadius: "40%",
                transform: "rotate(-14deg)",
                animation: "roulette-ball-gloss-move 0.85s linear infinite",
              }}
            />
          ) : highlight ? (
            // Subtle gloss over green if highlighted
            <span
              className="block absolute left-[18%] top-1/4 w-2/3 h-2/5"
              style={{
                background:
                  "linear-gradient(96deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.05) 100%)",
                filter: "blur(1.8px)",
                borderRadius: "50%",
                transform: "rotate(-15deg)",
                opacity: 0.9,
              }}
            />
          ) : (
            // Standard gloss for stopped white ball
            <span
              className="block absolute left-[20%] top-1/4 w-2/3 h-1/2"
              style={{
                background:
                  "linear-gradient(100deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,0.07) 98%)",
                filter: "blur(2.1px)",
                borderRadius: "40%",
                transform: "rotate(-14deg)",
                opacity: 0.85,
              }}
            />
          )}
        </span>
        {/* Center highlight - only show if not highlighted */}
        {!highlight && (
          <span
            className="absolute"
            style={{
              top: "18%",
              left: "38%",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "radial-gradient(circle at 40% 40%, #fff 85%, #e0ebfc11 100%)",
              opacity: 0.82,
              filter: "blur(1px)",
            }}
            aria-hidden
          />
        )}
        {/* Number overlay */}
        {typeof number === "number" && (
          <span
            className={`relative font-extrabold text-base select-none`}
            style={{
              zIndex: 10,
              color: highlight ? "#1a1a1a" : "#222",
              textShadow: highlight
                ? "0 2px 7px #99f6e0ee"
                : "0 1px 6px #d4dfff88",
              fontFamily: "Poppins, Inter, sans-serif",
              letterSpacing: "-0.02em",
              userSelect: "none",
            }}
          >
            {number}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="inline-block p-2 bg-white rounded-xl shadow">
        <div className="grid grid-cols-6 grid-rows-3 gap-3">
          {balls.map((ball, i) =>
            ball.state === "spinning" ? (
              <Ball3D key={"spin" + i} spinning />
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

