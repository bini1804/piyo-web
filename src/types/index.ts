// ===========================================
// Piyo Web — Core Type Definitions
// ===========================================

// ----- User & Auth -----
export interface User {
  id: string; // NextAuth user ID (UUID string)
  email?: string;
  name?: string;
  avatar_url?: string;
  provider?: "kakao" | "google" | "naver" | "apple";
  created_at: string;
  updated_at: string;
}

// ----- Survey -----
export type Gender = "male" | "female";
export type SkinType = "oily" | "dry" | "combination" | "sensitive" | "normal";

export interface SurveyData {
  nickname?: string;         // 별명 (선택, step 0)
  age: number;
  gender: Gender;
  skin_type: SkinType;
  concerns: string[];
  skin_sensitivity?: number; // 1~5
  skin_intensity?: number;   // 1~5
  is_pregnant?: boolean;
}

// ----- Chat (로컬 세션 히스토리) -----
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: ChatResponseMetadata;
  created_at: string;
}

export interface ChatResponseMetadata {
  recommended_products?: RecommendedProduct[];
  recommended_procedures?: RecommendedProduct[];
  hospital_cards?: HospitalCards;
  /** 백엔드 score는 보통 { 제품명: { key } } — 표시용이면 생략 가능 */
  score?: Record<string, unknown>;
  status?: "RECOMMENDED" | "NO_RECOMMENDED";
  show_procedure_cards?: boolean;
  show_product_cards?: boolean;
  show_hospital_cards?: boolean;
  /** 피드백 연결용 DB row ID */
  chat_log_id?: string;
  /** 인텐트 분류 결과 — 피드백 노출 조건 판단용 */
  intent?: "SOLUTION" | "QA" | "HOSPITAL" | "SMALLTALK" | "FALLBACK";
}

// ----- Piyo API -----
export interface PiyoChatRequest {
  user_id: string;
  query: string;
  session_id?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  age: number;
  gender: string;
  skin_type: string;
  concerns: string[];
  skin_sensitivity?: number;
  skin_intensity?: number;
  latitude?: number;
  longitude?: number;
  is_pregnant?: boolean;
  use_memory?: boolean;
}

export interface PiyoChatResponse {
  "GPT 답변": {
    recommended_products: RecommendedProduct[];
    score: Record<string, unknown>;
    hospital_cards: HospitalCards;
    "원인_설명": string;
    status: "RECOMMENDED" | "NO_RECOMMENDED";
    qa_cards: unknown[];
    show_procedure_cards?: boolean;
    show_product_cards?: boolean;
    show_hospital_cards?: boolean;
    intent?: string;
  };
  "GPT 요약답변": string;
  chat_log_id?: string | number;
}

// ----- Cards -----
export interface RecommendedProduct {
  recommendation: string;
  type: string;
  /** 없으면 상세 페이지 미연결(준비 중) */
  key?: string;
  category: string;
  concern?: string;
  reason?: string;
  /** 시술 등급(S/A/B 등, 백엔드만 전달 가능) */
  grade?: string;
  image_url?: string;
  /** RDS DataRegistry 해시태그를 ・ 로 이은 문자열 (앱 description 줄) */
  hashtags?: string | null;
  /** 원 단위 정수 (presenter가 COSM/PROC에서 채움) */
  price?: number | string | null;
  /** 예: 시술 "(평균가)" */
  price_info?: string | null;
  /** 시술 prefix 등(앱 priceUnit) */
  price_unit?: string | null;
}

export interface ProductDetail {
  key: string;
  name: string;
  type: string;
  category: string;
  /** 시술 등급(상세 API data.grade) */
  grade?: string;
  price?: number;
  brand?: string;
  description?: string;
  guide?: string;
  link?: string;
  full_ingredients?: string;
  caution?: string;
  duration_time?: string;
  cycle_frequency?: string;
  effect_duration?: string;
  pain_level?: string;
  recovery_period?: string;
  anesthesia?: string;
  like_count?: number;
  ai_view_count?: number;
}

// 병원 단일 항목
export interface HospitalInfo {
  hospital_id: number | null;
  name: string;
  summary_address: string;
  phone: string;        // tel: 링크용 정규화 번호
  phone_raw: string;    // 화면 표시용 원본
  booking_url: string;
  review_score: string; // "4.5"
  review_count: string; // "32"
  review_link: string;
  has_specialist: boolean;
  is_factory: boolean;
  distance_km: number | null;
  hours: string;
  image_url?: string;
}

// 백엔드 실제 구조: { 시술명: HospitalInfo[] }
export type HospitalCards = Record<string, HospitalInfo[]>;

// [DEPRECATED] 기존 HospitalCard 타입 — 하위 호환 유지
export interface HospitalCard {
  hospital_name: string;
  address?: string;
  specialties?: string[];
  rating?: number;
  review_count?: number;
  distance_km?: number;
  image_url?: string;
}

// ----- Consent -----
export interface ConsentRecord {
  id: string;
  anonymous_id?: string;
  user_id?: string;
  privacy_agreed: boolean;
  data_collection_agreed: boolean;
  agreed_at: string;
}

// ----- i18n -----
export type Locale = "ko" | "en";
