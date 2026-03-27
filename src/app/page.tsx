"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import LoginPromptModal, {
  isLoginModalDismissed,
} from "@/components/modals/LoginPromptModal";

export default function HomePage() {
  const { data: session } = useSession();
  const { messages, isLoading } = useChatStore();
  const { isCompleted: surveyDone, data: surveyData } = useSurveyStore();
  const { sendMessage, startNewSession } = usePiyoChat();

  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyInviteDismissed, setSurveyInviteDismissed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session?.user;
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  // 채팅 3회 달성 시 비로그인 유저에게 로그인 권유 모달 표시
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
    // 비로그인 + 미완료 상태에서 설문 시작 시 로그인 권유 모달 먼저 표시
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
        onNewChat={() => {
          startNewSession();
        }}
        onSelectSession={() => {}}
        onLoginClick={() => {}}
        onSurveyClick={openSurvey}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <ChatHeader
          onSurveyClick={openSurvey}
          surveyCompleted={surveyDone}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={sendMessage}
              onSurveyClick={openSurvey}
              userName={session?.user?.name ?? undefined}
              nickname={surveyData.nickname?.trim() || undefined}
            />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
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
          onSkip={() => setShowSurvey(false)}
          onClose={() => setShowSurvey(false)}
        />
      )}

      {showLoginModal && (
        <LoginPromptModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
