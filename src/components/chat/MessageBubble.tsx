"use client";

import { memo } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, RecommendedProduct } from "@/types";
import {
  enrichRecommendationKeyFromScore,
  normalizeRecommendedProduct,
} from "@/lib/normalize-recommended-product";
import {
  AppProductListItem,
  descriptionForAppProductCard,
  detailPathForRecommendation,
  imageUrlForAppCard,
  priceForAppCard,
} from "@/components/cards/app";
import { HospitalCard } from "@/components/cards/HospitalCard";
import { cn } from "@/lib/utils";
import { stripSurveyInviteFromAnswer } from "@/lib/chat-strip-survey-nudge";
import type { HospitalInfo } from "@/types";
import { HorizontalChatSection } from "@/components/chat/HorizontalChatSection";
import { useTypewriter } from "@/hooks/useTypewriter";

/** 병원: 앱 `HospitalCard` compact + 카드 클릭 시 `/hospital/{id}` + 예약/전화 */
function ChatHospitalSection({
  hospitalCards,
}: {
  hospitalCards: Record<string, HospitalInfo[]>;
}) {
  const entries = Object.entries(hospitalCards).filter(
    ([, list]) => list && list.length > 0
  );
  if (entries.length === 0) return null;

  return (
    <div className="w-full space-y-3 overflow-hidden rounded-2xl bg-white p-4">
      <h3
        className="break-words text-[14px] font-semibold leading-5 text-neutral-900"
        style={{ color: "var(--text-primary)", fontWeight: 600 }}
      >
        추천 병원
      </h3>
      <div className="space-y-4">
        {entries.map(([procName, hospitals]) => (
          <div key={procName} className="space-y-3">
            {entries.length > 1 && (
              <p
                className="text-[11px] leading-4"
                style={{ color: "var(--text-muted)" }}
              >
                {procName}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {hospitals.map((hosp, idx) => (
                <HospitalCard
                  key={`${procName}-${hosp.hospital_id ?? idx}`}
                  hospital={hosp}
                  procedureName={procName}
                  isFirst={idx === 0}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  hideSurveyAnswerNudge = false,
  isLatest,
}: {
  message: ChatMessage;
  hideSurveyAnswerNudge?: boolean;
  /** 마지막 assistant 말풍선일 때만 타자 효과(줄 단위) */
  isLatest?: boolean;
}) {
  const isUser = message.role === "user";
  const meta = message.metadata;
  const displayContent =
    !isUser && hideSurveyAnswerNudge
      ? stripSurveyInviteFromAnswer(message.content)
      : message.content;

  const safeContent = displayContent ?? "";
  // 마크다운(### 등)은 문자 단위 스트리밍 시 불완전 파싱으로 리터럴이 보일 수 있어
  // 피요 답변은 전체 텍스트를 한 번에 ReactMarkdown에 넘긴다.
  const { displayed, done } = useTypewriter(safeContent, isLatest ?? false);

  const scoreMap = meta?.score as Record<string, unknown> | undefined;
  const proceduresRaw = (meta?.recommended_procedures ?? [])
    .map(normalizeRecommendedProduct)
    .map((p) => enrichRecommendationKeyFromScore(p, scoreMap));
  const productsRaw = (meta?.recommended_products ?? [])
    .map(normalizeRecommendedProduct)
    .map((p) => enrichRecommendationKeyFromScore(p, scoreMap));
  const hospitalCards = meta?.hospital_cards ?? {};

  // route.ts 와 동일: 플래그가 false여도 추천 배열이 있으면 카드 노출
  // (?? 는 false 를 통과시켜 빈 배열로 덮어쓰는 버그가 있어 === true || length 로 통일)
  const showProcedure =
    meta?.show_procedure_cards === true || proceduresRaw.length > 0;
  const showProduct =
    meta?.show_product_cards === true || productsRaw.length > 0;
  const showHospital =
    meta?.show_hospital_cards === true ||
    Object.keys(hospitalCards).length > 0;

  const procedures = showProcedure ? proceduresRaw : [];
  const products = showProduct ? productsRaw : [];

  return (
    <div
      className={cn(
        "flex w-full max-w-full animate-slide-up",
        isUser ? "justify-end" : "justify-start gap-3"
      )}
    >
      {!isUser && (
        <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-white pt-0.5">
          <Image
            src="/images/piyo-smile.png"
            alt="피요"
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
      )}
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3",
          isUser
            ? "max-w-[85%] items-end sm:max-w-[70%]"
            : "max-w-[min(100%,28rem)] items-start sm:max-w-[75%]"
        )}
      >
        <div
          className="break-words"
          style={
            isUser
              ? {
                  background: "var(--bubble-user)",
                  color: "var(--text-primary)",
                  borderRadius: "20px 20px 4px 20px",
                  padding: "12px 16px",
                  boxShadow: "var(--shadow-sm)",
                }
              : {
                  background: "var(--bubble-piyo)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px 20px 20px 20px",
                  padding: "12px 16px",
                  boxShadow: "var(--shadow-sm)",
                }
          }
        >
          {isUser ? (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm prose-neutral max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p
                      className="mb-2 text-[15px] leading-relaxed last:mb-0"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2 list-decimal space-y-1 pl-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[15px] leading-relaxed">{children}</li>
                  ),
                  h3: ({ children }) => (
                    <h3
                      className="mt-3 mb-1 text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {children}
                    </h3>
                  ),
                }}
              >
                {displayed || " "}
              </ReactMarkdown>
              {!done && (
                <span
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "1em",
                    background: "#F4CB4B",
                    marginLeft: "2px",
                    verticalAlign: "text-bottom",
                    animation: "blink 0.7s step-end infinite",
                  }}
                />
              )}
            </div>
          )}
        </div>

        {products.length > 0 && (
          <HorizontalChatSection
            title="화장품 추천"
            items={products}
            getKey={(p, i) => `${p.key ?? "no-key"}-${p.recommendation}-${i}`}
            renderItem={(p) => (
              <AppProductListItem
                name={p.recommendation}
                description={descriptionForAppProductCard(p)}
                price={priceForAppCard(p)}
                imageUrl={imageUrlForAppCard(p)}
                wished={false}
                path={detailPathForRecommendation(p)}
                pricePrefix={p.price_unit ?? undefined}
                priceInfo={p.price_info ?? undefined}
              />
            )}
          />
        )}

        {procedures.length > 0 && (
          <HorizontalChatSection
            title="시술 추천"
            items={procedures}
            getKey={(p, i) => `${p.key ?? "no-key"}-${p.recommendation}-${i}`}
            renderItem={(p) => (
              <AppProductListItem
                name={p.recommendation}
                description={descriptionForAppProductCard(p)}
                price={priceForAppCard(p)}
                imageUrl={imageUrlForAppCard(p)}
                wished={false}
                path={detailPathForRecommendation(p)}
                pricePrefix={p.price_unit ?? undefined}
                priceInfo={p.price_info ?? undefined}
              />
            )}
          />
        )}

        {showHospital && Object.keys(hospitalCards).length > 0 && (
          <ChatHospitalSection hospitalCards={hospitalCards} />
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
