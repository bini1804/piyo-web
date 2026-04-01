"use client";

import Image from "next/image";

const suggestions: { emoji: string; text: string }[] = [
  { emoji: "💧", text: "건조한 피부에 좋은 세럼 추천해줘" },
  { emoji: "✨", text: "모공 줄이는 방법 알려줘" },
  { emoji: "💉", text: "여드름 흉터에 효과적인 시술이 뭐야?" },
  { emoji: "🏥", text: "강남 근처 좋은 피부과 추천해줘" },
];

interface WelcomeScreenProps {
  onSuggestionClick: (t: string) => void;
  onSurveyClick: () => void;
  /** 세션에서 가져온 이름 (소셜 프로필) */
  userName?: string;
  /** 설문에서 입력한 별명 */
  nickname?: string;
  /** 로그인 + 설문 완료 시 하단 설문 CTA 숨김 */
  showSurveyCta?: boolean;
}

export default function WelcomeScreen({
  onSuggestionClick,
  onSurveyClick,
  userName,
  nickname,
  showSurveyCta = true,
}: WelcomeScreenProps) {
  // 우선순위: 설문 별명 → 소셜 이름 → 비로그인 기본 문구
  const displayName = nickname?.trim() || userName?.trim() || null;
  const mainTitle = displayName
    ? `${displayName}님, 오늘 피부 컨디션은 어떠세요?`
    : "안녕하세요! 피요예요 🌸";

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-4 py-8 animate-fade-in sm:px-6 sm:py-12"
      style={{
        background:
          "linear-gradient(160deg, #FFFBEF 0%, #FFF9F0 40%, #F0F7FF 100%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-0 min-h-0">
        <div className="relative mb-6 flex shrink-0 items-center justify-center animate-piyo-blink">
          <div
            className="absolute rounded-full"
            style={{
              width: "160px",
              height: "160px",
              background:
                "radial-gradient(circle, rgba(244,203,75,0.18) 0%, rgba(244,203,75,0.04) 65%, transparent 100%)",
              filter: "blur(12px)",
            }}
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/characters/piyo-smile.png"
            alt="피요"
            className="animate-piyo-float relative z-[1]"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "contain",
              objectPosition: "center",
              filter: "drop-shadow(0 8px 24px rgba(244,203,75,0.25))",
            }}
          />
        </div>

        <span
          className="mb-3 inline-block rounded-[20px] px-[10px] py-1 text-center text-xs font-semibold"
          style={{
            color: "#F4CB4B",
            background: "rgba(244, 203, 75, 0.12)",
          }}
        >
          ✨ AI 피부 컨시어지
        </span>

        <h1
          className="text-center"
          style={{
            fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#1a1a1a",
            lineHeight: 1.25,
            marginBottom: "10px",
          }}
        >
          {mainTitle}
        </h1>

        <p
          className="text-center"
          style={{
            fontSize: "0.875rem",
            color: "#9ca3af",
            fontWeight: 400,
            letterSpacing: "0.01em",
          }}
        >
          피부 고민을 말씀해 주시면 맞춤 솔루션을 찾아드려요
        </p>

        <div
          className="quick-actions-grid mt-8 grid w-full max-w-2xl gap-3"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s.text}
              type="button"
              onClick={() => onSuggestionClick(s.text)}
              style={{
                background: "#ffffff",
                border: "none",
                borderRadius: "16px",
                padding: "20px 16px",
                boxShadow:
                  "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
                cursor: "pointer",
                transition:
                  "transform 0.18s ease, box-shadow 0.18s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow =
                  "0 8px 24px rgba(244,203,75,0.2), 0 2px 8px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow =
                  "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)";
              }}
            >
              <span
                style={{
                  fontSize: "1.5rem",
                  lineHeight: 1,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
                }}
                aria-hidden
              >
                {s.emoji}
              </span>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#374151",
                  lineHeight: 1.4,
                }}
              >
                {s.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {showSurveyCta ? (
        <button
          type="button"
          onClick={onSurveyClick}
          className="mx-auto mt-6 flex w-full max-w-[480px] items-center gap-3 rounded-2xl bg-[#fdf6dc] px-4 py-3 text-left text-sm font-medium text-[#1a1a1a] transition-opacity hover:opacity-90"
        >
          <Image
            src="/images/piyo-wave.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 max-h-14 max-w-14 shrink-0 object-contain"
          />
          <span className="min-w-0 flex-1 leading-snug">
            30초 피부 진단으로 나만의 맞춤형 피요 완성하기 →
          </span>
        </button>
      ) : null}
    </div>
  );
}
