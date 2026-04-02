import Link from "next/link";
import { formatDate } from "../lib/posts";

interface PostCardProps {
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: number;
  permalink: string;
}

export function PostCard({
  title,
  description,
  date,
  tags,
  readingTime,
  permalink,
}: PostCardProps) {
  return (
    <article>
      <Link
        href={permalink}
        className="flex h-full flex-col rounded-lg border border-border p-5 transition-colors hover:bg-secondary/50"
      >
        <h2 className="text-lg font-semibold leading-snug text-foreground">
          {title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDate(date)} · {readingTime}분 읽기
          </span>
        </div>
      </Link>
    </article>
  );
}
