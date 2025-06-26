
import JackpotBar from "./JackpotBar";

const JACKPOT_TIMER_HEIGHT = 0.15;

export default function JackpotSection() {
  return (
    <div
      className="w-full flex flex-row items-center justify-start"
      style={{
        height: `${JACKPOT_TIMER_HEIGHT * 100}%`
      }}
      data-testid="jackpot-section"
    >
      <JackpotBar />
    </div>
  );
}
