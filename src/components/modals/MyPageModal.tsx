"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { X } from "lucide-react";
import type { SkinType } from "@/types";
import { SENSITIVITY_LEVELS } from "@/constants/survey";
import { useChatStore, useSurveyStore } from "@/stores";

const SKIN_LABEL: Record<SkinType, string> = {
  oily: "지성",
  dry: "건성",
  combination: "복합성",
  sensitive: "민감성",
  normal: "중성",
};

interface MyPageModalProps {
  onClose: () => void;
  nickname?: string;
  userName?: string;
  skinType?: SkinType;
  skinSensitivity?: number;
  concerns?: string[];
  /** 마이페이지 닫은 뒤 설문 모달을 연기 전 서버에서 최신 설문을 스토어에 반영할 수 있음 */
  onOpenSurvey: () => void | Promise<void>;
}

export default function MyPageModal({
  onClose,
  nickname,
  userName,
  skinType,
  skinSensitivity,
  concerns = [],
  onOpenSurvey,
}: MyPageModalProps) {
  const forceReset = useSurveyStore((s) => s.forceReset);
  const setCompleted = useSurveyStore((s) => s.setCompleted);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleLogout = async () => {
    onClose();
    await new Promise((r) => setTimeout(r, 150));
    forceReset();
    // 로컬 채팅 스토어 초기화 (화면에서 즉시 제거)
    // RDS 데이터는 유지 — 재로그인 시 복원됨
    useChatStore.getState().clearAllSessions();
    localStorage.removeItem("piyo-chat-v3");
    localStorage.removeItem("piyo-survey-store");
    localStorage.removeItem("login_modal_dismissed_at");
    localStorage.removeItem("piyo-last-user-id");
    document.cookie = "piyo-survey-done=; max-age=0; path=/";
    await signOut({ callbackUrl: "/" });
  };

  const displayName = nickname?.trim() || userName?.trim() || "회원";
  const skinLabel = skinType ? SKIN_LABEL[skinType] : "—";
  const sens = SENSITIVITY_LEVELS.find((l) => l.level === skinSensitivity);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-[4px]">
      <div
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] bg-white shadow-lg sm:rounded-[24px]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#efefef] px-5 py-4">
          <h2 className="text-lg font-bold text-[#1a1a1a]">마이페이지</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-[#f0f0ee]"
            aria-label="닫기"
          >
            <X size={20} className="text-[#6b6b6b]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <section>
            <p className="text-xs font-medium text-[#b0b0b0] mb-1">별명</p>
            <p className="text-sm font-semibold text-[#1a1a1a]">{displayName}</p>
          </section>
          <section>
            <p className="text-xs font-medium text-[#b0b0b0] mb-1">피부 타입</p>
            <p className="text-sm font-semibold text-[#1a1a1a]">{skinLabel}</p>
          </section>
          <section>
            <p className="text-xs font-medium text-[#b0b0b0] mb-1">민감도</p>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              {skinSensitivity != null && sens
                ? `Level ${sens.level} · ${sens.name}`
                : "—"}
            </p>
          </section>
          <section>
            <p className="text-xs font-medium text-[#b0b0b0] mb-2">피부 고민</p>
            {concerns.length === 0 ? (
              <p className="text-sm text-[#888]">—</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {concerns.map((c) => (
                  <li
                    key={c}
                    className="rounded-lg bg-[#f5f5f5] px-2.5 py-1 text-xs text-[#444]"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="shrink-0 border-t border-[#efefef] px-5 py-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              setCompleted(false);
              document.cookie = "piyo-survey-done=; max-age=0; path=/";
              void onOpenSurvey();
              onClose();
            }}
            className="w-full rounded-xl bg-[#f4cb4b] py-3 text-sm font-semibold text-[#1a1a1a] transition-opacity hover:opacity-95"
          >
            설문 수정하기
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
