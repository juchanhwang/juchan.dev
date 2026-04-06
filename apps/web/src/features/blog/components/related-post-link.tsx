"use client";

import Link from "next/link";
import { captureEvent } from "@/lib/posthog";

interface RelatedPostLinkProps {
  fromSlug: string;
  toSlug: string;
  toTitle: string;
  permalink: string;
  formattedDate: string;
}

/**
 * 관련 포스트 링크. 클릭 시 PostHog로 추적하고 Next Link로 SPA 네비게이션.
 */
export function RelatedPostLink({
  fromSlug,
  toSlug,
  toTitle,
  permalink,
  formattedDate,
}: RelatedPostLinkProps) {
  function handleClick() {
    captureEvent("related_post_click", {
      from_slug: fromSlug,
      to_slug: toSlug,
      to_title: toTitle,
    });
  }

  return (
    <Link
      href={permalink}
      onClick={handleClick}
      className="flex items-center justify-between text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span>· {toTitle}</span>
      <span className="shrink-0 text-xs">{formattedDate}</span>
    </Link>
  );
}
