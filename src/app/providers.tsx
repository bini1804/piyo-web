"use client";

import type { Session } from "next-auth";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

interface AppSessionProviderProps {
  children: ReactNode;
  /** 서버에서 `auth()`로 주입 — 클라이언트 초기 `/api/auth/session` 대기로 인한 무한 로딩 방지 */
  session: Session | null;
}

export function AppSessionProvider({
  children,
  session,
}: AppSessionProviderProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false} session={session}>
      {children}
    </SessionProvider>
  );
}
