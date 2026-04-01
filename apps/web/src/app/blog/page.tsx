import type { Metadata } from "next";
import { Suspense } from "react";
import {
  filterPostsByTags,
  getAllTags,
  PostCard,
  TagFilter,
} from "@/features/blog";

export const metadata: Metadata = {
  title: "블로그",
  description: "프론트엔드 개발, React, TypeScript에 대한 기술 블로그",
};

interface BlogPageProps {
  searchParams: Promise<{ tag?: string | string[] }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;
  const selectedTags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
  const allTags = getAllTags();
  const posts = filterPostsByTags(selectedTags);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">블로그</h1>

      <div className="mt-6">
        <Suspense fallback={null}>
          <TagFilter tags={allTags} />
        </Suspense>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.slugAsParams}
              title={post.title}
              description={post.description}
              date={post.date}
              tags={post.tags}
              readingTime={post.metadata.readingTime}
              permalink={post.permalink}
            />
          ))
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            선택한 태그에 해당하는 포스트가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
