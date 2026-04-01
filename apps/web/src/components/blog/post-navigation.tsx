import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PostNavItem {
  title: string;
  permalink: string;
}

interface PostNavigationProps {
  prev: PostNavItem | null;
  next: PostNavItem | null;
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="flex gap-4" aria-label="이전/다음 포스트">
      {prev ? (
        <Link
          href={prev.permalink}
          className="flex flex-1 flex-col rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="size-3" />
            이전 글
          </span>
          <span className="mt-1 text-sm font-medium">{prev.title}</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.permalink}
          className="flex flex-1 flex-col items-end rounded-lg border border-border p-4 text-right transition-colors hover:bg-secondary/50"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            다음 글
            <ChevronRight className="size-3" />
          </span>
          <span className="mt-1 text-sm font-medium">{next.title}</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
