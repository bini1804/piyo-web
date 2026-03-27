"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";

const DISMISS_KEY = "login_modal_dismissed_at";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

export function isLoginModalDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(DISMISS_KEY);
  if (!val) return false;
  return Date.now() - Number(val) < DISMISS_DURATION_MS;
}

interface LoginPromptModalProps {
  onClose: () => void;
}

export default function LoginPromptModal({ onClose }: LoginPromptModalProps) {
  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    onClose();
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
        {/* X 닫기 버튼 */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#9b9b9b] hover:bg-gray-100"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 타이틀 */}
        <h2 className="text-lg font-bold leading-snug text-[#1a1a1a]">
          3초 만에 시작하는<br />나만의 맞춤 피부 관리
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6b6960]">
          로그인하면 대화가 저장되고<br />피요가 나를 기억해요
        </p>

        {/* 로그인 버튼들 */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-black transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: "#FEE500" }}
            onClick={() => void signIn("kakao", { callbackUrl: "/" })}
          >
            카카오로 계속하기
          </button>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: "#03C75A" }}
            onClick={() => void signIn("naver", { callbackUrl: "/" })}
          >
            네이버로 계속하기
          </button>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-[#E0E0E0] bg-white text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-[#FAFAFA] active:bg-[#F5F5F5]"
            onClick={() => void signIn("google", { callbackUrl: "/" })}
          >
            구글로 계속하기
          </button>
        </div>

        {/* 비로그인 계속하기 */}
        <button
          type="button"
          onClick={dismiss}
          className="mt-5 w-full text-center text-sm font-medium text-[#9b9b9b] transition-colors hover:text-[#1a1a1a]"
        >
          비로그인으로 계속하기
        </button>
      </div>
    </div>
  );
}
