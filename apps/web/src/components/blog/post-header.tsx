import { formatDate } from "@/lib/posts";

interface PostHeaderProps {
  title: string;
  date: string;
  tags: string[];
  readingTime: number;
}

export function PostHeader({
  title,
  date,
  tags,
  readingTime,
}: PostHeaderProps) {
  return (
    <header>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      <h1 className="mt-4 font-extrabold leading-tight tracking-tight" style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)" }}>
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {formatDate(date)} · {readingTime}분 읽기
      </p>
      <hr className="mt-6 border-border" />
    </header>
  );
}
