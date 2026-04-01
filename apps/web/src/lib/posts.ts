import { posts } from "#velite";

export function getPublishedPosts() {
  return posts
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllTags() {
  const published = getPublishedPosts();
  const tagCount = new Map<string, number>();

  for (const post of published) {
    for (const tag of post.tags) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

export function filterPostsByTags(tags: string[]) {
  const published = getPublishedPosts();
  if (tags.length === 0) return published;
  return published.filter((post) =>
    tags.some((tag) => post.tags.includes(tag)),
  );
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(dateString))
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}
