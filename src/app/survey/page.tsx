"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SurveyModal from "@/components/onboarding/SurveyModal";

/**
 * /survey 페이지
 * 미들웨어에서 설문 미완료 유저를 이 페이지로 리디렉션합니다.
 * 설문 완료 후 홈(/)으로 이동하며 piyo-survey-done 쿠키가 설정됩니다.
 */
export default function SurveyPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/");
  };

  return (
    <div
      className="min-h-dvh w-full relative"
      style={{
        background:
          "linear-gradient(160deg, #FFFBEF 0%, #FFF9F0 40%, #F0F7FF 100%)",
      }}
    >
      {/* 뒤로가기 버튼 */}
      <button
        type="button"
        onClick={() => router.back()}
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="h-5 w-5 text-[#1a1a1a]" />
      </button>

      <SurveyModal
        onComplete={handleComplete}
        onSkip={handleComplete}
        onClose={handleComplete}
      />
    </div>
  );
}
