"use client";

import { useChatStore } from "@/stores";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PanelLeft } from "lucide-react";

interface ChatHeaderProps {
  onSurveyClick: () => void;
  surveyCompleted: boolean;
}

export default function ChatHeader({
  onSurveyClick,
  surveyCompleted,
}: ChatHeaderProps) {
  const { isSidebarOpen, setSidebarOpen } = useChatStore();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between border-b border-[#efefef] bg-white/90 px-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[#6b6b6b] transition-colors hover:bg-[#f0f0ee]"
            aria-label="사이드바 열기"
          >
            <PanelLeft className="h-5 w-5 shrink-0" strokeWidth={2} />
          </button>
        )}
        {/* 모바일에서 피요 로고/이름 — 클릭 시 홈으로 */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex min-w-0 items-center gap-2 rounded-lg transition-colors hover:bg-[#f0f0ee] px-1 py-0.5 md:hidden"
          aria-label="홈으로"
        >
          <Image
            src="/images/piyo-default.png"
            alt="피요"
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full object-cover"
          />
          <span className="truncate text-sm font-semibold text-[#1a1a1a]">
            피요
          </span>
        </button>
      </div>
      <div className="min-w-0 flex-1" />
      {/* 설문 버튼 — 최소 터치 영역 44px */}
      <button
        type="button"
        onClick={onSurveyClick}
        className={cn(
          "flex min-h-[44px] min-w-[44px] shrink-0 items-center gap-1.5 rounded-2xl px-3 py-1.5 text-sm font-medium transition-colors",
          surveyCompleted
            ? "text-[#6b6b6b] hover:bg-[#f0f0ee]"
            : "border border-[#f4cb4b] bg-[#fdf6dc] text-[#1a1a1a] hover:bg-[#fff9e6]"
        )}
      >
        <span className="text-base leading-none" aria-hidden>
          📋
        </span>
        <span className="hidden sm:inline">
          {surveyCompleted ? "설문 수정" : "설문하기"}
        </span>
        <span className="sm:hidden">설문</span>
      </button>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
