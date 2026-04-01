"use client";

import type { ReactNode } from "react";
import type { RecommendedProduct } from "@/types";
import { useDragScroll } from "@/hooks/useDragScroll";
import { cn } from "@/lib/utils";

const CARD_OUTER = "w-[358px] shrink-0 overflow-hidden rounded-[var(--radius-sm)]";

/**
 * 화장품·시술 추천: 앱 squareHorizontal 폭(358px) 고정 가로 스크롤 + 마우스 드래그 스크롤.
 */
export function HorizontalChatSection({
  title,
  items,
  renderItem,
  getKey,
}: {
  title: string;
  items: RecommendedProduct[];
  getKey: (item: RecommendedProduct, index: number) => string;
  renderItem: (item: RecommendedProduct) => ReactNode;
}) {
  const { scrollRef, blockCardClickRef, dragHandlers } = useDragScroll();

  if (items.length === 0) return null;

  return (
    <div className="w-full space-y-3 overflow-hidden rounded-2xl bg-white p-4">
      <h3
        className="break-words text-[14px] font-semibold leading-5 text-neutral-900"
        style={{ color: "var(--text-primary)", fontWeight: 600 }}
      >
        {title}
      </h3>
      <div
        ref={scrollRef}
        {...dragHandlers}
        className={cn(
          "flex flex-nowrap gap-3 overflow-x-auto overscroll-x-contain pb-1",
          "cursor-grab active:cursor-grabbing",
          "[-webkit-overflow-scrolling:touch]"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        {items.map((item, i) => (
          <div
            key={getKey(item, i)}
            className={CARD_OUTER}
            onClickCapture={(e) => {
              if (blockCardClickRef.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
