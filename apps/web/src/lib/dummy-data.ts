export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  readingTime: number;
  thumbnail?: string;
  series?: string;
}

export interface Project {
  title: string;
  description: string;
  techStack: string[];
  demoUrl?: string;
  githubUrl?: string;
  thumbnail: string;
  category: "personal" | "team" | "opensource";
}

export interface Career {
  company: string;
  role: string;
  period: string;
  achievements: string[];
}

export const posts: Post[] = [
  {
    slug: "react-server-components-deep-dive",
    title: "React Server Components 딥다이브 — 서버와 클라이언트의 경계",
    date: "2026-03-28",
    tags: ["React", "Next.js", "RSC"],
    description:
      "React Server Components가 기존 SSR과 어떻게 다른지, 그리고 Next.js App Router에서 어떤 방식으로 동작하는지 깊게 살펴봅니다.",
    readingTime: 12,
  },
  {
    slug: "typescript-type-gymnastics",
    title: "TypeScript 타입 체조 — 실전에서 유용한 유틸리티 타입 만들기",
    date: "2026-03-15",
    tags: ["TypeScript"],
    description:
      "conditional type, infer, template literal type을 활용해 실무에서 바로 쓸 수 있는 유틸리티 타입을 만들어봅니다.",
    readingTime: 8,
  },
  {
    slug: "zustand-vs-jotai",
    title: "Zustand vs Jotai — 2026년 상태 관리 라이브러리 비교",
    date: "2026-03-01",
    tags: ["React", "상태관리"],
    description:
      "Zustand과 Jotai의 설계 철학 차이, 그리고 프로젝트 규모에 따른 선택 기준을 정리합니다.",
    readingTime: 10,
  },
  {
    slug: "web-performance-core-web-vitals",
    title: "Core Web Vitals 완벽 가이드 — LCP, INP, CLS 최적화",
    date: "2026-02-20",
    tags: ["성능", "Web"],
    description:
      "Google의 Core Web Vitals 지표를 실제 프로젝트에서 측정하고 개선하는 방법을 단계별로 알아봅니다.",
    readingTime: 15,
  },
  {
    slug: "css-has-selector",
    title: "CSS :has() 셀렉터로 JavaScript 없이 인터랙션 구현하기",
    date: "2026-02-10",
    tags: ["CSS"],
    description:
      ":has() 셀렉터의 브라우저 지원이 완성된 지금, JavaScript 없이 구현할 수 있는 UI 패턴들을 소개합니다.",
    readingTime: 7,
  },
  {
    slug: "testing-react-components",
    title: "React 컴포넌트 테스트 전략 — 무엇을, 어떻게 테스트할 것인가",
    date: "2026-01-25",
    tags: ["React", "Testing"],
    description:
      "Vitest + React Testing Library로 컴포넌트를 효과적으로 테스트하는 전략과 패턴을 공유합니다.",
    readingTime: 11,
  },
];

export const allTags = [
  "React",
  "TypeScript",
  "Next.js",
  "CSS",
  "성능",
  "Web",
  "RSC",
  "상태관리",
  "Testing",
];

export const projects: Project[] = [
  {
    title: "juchan.dev",
    description:
      "기술 블로그 + 포트폴리오 통합 사이트. Next.js 16 App Router, Tailwind CSS v4, MDX 기반.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "MDX"],
    demoUrl: "https://juchan.dev",
    githubUrl: "https://github.com/juchanhwang/juchan.dev",
    thumbnail: "/placeholder-project.svg",
    category: "personal",
  },
  {
    title: "missionary",
    description:
      "교회 선교 관리 플랫폼. Next.js + NestJS 모노레포 구조, overlay-kit 기반 모달 시스템.",
    techStack: ["Next.js", "NestJS", "PostgreSQL", "Turborepo"],
    githubUrl: "https://github.com/juchanhwang/missionary",
    thumbnail: "/placeholder-project.svg",
    category: "team",
  },
  {
    title: "class101-ui",
    description:
      "Class101 디자인 시스템 UI 라이브러리. 접근성 준수, Storybook 문서화.",
    techStack: ["React", "TypeScript", "Storybook", "Emotion"],
    githubUrl: "https://github.com/juchanhwang/class101-ui",
    thumbnail: "/placeholder-project.svg",
    category: "opensource",
  },
];

export const careers: Career[] = [
  {
    company: "스타트업 A",
    role: "Frontend Engineer",
    period: "2024.03 ~ 현재",
    achievements: [
      "디자인 시스템 구축으로 UI 개발 속도 40% 향상",
      "Core Web Vitals LCP 3.2s → 1.8s 개선",
      "Next.js App Router 마이그레이션 리드",
    ],
  },
  {
    company: "스타트업 B",
    role: "Frontend Developer",
    period: "2022.01 ~ 2024.02",
    achievements: [
      "React + TypeScript 기반 어드민 대시보드 구축",
      "Storybook 기반 컴포넌트 문서화 체계 도입",
      "E2E 테스트 커버리지 0% → 60% 달성",
    ],
  },
];

export const skills = {
  Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Zustand"],
  Backend: ["Node.js", "NestJS", "PostgreSQL"],
  "DevOps / Tools": ["Docker", "Vercel", "GitHub Actions", "Figma", "Turborepo"],
};

export const socialLinks = {
  github: "https://github.com/juchanhwang",
  linkedin: "https://linkedin.com/in/juchanhwang",
  email: "mailto:juchanhwang@example.com",
};

// Dummy post body content for detail page
export const dummyPostBody = `
## React Server Components란?

React Server Components(RSC)는 서버에서만 실행되는 새로운 유형의 컴포넌트입니다. 기존 SSR과 다른 점은, RSC는 **번들에 포함되지 않는다**는 것입니다.

### SSR vs RSC

기존 SSR은 서버에서 HTML을 렌더링한 뒤, 클라이언트에서 hydration을 통해 인터랙티브하게 만듭니다. 반면 RSC는 서버에서 렌더링된 결과를 직렬화된 형태로 클라이언트에 전달합니다.

\`\`\`typescript
// Server Component — 번들에 포함되지 않음
async function PostList() {
  const posts = await db.posts.findMany();
  return (
    <ul>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </ul>
  );
}
\`\`\`

이 접근 방식의 장점은 명확합니다:

- **번들 크기 감소**: 서버 전용 코드가 클라이언트로 전송되지 않음
- **직접 데이터 접근**: API 레이어 없이 DB에 직접 접근 가능
- **보안**: 민감한 로직이 서버에서만 실행됨

### 클라이언트 컴포넌트와의 경계

> "use client" 디렉티브는 서버와 클라이언트의 경계를 명시적으로 선언합니다.

클라이언트 컴포넌트가 필요한 경우:

1. \`useState\`, \`useEffect\` 등 React 훅 사용
2. 브라우저 API 접근 (localStorage, window 등)
3. 이벤트 핸들러 (onClick, onChange 등)

\`\`\`typescript
"use client";

import { useState } from "react";

function LikeButton({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      ♥ {count}
    </button>
  );
}
\`\`\`

## Next.js App Router에서의 RSC

Next.js 13+의 App Router는 기본적으로 모든 컴포넌트를 Server Component로 취급합니다. 이는 **zero-config RSC**를 의미합니다.

### 데이터 페칭 패턴

App Router에서는 \`getServerSideProps\`나 \`getStaticProps\` 대신, 컴포넌트 내에서 직접 \`async/await\`를 사용합니다.

- 서버 컴포넌트에서 직접 fetch
- Suspense로 로딩 상태 처리
- 에러 바운더리로 에러 처리

## 마무리

RSC는 React의 미래입니다. 서버와 클라이언트의 역할을 명확히 분리하면서도, 하나의 컴포넌트 트리에서 자연스럽게 조합할 수 있게 해줍니다.
`;
