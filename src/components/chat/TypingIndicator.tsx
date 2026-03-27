"use client";

import Image from "next/image";

export default function TypingIndicator() {
  return (
    <div className="flex w-full max-w-full justify-start gap-2 animate-fade-in">
      <div className="shrink-0 pt-0.5">
        <Image
          src="/images/piyo-smile.png"
          alt="피요"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 min-w-[52px]"
        style={{
          background: "var(--bubble-piyo)",
          border: "1px solid var(--border)",
          borderRadius: "4px 20px 20px 20px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span className="typing-dot-piyo" />
        <span className="typing-dot-piyo animate-delay-200" />
        <span className="typing-dot-piyo animate-delay-300" />
      </div>
    </div>
  );
}
