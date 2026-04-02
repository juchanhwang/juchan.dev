export interface Metric {
  value: number;
  suffix: string;
  label: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}

export interface CaseStudy {
  category: string;
  impact: string;
  heroImage?: string;
  period: string;
  role: string;
  teamSize: string;
  contribution: string;
  overview: string;
  problemCallout: string;
  problemContent: string;
  processSteps: ProcessStep[];
  metrics: Metric[];
  resultContent: string;
  relatedPosts?: { title: string; href: string }[];
}

export interface Project {
  title: string;
  slug?: string;
  description: string;
  tags: string[];
  emoji: string;
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  caseStudy?: CaseStudy;
}

export const projects: Project[] = [
  {
    title: "juchan.dev",
    slug: "juchan-dev",
    description:
      "기술 블로그 + 포트폴리오 통합 사이트. Next.js 16, MDX 기반.",
    tags: ["Next.js", "TypeScript", "Tailwind", "MDX"],
    emoji: "🚀",
    demoUrl: "https://juchan.dev",
    githubUrl: "https://github.com/juchanhwang/juchan.dev",
    featured: true,
    caseStudy: {
      category: "Personal Project",
      impact: "Gatsby 레거시를 걷어내고, 블로그와 포트폴리오를 하나로 통합",
      period: "2025.12 — 현재",
      role: "프론트엔드 개발",
      teamSize: "1명",
      contribution: "100%",
      overview:
        "Gatsby 2.x로 운영하던 기술 블로그가 빌드 실패와 플러그인 비호환으로 더 이상 유지보수가 불가능해졌습니다. 동시에 포트폴리오가 별도 Notion 페이지로 분리되어 있어 채용 담당자에게 일관된 인상을 주기 어려웠습니다. Next.js 16 App Router와 Velite MDX 파이프라인 기반으로 블로그 + 포트폴리오를 하나의 사이트로 신규 구축했습니다.",
      problemCallout:
        "Gatsby 플러그인 생태계가 멈추면서, 빌드가 터지고 글을 쓸 수 없게 되었다.",
      problemContent:
        "Gatsby 2.x 기반 블로그는 3년간 운영했지만, 메이저 의존성 업데이트가 중단되면서 빌드 불안정성이 심화되었습니다. Node 18 이상에서 빌드가 실패하고, gatsby-plugin-mdx v3 호환성 이슈로 코드 블록 하이라이팅이 깨졌습니다. 포트폴리오는 Notion 페이지로 관리했는데, 디자인 커스텀이 불가능하고 블로그와 시각적 연결이 없었습니다. 또한 macOS 파일시스템이 한글 경로를 NFD로 저장하는 반면, 브라우저는 NFC로 요청하여 한글 슬러그 포스트가 404를 반환하는 문제가 있었습니다.",
      processSteps: [
        {
          number: "01",
          title: "기술 스택 선정과 모노레포 구조 설계",
          description:
            "Next.js 16 App Router를 선택해 서버 컴포넌트와 정적 생성의 이점을 극대화했습니다. Turborepo + pnpm 모노레포로 프로젝트를 구성하고, 공유 패키지(UI, tsconfig)를 분리하여 향후 확장에 대비했습니다. 콘텐츠 파이프라인으로 Velite를 도입해 MDX를 빌드 타임에 JSON으로 변환하는 구조를 설계했습니다.",
        },
        {
          number: "02",
          title: "MDX 파이프라인과 한글 슬러그 문제 해결",
          description:
            "rehype-pretty-code + Shiki 듀얼 테마(github-light / one-dark-pro)로 코드 하이라이팅을 구현했습니다. 한글 슬러그 404 문제는 Velite transform 단계에서 .normalize('NFC')를 적용해 근본적으로 해결했습니다. 방어적으로 페이지 레벨과 데이터 레이어에서도 NFC 정규화를 추가하여 3중 안전장치를 구축했습니다.",
        },
        {
          number: "03",
          title: "Feature-based 아키텍처와 디자인 시스템",
          description:
            "도메인별 응집도를 높이기 위해 features/ 디렉토리로 blog, portfolio, layout, mdx 모듈을 분리했습니다. shadcn/ui + Tailwind v4로 일관된 디자인 토큰을 사용하고, Pretendard Variable + JetBrains Mono 폰트 조합으로 가독성을 확보했습니다. next-themes 다크 모드를 기본값으로 설정했습니다.",
        },
      ],
      metrics: [
        { value: 99, suffix: "페이지", label: "정적 생성 (SSG)" },
        { value: 95, suffix: "+", label: "Lighthouse 성능 점수" },
        { value: 36, suffix: "개", label: "Vitest 단위/통합 테스트" },
      ],
      resultContent:
        "100개 이상의 기존 포스트를 마이그레이션하고 99페이지를 정적 생성합니다. 한글 슬러그 404 문제를 Velite transform 단계에서 근본적으로 해결했으며, 다크/라이트 듀얼 테마 코드 블록을 지원합니다. Feature-based 아키텍처로 각 도메인의 변경이 독립적이고, Vitest + RTL 기반 36개 테스트로 블로그 핵심 로직의 안정성을 확보했습니다.",
      relatedPosts: [
        {
          title: "Next.js 15에서 MSW 적용하기",
          href: "/blog/next-js-15-에서-msw-적용하기-feat-graphql",
        },
      ],
    },
  },
  {
    title: "missionary",
    description:
      "교회 선교 관리 플랫폼. Next.js + NestJS 모노레포, overlay-kit.",
    tags: ["Next.js", "NestJS", "PostgreSQL", "Turborepo"],
    emoji: "⛪",
    githubUrl: "https://github.com/juchanhwang/missionary",
    featured: true,
  },
  {
    title: "class101-ui",
    description:
      "Class101 디자인 시스템 UI 라이브러리. 접근성 준수, Storybook 문서화.",
    tags: ["React", "TypeScript", "Storybook", "Emotion"],
    emoji: "🎨",
    githubUrl: "https://github.com/juchanhwang/class101-ui",
  },
];

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null;
}

export function getProjectSlugs() {
  return projects.filter((p) => p.slug).map((p) => p.slug!);
}

export function getNextProject(currentSlug: string) {
  const slugs = getProjectSlugs();
  const currentIndex = slugs.indexOf(currentSlug);
  if (currentIndex === -1) return null;
  const nextSlug = slugs[(currentIndex + 1) % slugs.length];
  if (nextSlug === currentSlug) return null;
  return getProjectBySlug(nextSlug);
}
