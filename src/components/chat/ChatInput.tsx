"use client";

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
} from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import PrivacyModal from "@/components/modals/PrivacyModal";
import TermsModal from "@/components/modals/TermsModal";

interface ChatInputProps {
  onSend: (msg: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const PLACEHOLDERS = [
    "막막한 피부 고민, 피요와 나누면 해답이 보여요 🧐✨",
    "피부 고민, 무엇이든 말씀해주세요 🌿",
    "결제 전 확인! 🛡️ 이 시술이 나에게 진짜 필요할까?",
    "망설여지는 시술 전, 확신을 더해드릴게요 🛡️",
    "유행하는 리쥬란, 나한테도 효과가 있을까요? 🧐✨",
    "내 피부 타입에 딱 맞는 앰플을 찾고 있다면? 🔍💎",
    "레티놀과 비타민C 🧪 같이 써도 괜찮을까요?",
    "여드름·모공·주름... 피요에게 고민 상담하기 🫧🪄",
    "오늘 내 피부 컨디션, 어떤 케어가 필요할까요? 💬",
    "내일은 중요한 날! 🌙 오늘 밤 '치트키' 홈케어 루틴은?",
  ];

  const [placeholderIdx, setPlaceholderIdx] = useState(
    () => Math.floor(Math.random() * PLACEHOLDERS.length)
  );
  const placeholderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPlaceholderCycle = () => {
    if (placeholderIntervalRef.current) return;
    placeholderIntervalRef.current = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
  };

  const stopPlaceholderCycle = () => {
    if (placeholderIntervalRef.current) {
      clearInterval(placeholderIntervalRef.current);
      placeholderIntervalRef.current = null;
    }
  };

  useEffect(() => {
    startPlaceholderCycle();
    return () => stopPlaceholderCycle();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const minH = 52;
    el.style.height = "auto";
    el.style.height =
      Math.min(Math.max(el.scrollHeight, minH), 160) + "px";
  }, [value]);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    const onFocus = () => {
      requestAnimationFrame(() => {
        wrapRef.current?.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      });
    };
    ta.addEventListener("focus", onFocus);
    return () => ta.removeEventListener("focus", onFocus);
  }, []);

  const send = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <>
      <div
        ref={wrapRef}
        className="sticky bottom-0 w-full bg-gradient-to-t from-white from-70% to-transparent px-3 pt-3 sm:px-4"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div
          className={cn(
            "relative mx-auto flex max-w-3xl items-end gap-2 rounded-[24px] border-[1.5px] border-[#efefef] bg-white transition-shadow duration-200",
            "focus-within:border-[#f4cb4b] focus-within:shadow-[0_0_0_3px_rgba(244,203,75,0.15)]",
            "pl-1 pr-1.5 py-1"
          )}
        >
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => {
              stopPlaceholderCycle();
            }}
            onBlur={() => {
              if (!value) startPlaceholderCycle();
            }}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            disabled={disabled}
            rows={1}
            className="chat-input scrollbar-hide max-h-40 flex-1 resize-none border-0 bg-transparent leading-relaxed text-[#1a1a1a] focus:outline-none disabled:opacity-50 placeholder:text-[#AAAAAA]"
            style={{
              minHeight: "52px",
              padding: "14px 12px 14px 18px",
              fontSize: "0.925rem",
              borderRadius: "26px",
            }}
          />
          <div className="flex shrink-0 flex-col justify-end pb-1 pr-0.5">
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4cb4b] text-[#1a1a1a] transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-40",
                canSend && "hover:bg-[#e6b800]"
              )}
              aria-label="보내기"
            >
              <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-3xl px-2 text-center text-[10px] leading-relaxed text-[#b0b0b0]">
          채팅을 시작하면{" "}
          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            className="underline hover:text-[#888] transition-colors"
          >
            개인정보처리방침
          </button>{" "}
          및{" "}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="underline hover:text-[#888] transition-colors"
          >
            이용약관
          </button>
          에 동의하는 것으로 간주됩니다
        </p>
      </div>

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}
