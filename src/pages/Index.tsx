import { useState } from "react";
import FlexibleLayout from "../layout/FlexibleLayout";
import HistoryPage from "./HistoryPage";
import PlayAssistant from "../features/assistant/PlayAssistant";
import { Home, History, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [activeTab, setActiveTab] = useState("home"); // Default to 'home'

  return (
    <div className="relative flex flex-col h-screen bg-gray-100"> {/* Changed to h-screen */}
      {/* Main content area */}
      <main
        className={`flex flex-col w-full items-center flex-1 ${ // Added flex-1
          activeTab === "home" ? "" : "px-2 py-8 pb-24 overflow-y-auto" // Removed px-4 py-8 for home tab
        }`}
      >
        {activeTab === "home" && <FlexibleLayout />}
        {activeTab === "history" && <HistoryPage />}
        {activeTab === "assistant" && <PlayAssistant />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 max-w-[402px] mx-auto">
        <div className="flex justify-around h-16">
          <Button
            variant="ghost"
            className={`flex flex-col items-center justify-center h-full w-full rounded-none ${
              activeTab === "home" ? "text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("home")}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center justify-center h-full w-full rounded-none ${
              activeTab === "history" ? "text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <History className="h-5 w-5" />
            <span className="text-xs mt-1">History</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center justify-center h-full w-full rounded-none ${
              activeTab === "assistant" ? "text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("assistant")}
          >
            <Bot className="h-5 w-5" />
            <span className="text-xs mt-1">Assistant</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}