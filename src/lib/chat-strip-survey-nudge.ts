/** 피요 답변 본문에 섞인 설문 유도 문단 제거 (설문 완료 유저에게 카드성 문구 숨김) */
const SURVEY_NUDGE_NEEDLE = "더 정확한 추천을 위해 피부 정보를 알려주시겠어요";

export function stripSurveyInviteFromAnswer(markdown: string): string {
  if (!markdown.includes(SURVEY_NUDGE_NEEDLE)) return markdown;
  return markdown
    .split(/\n\n+/)
    .filter((block) => !block.includes(SURVEY_NUDGE_NEEDLE))
    .join("\n\n")
    .trim();
}
