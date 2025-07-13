import React from "react";
import MainTabs from "@/components/MainTabs";
import AssistantRouter from "@/components/AssistantRouter";
import { ASSISTANT_VERSION } from "@/config/assistantConfig";

export default function AnalyticsPage() {
  const isPhase8 = ASSISTANT_VERSION === "phase8";
  
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
          <h1 className="text-3xl font-bold mt-4 mb-1 text-slate-700">
            {isPhase8 ? "Play Assistant" : "Number Assistant"}
          </h1>
          {!isPhase8 && (
            <span className="text-gray-500 mb-3 text-sm text-center px-4">
              Get help picking numbers, analyze hot/cold numbers, and get personalized suggestions.
            </span>
          )}
          <AssistantRouter />
        </main>
        <MainTabs />
      </div>
    </div>
  );
}