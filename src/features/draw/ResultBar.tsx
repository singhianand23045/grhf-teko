
import React, { useEffect, useState } from "react";

interface ResultBarProps {
  visible: boolean;
  creditsWon: number | null;
}

export default function ResultBar({ visible, creditsWon }: ResultBarProps) {
  if (!visible) return null;

  const isWin = (creditsWon ?? 0) > 0;

  return (
    <div className="w-full flex justify-center items-center py-2">
      <div
        className={`rounded-xl border-2 shadow-md px-7 py-2 font-semibold text-base
          ${
            isWin
              ? "bg-green-50 border-green-400 text-green-700 animate-scale-in"
              : "bg-yellow-50 border-yellow-300 text-yellow-700 animate-fade-in"
          }
        `}
        style={{ minWidth: 210, maxWidth: 350, textAlign: "center" }}
        data-testid="result-bar"
      >
        {isWin
          ? `Congrats! You won ${creditsWon} credits!`
          : "Try again. Win next time!"}
      </div>
    </div>
  );
}
