import React from "react";
import LotteryTicket from "./LotteryTicket";
import { useNumberSelection } from "./NumberSelectionContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useTimer } from "../timer/timer-context";

export default function ConfirmedTicketsList() {
  const { confirmedTickets, startNewTicketSelection } = useNumberSelection();
  const { state: timerState } = useTimer();

  const canAddMoreTickets = confirmedTickets.length < 3 && timerState === "OPEN";

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
        </div>
      </ScrollArea>
      {canAddMoreTickets && (
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