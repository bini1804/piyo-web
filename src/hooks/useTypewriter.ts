import { useState, useEffect, useRef } from "react";

export function useTypewriter(text: string | undefined, enabled: boolean = true) {
  const safeText = text ?? "";
  const lines = safeText.split("\n");

  const [visibleCount, setVisibleCount] = useState(
    enabled ? 0 : lines.length
  );
  const [done, setDone] = useState(!enabled);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 기존 interval 즉시 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const newLines = safeText.split("\n");

    if (!enabled) {
      setVisibleCount(newLines.length);
      setDone(true);
      return;
    }

    setVisibleCount(0);
    setDone(false);

    // 줄 수에 따라 속도 조절
    const speed =
      newLines.length > 20 ? 30 :
      newLines.length > 10 ? 45 : 60;

    let current = 0;
    intervalRef.current = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= newLines.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setDone(true);
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [safeText, enabled]);

  // 완성된 줄만 join — 마크다운 블록이 완성된 상태로 전달됨
  const displayed = lines.slice(0, visibleCount).join("\n");

  return { displayed, done };
}
