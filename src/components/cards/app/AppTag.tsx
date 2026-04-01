"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** 앱 `tag.tsx` 축약 — 병원 기본 카드의 전문의 뱃지만 사용 */
export interface AppTagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "specialist";
  className?: string;
}

export const AppTag = React.forwardRef<HTMLDivElement, AppTagProps>(
  ({ children, variant = "default", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center text-xs font-normal",
        variant === "specialist" &&
          "gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-950",
        variant === "default" && "rounded bg-gray-100 px-1.5 py-0 text-neutral-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

AppTag.displayName = "AppTag";
