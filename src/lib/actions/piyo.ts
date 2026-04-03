"use server";

/**
 * 클라이언트 컴포넌트(SurveyModal 등)에서 호출하는 서버 액션
 * PIYO_API_URL을 서버 측에서만 사용하기 위해 server action으로 분리
 */

import { cookies } from "next/headers";
import { upsertUser, saveSurvey, getUserProfile, checkSurvey, getSurveyData } from "@/lib/api/user";
import {
  saveChatSession,
  getChatSessions,
  deleteChatSession,
  type ChatSessionItem,
} from "@/lib/api/user";

const SURVEY_DONE_COOKIE = "piyo-survey-done";

async function setSurveyDoneCookie(): Promise<void> {
  const store = await cookies();
  store.set(SURVEY_DONE_COOKIE, "1", {
    maxAge: 60 * 60 * 24,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
}

export async function upsertUserAction(
  piyo_user_id: string,
  provider: string,
  nickname: string | null,
  email?: string | null
): Promise<void> {
  try {
    await upsertUser(piyo_user_id, provider, nickname, email);
  } catch (e) {
    console.error("[upsertUserAction] failed:", e);
  }
}

export async function getUserProfileAction(
  piyo_user_id: string
): Promise<{ nickname: string | null; provider: string | null }> {
  try {
    const row = await getUserProfile(piyo_user_id);
    return { nickname: row.nickname, provider: row.provider };
  } catch (e) {
    console.error("[getUserProfileAction] failed:", e);
    return { nickname: null, provider: null };
  }
}

/** 로그인 유저 설문 완료 여부 — RDS 기준으로 Zustand와 UI 동기화 */
export async function fetchSurveyCompletedFromServerAction(
  piyo_user_id: string
): Promise<boolean> {
  try {
    return await checkSurvey(piyo_user_id);
  } catch {
    return false;
  }
}

export async function getSurveyDataAction(piyo_user_id: string): Promise<{
  skin_type: string | null;
  skin_intensity: number | null;
  skin_sensitivity: number | null;
  concerns: string[];
  gender: string | null;
  age: number | null;
  is_pregnant: boolean | null;
} | null> {
  try {
    return await getSurveyData(piyo_user_id);
  } catch {
    return null;
  }
}

export async function saveSurveyAction(
  piyo_user_id: string,
  surveyData: {
    skin_type: string;
    skin_intensity?: number;
    skin_sensitivity?: number;
    concerns: string[];
    gender?: string;
    age?: number;
    is_pregnant?: boolean;
  }
): Promise<void> {
  try {
    await saveSurvey(piyo_user_id, surveyData);
    await setSurveyDoneCookie();
  } catch (e) {
    console.error("[saveSurveyAction] failed:", e);
  }
}

// ── 채팅 세션 서버 액션 ──────────────────────────────

export async function saveChatSessionAction(params: {
  piyo_user_id: string;
  session_id: string;
  title: string | null;
  messages: unknown[];
  has_feedback: boolean;
}): Promise<void> {
  try {
    await saveChatSession(params);
  } catch (e) {
    console.error("[saveChatSessionAction] failed:", e);
  }
}

export async function getChatSessionsAction(
  piyo_user_id: string
): Promise<ChatSessionItem[]> {
  try {
    return await getChatSessions(piyo_user_id);
  } catch (e) {
    console.error("[getChatSessionsAction] failed:", e);
    return [];
  }
}

export async function deleteChatSessionAction(
  piyo_user_id: string,
  session_id: string
): Promise<void> {
  try {
    await deleteChatSession(piyo_user_id, session_id);
  } catch (e) {
    console.error("[deleteChatSessionAction] failed:", e);
  }
}
