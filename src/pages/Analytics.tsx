import React from "react";
import MainTabs from "@/components/MainTabs";
import AssistantChat from "@/features/assistant/AssistantChat";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-blue-100 via-indigo-100 to-blue-50 items-center justify-center">
      <div
        className="relative flex flex-col items-center justify-center shadow-xl rounded-2xl border border-gray-200 bg-white overflow-hidden"
        style={{
          width: "min(100vw, 402px)",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
        }}
      >
        <main className="flex flex-col flex-1 items-center w-full px-2 py-8 h-full pb-24 overflow-y-auto">
          
          <span className="text-gray-500 mb-3 text-sm text-center px-4">
            Get help picking numbers, analyze hot/cold numbers, and get personalized suggestions.
          </span>
          <AssistantChat />
        </main>
        <MainTabs />
      </div>
    </div>
  );
}