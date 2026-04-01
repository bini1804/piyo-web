"use client";

/**
 * 답변 대기 중 추천 카드 영역 플레이스홀더.
 * 실제 UI: 가로 스크롤 스트립 + 카드 폭 358px 정합.
 */
function HorizontalSkeletonChip() {
  return (
    <div className="flex w-[358px] shrink-0 animate-pulse gap-3 overflow-hidden rounded-lg">
      <div
        className="size-20 shrink-0 rounded-lg"
        style={{ background: "var(--bg-hover)" }}
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-1">
        <div
          className="h-4 w-3/4 max-w-[200px] rounded"
          style={{ background: "var(--bg-hover)" }}
        />
        <div
          className="h-3 w-full max-w-[240px] rounded"
          style={{ background: "var(--bg-hover)" }}
        />
        <div
          className="h-3 w-2/3 max-w-[120px] rounded"
          style={{ background: "var(--bg-hover)" }}
        />
      </div>
    </div>
  );
}

export default function ChatCardStripSkeleton() {
  return (
    <div className="flex w-full max-w-full justify-start gap-3">
      <div className="size-12 shrink-0" aria-hidden />
      <div className="flex min-w-0 max-w-[min(100%,28rem)] flex-1 flex-col gap-3">
        <div className="space-y-3 overflow-hidden rounded-2xl bg-white p-4">
          <div
            className="h-4 w-28 animate-pulse rounded"
            style={{ background: "var(--bg-hover)" }}
          />
          <div className="flex flex-nowrap gap-3 overflow-x-hidden pb-1">
            {[0, 1].map((i) => (
              <HorizontalSkeletonChip key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
