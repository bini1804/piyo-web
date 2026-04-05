"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  useChatStore,
  useSurveyStore,
  readPiyoChatPersistSnapshot,
  PIYO_CHAT_PERSIST_KEY,
} from "@/stores";
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
import {
  getChatSessionsAction,
  saveChatSessionAction,
} from "@/lib/actions/piyo";
import { getAnonymousId, PIYO_ANON_PENDING_KEY } from "@/lib/utils";
import type { ChatMessage, ChatSession } from "@/types";

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
  const [isRestoring, setIsRestoring] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session?.user;
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  /**
   * 비로그인 동안 마지막 사용자 식별자를 anon id로 둠 → 로그인 시 prevId === anon_…
   * 로그인 이펙트에서 isPrevAnon·piyo-anon-pending 백업·초기화 흐름이 맞게 이어짐.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (session?.user?.piyo_user_id) return;
    localStorage.setItem("piyo-last-user-id", getAnonymousId());
  }, [session?.user?.piyo_user_id]);

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

    // 소셜 A → 소셜 B: prevId 가 실제 piyo_user_id 이고 서로 다를 때만 초기화 (anon 은 제외)
    const prevId = localStorage.getItem("piyo-last-user-id");
    const isUserAccountSwitch = Boolean(
      prevId && !prevId.startsWith("anon_") && prevId !== piyoId
    );

    if (isUserAccountSwitch) {
      useChatStore.getState().clearAllSessions();
      localStorage.removeItem(PIYO_CHAT_PERSIST_KEY);
      localStorage.removeItem(PIYO_ANON_PENDING_KEY);
    }

    // 비로그인(prevId === anon_) → 로그인: 게스트 대화만 백업 후 persist 비움
    // OAuth 전체 리로드 시 메모리 스토어가 아직 비어 있을 수 있어 localStorage 스냅샷도 본다 (CASE 1).
    const isGuestToLogin = Boolean(piyoId && prevId?.startsWith("anon_"));
    if (isGuestToLogin) {
      const mem = useChatStore.getState();
      const disk = readPiyoChatPersistSnapshot();
      const hasMemory =
        mem.messages.length > 0 || mem.sessions.length > 0;
      const guestSessions = hasMemory ? mem.sessions : (disk?.sessions ?? []);
      const guestMessages = hasMemory ? mem.messages : (disk?.messages ?? []);
      const hadGuestChat =
        guestMessages.some((m) => m.createdAsGuest) ||
        guestSessions.some((ses) =>
          ses.messages.some((m) => m.createdAsGuest)
        );
      if (hadGuestChat) {
        localStorage.setItem(
          PIYO_ANON_PENDING_KEY,
          JSON.stringify({
            sessions: guestSessions,
            messages: guestMessages,
          })
        );
        useChatStore.getState().clearAllSessions();
        localStorage.removeItem(PIYO_CHAT_PERSIST_KEY);
      }
    }

    localStorage.setItem("piyo-last-user-id", piyoId);

    // 게스트 → 로그인: 문자열 pending(anon id) + createdAsGuest 만 즉시 처리.
    // JSON pending(계정 전환 백업)은 RDS 복원 후 .then 에서 병합·제거.
    let deferJsonAnonMerge = false;
    try {
      const pending = localStorage.getItem(PIYO_ANON_PENDING_KEY);
      if (pending?.startsWith("{")) {
        deferJsonAnonMerge = true;
      } else if (pending) {
        const anonId = getAnonymousId();
        const hasGuestTurn = useChatStore
          .getState()
          .messages.some((m) => m.createdAsGuest);
        if (pending === anonId && hasGuestTurn) {
          useChatStore.getState().markMessagesPreLoginFromGuest();
        }
      }
    } finally {
      if (!deferJsonAnonMerge) {
        localStorage.removeItem(PIYO_ANON_PENDING_KEY);
      }
    }

    // 로컬 스토어가 비어있을 때만 RDS에서 복원
    const localSessions = useChatStore.getState().sessions;
    if (localSessions.length > 0) return;

    setIsRestoring(true);
    void getChatSessionsAction(piyoId).then((sessions) => {
      if (sessions && sessions.length > 0) {
        const chatSessions = sessions.map((s) => ({
          id: s.session_id,
          title: s.title ?? "이전 대화",
          messages: (s.messages as ChatMessage[]) ?? [],
          createdAt: s.created_at ?? new Date().toISOString(),
          updatedAt: s.updated_at ?? new Date().toISOString(),
        }));
        const latestSession = chatSessions[0];
        // 복원된 메시지는 isRestored 플래그 추가 — 타이핑 애니메이션 스킵
        const restoredMessages = (latestSession?.messages ?? []).map((m) => ({
          ...m,
          isRestored: true,
          animated: true,
        }));
        useChatStore.setState({
          sessions: chatSessions,
          currentSessionId: latestSession?.id ?? null,
          messages: restoredMessages,
        });
      }

      // anon 대화 병합
      const pendingRaw = localStorage.getItem(PIYO_ANON_PENDING_KEY);
      if (pendingRaw) {
        try {
          const { sessions: anonSessions, messages: anonMessages } =
            JSON.parse(pendingRaw) as {
              sessions?: ChatSession[];
              messages?: ChatMessage[];
            };

          const anonSess = anonSessions ?? [];
          const anonMsgs = anonMessages ?? [];

          // RDS 복원된 세션이 없으면 anon 대화를 그대로 사용
          // RDS 세션이 있으면 anon 대화를 별도 세션으로 prepend
          const store = useChatStore.getState();
          const currentSessions = store.sessions;

          // RDS 세션 없음 + anon 세션 구조 있음 → 세션·메시지 그대로 복원(제목은 그대로)
          if (currentSessions.length === 0 && anonSess.length > 0) {
            const prepended = anonSess.map((s) => ({
              ...s,
              messages: s.messages.map((m) => ({ ...m, animated: true })),
            }));
            const first = prepended[0];
            const firstMsgs =
              first?.messages?.length
                ? first.messages
                : anonMsgs.map((m) => ({ ...m, animated: true }));
            useChatStore.setState({
              sessions: prepended,
              currentSessionId: first?.id ?? null,
              messages: firstMsgs.map((m) => ({ ...m, animated: true })),
            });
          } else if (currentSessions.length === 0 && anonMsgs.length > 0) {
            // 세션 메타 없이 메시지만 있는 백업 → 현재 스레드로 복원
            const sid = anonMsgs[0]?.session_id ?? null;
            useChatStore.setState({
              currentSessionId: sid,
              messages: anonMsgs.map((m) => ({ ...m, animated: true })),
            });
          } else if (anonSess.length > 0) {
            // RDS 세션 있음 → anon 세션을 "[로그인 전]" 달아 상단에 prepend
            const prepended = anonSess.map((s) => ({
              ...s,
              title: `[로그인 전] ${s.title ?? "대화"}`,
              messages: s.messages.map((m) => ({ ...m, animated: true })),
            }));
            useChatStore.setState({
              sessions: [...prepended, ...currentSessions],
            });
          }
        } catch (e) {
          console.error("[anon-merge] 파싱 실패:", e);
        } finally {
          localStorage.removeItem(PIYO_ANON_PENDING_KEY);
        }
      }
    }).finally(() => {
      setIsRestoring(false);
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
            isRestoring ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-[#F4CB4B] rounded-full animate-spin" />
                <p className="text-sm">대화를 불러오는 중...</p>
              </div>
            ) : (
              <WelcomeScreen
                onSuggestionClick={sendMessage}
                onSurveyClick={openSurvey}
                userName={session?.user?.name ?? undefined}
                nickname={surveyData.nickname?.trim() || undefined}
                showSurveyCta={!hideSurveyChrome}
              />
            )
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
                  onFeedbackSubmit={async (feedbackValue) => {
                    if (!session?.user?.piyo_user_id) return;
                    const store = useChatStore.getState();
                    const currentSession = store.sessions.find(
                      (s) => s.id === store.currentSessionId
                    );
                    if (!currentSession) return;
                    await saveChatSessionAction({
                      piyo_user_id: session.user.piyo_user_id,
                      session_id: currentSession.id,
                      title: currentSession.title ?? "대화",
                      messages: store.messages,
                      has_feedback: true,
                    });
                  }}
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
