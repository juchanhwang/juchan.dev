import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { projects } from "@/lib/dummy-data";

export const metadata = {
  title: "프로젝트",
  description: "개발 프로젝트 쇼케이스",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">프로젝트</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}
