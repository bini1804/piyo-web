"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppWishButtonProps {
  wished?: boolean;
  onToggle?: (next: boolean) => void | Promise<void>;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

/**
 * 앱 찜 버튼 UI. 네이티브 햅틱 없음(웹·웹뷰).
 * onToggle 미지정 시 하트만 표시(클릭 시 로컬 토글만).
 */
export const AppWishButton: React.FC<AppWishButtonProps> = ({
  wished = false,
  onToggle,
  className,
  ariaLabel = "찜하기",
  disabled,
}) => {
  const [isWished, setIsWished] = React.useState<boolean>(wished);
  React.useEffect(() => {
    setIsWished(wished);
  }, [wished]);

  const handleClick = async (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const next = !isWished;
    setIsWished(next);
    await onToggle?.(next);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isWished}
      disabled={disabled}
      onClick={handleClick}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Heart
        className={cn(
          "size-5",
          isWished ? "fill-red-400 text-red-400" : "text-gray-300"
        )}
        strokeWidth={isWished ? 0 : 1.5}
      />
    </button>
  );
};
