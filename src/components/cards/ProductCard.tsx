"use client";

import type { RecommendedProduct } from "@/types";
import { ChatHorizontalCard } from "./ChatHorizontalCard";

export default function ProductCard({
  product,
}: {
  product: RecommendedProduct;
}) {
  return (
    <ChatHorizontalCard
      item={product}
      variant="product"
      pathPrefix="/product"
    />
  );
}
