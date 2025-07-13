import React from "react";
import { ASSISTANT_VERSION } from "@/config/assistantConfig";
import NumberAssistantChat from "@/features/assistant/AssistantChat";
import Phase8PlayAssistant from "@/playground/Phase8PlayAssistant";

/**
 * Router component that switches between Number Assistant (Phase 7) and Play Assistant (Phase 8)
 * Based on the configuration in assistantConfig.ts
 */
export default function AssistantRouter() {
  if (ASSISTANT_VERSION === "phase8") {
    return <Phase8PlayAssistant />;
  }
  
  // Default to Number Assistant (Phase 7)
  return <NumberAssistantChat />;
}