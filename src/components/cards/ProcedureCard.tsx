"use client";

import type { RecommendedProduct } from "@/types";
import { ChatHorizontalCard } from "./ChatHorizontalCard";

export default function ProcedureCard({
  procedure,
}: {
  procedure: RecommendedProduct;
}) {
  return (
    <ChatHorizontalCard
      item={procedure}
      variant="procedure"
      pathPrefix="/procedure"
    />
  );
}
