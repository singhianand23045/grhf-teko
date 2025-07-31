import { useTimer } from "../timer/timer-context";
import NumberSelectionPanel from "./NumberSelectionPanel";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import { useNumberSelection } from "./NumberSelectionContext"; // Import useNumberSelection
import ConfirmedNumbersDisplay from "./ConfirmedNumbersDisplay"; // Import the renamed component

// Removed LOGICAL_HEIGHT constant

export default function ConfirmedNumbersSection() {
  const { state, resetDemo, cycleIndex } = useTimer();
  const { confirmedPicksSets } = useNumberSelection(); // Get confirmedPicksSets

  // Determine if the "Demo Complete" overlay should be shown
  const showDemoComplete = state === "COMPLETE";

  return (
    <div
      className="flex flex-col items-center justify-center w-full flex-1 overflow-y-auto" // flex-1 to take remaining space, overflow-y-auto for scrolling
      style={{
        // Removed fixed height, minHeight, maxHeight
      }}
    >
      {showDemoComplete ? (
        <section className="w-full h-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
            <p className="text-base font-semibold text-center mb-2">Demo Complete — {cycleIndex} cycles finished.</p>
            {confirmedPicksSets.length > 0 && (
              <div className="mb-4">
                {/* Display the last confirmed set of numbers for the demo complete screen */}
                <ConfirmedNumbersDisplay picked={confirmedPicksSets[confirmedPicksSets.length - 1]} compact={false} />
              </div>
            )}
            <Button variant="secondary" size="lg" className="mt-2" onClick={resetDemo}>
              <Repeat className="mr-1 h-4 w-4" /> Restart Demo
            </Button>
          </div>
        </section>
      ) : (
        // Always render NumberSelectionPanel, which now handles its own internal state and rendering
        <section className="w-full flex flex-col items-center justify-center my-0 h-full">
          <NumberSelectionPanel />
        </section>
      )}
    </div>
  );
}