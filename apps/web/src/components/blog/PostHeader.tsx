import type { Post } from "@/lib/dummy-data";
import { TagBadge } from "./TagBadge";
import { Separator } from "@/components/ui/separator";

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <header>
      <div className="flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
      <h1 className="mt-4 text-[clamp(2rem,5vw,2.5rem)] font-extrabold leading-[1.4] tracking-[-0.02em]">
        {post.title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {post.date} · {post.readingTime}분 읽기
      </p>
      <Separator className="mt-6" />
    </header>
  );
}
