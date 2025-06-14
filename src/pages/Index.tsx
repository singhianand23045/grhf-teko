import { TimerProvider } from "@/features/timer/timer-context";
import TimerDisplay from "@/features/timer/TimerDisplay";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-indigo-100 to-blue-50">
      <TimerProvider>
        <main className="flex flex-col w-full items-center px-4">
          <h1 className="font-extrabold tracking-tight text-3xl mb-7 mt-4 text-[#1a1855]">Lucky Dip Demo</h1>
          <TimerDisplay />
        </main>
      </TimerProvider>
    </div>
  );
};

export default Index;
