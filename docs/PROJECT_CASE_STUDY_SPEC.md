# DESIGN SPEC — 프로젝트 케이스 스터디 페이지 (`/projects/[slug]`)

> **Author**: PD | **Status**: Draft | **Last Updated**: 2026-04-02
> **Based on**: [DESIGN_SPEC.md](./DESIGN_SPEC.md) · [PRD.md](./PRD.md)
> **컨셉**: 서사형 케이스 스터디 — 블로그 글이 아닌 랜딩페이지에 가까운 구성

---

## 0. 컨셉 & 원칙

**목표**: 채용 담당자/협업 제안자가 5분 안에 "이 개발자, 실력 있다"는 인상을 받게 한다.

**서사 구조**: 문제 인식 → 문제 정의 → 해결 과정 → 결과. 텍스트를 읽지 않아도 흐름이 전달되어야 한다.

**디자인 원칙**:
1. **스크롤이 곧 이야기** — 스크롤할수록 이야기가 펼쳐지는 구조
2. **수치가 설득한다** — 임팩트는 텍스트보다 숫자로 표현
3. **시각적 증거** — 스크린샷/다이어그램이 글보다 먼저 눈에 들어와야 함
4. **애니메이션은 의미를 가진다** — 장식이 아닌 내러티브 도구

---

## 1. 라우트 & 파일 구조

### 라우트 설계 — 단일 페이지 + 앵커

```
/projects/[slug]           ← 케이스 스터디 단일 페이지
  #overview
  #problem
  #process
  #result
  #links
```

> **Rationale**: 서사형 스크롤 플로우가 끊기지 않아야 함. 섹션별 다중 라우트는 흐름을 깨므로 앵커 구조 선택.
> 각 섹션에 `id` 속성 부여 → 직접 링크 공유 가능 (`/projects/missionary#result`).

### 파일 구조

```
apps/web/
├── src/
│   ├── app/
│   │   └── projects/
│   │       ├── page.tsx               # 프로젝트 목록 (/projects)
│   │       └── [slug]/
│   │           ├── page.tsx           # 케이스 스터디 상세
│   │           └── loading.tsx        # 스켈레톤
│   └── features/
│       └── portfolio/
│           ├── components/
│           │   ├── CaseStudyHero.tsx
│           │   ├── CaseStudyOverview.tsx
│           │   ├── CaseStudySection.tsx    # 공통 섹션 래퍼
│           │   ├── ProcessTimeline.tsx
│           │   ├── ResultMetrics.tsx
│           │   ├── ProjectLinks.tsx
│           │   └── SectionProgress.tsx    # 우측 dot 네비게이션
│           ├── animation/
│           │   ├── FadeInUp.tsx           # 스크롤 reveal 래퍼
│           │   ├── ParallaxImage.tsx      # parallax 이미지
│           │   └── CountUp.tsx            # 숫자 카운트업
│           ├── lib/
│           │   └── projects.ts            # 프로젝트 데이터 로더
│           └── index.ts
└── content/
    └── projects/
        └── missionary.mdx               # 프로젝트 케이스 스터디 MDX
```

---

## 2. 콘텐츠 스키마 (MDX Frontmatter)

```yaml
---
title: "missionary — 팀 협업 플랫폼"
slug: "missionary"
period: "2024.06 - 2024.12"
role: "Frontend Lead"
team: 4
tech: ["Next.js", "TypeScript", "NestJS", "PostgreSQL"]
thumbnail: "/projects/missionary/thumb.png"    # 목록 카드용 (16:9)
hero: "/projects/missionary/hero.png"          # Hero 섹션 배경 (21:9 권장)
impact: "팀 협업 효율 60% 향상"               # Hero 임팩트 문구
github: "https://github.com/juchan/missionary"
demo: "https://missionary.vercel.app"
featured: true                                 # 홈 페이지 추천 프로젝트 여부
---
```

MDX 본문은 `## Problem`, `## Process`, `## Result` 섹션 헤딩으로 구분.

---

## 3. 페이지 전체 와이어프레임

```
┌──────────────────────── Header (전역 단일 nav) ──────────────────┐

┌──────────────────────── 1. HERO (100svh) ────────────────────────┐
│  [배경 이미지 — fullscreen, overlay 50%]                         │
│                                                                  │
│  [카테고리 태그 — e.g. "Personal Project · 2024"]               │
│                                                                  │
│  # 프로젝트명                        ← H1, clamp(3rem, 6vw, 5rem)│
│    임팩트 한 줄 문구                 ← 부제목, muted             │
│                                                                  │
│  [Frontend Lead]  [2024.06–12]  [Next.js TS NestJS PG]          │
│                                                                  │
│                      ↓ 스크롤                                    │
└──────────────────────────────────────────────────────────────────┘

         ●  ← 우측 dot nav (xl+, sticky)
         ○
         ○
         ○
         ○

┌──────────────────────── 2. OVERVIEW (#overview) ────────────────┐
│                   max-w-5xl (1100px) centered                   │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  역할    │  │  기간    │  │  팀 규모 │  │ 기여도   │       │
│  │ Frontend │  │ 6개월    │  │  4명     │  │  70%     │       │
│  │  Lead    │  │          │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  기술 스택:  [Next.js] [TypeScript] [NestJS] [PostgreSQL]       │
│                                                                  │
│  배경 한 줄 설명 (1~2문장)                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────── 3. PROBLEM (#problem) ──────────────────┐
│              max-w-3xl (768px) centered                         │
│                                                                  │
│  PROBLEM                          ← 섹션 레이블 (uppercase, xs) │
│  ## 무엇이 문제였나               ← H2                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │  "팀원들은 각자의 툴을 쓰고 있었고,              │            │
│  │   아무도 전체 그림을 볼 수 없었다."             │ ← callout │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  문제 설명 텍스트 (3~5문단)                                     │
│                                                                  │
│  [문제 상황 스크린샷 또는 다이어그램 — full-width]               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────── 4. PROCESS (#process) ──────────────────┐
│                                                                  │
│  PROCESS                                                        │
│  ## 어떻게 해결했나               max-w-3xl centered            │
│                                                                  │
│  ── STEP 1 ──────────────────────────────────────────────────── │
│  ┌─── 텍스트 (1/2) ──────┐  ┌─── 이미지 (1/2) ─────────────┐  │
│  │                       │  │ [스크린샷 / 다이어그램]        │  │
│  │ ### 문제 정의          │  │                               │  │
│  │ 해결 과정 설명         │  │                               │  │
│  │                       │  │                               │  │
│  └───────────────────────┘  └───────────────────────────────┘  │
│                                                                  │
│  ── STEP 2 ──────────────────────────────────────────────────── │
│  ┌─── 이미지 (1/2) ──────┐  ┌─── 텍스트 (1/2) ─────────────┐  │
│  │ [스크린샷]             │  │                               │  │
│  │                       │  │ ### 구조 설계                  │  │
│  │                       │  │ 해결 과정 설명                 │  │
│  └───────────────────────┘  └───────────────────────────────┘  │
│                                                                  │
│  (텍스트-이미지 교대 레이아웃 반복 — 최대 4 스텝)               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────── 5. RESULT (#result) ────────────────────┐
│                   max-w-5xl (1100px) centered                   │
│                                                                  │
│  RESULT                                                         │
│  ## 무엇을 만들었나                                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    60%       │  │    4.8/5     │  │   2,000+     │          │
│  │  협업 효율   │  │  팀 만족도   │  │  코드 리뷰   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                     ← 숫자 카운트업 (in-viewport)               │
│                                                                  │
│  [최종 결과물 스크린샷 — fullscreen or max-w-5xl]               │
│                                                                  │
│  ### 회고 & 배운 점 (max-w-3xl)                                 │
│  짧은 회고 텍스트 (2~3문단)                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────── 6. LINKS (#links) ──────────────────────┐
│                   max-w-3xl (768px) centered                    │
│                                                                  │
│  [GitHub ↗]        [Demo ↗]        [관련 블로그 글 ↗]           │
│                                                                  │
│  ────────────────────────────────────────────────────────────── │
│                                                                  │
│  다음 프로젝트 →                                                 │
│  [썸네일]  다음 프로젝트명                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────── Footer ─────────────────────────────┐
```

---

## 4. 섹션별 컴포넌트 & 스펙

### 4.1 Hero (`CaseStudyHero`)

| 속성 | 스펙 |
|---|---|
| 높이 | `100svh` (모바일 주소창 고려 svh 사용) |
| 배경 | `next/image` fill + `object-cover`, overlay `bg-black/50` |
| 제목 H1 | `clamp(3rem, 6vw, 5rem)`, `font-weight: 800`, `letter-spacing: -0.03em` |
| 부제 | `clamp(1rem, 2vw, 1.25rem)`, `--muted-foreground` |
| 메타 배지 | 역할 · 기간 · 기술스택 pill 배지 (`bg-white/10 text-white border border-white/20`) |
| 스크롤 힌트 | 하단 중앙 bounce 애니메이션 화살표 (`↓`) |
| 애니메이션 | 진입 시 `fade-in-up` stagger (제목 → 부제 → 메타 → 화살표, 100ms 간격) |
| 접근성 | 배경 이미지 `alt=""` (장식), 오버레이로 텍스트 대비 WCAG AA 보장 |

```
텍스트 계층:
  [카테고리 · 연도]     ← text-xs uppercase tracking-widest muted
  [H1 프로젝트명]       ← clamp(3rem, 6vw, 5rem)
  [임팩트 한 줄]        ← clamp(1rem, 2vw, 1.25rem) muted
  [메타 배지들]         ← gap-2 flex-wrap
```

### 4.2 Section Progress Nav (`SectionProgress`)

**데스크톱 (xl+)**:
- 우측 고정 (`position: fixed; right: 2rem; top: 50%; transform: translateY(-50%)`)
- 섹션별 원형 dot (8px)
- 활성 섹션: dot 확대 + label 표시 (hover 또는 active)
- `aria-label`: 각 섹션명

**모바일 (xl 미만)**:
- 상단 선형 progress bar (2px, `--foreground`, `ReadingProgressBar`와 동일 스타일)

```
dot nav 스펙:
  크기:    비활성 8px / 활성 10px (scale 트랜지션)
  색상:    비활성 --border / 활성 --foreground
  label:   hover 시 왼쪽으로 fade-in (240ms)
  z-index: 40 (Header보다 낮게)
```

### 4.3 Overview (`CaseStudyOverview`)

- 4열 메타 그리드 (역할 / 기간 / 팀 규모 / 기여도)
- 모바일: 2열
- 기술스택: shadcn `Badge` variant `outline`
- 배경 설명: `max-w-2xl mx-auto` 중앙 정렬 텍스트
- 애니메이션: `FadeInUp` stagger (메타 카드 100ms 간격)

```css
/* 메타 카드 */
.meta-card {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 8px;
  text-align: center;
}

.meta-card .value {
  font-size: 1.5rem;
  font-weight: 700;
}

.meta-card .label {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}
```

### 4.4 Problem Section

- 컨테이너: `max-w-3xl mx-auto` (가독성)
- 섹션 레이블: `text-xs uppercase tracking-[0.15em] text-muted-foreground`
- Callout 인용구: `border-l-4 border-foreground pl-6 text-xl italic`
- 문제 다이어그램/스크린샷: `max-w-5xl mx-auto -mx-4 sm:-mx-8` (텍스트 밖으로 돌출)
- 애니메이션: CSS Scroll-Driven `reveal-up`

```css
.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--muted-foreground);
  margin-bottom: 0.5rem;
}
```

### 4.5 Process Section (`ProcessTimeline`)

**레이아웃**: 텍스트(1/2) ↔ 이미지(1/2) 교대 (`md:grid-cols-2`, `max-w-6xl mx-auto`)

| 스텝 | 텍스트 위치 | 이미지 위치 |
|---|---|---|
| 홀수 스텝 | 왼쪽 | 오른쪽 |
| 짝수 스텝 | 오른쪽 | 왼쪽 (`md:order-first`) |

```
스텝 구성:
  [스텝 번호 — 01 / 02 / 03...]
  [### 스텝 제목]
  [설명 텍스트 2~4문단]
  [기술적 결정 callout — 선택적]
```

- 이미지: `next/image`, `border border-border rounded-lg shadow-lg`
- 이미지 hover: `scale(1.02)` 150ms ease-out
- 모바일: 텍스트 먼저, 이미지 아래 (단일 컬럼)
- 애니메이션: `ParallaxImage` (이미지 y offset -20px on scroll)

### 4.6 Result Metrics (`ResultMetrics`)

- 3~4개 핵심 수치 카드
- 숫자: `CountUp` 컴포넌트 (in-viewport 트리거, 1.5s ease-out)
- 결과 스크린샷: `max-w-6xl mx-auto` 또는 fullbleed
- 회고 텍스트: `max-w-3xl mx-auto` + prose 스타일

```
수치 카드:
  숫자:  text-5xl font-bold (clamp 권장)
  단위:  text-2xl (숫자 옆)
  라벨:  text-sm muted
```

### 4.7 Links Section (`ProjectLinks`)

```
┌─ 링크 그룹 ──────────────────────────────────────┐
│  [GitHub ↗]   [Demo ↗]   [관련 포스트 ↗]         │
└──────────────────────────────────────────────────┘

┌─ 다음 프로젝트 ───────────────────────────────────┐
│  다음 프로젝트 →                                  │
│  [썸네일 16:9]                                    │
│  프로젝트명                                       │
└──────────────────────────────────────────────────┘
```

- 링크 버튼: shadcn `Button` variant `outline`, 외부 링크 `target="_blank" rel="noopener"`
- 다음 프로젝트 카드: hover 시 `translateY(-4px)` + shadow 강화 (150ms)

---

## 5. 애니메이션 가이드

### 5.1 사용 스택 결정

| 용도 | 라이브러리 | 이유 |
|---|---|---|
| 스크롤 reveal (fade-in-up) | **CSS Scroll-Driven** | 번들 0KB, 간단한 reveal에 충분 |
| Hero 진입 + stagger | **Motion** (`motion/react`) | 복잡한 stagger 시퀀스 |
| 페이지 전환 | **Motion** `AnimatePresence` | RSC 경계 관리 |
| Parallax 이미지 | **Motion** `useScroll` + `useTransform` | 선언적, React와 자연스러운 통합 |
| 숫자 카운트업 | **커스텀 훅** + requestAnimationFrame | 외부 의존성 없음 |
| GSAP | 미사용 | 현재 요구사항에서 오버킬 |

### ⚠️ 번들 최적화 — `next/dynamic` 필수 적용 대상

아래 컴포넌트는 **below-the-fold**이므로 `next/dynamic`으로 지연 로딩해야 한다.
초기 번들에 포함하면 FCP/LCP가 저하됨 (`bundle-dynamic-imports` 규칙).

```tsx
// app/projects/[slug]/page.tsx
import dynamic from 'next/dynamic'

// ✅ below-fold 애니메이션 컴포넌트 — 지연 로딩
const ParallaxImage  = dynamic(() => import('@/features/portfolio/animation/ParallaxImage').then(m => m.ParallaxImage),  { ssr: false })
const CountUp        = dynamic(() => import('@/features/portfolio/animation/CountUp').then(m => m.CountUp),              { ssr: false })
const ProcessTimeline = dynamic(() => import('@/features/portfolio/components/ProcessTimeline').then(m => m.ProcessTimeline))
const ResultMetrics  = dynamic(() => import('@/features/portfolio/components/ResultMetrics').then(m => m.ResultMetrics))

// ✅ Hero는 above-fold — 정적 import 유지 (지연 로딩하면 안 됨)
import { CaseStudyHero } from '@/features/portfolio/components/CaseStudyHero'
```

> **`ssr: false` 이유**: `useScroll`·`useInView` 등 DOM API를 사용하는 컴포넌트는 서버에서 실행 불가.
> `ProcessTimeline`은 `next/image`만 사용하므로 SSR 가능 — `ssr: false` 불필요.

### 5.2 CSS Scroll-Driven — Reveal Animation

```css
/* globals.css에 추가 */

@keyframes reveal-up {
  from {
    opacity: 0;
    translate: 0 32px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes reveal-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.scroll-reveal {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 25%;
}

.scroll-reveal-fade {
  animation: reveal-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 20%;
}

/* 접근성: reduced motion */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal,
  .scroll-reveal-fade {
    animation: none;
  }
}
```

> **브라우저 지원 주의**: CSS Scroll-Driven은 Chrome 115+, Safari 18+, Firefox 110+.
> 미지원 브라우저(< 5% 점유율)에서는 `animation: none` 폴백 — 콘텐츠는 항상 표시됨.

### 5.3 Motion — Hero 진입 Stagger

```tsx
// features/portfolio/components/CaseStudyHero.tsx
'use client'

import { motion } from 'motion/react'

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, // easeOutExpo
  },
}

export function CaseStudyHero({ title, impact, role, period, tech }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.p variants={itemVariants}>{/* 카테고리 레이블 */}</motion.p>
      <motion.h1 variants={itemVariants}>{title}</motion.h1>
      <motion.p variants={itemVariants}>{impact}</motion.p>
      <motion.div variants={itemVariants}>{/* 메타 배지 */}</motion.div>
    </motion.div>
  )
}
```

### 5.4 Motion — FadeInUp 재사용 래퍼

```tsx
// features/portfolio/animation/FadeInUp.tsx
'use client'

import { motion } from 'motion/react'

interface FadeInUpProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeInUp({ children, delay = 0, className }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

> **사용처**: Overview 카드 stagger, Process 스텝, Result 수치 카드
> CSS Scroll-Driven으로 처리하기 어려운 stagger delay가 필요한 곳에만 사용

### 5.5 Motion — Parallax 이미지

```tsx
// features/portfolio/animation/ParallaxImage.tsx
'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'

export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30])

  return (
    <div ref={ref} className="overflow-hidden rounded-lg">
      <motion.div style={{ y }}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </motion.div>
    </div>
  )
}
```

### 5.6 커스텀 훅 — CountUp

```tsx
// features/portfolio/animation/CountUp.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

export function CountUp({
  end,
  suffix = '',
  duration = 1500,
}: {
  end: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(end * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}
```

### 5.7 페이지 전환 (AnimatePresence)

```tsx
// app/projects/[slug]/page.tsx
import { AnimatePresence, motion } from 'motion/react'

export default function ProjectCaseStudyPage() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* 케이스 스터디 섹션들 */}
    </motion.main>
  )
}
```

---

## 6. 반응형 명세

| 섹션 | 모바일 (< 768px) | 태블릿 (768px–1279px) | 데스크톱 (1280px+) |
|---|---|---|---|
| Hero | 텍스트 중앙 정렬, H1 `clamp(2.5rem, 8vw, 3.5rem)` | 동일 | 동일, H1 최대 5rem |
| Section Nav | 상단 progress bar | 상단 progress bar | 우측 dot nav |
| Overview | 2열 그리드 | 4열 그리드 | 4열 그리드 |
| Problem | 단일 컬럼, 이미지 full-width | 단일 컬럼 | 단일 컬럼 (max-w-3xl) |
| Process | 단일 컬럼, 이미지 아래 | 단일 컬럼 | 2열 교대 레이아웃 |
| Result Metrics | 단일 컬럼 | 3열 | 3~4열 |
| Links | 버튼 세로 배치 | 가로 배치 | 가로 배치 |

---

## 7. 접근성 (a11y)

| 항목 | 구현 방법 |
|---|---|
| Hero 배경 이미지 | `alt=""` + 오버레이로 대비 WCAG AA(4.5:1) 보장 |
| Section Progress dots | `aria-label="섹션명으로 이동"`, `role="navigation"` |
| CountUp 숫자 | `aria-live="polite"` — 스크린 리더에서 최종 값 읽음 |
| 애니메이션 전체 | `prefers-reduced-motion: reduce` → 모든 Motion/CSS 애니메이션 off |
| 외부 링크 | `target="_blank"` + `aria-label="새 탭에서 열기"` 또는 아이콘에 sr-only |
| Process 이미지 | 디자인 결정을 설명하는 alt 텍스트 (스크린샷은 단순 "스크린샷" 금지) |
| 색상 대비 | Hero 오버레이 최소 50% → 텍스트 대비 WCAG AA 이상 유지 |
| 키보드 탐색 | Section dot nav는 Tab 포커스 + Enter/Space로 이동 가능 |

```css
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal,
  .scroll-reveal-fade {
    animation: none;
  }
}
/* Motion 전역 설정 — layout.tsx에서 MotionConfig 사용 */
/* <MotionConfig reducedMotion="user"> */
```

---

## 8. 개발자 핸드오프 체크리스트

### 컴포넌트 인터페이스

```typescript
// CaseStudyHero props
interface CaseStudyHeroProps {
  title: string
  impact: string
  role: string
  period: string
  tech: string[]
  heroImage: string
  category?: string
}

// ResultMetrics props
interface Metric {
  value: number
  suffix: string   // e.g. "%", "+", "/5"
  label: string
}

interface ResultMetricsProps {
  metrics: Metric[]
  screenshot?: string
  screenshotAlt?: string
}

// ProcessTimeline props
interface ProcessStep {
  number: string          // "01", "02"...
  title: string
  description: string     // MDX string
  image?: string
  imageAlt?: string
}
```

### 인터랙션 스펙

| 인터랙션 | 트리거 | 효과 | duration / easing |
|---|---|---|---|
| Hero 진입 | 페이지 로드 | stagger fade-in-up | 0.6s easeOutExpo, 100ms stagger |
| Scroll reveal | viewport 진입 | fade-in-up (CSS) | `view()` entry 0–25% |
| Section dot | 스크롤 | 활성 dot scale + 레이블 | 150ms |
| Process 이미지 | hover | `scale(1.02)` | 150ms ease-out |
| CountUp | viewport 진입 | 0 → 최종값 | 1.5s ease-out cubic |
| Links CTA | hover | `translateY(-4px)` + shadow | 150ms ease-out |
| 페이지 진입 | route 변경 | `opacity 0→1, y 8→0` | 400ms easeOut |

### 설치 필요 패키지

```bash
# Motion (구 Framer Motion) — MIT 라이선스
pnpm add motion
```

> CSS Scroll-Driven은 `globals.css` 추가만으로 사용 가능 — 별도 패키지 없음.

---

## 9. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|---|---|---|
| 2026-04-02 | 초안 작성 (서사형 케이스 스터디 페이지 와이어프레임 + 스펙 + 애니메이션 가이드) | PD |
