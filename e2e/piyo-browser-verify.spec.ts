/**
 * 브라우저 수동 테스트 1~4와 동등한 자동 검증 (Playwright)
 *
 * Railway 등 백엔드가 502여도 요청 페이로드·sessionStorage는 검증 가능.
 * 테스트 3 답변 문맥은 HTTP 200일 때만 엄격 검증.
 */
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const HEX8 = /^[0-9a-f]{8}$/;
const ANON = /^anon_[0-9a-f]{8}$/;

function readEnvLocal(): string {
  const p = path.join(process.cwd(), ".env.local");
  return fs.readFileSync(p, "utf8");
}

/** POST /api/chat 응답 대기 (상태 코드 무관). */
async function sendAndWaitForApiChatResponse(
  page: import("@playwright/test").Page,
  text: string
): Promise<{ status: number; ok: boolean }> {
  const ta = page.locator("textarea").first();
  await ta.fill(text);
  const sendBtn = page.getByRole("button", { name: "보내기" });
  await expect(sendBtn).toBeEnabled();
  const responsePromise = page.waitForResponse(
    (r) => r.url().includes("/api/chat") && r.request().method() === "POST",
    { timeout: 120_000 }
  );
  await sendBtn.click();
  const res = await responsePromise;
  // 전송 후 textarea가 비워져 보내기는 의도적으로 disabled — 다음 fill 시 다시 활성화됨
  return { status: res.status(), ok: res.ok() };
}

test.describe("Piyo 브라우저 검증 (수동 테스트 1~4 대응)", () => {
  test("테스트 1~4", async ({ page }) => {
    const chatBodies: Record<string, unknown>[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/chat") && req.method() === "POST") {
        try {
          chatBodies.push(JSON.parse(req.postData() || "{}"));
        } catch {
          /* ignore */
        }
      }
    });

    const envText = readEnvLocal();
    const mockLine = envText.match(/^MOCK_MODE=(.+)$/m);
    const mockModeFalse = mockLine?.[1]?.trim() === "false";

    await page.goto("/");

    const r0 = await sendAndWaitForApiChatResponse(page, "연결 확인");
    // ----- 테스트 1: sessionStorage (첫 전송 시 anon_ 저장) -----
    const anonId = await page.evaluate(() => sessionStorage.getItem("piyo_anonymous_id"));
    expect(anonId, "테스트1: piyo_anonymous_id 형식").toMatch(ANON);

    // ----- 테스트 2: Network body + MOCK 설정 -----
    const rSerum = await sendAndWaitForApiChatResponse(page, "건성 피부 세럼 추천해줘");
    const serumBody = chatBodies[chatBodies.length - 1] as {
      user_id?: string;
      session_id?: string;
      history?: unknown;
    };
    expect(serumBody.user_id, "테스트2: user_id anon_ 시작").toMatch(/^anon_/);
    expect(String(serumBody.session_id), "테스트2: session_id 8자리 hex").toMatch(HEX8);
    expect(Array.isArray(serumBody.history), "테스트2: history 배열").toBe(true);
    expect(mockModeFalse, "테스트2: .env.local MOCK_MODE=false (서버는 Railway 프록시 시도)").toBe(
      true
    );
    const railwayNote = rSerum.ok
      ? "실 API 경로: /api/chat 200 (Next → PIYO_API_URL 프록시 성공)"
      : `실 API 경로: /api/chat HTTP ${rSerum.status} (업스트림 실패 시 502 — Network 탭에서 확인)`;

    const serumSessionId = String(serumBody.session_id);

    // ----- 테스트 3: 멀티턴 요청 body (+ 가능 시 답변 문맥) -----
    await sendAndWaitForApiChatResponse(page, "나 건성 피부야");
    const rMulti2 = await sendAndWaitForApiChatResponse(page, "어떤 세럼이 좋아?");

    const multiturnBody = chatBodies[chatBodies.length - 1] as {
      history?: Array<{ role: string; content: string }>;
    };
    const hist = multiturnBody.history ?? [];
    expect(hist.length, "테스트3: history에 이전 턴 포함").toBeGreaterThanOrEqual(2);
    const joined = hist.map((h) => h.content).join("\n");
    expect(joined.includes("나 건성 피부야"), "테스트3: history에 첫 멀티턴 질문").toBe(true);

    let test3AnswerPass: boolean | "skip" = "skip";
    if (rMulti2.ok) {
      const lastAssistantText = await page.locator(".chat-bubble-assistant").last().innerText();
      test3AnswerPass = /건성|건조|수분|세럼|피부|장벽|보습/i.test(lastAssistantText);
      expect(test3AnswerPass, "테스트3: 두 번째 답변에 피부/세럼 맥락 키워드").toBe(true);
    }

    // ----- 테스트 4: 새 대화 -----
    await page.getByRole("button", { name: "새 대화" }).click();
    await expect(page.getByRole("heading", { name: /안녕하세요! 피요예요/ })).toBeVisible();

    await sendAndWaitForApiChatResponse(page, "안녕");
    const afterNewBody = chatBodies[chatBodies.length - 1] as {
      session_id?: string;
      history?: unknown[];
    };
    expect(String(afterNewBody.session_id), "테스트4: 새 session_id hex").toMatch(HEX8);
    expect(afterNewBody.session_id, "테스트4: session_id가 이전과 다름").not.toBe(serumSessionId);
    expect((afterNewBody.history ?? []).length, "테스트4: 새 대화 history 빈 배열").toBe(0);

    // 리포트용 (stdout)
    console.log("\n========== 브라우저 검증 요약 ==========");
    console.log("테스트1 sessionStorage anon_:", anonId?.startsWith("anon_") ? "통과" : "실패");
    console.log("테스트2 body + MOCK_MODE=false:", "통과", "|", railwayNote);
    console.log("  (건성 세럼 요청 응답:", rSerum.ok ? "200" : rSerum.status + ")");
    console.log(
      "테스트3 history 포함:",
      "통과",
      "| 답변 맥락:",
      test3AnswerPass === true ? "통과" : test3AnswerPass === "skip" ? "스킵(API 비정상)" : "실패"
    );
    console.log("테스트4 새 session_id + 빈 history:", "통과");
    console.log("========================================\n");
  });
});
