import React from "react";
import NumberGrid from "./NumberGrid";
import LotteryTicket from "./LotteryTicket"; // This will now be used by ConfirmedTicketsList
import { Button } from "@/components/ui/button";
import { useNumberSelection } from "./NumberSelectionContext";
import { useTimer } from "../timer/timer-context";
import { CheckCircle } from "lucide-react";
import ConfirmedTicketsList from "./ConfirmedTicketsList"; // Import the new component

export default function NumberSelectionPanel() {
  const { picked, canConfirm, isConfirmed, confirm, confirmedTickets } = useNumberSelection();
  const { state: timerState } = useTimer();

  // Determine if the number grid should be shown
  const showNumberGrid = !isConfirmed || (isConfirmed && picked.length === 0 && confirmedTickets.length < 3 && timerState === "OPEN");
  const showConfirmedTicketsList = confirmedTickets.length > 0;

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Display the number grid if a new selection is needed */}
      {showNumberGrid && (
        <>
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
            {picked.length < 6 && (
              <div className="text-xs mt-2 text-muted-foreground">
                Pick {6 - picked.length} more number{6 - picked.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </>
      )}

      {/* Display confirmed tickets list and "Add next ticket" button */}
      {showConfirmedTicketsList && (
        <ConfirmedTicketsList />
      )}

      {/* Message when in CUT_OFF and no tickets confirmed yet */}
      {timerState === "CUT_OFF" && confirmedTickets.length === 0 && (
        <div className="text-sm mt-2 text-yellow-700 font-medium text-center">
          Numbers locked. No tickets confirmed for this draw.
        </div>
      )}
    </div>
  );
}