
import MainTabs from "@/components/MainTabs";
import FlexibleLayout from "@/layout/FlexibleLayout";

// Remove strict fixed width; use responsive layout for mobile
const LOGICAL_WIDTH = 402;  // Max layout width (iPhone 16 Pro logical width)
// const LOGICAL_HEIGHT = 874; // No longer force logical height on mobile

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-indigo-100 to-blue-50">
      <div
        className="relative flex flex-col items-center justify-center shadow-xl rounded-2xl border border-gray-200 bg-white overflow-hidden w-full max-w-[402px]"
        style={{
          // Responsive: let width be 100vw up to max 402px, and height fit content
          width: "100vw",
          maxWidth: LOGICAL_WIDTH,
          minHeight: "100vh",
        }}
      >
        {/* MAIN CONTENT */}
        <main className="flex flex-col w-full items-center px-4 py-8 h-full min-h-screen">
          <FlexibleLayout />
        </main>
        {/* Bottom Tabs */}
        <MainTabs />
      </div>
    </div>
  );
};

export default Index;
