"use client";

interface SurveyInviteInlineProps {
  onStartSurvey: () => void;
  onDismiss: () => void;
}

/**
 * 첫 메시지 전송 후 설문을 자연스럽게 유도하는 인라인 블록
 */
export default function SurveyInviteInline({
  onStartSurvey,
  onDismiss,
}: SurveyInviteInlineProps) {
  return (
    <div
      className="rounded-[var(--radius-md)] p-4 max-w-3xl mx-auto"
      style={{
        background: "var(--brand-light)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="text-sm leading-relaxed mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        더 정확한 추천을 위해 피부 정보를 알려주시겠어요?
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStartSurvey}
          className="px-4 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--brand)",
            color: "var(--text-primary)",
          }}
        >
          지금 입력하기
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium border transition-colors"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
            background: "var(--bg-main)",
          }}
        >
          다음에
        </button>
      </div>
    </div>
  );
}
