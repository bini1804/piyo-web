/**
 * 브라우저 없이 로컬 검증 (npm run dev 또는 start 후 실행)
 *
 * - [1] getAnonymousId: utils.ts에 anon_ + 8hex 패턴
 * - [2] usePiyoChat: session_id / history 요청 필드
 * - [3~4] /api/chat → 실 백엔드 응답
 * - [5] 새 세션: 다른 session_id + 빈 history
 *
 * 환경: VERIFY_BASE_URL (기본 http://localhost:3000)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function verifyStatic() {
  const utils = read("src/lib/utils.ts");
  if (!utils.includes("anon_") || !utils.includes('slice(0, 8)')) {
    throw new Error("[1] utils.ts: anon_ + UUID8 패턴이 없습니다.");
  }
  if (!utils.includes("localStorage") || utils.includes("sessionStorage.getItem(\"piyo_anonymous_id\")")) {
    throw new Error("[1] utils.ts: getAnonymousId는 localStorage를 사용해야 합니다.");
  }
  console.log("✓ [1] localStorage용 getAnonymousId: 코드상 anon_ + 8 hex");

  const hook = read("src/hooks/usePiyoChat.ts");
  if (!hook.includes("session_id:") || !hook.includes("history")) {
    throw new Error("[2] usePiyoChat.ts: session_id 또는 history 누락");
  }
  if (!hook.includes("startNewSession")) {
    throw new Error("[2] usePiyoChat.ts: startNewSession 누락");
  }
  console.log("✓ [2] usePiyoChat: session_id / history / startNewSession");

  const page = read("src/app/page.tsx");
  if (!page.includes("startNewSession")) {
    throw new Error("[2] page.tsx: 새 대화 시 startNewSession 연동 확인");
  }
  console.log("✓ [2] page.tsx: 새 대화 → startNewSession");
}

const BASE = process.env.VERIFY_BASE_URL || "http://localhost:3000";

async function waitForServer(maxMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(3000) });
      if (r.ok || r.status === 200 || r.status === 304) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error(
    `${BASE} 에 연결할 수 없습니다. 다른 터미널에서 npm run dev 를 실행했는지 확인하세요.`
  );
}

async function postChat(body) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _parseError: true, raw: text.slice(0, 200) };
  }
  return { res, json };
}

async function main() {
  verifyStatic();

  console.log(`\n→ 서버 대기: ${BASE}`);
  await waitForServer();

  const anonUser = "anon_deadbeef";
  const sessionId = "a1b2c3d4";

  const baseBody = {
    user_id: anonUser,
    session_id: sessionId,
    history: [],
    age: 28,
    gender: "female",
    skin_type: "dry",
    concerns: ["건조함"],
  };

  if (!anonUser.startsWith("anon_")) {
    throw new Error("user_id는 anon_ 로 시작해야 백엔드에서 익명 처리됩니다.");
  }

  const q1 = "건성 피부 세럼 추천해줘";
  console.log(`\n→ [3] 실 API/프록시: query="${q1.slice(0, 20)}..."`);
  const { res: r1, json: j1 } = await postChat({ ...baseBody, query: q1 });
  if (!r1.ok) {
    console.error("응답:", j1);
    throw new Error(`[3] 첫 요청 실패 HTTP ${r1.status}`);
  }
  if (!j1.answer || typeof j1.answer !== "string") {
    throw new Error("[3] 응답에 answer 문자열 없음");
  }
  console.log(`✓ [3] HTTP ${r1.status}, answer ${j1.answer.length}자`);

  const sample = "피요예요 🐥";
  if (j1.answer.includes(sample)) {
    console.log("  (참고) 답변에 샘플 문구 포함 — 실 API여도 동일 표현 가능");
  }

  console.log("\n→ [4] 멀티턴: history에 이전 user/assistant 포함");
  const history = [
    { role: "user", content: "나 건성 피부야" },
    { role: "assistant", content: j1.answer.slice(0, 800) },
  ];
  const { res: r2, json: j2 } = await postChat({
    ...baseBody,
    query: "어떤 세럼이 좋아?",
    history,
  });
  if (!r2.ok) {
    console.error(j2);
    throw new Error(`[4] 두 번째 요청 실패 HTTP ${r2.status}`);
  }
  if (!j2.answer) throw new Error("[4] 두 번째 응답 answer 없음");
  console.log(`✓ [4] HTTP ${r2.status}, history 길이 ${history.length} 반영 요청 성공`);

  console.log("\n→ [5] 새 대화: 다른 session_id + history []");
  const { res: r3, json: j3 } = await postChat({
    ...baseBody,
    session_id: "f0e0d0c0",
    history: [],
    query: "안녕",
  });
  if (!r3.ok) {
    console.error(j3);
    throw new Error(`[5] 새 세션 요청 실패 HTTP ${r3.status}`);
  }
  console.log(`✓ [5] HTTP ${r3.status}, 새 session_id + 빈 history`);

  console.log(
    "\n========== 자동 검증 완료 ==========\n" +
      "브라우저 수동 확인: Application → Local Storage → piyo_anonymous_id 가 anon_ 로 시작하는지,\n" +
      "Network → /api/chat Payload에 session_id·history 포함 여부."
  );
}

main().catch((e) => {
  console.error("\n검증 실패:", e.message || e);
  process.exit(1);
});
