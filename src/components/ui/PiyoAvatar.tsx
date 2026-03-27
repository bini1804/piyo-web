"use client";

export default function PiyoAvatar({ size = 18 }: { size?: number }) {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-400/15 flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="28" rx="16" ry="15" fill="#F4CB4B" />
        <circle cx="18" cy="23" r="2.5" fill="#1A1A18" />
        <circle cx="30" cy="23" r="2.5" fill="#1A1A18" />
        <path d="M22 27 L24 30 L26 27" fill="#E5983A" />
      </svg>
    </div>
  );
}
