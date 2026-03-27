"use client";

import type { RecommendedProduct } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function typeLabel(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("시술")) return "시술";
  if (t.includes("홈") || t.includes("home")) return "홈케어";
  return "화장품";
}

export default function ProductCard({
  product,
}: {
  product: RecommendedProduct;
}) {
  const router = useRouter();
  const badge = typeLabel(product.type);
  const hasKey = Boolean(product.key?.trim());

  return (
    <article
      role={hasKey ? "button" : undefined}
      tabIndex={hasKey ? 0 : undefined}
      onKeyDown={
        hasKey
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/product/${encodeURIComponent(product.key!)}`);
              }
            }
          : undefined
      }
      className={cn(
        "shrink-0 flex flex-col transition-all duration-200 rounded-[var(--radius-md)] p-[14px] relative",
        "hover:shadow-[var(--shadow-md)]",
        hasKey && "cursor-pointer active:scale-[0.98] transition-transform"
      )}
      style={{
        width: "200px",
        background: "#FFFFFF",
        border: "1px solid var(--border)",
      }}
      onClick={
        hasKey
          ? () => router.push(`/product/${encodeURIComponent(product.key!)}`)
          : undefined
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--brand)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {!hasKey ? (
        <span
          className="absolute top-2 right-2 text-2xs font-semibold px-1.5 py-0.5 rounded"
          style={{
            background: "var(--bg-hover)",
            color: "var(--text-muted)",
            fontSize: "10px",
          }}
        >
          준비 중
        </span>
      ) : null}
      <span
        className="self-start text-2xs font-semibold px-2 py-0.5 rounded-md mb-2"
        style={{
          background: "var(--brand-light)",
          color: "var(--text-primary)",
          fontSize: "11px",
        }}
      >
        {badge}
      </span>
      <h3
        className="font-bold leading-snug line-clamp-2 mb-1"
        style={{ fontSize: "15px", color: "var(--text-primary)" }}
      >
        {product.recommendation}
      </h3>
      <p
        className="line-clamp-2 flex-1 mb-2 leading-relaxed"
        style={{ fontSize: "13px", color: "var(--text-secondary)" }}
      >
        {product.reason || product.category || "맞춤 추천"}
      </p>
      <div className="flex flex-wrap gap-1 mt-auto">
        {product.category && (
          <span
            className="text-2xs px-1.5 py-0.5 rounded"
            style={{
              background: "var(--bg-hover)",
              color: "var(--text-secondary)",
              fontSize: "11px",
            }}
          >
            {product.category}
          </span>
        )}
        {product.concern && (
          <span
            className="text-2xs px-1.5 py-0.5 rounded truncate max-w-full"
            style={{
              background: "var(--bg-hover)",
              color: "var(--text-muted)",
              fontSize: "11px",
            }}
          >
            {product.concern}
          </span>
        )}
      </div>
    </article>
  );
}
