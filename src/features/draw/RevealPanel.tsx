
import React, { useEffect, useRef } from "react";
import { useDrawEngine } from "./DrawEngineContext";
import { useNumberSelection } from "../number-select/NumberSelectionContext";
import { useWallet } from "../wallet/WalletContext";
import ResultBar from "./ResultBar";
import { useResultBar } from "./useResultBar";
import { useTimer } from "../timer/timer-context";

/**
 * This panel shows the reveal animation and result bar for the draw.
 * The result bar is displayed from 0:25 to 0:15 (10 seconds).
 */
export default function RevealPanel() {
  const { sets, drawnNumbers } = useDrawEngine(); // fixed: use custom hook
  const { picked, isConfirmed } = useNumberSelection(); // fixed: use custom hook
  const wallet = useWallet(); // fixed: use custom hook

  // ResultBar state and handlers
  const { resultBar, showResultBar, hideResultBar, cleanup } = useResultBar();

  // Timer logic: show/hide result bar exactly from 0:25 to 0:15
  const { countdown } = useTimer();
  const timerTriggered = useRef(false);

  useEffect(() => {
    // Listen for the countdown value to reach 00:25
    if (!timerTriggered.current && countdown === "00:25") {
      // Calculate winnings here (simulate or use wallet/history logic if needed).
      // For this simple reveal, let's just calculate as in prior approach:
      let totalCreditsWon = 0;
      if (sets && picked && picked.length === 6) {
        for (let i = 0; i < sets.length; i++) {
          const matches = sets[i].filter((number) => picked.includes(number)).length;
          let creditsWon = 0;

          if (matches === 5) creditsWon = 100;
          else if (matches === 4) creditsWon = 40;
          else if (matches === 3) creditsWon = 20;
          else if (matches === 2) creditsWon = 10;

          totalCreditsWon += creditsWon;
        }
        // You could call wallet.awardCredits here if needed (depends on overall design).
      }
      showResultBar(totalCreditsWon);
      timerTriggered.current = true;
    }
    // Hide the bar at "00:15"
    if (timerTriggered.current && countdown === "00:15") {
      hideResultBar();
      timerTriggered.current = false;
    }
    // Cleanup on unmount
    return cleanup;
  }, [countdown, showResultBar, hideResultBar, cleanup, sets, picked]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Result message bar */}
      <ResultBar
        visible={resultBar.show}
        creditsWon={resultBar.credits}
      />
      <div className="w-full flex flex-col items-center justify-center h-full py-4">
        <div className="w-full space-y-4">
          {sets &&
            sets.map((set, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-nowrap justify-center items-center gap-4 w-full max-w-full min-h-[40px]"
              >
                {set.map((number, colIdx) => {
                  const isDrawn = drawnNumbers.includes(number);
                  const isMatched = picked.includes(number);
                  return (
                    <span
                      key={colIdx}
                      className={`flex items-center justify-center rounded-full border-2 select-none aspect-square transition-all
                        ${isDrawn
                          ? "bg-white text-black border-black font-semibold"
                          : "bg-black text-white border-black"}
                        ${isMatched && isDrawn ? "animate-pulse border-green-500 text-green-600 font-extrabold" : ""}
                      `}
                      style={{
                        width: "clamp(2.2rem, 7vw, 3rem)",
                        minWidth: 40,
                        height: "clamp(2.2rem, 7vw, 3rem)",
                        minHeight: 40,
                        fontSize: "clamp(0.9rem, 4.5vw, 1.1rem)",
                        lineHeight: 1.1,
                      }}
                    >
                      {isDrawn ? number : null}
                    </span>
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
