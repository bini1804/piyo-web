import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import { upsertUser, findUserByEmail } from "@/lib/api/user";

function buildPiyoUserId(provider: string, providerAccountId: string): string {
  return `${provider}_${providerAccountId}`;
}

/** Kakao / Naver 프로필에서 이메일 추출 (OAuth 응답 형태 분기) */
function profileEmailFromOAuth(profile: unknown): string | null {
  if (!profile || typeof profile !== "object") return null;
  const p = profile as Record<string, unknown>;
  if (typeof p.email === "string") return p.email;
  const kakao = p.kakao_account;
  if (kakao && typeof kakao === "object") {
    const email = (kakao as Record<string, unknown>).email;
    if (typeof email === "string") return email;
  }
  const response = p.response;
  if (response && typeof response === "object") {
    const email = (response as Record<string, unknown>).email;
    if (typeof email === "string") return email;
  }
  return null;
}

function profileNameFromOAuth(profile: unknown): string | null {
  if (!profile || typeof profile !== "object") return null;
  const p = profile as Record<string, unknown>;
  if (typeof p.name === "string") return p.name;
  const kakao = p.kakao_account;
  if (kakao && typeof kakao === "object") {
    const prof = (kakao as Record<string, unknown>).profile;
    if (prof && typeof prof === "object") {
      const nick = (prof as Record<string, unknown>).nickname;
      if (typeof nick === "string") return nick;
    }
  }
  const response = p.response;
  if (response && typeof response === "object") {
    const name = (response as Record<string, unknown>).name;
    if (typeof name === "string") return name;
  }
  return null;
}

const providers: NextAuthConfig["providers"] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (process.env.AUTH_KAKAO_ID && process.env.AUTH_KAKAO_SECRET) {
  providers.push(
    Kakao({
      clientId: process.env.AUTH_KAKAO_ID,
      clientSecret: process.env.AUTH_KAKAO_SECRET,
    })
  );
}

if (process.env.AUTH_NAVER_ID && process.env.AUTH_NAVER_SECRET) {
  providers.push(
    Naver({
      clientId: process.env.AUTH_NAVER_ID,
      clientSecret: process.env.AUTH_NAVER_SECRET,
    })
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  session: { strategy: "jwt" },
  /** 요청 Host 기반 URL 신뢰 — 로컬/프록시에서 콜백·리디렉트 baseUrl 오류 방지 */
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    /**
     * 로그인 완료 후 이동: signIn()의 callbackUrl(예: "/")만 허용.
     * 상대 경로는 현재 origin에 붙이고, 타 오리진은 무시하고 홈으로 폴백.
     */
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch {
        /* invalid url */
      }
      return baseUrl;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const provider = account.provider;
        const providerAccountId = account.providerAccountId;

        const fromProfileEmail = profileEmailFromOAuth(profile);
        const email = (token.email as string | undefined) ?? fromProfileEmail ?? null;
        token.email = email;

        const fromProfileName = profileNameFromOAuth(profile);
        token.name =
          (token.name as string | undefined) ?? fromProfileName ?? null;

        // 이메일 기반 계정 통합: 같은 이메일로 다른 소셜 로그인 시 기존 ID 재사용
        let piyoUserId = buildPiyoUserId(provider, providerAccountId);
        if (email) {
          try {
            const existingId = await findUserByEmail(email);
            if (existingId) {
              piyoUserId = existingId;
            }
          } catch (e) {
            console.error("[auth] findUserByEmail failed:", e);
          }
        }

        token.piyo_user_id = piyoUserId;
        token.provider = provider;
        token.provider_id = providerAccountId;

        // Piyo 백엔드에 유저 등록/갱신 (nickname은 설문 시 별도 업데이트)
        try {
          await upsertUser(piyoUserId, provider, null, email);
        } catch (e) {
          console.error("[auth] upsertUser failed:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.piyo_user_id = token.piyo_user_id as string;
        session.user.provider = token.provider as string;
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
