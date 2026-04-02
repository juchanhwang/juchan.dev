import Link from "next/link";
import type { Project } from "../lib/projects";

interface ProjectLinksProps {
  demoUrl?: string;
  githubUrl?: string;
  relatedPosts?: { title: string; href: string }[];
  nextProject: Project | null;
}

export function ProjectLinks({
  demoUrl,
  githubUrl,
  relatedPosts,
  nextProject,
}: ProjectLinksProps) {
  return (
    <section id="links" className="mx-auto max-w-3xl px-4 py-20">
      <div className="scroll-reveal flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            GitHub{" "}
            <span className="sr-only">(새 탭에서 열기)</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            Demo{" "}
            <span className="sr-only">(새 탭에서 열기)</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
        {relatedPosts?.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            관련 글 ↗
          </Link>
        ))}
      </div>

      {nextProject?.slug && (
        <>
          <hr className="mx-auto mt-12 max-w-xs border-border" />
          <div className="scroll-reveal mt-12 text-center">
            <p className="text-sm text-muted-foreground">다음 프로젝트</p>
            <Link
              href={`/projects/${nextProject.slug}`}
              className="mt-3 inline-block text-xl font-semibold transition-colors hover:text-foreground/80"
            >
              {nextProject.emoji} {nextProject.title} →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
