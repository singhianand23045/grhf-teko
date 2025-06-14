
import React from "react";
import NumberGrid from "./NumberGrid";
import LotteryTicket from "./LotteryTicket";
import { Button } from "@/components/ui/button";
import { useNumberSelection } from "./NumberSelectionContext";
import { useTimer } from "../timer/timer-context";
import { CheckCircle } from "lucide-react";

export default function NumberSelectionPanel() {
  const { picked, canPick, canConfirm, isConfirmed, confirm } = useNumberSelection();
  const { state: timerState } = useTimer();

  // Show ticket if confirmed
  if (isConfirmed) {
    return <LotteryTicket />;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 font-semibold text-[#16477d] text-lg select-none">
        Pick 6 numbers
      </div>
      <NumberGrid />
      <div className="mt-6 flex flex-col items-center w-full">
        <Button
          onClick={confirm}
          disabled={!canConfirm}
          size="lg"
          className="w-full max-w-xs transition-all"
        >
          <CheckCircle className="mr-2 w-5 h-5" />
          Confirm Numbers
        </Button>
        {picked.length < 6 && canPick && (
          <div className="text-xs mt-2 text-muted-foreground">
            Pick {6 - picked.length} more number{6 - picked.length !== 1 ? "s" : ""}
          </div>
        )}
        {timerState === "CUT_OFF" && !isConfirmed && (
          <div className="text-sm mt-2 text-yellow-700 font-medium">
            Numbers locked. Waiting for draw...
          </div>
        )}
      </div>
    </div>
  );
}
