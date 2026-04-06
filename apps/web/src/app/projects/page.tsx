import type { Metadata } from "next";
import { projects, ProjectCard } from "@/features/portfolio";
import { getViewCounts } from "@/features/views";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "주찬황의 프로젝트 포트폴리오",
};

/**
 * ISR — 카드에 view count를 주입하기 위해 60초마다 재생성.
 */
export const revalidate = 60;

export default async function ProjectsPage() {
  const sorted = [...projects].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  // slug가 있는 프로젝트만 view count 조회 대상 (case study 없는 프로젝트는 제외).
  const slugs = sorted
    .map((project) => project.slug)
    .filter((slug): slug is string => typeof slug === "string");
  const viewCounts = await getViewCounts("project", slugs);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12">
      <h1 className="text-3xl font-bold">프로젝트</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {sorted.map((project) => (
          <ProjectCard
            key={project.title}
            project={project}
            viewCount={project.slug ? viewCounts[project.slug] : undefined}
          />
        ))}
      </div>
    </div>
  );
}
