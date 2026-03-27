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
  hospital_cards?: HospitalCard[];
  score?: Record<string, number>;
  status?: "RECOMMENDED" | "NO_RECOMMENDED";
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
    score: Record<string, number>;
    hospital_cards: HospitalCard;
    "원인_설명": string;
    status: "RECOMMENDED" | "NO_RECOMMENDED";
    qa_cards: unknown[];
  };
  "GPT 요약답변": string;
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
}

export interface ProductDetail {
  key: string;
  name: string;
  type: string;
  category: string;
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
