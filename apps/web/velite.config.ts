import { defineCollection, defineConfig, s } from "velite";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(99),
      slug: s.path(),
      date: s.isodate(),
      description: s.string().max(999),
      tags: s.array(s.string()).default([]),
      series: s.string().optional(),
      draft: s.boolean().default(false),
      thumbnail: s.image().optional(),
      toc: s.toc(),
      metadata: s.metadata(),
      body: s.mdx(),
    })
    .transform((data) => {
      const slugAsParams = data.slug
        .split("/")
        .slice(1)
        .join("/")
        .normalize("NFC");
      return {
        ...data,
        slugAsParams,
        permalink: `/blog/${slugAsParams}`,
      };
    }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            light: "github-light",
            dark: "github-dark-dimmed",
          },
          keepBackground: false,
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
  },
});
