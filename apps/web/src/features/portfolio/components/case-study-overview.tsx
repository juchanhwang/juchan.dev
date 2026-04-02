"use client";

import { FadeInUp } from "../animation/fade-in-up";

interface MetaItem {
  label: string;
  value: string;
}

interface CaseStudyOverviewProps {
  role: string;
  period: string;
  teamSize: string;
  overview: string;
  overviewLink?: { title: string; href: string };
}

export function CaseStudyOverview({
  role,
  period,
  teamSize,
  overview,
  overviewLink,
}: CaseStudyOverviewProps) {
  const metaItems: MetaItem[] = [
    { label: "역할", value: role },
    { label: "기간", value: period },
    { label: "팀 규모", value: teamSize },
  ];

  return (
    <section id="overview" className="mx-auto max-w-[1100px] px-4 py-20">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metaItems.map((item, i) => (
          <FadeInUp key={item.label} delay={i * 0.1}>
            <div className="rounded-lg border border-border p-6 text-center">
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.label}
              </p>
            </div>
          </FadeInUp>
        ))}
      </div>

      <FadeInUp delay={0.4}>
        <p className="mx-auto mt-8 max-w-2xl text-center leading-relaxed text-muted-foreground">
          {overview}
        </p>
      </FadeInUp>

      {overviewLink && (
        <FadeInUp delay={0.6} className="mt-6 text-center">
          <a
            href={overviewLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
          >
            {overviewLink.title}
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
              />
            </svg>
            <span className="sr-only">(새 탭에서 열기)</span>
          </a>
        </FadeInUp>
      )}
    </section>
  );
}
