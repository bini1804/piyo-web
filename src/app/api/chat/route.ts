import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils";
import { getMockResponse } from "@/lib/mock-data";
import type { PiyoChatRequest, PiyoChatResponse } from "@/types";

/**
 * Vercel: 플랜별 상한이 적용됩니다 (Hobby ≈ 10초, Pro 최대 60초 등).
 * LLM이 그보다 오래 걸리면 배포 환경에서만 계속 타임아웃·502가 날 수 있습니다.
 * 로컬 `next dev` / 자체 호스팅(Railway Docker 등)에서는 제한이 덜합니다.
 */
export const maxDuration = 60;

function normalizePiyoBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
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

    const isMock =
      process.env.MOCK_MODE === "true" ||
      process.env.NEXT_PUBLIC_MOCK_MODE === "true";

    if (isMock) {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
      const mock = getMockResponse(body.query);
      return NextResponse.json(mock, {
        headers: { "X-RateLimit-Remaining": String(remaining) },
      });
    }

    const rawUrl = process.env.PIYO_API_URL;
    if (!rawUrl?.trim()) {
      return NextResponse.json(
        {
          error:
            "백엔드 주소(PIYO_API_URL)가 설정되지 않았습니다. .env.local 또는 배포 환경 변수를 확인해주세요.",
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
              "피요 서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도하거나 MOCK_MODE=true로 로컬 테스트를 해보세요.",
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
    const answer = data["GPT 요약답변"];

    const allItems = gpt?.recommended_products ?? [];
    const products = allItems.filter((p) => p.type !== "시술");
    const procedures = allItems.filter((p) => p.type === "시술");

    return NextResponse.json(
      {
        answer: answer || "답변을 생성하지 못했어요.",
        metadata: {
          recommended_products: products,
          recommended_procedures: procedures,
          hospital_cards: gpt?.hospital_cards,
          score: gpt?.score,
          status: gpt?.status,
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
