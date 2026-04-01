"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import type { RecommendedProduct } from "@/types";
import { resolveRdsMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Variant = "procedure" | "product";

/** 앱 bot-response: hashTags join — 웹은 hashtags(・) 또는 동일 폴백 */
function buildDescription(item: RecommendedProduct): string {
  const tags = (item.hashtags ?? "").trim();
  if (tags) return tags;
  if (item.reason?.trim()) return item.reason.trim();
  const hashLike = [item.category, item.concern].filter(Boolean).join(" ・ ");
  return hashLike.trim();
}

/** 백엔드·레거시 키 보조 (카드 파일 내에서만 사용) */
function resolvePriceValue(item: RecommendedProduct): unknown {
  const ex = item as RecommendedProduct & Record<string, unknown>;
  return (
    item.price ??
    ex["가격"] ??
    ex["salePrice"] ??
    ex["sale_price"] ??
    ex["Price"]
  );
}

function parsePriceNumber(price: unknown): number | null {
  if (price === undefined || price === null) return null;
  if (typeof price === "number" && Number.isFinite(price)) return price;
  const ps = String(price).replace(/,/g, "").replace(/\s*원\s*$/u, "").trim();
  if (!ps) return null;
  const n = Number(ps);
  return Number.isFinite(n) ? n : null;
}

/** 앱 `PriceDisplay` — 본액(굵게) + 원, 빨간 prefix, 회색 price_info */
function ChatPriceRow({
  price,
  pricePrefix,
  priceInfo,
}: {
  price?: number | string | null;
  pricePrefix?: string | null;
  priceInfo?: string | null;
}) {
  const num = parsePriceNumber(price);
  const showNum = num !== null && num > 0;
  const hasAny =
    showNum || Boolean((pricePrefix ?? "").trim()) || Boolean((priceInfo ?? "").trim());

  if (!hasAny) return null;

  return (
    <div className="flex w-full flex-wrap items-baseline gap-x-1 gap-y-0.5">
      {pricePrefix ? (
        <span
          className="text-[14px] font-medium leading-5"
          style={{ color: "#dc2626" }}
        >
          {pricePrefix}
        </span>
      ) : null}
      {showNum ? (
        <div className="flex items-center gap-0.5">
          <span className="text-[16px] font-semibold leading-6 text-neutral-900">
            {num!.toLocaleString("ko-KR")}
          </span>
          <span className="text-[14px] font-normal leading-5 text-neutral-900">
            원
          </span>
        </div>
      ) : null}
      {priceInfo ? (
        <span className="text-[12px] font-normal leading-[18px] text-neutral-500">
          {priceInfo}
        </span>
      ) : null}
    </div>
  );
}

/**
 * 앱 `ProductListItem` variant=squareHorizontal 정합 (카테고리 칩 없음, 가격 하단 고정)
 */
export function ChatHorizontalCard({
  item,
  variant: _variant,
  pathPrefix,
}: {
  item: RecommendedProduct;
  variant: Variant;
  pathPrefix: "/procedure" | "/product";
}) {
  const router = useRouter();
  const hasKey = Boolean(item.key?.trim());
  const desc = buildDescription(item);
  const initial = (item.recommendation || "?").slice(0, 1);
  const [imgBroken, setImgBroken] = useState(false);

  const go = () => {
    if (!hasKey) return;
    router.push(`${pathPrefix}/${encodeURIComponent(item.key!.trim())}`);
  };

  const rawUrl = resolveRdsMediaUrl(item.image_url);
  const showImg = Boolean(rawUrl) && !imgBroken;
  const priceRaw = resolvePriceValue(item);
  void _variant;

  return (
    <article
      role={hasKey ? "button" : undefined}
      tabIndex={hasKey ? 0 : undefined}
      onKeyDown={
        hasKey
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                go();
              }
            }
          : undefined
      }
      className={cn(
        "relative flex w-full min-w-0 max-w-[358px] cursor-pointer items-stretch gap-3 rounded-[var(--radius-sm)]",
        hasKey && "active:opacity-90"
      )}
      style={{ minHeight: 44 }}
      onClick={hasKey ? go : undefined}
    >
      {!hasKey ? (
        <span
          className="absolute right-0 top-0 z-10 rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            background: "var(--bg-hover)",
            color: "var(--text-muted)",
          }}
        >
          준비 중
        </span>
      ) : null}

      <div
        className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border"
        style={{
          borderColor: "#f3f4f6",
          background: "#f9fafb",
        }}
      >
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rawUrl}
            alt={item.recommendation}
            className="size-full object-cover object-top"
            draggable={false}
            onError={() => setImgBroken(true)}
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <span
            className="flex size-full items-center justify-center text-lg font-semibold"
            style={{
              background: "var(--brand-light)",
              color: "var(--brand-dark)",
            }}
            aria-hidden
          >
            {initial}
          </span>
        )}
      </div>

      <div className="flex min-h-20 min-w-0 flex-1 flex-col justify-between gap-1 py-2">
        <div className="min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-1">
            <span
              className="line-clamp-1 min-w-0 flex-1 text-[14px] font-normal leading-5 text-neutral-900"
              style={{ color: "var(--text-primary)" }}
            >
              {item.recommendation}
            </span>
            <div
              className="flex size-11 shrink-0 items-center justify-center"
              aria-hidden
            >
              <Heart
                className="size-5 stroke-neutral-300 text-transparent"
                strokeWidth={1.75}
              />
            </div>
          </div>
          <div
            className="line-clamp-2 max-w-[242px] text-[12px] font-normal leading-[18px] text-neutral-500"
            style={{ color: "var(--text-secondary)" }}
          >
            {desc || "\u00a0"}
          </div>
        </div>

        <div className="shrink-0 pt-0.5">
          <ChatPriceRow
            price={priceRaw as number | string | null | undefined}
            pricePrefix={item.price_unit}
            priceInfo={item.price_info}
          />
        </div>
      </div>
    </article>
  );
}
