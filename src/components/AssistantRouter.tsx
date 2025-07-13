import React from "react";
import { ASSISTANT_VERSION } from "@/config/assistantConfig";
import AssistantChat from "@/features/assistant/AssistantChat";
import Phase8PlayAssistant from "@/playground/Phase8PlayAssistant";

/**
 * Router component that switches between Phase 7 and Phase 8 assistant experiences
 * Based on the configuration in assistantConfig.ts
 */
export default function AssistantRouter() {
  if (ASSISTANT_VERSION === "phase8") {
    return <Phase8PlayAssistant />;
  }
  
  // Default to Phase 7 (original Number Assistant)
  return <AssistantChat />;
}