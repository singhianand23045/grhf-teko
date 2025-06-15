
import React from "react";
import { layoutConfig } from "./layoutConfig";
import JackpotSection from "../features/jackpot/JackpotSection";
import TimerSection from "../features/timer/TimerSection";
import CreditsSection from "../features/wallet/CreditsSection";
import DrawNumbersSection from "../features/draw/DrawNumbersSection";
import ConfirmedNumbersSection from "../features/number-select/ConfirmedNumbersSection";

const sectionMap: Record<string, React.ReactNode> = {
  jackpot: <JackpotSection />,
  timer: <TimerSection />,
  wallet: <CreditsSection />,
  drawNumbers: <DrawNumbersSection />,
  numberSelect: <ConfirmedNumbersSection />
};

export default function FlexibleLayout() {
  return (
    <div className="w-full h-full flex flex-col">
      {layoutConfig.map((section) => (
        <div
          key={section.key}
          className={`w-full flex-shrink-0 flex-grow-0 bg-gradient-to-r ${section.bg} ${section.font} flex items-center justify-center`}
          style={{
            height: section.height,
            minHeight: 0,
          }}
        >
          {sectionMap[section.key]}
        </div>
      ))}
    </div>
  );
}
