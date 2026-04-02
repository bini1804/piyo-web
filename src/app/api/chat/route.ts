import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils";
import {
  enrichRecommendationKeyFromScore,
  normalizeRecommendedProduct,
} from "@/lib/normalize-recommended-product";
import { splitRecommendationsByKind } from "@/lib/recommendation-utils";
import type { PiyoChatRequest, PiyoChatResponse } from "@/types";

/**
 * 백엔드 응답 마크다운 정규화 — 실측 패턴 기반 v3
 *
 * 확인된 패턴:
 * A. "문장. ### 제목"     → 공백/\n으로 ### 이어붙음
 * B. "문장. - **항목**"   → 공백/\n으로 - bullet 이어붙음
 * C. "### 제목\n**본문**" → ### 뒤 \n 하나만 있고 본문 시작
 *
 * 제거된 패턴 (오탐 원인):
 * X. 번호 리스트(\d+[\)\.]) 정규식 — **굵은텍스트** 앞 숫자를
 *    번호로 오인식해서 1. 1. 중복 생성하는 버그 유발 → 제거
 */
function normalizeMarkdown(text: string): string {
  return text
    // 1. ### 앞 정규화
    //    공백/탭/\n 조합으로 붙은 ### → \n\n### 로 통일
    .replace(/[ \t]*\n?[ \t]*(#{1,3} )/g, "\n\n$1")
    // 2. ### 뒤 \n 하나만 있을 때 → \n\n 으로 보강
    //    "### 제목\n**본문**" → "### 제목\n\n**본문**"
    .replace(/(#{1,3} [^\n]+)\n([^\n])/g, "$1\n\n$2")
    // 3. - bullet 앞 정규화
    //    공백/탭/\n 조합으로 붙은 - → \n\n- 로 통일
    .replace(/([^\n])[ \t]*\n?[ \t]*(- )/g, "$1\n\n$2")
    // 4. 연속 빈 줄 3개 이상 → 2개로 압축
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Vercel: 플랜별 상한이 적용됩니다 (Hobby ≈ 10초, Pro 최대 60초 등).
 * LLM이 그보다 오래 걸리면 배포 환경에서만 계속 타임아웃·502가 날 수 있습니다.
 * 로컬 `next dev` / 자체 호스팅(Railway Docker 등)에서는 제한이 덜합니다.
 */
export const maxDuration = 60;

function normalizePiyoBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

/** 서버 라우트: PIYO_API_URL 우선, 없으면 NEXT_PUBLIC_PIYO_API_URL (로컬 .env.local 공통 패턴). */
function getPiyoApiUrlFromEnv(): string {
  const a = (process.env.PIYO_API_URL ?? "").trim();
  if (a) return a;
  return (process.env.NEXT_PUBLIC_PIYO_API_URL ?? "").trim();
}

function isAbortError(e: unknown): boolean {
  return (
    e instanceof Error &&
    (e.name === "AbortError" || e.message.includes("aborted"))
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed, remaining } = checkRateLimit(
      ip,
      Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
      Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    let body: PiyoChatRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "요청 본문이 올바른 JSON이 아닙니다." },
        { status: 400 }
      );
    }

    if (!body.query?.trim()) {
      return NextResponse.json(
        { error: "메시지를 입력해주세요." },
        { status: 400 }
      );
    }

    const rawUrl = getPiyoApiUrlFromEnv();
    if (!rawUrl) {
      return NextResponse.json(
        {
          error:
            "백엔드 주소가 설정되지 않았습니다. .env.local에 PIYO_API_URL 또는 NEXT_PUBLIC_PIYO_API_URL(예: http://localhost:8512)을 설정하세요.",
        },
        { status: 500 }
      );
    }

    const piyoUrl = normalizePiyoBaseUrl(rawUrl);
    const target = `${piyoUrl}/chat/v2`;
    const timeoutMs = Number(process.env.PIYO_FETCH_TIMEOUT_MS) || 110_000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let piyoRes: Response;
    try {
      piyoRes = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.PIYO_API_KEY && {
            Authorization: `Bearer ${process.env.PIYO_API_KEY}`,
          }),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e) {
      if (isAbortError(e)) {
        console.error("Piyo API timeout:", target, timeoutMs);
        return NextResponse.json(
          {
            error:
              "피요 서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
          },
          { status: 504 }
        );
      }
      console.error("Piyo API fetch failed:", e);
      return NextResponse.json(
        {
          error:
            "피요 서버에 연결할 수 없습니다. PIYO_API_URL, 방화벽, VPN을 확인해주세요.",
        },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const responseText = await piyoRes.text();

    if (!piyoRes.ok) {
      console.error(
        "Piyo API error:",
        piyoRes.status,
        responseText.slice(0, 2000)
      );
      return NextResponse.json(
        {
          error: `피요 서버 오류 (${piyoRes.status}). 잠시 후 다시 시도해주세요.`,
        },
        { status: 502 }
      );
    }

    let data: PiyoChatResponse;
    try {
      data = JSON.parse(responseText) as PiyoChatResponse;
    } catch {
      console.error(
        "Piyo API JSON parse error, body start:",
        responseText.slice(0, 500)
      );
      return NextResponse.json(
        { error: "피요 서버 응답을 해석하지 못했습니다." },
        { status: 502 }
      );
    }

    const gpt = data["GPT 답변"];
    const rawAnswer = data["GPT 요약답변"] ?? "";
    const answer = normalizeMarkdown(rawAnswer);

    const scoreRaw = gpt?.score as Record<string, unknown> | undefined;
    const allItems = (gpt?.recommended_products ?? [])
      .map(normalizeRecommendedProduct)
      .map((p) => enrichRecommendationKeyFromScore(p, scoreRaw));
    const { procedures, products } = splitRecommendationsByKind(allItems);
    const hasHosp = Boolean(
      gpt?.hospital_cards && Object.keys(gpt.hospital_cards).length > 0
    );
    if (gpt?.hospital_cards) {
      const firstKey = Object.keys(gpt.hospital_cards)[0];
      const firstHosp = gpt.hospital_cards[firstKey]?.[0];
      console.log("[route] hospital sample:", JSON.stringify(firstHosp));
    }

    return NextResponse.json(
      {
        answer: answer || "답변을 생성하지 못했어요.",
        metadata: {
          recommended_products: products,
          recommended_procedures: procedures,
          hospital_cards: gpt?.hospital_cards,
          score: gpt?.score,
          status: gpt?.status,
          show_procedure_cards:
            gpt?.show_procedure_cards === true || procedures.length > 0,
          show_product_cards:
            gpt?.show_product_cards === true || products.length > 0,
          show_hospital_cards:
            gpt?.show_hospital_cards === true || hasHosp,
          chat_log_id: data["chat_log_id"] ?? undefined,
          intent: gpt?.intent ?? undefined,
        },
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "알 수 없는 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
