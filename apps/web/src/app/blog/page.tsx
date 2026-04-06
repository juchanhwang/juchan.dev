import type { Metadata } from "next";
import { Suspense } from "react";
import {
  filterPostsByTags,
  getAllTags,
  PostCard,
  TagFilter,
} from "@/features/blog";
import { getViewCounts } from "@/features/views";

export const metadata: Metadata = {
  title: "블로그",
  description: "프론트엔드 개발, React, TypeScript에 대한 기술 블로그",
};

/**
 * ISR — 리스팅 카드에 view count를 주입하기 위해 60초마다 재생성.
 * 더 짧은 주기는 Redis 호출 비용이 커지고, 더 긴 주기는 UX가 stale해진다.
 */
export const revalidate = 60;

interface BlogPageProps {
  searchParams: Promise<{ tag?: string | string[] }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;
  const selectedTags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
  const allTags = getAllTags();
  const posts = filterPostsByTags(selectedTags);

  const viewCounts = await getViewCounts(
    "blog",
    posts.map((post) => post.slugAsParams),
  );

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
              viewCount={viewCounts[post.slugAsParams]}
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
