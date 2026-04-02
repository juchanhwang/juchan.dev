"use client";

import type { DevProcess } from "../lib/projects";
import { FadeInUp } from "../animation/fade-in-up";

interface DevProcessSectionProps {
  devProcess: DevProcess;
}

export function DevProcessSection({ devProcess }: DevProcessSectionProps) {
  return (
    <section id="dev-process" className="mx-auto max-w-[1100px] px-4 py-20">
      <div className="scroll-reveal">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Development Process
        </p>
        <h2 className="mt-2 text-2xl font-bold">어떻게 만들었나</h2>
      </div>

      <FadeInUp className="mt-8">
        <p className="mx-auto max-w-2xl text-center leading-relaxed text-muted-foreground">
          {devProcess.description}
        </p>
      </FadeInUp>

      {/* Team composition */}
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {devProcess.team.map((member, i) => (
          <FadeInUp key={member.role} delay={i * 0.08}>
            <div className="rounded-lg border border-border p-4 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-sm font-bold">
                {member.role}
              </span>
              <p className="mt-2 text-sm font-semibold">{member.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {member.description}
              </p>
            </div>
          </FadeInUp>
        ))}
      </div>

      {/* Development cycle flow */}
      <FadeInUp delay={0.3} className="mt-12">
        <h3 className="text-center text-lg font-semibold">개발 싸이클</h3>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {devProcess.cycle.map((step, i) => (
            <div key={step} className="flex items-center gap-2 whitespace-nowrap">
              <span className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium">
                {step}
              </span>
              {i < devProcess.cycle.length - 1 && (
                <svg
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </FadeInUp>

      {/* Document links */}
      <FadeInUp delay={0.4} className="mt-12">
        <h3 className="text-center text-lg font-semibold">산출물</h3>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {devProcess.documents.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {doc.title}
              <span className="sr-only">(새 탭에서 열기)</span>
            </a>
          ))}
        </div>
      </FadeInUp>
    </section>
  );
}
