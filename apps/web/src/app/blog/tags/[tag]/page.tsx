import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { posts } from "@/lib/dummy-data";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} 태그의 글`,
    description: `${decoded} 관련 기술 글 모음`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const filtered = posts.filter((p) => p.tags.includes(decoded));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        전체 태그 목록
      </Link>

      <h1 className="mt-4 text-3xl font-bold">
        #{decoded}{" "}
        <span className="text-muted-foreground">({filtered.length}개)</span>
      </h1>

      <div className="mt-8 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            해당 태그의 포스트가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
