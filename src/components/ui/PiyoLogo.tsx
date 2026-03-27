"use client";

import { cn } from "@/lib/utils";

interface PiyoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const sizes = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 52, text: "text-3xl" },
};

export default function PiyoLogo({ size = "md", className, showText = true }: PiyoLogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="28" rx="16" ry="15" fill="#F4CB4B" />
        <ellipse cx="24" cy="32" rx="10" ry="9" fill="#FFF3C4" opacity="0.6" />
        <circle cx="18" cy="23" r="2.5" fill="#1A1A18" />
        <circle cx="17.2" cy="22.2" r="0.8" fill="white" />
        <circle cx="30" cy="23" r="2.5" fill="#1A1A18" />
        <circle cx="29.2" cy="22.2" r="0.8" fill="white" />
        <path d="M22 27 L24 30 L26 27" fill="#E5983A" />
        <ellipse cx="14" cy="27" rx="2.5" ry="1.5" fill="#FFB5A7" opacity="0.4" />
        <ellipse cx="34" cy="27" rx="2.5" ry="1.5" fill="#FFB5A7" opacity="0.4" />
        <path d="M22 14 Q24 8 26 14" stroke="#E5B830" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className={cn("font-display font-semibold tracking-tight text-piyo-text", s.text)}>
          피요
        </span>
      )}
    </div>
  );
}
