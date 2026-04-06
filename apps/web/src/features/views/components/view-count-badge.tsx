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
 * `count === 0`도 있는 그대로 `"0"`으로 표시한다. 카드마다 일관된 메타
 * 영역을 보장하기 위함이며, "뱃지가 어떤 카드엔 있고 어떤 카드엔 없는"
 * 비일관성을 피한다. Redis 비활성으로 카운트를 숨기고 싶은 경우에는
 * 부모 컴포넌트가 `viewCount` prop 자체를 전달하지 않도록 한다.
 */
export function ViewCountBadge({ count, className }: ViewCountBadgeProps) {
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
