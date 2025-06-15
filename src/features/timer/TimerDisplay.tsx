
import { useTimer } from "./timer-context";
import TimerSection from "./TimerSection";
import JackpotSection from "../jackpot/JackpotSection";
import DrawNumbersSection from "../draw/DrawNumbersSection";
import CreditsSection from "../wallet/CreditsSection";
import ConfirmedNumbersSection from "../number-select/ConfirmedNumbersSection";

const LOGICAL_HEIGHT = 874;

export default function TimerDisplay() {
  const { state } = useTimer();

  // Just layout: compose from independent sections
  return (
    <div
      className="flex flex-col w-full h-full"
      style={{
        height: "100%",
        minHeight: LOGICAL_HEIGHT,
      }}
    >
      {/* Header row: Jackpot & Timer */}
      <div className="w-full flex flex-row items-center justify-between">
        <JackpotSection />
        <TimerSection />
      </div>
      {/* Small spacer */}
      <div
        className="w-full flex-shrink-0 flex-grow-0 bg-white"
        style={{
          height: "2%",
          minHeight: Math.floor(LOGICAL_HEIGHT * 0.02),
        }}
      />
      {/* Draw Numbers section */}
      <DrawNumbersSection />
      {/* Credits section */}
      <CreditsSection />
      {/* Confirmed Numbers or Ticket Section */}
      <ConfirmedNumbersSection />
    </div>
  );
}
