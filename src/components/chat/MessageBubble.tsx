"use client";

import { memo } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/types";
import ProductCard from "@/components/cards/ProductCard";
import ProcedureCard from "@/components/cards/ProcedureCard";
import { cn } from "@/lib/utils";

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const meta = message.metadata;

  return (
    <div
      className={cn(
        "flex w-full max-w-full animate-slide-up",
        isUser ? "justify-end" : "justify-start gap-2"
      )}
    >
      {!isUser && (
        <div className="shrink-0 pt-0.5">
          <Image
            src="/images/piyo-smile.png"
            alt="피요"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        </div>
      )}
      <div
        className={cn(
          "flex flex-col gap-3 min-w-0",
          isUser ? "items-end max-w-[70%]" : "items-start max-w-[75%]"
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
                      className="text-[15px] leading-relaxed mb-2 last:mb-0"
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
                    <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[15px] leading-relaxed">{children}</li>
                  ),
                  h3: ({ children }) => (
                    <h3
                      className="text-sm font-semibold mt-3 mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {children}
                    </h3>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {meta?.recommended_products && meta.recommended_products.length > 0 && (
          <div className="w-full min-w-0 pl-0 md:pl-1">
            <p
              className="mb-2 pl-0.5"
              style={{ fontSize: "12px", color: "var(--text-muted)" }}
            >
              추천 제품
            </p>
            <div
              className="flex overflow-x-auto pb-1 scrollbar-hide"
              style={{ gap: "10px" }}
            >
              {meta.recommended_products.map((p, i) => (
                <ProductCard
                  key={`${p.key ?? "no-key"}-${p.recommendation}-${i}`}
                  product={p}
                />
              ))}
            </div>
          </div>
        )}

        {meta?.recommended_procedures &&
          meta.recommended_procedures.length > 0 && (
            <div className="w-full min-w-0 pl-0 md:pl-1">
              <p
                className="mb-2 pl-0.5"
                style={{ fontSize: "12px", color: "var(--text-muted)" }}
              >
                추천 시술
              </p>
              <div
                className="flex overflow-x-auto pb-1 scrollbar-hide"
                style={{ gap: "10px" }}
              >
                {meta.recommended_procedures.map((p, i) => (
                  <ProcedureCard
                    key={`${p.key ?? "no-key"}-${p.recommendation}-${i}`}
                    procedure={p}
                  />
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
