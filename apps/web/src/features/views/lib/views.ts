import "server-only";

import { isRedisAvailable, redis } from "@/lib/redis";
import { viewKey } from "./keys";
import type { ViewType } from "./types";

/**
 * 단일 슬러그의 view count 조회.
 * Redis 미사용 또는 키 미존재 시 `0` 반환.
 */
export async function getViewCount(
  type: ViewType,
  slug: string,
): Promise<number> {
  if (!isRedisAvailable() || !redis) return 0;

  const count = await redis.get<number>(viewKey(type, slug));
  return count ?? 0;
}

/**
 * View count 증가 (원자적).
 * Redis 미사용 시 `0` 반환. 성공 시 INCR 이후 새 카운트 반환.
 */
export async function incrementViewCount(
  type: ViewType,
  slug: string,
): Promise<number> {
  if (!isRedisAvailable() || !redis) return 0;

  return await redis.incr(viewKey(type, slug));
}

/**
 * 여러 슬러그의 view count 일괄 조회 (리스팅 페이지용).
 *
 * MGET 1회로 모든 키를 조회해 N+1 문제를 방지한다.
 * Redis 미사용 또는 빈 배열 시 모든 슬러그에 대해 `0` 반환.
 *
 * @returns `{ [slug]: count }` 형태의 레코드
 */
export async function getViewCounts(
  type: ViewType,
  slugs: string[],
): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  if (!isRedisAvailable() || !redis) {
    return Object.fromEntries(slugs.map((s) => [s, 0]));
  }

  const keys = slugs.map((s) => viewKey(type, s));
  const counts = await redis.mget<(number | null)[]>(...keys);

  return Object.fromEntries(
    slugs.map((s, i) => [s, counts?.[i] ?? 0]),
  );
}
