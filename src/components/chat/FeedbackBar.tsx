"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FeedbackBarProps {
  chatLogId: string;
}

const POSITIVE_REASONS = [
  { code: 1, label: "정확한 정보였어요" },
  { code: 2, label: "내 피부에 딱 맞는 추천이에요" },
  { code: 3, label: "설명이 이해하기 쉬웠어요" },
  { code: 4, label: "몰랐던 정보를 알게 됐어요" },
];

const NEGATIVE_REASONS = [
  { code: 11, label: "내 피부 상황과 맞지 않아요" },
  { code: 12, label: "추천이 부담스러워요" },
  { code: 13, label: "정보가 부정확한 것 같아요" },
  { code: 14, label: "원하는 답변이 아니었어요" },
  { code: 15, label: "설명이 어렵거나 너무 길었어요" },
  { code: 99, label: "기타" },
];

type FeedbackValue = 1 | -1 | null;

export function FeedbackBar({ chatLogId }: FeedbackBarProps) {
  const [feedback, setFeedback] = useState<FeedbackValue>(null);
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [etcText, setEtcText] = useState("");
  const [showEtcInput, setShowEtcInput] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 시 노출 기록
  useEffect(() => {
    fetch("/api/feedback/expose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_log_id: chatLogId }),
    }).catch(() => {});
  }, [chatLogId]);

  // 시트 자동 닫힘 (👍만 — 7초)
  useEffect(() => {
    if (showSheet && feedback === 1) {
      autoCloseRef.current = setTimeout(() => {
        setShowSheet(false);
      }, 7000);
    }
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [showSheet, feedback]);

  const sendFeedback = async (
    value: FeedbackValue,
    code?: number,
    text?: string
  ) => {
    if (!value) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_log_id: chatLogId,
          feedback: value,
          reason_code: code ?? null,
          reason_text: text ?? null,
        }),
      });
    } catch (_) {}
  };

  const handleFeedback = async (value: 1 | -1) => {
    if (submitted) return;
    setFeedback(value);
    setShowSheet(true);
    setSelectedCode(null);
    setShowEtcInput(false);
    setEtcText("");
    // 👍는 낙관적으로 먼저 저장 (이유 없이)
    if (value === 1) {
      setThankYou(true);
      await sendFeedback(value);
    }
  };

  const handleReasonSelect = async (code: number) => {
    if (code === 99) {
      setSelectedCode(99);
      setShowEtcInput(true);
      return;
    }
    setSelectedCode(code);
    setShowSheet(false);
    setSubmitted(true);
    setThankYou(true);
    await sendFeedback(feedback, code);
  };

  const handleEtcSubmit = async () => {
    setShowSheet(false);
    setSubmitted(true);
    setThankYou(true);
    await sendFeedback(feedback, 99, etcText.trim() || undefined);
  };

  const reasons = feedback === 1 ? POSITIVE_REASONS : NEGATIVE_REASONS;
  const sheetTitle =
    feedback === 1 ? "어떤 점이 좋으셨나요?" : "어떤 점이 아쉬우셨나요?";

  return (
    <div
      className="w-full rounded-2xl p-4"
      style={{
        background: "#FAFAFA",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        marginTop: "4px",
      }}
    >
      {/* 메인 바 */}
      <div className="flex items-center justify-between">
        <span
          className="text-[12px] leading-relaxed"
          style={{ color: thankYou ? "var(--brand-dark)" : "var(--text-muted)" }}
        >
          {thankYou ? "감사합니다 💛" : "이 답변이 도움이 됐나요?"}
        </span>
        <div className="flex items-center gap-2">
          {/* 👍 */}
          <button
            type="button"
            onClick={() => handleFeedback(1)}
            disabled={submitted}
            aria-label="도움이 됐어요"
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "none",
              background: feedback === 1 ? "var(--brand)" : "transparent",
              cursor: submitted ? "default" : "pointer",
              transition: "background 0.2s",
              opacity: submitted && feedback !== 1 ? 0.3 : 1,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={feedback === 1 ? "#1a1a1a" : "none"}
              stroke={feedback === 1 ? "#1a1a1a" : "var(--text-muted)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
          {/* 👎 */}
          <button
            type="button"
            onClick={() => handleFeedback(-1)}
            disabled={submitted}
            aria-label="도움이 안 됐어요"
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "none",
              background: feedback === -1 ? "#f0f0ee" : "transparent",
              cursor: submitted ? "default" : "pointer",
              transition: "background 0.2s",
              opacity: submitted && feedback !== -1 ? 0.3 : 1,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={feedback === -1 ? "var(--text-secondary)" : "none"}
              stroke={feedback === -1 ? "var(--text-secondary)" : "var(--text-muted)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
              <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
            </svg>
          </button>
        </div>
      </div>

      {/* 이유 시트 */}
      {showSheet && (
        <div
          className="mt-3 border-t pt-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              className="text-[12px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {sheetTitle}
            </span>
            <button
              type="button"
              onClick={() => setShowSheet(false)}
              aria-label="닫기"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--text-muted)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 이유 칩 */}
          <div className="flex flex-wrap gap-2">
            {reasons.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => handleReasonSelect(r.code)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] transition-colors",
                  selectedCode === r.code
                    ? "bg-[var(--brand)] text-[#1a1a1a] font-medium"
                    : "bg-white text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--brand)]"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* 기타 입력창 */}
          {showEtcInput && (
            <div className="mt-3">
              <textarea
                value={etcText}
                onChange={(e) => {
                  if (e.target.value.length <= 150) setEtcText(e.target.value);
                }}
                placeholder="어떤 점이 아쉬우셨나요?"
                rows={2}
                className="w-full resize-none rounded-[var(--radius-sm)] border text-[13px] leading-relaxed focus:outline-none"
                style={{
                  borderColor: "var(--border)",
                  padding: "10px 12px",
                  color: "var(--text-primary)",
                  background: "var(--bg-main)",
                }}
              />
              <div className="mt-1 flex items-center justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {etcText.length}/150
                </span>
                <button
                  type="button"
                  onClick={handleEtcSubmit}
                  className="rounded-full px-4 py-1.5 text-[12px] font-medium"
                  style={{
                    background: "var(--brand)",
                    color: "#1a1a1a",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
