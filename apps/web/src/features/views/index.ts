/**
 * Views feature — view counter 데이터 레이어.
 *
 * ⚠️ 이 barrel은 **server 전용** 모듈(Redis 조회 헬퍼)과 **순수 타입/유틸**만
 * 노출한다. Server Action `trackView`는 Next.js 권장 패턴에 따라 별도 경로로
 * import 할 것:
 *
 * ```ts
 * import { trackView } from "@/features/views/actions";
 * ```
 *
 * Client Component에서는 `trackView`만 import 가능하다 (Server Action이라
 * fetch-like로 호출된다). 그 외 헬퍼(`getViewCount`, `getViewCounts`)는
 * Server Component 또는 Route Handler에서만 호출해야 한다 (`server-only`).
 */

// Lib — Redis helpers (server-only)
export { getViewCount, getViewCounts, incrementViewCount } from "./lib/views";

// Lib — pure utilities & types
export { viewKey } from "./lib/keys";
export { formatViewCount } from "./lib/format-views";
export type { TrackViewResult, ViewType } from "./lib/types";

// Components
// ⚠️ `ViewTracker`는 `ViewCount` 내부 구현이라 의도적으로 노출하지 않는다.
export { ViewCount } from "./components/view-count";
export { ViewCountBadge } from "./components/view-count-badge";
