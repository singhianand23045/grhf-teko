
export type LayoutSectionKey =
  | "jackpot"
  | "timer"
  | "wallet"
  | "drawNumbers"
  | "numberSelect";

export type SectionLayoutConfig = {
  key: LayoutSectionKey;
  height: string; // e.g., "15%"
  bg: string; // tailwind gradient classes
  font: string; // font classes
};

export const layoutConfig: SectionLayoutConfig[] = [
  {
    key: "jackpot",
    height: "15%",
    bg: "from-yellow-50 to-yellow-100",
    font: "font-bold text-yellow-700 text-6xl"
  },
  {
    key: "timer",
    height: "15%",
    bg: "from-blue-50 to-indigo-100",
    font: "font-mono font-extrabold text-blue-900 text-3xl"
  },
  {
    key: "wallet",
    height: "5%",
    bg: "from-green-50 to-green-100",
    font: "font-semibold text-green-900"
  },
  {
    key: "drawNumbers",
    height: "30%",
    bg: "from-purple-50 to-indigo-50",
    font: "font-normal text-indigo-900"
  },
  {
    key: "numberSelect",
    height: "35%",
    bg: "from-white to-green-50",
    font: "font-normal text-green-900"
  }
];

