import Link from "next/link";
import { getPublishedPosts, PostCard } from "@/features/blog";

const FEATURED_PROJECTS = [
  {
    emoji: "🚀",
    name: "juchan.dev",
    description: "기술 블로그 + 포트폴리오 통합 사이트. Next.js 16, MDX 기반.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    links: {
      demo: "https://juchan.dev",
      github: "https://github.com/juchanhwang/juchan.dev",
    },
  },
  {
    emoji: "⛪",
    name: "missionary",
    description: "교회 선교 관리 플랫폼. Next.js + NestJS 모노레포.",
    tags: ["Next.js", "NestJS", "PostgreSQL"],
    links: {
      github: "https://github.com/juchanhwang/missionary",
    },
  },
] as const;

export default function Home() {
  const recentPosts = getPublishedPosts().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-4 py-20">
        <p className="text-muted-foreground">안녕하세요, 저는</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
          황주찬입니다.
        </h1>
        <p className="mt-4 max-w-[480px] text-lg leading-relaxed text-muted-foreground">
          프론트엔드 개발자 &mdash; 읽기 쉬운 코드와 빠른 UI를 만듭니다.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/blog"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            블로그 읽기 →
          </Link>
          <Link
            href="/projects"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            프로젝트 보기
          </Link>
        </div>
      </section>

      <hr className="mx-auto max-w-[1100px] border-border" />

      {/* Recent Posts */}
      <section className="mx-auto max-w-[1100px] px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">최근 글</h2>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            전체 글 보기 →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <PostCard
              key={post.slugAsParams}
              title={post.title}
              description={post.description}
              date={post.date}
              tags={post.tags}
              readingTime={post.metadata.readingTime}
              permalink={post.permalink}
            />
          ))}
        </div>
      </section>

      <hr className="mx-auto max-w-[1100px] border-border" />

      {/* Featured Projects */}
      <section className="mx-auto max-w-[1100px] px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">추천 프로젝트</h2>
          <Link
            href="/projects"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            모든 프로젝트 →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURED_PROJECTS.map((project) => (
            <article
              key={project.name}
              className="rounded-lg border border-border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl">
                {project.emoji}
              </div>
              <h3 className="mt-3 font-semibold">{project.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
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
              <div className="mt-3 flex gap-3">
                {"demo" in project.links && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    ↗ Demo
                  </a>
                )}
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  ↗ GitHub
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
