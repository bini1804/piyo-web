import type { ProductDetail } from "@/types";

const PIYO_API = process.env.NEXT_PUBLIC_PIYO_API_URL;

function assertPiyoApi(): string {
  if (!PIYO_API?.trim()) {
    throw new Error("NEXT_PUBLIC_PIYO_API_URL is not configured");
  }
  return PIYO_API.replace(/\/$/, "");
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
  return res.json() as Promise<ProductDetail>;
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
  return res.json() as Promise<ProductDetail>;
}
