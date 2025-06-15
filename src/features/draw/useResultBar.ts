
import { useRef, useState } from "react";

/**
 * Custom hook to manage the state and behavior of the Result Bar.
 * - Handles display state, credit value, and automatic timeout to hide.
 */
export function useResultBar(
  initial: { show: boolean; credits: number | null } = { show: false, credits: null },
  timeoutMs: number = 5000
) {
  const [resultBar, setResultBar] = useState<{ show: boolean; credits: number | null }>(initial);
  const resultTimeout = useRef<NodeJS.Timeout | null>(null);

  const showResultBar = (credits: number | null) => {
    setResultBar({ show: true, credits });
    if (resultTimeout.current) clearTimeout(resultTimeout.current);
    resultTimeout.current = setTimeout(() => {
      setResultBar({ show: false, credits: null });
    }, timeoutMs);
  };

  const hideResultBar = () => {
    setResultBar(({ credits }) => ({ show: false, credits: null }));
    if (resultTimeout.current) clearTimeout(resultTimeout.current);
  };

  const triggerResultBar = () => {
    setResultBar((curr) => ({ show: true, credits: curr.credits }));
    if (resultTimeout.current) clearTimeout(resultTimeout.current);
    resultTimeout.current = setTimeout(() => {
      setResultBar({ show: false, credits: null });
    }, timeoutMs);
  };

  // Clean up timeout on unmount
  const cleanup = () => {
    if (resultTimeout.current) clearTimeout(resultTimeout.current);
  };

  return {
    resultBar,
    showResultBar,
    hideResultBar,
    triggerResultBar,
    cleanup,
    setResultBar // for advanced usage
  };
}
