"use client";

import { useChatStore } from "@/stores";
import { PanelLeft } from "lucide-react";
import { PiyoBrandButton } from "@/components/layout/PiyoBrandButton";

interface ChatHeaderProps {
  onSurveyClick: () => void;
  surveyCompleted: boolean;
  /** false이면 우측 설문 진입 버튼 자체를 숨김 */
  showSurveyButton: boolean;
}

export default function ChatHeader({
  onSurveyClick,
  surveyCompleted,
  showSurveyButton,
}: ChatHeaderProps) {
  const { isSidebarOpen, setSidebarOpen } = useChatStore();

  return (
    <header className="sticky top-0 z-20 flex min-h-12 shrink-0 items-center justify-between border-b border-[#efefef] bg-white/90 px-3 py-1 backdrop-blur-md">
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
        {/* 모바일 헤더 브랜드 — 클릭 시 홈으로 */}
        <PiyoBrandButton variant="header" className="md:hidden" />
      </div>
      <div className="min-w-0 flex-1" />
      {showSurveyButton ? (
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
      ) : (
        <div className="min-h-[44px] min-w-[44px] shrink-0" aria-hidden />
      )}
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
