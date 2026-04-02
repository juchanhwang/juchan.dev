import type { Project } from "../lib/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl">
        {project.emoji}
      </div>
      <h3 className="mt-3 font-semibold">{project.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ↗ Demo
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ↗ GitHub
          </a>
        )}
      </div>
    </article>
  );
}
