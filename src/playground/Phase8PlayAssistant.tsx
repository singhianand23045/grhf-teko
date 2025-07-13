import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, AlertCircle, Timer, Play, Clock, CheckCircle } from "lucide-react";
import { useTimer } from "@/features/timer/timer-context";
import { useNumberSelection } from "@/features/number-select/NumberSelectionContext";

type RecommendationType = "hot" | "cold" | "balanced" | "pattern" | "history";

interface NumberRecommendation {
  numbers: number[];
  type: RecommendationType;
  reasoning: string;
  confidence: number;
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "recommendation";
  content: string;
  recommendation?: NumberRecommendation;
  timestamp: Date;
}

// Call the LLM edge function for intelligent responses
async function callAssistantAPI(message: string, context: any) {
  try {
    const response = await fetch('https://xtjbjypjlodzhjbdfuyc.supabase.co/functions/v1/chat-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Assistant API error:', error);
    return {
      message: "I'm having trouble right now. Let me suggest some numbers anyway!",
      recommendation: generateFallbackRecommendation()
    };
  }
}

// Fallback recommendation generator for when API fails
function generateFallbackRecommendation(): NumberRecommendation {
  const validNumbers = Array.from({ length: 27 }, (_, i) => i + 1);
  const shuffled = validNumbers.sort(() => 0.5 - Math.random());
  const numbers = shuffled.slice(0, 6).sort((a, b) => a - b);
  
  return {
    numbers,
    type: "balanced",
    reasoning: "A nice balanced mix for you!",
    confidence: 0.75
  };
}

// Natural language processing to detect recommendation requests
function parseRecommendationRequest(message: string): RecommendationType | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("hot number") || lowerMessage.includes("frequent") || lowerMessage.includes("popular")) {
    return "hot";
  }
  if (lowerMessage.includes("cold number") || lowerMessage.includes("overdue") || lowerMessage.includes("due")) {
    return "cold";
  }
  if (lowerMessage.includes("balanced") || lowerMessage.includes("mix") || lowerMessage.includes("spread")) {
    return "balanced";
  }
  if (lowerMessage.includes("pattern") || lowerMessage.includes("sequence")) {
    return "pattern";
  }
  if (lowerMessage.includes("history") || lowerMessage.includes("different") || lowerMessage.includes("haven't picked")) {
    return "history";
  }
  if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest") || lowerMessage.includes("pick") || 
      lowerMessage.includes("number") || lowerMessage.includes("help")) {
    return "balanced"; // Default to balanced
  }
  
  return null;
}

// Number grid component for displaying recommendations
function NumberGrid({ numbers, onConfirm, buttonText }: { 
  numbers: number[], 
  onConfirm: () => void,
  buttonText: string 
}) {
  return (
    <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="grid grid-cols-6 gap-2 mb-4">
        {numbers.map((number) => (
          <div
            key={number}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-sm"
          >
            {number}
          </div>
        ))}
      </div>
      <Button 
        onClick={onConfirm}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        {buttonText}
      </Button>
    </div>
  );
}

export default function Phase8PlayAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [queuedNumbers, setQueuedNumbers] = useState<number[]>([]);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const { state: timerState, countdown, cycleIndex } = useTimer();
  const { picked, setPicked, isConfirmed, confirm, canConfirm } = useNumberSelection();

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle queued numbers when timer opens
  useEffect(() => {
    if (timerState === "OPEN" && queuedNumbers.length === 6) {
      setPicked(() => queuedNumbers);
      setQueuedNumbers([]);
      addMessage("assistant", "✅ Your queued numbers have been applied to the current draw!");
    }
  }, [timerState, queuedNumbers]);

  const addMessage = (type: ChatMessage["type"], content: string, recommendation?: NumberRecommendation) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      recommendation,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getConfirmButtonText = () => {
    switch (timerState) {
      case "OPEN":
        return "Confirm Numbers";
      case "CUT_OFF":
      case "REVEAL":
      case "COMPLETE":
        return "Queue for Next Draw";
      default:
        return "Confirm Numbers";
    }
  };

  const getTimerStateIcon = () => {
    switch (timerState) {
      case "OPEN": return <Play className="w-4 h-4 text-green-600" />;
      case "CUT_OFF": return <Timer className="w-4 h-4 text-yellow-600" />;
      case "REVEAL": return <Clock className="w-4 h-4 text-blue-600" />;
      case "COMPLETE": return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleRecommendationRequest = async (message: string) => {
    // Prepare context for LLM
    const context = {
      timerState,
      selectedNumbers: picked,
      credits: 100, // Mock credits
      drawHistory: [] // Mock draw history
    };

    try {
      const response = await callAssistantAPI(message, context);
      
      if (response.recommendation) {
        addMessage("recommendation", response.message, response.recommendation);
      } else {
        addMessage("assistant", response.message);
      }
    } catch (error) {
      console.error('Error calling assistant:', error);
      // Fallback to local recommendation
      const fallback = generateFallbackRecommendation();
      addMessage("recommendation", "Let me suggest some numbers for you:", fallback);
    }
  };

  const handleConfirmRecommendation = (numbers: number[]) => {
    if (timerState === "OPEN") {
      // Replace current selection and confirm
      setPicked(() => numbers);
      setTimeout(() => {
        confirm();
        addMessage("assistant", "🎯 Perfect! Your numbers are confirmed. Good luck!");
      }, 100);
    } else {
      // Queue for next draw (user doesn't need to know this technical detail)
      setQueuedNumbers(numbers);
      addMessage("assistant", "✨ Great choice! Your numbers are all set for the next draw!");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    addMessage("user", userMessage);

    // Use LLM for intelligent response
    setTimeout(async () => {
      // Check if user is asking for recommendations
      const recommendationType = parseRecommendationRequest(userMessage);
      
      if (recommendationType || userMessage.toLowerCase().includes("number")) {
        await handleRecommendationRequest(userMessage);
      } else {
        // Regular chat response via LLM
        const context = {
          timerState,
          selectedNumbers: picked,
          credits: 100,
          drawHistory: []
        };
        
        try {
          const response = await callAssistantAPI(userMessage, context);
          addMessage("assistant", response.message);
        } catch (error) {
          addMessage("assistant", "I'm here to help you pick some winning numbers! What kind of numbers are you feeling today?");
        }
      }
      setIsLoading(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Clean Chat Interface - No Status Distractions */}
      <Card>
        <CardHeader>
          <CardTitle>Play Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div
            ref={chatRef}
            className="h-64 overflow-y-auto mb-4 p-2 border rounded bg-gray-50/50"
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p className="mb-2">Ask me for number recommendations!</p>
                <div className="text-sm space-y-1">
                  <p>"Show me hot numbers"</p>
                  <p>"Give me cold numbers"</p>
                  <p>"Help me pick 6 numbers"</p>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`mb-3 ${message.type === "user" ? "text-right" : "text-left"}`}>
                <div className={`inline-block max-w-[80%] rounded-lg p-2 ${
                  message.type === "user" 
                    ? "bg-blue-500 text-white" 
                    : message.type === "recommendation"
                    ? "bg-white border-2 border-blue-200"
                    : "bg-white border"
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  
                  {message.recommendation && (
                    <div className="mt-3">
                      <NumberGrid
                        numbers={message.recommendation.numbers}
                        onConfirm={() => handleConfirmRecommendation(message.recommendation!.numbers)}
                        buttonText={getConfirmButtonText()}
                      />
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="text-left mb-3">
                <div className="inline-block bg-white border rounded-lg p-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="animate-spin w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full"></div>
                    Processing...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for number recommendations..."
              className="min-h-[40px] max-h-[100px] resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              size="sm"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}