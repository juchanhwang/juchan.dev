import { PostCard } from "@/components/blog/PostCard";
import { posts, allTags } from "@/lib/dummy-data";
import { BlogFilter } from "./BlogFilter";

export const metadata = {
  title: "블로그",
  description: "프론트엔드 개발, React, TypeScript 등 기술 이야기",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">블로그</h1>

      <BlogFilter tags={allTags} />

      <div className="mt-8 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {/* Pagination placeholder */}
      <nav className="mt-12 flex items-center justify-center gap-2" aria-label="페이지네이션">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
          1
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted">
          2
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted">
          3
        </span>
      </nav>
    </div>
  );
}
