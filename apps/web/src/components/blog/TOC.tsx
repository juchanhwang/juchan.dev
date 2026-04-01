"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const dummyTOC: TOCItem[] = [
  { id: "react-server-components란", text: "React Server Components란?", level: 2 },
  { id: "ssr-vs-rsc", text: "SSR vs RSC", level: 3 },
  { id: "클라이언트-컴포넌트와의-경계", text: "클라이언트 컴포넌트와의 경계", level: 3 },
  { id: "nextjs-app-router에서의-rsc", text: "Next.js App Router에서의 RSC", level: 2 },
  { id: "데이터-페칭-패턴", text: "데이터 페칭 패턴", level: 3 },
  { id: "마무리", text: "마무리", level: 2 },
];

export function TOC() {
  const [activeId, setActiveId] = useState(dummyTOC[0]?.id ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Simulate scroll tracking — in real app, use IntersectionObserver
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const index = Math.min(
        Math.floor(scrollY / 400),
        dummyTOC.length - 1
      );
      setActiveId(dummyTOC[index]?.id ?? "");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tocList = (
    <ul className="space-y-1.5 text-sm">
      {dummyTOC.map((item) => (
        <li
          key={item.id}
          className={cn(
            item.level === 3 && "pl-3",
            "transition-colors"
          )}
        >
          <a
            href={`#${item.id}`}
            className={cn(
              "block py-0.5 leading-snug",
              activeId === item.id
                ? "font-medium text-link"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden xl:block">
        <div className="sticky top-20 w-[220px]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            목차
          </p>
          {tocList}
        </div>
      </aside>

      {/* Mobile: accordion */}
      <div className="xl:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium"
          aria-expanded={isOpen}
        >
          목차
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && <div className="mt-2 rounded-lg border border-border p-4">{tocList}</div>}
      </div>
    </>
  );
}
