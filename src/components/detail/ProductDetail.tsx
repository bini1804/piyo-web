"use client";

import type { ProductDetail as ProductDetailType } from "@/types";
import {
  ArrowLeft,
  Clock,
  RefreshCw,
  Sparkles,
  Activity,
  HeartPulse,
  Wind,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function typeBadgeClass(type: string): { bg: string; text: string; label: string } {
  const t = (type || "").toLowerCase();
  if (t.includes("시술")) {
    return { bg: "bg-[#F0F0F0]", text: "text-[#666]", label: "시술" };
  }
  if (t.includes("홈") || t.includes("home")) {
    return { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", label: "홈케어" };
  }
  return { bg: "bg-[#FDF6DC]", text: "text-[#E6B800]", label: "화장품" };
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

function SectionDivider() {
  return <hr className="border-0 border-t border-[#EEEEEE] my-6" />;
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-dvh bg-[#FFFFFF] animate-pulse">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="h-10 w-24 bg-[#F0F0F0] rounded-lg mb-6" />
        <div className="h-6 w-20 bg-[#FDF6DC] rounded-md mb-4" />
        <div className="h-8 w-3/4 bg-[#F0F0F0] rounded mb-2" />
        <div className="h-4 w-32 bg-[#F5F5F5] rounded mb-4" />
        <div className="h-7 w-40 bg-[#FFF8E1] rounded mb-8" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-[#F5F5F5] rounded" />
          <div className="h-4 w-full bg-[#F5F5F5] rounded" />
          <div className="h-4 w-2/3 bg-[#F5F5F5] rounded" />
        </div>
      </div>
    </div>
  );
}

interface ProductDetailProps {
  data: ProductDetailType;
  /** 히스토리 없을 때 router.push 용 (선택) */
  backPath?: string;
}

export default function ProductDetail({ data, backPath = "/" }: ProductDetailProps) {
  const router = useRouter();
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const badge = useMemo(() => typeBadgeClass(data.type), [data.type]);

  const isProcedure = (data.type || "").includes("시술");

  const procedureRows = useMemo(() => {
    const rows: Array<{
      icon: ReactNode;
      label: string;
      value: string;
    }> = [];
    const push = (icon: ReactNode, label: string, value?: string) => {
      const v = (value ?? "").toString().trim();
      if (v) rows.push({ icon, label, value: v });
    };
    push(<Clock className="w-5 h-5 text-[#999]" aria-hidden />, "시술 시간", data.duration_time);
    push(<RefreshCw className="w-5 h-5 text-[#999]" aria-hidden />, "권장 주기", data.cycle_frequency);
    push(<Sparkles className="w-5 h-5 text-[#999]" aria-hidden />, "효과 지속", data.effect_duration);
    push(<Activity className="w-5 h-5 text-[#999]" aria-hidden />, "통증 단계", data.pain_level);
    push(<HeartPulse className="w-5 h-5 text-[#999]" aria-hidden />, "회복 기간", data.recovery_period);
    push(<Wind className="w-5 h-5 text-[#999]" aria-hidden />, "마취 여부", data.anesthesia);
    return rows;
  }, [data]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backPath);
    }
  };

  const ingredients = (data.full_ingredients || "").trim();
  const showIngredientsToggle = ingredients.length > 80;

  return (
    <div className="min-h-dvh bg-[#FFFFFF]">
      <div
        className={cn(
          "max-w-2xl mx-auto w-full px-4 pt-4",
          data.link?.trim() ? "pb-28" : "pb-8"
        )}
      >
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-[#1a1a1a] font-medium mb-6 tap-highlight-transparent"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden />
          돌아가기
        </button>

        <span
          className={cn(
            "inline-block text-xs font-semibold px-2.5 py-1 rounded-md mb-3",
            badge.bg,
            badge.text
          )}
        >
          {badge.label}
        </span>

        <h1 className="text-2xl font-bold text-[#1a1a1a] leading-tight">{data.name}</h1>

        {data.brand?.trim() ? (
          <p className="text-sm text-[#999] mt-1">{data.brand}</p>
        ) : null}

        {typeof data.price === "number" && data.price > 0 ? (
          <p className="text-xl font-semibold text-[#F4CB4B] mt-3">{formatPrice(data.price)}</p>
        ) : null}

        <SectionDivider />

        {data.description?.trim() ? (
          <section>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-2">제품 설명</h2>
            <p className="text-[15px] leading-relaxed text-[#444] whitespace-pre-wrap">
              {data.description}
            </p>
            <SectionDivider />
          </section>
        ) : null}

        {data.guide?.trim() ? (
          <section>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-2">사용법</h2>
            <p className="text-[15px] leading-relaxed text-[#444] whitespace-pre-wrap">{data.guide}</p>
            <SectionDivider />
          </section>
        ) : null}

        {data.caution?.trim() ? (
          <section>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-2">주의사항</h2>
            <p className="text-[15px] leading-relaxed text-[#444] whitespace-pre-wrap">{data.caution}</p>
            <SectionDivider />
          </section>
        ) : null}

        {ingredients ? (
          <section>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-2">전성분</h2>
            <div
              className={cn(
                "text-[15px] leading-relaxed text-[#444] break-words",
                !ingredientsOpen && showIngredientsToggle && "line-clamp-3"
              )}
            >
              {ingredients}
            </div>
            {showIngredientsToggle ? (
              <button
                type="button"
                onClick={() => setIngredientsOpen((v) => !v)}
                className="mt-2 text-sm font-semibold text-[#E6B800]"
              >
                {ingredientsOpen ? "접기 ↑" : "전체 보기 ↓"}
              </button>
            ) : null}
            <SectionDivider />
          </section>
        ) : null}

        {isProcedure && procedureRows.length > 0 ? (
          <section>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-4">시술 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              {procedureRows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 rounded-xl border border-[#F0F0F0] p-3 bg-[#FAFAFA]"
                >
                  <div className="flex items-center gap-2 text-[#999]">
                    {row.icon}
                    <span className="text-xs font-medium">{row.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#1a1a1a] pl-7">{row.value}</p>
                </div>
              ))}
            </div>
            <SectionDivider />
          </section>
        ) : null}

        {data.link?.trim() ? (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FFFFFF] border-t border-[#F0F0F0] max-w-2xl mx-auto w-full">
            <a
              href={data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full h-14 rounded-2xl font-bold bg-[#F4CB4B] text-black"
            >
              구매하러 가기
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProductDetailError({ backPath = "/" }: { backPath?: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4 bg-[#FFFFFF] px-4">
      <p className="text-[#999]">정보를 불러올 수 없어요</p>
      <button
        type="button"
        onClick={() => router.push(backPath)}
        className="text-[#F4CB4B] font-semibold"
      >
        ← 돌아가기
      </button>
    </div>
  );
}
