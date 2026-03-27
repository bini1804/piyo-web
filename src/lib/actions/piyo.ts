"use server";

/**
 * 클라이언트 컴포넌트(SurveyModal 등)에서 호출하는 서버 액션
 * PIYO_API_URL을 서버 측에서만 사용하기 위해 server action으로 분리
 */

import { cookies } from "next/headers";
import { upsertUser, saveSurvey, getUserProfile, checkSurvey } from "@/lib/api/user";

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

export async function saveSurveyAction(
  piyo_user_id: string,
  surveyData: {
    skin_type: string;
    skin_intensity?: number;
    skin_sensitivity?: number;
    concerns: string[];
  }
): Promise<void> {
  try {
    await saveSurvey(piyo_user_id, surveyData);
    await setSurveyDoneCookie();
  } catch (e) {
    console.error("[saveSurveyAction] failed:", e);
  }
}
