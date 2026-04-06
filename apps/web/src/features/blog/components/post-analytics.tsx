"use client";

import { useEffect } from "react";
import { captureEvent } from "@/lib/posthog";
import { useScrollDepth } from "../lib/use-scroll-depth";
import { useDwellTime } from "../lib/use-dwell-time";

interface PostAnalyticsProps {
  slug: string;
  tags: string[];
  readingTime: number;
}

/**
 * 블로그 포스트 페이지에 마운트되어 분석 이벤트를 자동 캡처한다.
 *
 * - 마운트 시 post_view 이벤트 1회 발행
 * - useScrollDepth로 스크롤 마일스톤 추적
 * - useDwellTime으로 페이지 머문 시간 측정
 *
 * 렌더링 출력 없음.
 */
export function PostAnalytics({ slug, tags, readingTime }: PostAnalyticsProps) {
  useEffect(() => {
    captureEvent("post_view", { slug, tags, readingTime });
  }, [slug, tags, readingTime]);

  useScrollDepth(slug);
  useDwellTime(slug);

  return null;
}
