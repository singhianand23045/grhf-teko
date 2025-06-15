
import { useTimer } from "../timer/timer-context";
import LotteryTicket from "./LotteryTicket";
import NumberSelectionPanel from "./NumberSelectionPanel";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";

const LOGICAL_HEIGHT = 874;

export default function ConfirmedNumbersSection() {
  const { state, resetDemo } = useTimer();

  return (
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
        <section className="w-full flex flex-col items-center justify-center my-0 h-full">
          <NumberSelectionPanel />
        </section>
      )}
      {/* Complete: show vertical stack, all centered */}
      {state === "COMPLETE" && (
        <section className="w-full h-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
            <p className="text-base font-semibold text-center mb-2">Demo Complete — 2 cycles finished.</p>
            <LotteryTicket compact />
            <Button variant="secondary" size="lg" className="mt-2" onClick={resetDemo}>
              <Repeat className="mr-1 h-4 w-4" /> Restart Demo
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
