import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { useTimer } from "@/features/timer/timer-context";
import { useNumberSelection } from "@/features/number-select/NumberSelectionContext";
import { useWallet } from "@/features/wallet/WalletContext";

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
  isConfirmed?: boolean; // Track if recommendation has been acted upon
}

// Call the LLM edge function for intelligent responses
async function callPlayAssistantAPI(message: string, context: any) {
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
    console.error('Play Assistant API error:', error);
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
function NumberGrid({ numbers, onConfirm, buttonText, isConfirmed }: { 
  numbers: number[], 
  onConfirm: () => void,
  buttonText: string,
  isConfirmed?: boolean
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
        className={`w-full ${isConfirmed 
          ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700'
        } text-white`}
        size="sm"
        disabled={isConfirmed}
      >
        {isConfirmed ? '✓ Confirmed' : buttonText}
      </Button>
    </div>
  );
}

export default function Phase8PlayAssistant() {
  // Load messages from localStorage on component mount
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedMessages = localStorage.getItem('playAssistantMessages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      // Convert timestamp strings/numbers back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [queuedNumbers, setQueuedNumbers] = useState<number[]>(() => {
    const savedQueued = localStorage.getItem('playAssistantQueuedNumbers');
    return savedQueued ? JSON.parse(savedQueued) : [];
  });
  
  const chatRef = useRef<HTMLDivElement>(null);
  const { state: timerState, countdown, cycleIndex } = useTimer();
  const { picked, setPicked, isConfirmed, confirm, canConfirm } = useNumberSelection();
  const { addConfirmedTicket } = useWallet();

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('playAssistantMessages', JSON.stringify(messages));
  }, [messages]);

  // Persist queued numbers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('playAssistantQueuedNumbers', JSON.stringify(queuedNumbers));
  }, [queuedNumbers]);

  // Handle queued numbers when timer opens - automatically confirm them
  useEffect(() => {
    if (timerState === "OPEN" && queuedNumbers.length === 6) {
      console.log("[Play Assistant] Auto-applying queued numbers:", queuedNumbers);
      setPicked(() => queuedNumbers);
      
      // Use a longer timeout to ensure setPicked state has updated
      setTimeout(() => {
        // Verify the state before confirming
        if (queuedNumbers.length === 6) {
          console.log("[Play Assistant] Auto-confirming queued numbers");
          confirm(); // Set isConfirmed to true in NumberSelectionContext
          
          // Automatically handle wallet transaction (credit deduction)
          addConfirmedTicket({
            date: new Date().toISOString(),
            numbers: queuedNumbers,
            cycle: cycleIndex
          });
          
          setQueuedNumbers([]);
          addMessage("assistant", "✅ Your queued numbers have been applied and confirmed for this draw!");
        }
      }, 200); // Increased timeout to ensure state update
    }
  }, [timerState, queuedNumbers, cycleIndex]);

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

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('playAssistantMessages');
    localStorage.removeItem('playAssistantQueuedNumbers');
    setQueuedNumbers([]);
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

  // This function is not used in the main UI but kept for potential debugging
  const getTimerStateIcon = () => {
    return null; // No icons needed in clean UI
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
      const response = await callPlayAssistantAPI(message, context);
      
      if (response.recommendation) {
        // Extract just the message text, not the JSON structure
        addMessage("recommendation", response.message || "Here are some numbers for you:", response.recommendation);
      } else {
        // Extract just the message text for regular responses
        addMessage("assistant", response.message || "I'm here to help with number recommendations!");
      }
    } catch (error) {
      console.error('Error calling Play Assistant:', error);
      // Fallback to local recommendation
      const fallback = generateFallbackRecommendation();
      addMessage("recommendation", "Let me suggest some numbers for you:", fallback);
    }
  };

  const handleConfirmRecommendation = (numbers: number[], messageId: string) => {
    // Mark this recommendation as confirmed
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isConfirmed: true } : msg
    ));

    if (timerState === "OPEN") {
      // Replace current selection and automatically confirm with full wallet transaction
      console.log("[Play Assistant] Setting picked numbers:", numbers);
      setPicked(() => numbers);
      
      // Use a longer timeout to ensure setPicked state has updated
      setTimeout(() => {
        // Verify the state before confirming
        if (numbers.length === 6) {
          console.log("[Play Assistant] Confirming recommendation numbers");
          confirm(); // Set isConfirmed to true in NumberSelectionContext
          
          // Automatically handle wallet transaction (credit deduction)
          addConfirmedTicket({
            date: new Date().toISOString(),
            numbers: numbers,
            cycle: cycleIndex
          });
          
          addMessage("assistant", "🎯 Perfect! Your numbers are confirmed and you're all set for this draw. Good luck!");
        }
      }, 200); // Increased timeout to ensure state update
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
          const response = await callPlayAssistantAPI(userMessage, context);
          // Extract just the message text, not the JSON structure
          addMessage("assistant", response.message || "I'm here to help you pick some winning numbers!");
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
    <div className="w-full h-full flex flex-col">
      {/* Clean Chat Interface - No Status Distractions */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-2 space-y-3 min-h-0"
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
            <div key={message.id} className={`${message.type === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
                message.type === "user" 
                  ? "bg-blue-500 text-white" 
                  : message.type === "recommendation"
                  ? "bg-white border-2 border-blue-200"
                  : "bg-white border border-gray-200"
              }`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                {message.recommendation && (
                  <div className="mt-3">
                    <NumberGrid
                      numbers={message.recommendation.numbers}
                      onConfirm={() => handleConfirmRecommendation(message.recommendation!.numbers, message.id)}
                      buttonText={getConfirmButtonText()}
                      isConfirmed={message.isConfirmed}
                    />
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="text-left">
              <div className="inline-block bg-white border rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="animate-spin w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full"></div>
                  Processing...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for number recommendations..."
              className="min-h-[40px] max-h-[100px] resize-none flex-1"
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
        </div>
      </div>
    </div>
  );
}