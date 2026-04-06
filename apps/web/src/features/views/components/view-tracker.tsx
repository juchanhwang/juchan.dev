"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { trackView } from "../actions";
import { formatViewCount } from "../lib/format-views";
import type { ViewType } from "../lib/types";

interface ViewTrackerProps {
  type: ViewType;
  slug: string;
  initialCount: number;
  className?: string;
}

/**
 * 마운트 시 `trackView` Server Action을 호출해 view count를 증가시키고,
 * 결과 카운트를 compact 포맷으로 렌더한다.
 *
 * 숨김 규칙:
 * - `count === 0`이면 렌더하지 않는다. 초기 카운트가 0일 때도 트래커는
 *   마운트되어 useEffect에서 `trackView`를 호출하고, 성공하면 setCount로
 *   UI가 자연스럽게 나타난다 (첫 방문 경험 보장). Redis 비활성 상태에서는
 *   `skipped: "disabled"`가 반환되어 count가 0인 채로 유지되며 계속 숨김.
 *
 * 중복 가드:
 * - 같은 세션 내 동일 `(type, slug)`는 `sessionStorage`로 재호출을 차단한다.
 * - React Strict Mode의 이중 마운트도 자연스럽게 가드된다 (키가 이미 있음).
 *
 * 에러 처리:
 * - `trackView`가 실패해도 UI에 에러를 노출하지 않는다. 초기 카운트는 SSR로
 *   내려왔으므로 사용자 경험에 영향이 없다 (조용한 fallback).
 *
 * ⚠️ 이 컴포넌트는 barrel에서 export하지 않는다. 항상 `ViewCount`를 통해서만
 * 사용되어야 하며, 초기 카운트는 Server Component에서 fetch해 prop으로 넘어온다.
 */
export function ViewTracker({
  type,
  slug,
  initialCount,
  className,
}: ViewTrackerProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const guardKey = `viewed:${type}:${slug}`;
    if (sessionStorage.getItem(guardKey)) return;
    sessionStorage.setItem(guardKey, "1");

    let cancelled = false;
    trackView(type, slug)
      .then((result) => {
        if (cancelled) return;
        // skipped !== null인 경우에도 count는 현재값이 들어온다.
        setCount(result.count);
      })
      .catch(() => {
        // 네트워크/서버 에러는 조용히 무시 — UI는 initialCount 유지.
      });

    return () => {
      cancelled = true;
    };
  }, [type, slug]);

  if (count === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        className,
      )}
      aria-label={`조회수 ${count.toLocaleString("ko-KR")}회`}
    >
      <EyeIcon className="h-3.5 w-3.5" />
      {formatViewCount(count)}
    </span>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}
