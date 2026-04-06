"use client";

import posthog from "posthog-js";

/**
 * PostHog 클라이언트 초기화.
 *
 * - 환경변수가 없으면 silent skip (개발 환경 누락 시에도 앱이 깨지지 않도록)
 * - SSR 안전: typeof window 체크
 * - 이미 초기화된 경우 재초기화하지 않음
 */
export function initPostHog() {
  if (typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) return;
  if (posthog.__loaded) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: false, // Provider에서 수동 처리 (App Router pathname 변경 대응)
    capture_pageleave: true,
    person_profiles: "identified_only", // PII 최소화
    disable_session_recording: true, // 세션 리플레이 OFF (무료 한도 보호)
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });
}

/**
 * PostHog가 초기화된 경우에만 이벤트를 캡처하는 안전한 wrapper.
 *
 * - SSR/테스트 환경에서 안전
 * - 환경변수 미설정 시 noop
 * - 호출부에서 옵셔널 체크를 반복하지 않도록 일원화
 */
export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

export { posthog };
