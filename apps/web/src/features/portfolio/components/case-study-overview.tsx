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
      <FadeInUp>
        <div className="mx-auto max-w-2xl space-y-4 text-center text-[1.05rem] leading-[1.85] text-muted-foreground">
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
