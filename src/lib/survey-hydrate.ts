import {
  getUserProfileAction,
  getSurveyDataAction,
} from "@/lib/actions/piyo";
import { useSurveyStore } from "@/stores";
import type { Gender, SkinType } from "@/types";

/**
 * RDS 프로필 + 설문을 Zustand에 반영.
 * @param markCompletedIfSurvey true면 설문 행이 있을 때 isCompleted true (첫 로드용).
 *   설문 수정 진입 시에는 false로 두어 MyPage에서 내린 completed=false를 유지.
 */
export async function pullPiyoSurveyIntoStore(
  piyoUserId: string,
  options: { markCompletedIfSurvey: boolean }
): Promise<void> {
  const { markCompletedIfSurvey } = options;
  const [profile, surveyResult] = await Promise.all([
    getUserProfileAction(piyoUserId),
    getSurveyDataAction(piyoUserId),
  ]);
  const { setField, setCompleted } = useSurveyStore.getState();

  if (profile.nickname?.trim()) {
    setField("nickname", profile.nickname.trim());
  }
  if (!surveyResult) return;

  if (surveyResult.skin_type) {
    setField("skin_type", surveyResult.skin_type as SkinType);
  }
  if (surveyResult.skin_intensity != null) {
    setField("skin_intensity", surveyResult.skin_intensity);
  }
  if (surveyResult.skin_sensitivity != null) {
    setField("skin_sensitivity", surveyResult.skin_sensitivity);
  }
  if (surveyResult.concerns.length > 0) {
    setField("concerns", surveyResult.concerns);
  }
  if (surveyResult.gender === "male" || surveyResult.gender === "female") {
    setField("gender", surveyResult.gender as Gender);
  }
  if (surveyResult.age != null && surveyResult.age > 0) {
    setField("age", surveyResult.age);
  }
  if (typeof surveyResult.is_pregnant === "boolean") {
    setField("is_pregnant", surveyResult.is_pregnant);
  }

  if (markCompletedIfSurvey) {
    setCompleted(true);
  }
}
