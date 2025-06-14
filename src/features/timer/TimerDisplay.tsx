
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "./timer-context";
import { Repeat } from "lucide-react";
import { NumberSelectionProvider } from "../number-select/NumberSelectionContext";
import NumberSelectionPanel from "../number-select/NumberSelectionPanel";
import { DrawEngineProvider } from "../draw/DrawEngineContext";
import RevealPanel from "../draw/RevealPanel";

export default function TimerDisplay() {
  const { countdown, state, resetDemo } = useTimer();

  // Scheduler & Timer section (always at top)
  const TimerSection = (
    <section className="w-full flex flex-col items-center mb-6">
      <h2 className="text-xl font-semibold text-[#1a1855] mb-2 tracking-wider">Scheduler & Timer</h2>
      <Card className="w-full max-w-xs shadow-xl rounded-xl bg-gradient-to-b from-[#f4f4fa] to-[#e3e7fb] border-2 border-white">
        <div className="flex flex-col items-center py-7 px-4">
          <span
            className="text-[64px] font-mono font-extrabold tracking-widest text-[#24266e] select-none animate-fade-in"
            data-testid="timer"
          >
            {countdown}
          </span>
        </div>
      </Card>
    </section>
  );

  // Number Selection section
  const SelectionSection = (
    state !== "COMPLETE" && state !== "REVEAL" && (
      <section className="w-full flex flex-col items-center my-3">
        <h2 className="text-lg font-semibold mb-3 text-[#257a2a] tracking-wide">Number Selection</h2>
        <NumberSelectionProvider>
          <NumberSelectionPanel />
        </NumberSelectionProvider>
      </section>
    )
  );

  // Draw Engine & Reveal section (with drawn numbers grid + user's ticket, never overlapping)
  const DrawSection = (
    state === "REVEAL" && (
      <section className="w-full flex flex-col items-center mt-3 mb-2">
        <DrawEngineProvider>
          <RevealPanel />
        </DrawEngineProvider>
      </section>
    )
  );

  // Demo complete section
  const CompleteSection = (
    state === "COMPLETE" && (
      <section className="w-full flex flex-col items-center mt-10 animate-fade-in">
        <p className="text-base font-semibold text-center mb-4">Demo Complete — 2 cycles finished.</p>
        <Button variant="secondary" size="lg" className="mt-2" onClick={resetDemo}>
          <Repeat className="mr-1 h-4 w-4" /> Restart Demo
        </Button>
      </section>
    )
  );

  return (
    <div className="flex flex-col items-center w-full h-full justify-between space-y-3 px-1">
      {/* 1. Timer/Countdown Always on Top */}
      {TimerSection}
      {/* 2. Number Selection Panel, only in "OPEN" or "CUT_OFF" */}
      {SelectionSection}
      {/* 3. Drawn Numbers Grid + Ticket, only in REVEAL */}
      {DrawSection}
      {/* 4. Complete Message, only in COMPLETE */}
      {CompleteSection}
    </div>
  );
}
