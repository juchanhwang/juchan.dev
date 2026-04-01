"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogFilterProps {
  tags: string[];
}

export function BlogFilter({ tags }: BlogFilterProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-4">
      {/* Tag filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            activeTag === null
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          전체
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              activeTag === tag
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="검색어를 입력하세요..."
          className="h-10 w-full rounded-md border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          aria-label="블로그 포스트 검색"
        />
      </div>
    </div>
  );
}
