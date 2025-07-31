import { useTimer } from "./timer-context";

// Removed LOGICAL_HEIGHT and JACKPOT_TIMER_HEIGHT constants

export default function TimerSection() {
  const { countdown } = useTimer();
  return (
    <div
      className="w-full flex flex-row items-center justify-end px-0 pt-4 pb-0"
      style={{
        // Removed minHeight and maxHeight, parent will control height
        height: "100%" // Take full height of parent container
      }}
      data-testid="timer-header"
    >
      <span
        className="font-mono font-extrabold tracking-widest text-robinhood-green select-none animate-fade-in"
        style={{ fontSize: "clamp(1.3rem, 4vw, 2rem)", lineHeight: 1.1 }}
        data-testid="timer"
      >
        {countdown}
      </span>
    </div>
  );
}