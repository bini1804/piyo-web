"use client";

import type React from "react";
import { ExternalLink } from "lucide-react";

interface AppOriginLinkProps {
  origin?: string;
  className?: string;
}

/** 앱 `origin-link.tsx` — 웹·웹뷰 공통: 새 탭(브릿지 없음 시 window.open) */
export const AppOriginLink = ({
  origin,
  className = "",
}: AppOriginLinkProps) => {
  if (!origin) return null;
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    window.open(origin, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex h-6 w-6 items-center justify-center gap-1 rounded-full bg-gray-100 px-1 py-1 text-gray-600 transition-colors hover:bg-gray-200 ${className}`}
      title="출처 보기"
    >
      <ExternalLink className="size-3" />
    </button>
  );
};
