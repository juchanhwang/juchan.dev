import { getViewCount } from "../lib/views";
import type { ViewType } from "../lib/types";
import { ViewTracker } from "./view-tracker";

interface ViewCountProps {
  type: ViewType;
  slug: string;
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
 * 숨김 규칙은 `ViewTracker` 내부에서 `count === 0`일 때 처리된다. 첫 방문이라
 * initialCount가 0이어도 트래커는 마운트되어 `trackView`를 호출하고, 성공하면
 * 자연스럽게 UI가 나타난다.
 *
 * ⚠️ ISR 페이지에서 사용 시 `revalidate` 값에 따라 초기 카운트가 stale할 수
 * 있다. 실제 카운트는 마운트 직후 `trackView` 반환값으로 보정되므로 UX에는
 * 문제가 없다.
 */
export async function ViewCount({ type, slug, className }: ViewCountProps) {
  const initialCount = await getViewCount(type, slug);

  return (
    <ViewTracker
      type={type}
      slug={slug}
      initialCount={initialCount}
      className={className}
    />
  );
}
