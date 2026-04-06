import { cn } from "@/lib/utils";

import { formatViewCount } from "../lib/format-views";

interface ViewCountBadgeProps {
  count: number;
  className?: string;
}

/**
 * 리스팅 페이지 카드용 presentational view count.
 *
 * 리스팅에서는 클릭 시 디테일 페이지에서 트래킹이 이뤄지므로, 여기서는
 * 트래커 없이 단순 표시만 한다. 부모(페이지)에서 `getViewCounts`로 일괄
 * 조회 후 prop으로 내려준다.
 *
 * - `count === 0`은 Redis 비활성이거나 방문이 없는 경우 — 카드 메타 영역이
 *   어색해지지 않도록 자체 렌더를 건너뛴다 (`null` 반환).
 */
export function ViewCountBadge({ count, className }: ViewCountBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        className,
      )}
      aria-label={`조회수 ${count.toLocaleString("ko-KR")}회`}
    >
      <EyeIcon className="h-3 w-3" />
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
