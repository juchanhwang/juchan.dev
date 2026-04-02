import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectSlugs,
  getNextProject,
} from "@/features/portfolio";
import { CaseStudyPage } from "@/features/portfolio/components/case-study-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return {};

  return {
    title: `${project.title} — 케이스 스터디`,
    description: project.caseStudy?.overview ?? project.description,
  };
}

export default async function ProjectCaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project?.caseStudy) {
    notFound();
  }

  const { caseStudy } = project;
  const nextProject = getNextProject(slug);

  return (
    <CaseStudyPage
      project={{ ...project, caseStudy }}
      nextProject={nextProject}
    />
  );
}
