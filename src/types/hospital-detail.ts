/** Spring `HospitalResponse` — 앱 Orval 타입과 동일 필드 (병원 상세) */

export interface HospitalDetailBeautyService {
  id?: number;
  name?: string;
  description?: string;
  isTop1?: boolean;
  isTop3?: boolean;
}

export interface HospitalDetailGroupByCategory {
  id?: number;
  name?: string;
  beautyServices?: HospitalDetailBeautyService[];
}

export type HospitalBusinessTimesDto = Record<string, unknown>;

export interface HospitalDetailResponse {
  id?: number;
  imageUrls?: string[];
  name?: string;
  /** FastAPI RAG 플래그 (전문의 여부) */
  hasSpecialist?: boolean;
  /** FastAPI RAG 플래그 (팩토리형 여부) */
  isFactory?: boolean;
  description?: string;
  summaryAddress?: string;
  fullAddress?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  businessTimes?: HospitalBusinessTimesDto;
  reviewScore?: number;
  reviewCount?: number;
  reviewLink?: string;
  phoneNumber?: string;
  reservationUrl?: string;
  beautyServices?: HospitalDetailBeautyService[];
  groupByCategory?: HospitalDetailGroupByCategory[];
}
