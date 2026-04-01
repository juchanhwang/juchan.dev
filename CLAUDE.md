# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## OVERVIEW

juchan.dev -- 개발자 포트폴리오 겸 기술 블로그. Turborepo monorepo, Next.js 16 App Router + Velite MDX.

## STRUCTURE

```
juchan.dev/
├── apps/web/              # Next.js 16 앱 (메인 사이트)
│   ├── content/posts/     # MDX 블로그 포스트 (Velite로 빌드)
│   ├── src/
│   │   ├── app/           # App Router 라우트
│   │   ├── features/      # Feature-based 모듈 (blog, mdx, layout)
│   │   ├── components/ui/ # shadcn/ui 공통 컴포넌트
│   │   └── lib/           # 공통 유틸 (utils, fonts)
│   └── velite.config.ts   # Velite MDX 파이프라인 설정
├── packages/
│   ├── tsconfig/          # 공유 TypeScript 설정
│   └── ui/                # 공유 UI 패키지 (@juchan/ui)
└── docs/                  # PRD, 디자인 스펙, 테스트 전략, 목업
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 블로그 포스트 추가 | `apps/web/content/posts/` | MDX, Velite 스키마 참고 |
| 블로그 기능 수정 | `apps/web/src/features/blog/` | components + lib + __tests__ |
| MDX 렌더링/코드블록 | `apps/web/src/features/mdx/` | rehype-pretty-code + Shiki |
| 레이아웃/헤더/푸터 | `apps/web/src/features/layout/` | Header, Footer, ThemeToggle |
| 디자인 토큰/스타일 | `apps/web/src/app/globals.css` | oklch 컬러, prose, Shiki 테마 |
| 폰트 설정 | `apps/web/src/lib/fonts.ts` | Pretendard + JetBrains Mono |
| 콘텐츠 스키마 변경 | `apps/web/velite.config.ts` | Post collection 스키마 |
| 기획/디자인 문서 | `docs/` | PRD.md, DESIGN_SPEC.md, mockup.html |

## CONVENTIONS

### Feature-based 구조
- 도메인별로 `features/{domain}/components/`, `features/{domain}/lib/`, `features/{domain}/__tests__/` 구성
- 각 feature에 barrel export (`index.ts`)
- feature 내부는 상대경로, 외부 참조는 `@/` alias

### 콘텐츠 파이프라인
- Velite가 `content/posts/**/*.mdx` -> `.velite/posts.json` 빌드
- `#velite` path alias로 빌드된 데이터 import
- dev: Velite watch 모드 (next.config.ts에서 자동 시작)
- build: `velite build --clean && next build` 순서 필수

### 코드 하이라이팅
- rehype-pretty-code + Shiki 듀얼 테마 (github-light / github-dark-dimmed)
- `keepBackground: false` -- 프로젝트 CSS 토큰 사용
- globals.css에 Shiki CSS 변수 정의됨

### 디자인
- Pretendard Variable (본문) + JetBrains Mono (코드)
- next-themes 다크모드 (dark 기본)
- shadcn/ui + Tailwind v4
- 블로그 본문 max-width: 768px
- TOC: 콘텐츠 바깥 우측 플로팅 (xl+ 1280px)
- 헤더 네비게이션 단일 (내부 중복 금지)

## COMMANDS

```bash
pnpm dev          # 개발 서버 (Turbopack + Velite watch)
pnpm build        # 프로덕션 빌드 (Velite -> Next.js)
pnpm test         # Vitest 전체 실행
pnpm lint         # ESLint
pnpm format       # Prettier

# apps/web 단독
cd apps/web
pnpm test:watch   # Vitest watch 모드
```

## ANTI-PATTERNS

- `.velite/` 디렉토리를 직접 수정하지 말 것 (빌드 산출물, gitignored)
- `components/ui/`에 도메인 컴포넌트 넣지 말 것 (shadcn/ui 전용)
- 헤더 외 중복 네비게이션 만들지 말 것
- Velite 빌드 없이 `next build` 단독 실행하지 말 것

## NOTES

- `@` alias = `apps/web/src/`, `#velite` alias = `apps/web/.velite/`
- Vitest에서 Velite 데이터는 `#velite` mock 필요 (vi.mock)
- Git 브랜치: `main` (프로덕션), `develop` (개발)
- 배포: Vercel 예정
