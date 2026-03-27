"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useChatStore, useSurveyStore } from "@/stores";
import { getAnonymousId } from "@/lib/utils";
import type { ChatMessage, ChatResponseMetadata, PiyoChatRequest } from "@/types";
import { v4 as uuidv4 } from "uuid";

function newSessionId(): string {
  return uuidv4().replace(/-/g, "").slice(0, 8);
}

export function usePiyoChat() {
  const { data: session } = useSession();

  const userId: string =
    session?.user?.piyo_user_id ?? getAnonymousId();

  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const saveCurrentSession = useChatStore((s) => s.saveCurrentSession);
  const isLoading = useChatStore((s) => s.isLoading);
  const messages = useChatStore((s) => s.messages);
  const { data: survey } = useSurveyStore();

  const startNewSession = useCallback(() => {
    useChatStore.getState().startNewSession();
  }, []);

  const sendMessage = useCallback(
    async (query: string) => {
      if (isLoading) return;

      let sessionId = useChatStore.getState().currentSessionId;
      if (!sessionId) {
        sessionId = newSessionId();
        useChatStore.setState({ currentSessionId: sessionId });
      }

      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const userMsg: ChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        role: "user",
        content: query,
        created_at: new Date().toISOString(),
      };
      addMessage(userMsg);
      setLoading(true);

      try {
        const body: PiyoChatRequest = {
          user_id: userId,
          query,
          session_id: sessionId,
          history,
          use_memory: Boolean(session),
          age: survey.age || 25,
          gender: survey.gender || "female",
          skin_type: survey.skin_type || "combination",
          concerns: survey.concerns || [],
          skin_sensitivity: survey.skin_sensitivity,
          skin_intensity: survey.skin_intensity,
          is_pregnant: survey.is_pregnant,
        };

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            typeof err.error === "string"
              ? err.error
              : `서버 오류 (${res.status})`
          );
        }

        const data = await res.json();

        const assistantMsg: ChatMessage = {
          id: uuidv4(),
          session_id: sessionId,
          role: "assistant",
          content: data.answer || "죄송해요, 답변을 생성하지 못했어요.",
          metadata: (data.metadata as ChatResponseMetadata) || {},
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMsg);
      } catch (error) {
        addMessage({
          id: uuidv4(),
          session_id: sessionId,
          role: "assistant",
          content:
            error instanceof Error
              ? `오류가 발생했어요: ${error.message}`
              : "알 수 없는 오류가 발생했어요.",
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
        saveCurrentSession();
      }
    },
    [
      addMessage,
      setLoading,
      isLoading,
      survey,
      messages,
      saveCurrentSession,
      userId,
      session,
    ]
  );

  return { sendMessage, isLoading, startNewSession };
}
