"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const isHeader = variant === "header";
  /** 표시 크기(CSS px) — 레티나 대비 intrinsic 2배 */
  const displayPx = isHeader ? 40 : 44;
  const intrinsic = displayPx * 2;

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-0.5 transition-colors hover:bg-[#f0f0ee]",
        className
      )}
      aria-label="홈으로"
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
          isHeader ? "h-10 w-10" : "h-11 w-11"
        )}
      />
      <span
        className={cn(
          "truncate font-piyoMark font-semibold tracking-[-0.02em] text-[#1a1a1a]",
          isHeader
            ? "text-[1.375rem] sm:text-[1.5rem] leading-none"
            : "text-[1.5rem] leading-none sm:text-[1.625rem]"
        )}
      >
        Piyo
      </span>
    </button>
  );
}
