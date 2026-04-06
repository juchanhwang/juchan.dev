import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectSlugs,
  getNextProject,
} from "@/features/portfolio";
import { CaseStudyPage } from "@/features/portfolio/components/case-study-page";
import { ViewCount } from "@/features/views";

/**
 * ISR — 빌드 시 prerender 후 60초마다 재생성. ViewCount Server Component의
 * 초기 카운트가 SSG에 고정되지 않도록 한다. 실시간 보정은 ViewTracker가
 * mount 직후 수행한다.
 */
export const revalidate = 60;

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
      viewCountSlot={<ViewCount type="project" slug={slug} />}
    />
  );
}
