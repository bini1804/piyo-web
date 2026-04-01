"use client";
import type React from "react";
import Link from "next/link";
import { resolveRdsMediaUrl } from "@/lib/media-url";
import { HospitalInfo } from "@/types/index";
import { cn } from "@/lib/utils";

interface HospitalCardProps {
  hospital: HospitalInfo;
  procedureName?: string;
  /** 앱 HospitalCard compact: 첫 카드 강조 테두리 */
  isFirst?: boolean;
}

type BookingType = "naver" | "kakao" | "default";

function getBookingType(url: string): BookingType {
  if (!url) return "default";
  if (
    url.includes("booking.naver.com") ||
    url.includes("map.naver.com") ||
    url.includes("naver.com")
  )
    return "naver";
  if (url.includes("kakao.com")) return "kakao";
  return "default";
}

function BookingButton({ url }: { url: string }) {
  const type = getBookingType(url);

  const styles: Record<
    BookingType,
    {
      bg: string;
      color: string;
      border?: string;
      label: string;
      icon: React.ReactNode;
    }
  > = {
    naver: {
      bg: "#03C75A",
      color: "#FFFFFF",
      label: "네이버 예약",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
        </svg>
      ),
    },
    kakao: {
      bg: "#FEE500",
      color: "#191919",
      label: "카카오 예약",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.67 1.634 5.007 4.108 6.42L5.1 21l4.707-3.142A12.1 12.1 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
        </svg>
      ),
    },
    default: {
      bg: "var(--brand)",
      color: "#1a1a1a",
      label: "예약하기",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  };

  const s = styles[type];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        flex: 1.4,
        minHeight: "44px",
        background: s.bg,
        border: s.border || "none",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        fontSize: "13px",
        fontWeight: 700,
        color: s.color,
        textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
      }}
    >
      {s.icon}
      <span>{s.label}</span>
    </a>
  );
}

/**
 * 앱 `features/hospital/ui/hospital-card.tsx` variant=compact 1:1
 * + 예약/전화 CTA (웹)
 */
export function HospitalCard({
  hospital,
  procedureName: _procedureName,
  isFirst = false,
}: HospitalCardProps) {
  void _procedureName;
  const hasBooking = Boolean(hospital.booking_url?.trim());
  const hasPhone = Boolean(hospital.phone?.trim());
  const rating = parseFloat(String(hospital.review_score || "0")) || 0;
  const reviewCount = parseInt(String(hospital.review_count || "0"), 10) || 0;
  const hasDist =
    hospital.distance_km !== null && hospital.distance_km !== undefined;

  const distLabel = hasDist
    ? hospital.distance_km! < 1
      ? `${Math.round(hospital.distance_km! * 1000)}m`
      : `${hospital.distance_km!.toFixed(1)}km`
    : null;

  const initial = (hospital.name || "?").slice(0, 1);
  const imgSrc = resolveRdsMediaUrl(hospital.image_url);
  const hid = hospital.hospital_id;
  const detailHref =
    hid != null && Number.isFinite(hid) && hid > 0 ? `/hospital/${hid}` : null;

  const cardBody = (
    <div
      className={cn(
        "flex w-full gap-[6px] rounded-[var(--radius-sm)] border bg-white px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
      )}
      style={{
        borderColor: isFirst ? "var(--brand-dark)" : "#f3f4f6",
        boxShadow: "none",
      }}
    >
        <div className="relative size-[70px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-gray-100 bg-gray-50">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={hospital.name}
              className="size-full object-cover"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center text-xl font-bold"
              style={{
                background: "var(--brand-light)",
                color: "var(--brand-dark)",
              }}
              aria-hidden
            >
              {initial}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4
              className="line-clamp-2 min-w-0 flex-1 font-medium leading-5 text-neutral-700"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#404040",
              }}
            >
              {hospital.name || "병원명 없음"}
            </h4>
            {rating > 0 && (
              <div className="flex shrink-0 items-center gap-1">
                <span aria-hidden className="text-[#FFCC02]">
                  ★
                </span>
                <span
                  className="text-[14px] font-semibold text-neutral-700"
                  style={{ fontWeight: 600 }}
                >
                  {rating.toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span
                    className="text-[14px] font-normal text-neutral-400"
                    style={{ fontWeight: 400, color: "#a3a3a3" }}
                  >
                    {reviewCount}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-1">
              <span className="shrink-0 text-neutral-500" aria-hidden>
                📍
              </span>
              <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[12px] leading-[18px] text-neutral-500">
                {hospital.summary_address ? (
                  <span className="shrink-0">{hospital.summary_address}</span>
                ) : null}
                {distLabel && hospital.summary_address ? (
                  <div className="h-2 w-px shrink-0 bg-neutral-300" />
                ) : null}
                {distLabel ? (
                  <span className="min-w-0 truncate">{distLabel}</span>
                ) : null}
              </div>
            </div>
            {hospital.hours ? (
              <div className="flex min-w-0 items-center gap-1 text-[12px] leading-[18px] text-neutral-500">
                <span className="shrink-0 text-neutral-500" aria-hidden>
                  🕐
                </span>
                <span className="truncate">평일 {hospital.hours}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
  );

  return (
    <div className="flex w-full flex-col gap-2">
      {detailHref ? (
        <Link
          href={detailHref}
          className="block w-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
        >
          {cardBody}
        </Link>
      ) : (
        cardBody
      )}

      {(hasBooking || hasPhone) && (
        <div className="flex w-full gap-1.5" style={{ minHeight: 44 }}>
          {hasBooking && <BookingButton url={hospital.booking_url} />}
          {hasPhone && (
            <a
              href={`tel:${hospital.phone}`}
              style={{
                flex: 1,
                minHeight: "44px",
                background: "var(--bg-main)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>전화</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
