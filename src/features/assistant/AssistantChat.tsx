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

interface Message {
  sender: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const chatRef = useRef<HTMLDivElement>(null);
  const { balance, history } = useWallet();
  const { picked, isConfirmed } = useNumberSelection();

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowSettings(true); // Show settings if no API key
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("openai_api_key", apiKey.trim());
      setShowSettings(false);
      setError("");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!apiKey) {
      setError("Please set your OpenAI API key first");
      setShowSettings(true);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setError("");

    // Add user message
    const newUserMessage: Message = {
      sender: "user",
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

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
      const response = await sendToLLM(userMessage, contextData, apiKey);
      
      // Add assistant response
      const assistantMessage: Message = {
        sender: "assistant",
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err: any) {
      setError(err.message || "Failed to get response from assistant");
      console.error("Assistant error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showSettings) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              OpenAI API Key Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To use the AI assistant, you need to provide your OpenAI API key. 
              This will be stored locally in your browser.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveApiKey()}
              />
            </div>
            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button onClick={saveApiKey} disabled={!apiKey.trim()}>
                Save & Continue
              </Button>
              {apiKey && (
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl flex flex-col mx-auto my-6 px-2">
      {/* Header with settings */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Lottery Assistant</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat area */}
      <div
        ref={chatRef}
        className="flex-1 min-h-[320px] max-h-[420px] mb-4 p-3 rounded-lg bg-slate-50/60 border border-slate-200 overflow-y-auto"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <p className="mb-4">Ask me about your lottery patterns and session data!</p>
            <div className="text-[13px] text-sky-900 space-y-1">
              <p>"Which numbers are hot lately?"</p>
              <p>"How have I been doing this session?"</p>
              <p>"Show me numbers different from what I usually play"</p>
              <p>"What are my near-miss patterns?"</p>
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
                Thinking...
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
          placeholder="Ask about your lottery patterns..."
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