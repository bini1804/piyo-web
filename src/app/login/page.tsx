"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";

const LoginTooltip = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative rounded-full bg-white px-4 py-2 shadow-[0px_1px_8px_0px_rgba(0,0,0,0.1)]">
        <span className="text-sm font-medium whitespace-nowrap text-[#1a1a1a]">
          {text}
        </span>
      </div>
      <div className="relative h-1.5 w-3">
        <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full">
          <path d="M6 6L0 0H12L6 6Z" fill="white" />
        </svg>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [lastProvider, setLastProvider] = useState<string | null>(null);

  useEffect(() => {
    setLastProvider(localStorage.getItem("piyo-last-provider"));
  }, []);

  return (
    <div
      className="flex min-h-dvh w-full items-center justify-center px-4 py-8 font-body"
      style={{
        background:
          "linear-gradient(160deg, #FFFBEF 0%, #FFF9F0 40%, #F0F7FF 100%)",
      }}
    >
      {/* 모바일 뒤로가기 버튼 */}
      <button
        type="button"
        onClick={() => router.back()}
        className="fixed left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="h-5 w-5 text-[#1a1a1a]" />
      </button>

      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="h-1 w-full shrink-0 bg-[#F4CB4B]" aria-hidden />
        <div className="flex flex-col items-center px-8 pb-8 pt-7 text-center">
          <div className="relative mb-6 h-[120px] w-[120px] shrink-0">
            <Image
              src="/characters/piyo-smile.png"
              alt="피요"
              fill
              className="object-contain"
              priority
              sizes="120px"
            />
          </div>

          <h1 className="text-xl font-semibold leading-snug tracking-tight text-[#1a1a1a] sm:text-[1.35rem]">
            피요와 함께 나만의 피부 루틴 만들기
          </h1>
          <p className="mt-2 text-sm text-[#6b6960] sm:text-[0.9375rem]">
            로그인하면 대화 기록이 저장돼요
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            {/* 카카오 말풍선 */}
            {lastProvider === "kakao" && <LoginTooltip text="지난번에 카카오로 로그인했어요" />}
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-[#000000] transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: "#FEE500" }}
              onClick={() => {
                localStorage.setItem("piyo-last-provider", "kakao");
                void signIn("kakao", { callbackUrl: "/" });
              }}
            >
              카카오로 계속하기
            </button>

            {/* 네이버 말풍선 */}
            {lastProvider === "naver" && <LoginTooltip text="지난번에 네이버로 로그인했어요" />}
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-[#FFFFFF] transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: "#03C75A" }}
              onClick={() => {
                localStorage.setItem("piyo-last-provider", "naver");
                void signIn("naver", { callbackUrl: "/" });
              }}
            >
              네이버로 계속하기
            </button>

            {/* 구글 말풍선 */}
            {lastProvider === "google" && <LoginTooltip text="지난번에 구글로 로그인했어요" />}
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-[#E0E0E0] bg-[#FFFFFF] text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-[#FAFAFA] active:bg-[#F5F5F5]"
              onClick={() => {
                localStorage.setItem("piyo-last-provider", "google");
                void signIn("google", { callbackUrl: "/" });
              }}
            >
              구글로 계속하기
            </button>
          </div>

          <Link
            href="/"
            className="mt-8 text-sm font-medium text-[#6b6960] underline decoration-[#F4CB4B] decoration-2 underline-offset-4 transition-colors hover:text-[#1a1a1a]"
          >
            비로그인으로 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}
