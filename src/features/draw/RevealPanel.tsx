
import React from "react";
import { useDrawEngine } from "./DrawEngineContext";

export default function RevealPanel() {
  const { drawnNumbers } = useDrawEngine();

  // Pad empty spots for unrevealed
  const revealFilled = [...drawnNumbers];
  while (revealFilled.length < 18) {
    revealFilled.push(undefined);
  }

  return (
    <div className="flex flex-col items-center py-3 w-full animate-fade-in">
      <div className="font-bold text-lg text-[#217d37] pb-1">Lucky Numbers</div>
      <div className="flex flex-nowrap justify-center items-center gap-2 bg-gradient-to-r from-green-100/80 via-white to-green-100/80 rounded-2xl shadow-inner px-1 py-4 w-full max-w-full"
        style={{
          minHeight: 48,
        }}
      >
        {revealFilled.map((n, i) =>
          n !== undefined ? (
            <span
              key={i}
              className="flex items-center justify-center rounded-full bg-green-600 text-white font-black shadow-green-300 shadow-lg border-[2px] border-green-900 select-none transition-all aspect-square animate-scale-in"
              style={{
                width: "clamp(2.1rem, 6vw, 2.6rem)",
                minWidth: 32,
                height: "clamp(2.1rem, 6vw, 2.6rem)",
                minHeight: 32,
                fontSize: "clamp(1rem, 5vw, 1.25rem)",
                lineHeight: 1.1,
              }}
            >
              {n}
            </span>
          ) : (
            <span
              key={i}
              className="flex items-center justify-center rounded-full bg-gray-200 text-gray-300 font-black border-[2px] border-gray-300 select-none aspect-square opacity-80"
              style={{
                width: "clamp(2.1rem, 6vw, 2.6rem)",
                minWidth: 32,
                height: "clamp(2.1rem, 6vw, 2.6rem)",
                minHeight: 32,
                fontSize: "clamp(1rem, 5vw, 1.25rem)",
                lineHeight: 1.1,
              }}
              aria-hidden
            >
              {/* empty slot */}
              --
            </span>
          )
        )}
      </div>
      <div className="pt-3 text-center text-muted-foreground text-sm">
        Numbers revealed in order—good luck!
      </div>
    </div>
  );
}
