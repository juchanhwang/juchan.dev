"use client";

import { useEffect, useRef } from "react";
import { captureEvent } from "@/lib/posthog";

const MILESTONES = [25, 50, 75, 100] as const;

type Milestone = (typeof MILESTONES)[number];

/**
 * 페이지 스크롤 깊이를 추적해 마일스톤(25/50/75/100%) 도달 시 PostHog 이벤트를 발행한다.
 *
 * - 한 번 트리거된 마일스톤은 재발생하지 않는다 (Set으로 추적)
 * - passive scroll listener
 * - slug가 변경되면 마일스톤 추적이 초기화된다
 */
export function useScrollDepth(slug: string) {
  const triggeredRef = useRef<Set<Milestone>>(new Set());

  useEffect(() => {
    triggeredRef.current = new Set();

    function handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight;
      if (scrollHeight === 0) return;

      const depth = Math.min(
        100,
        ((window.scrollY + window.innerHeight) / scrollHeight) * 100,
      );

      for (const milestone of MILESTONES) {
        if (depth >= milestone && !triggeredRef.current.has(milestone)) {
          triggeredRef.current.add(milestone);
          captureEvent("post_scroll_depth", {
            slug,
            depth: milestone,
          });
        }
      }
    }

    // 초기 진입 시 이미 보이는 영역도 체크 (짧은 글 케이스)
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);
}
