"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const scrollable = scrollHeight - clientHeight;
      if (scrollable > 0) {
        setProgress((scrollTop / scrollable) * 100);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[100] h-0.5 bg-foreground transition-[width] duration-100 ease-linear"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="읽기 진행률"
    />
  );
}
