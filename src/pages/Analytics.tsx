
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Demo draw history (would connect to real draws in an actual app)
const DEMO_DRAWS: number[][] = Array.from({ length: 100 }, () =>
  Array.from({ length: 18 }, () => Math.floor(Math.random() * 99) + 1)
);

// Very simplified "agent" responds to a few analytic queries based on demo draw data.
function analyticAgent(userMsg: string): string {
  const normalized = userMsg.toLowerCase();
  if (/most[\s\-]?frequent|most[ -]?common/.test(normalized)) {
    // Compute number frequency in last 50 draws:
    const freq: Record<number, number> = {};
    DEMO_DRAWS.slice(-50).flat().forEach((n) => (freq[n] = (freq[n] || 0) + 1));
    let max = 0, maxNum = null;
    for (const n in freq) {
      if (freq[n]! > max) {
        max = freq[n]!;
        maxNum = n;
      }
    }
    return `The most frequently drawn number in the last 50 games is **${maxNum}** (drawn ${max} times).`;
  }
  if (/summary|overview/.test(normalized)) {
    return `There have been ${DEMO_DRAWS.length} draws. Each draw selects 18 numbers between 1 and 99.`;
  }
  if (/longest streak|streak/.test(normalized)) {
    // Fake a streak
    return "No numbers have repeated more than 5 times in a row in the last 100 draws.";
  }
  // Default
  return `Sorry, I can only answer basic analytic queries (“most frequent”, “summary”, “streak”, etc.) in this prototype.`;
}

// Simple chat message model
interface Msg {
  sender: "user" | "agent";
  content: string;
}

function AnalyticChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [value, setValue] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [msgs]);

  function onSend() {
    if (!value.trim()) return;
    const userMsg = value.trim();
    setMsgs((m) => [...m, { sender: "user", content: userMsg }]);
    setValue("");
    setTimeout(() => {
      const ans = analyticAgent(userMsg);
      setMsgs((m) => [...m, { sender: "agent", content: ans }]);
    }, 500); // simulate slight delay
  }

  return (
    <div className="w-full max-w-xl flex flex-col mx-auto my-6 px-2">
      <div
        ref={chatRef}
        className="flex-1 min-h-[320px] max-h-[420px] mb-4 p-3 rounded-lg bg-slate-50/60 border border-slate-200 overflow-y-auto"
      >
        {msgs.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            Ask analytics questions about recent draws.<br />
            Try:<br />
            <span className="text-[13px] text-sky-900">
              "Which number was drawn most often in last 50 games?"<br />
              "Can I get a summary?"<br />
              "Show the longest streak of any number"
            </span>
          </div>
        )}
        {msgs.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.sender === "user"
                ? "text-right my-1"
                : "text-left my-2"
            }
          >
            <div
              className={
                msg.sender === "user"
                  ? "inline-block bg-sky-500/80 text-white px-3 py-1 rounded-xl"
                  : "inline-block bg-white border px-3 py-1 rounded-xl"
              }
            >
              <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type your analytic question…"
        />
        <Button onClick={onSend} className="h-[48px] px-6 self-end" disabled={!value.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-blue-100 via-indigo-100 to-blue-50">
      <MainTabs />
      <main className="flex flex-col flex-1 items-center">
        <h1 className="text-3xl font-bold mt-4 mb-1 text-slate-700">Analytics Agent Chat</h1>
        <span className="text-gray-500 mb-3 text-sm">Ask about draw stats, frequency, streaks, and more.</span>
        <AnalyticChat />
      </main>
    </div>
  );
}

import MainTabs from "@/components/MainTabs";
