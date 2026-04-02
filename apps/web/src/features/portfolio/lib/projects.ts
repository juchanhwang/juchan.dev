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

export interface AsIsRow {
  task: string;
  tool: string;
  limitation: string;
}

export interface Screenshot {
  src: string;
  alt: string;
}

export interface DemoVideo {
  src: string;
  poster?: string;
}

export interface TeamMember {
  role: string;
  label: string;
  description: string;
}

export interface DevDocument {
  title: string;
  description: string;
  emoji: string;
  href: string;
  external?: boolean;
}

export interface DevProcess {
  description: string;
  team: TeamMember[];
  cycle: string[];
  documents: DevDocument[];
}

export interface CaseStudy {
  category: string;
  impact: string;
  heroImage?: string;
  period: string;
  role: string;
  teamSize: string;
  overview: string;
  overviewLink?: { title: string; href: string };
  problemCallout: string;
  problemContent: string;
  asIsTable?: AsIsRow[];
  processSteps: ProcessStep[];
  devProcess?: DevProcess;
  metrics: Metric[];
  resultContent: string;
  screenshots?: Screenshot[];
  demoVideo?: DemoVideo;
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
    slug: "missionary",
    description:
      "교회 선교 관리 플랫폼. Next.js + NestJS 모노레포, overlay-kit.",
    tags: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "NestJS 11",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
      "Storybook",
      "Vitest",
      "Jest",
      "Docker",
      "GitHub Actions",
      "pnpm Workspaces",
    ],
    emoji: "⛪",
    githubUrl: "https://github.com/juchanhwang/missionary",
    featured: true,
    caseStudy: {
      category: "AI Native Web Application",
      impact:
        "교회 선교 운영의 모든 것을 하나의 플랫폼으로",
      period: "2026.01 — ing",
      role: "AI Native Development",
      teamSize: "1명",
      overview:
        "매년 여름·겨울 약 1만 명의 교인이 9개 해외선교와 10개 국내선교에 50~700명 규모로 참여합니다.\n\n이 대규모 선교 운영 과정에서 발견한 구조적 문제를 해결하기 위해 시작된 프로젝트입니다. 등록 신청부터 팀 편성, 회계, 보고서까지 6개 이상의 도구에 흩어져 있던 워크플로우를 하나의 통합 플랫폼으로 일원화했습니다.\n\nNext.js 16 + NestJS 11 모노레포 구조로, 사용자앱·관리자앱·API서버·디자인시스템을 4개 패키지로 관리합니다.",
      overviewLink: {
        title: "시스템 전체 구조 보기",
        href: "https://juchanhwang.github.io/missionary-project-overview/",
      },
      problemCallout:
        "6개 이상의 도구에 흩어진 워크플로우를 하나의 통합 플랫폼으로 일원화",
      problemContent:
        "선교 기간이 되면 각 선교별 준비팀이 독립적으로 선교를 준비합니다. 이 과정에서 다음과 같은 문제가 반복적으로 발생했습니다.\n\n첫째, 프로세스별 도구 파편화입니다. 선교 운영에 필요한 업무마다 서로 다른 도구를 사용하고 있어, 데이터와 워크플로우가 분산되었습니다.\n\n둘째, 통합 관리 뷰의 부재입니다. 관리자가 선교 전체 현황을 하나의 시스템에서 파악할 수 없었습니다.\n\n셋째, 정보 접근성 한계입니다. 자신이 담당한 업무 외에는 진행 상황을 확인하기 어려워, 팀 간 협업에 병목이 발생했습니다.\n\n넷째, 포맷 비통일입니다. 선교팀마다 문서 양식과 관리 방식이 달라, 교회 차원의 일관성 유지가 불가능했습니다.",
      asIsTable: [
        {
          task: "등록 신청",
          tool: "Google Form",
          limitation: "차수마다 재생성, 응답 데이터 분산",
        },
        {
          task: "개인정보 수집",
          tool: "교회 자체 시스템",
          limitation: "등록 데이터와 연동 불가",
        },
        {
          task: "공지 및 대원 소통",
          tool: "카카오톡",
          limitation: "이력 관리·검색 어려움",
        },
        {
          task: "준비팀 문서 관리",
          tool: "Notion",
          limitation: "팀별 포맷 제각각",
        },
        {
          task: "회계·영수증 관리",
          tool: "엑셀, 한글 문서",
          limitation: "수작업, 버전 충돌",
        },
        {
          task: "선교 보고서 관리",
          tool: "한글 문서",
          limitation: "양식 비통일, 협업 불가",
        },
      ],
      processSteps: [
        {
          number: "01",
          title: "모노레포 아키텍처 설계",
          description:
            "사용자앱(Next.js) + 관리자앱(Next.js) + API서버(NestJS) + 디자인시스템을 pnpm workspace로 통합했습니다. 패키지 간 타입 공유와 일관된 린트/빌드 파이프라인을 구축하고, Prisma를 ORM으로 채택해 PostgreSQL 스키마를 18개 모델로 설계했습니다.",
          image: "/projects/missionary/mission-management.png",
          imageAlt:
            "선교 그룹과 차수를 관리하는 관리자 화면. 선교 목록, 차수별 상태, 등록 기간 설정을 한 눈에 보여준다.",
        },
        {
          number: "02",
          title: "동적 폼 빌더 구현",
          description:
            "Google Forms를 대체하는 WYSIWYG 폼 빌더를 구현했습니다. 관리자가 선교별 커스텀 등록 양식을 드래그앤드롭으로 설계할 수 있으며, 텍스트·선택·파일 업로드 등 다양한 필드 타입을 지원합니다. 응답 데이터는 자동으로 대원 프로필과 연동됩니다.",
          image: "/projects/missionary/registration-form.png",
          imageAlt:
            "커스텀 등록 양식 빌더 화면. 텍스트, 선택, 파일 업로드 등 다양한 필드 타입을 드래그앤드롭으로 구성할 수 있다.",
        },
        {
          number: "03",
          title: "통합 관리 대시보드",
          description:
            "등록 현황, 입금 확인, 팀 편성, 공지 관리를 한 곳에서 처리할 수 있는 관리자 대시보드를 구축했습니다. overlay-kit + react-modal 조합으로 복잡한 CRUD 워크플로우를 모달 기반으로 처리하고, 실시간 필터링과 일괄 작업 기능을 제공합니다.",
          image: "/projects/missionary/registration-dashboard.png",
          imageAlt:
            "등록 현황 대시보드. 등록자 목록, 입금 상태, 필터링 및 일괄 작업 기능을 보여준다.",
        },
      ],
      devProcess: {
        description:
          "Claude의 Agent Team 모드를 활용하여, 5명의 AI 에이전트가 협업하는 방식으로 개발했습니다. 각 에이전트가 역할에 맞는 산출물을 생성하고, 파이프라인을 따라 검증·구현·테스트까지 일관된 프로세스로 진행합니다.",
        team: [
          {
            role: "PO",
            label: "Product Owner",
            description: "요구사항 정의, PRD 작성",
          },
          {
            role: "PD",
            label: "Product Designer",
            description: "UI/UX 설계, 디자인 스펙",
          },
          {
            role: "FE",
            label: "Frontend Engineer",
            description: "React/Next.js 구현",
          },
          {
            role: "BE",
            label: "Backend Engineer",
            description: "NestJS API 구현",
          },
          {
            role: "QA",
            label: "QA Engineer",
            description: "테스트 전략, 코드 검증",
          },
        ],
        cycle: [
          "PRD",
          "디자인 스펙",
          "FE/BE 테크스펙",
          "구현",
          "QA",
          "PR",
          "코드 리뷰",
          "배포",
        ],
        documents: [
          {
            title: "PRD — 등록 관리",
            description: "등록 관리 기능 요구사항 v1.11",
            emoji: "📋",
            href: "/projects/missionary/docs/participation-prd",
          },
          {
            title: "디자인 스펙",
            description: "등록 관리 UI/UX 설계 명세",
            emoji: "🎨",
            href: "/projects/missionary/docs/participation-design-spec",
          },
          {
            title: "FE 테크스펙",
            description: "React/Next.js 구현 계획",
            emoji: "⚙️",
            href: "/projects/missionary/docs/participation-fe-plan",
          },
          {
            title: "BE 테크스펙",
            description: "NestJS API 구현 계획",
            emoji: "🔧",
            href: "/projects/missionary/docs/participation-be-plan",
          },
          {
            title: "목업 — 등록 관리",
            description: "등록 카드 목록 + 상세 화면",
            emoji: "🖼️",
            href: "/projects/missionary/mockups/enrollment-card-list.html",
            external: true,
          },
        ],
      },
      metrics: [
        { value: 4, suffix: "개", label: "모노레포 패키지" },
        { value: 18, suffix: "개", label: "DB 모델" },
        { value: 20, suffix: "+", label: "페이지" },
        { value: 25, suffix: "개", label: "디자인시스템 컴포넌트" },
      ],
      resultContent:
        "6개 이상의 외부 도구에 분산되어 있던 선교 운영 워크플로우를 하나의 웹 플랫폼으로 통합했습니다. 관리자는 등록부터 팀 편성, 회계, 보고서까지 단일 대시보드에서 관리할 수 있게 되었고, 대원들은 자신의 등록 상태와 공지를 한 곳에서 확인할 수 있습니다. pnpm 모노레포로 4개 패키지를 일관되게 관리하며, 18개 DB 모델과 25개 디자인시스템 컴포넌트로 확장 가능한 구조를 갖추었습니다.",
      screenshots: [
        {
          src: "/projects/missionary/user-management.png",
          alt: "사용자 관리 화면. 대원 목록, 역할 배정, 개인정보 관리 기능을 보여준다.",
        },
        {
          src: "/projects/missionary/partner-management.png",
          alt: "연계지 관리 화면. 선교 연계지 목록과 배정 현황을 관리한다.",
        },
      ],
      demoVideo: {
        src: "/projects/missionary/registration-demo.mov",
        poster: "/projects/missionary/registration-dashboard.png",
      },
    },
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
