"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores";

type Variant = "sidebar" | "header";

/**
 * 사이드바 / 모바일 헤더 공통 — 클로드 스타일 세리프 워드마크 + 2x 해상도 아바타
 */
export function PiyoBrandButton({
  variant = "sidebar",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const router = useRouter();
  const startNewSession = useChatStore((s) => s.startNewSession);
  const isHeader = variant === "header";
  /** 표시 크기(CSS px) — 레티나 대비 intrinsic 2배 */
  const displayPx = isHeader ? 40 : 48;
  const intrinsic = displayPx * 2;

  return (
    <button
      type="button"
      onClick={() => {
        startNewSession();
        router.push("/");
      }}
      className={cn(
        "flex min-w-0 items-center rounded-lg transition-colors hover:bg-[#f0f0ee]",
        isHeader
          ? "gap-2.5 px-1 py-0.5"
          : "gap-3 px-2 py-2",
        className
      )}
      aria-label="홈으로, 새 대화 화면"
    >
      <Image
        src="/images/piyo-default.png"
        alt="Piyo"
        width={intrinsic}
        height={intrinsic}
        quality={100}
        priority={variant === "sidebar"}
        sizes={`${displayPx}px`}
        className={cn(
          "shrink-0 rounded-full object-cover",
          isHeader ? "h-10 w-10" : "h-12 w-12"
        )}
      />
      <span
        className={cn(
          "truncate font-piyoMark font-semibold tracking-[-0.02em] text-[#1a1a1a]",
          isHeader
            ? "text-xl sm:text-[1.5rem] leading-none"
            : "text-xl sm:text-2xl leading-none"
        )}
      >
        Piyo
      </span>
    </button>
  );
}
