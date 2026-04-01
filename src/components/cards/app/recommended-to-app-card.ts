import { resolveRdsMediaUrl } from "@/lib/media-url";
import { isProcedureRecommendation } from "@/lib/recommendation-utils";
import type { RecommendedProduct } from "@/types";

export function detailPathForRecommendation(
  p: RecommendedProduct
): string | undefined {
  const key = p.key?.trim();
  if (!key) return undefined;
  const enc = encodeURIComponent(key);
  return isProcedureRecommendation(p) ? `/procedure/${enc}` : `/product/${enc}`;
}

/** 앱 챗봇 카드 description — 해시태그 → 카테고리 → 추천 이유 */
export function descriptionForAppProductCard(p: RecommendedProduct): string {
  const h = (p.hashtags ?? "").trim();
  if (h) return h;
  const c = (p.category ?? "").trim();
  if (c) return c;
  return (p.reason ?? "").trim();
}

export function imageUrlForAppCard(p: RecommendedProduct): string {
  return resolveRdsMediaUrl(p.image_url) || "";
}

/** 가격 미수급 시에도 PriceDisplay가 priceInfo만 표시할 수 있도록 */
export function priceForAppCard(
  p: RecommendedProduct
): number | string {
  if (p.price === undefined || p.price === null || p.price === "") return 0;
  return p.price;
}
