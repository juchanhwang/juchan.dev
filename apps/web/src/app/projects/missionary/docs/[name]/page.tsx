import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const VALID_DOCS = [
  "participation-prd",
  "participation-design-spec",
  "participation-fe-plan",
  "participation-be-plan",
  "user-interview",
] as const;

type DocName = (typeof VALID_DOCS)[number];

const DOC_TITLES: Record<DocName, string> = {
  "participation-prd": "PRD — 등록 관리",
  "participation-design-spec": "디자인 스펙 — 등록 관리",
  "participation-fe-plan": "FE 테크스펙 — 등록 관리",
  "participation-be-plan": "BE 테크스펙 — 등록 관리",
  "user-interview": "유저 인터뷰 — 정OO",
};

interface Props {
  params: Promise<{ name: string }>;
}

function isValidDoc(name: string): name is DocName {
  return VALID_DOCS.includes(name as DocName);
}

async function getDocContent(name: DocName): Promise<string> {
  const filePath = join(
    process.cwd(),
    "public",
    "projects",
    "missionary",
    "docs",
    `${name}.md`,
  );
  const markdown = await readFile(filePath, "utf-8");

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      keepBackground: true,
    })
    .use(rehypeStringify)
    .process(markdown);

  return String(result);
}

export function generateStaticParams() {
  return VALID_DOCS.map((name) => ({ name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  if (!isValidDoc(name)) return {};

  return {
    title: `${DOC_TITLES[name]} — missionary`,
    description: `missionary 프로젝트 산출물: ${DOC_TITLES[name]}`,
  };
}

export default async function DocPage({ params }: Props) {
  const { name } = await params;

  if (!isValidDoc(name)) {
    notFound();
  }

  const html = await getDocContent(name);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/projects/missionary"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        missionary 케이스 스터디로 돌아가기
      </Link>

      <article
        className="prose mt-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
