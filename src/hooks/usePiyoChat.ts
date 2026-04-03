"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useChatStore, useSurveyStore } from "@/stores";
import { getAnonymousId } from "@/lib/utils";
import type { ChatMessage, ChatResponseMetadata, PiyoChatRequest } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveChatSessionAction } from "@/lib/actions/piyo";

function newSessionId(): string {
  return uuidv4().replace(/-/g, "").slice(0, 8);
}

export function usePiyoChat() {
  const { data: session } = useSession();

  const userId: string =
    session?.user?.piyo_user_id ?? getAnonymousId();

  const [userLocation, setUserLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) return;

    // 브라우저 캐시 활용 (5분 이내 위치 재사용)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        // 거부/실패 → null 유지, 서버가 기본값 처리
        setUserLocation({ latitude: null, longitude: null });
      },
      {
        timeout: 8000,
        maximumAge: 5 * 60 * 1000, // 5분 캐시
        enableHighAccuracy: false,  // 배터리 절약
      }
    );
  }, []);

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
          latitude: userLocation.latitude ?? undefined,
          longitude: userLocation.longitude ?? undefined,
        };

        const clientTimeoutMs =
          Number(process.env.NEXT_PUBLIC_CHAT_CLIENT_TIMEOUT_MS) || 125_000;
        const ac = new AbortController();
        const timeoutId = setTimeout(() => ac.abort(), clientTimeoutMs);

        let res: Response;
        try {
          res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: ac.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

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
        const timedOut =
          typeof error === "object" &&
          error !== null &&
          (error as { name?: string }).name === "AbortError";
        addMessage({
          id: uuidv4(),
          session_id: sessionId,
          role: "assistant",
          content: timedOut
            ? "응답 시간이 너무 길어요. 피요 서버(또는 네트워크)를 확인한 뒤 다시 시도해 주세요."
            : error instanceof Error
              ? `오류가 발생했어요: ${error.message}`
              : "알 수 없는 오류가 발생했어요.",
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
        saveCurrentSession();
        // 로그인 유저만 RDS에 세션 저장
        if (session?.user?.piyo_user_id) {
          const state = useChatStore.getState();
          const allMessages = state.messages;
          const title = allMessages[0]?.content?.slice(0, 30) ?? null;
          void saveChatSessionAction({
            piyo_user_id: session.user.piyo_user_id,
            session_id: sessionId,
            title,
            messages: allMessages,
            has_feedback: false,
          });
        }
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
      userLocation,
    ]
  );

  return { sendMessage, isLoading, startNewSession };
}
