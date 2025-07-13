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

// Mock recommendation generator - respects 1-27 range and uses fun, encouraging tone
function generateRecommendation(type: RecommendationType): NumberRecommendation {
  // Only use numbers 1-27 (Bug 1 fix)
  const validNumbers = Array.from({ length: 27 }, (_, i) => i + 1);
  let numbers: number[] = [];
  let reasoning = "";
  
  switch (type) {
    case "hot":
      // Simulate hot numbers (frequently drawn) - only 1-27
      numbers = [7, 14, 19, 23, 3, 11];
      reasoning = "These numbers have been showing up a lot lately! 7 and 14 are really on fire.";
      break;
    case "cold":
      // Simulate cold numbers (overdue) - only 1-27
      numbers = [2, 15, 18, 24, 6, 21];
      reasoning = "These numbers are due for their moment! 15 and 24 haven't shown up in ages.";
      break;
    case "balanced":
      // Mix of high/low, even/odd - only 1-27
      numbers = [4, 9, 16, 22, 13, 26];
      reasoning = "A nice balanced mix! Got some low, some high, and a good even-odd spread.";
      break;
    case "pattern":
      // Pattern-based - only 1-27
      numbers = [5, 10, 15, 20, 25, 12];
      reasoning = "Love the pattern vibes! These numbers have a nice rhythm to them.";
      break;
    case "history":
      // Based on user history (mock) - only 1-27
      numbers = [1, 8, 17, 27, 12, 22];
      reasoning = "Something totally fresh for you! These are completely different from your usual picks.";
      break;
  }
  
  return {
    numbers,
    type,
    reasoning,
    confidence: 0.7 + Math.random() * 0.3 // 70-100%
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
    // Simple button text - user doesn't need to see technical details
    return "Confirm Numbers";
  };

  const getTimerStateIcon = () => {
    switch (timerState) {
      case "OPEN": return <Play className="w-4 h-4 text-green-600" />;
      case "CUT_OFF": return <Timer className="w-4 h-4 text-yellow-600" />;
      case "REVEAL": return <Clock className="w-4 h-4 text-blue-600" />;
      case "COMPLETE": return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleRecommendationRequest = (type: RecommendationType) => {
    const recommendation = generateRecommendation(type);
    
    // Use fun, encouraging messages that match Phase 7 tone
    const messages = {
      hot: "Here are the hot numbers right now! These have been showing up a lot:",
      cold: "These numbers are totally due! They haven't appeared in ages:",
      balanced: "Here's a perfectly balanced set for you:",
      pattern: "Check out these pattern numbers - they have a nice flow:",
      history: "Something completely different for you to try:"
    };
    
    addMessage("recommendation", messages[type], recommendation);
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

    // Simulate processing delay
    setTimeout(() => {
      // Check if user is asking for recommendations
      const recommendationType = parseRecommendationRequest(userMessage);
      
      if (recommendationType) {
        handleRecommendationRequest(recommendationType);
      } else {
        // Regular chat response - fun and encouraging like Phase 7
        const responses = [
          "I'm here to help you pick some winning numbers! What kind of numbers are you feeling today?",
          "Want some hot numbers that have been showing up lately? Or maybe some cold numbers that are due?",
          "Let's find you some lucky numbers! Just ask for hot, cold, or balanced numbers.",
          "Ready to pick some winners? I can suggest numbers based on recent patterns!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage("assistant", randomResponse);
      }
      setIsLoading(false);
    }, 1000);
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