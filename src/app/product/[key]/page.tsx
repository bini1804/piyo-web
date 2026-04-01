import { Suspense } from "react";
import { fetchProductDetail } from "@/lib/api/product";
import ProductDetail, {
  ProductDetailError,
  ProductDetailSkeleton,
} from "@/components/detail/ProductDetail";

export default function ProductPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductPageBody params={params} />
    </Suspense>
  );
}

async function ProductPageBody({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const decoded = decodeURIComponent(key);
  try {
    const product = await fetchProductDetail(decoded);
    if (!product.name?.trim()) {
      return <ProductDetailError backPath="/" />;
    }
    return <ProductDetail data={product} backPath="/" />;
  } catch {
    return <ProductDetailError backPath="/" />;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const decoded = decodeURIComponent(key);
  try {
    const product = await fetchProductDetail(decoded);
    return { title: `${product.name} | 피요` };
  } catch {
    return { title: "피요" };
  }
}
