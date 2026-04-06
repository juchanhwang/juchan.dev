import { ViewCount } from "@/features/views";

import { formatDate } from "../lib/posts";

interface PostHeaderProps {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  readingTime: number;
}

export function PostHeader({
  title,
  slug,
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
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <span>{formatDate(date)}</span>
        <span aria-hidden="true">·</span>
        <span>{readingTime}분 읽기</span>
        {/*
         * ViewCount가 null(숨김)일 때 leading separator가 남지 않도록
         * `before:` 유틸리티로 separator를 ViewCount 자체에 귀속시킨다.
         */}
        <ViewCount
          type="blog"
          slug={slug}
          className="before:mr-2 before:text-muted-foreground before:content-['·']"
        />
      </div>
      <hr className="mt-6 border-border" />
    </header>
  );
}
