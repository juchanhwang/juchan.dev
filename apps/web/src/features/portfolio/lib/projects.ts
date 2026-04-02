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

export interface RoadmapItem {
  label: string;
  status: "done" | "in-progress" | "planned";
}

export interface CaseStudy {
  category: string;
  impact: string;
  heroImage?: string;
  status?: "in-progress" | "completed";
  period: string;
  role: string;
  teamSize: string;
  overview: string;
  overviewLink?: { title: string; href: string };
  problemCallout: string;
  problemContent: string;
  asIsTable?: AsIsRow[];
  processIntro?: string;
  processSteps: ProcessStep[];
  devProcess?: DevProcess;
  metrics: Metric[];
  resultContent: string;
  roadmap?: RoadmapItem[];
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
      status: "in-progress",
      impact:
        "교회 선교 운영의 모든 것을 하나의 플랫폼으로",
      period: "2026.01 — ing",
      role: "Harness Engineering",
      teamSize: "1인",
      overview:
        "매년 여름·겨울 약 10,000 명의 교인이 9개 해외선교와 10개 국내선교에 각 선교마다 50~700명 규모로 참여합니다.\n\n이 대규모 선교 운영 과정에서 발견한 구조적 문제를 해결하기 위해 시작된 프로젝트입니다. 등록 신청부터 팀 편성, 회계, 보고서까지 6개 이상의 도구에 흩어져 있던 워크플로우를 하나의 통합 플랫폼으로 일원화하고 있습니다.\n\n현재 관리자용 어드민 시스템(선교·등록·유저·연계지 관리)을 구현한 상태이며, Next.js 16 + NestJS 11 모노레포 구조로 4개 패키지를 관리합니다.",
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
      processIntro:
        "흩어진 도구들을 하나로 묶기 위해, 선교 운영 전체를 관리하는 어드민 시스템을 개발했습니다. 선교 관리, 등록 관리, 유저 관리, 연계지 관리를 하나의 플랫폼에서 처리할 수 있도록 구현했으며, 구체적으로 다음 세 가지에 집중했습니다.",
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
            "등록 현황과 입금 확인을 한 곳에서 처리할 수 있는 관리자 대시보드를 구축했습니다. overlay-kit + react-modal 조합으로 복잡한 CRUD 워크플로우를 모달 기반으로 처리하고, 실시간 필터링과 일괄 작업 기능을 제공합니다.",
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
        "실제 선교를 준비하는 사용자를 인터뷰하고, 문제를 정의하고, 해결하는 전체 과정을 경험했습니다. 프론트엔드 개발자로서 한 프로젝트의 기획부터 설계, 구현, 테스트까지 전체 싸이클을 직접 경험할 수 있었던 것이 가장 큰 수확이었습니다.\n\n특히 AI 에이전트(PO, PD)를 통해 PRD와 디자인 스펙을 작성하고, 검토하고, 구체화하는 과정이 예상보다 긴 시간이 필요했습니다. 더 많은 시간과 노력을 들일수록 좋은 결과물이 나온다는 것을 체감했습니다.\n\n아직 어드민 기능의 고도화와 사용자 앱 개발이 남아있습니다. 동시에 교회의 선교 전체를 담당하는 부서에 이 앱을 소개하고 도입을 제안하는 단계도 준비 중입니다. 현재 부서 담당자와 만날 예정이며, 이 과정 또한 작은 Sales 경험이 될 것 같아 기대하고 있습니다.",
      roadmap: [
        { label: "어드민 — 선교·등록·유저·연계지 관리", status: "done" },
        { label: "어드민 기능 고도화", status: "in-progress" },
        { label: "사용자 앱 개발", status: "planned" },
        { label: "교회 선교 부서 도입 제안", status: "planned" },
      ],
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
