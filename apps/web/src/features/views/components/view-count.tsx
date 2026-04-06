import { getViewCount } from "../lib/views";
import type { ViewType } from "../lib/types";
import { ViewTracker } from "./view-tracker";

interface ViewCountProps {
  type: ViewType;
  slug: string;
  /**
   * 카운트가 `0`일 때 UI를 숨길지 여부 (기본 `true`).
   *
   * Redis가 비활성(`disabled`)이거나 아직 방문이 한 건도 없을 때 `0`이 된다.
   * 디테일 페이지에서는 첫 방문부터 카운트가 쌓여야 하므로, 숨김 처리 시에도
   * 트래커(`ViewTracker`)는 렌더해 increment는 수행한다.
   */
  hideWhenZero?: boolean;
  className?: string;
}

/**
 * 디테일 페이지(블로그 포스트, 프로젝트 케이스 스터디)용 view counter.
 *
 * Server Component로 초기 카운트를 Redis에서 직접 fetch한 뒤, client component
 * (`ViewTracker`)에 prop으로 전달한다. 이로써:
 *
 * 1. SSR 시점에 카운트가 이미 마크업에 포함 → 레이아웃 시프트 없음
 * 2. 클라이언트는 mount 후 `trackView`를 호출해 increment
 * 3. increment 결과로 UI 카운트를 갱신 (같은 세션 중복 가드는 트래커에서 처리)
 *
 * ⚠️ ISR 페이지에서 사용 시 `revalidate` 값에 따라 초기 카운트가 stale할 수
 * 있다. 실제 카운트는 마운트 직후 `trackView` 반환값으로 보정되므로 UX에는
 * 문제가 없다.
 */
export async function ViewCount({
  type,
  slug,
  hideWhenZero = true,
  className,
}: ViewCountProps) {
  const initialCount = await getViewCount(type, slug);

  if (hideWhenZero && initialCount === 0) {
    // Redis 비활성 또는 첫 방문 — UI는 숨기되 트래커는 살려서
    // 첫 increment부터 카운트가 쌓이도록 한다.
    return (
      <ViewTracker type={type} slug={slug} initialCount={0} hidden />
    );
  }

  return (
    <ViewTracker
      type={type}
      slug={slug}
      initialCount={initialCount}
      className={className}
    />
  );
}
