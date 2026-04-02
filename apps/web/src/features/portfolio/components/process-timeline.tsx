"use client";

import Image from "next/image";
import type { ProcessStep } from "../lib/projects";
import { FadeInUp } from "../animation/fade-in-up";

interface ProcessTimelineProps {
  steps: ProcessStep[];
  intro?: string;
}

export function ProcessTimeline({ steps, intro }: ProcessTimelineProps) {
  return (
    <section id="process" className="mx-auto max-w-[1100px] px-4 py-20">
      <FadeInUp>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Process
        </p>
        <h2 className="mt-2 text-2xl font-bold">어떻게 해결했나</h2>
      </FadeInUp>

      {intro && (
        <FadeInUp delay={0.1}>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
            {intro}
          </p>
        </FadeInUp>
      )}

      <div className="mt-12 space-y-20">
        {steps.map((step, index) => {
          if (!step.image) {
            return (
              <FadeInUp key={step.number} delay={index * 0.1}>
                <p className="text-sm font-medium text-muted-foreground">
                  {step.number}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                <div className="mt-4 leading-relaxed text-muted-foreground">
                  {step.description.split("\n\n").map((paragraph, i) => (
                    <p key={i} className={i > 0 ? "mt-3" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </FadeInUp>
            );
          }

          const isEven = index % 2 === 1;

          return (
            <FadeInUp
              key={step.number}
              delay={index * 0.1}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
            >
              <div className={isEven ? "md:order-last" : ""}>
                <p className="text-sm font-medium text-muted-foreground">
                  {step.number}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                <div className="mt-4 leading-relaxed text-muted-foreground">
                  {step.description.split("\n\n").map((paragraph, i) => (
                    <p key={i} className={i > 0 ? "mt-3" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              <div className={isEven ? "md:order-first" : ""}>
                <div className="overflow-hidden rounded-lg border border-border shadow-lg transition-transform duration-150 hover:scale-[1.02]">
                  <Image
                    src={step.image}
                    alt={step.imageAlt ?? `${step.title} 스크린샷`}
                    width={600}
                    height={400}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </FadeInUp>
          );
        })}
      </div>
    </section>
  );
}
