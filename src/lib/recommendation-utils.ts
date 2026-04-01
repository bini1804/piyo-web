import type { RecommendedProduct } from "@/types";

/** 백엔드 RecommendationItem.type 은 주로 "시술" | "화장품" | "홈케어". 프로/웹 안전 분류. */
export function isProcedureRecommendation(
  p: Pick<RecommendedProduct, "type">
): boolean {
  const t = (p.type ?? "").trim();
  if (!t) return false;
  const tl = t.toLowerCase();
  return t === "시술" || tl === "procedure";
}

export function splitRecommendationsByKind(items: RecommendedProduct[]): {
  procedures: RecommendedProduct[];
  products: RecommendedProduct[];
} {
  const procedures = items.filter(isProcedureRecommendation);
  const products = items.filter((x) => !isProcedureRecommendation(x));
  return { procedures, products };
}
