# CASE STUDY SPEC — `/projects/[slug]`

> **Author**: PD | **Status**: Draft (작업 중 조정 예정) | **Last Updated**: 2026-04-02
> **Based on**: [DESIGN_SPEC.md](./DESIGN_SPEC.md) · [PROJECT_CASE_STUDY_SPEC.md](./PROJECT_CASE_STUDY_SPEC.md)
> **첫 번째 케이스**: juchan.dev (이 사이트 자체)

---

## 1. 페이지 구조

### 라우트 — 단일 페이지 + 앵커

```
/projects/[slug]
  #overview   — 역할·기간·기술스택 메타
  #problem    — 문제 배경
  #process    — 해결 과정 (스텝별)
  #result     — 결과 & 수치
  #links      — GitHub·Demo·다음 프로젝트
```

**선택 이유**: 서사형 스크롤 플로우가 핵심. 섹션 분리 라우트는 흐름을 끊음.
각 섹션 id로 직접 링크 공유 가능 → `/projects/juchan-dev#result`

### 파일 구조

```
apps/web/src/
├── app/projects/
│   ├── page.tsx                   # 목록 페이지
│   └── [slug]/
│       ├── page.tsx               # 케이스 스터디 상세
│       └── loading.tsx            # 스켈레톤
└── features/portfolio/
    ├── components/
    │   ├── CaseStudyHero.tsx
    │   ├── CaseStudyOverview.tsx
    │   ├── CaseStudySection.tsx   # 공통 섹션 래퍼
    │   ├── ProcessTimeline.tsx
    │   ├── ResultMetrics.tsx
    │   ├── ProjectLinks.tsx
    │   └── SectionProgress.tsx   # 우측 dot nav
    └── animation/
        ├── FadeInUp.tsx
        ├── ParallaxImage.tsx      # next/dynamic + ssr:false
        └── CountUp.tsx            # next/dynamic + ssr:false
```

---

## 2. 데이터 구조 — 첫 번째 케이스: juchan.dev

### MDX Frontmatter 스키마

```yaml
---
title: "juchan.dev"
slug: "juchan-dev"
tagline: "Gatsby 2.x 기술 부채를 Next.js 16으로 완전히 대체하다"
period: "2026.03 - 2026.04"
role: "Full-stack (개인 프로젝트)"
team: 1
contribution: 100
tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Velite", "Shiki"]
thumbnail: "/projects/juchan-dev/thumb.png"   # 목록 카드 (16:9)
hero: "/projects/juchan-dev/hero.png"         # Hero 배경 (21:9 권장, 어두운 이미지)
impact: "하나의 사이트로 블로그 + 포트폴리오 통합, 빌드 안정성 100% 확보"
github: "https://github.com/juchan/juchan.dev"
demo: "https://juchan.dev"
featured: true
---
```

### Velite 스키마 확장 (`velite.config.ts`)

```typescript
const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/**/*.mdx',
  schema: s.object({
    title:        s.string(),
    slug:         s.slug(),
    tagline:      s.string(),
    period:       s.string(),
    role:         s.string(),
    team:         s.number(),
    contribution: s.number().optional(),
    tech:         s.array(s.string()),
    thumbnail:    s.string(),
    hero:         s.string(),
    impact:       s.string(),
    github:       s.string().url().optional(),
    demo:         s.string().url().optional(),
    featured:     s.boolean().default(false),
    body:         s.mdx(),
  }),
})
```

---

## 3. 섹션별 와이어프레임 & 스펙

### 3.1 Hero

```
┌──────────────────── fullscreen (100svh) ────────────────────────┐
│  [hero 이미지 fullscreen + overlay bg-black/50]                 │
│                                                                  │
│         Personal Project · 2026                                  │  ← xs, uppercase, muted
│                                                                  │
│         juchan.dev                                               │  ← H1, clamp(3rem,6vw,5rem), w-800
│         Gatsby 2.x 기술 부채를 Next.js 16으로                    │  ← 부제, clamp(1rem,2vw,1.25rem)
│         완전히 대체하다                                           │
│                                                                  │
│         [Full-stack]  [2026.03–04]  [Next.js] [TS] [Velite]    │  ← pill 배지
│                                                                  │
│                           ↓                                      │  ← bounce 애니메이션
└──────────────────────────────────────────────────────────────────┘
```

| 속성 | 값 |
|---|---|
| 높이 | `100svh` (모바일 주소창 고려) |
| 배경 | `next/image` fill + `object-cover` + `bg-black/50` overlay |
| H1 폰트 | `clamp(3rem, 6vw, 5rem)` / weight 800 / `letter-spacing: -0.03em` |
| 부제 색상 | `text-white/70` |
| 메타 배지 | `bg-white/10 border border-white/20 text-white text-sm px-3 py-1 rounded-full` |
| 애니메이션 | 진입 stagger: 카테고리 → H1 → 부제 → 배지 (100ms 간격, Motion) |

### 3.2 Section Progress Nav (`SectionProgress`)

**데스크톱 xl+**:
```
                              ● Hero
                              ○ Overview
                              ○ Problem    ← 우측 fixed, top: 50%
                              ○ Process
                              ○ Result
                              ○ Links
```
- `position: fixed; right: 1.5rem; top: 50%; transform: translateY(-50%)`
- dot 크기: 비활성 8px / 활성 10px
- 색상: 비활성 `--border` / 활성 `--foreground`
- hover 시 레이블 좌측 fade-in (240ms)

**모바일 xl 미만**: 상단 2px reading progress bar (기존 `ReadingProgressBar` 스타일 통일)

### 3.3 Overview (#overview)

```
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Full-    │  │  2개월   │  │  1인     │  │  100%    │
  │ stack    │  │  기간    │  │  팀 규모 │  │  기여도  │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘

  기술 스택:  [Next.js 16] [React 19] [TypeScript] [Tailwind v4] [Velite] [Shiki]

  Gatsby 2.x로 분리되어 있던 블로그·포트폴리오를 단일 Next.js 사이트로 통합.
```

- 컨테이너: `max-w-5xl mx-auto`
- 메타 카드: 4열(데스크톱) / 2열(모바일), `border border-border rounded-lg p-6 text-center`
- 기술 배지: shadcn `Badge` variant `outline`
- 애니메이션: `FadeInUp` stagger 100ms

### 3.4 Problem (#problem)

```
  PROBLEM
  ## Gatsby 2.x — 끝나지 않은 기술 부채

  ┌──────────────────────────────────────────────────────────────┐
  │  "블로그와 포트폴리오가 분리된 두 프로젝트 —                  │  ← callout
  │   유지비는 2배, 브랜딩 일관성은 0이었다."                    │
  └──────────────────────────────────────────────────────────────┘

  문제 설명 텍스트...

  [문제 상황 다이어그램: julog / juchanhwang 두 레포 → 화살표 → juchan.dev]
```

- 컨테이너: `max-w-3xl mx-auto`
- 섹션 레이블: `text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2`
- Callout: `border-l-4 border-foreground pl-6 py-2 text-xl italic`
- 다이어그램 이미지: `max-w-5xl mx-auto` (텍스트 밖으로 돌출)
- 애니메이션: CSS Scroll-Driven `.scroll-reveal`

### 3.5 Process (#process)

텍스트 ↔ 이미지 **교대 2열 레이아웃** (데스크톱 md+), 모바일 단일 컬럼.

```
── STEP 01 ────────────────────────────────────────────────────
┌─── 텍스트 (1/2) ────────────┐  ┌─── 이미지 (1/2) ───────────┐
│ ### 스택 선정                │  │ [아키텍처 다이어그램]        │
│                              │  │                             │
│ Gatsby 2.x EOL 문제로 Next  │  │                             │
│ .js 16 + Velite 조합 선택.  │  │                             │
└──────────────────────────────┘  └─────────────────────────────┘

── STEP 02 ────────────────────────────────────────────────────
┌─── 이미지 (1/2) ────────────┐  ┌─── 텍스트 (1/2) ───────────┐
│ [디자인 시스템 스크린샷]     │  │ ### 디자인 시스템 구축       │
│                              │  │                             │
│                              │  │ velog 레퍼런스 기반         │
└──────────────────────────────┘  └─────────────────────────────┘

── STEP 03 ────────────────────────────────────────────────────
(블로그 기능 구현)

── STEP 04 ────────────────────────────────────────────────────
(케이스 스터디 포트폴리오 구현)
```

| 속성 | 값 |
|---|---|
| 컨테이너 | `max-w-6xl mx-auto` |
| 그리드 | `md:grid-cols-2 gap-12 items-center` |
| 짝수 스텝 이미지 | `md:order-first` |
| 이미지 스타일 | `rounded-lg border border-border shadow-lg` |
| 이미지 hover | `scale(1.02)` 150ms ease-out |
| 애니메이션 | `ParallaxImage` (y ±30px on scroll) |

### 3.6 Result (#result)

```
  RESULT
  ## 만들어진 것

  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
  │      1         │  │     90+        │  │      2         │
  │      개        │  │  Lighthouse    │  │    주 만에     │
  │  통합 사이트   │  │  Performance   │  │    런칭        │
  └────────────────┘  └────────────────┘  └────────────────┘

  [최종 결과물 스크린샷 — 사이트 전체 화면]

  ### 회고
  (2~3문단 — 배운 점, 아쉬운 점, 다음에 할 것)
```

- 수치 카드: `text-5xl font-bold` + CountUp 카운트업 애니메이션
- 스크린샷: `max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl`
- 회고: `max-w-3xl mx-auto` + prose 스타일
- 애니메이션: `CountUp` (in-viewport, 1.5s ease-out cubic)

### 3.7 Links (#links)

```
  [GitHub ↗]      [Demo ↗]      [관련 블로그 글 ↗]

  ─────────────────────────────────────────────────

  다음 프로젝트 →
  [썸네일]  missionary — 팀 협업 플랫폼
```

- 링크 버튼: shadcn `Button` variant `outline` + `gap-2`
- 다음 프로젝트: hover `translateY(-4px)` + shadow 강화 (150ms)
- 외부 링크: `target="_blank" rel="noopener noreferrer"`

---

## 4. 애니메이션 가이드

### 4.1 스택 결정

| 용도 | 도구 | 이유 |
|---|---|---|
| Hero 진입 stagger | **Motion** `variants` | 복잡한 시퀀스 제어 필요 |
| 섹션 reveal | **CSS Scroll-Driven** | 번들 0KB |
| Parallax 이미지 | **Motion** `useScroll` + `useTransform` | 선언적 API |
| 숫자 카운트업 | 커스텀 rAF 훅 | 외부 의존성 없음 |
| 페이지 전환 | **Motion** `AnimatePresence` | RSC 경계 관리 |

**번들 최적화**: `ParallaxImage`·`CountUp`은 `next/dynamic + ssr:false`로 지연 로딩.
`CaseStudyHero`는 above-fold → 정적 import 유지.

```typescript
// app/projects/[slug]/page.tsx
import dynamic from 'next/dynamic'
import { CaseStudyHero } from '@/features/portfolio/components/CaseStudyHero' // 정적

const ParallaxImage   = dynamic(() => import('@/features/portfolio/animation/ParallaxImage').then(m => m.ParallaxImage),   { ssr: false })
const CountUp         = dynamic(() => import('@/features/portfolio/animation/CountUp').then(m => m.CountUp),               { ssr: false })
const ProcessTimeline = dynamic(() => import('@/features/portfolio/components/ProcessTimeline').then(m => m.ProcessTimeline))
const ResultMetrics   = dynamic(() => import('@/features/portfolio/components/ResultMetrics').then(m => m.ResultMetrics))
```

### 4.2 CSS Scroll-Driven Reveal

```css
/* globals.css 추가 */
@keyframes reveal-up {
  from { opacity: 0; translate: 0 32px; }
  to   { opacity: 1; translate: 0 0; }
}

.scroll-reveal {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 25%;
}

@media (prefers-reduced-motion: reduce) {
  .scroll-reveal { animation: none; }
}
```

**사용처**: Problem 텍스트, Overview 카드, Result 회고 텍스트 — `<div className="scroll-reveal">`

### 4.3 Motion Hero Stagger

```tsx
// 'use client'
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}
```

### 4.4 Parallax 이미지

```tsx
// 'use client', next/dynamic + ssr:false
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
const y = useTransform(scrollYProgress, [0, 1], [-30, 30])
// <motion.div style={{ y }}><Image .../></motion.div>
```

### 4.5 CountUp

```tsx
// rAF 기반, useInView 트리거
// ease-out cubic: 1 - Math.pow(1 - progress, 3)
// duration: 1500ms
```

### 4.6 인터랙션 스펙 요약

| 요소 | 트리거 | 효과 | 스펙 |
|---|---|---|---|
| Hero 요소들 | 페이지 로드 | stagger fade-in-up | 0.6s, 100ms stagger |
| 섹션 콘텐츠 | scroll into view | fade-in-up (CSS) | view() entry 0–25% |
| Section dot | 스크롤 | active scale + label | 150ms |
| Process 이미지 | hover | scale(1.02) | 150ms ease-out |
| CountUp | viewport 진입 | 0→최종값 | 1.5s ease-out cubic |
| Links CTA | hover | translateY(-4px) | 150ms ease-out |
| 페이지 진입 | route 변경 | opacity 0→1, y 8→0 | 400ms easeOut |

---

## 5. 타이포그래피 & 레이아웃

기존 `DESIGN_SPEC.md`와 동일한 토큰 사용. 케이스 스터디 전용 추가 사항:

| 요소 | 값 | 비고 |
|---|---|---|
| Hero H1 | `clamp(3rem, 6vw, 5rem)` / 800 | DESIGN_SPEC H1(2.5rem)보다 큼 |
| 섹션 레이블 | `0.75rem` / uppercase / `tracking-[0.15em]` / muted | "PROBLEM", "RESULT" 등 |
| Process 스텝 번호 | `text-sm font-mono text-muted-foreground` | "01", "02" 형식 |
| Callout 인용구 | `text-xl italic border-l-4 border-foreground pl-6` | Problem 섹션 |
| 수치 카드 숫자 | `clamp(2.5rem, 5vw, 4rem)` / 800 | Result 섹션 |

### 컨테이너 너비 (섹션별)

| 섹션 | max-width | 비고 |
|---|---|---|
| Hero | fullscreen | 제한 없음 |
| Overview | `max-w-5xl` (1100px) | 4열 카드 |
| Problem | `max-w-3xl` (768px) | 텍스트 가독성 |
| Problem 이미지 | `max-w-5xl` (1100px) | 텍스트 밖 돌출 |
| Process | `max-w-6xl` (1152px) | 2열 교대 레이아웃 |
| Result 수치 | `max-w-5xl` (1100px) | 3–4열 카드 |
| Result 스크린샷 | `max-w-6xl` (1152px) | 넓게 |
| Result 회고 | `max-w-3xl` (768px) | 텍스트 가독성 |
| Links | `max-w-3xl` (768px) | |

---

## 6. 반응형

| 섹션 | 모바일 (< md) | 태블릿 (md–xl) | 데스크톱 (xl+) |
|---|---|---|---|
| Hero | H1 `clamp(2.5rem,8vw,3.5rem)`, 배지 wrap | 동일 | H1 최대 5rem |
| Section Nav | 상단 progress bar | 상단 progress bar | 우측 dot nav |
| Overview 카드 | 2열 | 4열 | 4열 |
| Process | 단일 컬럼 (이미지 하단) | 단일 컬럼 | 2열 교대 |
| Result 수치 | 단일 컬럼 | 3열 | 3–4열 |
| Links 버튼 | 세로 배치 | 가로 배치 | 가로 배치 |

**터치 타겟**: 모든 인터랙티브 요소 최소 `44×44px` (DESIGN_SPEC 접근성 기준 동일)

---

## 7. 접근성

| 항목 | 구현 |
|---|---|
| Hero 배경 이미지 | `alt=""` (장식), overlay로 텍스트 대비 WCAG AA 보장 |
| Section dot nav | `role="navigation"` + `aria-label="섹션으로 이동"` |
| CountUp | `aria-live="polite"` |
| 외부 링크 | `aria-label` 또는 sr-only "(새 탭에서 열림)" |
| reduced-motion | CSS `.scroll-reveal { animation: none }` + `<MotionConfig reducedMotion="user">` |

---

## 8. 미결 사항

- [ ] hero 이미지 실제 에셋 생성 (스크린샷 or 일러스트?)
- [ ] 수치 3개 확정 — Lighthouse 점수 측정 후 실제 값으로 교체
- [ ] 회고 텍스트 작성 (MDX 본문)
- [ ] 다음 프로젝트 — missionary 케이스 스터디 스펙 별도 작성 필요

---

## 9. 변경 이력

| 날짜 | 내용 | 작성자 |
|---|---|---|
| 2026-04-02 | 초안 작성 (juchan.dev 첫 케이스 기준) | PD |
