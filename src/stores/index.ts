import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { ChatSession, ChatMessage, SurveyData } from "@/types";

function newSessionId(): string {
  return uuidv4().replace(/-/g, "").slice(0, 8);
}

// ---- Chat Store ----
interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  setSessions: (s: ChatSession[]) => void;
  addMessage: (m: ChatMessage) => void;
  setMessages: (m: ChatMessage[]) => void;
  setLoading: (b: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (b: boolean) => void;
  startNewSession: () => void;
  /** 로그아웃 등 — 세션·메시지 전부 초기화 (persist 키는 호출부에서 제거) */
  clearAllSessions: () => void;
  saveCurrentSession: () => void;
  loadSession: (sessionId: string) => void;
  /** assistant 말풍선 타자 완료 후 호출 — 세션 전환 시 애니메이션 재생 방지 */
  markMessageAnimated: (messageId: string) => void;
  setMessageFeedback: (messageId: string, feedback: 1 | -1) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
  deleteSession: (sessionId: string) => void;
}

function buildSessionFromState(
  id: string,
  messages: ChatMessage[],
  prev: ChatSession | undefined
): ChatSession {
  const now = new Date().toISOString();
  const first = messages[0];
  const title = first ? first.content.slice(0, 20) : "새 대화";
  return {
    id,
    title,
    messages: messages.map((m) => ({ ...m, session_id: id })),
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      messages: [],
      isLoading: false,
      // 모바일 첫 페인트에 전역 백드롭이 올라 클릭이 막히지 않도록 기본은 닫힘.
      // 데스크톱은 ChatSidebar에서 useLayoutEffect로 연다.
      isSidebarOpen: false,

      setSessions: (sessions) => set({ sessions }),

      addMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),

      setMessages: (messages) => set({ messages }),

      setLoading: (isLoading) => set({ isLoading }),

      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

      saveCurrentSession: () => {
        const s = get();
        if (s.messages.length === 0) return;
        const id = s.currentSessionId ?? newSessionId();
        const prev = s.sessions.find((x) => x.id === id);
        const session = buildSessionFromState(id, s.messages, prev);
        const others = s.sessions.filter((x) => x.id !== id);
        set({
          currentSessionId: id,
          sessions: [session, ...others].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
        });
      },

      updateSessionTitle: (sessionId: string, newTitle: string) => {
        const s = get();
        const updated = s.sessions.map((x) =>
          x.id === sessionId
            ? { ...x, title: newTitle, updatedAt: new Date().toISOString() }
            : x
        );
        set({ sessions: updated });
      },

      deleteSession: (sessionId: string) => {
        const s = get();
        const newSessions = s.sessions.filter((x) => x.id !== sessionId);
        if (s.currentSessionId === sessionId) {
          if (newSessions.length > 0) {
            const next = newSessions[0];
            set({
              sessions: newSessions,
              currentSessionId: next.id,
              messages: next.messages.map((m) => ({ ...m, animated: true })),
            });
          } else {
            set({
              sessions: newSessions,
              currentSessionId: newSessionId(),
              messages: [],
            });
          }
        } else {
          set({ sessions: newSessions });
        }
      },

      startNewSession: () => {
        const s = get();
        if (s.messages.length > 0) {
          get().saveCurrentSession();
        }
        set({
          currentSessionId: newSessionId(),
          messages: [],
        });
      },

      clearAllSessions: () =>
        set({
          sessions: [],
          currentSessionId: null,
          messages: [],
        }),

      loadSession: (sessionId: string) => {
        const sess = get().sessions.find((x) => x.id === sessionId);
        if (!sess) return;
        const mobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        set({
          currentSessionId: sessionId,
          messages: sess.messages.map((m) => ({ ...m, animated: true })),
          ...(mobile ? { isSidebarOpen: false } : {}),
        });
      },

      markMessageAnimated: (messageId: string) => {
        const s = get();
        const cid = s.currentSessionId;
        const messages = s.messages.map((m) =>
          m.id === messageId ? { ...m, animated: true } : m
        );
        const sessions =
          cid == null
            ? s.sessions
            : s.sessions.map((sess) =>
                sess.id === cid
                  ? {
                      ...sess,
                      messages: sess.messages.map((m) =>
                        m.id === messageId ? { ...m, animated: true } : m
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : sess
              );
        set({ messages, sessions });
      },

      setMessageFeedback: (messageId, feedback) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId
              ? { ...m, metadata: { ...m.metadata, userFeedback: feedback } }
              : m
          ),
          sessions: state.sessions.map((sess) => ({
            ...sess,
            messages: sess.messages.map((m) =>
              m.id === messageId
                ? { ...m, metadata: { ...m.metadata, userFeedback: feedback } }
                : m
            ),
          })),
        })),
    }),
    {
      name: "piyo-chat-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        messages: state.messages,
      }),
      // 과거 스토어/수동 저장으로 localStorage에 isLoading 이 남아 있으면 재수화 시 로딩이 고착됨
      onRehydrateStorage: () => (_state, error) => {
        if (error) return;
        useChatStore.setState((s) => ({
          isLoading: false,
          messages: s.messages.map((m) => ({ ...m, animated: true })),
          sessions: s.sessions.map((sess) => ({
            ...sess,
            messages: sess.messages.map((m) => ({ ...m, animated: true })),
          })),
        }));
      },
    }
  )
);

// ---- Survey Store ----
interface SurveyState {
  data: Partial<SurveyData>;
  isCompleted: boolean;
  setField: <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => void;
  setData: (d: Partial<SurveyData>) => void;
  setCompleted: (b: boolean) => void;
  /** 설문 미완료 상태에서만 초기화. 완료 후에는 가드 (실수로 데이터 날리기 방지). */
  reset: () => void;
  /**
   * 설문 완료 여부와 무관하게 스토어를 비움.
   * 마이페이지 등에서만 호출할 것 (일반 `reset()`은 완료 시 무시).
   */
  resetForSurveyEdit: () => void;
  /** 로그아웃 등 강제 초기화용. resetForSurveyEdit 와 동일. */
  forceReset: () => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      data: {},
      isCompleted: false,
      setField: (key, value) =>
        set((s) => ({ data: { ...s.data, [key]: value } })),
      setData: (data) => set({ data }),
      setCompleted: (isCompleted) => set({ isCompleted }),
      reset: () => {
        if (get().isCompleted) return;
        set({ data: {}, isCompleted: false });
      },
      resetForSurveyEdit: () => set({ data: {}, isCompleted: false }),
      forceReset: () => set({ data: {}, isCompleted: false }),
    }),
    {
      name: "piyo-survey-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: state.data,
        isCompleted: state.isCompleted,
      }),
    }
  )
);

// ---- Consent Store ----
interface ConsentState {
  hasConsented: boolean;
  setConsented: (b: boolean) => void;
}

export const useConsentStore = create<ConsentState>((set) => ({
  hasConsented: false,
  setConsented: (hasConsented) => set({ hasConsented }),
}));
