import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdjacentPosts,
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
  formatDate,
  PostHeader,
  TableOfContents,
  PostNavigation,
  ReadingProgressBar,
} from "@/features/blog";
import { MDXContent } from "@/features/mdx";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

async function resolveSlug(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  return decodeURIComponent(slug).normalize("NFC");
}

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({
    slug: post.slugAsParams,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const slug = await resolveSlug(params);
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const slug = await resolveSlug(params);
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const relatedPosts = getRelatedPosts(slug);

  return (
    <>
      <ReadingProgressBar />
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <PostHeader
          title={post.title}
          date={post.date}
          tags={post.tags}
          readingTime={post.metadata.readingTime}
        />

        <div className="relative mt-8">
          <article className="prose">
            <MDXContent code={post.body} />
          </article>

          <TableOfContents items={post.toc} />
        </div>

        <hr className="mt-12 border-border" />

        {relatedPosts.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">관련 포스트</h3>
            <div className="flex flex-col gap-2">
              {relatedPosts.map((related) => (
                <a
                  key={related.slugAsParams}
                  href={related.permalink}
                  className="flex items-center justify-between text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>· {related.title}</span>
                  <span className="shrink-0 text-xs">
                    {formatDate(related.date)}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <PostNavigation
            prev={prev ? { title: prev.title, permalink: prev.permalink } : null}
            next={next ? { title: next.title, permalink: next.permalink } : null}
          />
        </div>

        <div className="mt-12 rounded-lg border border-border p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Giscus 댓글 영역 (GitHub Discussions 연동 예정)
          </p>
        </div>
      </div>
    </>
  );
}
