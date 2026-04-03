"use client";

import { useEffect } from "react";
import Image from "next/image";

const NUDGE_KEY = "piyo-survey-nudge-dismissed";
const NUDGE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export function isSurveyNudgeDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(NUDGE_KEY);
  if (!val) return false;
  return Date.now() - Number(val) < NUDGE_EXPIRY_MS;
}

interface SurveyWelcomeModalProps {
  onStartSurvey: () => void;
  onDismiss: () => void;
}

export default function SurveyWelcomeModal({
  onStartSurvey,
  onDismiss,
}: SurveyWelcomeModalProps) {
  const dismiss = () => {
    localStorage.setItem(NUDGE_KEY, String(Date.now()));
    onDismiss();
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 배경 딤 */}
      <div className="absolute inset-0 bg-black/40" onClick={dismiss} />

      {/* 바텀 시트 */}
      <div className="relative w-full max-w-[480px] rounded-t-2xl bg-white px-6 pb-10 pt-6 shadow-xl animate-slide-up">
        <Image
          src="/images/piyo-smile.png"
          alt="피요"
          width={56}
          height={56}
          className="object-contain mb-4"
        />

        <h2 className="text-lg font-bold leading-snug text-[#1a1a1a]">
          피부 정보를 알려주시면
          <br />
          더 정확하게 추천해드려요 🌿
        </h2>
        <p className="mt-2 text-sm text-[#6b6960]">
          1분이면 충분해요. 언제든 수정할 수 있어요.
        </p>

        <button
          type="button"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl font-semibold text-[15px] text-[#1a1a1a] transition-opacity hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: "#F4CB4B" }}
          onClick={onStartSurvey}
        >
          지금 입력하기
        </button>

        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full text-center text-sm font-medium text-[#9b9b9b] transition-colors hover:text-[#1a1a1a]"
        >
          나중에
        </button>
      </div>
    </div>
  );
}
