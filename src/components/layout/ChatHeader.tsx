"use client";

import { useChatStore } from "@/stores";
import Image from "next/image";
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
        <div className="flex min-w-0 items-center gap-2 md:hidden">
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
        </div>
      </div>
      <div className="min-w-0 flex-1" />
      <button
        type="button"
        onClick={onSurveyClick}
        className={
          surveyCompleted
            ? "flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-1.5 text-sm font-medium text-[#6b6b6b] transition-colors hover:bg-[#f0f0ee]"
            : "flex shrink-0 items-center gap-1.5 rounded-2xl border border-[#f4cb4b] bg-[#fdf6dc] px-3 py-1.5 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#fff9e6]"
        }
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
