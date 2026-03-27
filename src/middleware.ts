import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkSurvey } from "@/lib/api/user";

/**
 * 제외 경로 — 인증/설문 체크 없이 통과
 */
const EXCLUDED_PREFIXES = [
  "/survey",
  "/api/",
  "/privacy",
  "/terms",
  "/_next/",
  "/favicon",
];

function isExcluded(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Edge Runtime 호환 미들웨어
 *
 * 흐름:
 *  1. /login + JWT 있음 → "/" 리디렉션
 *  2. 제외 경로 → 통과
 *  3. 그 외 비로그인 → /login 리디렉션
 *  4. 로그인 + piyo-survey-done 쿠키 있음 → 통과 (API 호출 스킵)
 *  5. 로그인 + 쿠키 없음 → /surveys/check 호출
 *     - completed: true  → piyo-survey-done 쿠키 set + 통과
 *     - completed: false → /survey 리디렉션
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // 로그인된 사용자는 /login에 머물지 않음 (OAuth 직후·직접 접근 모두)
  if (pathname.startsWith("/login")) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 제외 경로 통과
  if (isExcluded(pathname)) {
    return NextResponse.next();
  }

  // 비로그인 → 로그인 페이지
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const piyo_user_id = token.piyo_user_id as string | undefined;

  // piyo_user_id 없으면 그냥 통과
  if (!piyo_user_id) {
    return NextResponse.next();
  }

  // 설문 완료 쿠키 캐싱 (매 요청마다 API 호출 방지)
  const surveyCookie = request.cookies.get("piyo-survey-done")?.value;
  if (surveyCookie === "1") {
    return NextResponse.next();
  }

  // 설문 완료 여부 확인
  const completed = await checkSurvey(piyo_user_id);

  if (!completed) {
    return NextResponse.redirect(new URL("/survey", request.url));
  }

  // 완료 → 쿠키 설정 후 통과 (24시간 캐싱)
  const res = NextResponse.next();
  res.cookies.set("piyo-survey-done", "1", {
    maxAge: 60 * 60 * 24,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
