import { resolveRdsMediaUrl } from "@/lib/media-url";
import type { HospitalInfo } from "@/types";
import type { AppHospitalCardData } from "./AppHospitalCard";

export function hospitalInfoToAppCardData(
  h: HospitalInfo,
  procedureName?: string
): AppHospitalCardData {
  const rating = parseFloat(String(h.review_score || "0")) || 0;
  const reviewCount = parseInt(String(h.review_count || "0"), 10) || 0;
  const dk = h.distance_km;
  const distance =
    dk !== null && dk !== undefined
      ? dk < 1
        ? `${Math.round(dk * 1000)}m`
        : `${dk.toFixed(1)}km`
      : "";

  const hours = (h.hours ?? "").trim();
  /** API에 이미 "평일 …" 형태로 올 수 있음 — 중복 접두사 방지 */
  const businessHours = /^평일\s+/u.test(hours)
    ? hours.replace(/^평일\s+/u, "")
    : hours;

  return {
    id: h.hospital_id ?? 0,
    name: h.name,
    thumbnail: resolveRdsMediaUrl(h.image_url) || undefined,
    isSpecialist: h.has_specialist,
    rating,
    reviewCount,
    treatments: procedureName ? [procedureName] : undefined,
    location: h.summary_address || "",
    distance,
    businessHours,
  };
}
