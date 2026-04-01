"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppOriginLink } from "./AppOriginLink";
import { AppPriceDisplay } from "./AppPriceDisplay";
import { AppWishButton } from "./AppWishButton";

/**
 * 앱 `product-list-item.tsx` — 챗봇에 쓰이는 `squareHorizontal` 변형만 이식.
 * (병원 아코디언 `treatmentHorizontal` / HospitalRecommendWrapper 제외)
 */
export interface AppProductListItemProps {
  name: string;
  description: string;
  price: number | string;
  imageUrl: string;
  wished?: boolean;
  path?: string;
  onClick?: () => void | Promise<void>;
  onWishClick?: (like: boolean) => void;
  className?: string;
  pricePrefix?: string;
  origin?: string;
  priceInfo?: string;
}

export const AppProductListItem: React.FC<AppProductListItemProps> = ({
  name,
  description,
  price,
  imageUrl,
  wished = false,
  path,
  onClick,
  onWishClick,
  className,
  pricePrefix,
  origin,
  priceInfo,
}) => {
  const router = useRouter();

  const handleItemClick = async () => {
    if (onClick) await onClick();
    if (path) router.push(path);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void handleItemClick();
        }
      }}
      className={cn(
        "flex max-w-[358px] cursor-pointer items-center gap-3 rounded-lg",
        className
      )}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element -- 앱과 동일 `<img>`, 동적 S3 URL */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="size-full object-cover object-top"
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="text-sm font-bold text-[var(--brand-dark)]">
            {name?.charAt(0) ?? "?"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 py-2">
        <div className="flex items-center justify-between gap-1">
          <span className="line-clamp-1 flex flex-1 items-center gap-1 text-sm font-normal text-neutral-900">
            {name}
            <AppOriginLink origin={origin} />
          </span>
          <AppWishButton
            className="shrink-0"
            wished={wished}
            onToggle={onWishClick}
          />
        </div>
        <div className="line-clamp-2 max-w-[242px] text-xs font-normal text-neutral-500">
          {description}
        </div>
        <div className="mt-auto flex w-full items-center justify-between gap-1">
          <AppPriceDisplay
            price={price}
            pricePrefix={pricePrefix}
            priceInfo={priceInfo}
          />
        </div>
      </div>
    </div>
  );
};
