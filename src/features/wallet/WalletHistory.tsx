
import React from "react";
import { useWallet } from "./WalletContext";

export default function WalletHistory() {
  const { history } = useWallet();
  if (history.length === 0) {
    // Render nothing if history is empty
    return null;
  }
  return (
    <div className="max-h-56 overflow-y-auto w-full px-2">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left font-semibold p-1">Date</th>
            <th className="text-left font-semibold p-1">Numbers</th>
            <th className="text-right font-semibold p-1">Matches</th>
            <th className="text-right font-semibold p-1">Δ Credits</th>
          </tr>
        </thead>
        <tbody>
          {history.map((t) => (
            <tr key={t.id} className={t.creditChange > 0 ? "text-green-600" : ""}>
              <td className="p-1">{new Date(t.date).toLocaleTimeString()}</td>
              <td className="p-1">
                {t.numbers.slice(0, 6).join(", ")}
              </td>
              <td className="p-1 text-right">{t.matches}</td>
              <td className="p-1 text-right font-bold">
                {t.creditChange > 0 ? "+" : ""}
                {t.creditChange}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
