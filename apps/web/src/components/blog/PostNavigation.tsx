import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PostNavigationProps {
  prevPost?: { slug: string; title: string } | null;
  nextPost?: { slug: string; title: string } | null;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  return (
    <nav className="flex items-stretch gap-4" aria-label="이전/다음 포스트 네비게이션">
      {prevPost ? (
        <Link
          href={`/blog/${prevPost.slug}`}
          className="flex flex-1 items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">이전 글</p>
            <p className="mt-0.5 truncate text-sm font-medium">{prevPost.title}</p>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {nextPost ? (
        <Link
          href={`/blog/${nextPost.slug}`}
          className="flex flex-1 items-center justify-end gap-3 rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted/50"
        >
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">다음 글</p>
            <p className="mt-0.5 truncate text-sm font-medium">{nextPost.title}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
