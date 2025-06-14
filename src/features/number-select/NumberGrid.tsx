
import React, { useRef } from "react";
import { useNumberSelection } from "./NumberSelectionContext";
import { cn } from "@/lib/utils";

type Props = {};

export default function NumberGrid({}: Props) {
  const { picked, setPicked, canPick, isConfirmed } = useNumberSelection();
  const shakeRef = useRef<HTMLDivElement>(null);

  const numbers = Array.from({ length: 27 }, (_, i) => i + 1);

  function handlePick(num: number) {
    if (!canPick) return;
    setPicked(prev => {
      if (prev.includes(num)) {
        // Deselect
        return prev.filter(n => n !== num);
      } else if (prev.length < 6) {
        // Select new
        return [...prev, num];
      } else {
        // Shake animation for extra
        if (shakeRef.current) {
          shakeRef.current.classList.remove("animate-shake");
          // Restart the animation
          void shakeRef.current.offsetWidth;
          shakeRef.current.classList.add("animate-shake");
        }
        return prev;
      }
    });
  }

  return (
    <div
      ref={shakeRef}
      className={cn("w-full max-w-md grid grid-cols-9 grid-rows-3 gap-2 p-4 bg-white rounded-2xl shadow-lg transition-all", isConfirmed && "pointer-events-none opacity-60")}
    >
      {numbers.map(num => {
        const selected = picked.includes(num);
        return (
          <button
            key={num}
            className={cn(
              "aspect-square w-8 sm:w-10 rounded-full flex items-center justify-center font-semibold text-base select-none transition-colors outline-none focus:z-10",
              selected
                ? "bg-green-500 text-white shadow-md ring-2 ring-green-400"
                : "bg-gray-100 hover:bg-blue-100 text-gray-800",
              !canPick && !selected && "opacity-40 pointer-events-none"
            )}
            type="button"
            tabIndex={isConfirmed ? -1 : 0}
            onClick={() => handlePick(num)}
            aria-pressed={selected}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}
