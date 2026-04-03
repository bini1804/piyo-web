import { useState, useEffect, useRef } from "react";

export function useTypewriter(text: string | undefined, enabled: boolean = true) {
  const safeText = text ?? "";
  const [displayedChars, setDisplayedChars] = useState(
    enabled ? 0 : safeText.length
  );
  const [done, setDone] = useState(!enabled);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!enabled) {
      setDisplayedChars(safeText.length);
      setDone(true);
      return;
    }

    setDisplayedChars(0);
    setDone(false);
    startTimeRef.current = null;

    const totalChars = safeText.length;
    if (totalChars === 0) {
      setDone(true);
      return;
    }

    // 전체 길이에 따라 속도 조절 (ms per char)
    const msPerChar =
      totalChars > 300 ? 8 :
      totalChars > 150 ? 12 : 18;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const charsToShow = Math.min(
        Math.floor(elapsed / msPerChar) + 1,
        totalChars
      );
      setDisplayedChars(charsToShow);
      if (charsToShow < totalChars) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDone(true);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [safeText, enabled]);

  const displayed = safeText.slice(0, displayedChars);
  return { displayed, done };
}
