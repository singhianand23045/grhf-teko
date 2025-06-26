import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Util for localStorage interactions
const LOCAL_STORAGE_KEY = "draw_history";

// Get draws from localStorage, return as number[][]
function getDrawsFromLocalStorage(): number[][] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    // Each should be an array of numbers
    return parsed.every(
      (draw) => Array.isArray(draw) && draw.every((n) => typeof n === "number")
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

// Analytics "agent" that uses only actual draws, or returns default message if none
function analyticAgent(userMsg: string, draws: number[][]): string {
  if (!draws || draws.length === 0) {
    return "Please play some games and we will start generating insights.";
  }
  const normalized = userMsg.toLowerCase();
  // "most frequent" or "most common"
  if (/most[\s\-]?frequent|most[ -]?common/.test(normalized)) {
    const freq: Record<number, number> = {};
    draws.flat().forEach((n) => (freq[n] = (freq[n] || 0) + 1));
    let max = 0, maxNum = null;
    for (const n in freq) {
      if (freq[n]! > max) {
        max = freq[n]!;
        maxNum = n;
      }
    }
    return `The most frequently drawn number in your games is <b>${maxNum}</b> (drawn ${max} times).`;
  }
  // "summary" or "overview"
  if (/summary|overview/.test(normalized)) {
    return `You've played ${draws.length} games. Each draw selected ${draws[0]?.length ?? 0} numbers between 1 and 99.`;
  }
  // "longest streak"
  if (/longest streak|streak/.test(normalized)) {
    // Find the longest consecutive appearance streak for any number
    let streaks: Record<number, number> = {};
    let maxStreakNum = null;
    let maxStreakLen = 0;

    for (let num = 1; num <= 99; num++) {
      let currStreak = 0;
      let best = 0;
      for (let d = 0; d < draws.length; d++) {
        if (draws[d].includes(num)) {
          currStreak++;
          if (currStreak > best) best = currStreak;
        } else {
          currStreak = 0;
        }
      }
      if (best > maxStreakLen) {
        maxStreakLen = best;
        maxStreakNum = num;
      }
    }
    return maxStreakLen > 1
      ? `Number <b>${maxStreakNum}</b> had the longest streak: drawn in ${maxStreakLen} consecutive games.`
      : "No number has appeared in consecutive draws.";
  }
  // Default response
  return "Sorry, I can only answer basic analytic queries (“most frequent”, “summary”, “streak”, etc.) in this prototype.";
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
  const [draws, setDraws] = useState<number[][]>(getDrawsFromLocalStorage);

  // Pull latest draw data on load (and if storage changes)
  useEffect(() => {
    function update() {
      setDraws(getDrawsFromLocalStorage());
    }
    window.addEventListener("storage", update);
    update();
    return () => window.removeEventListener("storage", update);
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [msgs]);

  function onSend() {
    if (!value.trim()) return;
    const userMsg = value.trim();
    setMsgs((m) => [...m, { sender: "user", content: userMsg }]);
    setValue("");
    setTimeout(() => {
      const ans = analyticAgent(userMsg, draws);
      setMsgs((m) => [...m, { sender: "agent", content: ans }]);
    }, 400); // Slight delay for UX
  }

  return (
    <div className="w-full max-w-xl flex flex-col mx-auto my-6 px-2">
      <div
        ref={chatRef}
        className="flex-1 min-h-[320px] max-h-[420px] mb-4 p-3 rounded-lg bg-slate-50/60 border border-slate-200 overflow-y-auto"
      >
        {msgs.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            Ask analytics questions about your session draws.<br />
            Try:<br />
            <span className="text-[13px] text-sky-900">
              "Which number was drawn most often?"<br />
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
              <span dangerouslySetInnerHTML={{ __html: msg.content }} />
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

import MainTabs from "@/components/MainTabs";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-blue-100 via-indigo-100 to-blue-50 items-center justify-center">
      <div
        className="relative flex flex-col items-center justify-center shadow-xl rounded-2xl border border-gray-200 bg-white overflow-hidden"
        style={{
          width: "100%",
          height: "100svh",
          maxWidth: 402,
          maxHeight: "100svh",
        }}
      >
        <main className="flex flex-col flex-1 items-center w-full px-2 py-8 h-full pb-24">
          <h1 className="text-3xl font-bold mt-4 mb-1 text-slate-700">Ask Agent</h1>
          <span className="text-gray-500 mb-3 text-sm">Ask Agent about your draw stats, frequency, streaks, and more.</span>
          <AnalyticChat />
        </main>
        <MainTabs />
      </div>
    </div>
  );
}
