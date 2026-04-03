"use client";

import dynamic from "next/dynamic";
import { MotionConfig } from "motion/react";
import type { Project } from "../lib/projects";
import { CaseStudyHero } from "./case-study-hero";
import { CaseStudyOverview } from "./case-study-overview";
import { SectionProgress } from "./section-progress";
import { FadeInUp } from "../animation/fade-in-up";

const CaseStudyProblem = dynamic(
  () =>
    import("./case-study-problem").then((m) => ({
      default: m.CaseStudyProblem,
    })),
);
const ProcessTimeline = dynamic(
  () =>
    import("./process-timeline").then((m) => ({
      default: m.ProcessTimeline,
    })),
);
const DevProcessSection = dynamic(
  () =>
    import("./dev-process-section").then((m) => ({
      default: m.DevProcessSection,
    })),
);
const ResultMetrics = dynamic(
  () =>
    import("./result-metrics").then((m) => ({ default: m.ResultMetrics })),
  { ssr: false },
);
const WhatsNextSection = dynamic(
  () =>
    import("./whats-next-section").then((m) => ({
      default: m.WhatsNextSection,
    })),
);
const ProjectLinks = dynamic(
  () => import("./project-links").then((m) => ({ default: m.ProjectLinks })),
);

interface CaseStudyPageProps {
  project: Project & { caseStudy: NonNullable<Project["caseStudy"]> };
  nextProject: Project | null;
}

export function CaseStudyPage({ project, nextProject }: CaseStudyPageProps) {
  const { caseStudy } = project;

  return (
    <MotionConfig reducedMotion="user">
      <SectionProgress />

      <CaseStudyHero
        title={project.title}
        impact={caseStudy.impact}
        category={caseStudy.category}
        role={caseStudy.role}
        period={caseStudy.period}
        teamSize={caseStudy.teamSize}
        status={caseStudy.status}
      />

      <CaseStudyOverview
        overview={caseStudy.overview}
      />

      <hr className="mx-auto max-w-3xl border-border" />

      <CaseStudyProblem
        callout={caseStudy.problemCallout}
        content={caseStudy.problemContent}
        asIsTable={caseStudy.asIsTable}
      />

      <hr className="mx-auto max-w-3xl border-border" />

      <ProcessTimeline steps={caseStudy.processSteps} intro={caseStudy.processIntro} />

      {caseStudy.devProcess && (
        <>
          <hr className="mx-auto max-w-3xl border-border" />
          <DevProcessSection
            devProcess={caseStudy.devProcess}
            tech={project.tags}
            overviewLink={caseStudy.overviewLink}
          />
        </>
      )}

      {(caseStudy.metrics.length > 0 || caseStudy.screenshots || caseStudy.demoVideo) && (
        <>
          <hr className="mx-auto max-w-3xl border-border" />
          <ResultMetrics
            metrics={caseStudy.metrics}
            screenshots={caseStudy.screenshots}
            demoVideo={caseStudy.demoVideo}
          />
        </>
      )}

      {caseStudy.roadmap && (
        <>
          <hr className="mx-auto max-w-3xl border-border" />
          <WhatsNextSection roadmap={caseStudy.roadmap} />
        </>
      )}

      <hr className="mx-auto max-w-3xl border-border" />

      <section id="retrospective" className="mx-auto max-w-[1100px] px-4 py-20">
        <FadeInUp>
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Retrospective
          </p>
          <h2 className="mt-2 text-2xl font-bold">회고</h2>
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <div className="mt-6 text-[1.05rem] leading-[1.85] text-muted-foreground">
            {caseStudy.resultContent.split("\n\n").map((paragraph, i) => (
              <p key={i} className={i > 0 ? "mt-3" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </FadeInUp>
      </section>

      <hr className="mx-auto max-w-3xl border-border" />

      <ProjectLinks
        demoUrl={project.demoUrl}
        githubUrl={project.githubUrl}
        relatedPosts={caseStudy.relatedPosts}
        nextProject={nextProject}
      />
    </MotionConfig>
  );
}
