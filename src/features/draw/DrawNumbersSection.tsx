import { DrawEngineProvider } from "./DrawEngineContext";
import RevealPanel from "./RevealPanel";
import { useTimer } from "../timer/timer-context";

// Removed LOGICAL_HEIGHT and DRAW_SECTION_HEIGHT constants

export default function DrawNumbersSection() {
  const { state } = useTimer();

  return (
    <DrawEngineProvider>
      <div
        className="flex flex-col items-center justify-center w-full flex-shrink-0"
        style={{
          height: "100%", // Take full height of parent container
          minHeight: 0, // Allow shrinking if needed
          // Removed maxHeight and flexBasis
        }}
      >
        <RevealPanel />
      </div>
    </DrawEngineProvider>
  );
}