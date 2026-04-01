import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/dummy-data";

interface ProjectCardProps {
  project: Project;
}

function GitHubSmallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group flex flex-col rounded-lg border border-border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-3 aspect-video w-full overflow-hidden rounded-md bg-muted">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <span className="text-4xl">🚀</span>
        </div>
      </div>
      <h3 className="text-base font-semibold">{project.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.techStack.map((tech) => (
          <Badge key={tech} variant="secondary" className="text-xs font-normal">
            {tech}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        {project.demoUrl && (
          <Link
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Demo
          </Link>
        )}
        {project.githubUrl && (
          <Link
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubSmallIcon className="h-3.5 w-3.5" />
            GitHub
          </Link>
        )}
      </div>
    </article>
  );
}
