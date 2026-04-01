/** youare365_frontend `formatPrice` / `parseKoreanPrice` 이식 (웹 전용) */

export function formatPrice(price: string | number): string {
  if (typeof price === "string") return price;
  return new Intl.NumberFormat("ko-KR").format(Number(price));
}

export function parseKoreanPrice(priceStr: string): {
  mainPrice: string;
  unit: string | null;
} {
  const koreanUnitMatch = priceStr.match(/(.+?)([가-힣]+)$/);
  if (koreanUnitMatch) {
    return { mainPrice: koreanUnitMatch[1], unit: koreanUnitMatch[2] };
  }
  return { mainPrice: priceStr, unit: null };
}
