import JackpotBar from "./JackpotBar";

// Removed LOGICAL_HEIGHT and JACKPOT_TIMER_HEIGHT constants

export default function JackpotSection() {
  return (
    <div
      className="w-full flex flex-row items-center justify-start"
      style={{
        // Removed minHeight and maxHeight, parent will control height
        height: "100%" // Take full height of parent container
      }}
      data-testid="jackpot-section"
    >
      <JackpotBar />
    </div>
  );
}