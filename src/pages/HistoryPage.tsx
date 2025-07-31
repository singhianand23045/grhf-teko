import React from "react";
import { useDrawHistory } from "@/features/draw/DrawHistoryContext";
import { useWallet } from "@/features/wallet/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default function HistoryPage() {
  const { drawHistory, clearHistory: clearDrawHistory } = useDrawHistory();
  const { history: walletHistory, resetWallet } = useWallet();

  return (
    <div className="w-full h-full flex flex-col items-center px-2 py-8 pb-24 overflow-y-auto">
      <h1 className="text-3xl font-bold mt-4 mb-6 text-slate-700">
        Game History
      </h1>

      <div className="w-full max-w-md space-y-6">
        {/* Draw History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Draw Results</CardTitle>
          </CardHeader>
          <CardContent>
            {drawHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">No draw results yet.</p>
            ) : (
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {drawHistory.map((draw, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <p className="text-sm font-semibold">Cycle {draw.cycle + 1} - {format(new Date(draw.date), "MMM dd, HH:mm")}</p>
                    <p className="text-sm">Winning Numbers: <span className="font-mono">{draw.winningNumbers.sort((a, b) => a - b).join(", ")}</span></p>
                    <p className="text-sm">Result: {draw.jackpotWon ? <span className="font-bold text-yellow-600">Jackpot Won!</span> : `${draw.totalWinnings} credits`}</p>
                    {index < drawHistory.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </ScrollArea>
            )}
            <div className="mt-4 text-right">
              <button onClick={clearDrawHistory} className="text-sm text-red-500 hover:underline">Clear Draw History</button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Entry History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {walletHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">No entries played yet.</p>
            ) : (
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {walletHistory.map((entry, index) => (
                  <div key={entry.id} className="mb-4 last:mb-0">
                    <p className="text-sm font-semibold">Cycle {entry.cycle !== undefined ? entry.cycle + 1 : 'N/A'} - {format(new Date(entry.date), "MMM dd, HH:mm")}</p>
                    <p className="text-sm">Your Numbers: <span className="font-mono">{entry.numbers.sort((a, b) => a - b).join(", ")}</span></p>
                    <p className="text-sm">Cost: {entry.creditChange} credits</p>
                    {entry.processed && (
                      <p className="text-sm">Winnings: <span className="font-bold text-green-600">{entry.winnings} credits</span></p>
                    )}
                    {index < walletHistory.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </ScrollArea>
            )}
            <div className="mt-4 text-right">
              <button onClick={resetWallet} className="text-sm text-red-500 hover:underline">Reset Wallet</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}