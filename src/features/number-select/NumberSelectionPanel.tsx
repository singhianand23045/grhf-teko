import React from "react";
import NumberGrid from "./NumberGrid";
import { Button } from "@/components/ui/button";
import { useNumberSelection } from "./NumberSelectionContext";
import { useTimer } from "../timer/timer-context";
import { CheckCircle } from "lucide-react";
import ConfirmedTicketsList from "./ConfirmedTicketsList";

export default function NumberSelectionPanel() {
  const { picked, canConfirm, confirm, confirmedTickets, isAddingNewTicket } = useNumberSelection();
  const { state: timerState } = useTimer();

  // Show the initial number grid if no tickets have been confirmed yet AND we are in OPEN state
  const showInitialNumberGrid = confirmedTickets.length === 0 && timerState === "OPEN";

  // Show the confirmed tickets list if any tickets have been confirmed
  const showConfirmedTicketsSection = confirmedTickets.length > 0;

  // Determine if the number grid should be shown for a new selection (after initial or 'Add next ticket')
  const showGridForNewSelection = isAddingNewTicket && timerState === "OPEN";

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Initial state: show grid to pick first ticket */}
      {showInitialNumberGrid && !showGridForNewSelection && (
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

      {/* After first ticket is confirmed, or if multiple tickets are being managed */}
      {showConfirmedTicketsSection && (
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