import type { HospitalDetailResponse } from "@/types/hospital-detail";

function normalizeBase(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

/**
 * FastAPI GET /hospital/{id}만 사용 (Piyo AI 서버 DataRegistry 병원 RAG 행).
 */
export async function fetchHospitalDetail(
  hospitalId: number,
  _beautyServiceId?: number
): Promise<HospitalDetailResponse> {
  if (!Number.isFinite(hospitalId) || hospitalId <= 0) {
    throw new Error("유효하지 않은 병원 ID입니다.");
  }

  const baseRaw =
    (process.env.PIYO_API_URL ?? "").trim() ||
    (process.env.NEXT_PUBLIC_PIYO_API_URL ?? "").trim() ||
    "http://localhost:8512";
  const baseUrl = normalizeBase(baseRaw);

  const res = await fetch(`${baseUrl}/hospital/${hospitalId}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      const err = new Error("NOT_FOUND");
      (err as Error & { code?: string }).code = "NOT_FOUND";
      throw err;
    }
    throw new Error("병원 정보를 불러올 수 없습니다.");
  }

  const json = (await res.json()) as {
    status?: string;
    data?: Record<string, unknown>;
  };
  const d = json.data;
  if (!d || typeof d !== "object") {
    throw new Error("병원 정보를 불러올 수 없습니다.");
  }

  const hid = d.hospital_id;
  const idNum = typeof hid === "number" ? hid : Number(hid);

  const serviceNames = Array.isArray(d.service_names)
    ? (d.service_names as string[])
    : [];

  const fullAddr =
    typeof d.full_address === "string" && d.full_address.trim()
      ? d.full_address.trim()
      : String(d.summary_address ?? "");

  return {
    id: Number.isFinite(idNum) ? idNum : hospitalId,
    name: String(d.name ?? ""),
    imageUrls: d.image_url ? [String(d.image_url)] : [],
    summaryAddress: String(d.summary_address ?? ""),
    fullAddress: fullAddr,
    latitude:
      d.latitude != null && Number.isFinite(Number(d.latitude))
        ? Number(d.latitude)
        : undefined,
    longitude:
      d.longitude != null && Number.isFinite(Number(d.longitude))
        ? Number(d.longitude)
        : undefined,
    phoneNumber: String(d.phone ?? d.phone_raw ?? ""),
    reservationUrl: String(d.booking_url ?? ""),
    reviewScore: parseFloat(String(d.review_score || "0")) || 0,
    reviewCount: parseInt(String(d.review_count || "0"), 10) || 0,
    reviewLink: d.review_link ? String(d.review_link) : undefined,
    beautyServices: serviceNames.map((name) => ({ name })),
    hasSpecialist: Boolean(d.has_specialist),
    isFactory: Boolean(d.is_factory),
  };
}
