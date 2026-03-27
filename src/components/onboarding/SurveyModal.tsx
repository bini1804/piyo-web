"use client";

import { useLayoutEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSurveyStore } from "@/stores";
import { X, ChevronRight, ChevronLeft, Check, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gender, SkinType } from "@/types";
import {
  SKIN_TYPES,
  SENSITIVITY_QUESTION,
  SENSITIVITY_LEVELS,
  CONCERN_CATEGORIES,
} from "@/constants/survey";
import { upsertUserAction, saveSurveyAction } from "@/lib/actions/piyo";
import PrivacyModal from "@/components/modals/PrivacyModal";
import TermsModal from "@/components/modals/TermsModal";

interface SurveyModalProps {
  onComplete: () => void;
  onClose: () => void;
}

// Step 0: 별명 입력
// Step 1: 기본 정보 (성별, 나이, 임신여부) — 기존 step 0
// Step 2: 피부 타입 — 기존 step 1
// Step 3: 피부 고민 — 기존 step 2
const TOTAL = 4;

const choiceBase =
  "flex-1 py-3 rounded-xl border text-sm font-medium transition-all";
const choiceDefault =
  "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]";
const choiceSelected =
  "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--text-primary)] font-bold";

function FlowerLikert({
  title,
  subtitle,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  leftLabel: string;
  rightLabel: string;
  value: number | undefined;
  onChange: (n: number) => void;
}) {
  return (
    <div className="min-w-0">
      <p
        className="mb-1"
        style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}
      >
        {title}
      </p>
      {subtitle ? (
        <p className="mb-3" style={{ color: "#888", fontSize: 13 }}>
          {subtitle}
        </p>
      ) : (
        <div className="mb-3" />
      )}
      <div className="flex w-full justify-between gap-1 min-w-0">
        {([1, 2, 3, 4, 5] as const).map((n) => {
          const isSel = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="flex flex-1 min-w-0 flex-col items-center justify-end gap-1 py-1 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              aria-label={`${n}단계`}
              aria-pressed={isSel}
            >
              <Flower2
                className={cn(
                  "w-7 h-7 shrink-0 transition-colors",
                  isSel ? "text-[#F4CB4B]" : "text-[var(--text-muted)]"
                )}
                strokeWidth={isSel ? 2.25 : 1.75}
              />
            </button>
          );
        })}
      </div>
      <div
        className="flex justify-between mt-2 px-0.5"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-[11px] font-medium truncate pr-1">
          {leftLabel}
        </span>
        <span className="text-[11px] font-medium truncate pl-1 text-right">
          {rightLabel}
        </span>
      </div>
    </div>
  );
}

function SensitivityExplainCard({ level }: { level: number }) {
  const selected = SENSITIVITY_LEVELS.find((l) => l.level === level);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!SENSITIVITY_LEVELS.some((l) => l.level === level)) {
      setVisible(false);
      return;
    }
    setVisible(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, [level]);

  if (!selected) return null;

  return (
    <div
      className={cn(
        "w-full min-w-0 transition-all duration-200 ease-out",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      )}
      style={{
        marginTop: 12,
        background: "#FFFBEF",
        border: "1px solid rgba(244,203,75,0.25)",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <p className="text-[11px] font-medium mb-1" style={{ color: "#999" }}>
        Level {selected.level} · {selected.nameEn}
      </p>
      <p
        className="mb-2 break-words"
        style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}
      >
        {selected.name}
      </p>
      <p
        className="break-words"
        style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}
      >
        {selected.description}
      </p>
    </div>
  );
}

export default function SurveyModal({ onComplete, onClose }: SurveyModalProps) {
  const { data: session } = useSession();
  const { data, setField, setCompleted } = useSurveyStore();
  const [step, setStep] = useState(0);
  const [skinDataConsent, setSkinDataConsent] = useState(false);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(() => [
    ...(data.concerns ?? []),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const selectedSkin = SKIN_TYPES.find((t) => t.value === data.skin_type);

  const canProceed = (): boolean => {
    if (step === 0) return Boolean((data.nickname ?? "").trim());
    if (step === 1)
      return skinDataConsent && !!data.gender && !!data.age && data.age > 0;
    if (step === 2) return Boolean(data.skin_type);
    if (step === 3) return selectedConcerns.length > 0;
    return false;
  };

  const next = async () => {
    if (step === 0) {
      // 별명 입력 후 upsert (로그인 상태일 때만)
      const piyoId = session?.user?.piyo_user_id;
      const provider = session?.user?.provider;
      if (piyoId && provider && data.nickname?.trim()) {
        await upsertUserAction(piyoId, provider, data.nickname.trim());
      }
      setStep(1);
      return;
    }

    if (step < TOTAL - 1) {
      setStep(step + 1);
      return;
    }

    // 마지막 스텝 — 설문 저장
    setIsSubmitting(true);
    try {
      const piyoId = session?.user?.piyo_user_id;
      const provider = session?.user?.provider;
      const nick = (data.nickname ?? "").trim();
      if (piyoId && provider && nick) {
        await upsertUserAction(piyoId, provider, nick);
      }
      if (piyoId && data.skin_type) {
        await saveSurveyAction(piyoId, {
          skin_type: data.skin_type,
          skin_intensity: data.skin_intensity,
          skin_sensitivity: data.skin_sensitivity,
          concerns: data.concerns ?? [],
        });
      }
      setCompleted(true);
      onComplete();
    } catch (e) {
      console.error("survey submit failed:", e);
      setIsSubmitting(false);
    }
  };

  const toggleConcern = (item: string) => {
    setSelectedConcerns((cur) => {
      const next = cur.includes(item)
        ? cur.filter((c) => c !== item)
        : [...cur, item];
      setField("concerns", next);
      return next;
    });
  };

  const selectSkinType = (value: (typeof SKIN_TYPES)[number]["value"]) => {
    if (data.skin_type !== value) {
      setField("skin_intensity", undefined);
      setField("skin_sensitivity", undefined);
    }
    setField("skin_type", value as SkinType);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-[4px]">
        <div
          className="relative flex max-h-[96dvh] sm:max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden bg-white animate-slide-up shadow-[var(--shadow-md)] rounded-t-[24px] sm:rounded-[24px]"
        >
          {/* 헤더 */}
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {step + 1}/{TOTAL}
              </span>
              <div
                className="w-24 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--bg-hover)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((step + 1) / TOTAL) * 100}%`,
                    background: "var(--brand)",
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
            >
              <X size={18} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
            {/* ── Step 0: 별명 입력 ── */}
            {step === 0 && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    피요가 뭐라고 불러드릴까요? 🌸
                  </h3>
                  <p
                    className="text-sm mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    별명은 필수입니다 (최대 10자)
                  </p>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  value={data.nickname ?? ""}
                  onChange={(e) => setField("nickname", e.target.value)}
                  placeholder="예: 민지, 뽀송이, 피부왕"
                  className="w-full rounded-xl border-[1.5px] px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(244,203,75,0.15)]"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <p
                  className="text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {(data.nickname ?? "").length}/10
                </p>
              </div>
            )}

            {/* ── Step 1: 기본 정보 (구 step 0, 동의 체크박스 제외됨) ── */}
            {step === 1 && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    기본 정보를 알려주세요
                  </h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    더 정확한 추천을 위해 필요해요
                  </p>
                </div>
                <div>
                  <label
                    className="text-sm font-semibold mb-2 block"
                    style={{ color: "var(--text-primary)" }}
                  >
                    성별
                  </label>
                  <div className="flex gap-3">
                    {(["female", "male"] as Gender[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setField("gender", g)}
                        className={cn(choiceBase, choiceDefault, {
                          [choiceSelected]: data.gender === g,
                        })}
                      >
                        {g === "female" ? "여성" : "남성"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    className="text-sm font-semibold mb-2 block"
                    style={{ color: "var(--text-primary)" }}
                  >
                    나이
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={99}
                    value={data.age || ""}
                    onChange={(e) => setField("age", Number(e.target.value))}
                    placeholder="나이를 입력해주세요"
                    className="w-full rounded-xl border-[1.5px] px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(244,203,75,0.15)]"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                {data.gender === "female" && (
                  <div>
                    <label
                      className="text-sm font-semibold mb-2 block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      임신 여부
                    </label>
                    <div className="flex gap-3">
                      {[
                        { v: false, l: "해당 없음" },
                        { v: true, l: "임신/수유 중" },
                      ].map((o) => (
                        <button
                          key={String(o.v)}
                          type="button"
                          onClick={() => setField("is_pregnant", o.v)}
                          className={cn(choiceBase, choiceDefault, {
                            [choiceSelected]: data.is_pregnant === o.v,
                          })}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: 피부 타입 (구 step 1) ── */}
            {step === 2 && (
              <div className="animate-fade-in space-y-4">
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  피부 타입을 선택해주세요
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  가장 가깝다고 느끼는 타입 하나를 선택해주세요
                </p>
                <div className="flex flex-col gap-3">
                  {SKIN_TYPES.map((t) => {
                    const sel = data.skin_type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => selectSkinType(t.value)}
                        className="relative w-full rounded-2xl transition-all px-4 py-3 text-left"
                        style={{
                          border: sel
                            ? "2px solid #F4CB4B"
                            : "1px solid #e5e5e5",
                          background: sel ? "#FFFBEF" : "white",
                        }}
                      >
                        <div className="flex items-start gap-3 pr-8">
                          <span
                            className="shrink-0 font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t.label}
                          </span>
                          <span
                            className="flex-1 min-w-0 text-xs leading-snug"
                            style={{ color: "#888" }}
                          >
                            {t.desc}
                          </span>
                        </div>
                        {sel ? (
                          <span
                            className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-md"
                            style={{ background: "#F4CB4B" }}
                          >
                            <Check
                              size={14}
                              className="text-white"
                              strokeWidth={3}
                            />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    selectedSkin ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden min-h-0">
                    {selectedSkin ? (
                      <div className="space-y-6 pt-2 border-t border-[var(--border)] mt-1">
                        <FlowerLikert
                          title={selectedSkin.q1.text}
                          leftLabel={selectedSkin.q1.left}
                          rightLabel={selectedSkin.q1.right}
                          value={data.skin_intensity}
                          onChange={(n) => setField("skin_intensity", n)}
                        />
                        <div>
                          <FlowerLikert
                            title={SENSITIVITY_QUESTION.text}
                            subtitle={SENSITIVITY_QUESTION.sub}
                            leftLabel={SENSITIVITY_QUESTION.left}
                            rightLabel={SENSITIVITY_QUESTION.right}
                            value={data.skin_sensitivity}
                            onChange={(n) => setField("skin_sensitivity", n)}
                          />
                          {data.skin_sensitivity !== undefined ? (
                            <SensitivityExplainCard
                              level={data.skin_sensitivity}
                            />
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: 피부 고민 (구 step 2) ── */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  가장 신경 쓰이는 피부 고민 순서대로 선택해 주세요!
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--text-secondary)" }}
                >
                  고민되는 항목을 모두 선택해 주세요
                </p>
                {CONCERN_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{cat.emoji}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item) => {
                        const isSelected = selectedConcerns.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleConcern(item)}
                            style={{ width: "calc(50% - 4px)" }}
                            className={cn(
                              "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-[15px] text-center",
                              isSelected
                                ? "font-semibold bg-[#F4CB4B] text-[#1a1a1a]"
                                : "bg-[#f5f5f5] text-[#444]"
                            )}
                          >
                            {isSelected ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  background: "white",
                                  color: "#1a1a1a",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {selectedConcerns.indexOf(item) + 1}
                              </span>
                            ) : null}
                            <span>{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 푸터 (동의 체크박스 + 버튼 행) ── */}
          <div
            className="shrink-0 border-t border-[var(--border)] bg-white px-6 pt-4"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            {/* 동의 체크박스 — step 1에서만 "다음" 버튼 바로 위 노출 */}
            {step === 1 && (
              <div className="flex items-start gap-2 mb-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={skinDataConsent}
                  onClick={() => setSkinDataConsent((v) => !v)}
                  className="mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors"
                  style={{
                    background: skinDataConsent ? "#F4CB4B" : "white",
                    borderColor: skinDataConsent ? "#F4CB4B" : "#ccc",
                    accentColor: "#F4CB4B",
                  }}
                >
                  {skinDataConsent && (
                    <Check size={10} color="#1a1a1a" strokeWidth={3} />
                  )}
                </button>
                <span
                  className="text-xs leading-snug flex-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  맞춤 추천을 위해 입력한 피부 정보(피부타입, 고민, 민감도)를
                  수집·이용하는 것에 동의합니다. (필수)
                </span>
                <div className="flex shrink-0 items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="text-[10px] underline transition-opacity hover:opacity-70"
                    style={{ color: "#aaa" }}
                  >
                    개인정보처리방침
                  </button>
                  <span className="text-[10px]" style={{ color: "#ccc" }}>
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-[10px] underline transition-opacity hover:opacity-70"
                    style={{ color: "#aaa" }}
                  >
                    이용약관
                  </button>
                </div>
              </div>
            )}

            {/* 버튼 행 */}
            <div className="flex items-center justify-between">
              {step === 0 ? (
                <span className="w-16 shrink-0" aria-hidden />
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 text-sm transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ChevronLeft size={16} /> 이전
                </button>
              )}
              <button
                type="button"
                onClick={() => void next()}
                disabled={!canProceed() || isSubmitting}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity",
                  (!canProceed() || isSubmitting) &&
                    "opacity-40 cursor-not-allowed"
                )}
                style={{
                  background: "var(--brand)",
                  color: "var(--text-primary)",
                }}
              >
                {isSubmitting
                  ? "저장 중..."
                  : step === TOTAL - 1
                    ? "완료"
                    : "다음"}
                {!isSubmitting && step < TOTAL - 1 && (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      {/* 이용약관 모달 */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}
