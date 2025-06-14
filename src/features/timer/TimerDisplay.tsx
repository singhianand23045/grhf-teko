
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "./timer-context";
import { Repeat } from "lucide-react";
import { NumberSelectionProvider } from "../number-select/NumberSelectionContext";
import NumberSelectionPanel from "../number-select/NumberSelectionPanel";
import { DrawEngineProvider } from "../draw/DrawEngineContext";
import RevealPanel from "../draw/RevealPanel";

// For screen proportions
const LOGICAL_HEIGHT = 874; // Should match page layout
const LOGICAL_WIDTH = 402;

export default function TimerDisplay() {
  const { countdown, state, resetDemo } = useTimer();

  // 1. Timer/Countdown on the left (desktop), full width above other on mobile
  const TimerSection = (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Card
        className="flex items-center justify-center bg-gradient-to-b from-[#f4f4fa] to-[#e3e7fb] border-2 border-white shadow-xl rounded-xl"
        // width: 1/2 of container, height: 1/8 of full height (responsive), min sizes for mobile
        style={{
          width: `min(50%, 210px)`,
          height: `min(12.5%, 84px)`, // 1/8 of 674px is ~84px
          minWidth: 116,
          minHeight: 46,
          maxWidth: 210,
          maxHeight: 84,
          padding: 0,
        }}
      >
        <span
          className="font-mono font-extrabold tracking-widest text-[#24266e] select-none animate-fade-in"
          // font size: visually balanced and smaller than before
          style={{
            fontSize: "clamp(1.6rem, 5vw, 2.7rem)", // ~25-43px
            lineHeight: 1.1,
          }}
          data-testid="timer"
        >
          {countdown}
        </span>
      </Card>
    </div>
  );

  // Main content, selection and draw (right on desktop, below timer on mobile)
  const MainSection = (
    <div className="flex flex-col flex-1 items-center w-full justify-start">
      <NumberSelectionProvider>
        {/* Number Selection section */}
        {state !== "COMPLETE" && state !== "REVEAL" && (
          <section className="w-full flex flex-col items-center my-3">
            <h2 className="text-lg font-semibold mb-3 text-[#257a2a] tracking-wide">Number Selection</h2>
            <NumberSelectionPanel />
          </section>
        )}
        {/* Draw Engine & Reveal section (with drawn numbers grid + user's ticket, never overlapping) */}
        {state === "REVEAL" && (
          <section className="w-full flex flex-col items-center mt-3 mb-2">
            <DrawEngineProvider>
              <RevealPanel />
            </DrawEngineProvider>
          </section>
        )}
      </NumberSelectionProvider>
      {/* Demo complete section */}
      {state === "COMPLETE" && (
        <section className="w-full flex flex-col items-center mt-10 animate-fade-in">
          <p className="text-base font-semibold text-center mb-4">Demo Complete — 2 cycles finished.</p>
          <Button variant="secondary" size="lg" className="mt-2" onClick={resetDemo}>
            <Repeat className="mr-1 h-4 w-4" /> Restart Demo
          </Button>
        </section>
      )}
    </div>
  );

  // Responsive flex container: row (desktop), column (mobile)
  return (
    <div className="flex flex-col lg:flex-row items-stretch w-full h-full justify-between space-y-3 lg:space-y-0 lg:space-x-5 px-1">
      {/* Timer left, rest right */}
      <div className="w-full lg:w-1/2 flex items-start justify-center">
        {TimerSection}
      </div>
      <div className="w-full lg:w-1/2 flex flex-col">
        {MainSection}
      </div>
    </div>
  );
}

