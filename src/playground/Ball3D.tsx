
import React from "react";

type Ball3DProps = {
  spinning?: boolean;
  number?: number;
  highlight?: boolean;
  spinConfig?: { direction: number; speed: number };
};

export default function Ball3D({
  spinning,
  number,
  highlight,
  spinConfig,
}: Ball3DProps) {
  // Determine color based on user pick (highlight)
  const isSpinning = !!spinning;

  // All balls (spinning or stopped) use the white/silver gradient unless highlighted
  const ballBackground = highlight
    ? "bg-green-500"
    : "bg-gradient-to-b from-white via-slate-100 to-slate-300";

  // Only show border if highlighted, transparent otherwise
  const borderColor = highlight
    ? "border-green-600/60"
    : "border-transparent";

  const ballBoxShadow = highlight
    ? "0 3px 16px 2px rgba(34,197,94,0.28), 0 0.5px 2.8px 0px #eaf3fa"
    : isSpinning
    ? "0 3px 14px 2px rgba(50,50,60,0.18), 0 0.5px 2.8px 0px #cfd6ea44"
    : "0 3px 8px 2px rgba(80,90,120,0.16), 0 0.5px 2.8px 0px #eaf3fa";

  // Dynamic animation config
  let glossAnimation = undefined;
  let glossDuration = undefined;
  if (spinning && spinConfig) {
    glossAnimation =
      spinConfig.direction === 1
        ? "roulette-ball-gloss-move-right"
        : "roulette-ball-gloss-move-left";
    glossDuration = `${spinConfig.speed}s`;
  }

  return (
    <div
      className={`relative flex items-center justify-center aspect-square`}
      style={{
        width: 38,
        height: 38,
        minWidth: 28,
        minHeight: 28,
      }}
    >
      {/* Ball surface */}
      <span
        className={`
          absolute inset-0 rounded-full
          ${ballBackground}
          shadow-lg border-[2.5px] ${borderColor}
        `}
        style={{
          boxShadow: ballBoxShadow,
          transition: "background 0.3s",
        }}
        aria-hidden
      />

      {/* Gloss for spinning, static gloss for stopped */}
      <span
        className="absolute left-0 top-0 w-full h-full rounded-full pointer-events-none overflow-hidden"
        aria-hidden
        style={{ zIndex: 2 }}
      >
        {/* Soft 3D gloss -- only a subtle arc in the upper left quadrant */}
        {spinning ? (
          <span
            className="block absolute left-[-22%] top-[-10%] w-[75%] h-[60%]"
            style={{
              background:
                "radial-gradient(ellipse 60% 90% at 40% 25%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.18) 60%, rgba(255,255,255,0) 100%)",
              filter: "blur(2px)",
              borderRadius: "90%",
              animation: glossAnimation
                ? `${glossAnimation} ${glossDuration} linear infinite`
                : undefined,
            }}
          />
        ) : highlight ? (
          // Subtle gloss over green if highlighted, bias to upper left
          <span
            className="block absolute left-[0%] top-[-8%] w-[70%] h-[48%]"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 42% 15%, rgba(255,255,255,0.29) 0%, rgba(255,255,255,0.10) 70%, rgba(255,255,255,0) 100%)",
              filter: "blur(1.8px)",
              borderRadius: "60%",
              opacity: 0.7,
            }}
          />
        ) : (
          // Standard gloss for stopped white ball
          <span
            className="block absolute left-[-12%] top-[-12%] w-[75%] h-[54%]"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 45% 20%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.1) 64%, rgba(255,255,255,0) 100%)",
              filter: "blur(1.45px)",
              borderRadius: "70%",
              opacity: 0.83,
            }}
          />
        )}
      </span>
      {/* No lower or upper fake highlight below or right of the number anymore! */}

      {/* Center highlight - only show if not highlighted and not spinning */}
      {!highlight && !isSpinning && (
        <span
          className="absolute"
          style={{
            top: "20%",
            left: "41%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, #fff 85%, #e0ebfc11 100%)",
            opacity: 0.70,
            filter: "blur(0.9px)",
          }}
          aria-hidden
        />
      )}
      {/* Number overlay */}
      {typeof number === "number" && (
        <span
          className={`relative font-extrabold text-base select-none`}
          style={{
            zIndex: 10,
            color: highlight ? "#111" : "#222",
            textShadow: highlight
              ? "0 2px 7px #99f6e0ee"
              : "0 1px 6px #d4dfff88",
            fontFamily: "Poppins, Inter, sans-serif",
            letterSpacing: "-0.02em",
            userSelect: "none",
          }}
        >
          {number}
        </span>
      )}
      <style>{`
        @keyframes roulette-ball-gloss-move-right {
          0%   { left: -25%; opacity: 0.2;}
          12%  { opacity: 0.5;}
          38%  { opacity: 0.98;}
          50%  { left: 45%; opacity: 1;}
          80%  { opacity: .5;}
          100% { left: 102%; opacity: 0.2;}
        }
        @keyframes roulette-ball-gloss-move-left {
          0%   { left: 102%; opacity: 0.2;}
          12%  { opacity: 0.5;}
          38%  { opacity: 0.98;}
          50%  { left: -25%; opacity: 1;}
          80%  { opacity: .5;}
          100% { left: -60%; opacity: 0.2;}
        }
      `}</style>
    </div>
  );
}
