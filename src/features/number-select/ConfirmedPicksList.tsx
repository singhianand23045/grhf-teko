import React from "react";
import ConfirmedNumbersDisplay from "./ConfirmedNumbersDisplay";
import { useNumberSelection } from "./NumberSelectionContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle } from "lucide-react"; // Import CheckCircle
import { useTimer } from "../timer/timer-context";
import NumberGrid from "./NumberGrid"; // Import NumberGrid

export default function ConfirmedPicksList() {
  const {
    picked,
    canConfirm,
    confirm,
    confirmedPicksSets,
    startNewPickSetSelection,
    isAddingNewPickSet // Use the new state
  } = useNumberSelection();
  const { state: timerState } = useTimer();

  const canAddMorePickSets = confirmedPicksSets.length < 3 && timerState === "OPEN";
  // isPickingNewPickSet: true if user has started picking numbers for a new pick set (picked.length > 0)
  // OR if they explicitly clicked "Add next set of numbers" (isAddingNewPickSet is true)
  const isPickingNewPickSet = picked.length > 0 || isAddingNewPickSet;

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="mb-2 font-semibold text-[#16477d] text-lg select-none">
        Your Confirmed Numbers
      </div>
      <ScrollArea className="w-full max-w-md flex-1 px-2 py-2">
        <div className="flex flex-col items-center gap-4">
          {confirmedPicksSets.map((pickSetNumbers, index) => (
            <ConfirmedNumbersDisplay key={index} picked={pickSetNumbers} compact={true} pickSetIndex={index + 1} />
          ))}
          {/* Show the number grid if user is picking a new pick set */}
          {isPickingNewPickSet && canAddMorePickSets && (
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
      {/* Only show "Add next set of numbers" button if not currently picking a new pick set AND can add more */}
      {!isPickingNewPickSet && canAddMorePickSets && (
        <Button
          onClick={startNewPickSetSelection}
          size="lg"
          className="w-full max-w-xs mt-4 transition-all"
        >
          <PlusCircle className="mr-2 w-5 h-5" />
          Add next set of numbers
        </Button>
      )}
      {/* Only show "Maximum 3 sets confirmed" if in OPEN phase */}
      {confirmedPicksSets.length === 3 && timerState === "OPEN" && (
        <div className="text-sm mt-4 text-muted-foreground text-center">
          Maximum 3 sets of numbers confirmed for this draw.
        </div>
      )}
      {/* Updated condition: Only show this message during CUT_OFF phase */}
      {timerState === "CUT_OFF" && confirmedPicksSets.length > 0 && (
        <div className="text-sm mt-4 text-yellow-700 font-medium text-center">
          Numbers locked. Waiting for draw...
        </div>
      )}
    </div>
  );
}