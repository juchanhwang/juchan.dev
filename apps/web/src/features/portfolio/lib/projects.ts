export interface CaseStudySection {
  title: string;
  content: string;
}

export interface CaseStudy {
  heroSubtitle: string;
  period: string;
  role: string;
  teamSize: string;
  overview: CaseStudySection;
  problem: CaseStudySection;
  process: CaseStudySection;
  result: CaseStudySection;
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
      heroSubtitle: "개발자 포트폴리오 겸 기술 블로그",
      period: "2025.12 — 현재",
      role: "프론트엔드 개발 (1인)",
      teamSize: "1명",
      overview: {
        title: "프로젝트 개요",
        content:
          "기존에 흩어져 있던 기술 글과 프로젝트 이력을 하나의 사이트로 통합했습니다. Next.js 16 App Router와 Velite MDX 파이프라인을 기반으로, 빠른 정적 생성과 풍부한 코드 하이라이팅을 지원하는 개발 블로그를 구축했습니다.",
      },
      problem: {
        title: "해결한 문제",
        content:
          "기존 블로그 플랫폼(Velog, Medium)에서는 커스텀 디자인, 코드 블록 테마, 다국어 슬러그 처리 등에 한계가 있었습니다. 특히 macOS 파일시스템의 NFD/NFC 유니코드 정규화 차이로 인해 한글 URL이 404를 반환하는 문제가 있었고, MDX 내 인라인 스타일의 JSX 호환성 이슈도 해결해야 했습니다.",
      },
      process: {
        title: "기술적 과정",
        content:
          "Turborepo 모노레포로 프로젝트를 구성하고, Velite를 통해 MDX 콘텐츠를 빌드 타임에 JSON으로 변환합니다. rehype-pretty-code + Shiki 듀얼 테마로 코드 하이라이팅을 구현했으며, 한글 슬러그는 Velite transform 단계에서 NFC 정규화를 적용해 근본적으로 해결했습니다. Feature-based 디렉토리 구조로 도메인별 응집도를 높이고, shadcn/ui + Tailwind v4로 일관된 디자인 시스템을 유지합니다.",
      },
      result: {
        title: "결과",
        content:
          "99개 페이지를 정적 생성하며, Lighthouse 성능 점수 95+ 를 달성했습니다. 한글 슬러그 404 문제를 완전히 해결하고, 다크/라이트 듀얼 테마 코드 블록을 지원합니다. Vitest + RTL 기반 36개 테스트로 블로그 핵심 로직의 안정성을 확보했습니다.",
      },
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
