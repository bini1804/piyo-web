import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const middleware = auth((request) => {
  const { pathname } = request.nextUrl;
  const token = request.auth; // auth() 결과

  // 로그인된 사용자는 /login에 머물지 않음
  if (pathname.startsWith("/login")) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 제외 경로 통과
  const EXCLUDED_PREFIXES = [
    "/survey",
    "/api/",
    "/privacy",
    "/terms",
    "/_next/",
    "/favicon",
    "/characters/",
  ];
  if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 비로그인 → 통과 (로그인 강제 안 함, 모달로 권유)
  if (!token) {
    return NextResponse.next();
  }

  // 설문 완료 쿠키 확인
  const surveyCookie = request.cookies.get("piyo-survey-done")?.value;
  if (surveyCookie === "1") {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
