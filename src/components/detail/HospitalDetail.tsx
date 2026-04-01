"use client";

import { resolveRdsMediaUrl } from "@/lib/media-url";
import {
  getAllDaySchedules,
  getBusinessStatus,
} from "@/lib/hospital/business-hours";
import { cn } from "@/lib/utils";
import type { HospitalDetailResponse } from "@/types/hospital-detail";
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  ExternalLink,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type BookingTone = "naver" | "kakao" | "default";

function bookingTone(url: string | undefined | null): BookingTone {
  const u = (url ?? "").toLowerCase();
  if (u.includes("naver")) return "naver";
  if (u.includes("kakao")) return "kakao";
  return "default";
}

function collectProcedureNames(h: HospitalDetailResponse): string[] {
  const fromGroups =
    h.groupByCategory?.flatMap(
      (g) => g.beautyServices?.map((s) => s.name).filter(Boolean) as string[]
    ) ?? [];
  const flat = h.beautyServices?.map((s) => s.name).filter(Boolean) as string[];
  return [...new Set([...fromGroups, ...flat].filter(Boolean))];
}

export function HospitalDetailSkeleton() {
  return (
    <div className="min-h-dvh animate-pulse bg-white">
      <div className="h-[240px] bg-neutral-100" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-2/3 rounded bg-neutral-100" />
        <div className="h-4 w-full rounded bg-neutral-100" />
        <div className="h-4 w-5/6 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

export default function HospitalDetail({
  data,
}: {
  data: HospitalDetailResponse;
}) {
  const router = useRouter();
  const [hoursOpen, setHoursOpen] = useState(false);
  const hid = data.id ?? 0;

  const images = useMemo(
    () =>
      (data.imageUrls ?? [])
        .map((u) => resolveRdsMediaUrl(u))
        .filter(Boolean) as string[],
    [data.imageUrls]
  );

  const procedures = useMemo(() => collectProcedureNames(data), [data]);
  const businessStatus = getBusinessStatus(data.businessTimes);
  const schedules = getAllDaySchedules(data.businessTimes);
  const tone = bookingTone(data.reservationUrl);

  const mapHref = data.fullAddress?.trim()
    ? `https://map.naver.com/v5/search/${encodeURIComponent(data.fullAddress.trim())}`
    : null;

  const reviewHref = data.reviewLink?.trim() ? data.reviewLink.trim() : null;

  const handleReserve = () => {
    const url = data.reservationUrl?.trim();
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePhone = () => {
    const p = data.phoneNumber?.trim();
    if (!p) return;
    window.location.href = `tel:${p}`;
  };

  const reserveLabel =
    tone === "naver"
      ? "네이버 예약"
      : tone === "kakao"
        ? "카카오톡 예약"
        : "예약하기";

  const reserveClass =
    tone === "naver"
      ? "bg-[#03C75A] text-white"
      : tone === "kakao"
        ? "bg-[#FEE500] text-[#191919]"
        : "bg-[var(--brand)] text-[#1a1a1a]";

  return (
    <div className="min-h-dvh bg-white pb-28">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-[#f0f0f0] bg-white/95 px-3 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-neutral-50"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-700" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-neutral-900">
          {data.name ?? "병원 상세"}
        </h1>
      </header>

      <div className="relative h-[240px] w-full bg-neutral-50">
        {images.length > 0 ? (
          <div className="flex h-full w-full gap-0 overflow-x-auto scroll-smooth snap-x snap-mandatory">
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative h-full w-full min-w-full shrink-0 snap-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full bg-neutral-100 object-contain"
                  decoding={i === 0 ? "sync" : "async"}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            이미지 없음
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-neutral-900">
            {data.name ?? ""}
          </h2>
          {(data.reviewScore ?? 0) > 0 && (
            <div className="flex shrink-0 items-center gap-1">
              <Star
                className="h-4 w-4 fill-[#FFCC02] text-[#FFCC02]"
                aria-hidden
              />
              <span className="text-sm font-semibold text-neutral-700">
                {(data.reviewScore as number).toFixed(1)}
              </span>
              {data.reviewCount != null && (
                <span className="text-sm text-neutral-400">
                  {data.reviewCount}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-neutral-700">
            {data.district ? (
              <>
                <span className="shrink-0">{data.district}</span>
                {data.summaryAddress ? (
                  <div className="h-2.5 w-px shrink-0 bg-neutral-400" />
                ) : null}
              </>
            ) : null}
            <span className="break-words">{data.summaryAddress}</span>
          </div>
        </div>

        {data.businessTimes ? (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setHoursOpen((o) => !o)}
              className="flex items-center gap-2 text-left"
            >
              <Clock className="h-4 w-4 shrink-0 text-neutral-500" />
              <span
                className="text-sm text-neutral-700"
                dangerouslySetInnerHTML={{ __html: businessStatus.message }}
              />
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-neutral-400 transition-transform",
                  hoursOpen && "rotate-180"
                )}
              />
            </button>
            {hoursOpen && (
              <div className="flex flex-col gap-0.5 pl-6">
                {schedules.map(({ day, schedule, isToday, isClosed }) => (
                  <div key={day} className="flex gap-2 text-sm">
                    <span
                      className={cn(
                        "w-4 text-right",
                        isToday && "font-semibold",
                        isClosed ? "text-red-400" : "text-neutral-700"
                      )}
                    >
                      {day}
                    </span>
                    <span
                      className={cn(
                        "text-neutral-700",
                        isToday && "font-medium"
                      )}
                    >
                      {schedule}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {data.description?.trim() ? (
          <div className="rounded-lg bg-neutral-50 px-3 py-3">
            <p className="text-xs font-semibold text-neutral-700">간단 소개</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-500">
              &quot;{data.description.trim()}&quot;
            </p>
          </div>
        ) : null}

        {procedures.length > 0 ? (
          <div>
            <h3 className="mb-2 text-[15px] font-semibold text-neutral-900">
              시술 · 케어
            </h3>
            <div className="flex flex-wrap gap-2">
              {procedures.slice(0, 40).map((name) => (
                <span
                  key={name}
                  className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {mapHref ? (
          <Link
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#03C75A]"
          >
            지도에서 보기
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}

        {reviewHref ? (
          <a
            href={reviewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-[#FFF8F0] px-4 py-4 transition-opacity hover:opacity-90"
          >
            <div>
              <p className="text-sm text-neutral-900">방문 고객들의 실제 후기</p>
              {(data.reviewScore ?? 0) > 0 && (
                <p className="mt-1 text-base font-bold text-neutral-900">
                  평점 {(data.reviewScore as number).toFixed(1)}
                </p>
              )}
              <p className="mt-1 text-xs font-medium text-[#FF8502]">
                {(data.reviewCount ?? 0) > 0
                  ? `${data.reviewCount}개 리뷰 보러가기 →`
                  : "후기 보러가기 →"}
              </p>
            </div>
          </a>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 border-t border-[#eee] bg-white px-3 py-3 safe-area-pb">
        {data.phoneNumber?.trim() ? (
          <button
            type="button"
            onClick={handlePhone}
            className="flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-secondary)]"
          >
            전화
          </button>
        ) : null}
        {data.reservationUrl?.trim() ? (
          <button
            type="button"
            onClick={handleReserve}
            className={cn(
              "flex min-h-[48px] min-w-0 flex-[1.4] items-center justify-center gap-2 rounded-[var(--radius-sm)] text-sm font-bold",
              reserveClass
            )}
          >
            {reserveLabel}
          </button>
        ) : null}
      </div>

      {hid > 0 ? <span hidden data-hospital-id={hid} /> : null}
    </div>
  );
}
