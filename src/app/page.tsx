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
import TypingIndicator from "@/components/chat/TypingIndicator";
import WelcomeScreen from "@/components/chat/WelcomeScreen";
import SurveyInviteInline from "@/components/chat/SurveyInviteInline";
import SurveyModal from "@/components/onboarding/SurveyModal";
import MyPageModal from "@/components/modals/MyPageModal";
import LoginPromptModal, {
  isLoginModalDismissed,
} from "@/components/modals/LoginPromptModal";
import { fetchSurveyCompletedFromServerAction } from "@/lib/actions/piyo";
import { pullPiyoSurveyIntoStore } from "@/lib/survey-hydrate";

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
  const endRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session?.user;
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  const hideSurveyChrome = isLoggedIn && surveyDone;

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
    userMessageCount >= 1 &&
    !surveyDone &&
    !surveyInviteDismissed &&
    messages.length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showSurveyInvite]);

  const openSurvey = () => {
    if (!isLoggedIn && !isLoginModalDismissed()) {
      setShowLoginModal(true);
      return;
    }
    setShowSurvey(true);
    setSurveyInviteDismissed(false);
  };

  const stripSurveyNudgeInBubble = isLoggedIn && surveyDone;

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
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  hideSurveyAnswerNudge={stripSurveyNudgeInBubble}
                />
              ))}
              {isLoading && <TypingIndicator />}
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
          placeholder={
            surveyDone
              ? "피요에게 물어보세요..."
              : "피요에게 물어보세요... (설문하면 더 정확한 추천!)"
          }
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
          onOpenSurvey={async () => {
            const id = session?.user?.piyo_user_id;
            if (id) {
              await pullPiyoSurveyIntoStore(id, {
                markCompletedIfSurvey: false,
              });
            }
            setSurveyInviteDismissed(false);
            setShowSurvey(true);
          }}
        />
      )}

      {showLoginModal && (
        <LoginPromptModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
