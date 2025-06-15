
import React from "react";
import { useJackpot } from "./JackpotContext";
import { Trophy } from "lucide-react";

export default function JackpotBar() {
  const { jackpot } = useJackpot();

  return (
    <div
      className="flex items-center gap-2 w-full h-full px-4"
      style={{
        minHeight: 40, maxHeight: 80,
      }}
      data-testid="jackpot-bar"
    >
      <Trophy className="text-yellow-500" size={28} strokeWidth={2.4} />
      <span className="font-bold text-xl text-yellow-700">
        Jackpot: <span className="text-yellow-600">${jackpot}</span>
      </span>
    </div>
  );
}
