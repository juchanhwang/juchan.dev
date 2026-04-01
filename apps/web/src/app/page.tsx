import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { PostCard } from "@/components/blog/PostCard";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { Separator } from "@/components/ui/separator";
import { posts, projects } from "@/lib/dummy-data";

export default function HomePage() {
  const recentPosts = posts.slice(0, 3);
  const featuredProjects = projects.slice(0, 2);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <HeroSection />

      <Separator />

      {/* Recent Posts */}
      <section className="py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">최근 글</h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            전체 글 보기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Featured Projects */}
      <section className="py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">추천 프로젝트</h2>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            모든 프로젝트
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
