
import React from "react";

interface ResultBarProps {
  visible: boolean;
  creditsWon: number | null;
  jackpot?: boolean;
}

export default function ResultBar({ visible, creditsWon, jackpot }: ResultBarProps) {
  if (!visible) return null;

  const isJackpot = jackpot && creditsWon && creditsWon > 0;
  const isWin = creditsWon && creditsWon > 0 && !isJackpot;

  return (
    <div className="w-full flex justify-center items-center py-2">
      <div
        className={`rounded-xl border-2 shadow-md px-7 py-2 font-semibold text-base
          ${
            isJackpot
              ? "bg-yellow-100 border-yellow-500 text-yellow-800 animate-scale-in"
              : isWin
              ? "bg-green-50 border-green-400 text-green-700 animate-scale-in"
              : "bg-yellow-50 border-yellow-300 text-yellow-700 animate-fade-in"
          }
        `}
        style={{ minWidth: 210, maxWidth: 350, textAlign: "center" }}
        data-testid="result-bar"
      >
        {isJackpot
          ? `Congrats! You won the jackpot of $${creditsWon}!`
          : isWin
          ? `Congrats! You won ${creditsWon} credits!`
          : "Try again. Win next time!"}
      </div>
    </div>
  );
}
