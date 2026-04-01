import { describe, expect, it, vi } from "vitest";

vi.mock("#velite", () => ({
  posts: [
    {
      title: "최신 포스트",
      slug: "posts/latest",
      slugAsParams: "latest",
      permalink: "/blog/latest",
      date: "2026-04-01T00:00:00.000Z",
      description: "최신 포스트 설명",
      tags: ["React", "TypeScript"],
      draft: false,
      metadata: { readingTime: 5, wordCount: 1000 },
      toc: [],
      body: "",
    },
    {
      title: "두 번째 포스트",
      slug: "posts/second",
      slugAsParams: "second",
      permalink: "/blog/second",
      date: "2026-03-15T00:00:00.000Z",
      description: "두 번째 포스트 설명",
      tags: ["TypeScript", "Next.js"],
      draft: false,
      metadata: { readingTime: 3, wordCount: 600 },
      toc: [],
      body: "",
    },
    {
      title: "드래프트 포스트",
      slug: "posts/draft-post",
      slugAsParams: "draft-post",
      permalink: "/blog/draft-post",
      date: "2026-04-02T00:00:00.000Z",
      description: "공개 전 포스트",
      tags: ["React"],
      draft: true,
      metadata: { readingTime: 2, wordCount: 400 },
      toc: [],
      body: "",
    },
    {
      title: "가장 오래된 포스트",
      slug: "posts/oldest",
      slugAsParams: "oldest",
      permalink: "/blog/oldest",
      date: "2026-01-01T00:00:00.000Z",
      description: "오래된 포스트 설명",
      tags: ["CSS"],
      draft: false,
      metadata: { readingTime: 7, wordCount: 1400 },
      toc: [],
      body: "",
    },
    {
      title: "한글 슬러그 포스트",
      slug: "posts/에서-테스트",
      slugAsParams: "에서-테스트",
      permalink: "/blog/에서-테스트",
      date: "2026-02-01T00:00:00.000Z",
      description: "한글 slug 테스트",
      tags: ["React"],
      draft: false,
      metadata: { readingTime: 2, wordCount: 300 },
      toc: [],
      body: "",
    },
  ],
}));

import {
  getPublishedPosts,
  getAllTags,
  filterPostsByTags,
  getPostBySlug,
  getAdjacentPosts,
  getRelatedPosts,
  formatDate,
} from "../lib/posts";

describe("getPublishedPosts", () => {
  it("draft 포스트를 제외한다", () => {
    const posts = getPublishedPosts();
    expect(posts.every((p) => !p.draft)).toBe(true);
    expect(posts).toHaveLength(4);
  });

  it("날짜 역순으로 정렬한다", () => {
    const posts = getPublishedPosts();
    expect(posts[0].slugAsParams).toBe("latest");
    expect(posts[1].slugAsParams).toBe("second");
    expect(posts[2].slugAsParams).toBe("에서-테스트");
    expect(posts[3].slugAsParams).toBe("oldest");
  });
});

describe("getAllTags", () => {
  it("published 포스트의 태그를 빈도순으로 반환한다", () => {
    const tags = getAllTags();
    // React: 2번 (latest + 한글), TypeScript: 2번 (latest + second) → 동률, 등장순
    // 그 뒤: Next.js 1번, CSS 1번
    expect(tags.slice(0, 2)).toEqual(
      expect.arrayContaining(["React", "TypeScript"]),
    );
    expect(tags).toContain("Next.js");
    expect(tags).toContain("CSS");
  });

  it("draft 포스트의 태그는 포함하지 않는다", () => {
    const tags = getAllTags();
    // draft 포스트의 React 태그는 카운트에서 제외
    // React: 2번(latest + 한글), TypeScript: 2번(latest + second) → 동일 빈도
    expect(tags).not.toContain("Angular");
    expect(tags).toContain("React");
    expect(tags).toContain("TypeScript");
  });
});

describe("filterPostsByTags", () => {
  it("빈 태그 배열이면 전체 published 포스트를 반환한다", () => {
    const posts = filterPostsByTags([]);
    expect(posts).toHaveLength(4);
  });

  it("태그로 필터링한다", () => {
    const posts = filterPostsByTags(["React"]);
    expect(posts).toHaveLength(2);
  });

  it("여러 태그로 필터링한다 (OR 조건)", () => {
    const posts = filterPostsByTags(["React", "CSS"]);
    expect(posts).toHaveLength(3);
  });

  it("일치하는 태그가 없으면 빈 배열을 반환한다", () => {
    const posts = filterPostsByTags(["존재하지않는태그"]);
    expect(posts).toHaveLength(0);
  });
});

describe("getPostBySlug", () => {
  it("slug로 포스트를 찾는다", () => {
    const post = getPostBySlug("latest");
    expect(post?.title).toBe("최신 포스트");
  });

  it("존재하지 않는 slug는 undefined를 반환한다", () => {
    const post = getPostBySlug("nonexistent");
    expect(post).toBeUndefined();
  });

  it("draft 포스트는 찾지 않는다", () => {
    const post = getPostBySlug("draft-post");
    expect(post).toBeUndefined();
  });

  it("NFD로 인코딩된 한글 slug를 NFC로 정규화하여 찾는다", () => {
    const nfdSlug = "에서-테스트".normalize("NFD");
    const post = getPostBySlug(nfdSlug);
    expect(post?.title).toBe("한글 슬러그 포스트");
  });
});

describe("getAdjacentPosts", () => {
  // 정렬 순서: latest(04-01) → second(03-15) → 에서-테스트(02-01) → oldest(01-01)
  it("이전/다음 포스트를 반환한다", () => {
    const { prev, next } = getAdjacentPosts("second");
    expect(prev?.slugAsParams).toBe("에서-테스트");
    expect(next?.slugAsParams).toBe("latest");
  });

  it("첫 번째 포스트는 다음이 없다", () => {
    const { prev, next } = getAdjacentPosts("latest");
    expect(prev?.slugAsParams).toBe("second");
    expect(next).toBeNull();
  });

  it("마지막 포스트는 이전이 없다", () => {
    const { prev, next } = getAdjacentPosts("oldest");
    expect(prev).toBeNull();
    expect(next?.slugAsParams).toBe("에서-테스트");
  });

  it("NFD slug로도 인접 포스트를 찾는다", () => {
    const nfdSlug = "에서-테스트".normalize("NFD");
    const { prev, next } = getAdjacentPosts(nfdSlug);
    expect(prev?.slugAsParams).toBe("oldest");
    expect(next?.slugAsParams).toBe("second");
  });
});

describe("getRelatedPosts", () => {
  it("같은 태그를 가진 다른 포스트를 반환한다", () => {
    const related = getRelatedPosts("latest");
    // latest: [React, TypeScript] → second(TypeScript), 에서-테스트(React) 매칭
    expect(related.some((p) => p.slugAsParams === "second")).toBe(true);
    expect(related.some((p) => p.slugAsParams === "에서-테스트")).toBe(true);
  });

  it("자기 자신은 제외한다", () => {
    const related = getRelatedPosts("latest");
    expect(related.every((p) => p.slugAsParams !== "latest")).toBe(true);
  });

  it("limit 개수만큼만 반환한다", () => {
    const related = getRelatedPosts("latest", 1);
    expect(related).toHaveLength(1);
  });

  it("존재하지 않는 slug는 빈 배열을 반환한다", () => {
    const related = getRelatedPosts("nonexistent");
    expect(related).toHaveLength(0);
  });

  it("NFD slug로도 관련 포스트를 찾는다", () => {
    const nfdSlug = "에서-테스트".normalize("NFD");
    const related = getRelatedPosts(nfdSlug);
    expect(related.some((p) => p.slugAsParams === "latest")).toBe(true);
  });
});

describe("formatDate", () => {
  it("한국어 날짜 포맷으로 변환한다", () => {
    const formatted = formatDate("2026-04-01T00:00:00.000Z");
    expect(formatted).toMatch(/2026/);
    expect(formatted).toMatch(/04/);
    expect(formatted).toMatch(/01/);
  });

  it("마침표 구분자를 사용한다", () => {
    const formatted = formatDate("2026-04-01T00:00:00.000Z");
    expect(formatted).toMatch(/\d{4}\.\d{2}\.\d{2}/);
  });
});
