"use client";

import type { RoadmapItem } from "../lib/projects";
import { FadeInUp } from "../animation/fade-in-up";

const STATUS_CONFIG = {
  done: { icon: "✅", className: "text-muted-foreground" },
  "in-progress": { icon: "🔧", className: "text-foreground font-medium" },
  planned: { icon: "⏳", className: "text-muted-foreground" },
} as const;

interface WhatsNextSectionProps {
  roadmap: RoadmapItem[];
}

export function WhatsNextSection({ roadmap }: WhatsNextSectionProps) {
  return (
    <section id="whats-next" className="mx-auto max-w-[1100px] px-4 py-20">
      <FadeInUp>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          What&apos;s Next
        </p>
        <h2 className="mt-2 text-2xl font-bold">앞으로의 계획</h2>
      </FadeInUp>

      <div className="mt-8 space-y-4">
        {roadmap.map((item, i) => {
          const config = STATUS_CONFIG[item.status];
          return (
            <FadeInUp key={item.label} delay={0.1 + i * 0.08}>
              <div className="flex items-center gap-3">
                <span className="text-lg" aria-hidden="true">
                  {config.icon}
                </span>
                <span className={`text-base ${config.className}`}>
                  {item.label}
                </span>
              </div>
            </FadeInUp>
          );
        })}
      </div>
    </section>
  );
}
