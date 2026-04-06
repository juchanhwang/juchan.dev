"use client";

import { useEffect } from "react";
import { captureEvent } from "@/lib/posthog";

/**
 * 페이지에 머문 시간(초)을 측정해 페이지를 떠날 때 PostHog 이벤트를 발행한다.
 *
 * - visibilitychange로 백그라운드 시간을 제외하고 실제 본 시간만 누적
 * - iOS Safari 호환을 위해 pagehide 사용 (beforeunload 대신)
 * - slug가 변경되면 (다른 글로 이동) 현재까지의 시간을 전송하고 새로 시작
 */
export function useDwellTime(slug: string) {
  useEffect(() => {
    let accumulatedMs = 0;
    let visibleSince: number | null = null;
    let sent = false;

    function startVisible() {
      if (visibleSince === null) {
        visibleSince = Date.now();
      }
    }

    function pauseVisible() {
      if (visibleSince !== null) {
        accumulatedMs += Date.now() - visibleSince;
        visibleSince = null;
      }
    }

    function send() {
      if (sent) return;
      pauseVisible();
      const seconds = Math.round(accumulatedMs / 1000);
      if (seconds > 0) {
        captureEvent("post_dwell_time", { slug, seconds });
      }
      sent = true;
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        startVisible();
      } else {
        pauseVisible();
      }
    }

    if (document.visibilityState === "visible") {
      startVisible();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", send);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", send);
      send();
    };
  }, [slug]);
}
