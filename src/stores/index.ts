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
  saveCurrentSession: () => void;
  loadSession: (sessionId: string) => void;
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

      loadSession: (sessionId: string) => {
        const sess = get().sessions.find((x) => x.id === sessionId);
        if (!sess) return;
        const mobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        set({
          currentSessionId: sessionId,
          messages: sess.messages.map((m) => ({ ...m })),
          ...(mobile ? { isSidebarOpen: false } : {}),
        });
      },
    }),
    {
      name: "piyo-chat-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        messages: state.messages,
      }),
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
  reset: () => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  data: {},
  isCompleted: false,
  setField: (key, value) =>
    set((s) => ({ data: { ...s.data, [key]: value } })),
  setData: (data) => set({ data }),
  setCompleted: (isCompleted) => set({ isCompleted }),
  reset: () => set({ data: {}, isCompleted: false }),
}));

// ---- Consent Store ----
interface ConsentState {
  hasConsented: boolean;
  setConsented: (b: boolean) => void;
}

export const useConsentStore = create<ConsentState>((set) => ({
  hasConsented: false,
  setConsented: (hasConsented) => set({ hasConsented }),
}));
