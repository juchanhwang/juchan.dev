"use client";

import { FadeInUp } from "../animation/fade-in-up";

interface CaseStudyOverviewProps {
  overview: string;
}

export function CaseStudyOverview({
  overview,
}: CaseStudyOverviewProps) {
  return (
    <section id="overview" className="mx-auto max-w-[1100px] px-4 py-20">
      <div className="scroll-reveal">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Overview
        </p>
        <h2 className="mt-2 text-2xl font-bold">프로젝트 배경</h2>
      </div>

      <FadeInUp delay={0.2}>
        <div className="mx-auto mt-8 max-w-2xl space-y-4 text-[1.05rem] leading-[1.85] text-muted-foreground">
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
