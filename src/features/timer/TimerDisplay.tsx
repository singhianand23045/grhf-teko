
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "./timer-context";
import { Repeat } from "lucide-react";

export default function TimerDisplay() {
  const { countdown, state, resetDemo } = useTimer();

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] w-full transition-all">
      <Card className="w-full max-w-xs shadow-2xl rounded-[2rem] bg-gradient-to-b from-[#f4f4fa] to-[#e3e7fb] border-2 border-white animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center">
          <div
            className="text-[64px] font-mono font-extrabold tracking-widest text-[#24266e] my-10 select-none drop-shadow-sm transition-all animate-fade-in"
            data-testid="timer"
          >
            {countdown}
          </div>
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
