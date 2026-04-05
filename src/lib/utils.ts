import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import type { ChatSession } from "@/types";

/** Tailwind class merge */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** localStorage 키 — 비로그인 `user_id` (브라우저·기기 단위 유지) */
export const PIYO_ANONYMOUS_ID_KEY = "piyo_anonymous_id";

/**
 * 게스트 → 로그인 병합 1회용 마커(값 = 당시 anon id).
 * 병합 완료 후 즉시 제거해 재로그인 시 anon 대화 중복 병합을 막음.
 */
export const PIYO_ANON_PENDING_KEY = "piyo-anon-pending";

/** Generate or retrieve anonymous id (localStorage). Prefix `anon_` for backend is_anonymous_user(). */
export function getAnonymousId(): string {
  if (typeof window === "undefined")
    return `anon_${uuidv4().replace(/-/g, "").slice(0, 8)}`;
  const stored = localStorage.getItem(PIYO_ANONYMOUS_ID_KEY);
  if (stored) return stored;
  const id = `anon_${uuidv4().replace(/-/g, "").slice(0, 8)}`;
  localStorage.setItem(PIYO_ANONYMOUS_ID_KEY, id);
  return id;
}

/** Format relative time (Korean) */
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  if (hrs < 24) return `${hrs}시간 전`;
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

/** Truncate with ellipsis */
export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 1) + "…";
}

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** 사이드바 날짜 그룹 라벨 (오늘 / 어제 / 그 외) */
export function getSessionDayLabel(iso: string): string {
  const t = startOfDay(new Date());
  const y = startOfDay(new Date(Date.now() - 86400000));
  const d = startOfDay(new Date(iso));
  if (d === t) return "오늘";
  if (d === y) return "어제";
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

export interface SessionDayGroup {
  label: string;
  sessions: ChatSession[];
}

/** updatedAt 기준 최신순 후 라벨별 그룹 (오늘 → 어제 → 나머지 날짜) */
export function groupSessionsByDay(sessions: ChatSession[]): SessionDayGroup[] {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const labelOrder: string[] = [];
  const map = new Map<string, ChatSession[]>();
  for (const s of sorted) {
    const label = getSessionDayLabel(s.updatedAt);
    if (!map.has(label)) {
      map.set(label, []);
      labelOrder.push(label);
    }
    map.get(label)!.push(s);
  }
  return labelOrder.map((label) => ({ label, sessions: map.get(label)! }));
}

/** In-memory rate limiter (API Routes) */
const rlMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxReq = 30,
  windowMs = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rlMap.get(key);
  if (!entry || now > entry.resetAt) {
    rlMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxReq - 1 };
  }
  entry.count++;
  const rem = Math.max(0, maxReq - entry.count);
  return { allowed: entry.count <= maxReq, remaining: rem };
}
