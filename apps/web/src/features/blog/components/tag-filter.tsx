"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { captureEvent } from "@/lib/posthog";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: string[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTags = searchParams.getAll("tag");

  const toggleTag = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams);
      const current = params.getAll("tag");
      const isSelecting = !current.includes(tag);

      params.delete("tag");

      if (current.includes(tag)) {
        for (const t of current.filter((t) => t !== tag)) {
          params.append("tag", t);
        }
      } else {
        for (const t of current) {
          params.append("tag", t);
        }
        params.append("tag", tag);
      }

      if (isSelecting) {
        captureEvent("tag_filter_select", { tag });
      }

      const query = params.toString();
      router.push(query ? `/blog?${query}` : "/blog", { scroll: false });
    },
    [router, searchParams],
  );

  const clearTags = useCallback(() => {
    router.push("/blog", { scroll: false });
  }, [router]);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="태그 필터">
      <button
        type="button"
        onClick={clearTags}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm transition-colors",
          selectedTags.length === 0
            ? "bg-foreground text-background font-medium"
            : "text-muted-foreground hover:bg-secondary",
        )}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            selectedTags.includes(tag)
              ? "bg-foreground text-background font-medium"
              : "text-muted-foreground hover:bg-secondary",
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
