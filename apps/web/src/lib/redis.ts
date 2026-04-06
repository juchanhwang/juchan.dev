import "server-only";

import { Redis } from "@upstash/redis";

/**
 * Upstash Redis 클라이언트.
 *
 * Vercel Marketplace 통합이 주입하는 `KV_REST_API_URL`, `KV_REST_API_TOKEN`을
 * 사용한다. 환경변수가 없으면 `null`을 반환해 개발 환경(로컬 + env 미설정)에서
 * 빌드/런타임이 깨지지 않도록 한다. 호출부는 `isRedisAvailable()`로 먼저 확인할 것.
 *
 * @see https://upstash.com/docs/redis/sdks/ts/overview
 */
export const redis: Redis | null =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

/** Redis 사용 가능 여부 (env 가드). */
export function isRedisAvailable(): boolean {
  return redis !== null;
}
