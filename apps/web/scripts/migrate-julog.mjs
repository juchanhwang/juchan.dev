/**
 * julog (Gatsby) → juchan.dev (Velite MDX) 마이그레이션 스크립트
 *
 * 변환:
 * - frontmatter: category → tags, date 정규화, description 자동 추출
 * - 파일명: kebab-case slug 생성
 * - 확장자: .md → .mdx
 * - 이미지/미디어: 참조된 파일만 복사
 * - MDX 호환: <br> → <br />, HTML 주석 제거
 */

import fs from "fs/promises";
import path from "path";

const SOURCE = "/Users/JuChan/Documents/FE/julog/content/blog";
const TARGET = "/Users/JuChan/Documents/FE/juchan.dev/apps/web/content/posts";

// --- Slug 생성 ---

function toSlug(filename) {
  // 확장자 제거
  let name = filename.replace(/\.md$/, "");

  // 특수문자 정리
  name = name
    .replace(/[<>(){}[\]@#$%^&*+=|\\:;"'`~,!?]/g, "")
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/\.+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  // 빈 slug 방지
  if (!name) name = "untitled";

  return name;
}

// --- Frontmatter 파싱 ---

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of raw.split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      let [, key, value] = kv;
      // 따옴표 제거
      value = value.replace(/^['"](.*)['"]$/, "$1").trim();
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

// --- Description 추출 ---

function extractDescription(body, title) {
  const lines = body.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // 빈 줄, 헤딩, 이미지, HTML, 코드블록 건너뛰기
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("!")) continue;
    if (trimmed.startsWith("<")) continue;
    if (trimmed.startsWith("```")) continue;
    if (trimmed.startsWith("|")) continue;
    if (trimmed.startsWith(">")) continue;
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) continue;

    // 마크다운 서식 제거
    let desc = trimmed
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) → text
      .replace(/[*_`~]/g, "") // bold/italic/code
      .replace(/\s+/g, " ")
      .trim();

    if (desc.length < 10) continue;

    // 160자 제한
    if (desc.length > 160) {
      desc = desc.slice(0, 157) + "...";
    }
    // YAML double-quote 호환: 백슬래시 이스케이프
    desc = desc.replace(/\\/g, "\\\\");
    return desc;
  }

  return title;
}

// --- 날짜 정규화 ---

function normalizeDate(dateStr) {
  // "2019-1-1 16:21:13" → "2019-01-01"
  const match = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return dateStr;

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// --- 카테고리 → 태그 매핑 ---

const CATEGORY_TO_TAGS = {
  JavaScript: ["JavaScript"],
  TypeScript: ["TypeScript"],
  Angular: ["Angular"],
  NextJS: ["Next.js"],
  "Today I Learned": ["TIL"],
  development: ["Development"],
  Test: ["Testing"],
  Algorithm: ["Algorithm"],
};

function categoryToTags(category) {
  return CATEGORY_TO_TAGS[category] || [category];
}

// --- MDX 호환 변환 ---

function fixMdxContent(body) {
  let result = body
    // <br> → <br />
    .replace(/<br\s*>/gi, "<br />")
    .replace(/<br\/>/gi, "<br />")
    // HTML 주석 제거 (MDX 비호환)
    .replace(/<!--[\s\S]*?-->/g, "")
    // void 태그 셀프클로징 보장
    .replace(/<(img|source|input|hr|meta|link|area|col|embed|track|wbr)\s([^>]*?)(?<!\/)>/gi, "<$1 $2 />")
    .replace(/<(img|source|input|hr|meta|link|area|col|embed|track|wbr)>/gi, "<$1 />");

  // 코드블록 외부의 bare < > 이스케이프 (JSX 오류 방지)
  const lines = result.split("\n");
  let inCodeBlock = false;
  const fixed = lines.map((line) => {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock) return line;

    // <https://url> autolink → [url](url)
    line = line.replace(/<(https?:\/\/[^>]+)>/g, "[$1]($1)");

    // 헤딩/본문의 제네릭 표현: Partial<T> → Partial\<T\>
    line = line.replace(
      /(\w)<([A-Z*][^>]*)>/g,
      (m, pre, inner) => `${pre}\\<${inner}\\>`,
    );
  });
  return fixed.join("\n");
}

// --- 이미지/미디어 참조 추출 ---

function extractMediaRefs(body) {
  const refs = new Set();
  // HTML: src="./images/file name.png"
  const htmlPattern = /src=["']\.\/(images|sources)\/([^"']+)["']/g;
  let match;
  while ((match = htmlPattern.exec(body)) !== null) {
    refs.add(`./${match[1]}/${match[2]}`);
  }
  // Markdown: ![alt](./images/foo.png)
  const mdPattern = /\]\(\.\/(images|sources)\/([^)]+)\)/g;
  while ((match = mdPattern.exec(body)) !== null) {
    refs.add(`./${match[1]}/${match[2]}`);
  }
  return Array.from(refs);
}

// --- 메인 ---

async function migrate() {
  const categories = await fs.readdir(SOURCE);
  const stats = { total: 0, migrated: 0, skipped: 0, images: 0 };
  const slugMap = new Map(); // slug 충돌 감지

  for (const category of categories) {
    const catPath = path.join(SOURCE, category);
    const catStat = await fs.stat(catPath);
    if (!catStat.isDirectory()) continue;

    const files = await fs.readdir(catPath);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      stats.total++;
      const filePath = path.join(catPath, file);
      const raw = await fs.readFile(filePath, "utf-8");

      const { frontmatter, body } = parseFrontmatter(raw);

      // slug 생성
      let slug = toSlug(file);

      // slug 충돌 처리
      if (slugMap.has(slug)) {
        const catSlug = toSlug(category);
        slug = `${catSlug}-${slug}`;
      }
      slugMap.set(slug, filePath);

      // frontmatter 변환
      let title = frontmatter.title || file.replace(/\.md$/, "");
      if (title.length > 99) title = title.slice(0, 96) + "...";
      const date = normalizeDate(frontmatter.date || "2020-01-01");
      const tags = categoryToTags(frontmatter.category || category);
      const draft = frontmatter.draft === "true";
      const description = extractDescription(body, title);

      // MDX 호환 변환
      const fixedBody = fixMdxContent(body);

      // 새 frontmatter 작성
      const newFrontmatter = [
        "---",
        `title: "${title.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
        `date: "${date}"`,
        `description: "${description.replace(/"/g, '\\"')}"`,
        `tags: [${tags.map((t) => `"${t}"`).join(", ")}]`,
        `draft: ${draft}`,
        "---",
      ].join("\n");

      const output = `${newFrontmatter}\n${fixedBody}`;

      // 디렉토리 생성
      const postDir = path.join(TARGET, slug);
      await fs.mkdir(postDir, { recursive: true });

      // .mdx 파일 작성
      await fs.writeFile(path.join(postDir, "index.mdx"), output, "utf-8");

      // 이미지/미디어 복사
      const mediaRefs = extractMediaRefs(body);
      for (const ref of mediaRefs) {
        const srcMedia = path.join(catPath, ref);
        const subfolder = ref.startsWith("./images/") ? "images" : "sources";
        const mediaName = path.basename(ref);
        const destDir = path.join(postDir, subfolder);

        try {
          await fs.mkdir(destDir, { recursive: true });
          await fs.copyFile(srcMedia, path.join(destDir, mediaName));
          stats.images++;
        } catch {
          console.warn(`  ⚠ 미디어 복사 실패: ${srcMedia}`);
        }
      }

      stats.migrated++;
    }
  }

  console.log("\n=== 마이그레이션 완료 ===");
  console.log(`총 포스트: ${stats.total}`);
  console.log(`마이그레이션: ${stats.migrated}`);
  console.log(`이미지/미디어: ${stats.images}개 복사`);
}

migrate().catch(console.error);
