"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import { initPostHog, posthog } from "@/lib/posthog";

/**
 * PostHog 통합 Provider.
 *
 * - 환경변수 미존재 시 children만 렌더링하고 PostHog 비활성화
 * - App Router pathname/searchParams 변경 시 수동 pageview 캡처
 * - useSearchParams는 Suspense 안에서만 사용 가능 → 추적 부분만 Suspense로 감쌈
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const isEnabled = Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
  );

  useEffect(() => {
    if (!isEnabled) return;
    initPostHog();
  }, [isEnabled]);

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <PostHogReactProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PostHogReactProvider>
  );
}

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (!posthog.__loaded) return;

    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
