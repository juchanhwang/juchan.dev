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
}

export function CaseStudyOverview({
  role,
  period,
  teamSize,
  overview,
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
        <div className="mx-auto mt-10 max-w-2xl space-y-4 text-center text-[1.05rem] leading-[1.85] text-muted-foreground">
          {overview.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              dangerouslySetInnerHTML={{
                __html: paragraph.replace(
                  /(\d[\d,.]*[~\-]\d[\d,.]*\s*[명개만]+|\d[\d,.]*\s*[명개만]+|[\d]+[개%+])/g,
                  '<strong class="text-foreground font-semibold">$1</strong>'
                ),
              }}
            />
          ))}
        </div>
      </FadeInUp>
    </section>
  );
}
