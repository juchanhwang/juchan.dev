"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { trackView } from "../actions";
import { formatViewCount } from "../lib/format-views";
import type { ViewType } from "../lib/types";

/**
 * 같은 (type, slug) 조합이 한 브라우저에서 다시 카운트되기까지의 최소 간격.
 * 24시간이면 "오늘의 unique reader"에 가까운 의미가 된다.
 *
 * Velog가 동일하게 24h 윈도우를 사용한다 (`post_reads.created_at >
 * NOW() - INTERVAL '24 HOURS'`). 트래픽 규모가 커지면 더 짧게(예: 6h)
 * 조정 가능.
 */
export const VIEW_DEDUP_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * 카운트가 발생하기까지 페이지에 머물러야 하는 최소 시간 (bounce filter).
 * 이 시간 안에 페이지를 떠나거나 컴포넌트가 unmount되면 트래커는 호출되지
 * 않는다. Forem(dev.to)이 1.8s 지연을 사용하므로 5s는 더 보수적이다.
 */
export const VIEW_DWELL_DELAY_MS = 5_000;

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
 *   마운트되어 dwell 통과 후 `trackView`를 호출하고, 성공하면 setCount로
 *   UI가 자연스럽게 나타난다 (첫 방문 경험 보장). Redis 비활성 상태에서는
 *   `skipped: "disabled"`가 반환되어 count가 0인 채로 유지되며 계속 숨김.
 *
 * 보수적 카운팅 (`feat/conservative-view-counting`):
 * 1. **5s dwell delay** — 페이지에 5초 미만 머물면 카운트 안 됨 (bounce filter).
 *    `useEffect` cleanup에서 `clearTimeout`으로 취소되므로 unmount 시 안전.
 * 2. **localStorage 24h TTL dedup** — 같은 브라우저 × 같은 슬러그가 24시간
 *    안에 카운트된 적 있으면 건너뜀. `sessionStorage`보다 강한 dedup이라 새
 *    탭/창/재시작에도 유지된다.
 * 3. **Multi-tab race re-check** — dwell 통과 직후에도 한 번 더 가드를 검사해서
 *    동시에 열린 다른 탭이 그 사이에 카운트했으면 스킵한다.
 *
 * 트레이드오프:
 * - localStorage를 사용자가 수동으로 비우면 dedup 우회됨 (Velog의 IP hash는
 *   우회 어렵지만 PII 보관이 필요해 이번 설계에는 부적합).
 * - 시크릿/Incognito 세션은 종료 후 dedup이 사라지므로 카운트 가능.
 * - 5초 안에 빠르게 스크롤만 보고 떠나는 사용자도 카운트 안 됨 (의도된 동작).
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

    // 1단계: TTL dedup 사전 검사. 24h 안에 이미 카운트했으면 트래커 자체를
    // 띄우지 않는다 (dwell 타이머도 시작 안 함).
    if (isWithinDedupWindow(guardKey)) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      // 2단계: dwell 통과 직후 가드 재검사 (multi-tab race 보호).
      // 다른 탭이 그 사이 5초 동안 카운트해서 가드를 세팅했다면 여기서 잡힌다.
      if (isWithinDedupWindow(guardKey)) return;

      // 3단계: 가드 세팅 + Server Action 호출.
      try {
        localStorage.setItem(guardKey, String(Date.now()));
      } catch {
        // private mode/quota 초과 등 — 가드 없이 진행하되 트래킹은 계속.
      }

      trackView(type, slug)
        .then((result) => {
          if (cancelled) return;
          // skipped !== null인 경우에도 count는 현재값이 들어온다.
          setCount(result.count);
        })
        .catch(() => {
          // 네트워크/서버 에러는 조용히 무시 — UI는 initialCount 유지.
        });
    }, VIEW_DWELL_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
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

/**
 * `localStorage[guardKey]`에 저장된 timestamp가 현재 시점 기준 dedup TTL 안인지
 * 검사한다.
 *
 * - 키가 없으면 `false`
 * - 키가 NaN/Infinity 등 비정상이면 `false` (잘못된 값을 만나면 가드 무시 →
 *   다음 트래킹이 다시 정상 timestamp로 덮어쓴다)
 * - private mode 등 storage 접근 실패 시 `false` (가드 없이 트래킹 진행)
 */
function isWithinDedupWindow(guardKey: string): boolean {
  try {
    const raw = localStorage.getItem(guardKey);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < VIEW_DEDUP_TTL_MS;
  } catch {
    return false;
  }
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
