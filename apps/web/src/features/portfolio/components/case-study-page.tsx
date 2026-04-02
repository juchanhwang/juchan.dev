"use client";

import dynamic from "next/dynamic";
import { MotionConfig } from "motion/react";
import type { Project } from "../lib/projects";
import { CaseStudyHero } from "./case-study-hero";
import { CaseStudyOverview } from "./case-study-overview";
import { SectionProgress } from "./section-progress";

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
          <DevProcessSection devProcess={caseStudy.devProcess} tech={project.tags} overviewLink={caseStudy.overviewLink} />
        </>
      )}

      <hr className="mx-auto max-w-3xl border-border" />

      <ResultMetrics
        metrics={caseStudy.metrics}
        resultContent={caseStudy.resultContent}
        screenshots={caseStudy.screenshots}
        demoVideo={caseStudy.demoVideo}
      />

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
