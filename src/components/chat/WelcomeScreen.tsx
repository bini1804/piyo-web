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
  userName?: string;
}

export default function WelcomeScreen({
  onSuggestionClick,
  onSurveyClick,
  userName,
}: WelcomeScreenProps) {
  const mainTitle =
    userName && userName.trim().length > 0
      ? `${userName.trim()}님, 오늘 피부 컨디션은 어떠세요?`
      : "안녕하세요! 피요예요 🌸";

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-4 py-8 animate-fade-in sm:px-6 sm:py-12"
      style={{
        background:
          "linear-gradient(160deg, #FFFBEF 0%, #FFF9F0 40%, #F0F7FF 100%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-0 min-h-0">
        <div className="animate-piyo-float mb-6 flex shrink-0 justify-center">
          <div className="animate-piyo-blink">
            <Image
              src="/characters/piyo-smile.png"
              alt="피요"
              width={120}
              height={120}
              className="h-[120px] w-[120px] shrink-0 object-contain"
              priority
            />
          </div>
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
          className="text-center font-extrabold leading-[1.4]"
          style={{ fontSize: "22px", color: "#1a1a1a" }}
        >
          {mainTitle}
        </h1>

        <p
          className="text-center text-sm"
          style={{ color: "#888", marginTop: "8px" }}
        >
          피부 고민을 말씀해 주시면 맞춤 솔루션을 찾아드려요
        </p>

        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button
              key={s.text}
              type="button"
              onClick={() => onSuggestionClick(s.text)}
              className="flex flex-col items-start gap-3 rounded-2xl border border-[#efefef] bg-white p-4 text-left transition-colors hover:border-[#f4cb4b] hover:bg-[#fdf6dc]"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center text-xl leading-none"
                aria-hidden
              >
                {s.emoji}
              </span>
              <span className="text-sm leading-snug text-[#1a1a1a]">
                {s.text}
              </span>
            </button>
          ))}
        </div>
      </div>

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
    </div>
  );
}
