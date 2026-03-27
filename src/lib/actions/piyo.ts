"use server";

/**
 * 클라이언트 컴포넌트(SurveyModal 등)에서 호출하는 서버 액션
 * PIYO_API_URL을 서버 측에서만 사용하기 위해 server action으로 분리
 */

import { upsertUser, saveSurvey } from "@/lib/api/user";

export async function upsertUserAction(
  piyo_user_id: string,
  provider: string,
  nickname: string | null
): Promise<void> {
  try {
    await upsertUser(piyo_user_id, provider, nickname);
  } catch (e) {
    console.error("[upsertUserAction] failed:", e);
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
  } catch (e) {
    console.error("[saveSurveyAction] failed:", e);
  }
}
