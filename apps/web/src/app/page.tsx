import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedPosts, PostCard } from "@/features/blog";
import { getFeaturedProjects, ProjectCard } from "@/features/portfolio";

export default function Home() {
  const recentPosts = getPublishedPosts().slice(0, 3);
  const featuredProjects = getFeaturedProjects();

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-4 py-20">
        <p className="text-muted-foreground">안녕하세요, 저는</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
          황주찬입니다.
        </h1>
        <p className="mt-4 max-w-[480px] text-lg leading-relaxed text-muted-foreground">
          제품과 함께 성장하는 프론트엔드 개발자입니다.
        </p>
      </section>

      <hr className="mx-auto max-w-[1100px] border-border" />

      {/* Featured Projects */}
      <section className="mx-auto max-w-[1100px] px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">추천 프로젝트</h2>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            모든 프로젝트 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
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
            전체 글 보기 <ArrowRight className="h-3.5 w-3.5" />
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
    </>
  );
}
