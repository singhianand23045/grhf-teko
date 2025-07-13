import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Timer, CheckCircle, Clock } from 'lucide-react';

type TimerState = 'OPEN' | 'CUT_OFF' | 'REVEAL' | 'COMPLETE';
type RecommendationType = 'hot' | 'cold' | 'balanced' | 'pattern' | 'history';

interface NumberRecommendation {
  numbers: number[];
  type: RecommendationType;
  reasoning: string;
  confidence: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content?: string;
  recommendation?: NumberRecommendation;
  timestamp: Date;
}

const PlayAssistant = () => {
  const [timerState, setTimerState] = useState<TimerState>('OPEN');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [queuedNumbers, setQueuedNumbers] = useState<number[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I can analyze patterns and recommend numbers for your lottery play. Would you like me to suggest some numbers?',
      timestamp: new Date()
    }
  ]);

  // Mock recommendation generation
  const generateRecommendation = (type: RecommendationType): NumberRecommendation => {
    let numbers: number[];
    let reasoning: string;
    
    switch (type) {
      case 'hot':
        numbers = [7, 14, 21, 35, 42, 49]; // Mock hot numbers
        reasoning = "These numbers have appeared frequently in recent draws";
        break;
      case 'cold':
        numbers = [3, 16, 23, 31, 38, 44]; // Mock cold numbers
        reasoning = "These numbers are due to appear based on historical patterns";
        break;
      case 'balanced':
        numbers = [5, 18, 27, 33, 41, 48]; // Mock balanced set
        reasoning = "A balanced mix of high and low numbers with good distribution";
        break;
      case 'pattern':
        numbers = [8, 15, 22, 29, 36, 43]; // Mock pattern-based
        reasoning = "Sequential pattern with 7-number intervals";
        break;
      default:
        numbers = [12, 19, 26, 34, 41, 47]; // Mock history-based
        reasoning = "Based on your successful number patterns";
    }

    return {
      numbers,
      type,
      reasoning,
      confidence: Math.floor(Math.random() * 30 + 70) // 70-100% confidence
    };
  };

  const handleRecommendationRequest = (type: RecommendationType) => {
    const recommendation = generateRecommendation(type);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Here's my ${type} number recommendation:`,
      recommendation,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleConfirmRecommendation = (numbers: number[]) => {
    if (timerState === 'OPEN') {
      setSelectedNumbers(numbers);
      setIsConfirmed(true);
      
      const confirmMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Perfect! I've confirmed numbers ${numbers.join(', ')} for this draw. Good luck!`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmMessage]);
    } else {
      setQueuedNumbers(numbers);
      
      const queueMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Numbers ${numbers.join(', ')} have been queued for the next draw. I'll apply them automatically when it opens.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, queueMessage]);
    }
  };

  const getConfirmButtonText = () => {
    switch (timerState) {
      case 'OPEN':
        return 'Confirm for This Draw';
      case 'CUT_OFF':
      case 'REVEAL':
        return 'Queue for Next Draw';
      case 'COMPLETE':
        return 'Confirm for Next Draw';
      default:
        return 'Confirm Numbers';
    }
  };

  const getTimerStateIcon = () => {
    switch (timerState) {
      case 'OPEN':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CUT_OFF':
      case 'REVEAL':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'COMPLETE':
        return <Timer className="h-4 w-4 text-blue-500" />;
      default:
        return <Timer className="h-4 w-4" />;
    }
  };

  const NumberGrid = ({ numbers, onConfirm, disabled = false }: { 
    numbers: number[]; 
    onConfirm: () => void;
    disabled?: boolean;
  }) => (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
      <div className="grid grid-cols-6 gap-2 mb-4">
        {numbers.map((num) => (
          <div
            key={num}
            className="aspect-square flex items-center justify-center bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            {num}
          </div>
        ))}
      </div>
      <Button 
        onClick={onConfirm} 
        className="w-full" 
        disabled={disabled}
        variant={timerState === 'OPEN' ? 'default' : 'secondary'}
      >
        {getConfirmButtonText()}
      </Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Play Assistant Playground
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer State Controls */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium">Timer State:</span>
            {(['OPEN', 'CUT_OFF', 'REVEAL', 'COMPLETE'] as TimerState[]).map((state) => (
              <Button
                key={state}
                variant={timerState === state ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimerState(state)}
              >
                {state}
              </Button>
            ))}
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {getTimerStateIcon()}
              <span className="text-sm font-medium">Timer: {timerState}</span>
            </div>
            {selectedNumbers.length > 0 && (
              <Badge variant={isConfirmed ? 'default' : 'secondary'}>
                Selected: {selectedNumbers.join(', ')}
                {isConfirmed && ' ✓'}
              </Badge>
            )}
            {queuedNumbers.length > 0 && (
              <Badge variant="outline">
                Queued: {queuedNumbers.join(', ')}
              </Badge>
            )}
          </div>

          {/* Recommendation Triggers */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Request Recommendations:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRecommendationRequest('hot')}
              >
                Hot Numbers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRecommendationRequest('cold')}
              >
                Cold Numbers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRecommendationRequest('balanced')}
              >
                Balanced Set
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRecommendationRequest('pattern')}
              >
                Pattern-Based
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRecommendationRequest('history')}
              >
                History-Based
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Assistant Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content && (
                    <p className="text-sm mb-2">{message.content}</p>
                  )}
                  
                  {message.recommendation && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {message.recommendation.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {message.recommendation.confidence}% confidence
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">
                        {message.recommendation.reasoning}
                      </p>
                      
                      <NumberGrid
                        numbers={message.recommendation.numbers}
                        onConfirm={() => handleConfirmRecommendation(message.recommendation!.numbers)}
                        disabled={false}
                      />
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedNumbers([]);
                setQueuedNumbers([]);
                setIsConfirmed(false);
              }}
            >
              Reset Selections
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMessages([{
                  id: '1',
                  type: 'assistant',
                  content: 'Hello! I can analyze patterns and recommend numbers for your lottery play. Would you like me to suggest some numbers?',
                  timestamp: new Date()
                }]);
              }}
            >
              Clear Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayAssistant;