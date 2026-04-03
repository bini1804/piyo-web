import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";
import { auth } from "@/auth";
import { AppSessionProvider } from "./providers";

const piyoWordmark = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-piyo-wordmark",
  display: "swap",
});

export const metadata: Metadata = {
  title: "피요 — 나만의 AI 뷰티 컨시어지",
  description: "피부 타입과 고민에 맞는 맞춤형 스킨케어, 시술, 병원 추천. 피요가 도와드릴게요.",
  keywords: ["피부과", "시술 추천", "화장품 추천", "AI 뷰티", "피요", "YouAre365", "스킨케어"],
  openGraph: {
    title: "피요 — 나만의 AI 뷰티 컨시어지",
    description: "피부 고민, 피요에게 물어보세요.",
    url: "https://piyo.youare365.com",
    siteName: "Piyo by YouAre365",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "피요 — 나만의 AI 뷰티 컨시어지",
    description: "피부 고민, 피요에게 물어보세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="ko" className={piyoWordmark.variable} suppressHydrationWarning>
      <body className="min-h-dvh w-full antialiased bg-white text-[#1a1a1a] font-body">
        <AppSessionProvider session={session}>
          {children}
        </AppSessionProvider>
      </body>
    </html>
  );
}
