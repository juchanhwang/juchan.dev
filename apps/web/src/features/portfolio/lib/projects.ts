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
    title: "my-harness",
    slug: "my-harness",
    description:
      "Claude Code AI 에이전트 하네스. 18개 전문 에이전트, 15개 도메인 스킬, 팀 협업 시스템.",
    tags: [
      "Claude Code",
      "AI Agent",
      "Prompt Engineering",
      "Shell Script",
      "Markdown",
    ],
    emoji: "🤖",
    githubUrl: "https://github.com/juchanhwang/my-harness",
    featured: true,
    caseStudy: {
      category: "AI Agent Engineering",
      status: "in-progress",
      impact: "전문 에이전트 팀이 협업하는 AI 네이티브 개발 환경",
      period: "2025.02 — ing",
      role: "Harness Engineering",
      teamSize: "1인",
      overview:
        "Claude Code는 강력한 AI 코딩 에이전트지만, 기본 상태에서는 단일 에이전트로 동작합니다. 복잡한 프로젝트에서는 프론트엔드, 백엔드, QA, 디자인 등 도메인마다 고유한 설계 원칙과 판단 기준이 필요한데, 하나의 에이전트가 모든 영역을 동일한 깊이로 다루기 어렵습니다.\n\nmy-harness는 이 문제를 해결하기 위해 만든 Claude Code 개인 하네스입니다. oh-my-opencode의 에이전트 시스템을 벤치마킹하여 18개의 전문 에이전트와 15개의 스킬(7개 도메인 지식 베이스 + 8개 범용 스킬), 10개의 플러그인을 구성했습니다.\n\n오케스트레이터가 작업을 분석하고, 적절한 전문 에이전트에게 위임하며, 결과를 검증하는 탐색→위임→검증 루프를 자동으로 수행합니다. 이를 통해 AI 에이전트 팀이 실제 개발팀처럼 협업하는 환경을 구축했습니다.",
      problemCallout:
        "단일 AI 에이전트의 한계를 넘어, 전문 에이전트 팀이 협업하는 개발 환경 구축",
      problemContent:
        "Claude Code를 실제 프로젝트 개발에 활용하면서 다음과 같은 구조적 한계를 경험했습니다.\n\n첫째, 전문성의 부재입니다. 단일 에이전트가 프론트엔드, 백엔드, QA, 디자인 등 모든 도메인을 동일한 깊이로 다루기 어렵습니다. 각 도메인에는 고유한 설계 원칙, 안티패턴, 기술 스택이 존재합니다.\n\n둘째, 지식의 휘발성입니다. 세션이 끝나면 맥락이 사라집니다. 프로젝트 컨벤션, 아키텍처 결정, 검증된 패턴을 매번 다시 설명해야 했습니다.\n\n셋째, 협업 구조의 부재입니다. 실제 개발팀처럼 PO가 기획하고, 디자이너가 설계하고, 개발자가 구현하고, QA가 검증하는 파이프라인이 없습니다. 모든 역할을 하나의 에이전트가 순차적으로 수행합니다.\n\n넷째, 품질 검증의 공백입니다. 코드 리뷰, 테스트 전략, 보안 검토 등 품질 게이트 없이 구현만 빠르게 진행됩니다.",
      asIsTable: [
        {
          task: "작업 계획",
          tool: "단일 에이전트",
          limitation: "계획과 구현의 분리 없음, 즉흥적 실행",
        },
        {
          task: "프론트엔드 구현",
          tool: "단일 에이전트",
          limitation: "React/Next.js 고유 패턴·컨벤션 미반영",
        },
        {
          task: "백엔드 구현",
          tool: "단일 에이전트",
          limitation: "API 설계 원칙·보안·성능 패턴 미적용",
        },
        {
          task: "코드 리뷰·QA",
          tool: "수동 검토",
          limitation: "구현자가 곧 검증자, 자기 검증의 한계",
        },
        {
          task: "도메인 지식 참조",
          tool: "매 세션 재설명",
          limitation: "컨벤션·패턴 휘발, 일관성 유지 불가",
        },
      ],
      processIntro:
        "단일 에이전트의 한계를 극복하기 위해, 역할 기반의 에이전트 팀 아키텍처를 설계하고 도메인 지식 시스템을 구축했습니다. 구체적으로 다음 세 단계에 집중했습니다.",
      processSteps: [
        {
          number: "01",
          title: "에이전트 아키텍처 설계",
          description:
            "oh-my-opencode의 에이전트 시스템을 벤치마킹하여 18개 에이전트를 설계했습니다. 코어 에이전트(Orchestrator, Planner, Oracle 등 11개)가 탐색→계획→실행→검증 루프를 담당하고, 도메인 전문가 에이전트(FE, BE, Designer, PO, QA, Ops, DA 7개)가 각 영역의 구현과 판단을 맡습니다. Orchestrator가 작업을 분석해 적절한 전문가에게 위임하고, Oracle이 아키텍처 결정을 컨설팅하며, Plan Reviewer가 계획의 완성도를 검증하는 구조입니다.",
        },
        {
          number: "02",
          title: "도메인 지식 시스템 구축",
          description:
            "각 도메인 전문가 에이전트에게 177개 이상의 참조 파일로 구성된 지식 베이스를 부여했습니다. 태스크-지식 매핑 테이블을 설계하여, 주어진 작업 유형에 필요한 참조 파일을 자동으로 특정합니다. 예를 들어 FE 에이전트가 'API 연동 폼 구현' 태스크를 받으면 async-patterns.md, data-fetching.md, forms.md, error-handling.md, testing.md를 자동으로 참조합니다.",
        },
        {
          number: "03",
          title: "스킬 시스템 마이그레이션",
          description:
            "초기에는 knowledge/ 디렉토리에서 에이전트가 파일 경로로 직접 참조하는 방식이었습니다. 이를 Claude Code의 스킬 시스템으로 마이그레이션하여 SKILL.md의 frontmatter 기반으로 자동 트리거되는 구조로 전환했습니다. 에이전트가 수동으로 경로를 기억할 필요 없이, 작업 맥락에 따라 관련 도메인 스킬이 자동 활성화됩니다.",
        },
      ],
      metrics: [
        { value: 18, suffix: "개", label: "전문 에이전트" },
        { value: 15, suffix: "개", label: "스킬" },
        { value: 177, suffix: "+", label: "도메인 참조 파일" },
        { value: 10, suffix: "개", label: "플러그인" },
      ],
      resultContent:
        "AI 에이전트를 '도구'가 아닌 '팀원'으로 설계하는 경험이었습니다. 프롬프트 엔지니어링이라는 단어로는 담기지 않는, 시스템 설계에 가까운 작업이었습니다.\n\n가장 큰 수확은 '지식의 구조화'입니다. 각 도메인의 설계 원칙, 안티패턴, 검증된 패턴을 문서화하는 과정에서 제 자신의 기술적 판단 기준도 명확해졌습니다. 에이전트에게 가르치기 위해 정리한 지식이 결국 저의 엔지니어링 원칙이 되었습니다.\n\nmissionary 프로젝트에서 이 하네스를 실전 투입했습니다. PO가 PRD를 작성하고, Designer가 디자인 스펙을 정의하고, FE/BE가 구현하고, QA가 검증하는 파이프라인이 실제로 동작하는 것을 확인했습니다. 한 사람이 만든 AI 에이전트 팀이 실제 개발팀의 워크플로우를 재현할 수 있다는 가능성을 확인한 프로젝트입니다.",
      roadmap: [
        { label: "에이전트 아키텍처 설계 (18개)", status: "done" },
        { label: "도메인 지식 시스템 구축 (177+ 파일)", status: "done" },
        { label: "knowledge → skills 마이그레이션", status: "done" },
        { label: "스킬 평가(eval) 시스템 구축", status: "in-progress" },
        { label: "에이전트 성능 벤치마크", status: "planned" },
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
            "Google Forms를 대체하는 드래그앤드롭 폼 빌더를 구현했습니다. 관리자가 선교별 커스텀 등록 양식을 설계할 수 있으며, 텍스트·선택·파일 업로드 등 다양한 필드 타입을 지원합니다. 응답 데이터는 자동으로 대원 프로필과 연동됩니다.",
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
