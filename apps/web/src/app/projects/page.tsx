import type { Metadata } from "next";
import { projects, ProjectCard } from "@/features/portfolio";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "주찬황의 프로젝트 포트폴리오",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12">
      <h1 className="text-3xl font-bold">프로젝트</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}
