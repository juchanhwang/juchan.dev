"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "process", label: "Process" },
  { id: "result", label: "Result" },
  { id: "links", label: "Links" },
] as const;

export function SectionProgress() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleScroll() {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress((window.scrollY / scrollHeight) * 100);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Mobile: top progress bar */}
      <div
        className="fixed left-0 top-14 z-40 h-0.5 bg-foreground transition-[width] duration-150 xl:hidden"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="페이지 읽기 진행률"
      />

      {/* Desktop: right dot nav */}
      <nav
        className="fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
        role="navigation"
        aria-label="섹션 네비게이션"
      >
        <ul className="flex flex-col gap-4">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="group flex items-center gap-3"
                  aria-label={`${section.label} 섹션으로 이동`}
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-150",
                      isActive
                        ? "h-2.5 w-2.5 bg-foreground"
                        : "h-2 w-2 bg-border group-hover:bg-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs transition-opacity duration-200",
                      isActive
                        ? "text-foreground opacity-100"
                        : "text-muted-foreground opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {section.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
