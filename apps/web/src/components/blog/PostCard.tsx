import Link from "next/link";
import type { Post } from "@/lib/dummy-data";
import { TagBadge } from "./TagBadge";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group rounded-lg border border-border p-5 transition-colors hover:bg-muted/50">
      <Link href={`/blog/${post.slug}`} className="block">
        <h2 className="text-lg font-semibold leading-snug group-hover:text-link">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {post.date} · {post.readingTime}분 읽기
        </span>
      </div>
    </article>
  );
}
