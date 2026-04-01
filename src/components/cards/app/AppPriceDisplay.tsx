"use client";

import type React from "react";
import { formatPrice, parseKoreanPrice } from "./app-price-utils";

interface AppPriceDisplayProps {
  price: number | string;
  pricePrefix?: string;
  priceInfo?: string;
  className?: string;
  mainPriceClassName?: string;
  unitClassName?: string;
  prefixClassName?: string;
  infoClassName?: string;
}

/** 앱 `price-display.tsx`와 동일 로직 · 타이포는 piyo-web 유틸 클래스로 치환 */
export const AppPriceDisplay: React.FC<AppPriceDisplayProps> = ({
  price,
  pricePrefix,
  priceInfo,
  className = "",
  mainPriceClassName = "text-base font-semibold text-black",
  unitClassName = "text-sm font-normal text-black",
  prefixClassName = "text-sm font-medium text-red-600",
  infoClassName = "text-xs font-normal text-neutral-500",
}) => {
  if (!price && !priceInfo) return null;

  const priceStr = typeof price === "string" ? price : formatPrice(price);
  const { mainPrice, unit } = parseKoreanPrice(priceStr);

  const renderPriceInfo = () => {
    if (!priceInfo) return null;
    if (!price) {
      return (
        <span className="text-sm font-semibold text-neutral-900">
          {priceInfo}
        </span>
      );
    }
    return <span className={infoClassName}>{priceInfo}</span>;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {pricePrefix && <span className={prefixClassName}>{pricePrefix}</span>}
      {(mainPrice || price) && (
        <div className="flex items-center gap-0.5">
          <span className={mainPriceClassName}>{mainPrice}</span>
          {unit ? (
            <span className={unitClassName}>{unit}원</span>
          ) : (
            <span className={unitClassName}>원</span>
          )}
        </div>
      )}
      {renderPriceInfo()}
    </div>
  );
};
