"use client";
import type React from "react";
import { HospitalInfo } from "@/types/index";

interface HospitalCardProps {
  hospital: HospitalInfo;
  procedureName?: string;
}

// ── 예약 버튼 헬퍼 ──────────────────────────────────────────

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
      bg: "#03C75A", // 네이버 공식 그린
      color: "#FFFFFF",
      label: "네이버 예약",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
        </svg>
      ),
    },
    kakao: {
      bg: "#FEE500", // 카카오 공식 옐로우
      color: "#000000",
      label: "카카오 예약",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.67 1.634 5.007 4.108 6.42L5.1 21l4.707-3.142A12.1 12.1 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
        </svg>
      ),
    },
    default: {
      bg: "var(--brand)",
      color: "var(--text-primary)",
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

// ── 메인 컴포넌트 ────────────────────────────────────────────

export function HospitalCard({
  hospital,
  procedureName: _procedureName,
}: HospitalCardProps) {
  const hasBooking = Boolean(hospital.booking_url?.trim());
  const hasPhone = Boolean(hospital.phone?.trim());
  const hasReview = Boolean(hospital.review_score);
  const hasDist =
    hospital.distance_km !== null && hospital.distance_km !== undefined;

  const distLabel = hasDist
    ? hospital.distance_km! < 1
      ? `${Math.round(hospital.distance_km! * 1000)}m`
      : `${hospital.distance_km!.toFixed(1)}km`
    : null;

  return (
    <div
      style={{
        width: "240px",
        flexShrink: 0,
        background: "var(--bg-main)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "14px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid var(--brand)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--shadow-sm)";
      }}
    >
      {/* 상단: 병원명 + 전문의 뱃지 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {hospital.name || "병원명 없음"}
        </span>
        {hospital.has_specialist && (
          <span
            style={{
              flexShrink: 0,
              background: "var(--brand-light)",
              border: "1px solid var(--brand)",
              borderRadius: "var(--radius-sm)",
              padding: "2px 7px",
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--brand-dark)",
              whiteSpace: "nowrap",
              lineHeight: 1.6,
            }}
          >
            전문의
          </span>
        )}
      </div>

      {/* 주소 */}
      {hospital.summary_address && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "flex-start",
            gap: "3px",
            lineHeight: 1.4,
          }}
        >
          <span style={{ flexShrink: 0 }}>📍</span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {hospital.summary_address}
          </span>
        </div>
      )}

      {/* 메타 정보: 별점 + 거리 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "12px",
          color: "var(--text-secondary)",
        }}
      >
        {hasReview && (
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <span>⭐</span>
            <span style={{ fontWeight: 600 }}>{hospital.review_score}</span>
            {hospital.review_count && (
              <span style={{ color: "var(--text-muted)" }}>
                ({hospital.review_count})
              </span>
            )}
          </span>
        )}
        {distLabel && (
          <span style={{ color: "var(--text-muted)" }}>🗺 {distLabel}</span>
        )}
      </div>

      {/* 진료시간 */}
      {hospital.hours && (
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <span>🕐</span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {hospital.hours}
          </span>
        </div>
      )}

      {/* CTA 버튼 영역 */}
      {(hasBooking || hasPhone) && (
        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
          {/* 예약 버튼 — URL 패턴별 분기 */}
          {hasBooking && <BookingButton url={hospital.booking_url} />}

          {/* 전화 버튼 — 번호 숨기고 아이콘+라벨만 */}
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
                userSelect: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "var(--bg-main)";
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
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79-19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>전화</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
