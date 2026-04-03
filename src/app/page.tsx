"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChatStore, useSurveyStore } from "@/stores";
import { usePiyoChat } from "@/hooks/usePiyoChat";
import ChatSidebar from "@/components/layout/ChatSidebar";
import ChatHeader from "@/components/layout/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import WelcomeScreen from "@/components/chat/WelcomeScreen";
import SurveyInviteInline from "@/components/chat/SurveyInviteInline";
import SurveyModal from "@/components/onboarding/SurveyModal";
import MyPageModal from "@/components/modals/MyPageModal";
import LoginPromptModal, {
  isLoginModalDismissed,
} from "@/components/modals/LoginPromptModal";
import { fetchSurveyCompletedFromServerAction } from "@/lib/actions/piyo";
import { pullPiyoSurveyIntoStore } from "@/lib/survey-hydrate";
import SurveyWelcomeModal, { isSurveyNudgeDismissed } from "@/components/modals/SurveyWelcomeModal";
import { getChatSessionsAction } from "@/lib/actions/piyo";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { messages, isLoading } = useChatStore();
  const { isCompleted: surveyDone, data: surveyData } = useSurveyStore();
  const setCompleted = useSurveyStore((s) => s.setCompleted);
  const { sendMessage, startNewSession } = usePiyoChat();

  const [showSurvey, setShowSurvey] = useState(false);
  const [showMypage, setShowMypage] = useState(false);
  const [surveyInviteDismissed, setSurveyInviteDismissed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [surveyHydrated, setSurveyHydrated] = useState(() => {
    if (typeof window === "undefined") return false;
    return useSurveyStore.persist?.hasHydrated?.() ?? false;
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session?.user;
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    const p = useSurveyStore.persist;
    if (!p?.onFinishHydration) return;
    const unsub = p.onFinishHydration(() => setSurveyHydrated(true));
    if (p.hasHydrated?.()) setSurveyHydrated(true);
    return unsub;
  }, []);

  /**
   * 로그인 + (persist 로드 전이거나 설문 완료)이면 설문 CTA/헤더 버튼 숨김.
   * hydrate 전에는 깜빡임 방지를 위해 설문 UI를 잠시 숨김.
   */
  const hideSurveyChrome =
    isLoggedIn && (!surveyHydrated || surveyDone);

  /** 답변 속 설문 유도 문단 제거 — 게스트는 로컬 완료 시에만 */
  const stripSurveyNudgeInBubble =
    hideSurveyChrome || (!isLoggedIn && surveyDone);

  useEffect(() => {
    const id = session?.user?.piyo_user_id;
    if (!id) return;
    let cancelled = false;
    void fetchSurveyCompletedFromServerAction(id).then((done) => {
      if (cancelled || !done) return;
      setCompleted(true);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.piyo_user_id, setCompleted]);

  useEffect(() => {
    const id = session?.user?.piyo_user_id;
    if (!id) return;
    let cancelled = false;
    void pullPiyoSurveyIntoStore(id, { markCompletedIfSurvey: true }).then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.piyo_user_id]);

  useEffect(() => {
    if (userMessageCount >= 3 && !isLoggedIn && !isLoginModalDismissed()) {
      setShowLoginModal(true);
    }
  }, [userMessageCount, isLoggedIn]);

  const showSurveyInvite =
    !isLoggedIn &&
    userMessageCount >= 1 &&
    !surveyDone &&
    !surveyInviteDismissed &&
    messages.length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showSurveyInvite]);

  useEffect(() => {
    if (isLoggedIn && surveyHydrated && !surveyDone && !isSurveyNudgeDismissed()) {
      setShowWelcomeModal(true);
    }
  }, [isLoggedIn, surveyHydrated, surveyDone]);

  useEffect(() => {
    const piyoId = session?.user?.piyo_user_id;
    if (!piyoId) return;

    // 다른 계정 재로그인 시 로컬 스토어 초기화
    const prevId = localStorage.getItem("piyo-last-user-id");
    if (prevId && prevId !== piyoId) {
      useChatStore.getState().clearAllSessions();
      localStorage.removeItem("piyo-chat-v3");
    }
    localStorage.setItem("piyo-last-user-id", piyoId);

    // 로컬 스토어가 비어있을 때만 RDS에서 복원
    const localSessions = useChatStore.getState().sessions;
    if (localSessions.length > 0) return;

    void getChatSessionsAction(piyoId).then((sessions) => {
      if (!sessions || sessions.length === 0) return;
      const chatSessions = sessions.map((s) => ({
        id: s.session_id,
        title: s.title ?? "이전 대화",
        messages: (s.messages as import("@/types").ChatMessage[]) ?? [],
        createdAt: s.created_at ?? new Date().toISOString(),
        updatedAt: s.updated_at ?? new Date().toISOString(),
      }));
      const latestSession = chatSessions[0];
      // 복원된 메시지는 isRestored 플래그 추가 — 타이핑 애니메이션 스킵
      const restoredMessages = (latestSession?.messages ?? []).map((m) => ({
        ...m,
        isRestored: true,
      }));
      useChatStore.setState({
        sessions: chatSessions,
        currentSessionId: latestSession?.id ?? null,
        messages: restoredMessages,
      });
    });
  }, [session?.user?.piyo_user_id]);

  const openSurvey = () => {
    if (!isLoggedIn && !isLoginModalDismissed()) {
      setShowLoginModal(true);
      return;
    }
    setShowSurvey(true);
    setSurveyInviteDismissed(false);
  };

  return (
    <div className="flex h-dvh w-full max-w-[100vw] overflow-hidden bg-white">
      <ChatSidebar
        isLoggedIn={isLoggedIn}
        nickname={surveyData.nickname?.trim() || undefined}
        userName={session?.user?.name ?? undefined}
        userAvatarUrl={session?.user?.image ?? undefined}
        skinType={surveyData.skin_type}
        concerns={surveyData.concerns}
        onNewChat={() => {
          startNewSession();
        }}
        onSelectSession={() => {}}
        onLoginClick={() => router.push("/login")}
        onSurveyClick={openSurvey}
        onProfileClick={() => setShowMypage(true)}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <ChatHeader
          onSurveyClick={openSurvey}
          surveyCompleted={surveyDone}
          showSurveyButton={!hideSurveyChrome}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={sendMessage}
              onSurveyClick={openSurvey}
              userName={session?.user?.name ?? undefined}
              nickname={surveyData.nickname?.trim() || undefined}
              showSurveyCta={!hideSurveyChrome}
            />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
              {messages.map((m, i) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  hideSurveyAnswerNudge={stripSurveyNudgeInBubble}
                  isLatest={
                    i === messages.length - 1 && m.role === "assistant"
                  }
                  isLoggedIn={isLoggedIn}
                />
              ))}
              {isLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 16px",
                  }}
                >
                  <img
                    src="/characters/piyo-smile.png"
                    style={{ width: 28, height: 28, objectFit: "contain" }}
                    alt="piyo"
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#F4CB4B",
                          display: "inline-block",
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {showSurveyInvite && (
                <SurveyInviteInline
                  onStartSurvey={openSurvey}
                  onDismiss={() => setSurveyInviteDismissed(true)}
                />
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
        />
      </main>

      {showSurvey && (
        <SurveyModal
          onComplete={() => setShowSurvey(false)}
          onClose={() => setShowSurvey(false)}
        />
      )}

      {showMypage && (
        <MyPageModal
          onClose={() => setShowMypage(false)}
          nickname={surveyData.nickname}
          userName={session?.user?.name ?? undefined}
          skinType={surveyData.skin_type}
          skinSensitivity={surveyData.skin_sensitivity}
          concerns={surveyData.concerns}
          onOpenSurvey={() => {
            setSurveyInviteDismissed(false);
            setShowSurvey(true);
            const id = session?.user?.piyo_user_id;
            if (id) {
              void pullPiyoSurveyIntoStore(id, {
                markCompletedIfSurvey: false,
              });
            }
          }}
        />
      )}

      {showLoginModal && (
        <LoginPromptModal onClose={() => setShowLoginModal(false)} />
      )}

      {showWelcomeModal && (
        <SurveyWelcomeModal
          onStartSurvey={() => {
            setShowWelcomeModal(false);
            setShowSurvey(true);
          }}
          onDismiss={() => setShowWelcomeModal(false)}
        />
      )}
    </div>
  );
}
