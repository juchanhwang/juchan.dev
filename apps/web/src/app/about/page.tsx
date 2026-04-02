import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "황주찬 — 프론트엔드 엔지니어 소개",
};

const SKILLS = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Zustand"],
  },
  {
    category: "Backend",
    items: ["Node.js", "NestJS", "PostgreSQL"],
  },
  {
    category: "DevOps / Tools",
    items: ["Docker", "Vercel", "GitHub Actions", "Figma", "Turborepo"],
  },
] as const;

const CAREER = [
  {
    period: "2024.03 ~ 현재",
    company: "스타트업 A",
    role: "Frontend Engineer",
    highlights: [
      "디자인 시스템 구축으로 UI 개발 속도 40% 향상",
      "Core Web Vitals LCP 3.2s → 1.8s 개선",
      "Next.js App Router 마이그레이션 리드",
    ],
  },
  {
    period: "2022.01 ~ 2024.02",
    company: "스타트업 B",
    role: "Frontend Developer",
    highlights: [
      "React + TypeScript 기반 어드민 대시보드 구축",
      "Storybook 기반 컴포넌트 문서화 체계 도입",
      "E2E 테스트 커버리지 0% → 60% 달성",
    ],
  },
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Bio */}
      <div className="flex flex-wrap gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-secondary text-[40px]">
          👨‍💻
        </div>
        <div>
          <h1 className="text-2xl font-bold">황주찬</h1>
          <p className="mt-1 text-muted-foreground">Frontend Engineer</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="https://github.com/juchanhwang"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <GitHubIcon />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/juchanhwang"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LinkedInIcon />
              LinkedIn
            </a>
            <a
              href="mailto:juchanhwang@gmail.com"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              ✉ 이메일
            </a>
            <Link
              href="/resume"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              ⬇ 이력서
            </Link>
          </div>
        </div>
      </div>

      <hr className="mt-10 border-border" />

      {/* Intro */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">소개</h2>
        <div className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            &ldquo;변경하기 쉬운 코드가 좋은 코드&rdquo;라는 철학을 가진
            프론트엔드 개발자입니다.
          </p>
          <p>
            사용자에게 빠르고 접근성 높은 인터페이스를 제공하는 것에 관심이
            많으며, 컴포넌트 설계와 성능 최적화를 즐깁니다.
          </p>
          <p>
            기술 글을 쓰면서 학습한 내용을 정리하고, 오픈소스 생태계에 기여하는
            것을 좋아합니다.
          </p>
        </div>
      </section>

      <hr className="mt-10 border-border" />

      {/* Skills */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">기술 스택</h2>
        <div className="mt-4 flex flex-col gap-4">
          {SKILLS.map((group) => (
            <div key={group.category}>
              <p className="text-sm font-semibold text-muted-foreground">
                {group.category}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-secondary px-3 py-1 text-[13px] text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="mt-10 border-border" />

      {/* Career */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">경력</h2>
        <div className="mt-6 flex flex-col gap-8">
          {CAREER.map((entry) => (
            <div key={entry.period}>
              <p className="text-sm text-muted-foreground">{entry.period}</p>
              <p className="mt-1 font-semibold">
                {entry.company} · {entry.role}
              </p>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>· {highlight}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
