import type { RecommendedProduct } from "@/types";

function extractKeyFromScoreEntry(entry: unknown): string | undefined {
  if (entry == null) return undefined;
  if (typeof entry === "string" || typeof entry === "number") {
    const s = String(entry).trim();
    return s || undefined;
  }
  if (typeof entry !== "object") return undefined;
  const o = entry as Record<string, unknown>;
  const raw = o.key ?? o.Key ?? o.ai_key ?? o.aiKey;
  if (raw == null) return undefined;
  const s = String(raw).trim();
  return s || undefined;
}

/**
 * 항목에 key가 비어 있을 때 GPT 답변의 score 맵(제품명 → { key })으로 보강.
 * 백엔드/프록시가 recommendation별 key는 아래 두고 items.key만 비우는 경우 대응.
 */
export function enrichRecommendationKeyFromScore(
  item: RecommendedProduct,
  score: Record<string, unknown> | undefined | null
): RecommendedProduct {
  if (item.key?.trim() || !score) return item;
  const rec = item.recommendation?.trim();
  if (!rec) return item;

  let entry: unknown = score[rec];
  if (entry === undefined) {
    const hit = Object.entries(score).find(([k]) => k.trim() === rec);
    entry = hit?.[1];
  }
  const key = extractKeyFromScoreEntry(entry);
  if (!key) return item;
  return { ...item, key };
}

/**
 * 피요 Python·스프링·프록시마다 snake_case / camelCase 혼용 가능.
 * 카드 UI는 RecommendedProduct 스키마로 통일한다.
 */
export function normalizeRecommendedProduct(
  raw: unknown
): RecommendedProduct {
  const r =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const str = (v: unknown): string | undefined => {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    return s || undefined;
  };

  const imageUrl =
    str(r.image_url) ??
    str(r.imageUrl) ??
    str(r["ImageUrl"]);

  const priceRaw = r.price ?? r.salePrice ?? r.sale_price;
  let price: number | string | null | undefined;
  if (priceRaw === undefined || priceRaw === null) price = undefined;
  else if (typeof priceRaw === "number" && Number.isFinite(priceRaw))
    price = priceRaw;
  else {
    const ps = String(priceRaw).replace(/,/g, "").trim();
    const n = Number(ps);
    price = ps && Number.isFinite(n) ? n : ps;
  }

  return {
    recommendation: str(r.recommendation) ?? "",
    type: str(r.type) ?? "화장품",
    key:
      str(r.key) ??
      str(r.ai_key) ??
      str(r.aiKey) ??
      str(r["Key"]),
    category: str(r.category) ?? "",
    concern: str(r.concern),
    reason: str(r.reason),
    grade: str(r.grade),
    image_url: imageUrl,
    hashtags: str(r.hashtags) ?? null,
    price: price ?? null,
    price_info:
      str(r.price_info) ?? str(r.priceInfo) ?? str(r["priceInfo"]) ?? null,
    price_unit:
      str(r.price_unit) ?? str(r.priceUnit) ?? str(r["priceUnit"]) ?? null,
  };
}
