"use server";

import { cookies, headers } from "next/headers";
import { isbot } from "isbot";

import { isRedisAvailable } from "@/lib/redis";
import { getViewCount, incrementViewCount } from "./lib/views";
import type { TrackViewResult, ViewType } from "./lib/types";

/**
 * View count를 증가시키는 Server Action.
 *
 * 증가 스킵 조건:
 * 1. Redis 환경변수 미설정 (`disabled`)
 * 2. `views_excluded=1` 쿠키 존재 (본인, `owner`)
 * 3. User-Agent가 봇 (`bot`)
 *
 * 스킵된 경우에도 현재 카운트를 조회해 반환하므로, 호출부는 반환값의
 * `count`를 그대로 UI에 바인딩해도 된다 (0으로 깜빡이지 않음).
 *
 * ⚠️ 같은 세션의 중복 호출 가드는 client 측에서 처리한다 (Phase 2).
 * 이 함수는 모든 호출을 정직하게 처리한다 (idempotency는 client 책임).
 */
export async function trackView(
  type: ViewType,
  slug: string,
): Promise<TrackViewResult> {
  // 1. Redis 미사용 — noop. UI는 view count 자체를 숨기는 게 권장.
  if (!isRedisAvailable()) {
    return { count: 0, skipped: "disabled" };
  }

  // 2. 본인 제외 (쿠키 검사). Next.js 16: cookies()는 async.
  const cookieStore = await cookies();
  if (cookieStore.get("views_excluded")?.value === "1") {
    const current = await getViewCount(type, slug);
    return { count: current, skipped: "owner" };
  }

  // 3. 봇 제외 (User-Agent 검사). Next.js 16: headers()는 async.
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "";
  if (isbot(userAgent)) {
    const current = await getViewCount(type, slug);
    return { count: current, skipped: "bot" };
  }

  // 4. 정상 increment.
  const newCount = await incrementViewCount(type, slug);
  return { count: newCount, skipped: null };
}
