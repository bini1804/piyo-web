import { Suspense } from "react";
import { fetchProcedureDetail } from "@/lib/api/product";
import ProductDetail, {
  ProductDetailError,
  ProductDetailSkeleton,
} from "@/components/detail/ProductDetail";

export default function ProcedurePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProcedurePageBody params={params} />
    </Suspense>
  );
}

async function ProcedurePageBody({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const decoded = decodeURIComponent(key);
  try {
    const product = await fetchProcedureDetail(decoded);
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
    const product = await fetchProcedureDetail(decoded);
    return { title: `${product.name} | 피요` };
  } catch {
    return { title: "피요" };
  }
}
