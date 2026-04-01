"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

interface FlatTocItem {
  title: string;
  url: string;
  depth: number;
}

function flattenToc(entries: TocEntry[], depth = 2): FlatTocItem[] {
  return entries.flatMap((entry) => [
    { title: entry.title, url: entry.url, depth },
    ...flattenToc(entry.items, depth + 1),
  ]);
}

interface TableOfContentsProps {
  items: TocEntry[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const flatItems = flattenToc(items);

  useEffect(() => {
    const headingIds = flatItems.map((item) => item.url.slice(1));
    const elements = headingIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [flatItems]);

  if (flatItems.length === 0) return null;

  return (
    <aside className="absolute left-full top-0 ml-10 hidden xl:block">
      <nav className="sticky top-28 w-52" aria-label="목차">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          목차
        </p>
        <div className="border-l-2 border-border">
          {flatItems.map((item) => (
            <a
              key={item.url}
              href={item.url}
              className={cn(
                "block py-1 text-[13px] leading-snug transition-colors",
                item.depth >= 3 ? "pl-7" : "pl-4",
                activeId === item.url.slice(1)
                  ? "font-medium text-link"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.title}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
