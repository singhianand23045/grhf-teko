
import React, { useRef } from "react";
import Ball3D from "./Ball3D";
import { useSpinSetting } from "./useSpinSetting";

// Ball state per slot: spinning or stopped with a number
type Props = {
  numbersToReveal?: (number | undefined)[];
  reveal: boolean;
  userPicks?: number[];
  onDone?: () => void;
};

const ROWS = 3;
const COLS = 6;

const SPIN_SETTINGS = [
  { label: "left fastest", direction: -1, speed: 0.22 },
  { label: "left fast", direction: -1, speed: 0.38 },
  { label: "left slow", direction: -1, speed: 0.65 },
  { label: "right slow", direction: 1, speed: 0.65 },
  { label: "right fast", direction: 1, speed: 0.38 },
  { label: "right fastest", direction: 1, speed: 0.22 },
];

function getSpinConfig(spinLevel: number) {
  if (spinLevel < 0) return SPIN_SETTINGS[-spinLevel - 1];
  if (spinLevel > 0) return SPIN_SETTINGS[spinLevel + 2];
  return SPIN_SETTINGS[3];
}

export default function RouletteBallGrid({
  numbersToReveal = [],
  reveal,
  userPicks = [],
  onDone,
}: Props) {
  // Single spin config (from swipe, not important for bug)
  const [spinSetting, setSpinSetting] = React.useState(1);
  const { attachSwipeHandlers } = useSpinSetting(reveal, setSpinSetting);
  const gridRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid || reveal) return;
    const detach = attachSwipeHandlers(grid);
    return detach;
  }, [reveal, attachSwipeHandlers]);

  const currentSpinConf = getSpinConfig(spinSetting);

  return (
    <div className="flex flex-col items-center w-full">
      <div>
        <div
          className="grid grid-cols-6 grid-rows-3 gap-3 touch-pan-x"
          ref={gridRef}
        >
          {Array.from({ length: ROWS * COLS }).map((_, i) => {
            const number = numbersToReveal[i];
            if (typeof number === "number") {
              const isUserPick = userPicks.includes(number);
              return (
                <Ball3D
                  key={"stop" + i}
                  number={number}
                  highlight={isUserPick}
                />
              );
            } else {
              return (
                <Ball3D
                  key={"spin" + i}
                  spinning
                  spinConfig={currentSpinConf}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
