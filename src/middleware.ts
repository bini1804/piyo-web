import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 개발 모드에서 브라우저·프록시가 문서를 캐시하지 않도록 해,
 * 저장 후 새로고침(F5) 시 최신 번들·RSC가 바로 반영되게 합니다.
 * (_next 정적 청크는 제외 — HMR·청크 로딩은 Next 기본 동작 유지)
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );
  return res;
}

export const config = {
  matcher: "/:path*",
};
