"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HospitalDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string; code?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const isNotFound =
    error.message.includes("찾을 수 없") || error.code === "NOT_FOUND";

  useEffect(() => {
    console.error("[hospital detail]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-4">
      <p className="text-center font-medium text-[#666]">
        {isNotFound
          ? "병원 정보를 찾을 수 없습니다."
          : "병원 정보를 불러오는데 실패했습니다."}
      </p>
      <p className="max-w-sm text-center text-sm text-[#999]">
        {isNotFound
          ? "요청하신 병원이 없거나 삭제되었습니다."
          : error.message ||
            "네트워크·서버 연결을 확인하고 다시 시도해주세요."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="text-sm font-semibold text-[#F4CB4B]"
      >
        다시 시도
      </button>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="text-sm text-neutral-500"
      >
        ← 처음으로
      </button>
    </div>
  );
}
