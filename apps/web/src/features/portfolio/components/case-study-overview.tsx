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
  contribution: string;
  tech: string[];
  overview: string;
}

export function CaseStudyOverview({
  role,
  period,
  teamSize,
  contribution,
  tech,
  overview,
}: CaseStudyOverviewProps) {
  const metaItems: MetaItem[] = [
    { label: "역할", value: role },
    { label: "기간", value: period },
    { label: "팀 규모", value: teamSize },
    { label: "기여도", value: contribution },
  ];

  return (
    <section id="overview" className="mx-auto max-w-[1100px] px-4 py-20">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

      <FadeInUp delay={0.4} className="mt-8 flex flex-wrap justify-center gap-2">
        {tech.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </FadeInUp>

      <FadeInUp delay={0.5}>
        <p className="mx-auto mt-8 max-w-2xl text-center leading-relaxed text-muted-foreground">
          {overview}
        </p>
      </FadeInUp>
    </section>
  );
}
