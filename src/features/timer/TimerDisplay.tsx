import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "./timer-context";
import { Repeat } from "lucide-react";
import { NumberSelectionProvider } from "../number-select/NumberSelectionContext";
import NumberSelectionPanel from "../number-select/NumberSelectionPanel";
import { DrawEngineProvider } from "../draw/DrawEngineContext";
import RevealPanel from "../draw/RevealPanel";
import LotteryTicket from "../number-select/LotteryTicket";

// For screen proportions
const LOGICAL_HEIGHT = 874; // Should match page layout

/**
 * Calculate section heights:
 * - Timer: 1/8 = ~12.5%
 * - Draw (Reveal): 33%
 * - Number Selection/Confirmed: 33%
 * - Remaining height (if any) distributed evenly by flex.
 */

export default function TimerDisplay() {
  const { countdown, state, resetDemo } = useTimer();

  // Height fractions
  const TIMER_FRACTION = 1 / 8; // 12.5%
  const MIDDLE_FRACTION = 0.33; // 33%
  const BOTTOM_FRACTION = 0.33; // 33%

  // Timer Section (top)
  const TimerSection = (
    <div
      className="flex items-center justify-center w-full"
      style={{
        height: `${TIMER_FRACTION * 100}%`,
        minHeight: 46,
        maxHeight: 120,
      }}
    >
      <Card
        className="flex items-center justify-center bg-gradient-to-b from-[#f4f4fa] to-[#e3e7fb] border-2 border-white shadow-xl rounded-xl w-1/2"
        style={{
          width: `50%`,
          minWidth: 116,
          maxWidth: 210,
          height: "100%",
          minHeight: 46,
          padding: 0,
        }}
      >
        <span
          className="font-mono font-extrabold tracking-widest text-[#24266e] select-none animate-fade-in"
          style={{
            fontSize: "clamp(1.3rem, 4vw, 2rem)",
            lineHeight: 1.1,
          }}
          data-testid="timer"
        >
          {countdown}
        </span>
      </Card>
    </div>
  );

  // Drawn Numbers/Reveal Section (middle)
  const DrawSection = (
    <div
      className="flex flex-col items-center justify-center w-full"
      style={{
        height: `${MIDDLE_FRACTION * 100}%`,
        minHeight: 120,
      }}
    >
      {state === "REVEAL" ? (
        // 🟢 Fix: Context for RevealPanel
        <NumberSelectionProvider>
          <DrawEngineProvider>
            <RevealPanel />
          </DrawEngineProvider>
        </NumberSelectionProvider>
      ) : (
        // When not in reveal state, show 18 filled black circles in 3x6 grid for placeholder
        <div className="w-full flex flex-col items-center justify-center h-full py-8">
          <div className="w-full space-y-6">
            {Array.from({ length: 3 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-nowrap justify-center items-center gap-4 w-full max-w-full min-h-[56px]"
              >
                {Array.from({ length: 6 }).map((_, colIdx) => (
                  <span
                    key={colIdx}
                    className="flex items-center justify-center rounded-full bg-black border-2 border-black select-none aspect-square transition-all"
                    style={{
                      width: "clamp(2.2rem, 7vw, 3rem)",
                      minWidth: 40,
                      height: "clamp(2.2rem, 7vw, 3rem)",
                      minHeight: 40,
                      fontSize: "clamp(0.9rem, 4.5vw, 1.1rem)",
                      lineHeight: 1.1,
                    }}
                    aria-hidden
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Number Selection/User's Ticket/Complete Section (bottom)
  const BottomSection = (
    <div
      className="flex flex-col items-center justify-center w-full"
      style={{
        height: `${BOTTOM_FRACTION * 100}%`,
        minHeight: 120,
      }}
    >
      {state !== "COMPLETE" && state !== "REVEAL" && (
        <NumberSelectionProvider>
          <section className="w-full flex flex-col items-center my-2">
            <NumberSelectionPanel />
          </section>
        </NumberSelectionProvider>
      )}
      {state === "REVEAL" && (
        <section className="w-full flex flex-col items-center mt-2">
          {/* Ticket already shown in DrawSection (RevealPanel contains LotteryTicket) */}
        </section>
      )}
      {state === "COMPLETE" && (
        <section className="w-full flex flex-col items-center mt-4 animate-fade-in">
          <p className="text-base font-semibold text-center mb-4">Demo Complete — 2 cycles finished.</p>
          <Button variant="secondary" size="lg" className="mt-2" onClick={resetDemo}>
            <Repeat className="mr-1 h-4 w-4" /> Restart Demo
          </Button>
        </section>
      )}
    </div>
  );

  return (
    <div
      className="flex flex-col w-full h-full"
      style={{
        height: "100%",
        minHeight: LOGICAL_HEIGHT,
      }}
    >
      {TimerSection}
      {DrawSection}
      {BottomSection}
    </div>
  );
}
