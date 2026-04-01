"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const DRAG_THRESHOLD_PX = 8;

/**
 * 가로 overflow 컨테이너에서 마우스로 드래그해 scrollLeft 이동.
 * 카드 내부 클릭은 포인터 캡처를 쓰지 않아 브라우저 click 합성이 유지됨.
 * 터치는 네이티브 스크롤만 사용(pointerdown에서 무시).
 */
export function useDragScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const blockCardClickRef = useRef(false);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el) return;
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;

      blockCardClickRef.current = false;

      const pointerId = e.pointerId;
      const startX = e.clientX;
      const startScroll = el.scrollLeft;
      let draggedPastThreshold = false;

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        const dx = ev.clientX - startX;
        if (Math.abs(dx) > DRAG_THRESHOLD_PX) draggedPastThreshold = true;
        el.scrollLeft = startScroll - (ev.clientX - startX);
      };

      const end = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        if (draggedPastThreshold) {
          blockCardClickRef.current = true;
          setTimeout(() => {
            blockCardClickRef.current = false;
          }, 0);
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    },
    []
  );

  return {
    scrollRef,
    blockCardClickRef,
    dragHandlers: {
      onPointerDown,
    },
  };
}
