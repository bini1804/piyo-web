/**
 * Piyo 유저/설문 API — server-side & edge 전용
 *
 * 환경 변수:
 *  - PIYO_API_URL        : 서버/엣지 런타임 (API routes, middleware, auth.ts)
 *  - NEXT_PUBLIC_PIYO_API_URL : 클라이언트에서 직접 호출할 때 (product.ts 패턴)
 *
 * 클라이언트 컴포넌트에서는 src/lib/actions/piyo.ts 서버 액션을 사용하세요.
 */

function getPiyoBase(): string {
  // Edge/서버에서는 PIYO_API_URL, 클라이언트 번들에서는 NEXT_PUBLIC_PIYO_API_URL
  const url =
    process.env.PIYO_API_URL ?? process.env.NEXT_PUBLIC_PIYO_API_URL;
  if (!url?.trim()) {
    throw new Error(
      "PIYO_API_URL (또는 NEXT_PUBLIC_PIYO_API_URL)이 설정되지 않았습니다."
    );
  }
  return url.replace(/\/$/, "");
}

function getPiyoHeaders(): HeadersInit {
  const key = process.env.PIYO_API_KEY ?? "";
  return {
    "Content-Type": "application/json",
    ...(key && { Authorization: `Bearer ${key}` }),
  };
}

export type PiyoUserProfile = {
  piyo_user_id: string;
  nickname: string | null;
  provider: string | null;
};

/** RDS에 저장된 nickname·provider 조회 (재방문·새 브라우저) */
export async function getUserProfile(
  piyo_user_id: string
): Promise<PiyoUserProfile> {
  const base = getPiyoBase();
  const res = await fetch(
    `${base}/users/profile?user_id=${encodeURIComponent(piyo_user_id)}`,
    { cache: "no-store", headers: getPiyoHeaders() }
  );
  if (!res.ok) {
    throw new Error(`getUserProfile failed: ${res.status}`);
  }
  return res.json() as Promise<PiyoUserProfile>;
}

/** 이메일로 기존 piyo_user_id 조회 — 소셜 로그인 통합용 */
export async function findUserByEmail(
  email: string
): Promise<string | null> {
  const base = getPiyoBase();
  const res = await fetch(
    `${base}/users/find-by-email?email=${encodeURIComponent(email)}`,
    { cache: "no-store", headers: getPiyoHeaders() }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { piyo_user_id: string | null };
  return data.piyo_user_id ?? null;
}

/** 로그인 성공 시 유저 등록/갱신 */
export async function upsertUser(
  piyo_user_id: string,
  provider: string,
  nickname: string | null,
  email?: string | null
): Promise<{ ok: boolean }> {
  const base = getPiyoBase();
  const res = await fetch(`${base}/users/upsert`, {
    method: "POST",
    headers: getPiyoHeaders(),
    body: JSON.stringify({ piyo_user_id, provider, nickname, email: email ?? null }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`upsertUser failed: ${res.status}`);
  }
  return res.json() as Promise<{ ok: boolean }>;
}

/** 설문 완료 시 피부 데이터 저장 */
export async function saveSurvey(
  piyo_user_id: string,
  surveyData: {
    skin_type: string;
    skin_intensity?: number;
    skin_sensitivity?: number;
    concerns: string[];
    gender?: string;
    age?: number;
    is_pregnant?: boolean;
  }
): Promise<{ ok: boolean }> {
  const base = getPiyoBase();
  const res = await fetch(`${base}/surveys/save`, {
    method: "POST",
    headers: getPiyoHeaders(),
    body: JSON.stringify({ piyo_user_id, ...surveyData }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`saveSurvey failed: ${res.status}`);
  }
  return res.json() as Promise<{ ok: boolean }>;
}

/** 설문 피부 데이터 조회 — 로그인 시 surveyStore 동기화용 */
export async function getSurveyData(piyo_user_id: string): Promise<{
  skin_type: string | null;
  skin_intensity: number | null;
  skin_sensitivity: number | null;
  concerns: string[];
  gender: string | null;
  age: number | null;
  is_pregnant: boolean | null;
} | null> {
  const base = getPiyoBase();
  try {
    const res = await fetch(
      `${base}/surveys/data?user_id=${encodeURIComponent(piyo_user_id)}`,
      { cache: "no-store", headers: getPiyoHeaders() }
    );
    if (!res.ok) return null;
    return res.json() as Promise<{
      skin_type: string | null;
      skin_intensity: number | null;
      skin_sensitivity: number | null;
      concerns: string[];
      gender: string | null;
      age: number | null;
      is_pregnant: boolean | null;
    }>;
  } catch {
    return null;
  }
}

/** 설문 완료 여부 확인 — middleware에서 호출 */
export async function checkSurvey(piyo_user_id: string): Promise<boolean> {
  const base = getPiyoBase();
  try {
    const res = await fetch(
      `${base}/surveys/check?user_id=${encodeURIComponent(piyo_user_id)}`,
      { cache: "no-store", headers: getPiyoHeaders() }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { completed: boolean };
    return data.completed === true;
  } catch {
    // API 호출 실패 시 통과 (안전 방향)
    return true;
  }
}

// ── 채팅 세션 저장/조회/삭제 ──────────────────────────────

export interface ChatSessionItem {
  session_id: string;
  title: string | null;
  messages: unknown[];
  message_count: number;
  has_feedback: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export async function saveChatSession(params: {
  piyo_user_id: string;
  session_id: string;
  title: string | null;
  messages: unknown[];
  has_feedback: boolean;
}): Promise<{ ok: boolean }> {
  const base = getPiyoBase();
  const res = await fetch(`${base}/chat-sessions/save`, {
    method: "POST",
    headers: getPiyoHeaders(),
    body: JSON.stringify(params),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`saveChatSession failed: ${res.status}`);
  return res.json() as Promise<{ ok: boolean }>;
}

export async function getChatSessions(
  piyo_user_id: string
): Promise<ChatSessionItem[]> {
  const base = getPiyoBase();
  const res = await fetch(
    `${base}/chat-sessions/list?user_id=${encodeURIComponent(piyo_user_id)}`,
    { cache: "no-store", headers: getPiyoHeaders() }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { sessions: ChatSessionItem[] };
  return data.sessions ?? [];
}

export async function deleteChatSession(
  piyo_user_id: string,
  session_id: string
): Promise<{ ok: boolean }> {
  const base = getPiyoBase();
  const res = await fetch(
    `${base}/chat-sessions/${encodeURIComponent(session_id)}?user_id=${encodeURIComponent(piyo_user_id)}`,
    { method: "DELETE", cache: "no-store", headers: getPiyoHeaders() }
  );
  if (!res.ok) throw new Error(`deleteChatSession failed: ${res.status}`);
  return res.json() as Promise<{ ok: boolean }>;
}
