import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TagBadgeProps {
  tag: string;
  linked?: boolean;
}

export function TagBadge({ tag, linked = true }: TagBadgeProps) {
  const badge = (
    <Badge
      variant="secondary"
      className="cursor-pointer text-xs font-normal transition-colors hover:bg-muted-foreground/20"
    >
      {tag}
    </Badge>
  );

  if (!linked) return badge;

  return (
    <Link href={`/blog/tags/${encodeURIComponent(tag)}`}>{badge}</Link>
  );
}
