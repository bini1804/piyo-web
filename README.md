# 🐥 Piyo Web — AI 뷰티 컨시어지

> `piyo.youare365.com` · Next.js 15 + TypeScript + Tailwind CSS

## Quick Start

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# PIYO_API_URL 또는 NEXT_PUBLIC_PIYO_API_URL 에 FastAPI 베이스(URL, 예: http://localhost:8512)

# 3. 개발 서버
npm run dev
```

## Architecture

```
Browser → Next.js (Vercel)
           ├─ /api/chat      → Piyo Backend POST /chat/v2
           ├─ /api/auth/[..] → NextAuth v5 (JWT)
           └─ Supabase        → 순수 DB (Auth 미사용)
```

**핵심 결정사항:**
- **Supabase Auth 미사용** — NextAuth v5가 인증 담당, Supabase는 순수 DB
- **RLS 미사용** — API Route에서 service_role + 세션 검증으로 접근 제어
- **`/api/chat`** — `PIYO_API_URL` 우선, 없으면 `NEXT_PUBLIC_PIYO_API_URL`로 피요 서버 프록시

## Project Structure (34 files)

```
piyo-web/
├── src/
│   ├── app/
│   │   ├── page.tsx                          ← 메인 챗 페이지
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── chat/route.ts                 ← 피요 백엔드 프록시 + Rate Limit + Mock
│   │       └── auth/[...nextauth]/route.ts   ← NextAuth v5
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInput.tsx       ← 자동 리사이즈 입력
│   │   │   ├── MessageBubble.tsx   ← 마크다운 + 카드
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── WelcomeScreen.tsx   ← 빈 상태 + 추천 칩
│   │   ├── layout/
│   │   │   ├── ChatSidebar.tsx     ← Claude.ai 스타일
│   │   │   └── ChatHeader.tsx
│   │   ├── onboarding/
│   │   │   ├── ConsentModal.tsx    ← 개인정보 동의
│   │   │   └── SurveyModal.tsx     ← 4단계 피부 설문
│   │   ├── cards/
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProcedureCard.tsx
│   │   └── ui/
│   │       ├── PiyoLogo.tsx
│   │       └── PiyoAvatar.tsx
│   ├── hooks/
│   │   └── usePiyoChat.ts         ← API 통신 훅
│   ├── stores/
│   │   └── index.ts               ← Zustand (chat, survey, consent)
│   ├── lib/
│   │   ├── auth.ts                ← NextAuth v5 config
│   │   ├── supabase.ts            ← DB client (browser + admin)
│   │   ├── utils.ts               ← cn, UUID, rate limiter
│   │   └── …                      ← media-url, recommendation-utils 등
│   ├── types/index.ts
│   ├── i18n/
│   │   ├── ko.ts
│   │   └── en.ts
│   └── styles/globals.css
├── supabase/migrations/001_initial_schema.sql
├── package.json (next-auth 5.0.0-beta.25)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .env.example
└── .gitignore
```

## Onboarding Flow

```
첫 방문 → 개인정보 동의 (필수)
        → 설문 (선택) → 4단계
        → 챗 시작
```

## Security

- API 키: 서버사이드 전용 (`PIYO_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Rate Limit: IP당 30req/min
- 비로그인: 익명 UUID (sessionStorage), 새로고침 시 초기화
- 개인정보 동의 없으면 데이터 저장 X

## TODO (Phase 2)

- [ ] NextAuth 세션 → 사이드바 히스토리 연동
- [ ] Supabase에 메시지 저장 (로그인 유저)
- [ ] 익명→로그인 세션 병합 (piyo_merge_anonymous)
- [ ] 병원 카드 UI (UI 2.0 후)
- [ ] memory_agent 연동
- [ ] i18n 라우팅 (next-intl)
- [ ] 영어 버전 MVP
