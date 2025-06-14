
import { TimerProvider } from "@/features/timer/timer-context";
import TimerDisplay from "@/features/timer/TimerDisplay";
import { NumberSelectionProvider } from "@/features/number-select/NumberSelectionContext"; // ADD THIS IMPORT

const LOGICAL_WIDTH = 402;  // iPhone 16 Pro logical width
const LOGICAL_HEIGHT = 874; // iPhone 16 Pro logical height

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
        <TimerProvider>
          <NumberSelectionProvider> {/* WRAP HERE */}
            <main className="flex flex-col w-full items-center px-4 py-8 h-full">
              <h1 className="font-extrabold tracking-tight text-3xl mb-12 mt-6 text-[#1a1855]">Lucky Dip Demo</h1>
              <TimerDisplay />
            </main>
          </NumberSelectionProvider>
        </TimerProvider>
      </div>
    </div>
  );
};

export default Index;
