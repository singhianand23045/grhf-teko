import React from "react";
import LotteryTicket from "./LotteryTicket";
import { useNumberSelection } from "./NumberSelectionContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle } from "lucide-react"; // Import CheckCircle
import { useTimer } from "../timer/timer-context";
import NumberGrid from "./NumberGrid"; // Import NumberGrid

export default function ConfirmedTicketsList() {
  const {
    picked,
    canConfirm,
    confirm,
    confirmedTickets,
    startNewTicketSelection,
    isAddingNewTicket // Use the new state
  } = useNumberSelection();
  const { state: timerState } = useTimer();

  const canAddMoreTickets = confirmedTickets.length < 3 && timerState === "OPEN";
  // isPickingNewTicket: true if user has started picking numbers for a new ticket (picked.length > 0)
  // OR if they explicitly clicked "Add next ticket" (isAddingNewTicket is true)
  const isPickingNewTicket = picked.length > 0 || isAddingNewTicket;

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="mb-2 font-semibold text-[#16477d] text-lg select-none">
        Your Confirmed Tickets
      </div>
      <ScrollArea className="w-full max-w-md flex-1 px-2 py-2">
        <div className="flex flex-col items-center gap-4">
          {confirmedTickets.map((ticketNumbers, index) => (
            <LotteryTicket key={index} picked={ticketNumbers} compact={true} ticketIndex={index + 1} />
          ))}
          {/* Show the number grid if user is picking a new ticket */}
          {isPickingNewTicket && canAddMoreTickets && (
            <div className="w-full flex flex-col items-center gap-4 mt-4">
              <div className="mb-2 font-semibold text-[#16477d] text-lg select-none">
                Pick next 6 numbers
              </div>
              <NumberGrid />
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
          )}
        </div>
      </ScrollArea>
      {/* Only show "Add next ticket" button if not currently picking a new ticket AND can add more */}
      {!isPickingNewTicket && canAddMoreTickets && (
        <Button
          onClick={startNewTicketSelection}
          size="lg"
          className="w-full max-w-xs mt-4 transition-all"
        >
          <PlusCircle className="mr-2 w-5 h-5" />
          Add next ticket
        </Button>
      )}
      {confirmedTickets.length === 3 && (
        <div className="text-sm mt-4 text-muted-foreground text-center">
          Maximum 3 tickets confirmed for this draw.
        </div>
      )}
      {timerState !== "OPEN" && confirmedTickets.length > 0 && (
        <div className="text-sm mt-4 text-yellow-700 font-medium text-center">
          Numbers locked. Waiting for draw...
        </div>
      )}
    </div>
  );
}