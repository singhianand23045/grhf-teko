import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Send, AlertCircle } from "lucide-react";
import { useWallet } from "@/features/wallet/WalletContext";
import { useNumberSelection } from "@/features/number-select/NumberSelectionContext";
import { getDrawsFromLocalStorage, formatDataForLLM, sendToLLM } from "./assistantUtils";
import SetupAssistant from "@/components/SetupAssistant";

interface Message {
  sender: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function NumberAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSlowResponse, setShowSlowResponse] = useState(false);
  const [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const { balance, history } = useWallet();
  const { picked, isConfirmed } = useNumberSelection();

  // Clear history on component mount (session refresh/new user)
  useEffect(() => {
    setMessages([]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setShowSlowResponse(false);
    setError("");

    // Add user message
    const newUserMessage: Message = {
      sender: "user",
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Show "responding..." if taking longer than 2 seconds
    const slowResponseTimer = setTimeout(() => {
      setShowSlowResponse(true);
    }, 2000);

    try {
      // Gather session data
      const drawHistory = getDrawsFromLocalStorage();
      const sessionData = {
        currentBalance: balance,
        ticketHistory: history,
        currentPicked: picked,
        isCurrentTicketConfirmed: isConfirmed,
        drawHistory: drawHistory
      };

      // Format data for LLM
      const contextData = formatDataForLLM(sessionData);
      
      // Send to LLM
      const response = await sendToLLM(userMessage, contextData);
      
      // Add assistant response
      const assistantMessage: Message = {
        sender: "assistant",
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to get response from assistant";
      
      // Check if it's an API key error
      if (errorMessage.includes("OpenAI API key") || errorMessage.includes("Missing")) {
        setShowSetup(true);
      } else {
        setError(errorMessage);
      }
      console.error("Assistant error:", err);
    } finally {
      clearTimeout(slowResponseTimer);
      setIsLoading(false);
      setShowSlowResponse(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showSetup) {
    return <SetupAssistant />;
  }

  return (
    <div className="w-full max-w-xl flex flex-col mx-auto my-6 px-2">
      {/* Header */}

      {/* Chat area */}
      <div
        ref={chatRef}
        className="flex-1 min-h-[320px] max-h-[70vh] mb-4 p-3 rounded-lg bg-slate-50/60 border border-slate-200 overflow-y-auto"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <p className="mb-4">Ask me to help pick numbers for your next ticket!</p>
            <div className="text-[13px] text-sky-900 space-y-1">
              <p>"Which numbers are hot lately?"</p>
              <p>"Help me pick 6 numbers"</p>
              <p>"Show me numbers I haven't picked before"</p>
              <p>"What numbers should I avoid?"</p>
            </div>
          </div>
        )}
        
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={message.sender === "user" ? "text-right my-2" : "text-left my-2"}
          >
            <div
              className={
                message.sender === "user"
                  ? "inline-block bg-indigo-500 text-white px-3 py-2 rounded-xl max-w-[80%]"
                  : "inline-block bg-white border px-3 py-2 rounded-xl max-w-[80%]"
              }
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="text-left my-2">
            <div className="inline-block bg-white border px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                {showSlowResponse ? "Responding..." : "Thinking..."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to help pick numbers..."
          className="min-h-[48px] max-h-[120px]"
          disabled={isLoading}
        />
        <Button 
          onClick={sendMessage} 
          className="h-[48px] px-4 self-end" 
          disabled={!input.trim() || isLoading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}