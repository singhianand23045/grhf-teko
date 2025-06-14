import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "./timer-context";
import { Repeat } from "lucide-react";
import { NumberSelectionProvider } from "../number-select/NumberSelectionContext";
import NumberSelectionPanel from "../number-select/NumberSelectionPanel";
import { DrawEngineProvider } from "../draw/DrawEngineContext";
import RevealPanel from "../draw/RevealPanel";
import LotteryTicket from "../number-select/LotteryTicket";
import CreditsBar from "../wallet/CreditsBar";

// For screen proportions
const LOGICAL_HEIGHT = 874; // Should match page layout

/**
 * New layout:
 * - Timer: 10%
 * - Spacer: 3%
 * - Drawn numbers: 33%
 * - Spacer: 3%
 * - Confirmed/user numbers: rest
 */

export default function TimerDisplay() {
  const { countdown, state, resetDemo } = useTimer();

  const TIMER_HEIGHT = 0.10;
  const SPACER_HEIGHT = 0.03;
  const DRAW_SECTION_HEIGHT = 0.20; // 20%

  // Timer Section (top)
  const TimerSection = (
    <div
      className="flex items-center justify-center w-full flex-shrink-0 flex-grow-0"
      style={{
        height: `${TIMER_HEIGHT * 100}%`,
        minHeight: 40,
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
          minHeight: 40,
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

  // Spacer Section (white, fixed height)
  const Spacer = (
    <div
      className="w-full flex-shrink-0 flex-grow-0 bg-white"
      style={{
        height: `${SPACER_HEIGHT * 100}%`,
        minHeight: Math.floor(LOGICAL_HEIGHT * SPACER_HEIGHT),
      }}
    ></div>
  );

  // NEW: 1% Spacer between drawn numbers and credits
  const DrawCreditsSpacer = (
    <div
      className="w-full flex-shrink-0 flex-grow-0 bg-transparent"
      style={{
        height: "1%",
        minHeight: Math.floor(LOGICAL_HEIGHT * 0.01),
        maxHeight: Math.ceil(LOGICAL_HEIGHT * 0.01 * 3),
      }}
      aria-hidden
    />
  );

  // Drawn+Ticket: Only during REVEAL, keep both in shared contexts vertically stacked
  const RevealSectionWithTicket = (
    <DrawEngineProvider>
      <div className="flex flex-col w-full h-full">
        {/* Drawn numbers grid */}
        <div
          className="flex flex-col items-center justify-center w-full flex-shrink-0 flex-grow-0 overflow-y-hidden"
          style={{
            height: "20%",              // force 20% of parent at all times
            minHeight: 85,              // safely allow a bit less
            maxHeight: "20%",
            flexBasis: "20%",
          }}
        >
          <RevealPanel />
        </div>
        {/* Confirmed numbers, take rest of available space below */}
        <div
          className="flex-grow flex flex-col items-center justify-center min-h-[80px] overflow-y-hidden"
          style={{
            minHeight: 80,
          }}
        >
          <section className="w-full flex flex-col items-center mt-1">
            <LotteryTicket compact />
          </section>
        </div>
      </div>
    </DrawEngineProvider>
  );

  // Drawn Numbers Section (before reveal)
  const DrawSection = (
    <div
      className="flex flex-col items-center justify-center w-full flex-shrink-0 flex-grow-0 overflow-y-hidden"
      style={{
        height: `${DRAW_SECTION_HEIGHT * 100}%`,
        minHeight: 100,
        maxHeight: `${DRAW_SECTION_HEIGHT * 100}%`,
        flexBasis: `${DRAW_SECTION_HEIGHT * 100}%`,
      }}
    >
      {/* Show grid of black dots if not reveal */}
      <div className="w-full flex flex-col items-center justify-center h-full py-4">
        <div className="w-full space-y-4">
          {Array.from({ length: 3 }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex flex-nowrap justify-center items-center gap-4 w-full max-w-full min-h-[40px]"
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
    </div>
  );

  // Confirmed numbers / user's ticket / bottom panel
  // Takes all remaining height at the bottom!
  const ConfirmedSection = (
    <div
      className="flex flex-col items-center justify-center w-full flex-grow overflow-y-hidden"
      style={{
        minHeight: 80,
      }}
    >
      {/* During selection */}
      {state !== "COMPLETE" && state !== "REVEAL" && (
        <section className="w-full flex flex-col items-center my-0">
          <NumberSelectionPanel />
        </section>
      )}
      {/* Complete: restart demo */}
      {state === "COMPLETE" && (
        <section className="w-full flex flex-col items-center mt-2 animate-fade-in">
          <p className="text-base font-semibold text-center mb-2">Demo Complete — 2 cycles finished.</p>
          <Button variant="secondary" size="lg" className="mt-2" onClick={resetDemo}>
            <Repeat className="mr-1 h-4 w-4" /> Restart Demo
          </Button>
        </section>
      )}
    </div>
  );

  // Insert CreditsBar between draw and confirmed numbers, always present except on demo complete
  return (
    <div
      className="flex flex-col w-full h-full"
      style={{
        height: "100%",
        minHeight: LOGICAL_HEIGHT,
      }}
    >
      {TimerSection}
      {Spacer}
      {/* Drawn numbers or reveal+ticket */}
      {state === "REVEAL" ? RevealSectionWithTicket : DrawSection}
      {/* CreditsBar always between drawn numbers and confirmed section; hide only during demo complete */}
      {state !== "COMPLETE" && <CreditsBar />}
      {Spacer}
      {/* Confirmed or selection */}
      {state !== "REVEAL" && ConfirmedSection}
    </div>
  );
}
