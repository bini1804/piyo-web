import type { ProductDetail } from "@/types";

// Server Component에서도 동작하도록 PIYO_API_URL(서버 전용) 폴백
const PIYO_API =
  process.env.NEXT_PUBLIC_PIYO_API_URL ?? process.env.PIYO_API_URL;

function assertPiyoApi(): string {
  if (!PIYO_API?.trim()) {
    throw new Error("NEXT_PUBLIC_PIYO_API_URL is not configured");
  }
  return PIYO_API.replace(/\/$/, "");
}

/** FastAPI는 { key, type, data } 형태로 반환. ProductDetail은 평면 구조. */
type PiyoDetailEnvelope = {
  key?: string;
  type?: string;
  data?: Record<string, unknown>;
};

function toNum(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.replace(/,/g, ""));
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

function pickLink(d: Record<string, unknown>): string | undefined {
  const link = String(d.link ?? "").trim();
  if (link.startsWith("http")) return link;
  const origin = String(d.origin ?? "").trim();
  if (origin.startsWith("http")) return origin;
  return undefined;
}

export function normalizeCosmeticDetail(
  raw: PiyoDetailEnvelope,
  fallbackKey: string
): ProductDetail {
  const key = String(raw.key ?? fallbackKey);
  const d = raw.data ?? {};
  return {
    key,
    name: String(d.name ?? ""),
    type: "화장품",
    category: String(d.category_name ?? ""),
    price: toNum(d.price),
    brand: undefined,
    description: String(d.hashtags ?? "").trim() || undefined,
    guide: String(d.guide ?? "").trim() || undefined,
    link: pickLink(d),
    full_ingredients: String(d.full_ingredients ?? "").trim() || undefined,
    caution: undefined,
  };
}

export function normalizeProcedureDetail(
  raw: PiyoDetailEnvelope,
  fallbackKey: string
): ProductDetail {
  const key = String(raw.key ?? fallbackKey);
  const d = raw.data ?? {};
  const pain = d.pain_level;
  const gradeRaw = String(d.grade ?? "").trim();
  return {
    key,
    name: String(d.name ?? ""),
    type: "시술",
    category: String(d.category_name ?? ""),
    grade: gradeRaw || undefined,
    price: toNum(d.price),
    brand: undefined,
    description: String(d.description ?? "").trim() || undefined,
    guide: undefined,
    link: pickLink(d),
    full_ingredients: undefined,
    caution: String(d.caution ?? "").trim() || undefined,
    duration_time: String(d.duration_time ?? "").trim() || undefined,
    cycle_frequency: String(d.cycle_frequency ?? "").trim() || undefined,
    effect_duration: String(d.effect_duration ?? "").trim() || undefined,
    pain_level: pain != null && String(pain).trim() ? String(pain) : undefined,
    recovery_period: String(d.recovery_period ?? "").trim() || undefined,
    anesthesia: String(d.anesthesia ?? "").trim() || undefined,
  };
}

export async function fetchProductDetail(key: string): Promise<ProductDetail> {
  const base = assertPiyoApi();
  const encoded = encodeURIComponent(key);
  const res = await fetch(`${base}/product/${encoded}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Product not found: ${key}`);
  }
  const raw = (await res.json()) as PiyoDetailEnvelope;
  return normalizeCosmeticDetail(raw, key);
}

export async function fetchProcedureDetail(key: string): Promise<ProductDetail> {
  const base = assertPiyoApi();
  const encoded = encodeURIComponent(key);
  const res = await fetch(`${base}/procedure/${encoded}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Procedure not found: ${key}`);
  }
  const raw = (await res.json()) as PiyoDetailEnvelope;
  return normalizeProcedureDetail(raw, key);
}
