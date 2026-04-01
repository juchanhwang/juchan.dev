import { notFound } from "next/navigation";
import { posts, dummyPostBody } from "@/lib/dummy-data";
import { PostHeader } from "@/components/blog/PostHeader";
import { TOC } from "@/components/blog/TOC";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { Separator } from "@/components/ui/separator";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const postIndex = posts.findIndex((p) => p.slug === slug);

  if (postIndex === -1) notFound();

  const post = posts[postIndex];
  const prevPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null;
  const nextPost = postIndex > 0 ? posts[postIndex - 1] : null;
  const relatedPosts = posts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  // Convert markdown-like content to HTML for demo
  const bodyHtml = dummyPostBody
    .replace(/^### (.+)$/gm, '<h3 id="$1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 id="$1">$1</h2>')
    .replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/```(\w+)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hbpuloc])(.+)$/gm, "<p>$1</p>");

  return (
    <>
      <ReadingProgressBar />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <PostHeader post={post} />

        {/* Mobile TOC */}
        <div className="mt-6 xl:hidden">
          <TOC />
        </div>

        <div className="relative mt-8 xl:flex xl:gap-12">
          {/* Post body */}
          <div
            className="prose min-w-0 flex-1"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {/* Desktop TOC */}
          <div className="hidden xl:block">
            <TOC />
          </div>
        </div>

        <Separator className="my-12" />

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">관련 포스트</h2>
            <ul className="space-y-2">
              {relatedPosts.map((rp) => (
                <li key={rp.slug} className="flex items-center justify-between text-sm">
                  <a
                    href={`/blog/${rp.slug}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    · {rp.title}
                  </a>
                  <span className="text-xs text-muted-foreground">{rp.date}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <PostNavigation prevPost={prevPost} nextPost={nextPost} />

        {/* Giscus placeholder */}
        <section className="mt-12 rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            💬 Giscus 댓글 영역 (GitHub Discussions 연동 예정)
          </p>
        </section>
      </article>
    </>
  );
}
