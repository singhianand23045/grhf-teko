import React from "react";
import { layoutConfig } from "./layoutConfig";
import JackpotSection from "../features/jackpot/JackpotSection";
import TimerSection from "../features/timer/TimerSection";
import CreditsSection from "../features/wallet/CreditsSection";
import DrawNumbersSection from "../features/draw/DrawNumbersSection";
import ConfirmedNumbersSection from "../features/number-select/ConfirmedNumbersSection";

// Removed LOGICAL_WIDTH and LOGICAL_HEIGHT as we are moving to a more flexible layout

export default function FlexibleLayout() {
  // For easy reference, map keys to components
  const sectionMap: Record<string, React.ReactNode> = {
    header: (
      <h1 className="font-extrabold tracking-tight text-3xl text-[#1a1855] w-full flex items-center justify-center h-full m-0 p-0">
        Get Rich having Fun
      </h1>
    ),
    jackpot: <JackpotSection />,
    timer: <TimerSection />,
    drawNumbers: <DrawNumbersSection />,
    wallet: <CreditsSection />,
    numberSelect: <ConfirmedNumbersSection />
  };

  // Render jackpot/timer as a single row, each 50% width
  const jackpotCfg = layoutConfig.find((s) => s.key === "jackpot");
  const timerCfg = layoutConfig.find((s) => s.key === "timer");
  const headerCfg = layoutConfig.find((s) => s.key === "header");

  // Spacer utility for 0.5% height
  const SectionGap = () => (
    <div
      className="flex-shrink-0"
      style={{
        height: "0.5%",
        minHeight: 0, // Ensure it can shrink
        width: "100%",
      }}
      aria-hidden="true"
    />
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header (Lucky Dip, 5%) */}
      <div
        className={`w-full flex-shrink-0 flex items-center justify-center ${headerCfg?.bg ?? ""} ${headerCfg?.font ?? ""}`}
        style={{
          height: headerCfg?.height,
          // Removed minHeight calculation
        }}
      >
        {sectionMap["header"]}
      </div>
      {/* Gap */}
      <SectionGap />
      {/* Jackpot and Timer side by side (15% total height) */}
      <div
        className="w-full flex flex-row flex-shrink-0"
        style={{
          height: jackpotCfg?.height,
          // Removed minHeight calculation
        }}
      >
        {/* Jackpot: left, 50% */}
        <div
          className={`h-full flex-grow flex flex-row items-center justify-start bg-gradient-to-r ${jackpotCfg?.bg ?? ""} ${jackpotCfg?.font ?? ""}`}
          style={{ width: "50%" }}
        >
          {sectionMap["jackpot"]}
        </div>
        {/* Timer: right, 50% */}
        <div
          className={`h-full flex-grow flex flex-row items-center justify-end bg-gradient-to-r ${timerCfg?.bg ?? ""} ${timerCfg?.font ?? ""}`}
          style={{ width: "50%" }}
        >
          {sectionMap["timer"]}
        </div>
      </div>
      {/* Gap */}
      <SectionGap />
      {/* Draw Numbers (30%) */}
      <div
        className={`w-full flex-shrink-0 flex items-center justify-center bg-gradient-to-r ${layoutConfig[3].bg} ${layoutConfig[3].font}`}
        style={{
          height: layoutConfig[3].height,
          // Removed minHeight calculation
        }}
      >
        {sectionMap["drawNumbers"]}
      </div>
      {/* Gap */}
      <SectionGap />
      {/* Wallet / Credits (5%) */}
      <div
        className={`w-full flex-shrink-0 flex items-center justify-center bg-gradient-to-r ${layoutConfig[4].bg} ${layoutConfig[4].font}`}
        style={{
          height: layoutConfig[4].height,
          // Removed minHeight calculation
        }}
      >
        {sectionMap["wallet"]}
      </div>
      {/* Gap */}
      <SectionGap />
      {/* Number Select (45%) - now flex-1 to take remaining space */}
      <div
        className={`w-full flex-1 flex flex-col items-center justify-center bg-gradient-to-r ${layoutConfig[5].bg} ${layoutConfig[5].font}`}
        style={{
          // Removed fixed height, now flex-1
          minHeight: 0, // Allow it to shrink if needed, but flex-1 will make it grow
        }}
      >
        {sectionMap["numberSelect"]}
      </div>
    </div>
  );
}