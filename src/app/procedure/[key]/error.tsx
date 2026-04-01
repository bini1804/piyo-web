"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProcedureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.error("[procedure detail]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-4">
      <p className="text-center text-[#666] font-medium">
        정보를 불러올 수 없어요
      </p>
      <p className="text-center text-sm text-[#999] max-w-sm">
        {error.message || "네트워크·서버 연결을 확인하고 다시 시도해주세요."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="text-[#F4CB4B] font-semibold text-sm"
      >
        다시 시도
      </button>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="text-neutral-500 text-sm"
      >
        ← 처음으로
      </button>
    </div>
  );
}
