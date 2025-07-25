
import MainTabs, { TabProvider, useTab } from "@/components/MainTabs";
import FlexibleLayout from "@/layout/FlexibleLayout";
import PlayAssistant from "@/features/assistant/PlayAssistant";

const LOGICAL_WIDTH = 402;  // iPhone 16 Pro logical width
const LOGICAL_HEIGHT = 874; // iPhone 16 Pro logical height

function AppContent() {
  const { activeTab } = useTab();

  return (
    <div className="min-h-screen min-w-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-indigo-100 to-blue-50">
      <div
        className="relative flex flex-col items-center justify-center shadow-xl rounded-2xl border border-gray-200 bg-white overflow-hidden"
        style={{
          width: "min(100vw, 402px)",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
        }}
      >
        {/* MAIN CONTENT: subtract bottom nav height (4rem) from viewport height */}
        <main 
          className={`flex flex-col w-full items-center ${
            activeTab === "home" ? "px-4 py-8" : "px-2 py-8 pb-24 overflow-y-auto"
          }`}
          style={{
            height: "calc(100vh - 4rem)",
            overflow: activeTab === "home" ? "hidden" : "auto"
          }}
        >
          <div style={{ display: activeTab === "home" ? "block" : "none" }}>
            <FlexibleLayout />
          </div>
          <div style={{ display: activeTab === "assistant" ? "block" : "none" }}>
            <h1 className="text-3xl font-bold mt-4 mb-1 text-slate-700">
              Play Assistant
            </h1>
            <PlayAssistant />
          </div>
        </main>
        {/* Bottom Tabs */}
        <MainTabs />
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <TabProvider>
      <AppContent />
    </TabProvider>
  );
};

export default Index;
