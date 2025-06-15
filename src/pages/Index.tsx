import { TimerProvider, useTimer } from "@/features/timer/timer-context";
import TimerDisplay from "@/features/timer/TimerDisplay";
import { NumberSelectionProvider } from "@/features/number-select/NumberSelectionContext";
import { WalletProvider } from "@/features/wallet/WalletContext";
import { JackpotProvider } from "@/features/jackpot/JackpotContext";
// Get logical dimensions
const LOGICAL_WIDTH = 402;  // iPhone 16 Pro logical width
const LOGICAL_HEIGHT = 874; // iPhone 16 Pro logical height

// Helper component to handle wallet history conditionally
function ConditionalWalletHistory() {
  // This provider hook must be inside the TimerProvider tree!
  const { state } = useTimer();
  if (state === "REVEAL" || state === "COMPLETE") {
    return null;
  }
  return (
    <div className="mt-2 mb-4 w-full max-w-[440px]">
      {/* <WalletHistory /> */}
    </div>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen min-w-full flex items-center justify-center bg-gradient-to-tr from-blue-100 via-indigo-100 to-blue-50">
      <div
        className="relative flex flex-col items-center justify-center shadow-xl rounded-2xl border border-gray-200 bg-white overflow-hidden"
        style={{
          width: LOGICAL_WIDTH,
          height: LOGICAL_HEIGHT,
          maxWidth: LOGICAL_WIDTH,
          maxHeight: LOGICAL_HEIGHT,
        }}
      >
        <JackpotProvider>
          <WalletProvider>
            <TimerProvider>
              <NumberSelectionProvider>
                <main className="flex flex-col w-full items-center px-4 py-8 h-full">
                  <h1 className="font-extrabold tracking-tight text-3xl mb-12 mt-6 text-[#1a1855]">Lucky Dip Demo</h1>
                  {/* WalletHistory removed */}
                  <TimerDisplay />
                </main>
              </NumberSelectionProvider>
            </TimerProvider>
          </WalletProvider>
        </JackpotProvider>
      </div>
    </div>
  );
};

export default Index;
