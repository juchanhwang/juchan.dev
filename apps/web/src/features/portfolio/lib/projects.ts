export interface Project {
  title: string;
  description: string;
  tags: string[];
  emoji: string;
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: "juchan.dev",
    description:
      "기술 블로그 + 포트폴리오 통합 사이트. Next.js 16, MDX 기반.",
    tags: ["Next.js", "TypeScript", "Tailwind", "MDX"],
    emoji: "🚀",
    demoUrl: "https://juchan.dev",
    githubUrl: "https://github.com/juchanhwang/juchan.dev",
    featured: true,
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
