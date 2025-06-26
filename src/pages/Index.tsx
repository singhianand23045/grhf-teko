
import MainTabs from "@/components/MainTabs";
import FlexibleLayout from "@/layout/FlexibleLayout";

const LOGICAL_WIDTH = 402;  // Reference max width

const Index = () => {
  return (
    <div className="min-h-screen min-w-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-indigo-100 to-blue-50">
      <div
        className="relative flex flex-col items-center justify-center shadow-xl rounded-2xl border border-gray-200 bg-white overflow-hidden"
        style={{
          width: "100%",
          height: "100svh",
          maxWidth: LOGICAL_WIDTH,
          maxHeight: "100svh",
        }}
      >
        {/* MAIN CONTENT: removed pb-24 to avoid gap above tabs */}
        <main className="flex flex-col w-full items-center px-4 py-8 h-full">
          <FlexibleLayout />
        </main>
        {/* Bottom Tabs */}
        <MainTabs />
      </div>
    </div>
  );
};

export default Index;
