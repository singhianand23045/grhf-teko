import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "./timer-context";
import { Repeat } from "lucide-react";
import { DrawEngineProvider } from "../draw/DrawEngineContext";
import RevealPanel from "../draw/RevealPanel";
import LotteryTicket from "../number-select/LotteryTicket";
import NumberSelectionPanel from "../number-select/NumberSelectionPanel";
import CreditsBar from "../wallet/CreditsBar";
import JackpotBar from "../jackpot/JackpotBar";

// For screen proportions
const LOGICAL_HEIGHT = 874; // Should match page layout

/**
 * Layout:
 * - Timer: 10%
 * - Spacer: 3%
 * - Drawn numbers: 33%
 * - Credits: 5%
 * - Confirmed/user numbers: 40%
 */

const JACKPOT_TIMER_HEIGHT = 0.15;
const SPACER_HEIGHT = 0.02; // reduce a bit for extra space
const DRAW_SECTION_HEIGHT = 0.35;

export default function TimerDisplay() {
  const { countdown, state, resetDemo } = useTimer();

  // JACKPOT + TIMER HEADER -- Phase 5 top row
  const JackpotTimerHeader = (
    <div
      className="w-full flex flex-row items-center justify-between px-0 pt-4 pb-0"
      style={{
        minHeight: Math.floor(LOGICAL_HEIGHT * JACKPOT_TIMER_HEIGHT),
        maxHeight: Math.ceil(LOGICAL_HEIGHT * JACKPOT_TIMER_HEIGHT),
        height: `${JACKPOT_TIMER_HEIGHT * 100}%`
      }}
      data-testid="jackpot-timer-header"
    >
      <div className="flex-1 flex justify-start">
        <JackpotBar />
      </div>
      <div className="flex-1 flex justify-end pr-4">
        <Card
          className="flex items-center justify-center bg-gradient-to-b from-[#f4f4fa] to-[#e3e7fb] border-2 border-white shadow-xl rounded-xl"
          style={{
            minWidth: 116,
            maxWidth: 210,
            height: 48,
            minHeight: 40,
            padding: 0,
          }}
        >
          <span
            className="font-mono font-extrabold tracking-widest text-[#24266e] select-none animate-fade-in"
            style={{ fontSize: "clamp(1.3rem, 4vw, 2rem)", lineHeight: 1.1 }}
            data-testid="timer"
          >
            {countdown}
          </span>
        </Card>
      </div>
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

  // NOTE: set both sections to 35% height, both before and after reveal
  const RevealSectionWithTicket = (
    <DrawEngineProvider>
      <div className="flex flex-col w-full h-full">
        <div
          className="flex flex-col items-center justify-center w-full flex-shrink-0 flex-grow-0 overflow-y-hidden"
          style={{
            height: `${DRAW_SECTION_HEIGHT * 100}%`,
            minHeight: Math.floor(LOGICAL_HEIGHT * DRAW_SECTION_HEIGHT),
            maxHeight: `${DRAW_SECTION_HEIGHT * 100}%`,
            flexBasis: `${DRAW_SECTION_HEIGHT * 100}%`,
          }}
        >
          <RevealPanel />
        </div>
        {/* Confirmed numbers section: always 40% height */}
        <div
          className="flex-shrink-0 flex-grow-0 flex flex-col items-center justify-center overflow-y-hidden"
          style={{
            height: "40%",
            minHeight: Math.floor(LOGICAL_HEIGHT * 0.4),
            maxHeight: Math.ceil(LOGICAL_HEIGHT * 0.4),
          }}
        >
          <section className="w-full flex flex-col items-center mt-1 h-full">
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

  // Confirmed numbers / user's ticket / bottom panel — always 40% of height
  const ConfirmedSection = (
    <div
      className="flex flex-col items-center justify-center w-full flex-shrink-0 flex-grow-0 overflow-y-hidden"
      style={{
        height: "40%",
        minHeight: Math.floor(LOGICAL_HEIGHT * 0.4),
        maxHeight: Math.ceil(LOGICAL_HEIGHT * 0.4),
      }}
    >
      {/* During selection */}
      {state !== "COMPLETE" && state !== "REVEAL" && (
        <section className="w-full flex flex-col items-center my-0 h-full">
          <NumberSelectionPanel />
        </section>
      )}
      {/* Complete: restart demo */}
      {state === "COMPLETE" && (
        <section className="w-full flex flex-col items-center mt-2 animate-fade-in h-full">
          <p className="text-base font-semibold text-center mb-2">Demo Complete — 2 cycles finished.</p>
          <Button variant="secondary" size="lg" className="mt-2" onClick={resetDemo}>
            <Repeat className="mr-1 h-4 w-4" /> Restart Demo
          </Button>
        </section>
      )}
    </div>
  );

  /* CreditsBar sits always between drawn numbers and confirmed section;
     Hide only during demo complete */
  return (
    <div
      className="flex flex-col w-full h-full"
      style={{
        height: "100%",
        minHeight: LOGICAL_HEIGHT,
      }}
    >
      {JackpotTimerHeader}
      {Spacer}
      {state === "REVEAL" ? RevealSectionWithTicket : DrawSection}
      <CreditsBar />
      {state !== "REVEAL" && ConfirmedSection}
    </div>
  );
}
