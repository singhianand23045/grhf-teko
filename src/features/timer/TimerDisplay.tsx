
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "./timer-context";
import { Clock, Repeat } from "lucide-react";

const STATE_LABEL_MAP: Record<string, string> = {
  OPEN: "Ticket Selection Open",
  CUT_OFF: "Ticket Selection Closed",
  REVEAL: "Reveal",
  COMPLETE: "Demo Complete"
};

export default function TimerDisplay() {
  const { countdown, state, cycleIndex, resetDemo } = useTimer();

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] w-full transition-all">
      <Card className="w-full max-w-xs shadow-2xl rounded-[2rem] bg-gradient-to-b from-[#f4f4fa] to-[#e3e7fb] border-2 border-white animate-fade-in">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <CardTitle className="text-[28px] mt-6">{STATE_LABEL_MAP[state]}</CardTitle>
          <CardDescription className="text-[18px] font-semibold">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-5 h-5 text-primary" /> 
              {countdown}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <div className="text-[48px] font-mono font-bold tracking-widest text-[#24266e] my-2 select-none drop-shadow-sm transition-all animate-fade-in" data-testid="timer">
            {countdown}
          </div>
          <span className="text-sm text-muted-foreground mb-2">{state !== "COMPLETE" ? `Cycle: ${cycleIndex+1}/2` : ""}</span>

          {state === "COMPLETE" && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <p className="text-base font-semibold text-center mb-4">Demo Complete — 2 cycles finished.</p>
              <Button variant="secondary" size="lg" className="mt-2" onClick={resetDemo}>
                <Repeat className="mr-1 h-4 w-4" /> Restart Demo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
