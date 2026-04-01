# DESIGN SPEC — juchan.dev UI/UX 가이드라인

> **Author**: PD | **Status**: Draft | **Last Updated**: 2026-04-01
> **Based on**: [PRD.md](./PRD.md) | **Font/Layout Reference**: velog.io

---

## 0. 디자인 원칙

1. **콘텐츠 집중**: 모든 UI는 글과 프로젝트가 돋보이도록 물러난다
2. **빠름 = 신뢰**: 불필요한 인터랙션 없음, 방문자가 3초 안에 핵심을 파악
3. **다크 퍼스트**: 개발자 독자층 선호에 맞게 다크모드를 기본값으로
4. **접근성은 후순위가 없다**: 처음부터 WCAG AA 이상 준수

---

## 1. 컬러 시스템

### 1.1 기본 설계

- **베이스**: 무채색(grayscale) 기반 + accent 없음 (텍스트가 accent)
- **모드**: 다크 기본 / 라이트 토글
- **색공간**: oklch (Tailwind CSS v4 + shadcn/ui 표준)
- **구현**: `next-themes` + CSS custom properties

### 1.2 컬러 토큰 (globals.css 기준 확장)

```css
/* ─── Light Mode ─── */
:root {
  /* 배경 */
  --background:        oklch(1 0 0);          /* #FFFFFF */
  --background-subtle: oklch(0.97 0 0);       /* #F8F8F8 — 카드/코드 배경 */

  /* 텍스트 */
  --foreground:        oklch(0.145 0 0);      /* #1A1A1A */
  --muted-foreground:  oklch(0.50 0 0);       /* #666666 — 날짜, 읽기 시간 */

  /* 구분선/테두리 */
  --border:            oklch(0.90 0 0);       /* #E5E5E5 */

  /* 링크 */
  --link:              oklch(0.42 0.18 240);  /* #1d6ed8 — 진한 파랑 */
  --link-hover:        oklch(0.32 0.18 240);

  /* 코드 블록 */
  --code-bg:           oklch(0.96 0 0);       /* #F2F2F2 */
  --code-fg:           oklch(0.25 0 0);       /* #2E2E2E */

  /* 인라인 코드 */
  --inline-code-bg:    oklch(0.925 0 0 / 60%);
}

/* ─── Dark Mode ─── */
.dark {
  --background:        oklch(0.11 0 0);       /* #121212 (velog 실측) */
  --background-subtle: oklch(0.155 0 0);      /* #1E1E1E (velog 코드블록 실측) */

  --foreground:        oklch(0.925 0 0);      /* #ECECEC (velog 실측) */
  --muted-foreground:  oklch(0.65 0 0);       /* #9A9A9A */

  --border:            oklch(1 0 0 / 10%);

  --link:              oklch(0.67 0.16 240);  /* 밝은 파랑 */
  --link-hover:        oklch(0.77 0.16 240);

  --code-bg:           oklch(0.155 0 0);      /* #1E1E1E */
  --code-fg:           oklch(0.90 0 0);

  --inline-code-bg:    oklch(1 0 0 / 8%);
}
```

### 1.3 시맨틱 사용 가이드

| 토큰 | 사용처 |
|---|---|
| `--background` | 페이지 기본 배경 |
| `--background-subtle` | 카드 배경, 코드 블록, `<pre>` 블록 |
| `--foreground` | 본문 텍스트, 제목 |
| `--muted-foreground` | 날짜, 읽기 시간, 태그 레이블, placeholder |
| `--border` | `<hr>`, 카드 테두리, 구분선 |
| `--link` | 본문 내 링크, TOC 활성 항목 |
| `--inline-code-bg` | 인라인 코드 배경 |

### 1.4 접근성 대비비

| 조합 | 비율 | WCAG |
|---|---|---|
| `--foreground` on `--background` (다크) | ≥ 16:1 | ✅ AAA |
| `--foreground` on `--background` (라이트) | ≥ 14:1 | ✅ AAA |
| `--muted-foreground` on `--background` (다크) | ≥ 4.6:1 | ✅ AA |
| `--link` on `--background` (다크) | ≥ 4.5:1 | ✅ AA |

---

## 2. 타이포그래피

> PRD 명세 기반. 폰트는 Pretendard(본문) + JetBrains Mono(코드).

### 2.1 폰트 패밀리

```css
/* 본문 & 제목 — Pretendard (한/영 모두) */
--font-sans:
  "Pretendard Variable",
  "Pretendard",
  -apple-system,
  BlinkMacSystemFont,
  system-ui,
  sans-serif;

/* 코드 */
--font-mono:
  "JetBrains Mono",
  "Fira Code",
  "Fira Mono",
  Menlo,
  Monaco,
  Consolas,
  "Courier New",
  monospace;
```

**Pretendard 로딩 방법** (CDN via `layout.tsx`):
```tsx
// next/font/local 또는 CDN
// https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css
```

**JetBrains Mono 로딩 방법**:
```tsx
import { JetBrains_Mono } from 'next/font/google'
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
```

> **Rationale**: Pretendard는 한글/영문 동시 지원, velog 스타일과 유사한 높은 가독성. JetBrains Mono는 개발자 생태계 표준 코드 폰트.

### 2.2 타입 스케일 (PRD 명세)

| 요소 | rem | px (base 16) | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| **포스트 제목 (H1)** | 2.5rem | 40px | 800 | 1.4 | -0.02em |
| **H2** | 1.75rem | 28px | 700 | 1.4 | -0.01em |
| **H3** | 1.375rem | 22px | 700 | 1.5 | -0.01em |
| **H4** | 1.125rem | 18px | 600 | 1.5 | 0 |
| **본문 (desktop)** | 1.0625rem | 17px | 400 | 1.8 | -0.01em |
| **본문 (mobile)** | 0.9375rem | 15px | 400 | 1.8 | -0.01em |
| **코드 (block)** | 0.875rem | 14px | 400 | 1.6 | 0 |
| **메타/태그** | 0.875rem | 14px | 400 | 1.5 | 0 |
| **소형 레이블** | 0.75rem | 12px | 400 | 1.5 | 0.02em |

### 2.3 Tailwind 설정 (`globals.css` 추가)

```css
@theme inline {
  --font-sans: var(--font-pretendard);
  --font-mono: var(--font-jetbrains-mono);
}
```

### 2.4 Prose 스타일 (MDX 본문)

`@tailwindcss/typography` 또는 커스텀 prose class 적용:

```css
.prose {
  font-size: 17px;        /* desktop */
  line-height: 1.8;
  letter-spacing: -0.01em;
  color: var(--foreground);
}

.prose h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.prose h3 {
  font-size: 1.375rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-bottom: 1.25rem;
}

.prose a {
  color: var(--link);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.prose blockquote {
  border-left: 3px solid var(--border);
  padding-left: 1rem;
  color: var(--muted-foreground);
  margin: 1.5rem 0;
}

@media (max-width: 640px) {
  .prose { font-size: 15px; }
}
```

---

## 3. 레이아웃 가이드

### 3.1 그리드 원칙

- **기준 단위**: 4px (spacing-1)
- **8pt 그리드**: 모든 간격은 4의 배수 (8/12/16/24/32/40/48/64/80/96px)
- **페이지 좌우 padding**: `px-4` (16px) → `sm:px-6` (24px) → `lg:px-8` (32px)

### 3.2 컨테이너 너비

| 용도 | max-width | 클래스 |
|---|---|---|
| 블로그 본문 | **768px** | `max-w-3xl mx-auto` |
| 블로그 목록 | **768px** | `max-w-3xl mx-auto` |
| 포트폴리오 (홈/프로젝트) | **1100px** | `max-w-5xl mx-auto` |
| About | **768px** | `max-w-3xl mx-auto` |
| Header | **1200px** | `max-w-6xl mx-auto` |

> **Rationale**: 768px는 velog 실측값. 포스트 본문 최적 읽기 너비(65~75 chars/line)에 해당.

### 3.3 반응형 브레이크포인트

| 이름 | 값 | 설명 |
|---|---|---|
| `sm` | 640px | 모바일 가로 |
| `md` | 768px | 태블릿 세로 |
| `lg` | 1024px | 태블릿 가로 / 노트북 |
| `xl` | 1280px | 데스크톱 |

### 3.4 Header

```
┌─────────────── max-w-6xl, h-14 (56px), sticky top-0 ───────────┐
│  [juchan.dev]          [블로그] [프로젝트] [About]    [☀/🌙]   │
└─────────────────────────────────────────────────────────────────┘
```

- 높이: 56px (`h-14`)
- `sticky top-0 z-50`
- 배경: `bg-background/80 backdrop-blur-sm`
- 하단 border: `border-b border-border`
- 모바일: 로고 + 다크토글만 노출, 나머지 Sheet(drawer)로

### 3.5 Footer

```
┌──────────────────── max-w-6xl ─────────────────────────────────┐
│  © 2026 juchan.dev               [GitHub] [LinkedIn] [RSS]     │
│  Powered by Next.js & Vercel                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 컴포넌트 명세

### 4.1 레이아웃 컴포넌트

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| `Header` | `components/layout/Header` | sticky nav, 로고 + 메뉴 + 다크토글 |
| `Footer` | `components/layout/Footer` | 저작권 + 소셜 링크 |
| `PageLayout` | `components/layout/PageLayout` | 공통 wrapper (Header + Footer) |
| `PostLayout` | `components/layout/PostLayout` | 블로그 포스트 전용 (768px + TOC) |
| `ReadingProgressBar` | `components/layout/ReadingProgressBar` | 상단 2px fixed, scroll 진행률 |

### 4.2 블로그 컴포넌트

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| `PostCard` | `components/blog/PostCard` | 목록 카드 (제목/요약/태그/날짜/읽기시간) |
| `PostHeader` | `components/blog/PostHeader` | 포스트 상단 (제목 + 메타 + 태그) |
| `PostMeta` | `components/blog/PostMeta` | 날짜 · 읽기 시간 |
| `PostBody` | `components/blog/PostBody` | MDX 렌더링 영역 (prose 스타일 적용) |
| `PostNavigation` | `components/blog/PostNavigation` | 이전/다음 글 |
| `TOC` | `components/blog/TOC` | 목차 (H2/H3 자동 추출, 스크롤 하이라이트) |
| `TagBadge` | `components/blog/TagBadge` | 태그 뱃지 |
| `TagFilter` | `components/blog/TagFilter` | 태그 필터 탭 (blog 목록 페이지) |
| `GiscusComment` | `components/blog/GiscusComment` | Giscus 댓글 래퍼 |
| `SeriesBox` | `components/blog/SeriesBox` | 시리즈 포스트 목록 박스 |

### 4.3 포트폴리오 컴포넌트

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| `HeroSection` | `components/portfolio/HeroSection` | 홈 상단 소개 |
| `ProjectCard` | `components/portfolio/ProjectCard` | 프로젝트 카드 |
| `SkillBadge` | `components/portfolio/SkillBadge` | 기술 스택 뱃지 |
| `TimelineItem` | `components/portfolio/TimelineItem` | 경력 타임라인 항목 |
| `SocialLinks` | `components/portfolio/SocialLinks` | GitHub/LinkedIn/이메일 링크 버튼 |

### 4.4 MDX 커스텀 컴포넌트

| 컴포넌트 | HTML 대응 | 설명 |
|---|---|---|
| `CodeBlock` | `<pre><code>` | Shiki 하이라이팅 + 복사 버튼 + 언어 태그 |
| `InlineCode` | `<code>` | 인라인 코드 (배경 + 폰트 변경) |
| `Callout` | `<blockquote>` | Info/Warning/Tip callout 박스 |
| `Image` | `<img>` | next/image 래퍼 (최적화) |
| `LinkCard` | `<a>` (외부) | OG 카드 미리보기 (선택적) |

### 4.5 공통 UI (shadcn/ui 기반)

| 컴포넌트 | 레퍼런스 | 사용처 |
|---|---|---|
| `Button` | shadcn Button | CTA, 복사, 필터 |
| `Badge` | shadcn Badge | 태그, 기술 스택 |
| `Card` | shadcn Card | PostCard, ProjectCard |
| `Sheet` | shadcn Sheet | 모바일 네비게이션 |
| `Separator` | shadcn Separator | `<hr>`, 섹션 구분 |
| `Skeleton` | shadcn Skeleton | 로딩 상태 |
| `ThemeToggle` | shadcn Button | 다크/라이트 토글 |

---

## 5. 페이지별 와이어프레임

### 5.1 홈 페이지 (`/`)

```
┌──────────────────────────── Header ─────────────────────────────┐

╔══════════════════════════ Hero Section ══════════════════════════╗
║                                                                  ║
║   안녕하세요, 저는 주찬황입니다.                                  ║
║   프론트엔드 개발자 — 읽기 쉬운 코드와 빠른 UI를 만듭니다.       ║
║                                                                  ║
║   [블로그 읽기 →]   [프로젝트 보기 →]                            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  최근 글                                          전체 글 보기 →

  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────┐
  │ 제목 제목 제목    │  │ 제목 제목 제목    │  │ 제목 제목    │
  │ 요약 요약 요약    │  │ 요약 요약 요약    │  │ 요약 요약    │
  │ 요약 두 번째 줄   │  │ 요약 두 번째 줄   │  │ 요약 두번째  │
  │ [React] [TS]      │  │ [Next.js]         │  │ [CSS]        │
  │ 2026.04.01 · 5분  │  │ 2026.03.20 · 8분  │  │ 2026.03.10   │
  └───────────────────┘  └───────────────────┘  └───────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  추천 프로젝트                                모든 프로젝트 →

  ┌─────────────────────────┐  ┌─────────────────────────┐
  │ [썸네일 이미지]          │  │ [썸네일 이미지]          │
  │ 프로젝트명               │  │ 프로젝트명               │
  │ 한 줄 설명               │  │ 한 줄 설명               │
  │ [React] [Next] [TS]     │  │ [Node] [PG] [Docker]    │
  │ [Demo ↗]  [GitHub ↗]    │  │ [Demo ↗]  [GitHub ↗]    │
  └─────────────────────────┘  └─────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────────────────── Footer ─────────────────────────────┐
```

---

### 5.2 블로그 목록 (`/blog`)

```
┌──────────────────────────── Header ─────────────────────────────┐

  블로그
  ─────────────────────

  [전체] [React] [TypeScript] [Next.js] [CSS] [기타]
  ← 태그 필터 (멀티 선택)

  🔍 [검색창 — Fuse.js]

  ─────────────────────────────────────────────────────────────────

  ┌─────────────────────────────────────────────────────────────┐
  │ ## 포스트 제목이 여기 들어갑니다                             │
  │ 요약 텍스트 2줄 정도... 내용 미리보기                       │
  │ [React] [Hooks]                  2026.04.01 · 7분 읽기     │
  └─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────┐
  │ ## 두 번째 포스트 제목                                      │
  │ 요약 텍스트...                                              │
  │ [TypeScript]                     2026.03.20 · 5분 읽기     │
  └─────────────────────────────────────────────────────────────┘
  ...

  ← 1  2  3 ... →    ← 페이지네이션 (10개/페이지)

┌──────────────────────────── Footer ─────────────────────────────┐
```

---

### 5.3 블로그 포스트 상세 (`/blog/[slug]`) — velog 레퍼런스

```
┌──────────────────────────── Header ─────────────────────────────┐
│████████████░░░░░░░░░░ ← reading-progress-bar (2px, primary)    │

  ← max-w-3xl (768px) centered ──────────────────────────────────

    [React] [Hooks] [Frontend]      ← TagBadge

    # 포스트 제목 (2.5rem / weight 800)

    2026.04.01  ·  10분 읽기

  ────────────────────────────────────────────────────────────────

    [표지 이미지 — optional, full width]

  ────────────────────────────────────────────────────────────────

  ┌─── 본문 (max-w: 768px) ──────────────────┐ ┌─ TOC (sticky) ─┐
  │                                          │ │                │
  │  ## H2 섹션 제목                         │ │ 목차           │
  │  (border-bottom 포함)                    │ │ ──────────     │
  │                                          │ │ H2 섹션 1      │
  │  본문 텍스트 (17px / line-h 1.8)         │ │ ▶ H2 섹션 2  ← │ active
  │  Lorem ipsum dolor sit amet,            │ │   H3 서브 1    │
  │  consectetur adipiscing elit.            │ │   H3 서브 2    │
  │                                          │ │ H2 섹션 3      │
  │  ### H3 소제목                           │ │                │
  │                                          │ └────────────────┘
  │  ┌─ javascript ──────────── [복사] ─┐   │   (xl: 우측 고정)
  │  │ const foo = "bar";               │   │   (lg 이하: 숨김)
  │  │ console.log(foo);                │   │
  │  └──────────────────────────────────┘   │
  │                                          │
  │  > 인용구 텍스트                         │
  │                                          │
  │  - 목록 항목 1                           │
  │  - 목록 항목 2                           │
  │                                          │
  └──────────────────────────────────────────┘

  ────────────────────────────────────────────────────────────────

  ┌──────────────────────── 시리즈 박스 (optional) ─────────────┐
  │  📚 이 글은 "시리즈명" 시리즈의 2/5 편입니다               │
  │  [1편] [2편 ●] [3편] [4편] [5편]                          │
  └─────────────────────────────────────────────────────────────┘

  ────────────────────────────────────────────────────────────────

  ┌── 관련 포스트 (같은 태그) ──────────────────────────────────┐
  │  [React] 태그의 다른 글                                    │
  │  · 관련 포스트 제목 1               2026.03.15             │
  │  · 관련 포스트 제목 2               2026.02.20             │
  └─────────────────────────────────────────────────────────────┘

  ┌── 이전/다음 ────────────────────────────────────────────────┐
  │  ← 이전 글 제목                    다음 글 제목 →          │
  └─────────────────────────────────────────────────────────────┘

  ┌── Giscus 댓글 ──────────────────────────────────────────────┐
  │  [GitHub Discussions 댓글 영역]                             │
  └─────────────────────────────────────────────────────────────┘

┌──────────────────────────── Footer ─────────────────────────────┐
```

**모바일 TOC**: `xl` 미만에서 포스트 상단 아래 accordion으로 노출

```
  [≡ 목차 열기 ▼]
  ┌─────────────────┐
  │ H2 섹션 1       │
  │ H2 섹션 2       │
  │   H3 서브 1     │
  └─────────────────┘
```

---

### 5.4 태그별 목록 (`/blog/tags/[tag]`)

```
┌──────────────────────────── Header ─────────────────────────────┐

  #React 태그의 글   (N개)
  ─────────────────────

  [← 전체 태그 목록]

  (PostCard 목록 — /blog와 동일 형식)

┌──────────────────────────── Footer ─────────────────────────────┐
```

---

### 5.5 프로젝트 쇼케이스 (`/projects`)

```
┌──────────────────────────── Header ─────────────────────────────┐

  프로젝트
  ─────────────────────
  [전체] [개인] [팀] [오픈소스]

  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────┐
  │ [썸네일]          │  │ [썸네일]          │  │ [썸네일]      │
  │ 프로젝트명        │  │ 프로젝트명        │  │ 프로젝트명    │
  │ 설명 2~3줄       │  │ 설명 2~3줄       │  │ 설명 2~3줄   │
  │ [TS] [React]     │  │ [Go] [PG]        │  │ [Next] [PW]  │
  │ [Demo] [GitHub]  │  │ [Demo] [GitHub]  │  │ [GitHub]     │
  └───────────────────┘  └───────────────────┘  └───────────────┘

┌──────────────────────────── Footer ─────────────────────────────┐
```

---

### 5.6 About (`/about`)

```
┌──────────────────────────── Header ─────────────────────────────┐

  ← max-w-3xl centered ──────────────────────────────────────────

  ┌──────────┐   주찬황
  │ [프로필] │   Frontend Engineer
  │  이미지  │   [GitHub] [LinkedIn] [이메일] [이력서 PDF ↓]
  └──────────┘

  ────────────────────────────────────────────────────────────────

  ## 소개
  짧고 인간적인 자기소개 3~5줄.
  기술 나열 X — 사람으로서의 이야기.

  ────────────────────────────────────────────────────────────────

  ## 기술 스택

  **Frontend**       [React] [Next.js] [TypeScript] [CSS]
  **Backend**        [Node.js] [PostgreSQL] [NestJS]
  **DevOps / Tools** [Docker] [Vercel] [GitHub Actions] [Figma]

  ────────────────────────────────────────────────────────────────

  ## 경력

  2024.03 ~ 현재
  ○ ── 회사명 · 직책
        · 주요 성과 1 (숫자/임팩트 포함)
        · 주요 성과 2

  2022.01 ~ 2024.02
  ○ ── 회사명 · 직책
        · 주요 성과

┌──────────────────────────── Footer ─────────────────────────────┐
```

---

## 6. 블로그 포스트 상세 — 세부 컴포넌트 스펙

> PRD 명세 + velog 실측 기반

### 6.1 코드 블록 (`CodeBlock`)

```
┌─ language ──────────────────────────── [복사 아이콘] ─┐
│                                                       │
│  const example = "Shiki syntax highlighted";          │
│  console.log(example);  // line 2                     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

| 속성 | 라이트 | 다크 | 비고 |
|---|---|---|---|
| 배경 | `#F2F2F2` | `#1E1E1E` (velog 실측) | `background-subtle` |
| 폰트 | JetBrains Mono, 14px | ← 동일 | |
| padding | 16px 20px | ← 동일 | |
| border-radius | 8px | ← 동일 | |
| border | `1px solid border` | `1px solid border` | |
| 신택스 테마 | `github-light` | `github-dark` | Shiki dual theme |
| 언어 레이블 | 좌상단, `muted-foreground` | ← | `text-xs font-mono` |
| 복사 버튼 | 우상단, hover 시 표시 | ← | 복사 후 2초간 체크 아이콘 |
| 라인 번호 | 10줄 이상 시 표시 | ← | `text-muted-foreground` |

### 6.2 인라인 코드

```css
code:not(pre > code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  background: var(--inline-code-bg);
  border: 1px solid var(--border);
}
```

### 6.3 TOC (Table of Contents)

**데스크톱 (xl+)**:
- 우측 고정 (`sticky top-20`), 포스트 상단과 함께 등장
- 너비: 220px
- H2/H3 두 레벨 표시
- 활성 항목: `--link` 컬러 + `font-medium`
- 비활성: `--muted-foreground`
- H3는 left-padding 12px 들여쓰기

**모바일 (xl 미만)**:
- 포스트 본문 시작 전 accordion
- 기본: 닫힘 상태
- 펼침 시 전체 목차 표시

### 6.4 읽기 진행 바 (`ReadingProgressBar`)

```css
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--foreground);
  z-index: 100;
  transition: width 0.1s linear;
}
```

### 6.5 포스트 헤더 레이아웃 순서

```
1. 태그 뱃지 (TagBadge × N)
2. 제목 (H1, 2.5rem/800)
3. 메타 (날짜 · 읽기 시간)
4. <hr />
5. [표지 이미지 — thumbnail이 있는 경우]
6. <hr />
7. 본문 시작
```

---

## 7. 인터랙션 & 모션

### 7.1 원칙

- **Duration 기준**: hover 150ms / 모달 200ms / 페이지 전환 300ms
- **Easing**: 나타남 `ease-out`, 사라짐 `ease-in`
- **prefers-reduced-motion**: 모든 애니메이션 비활성화 대응

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.2 컴포넌트별 인터랙션 스펙

| 요소 | 트리거 | 효과 | 스펙 |
|---|---|---|---|
| `PostCard` | hover | 배경 미묘하게 밝아짐 | `bg-muted/50`, 150ms ease-out |
| `ProjectCard` | hover | `translateY(-2px)` + shadow 강화 | 150ms ease-out |
| 링크 | hover | underline 진해짐 | `decoration-thickness` 1→2px, 150ms |
| `ThemeToggle` | click | 아이콘 fade 교체 | 200ms |
| `ReadingProgressBar` | scroll | width 증가 | 100ms linear |
| `TOC` 항목 | scroll | 활성 항목 color 변경 | 150ms |
| 코드 복사 버튼 | hover | opacity 0→1 | 150ms; click 시 체크 아이콘 2초 |
| `TagFilter` | click | 활성 tab underline | 200ms |
| 모바일 `Sheet` | click | 우측에서 slide-in | 300ms ease-out |

---

## 8. 접근성 (a11y)

| 항목 | 기준 |
|---|---|
| 색상 대비 | WCAG AA (4.5:1 본문, 3:1 대형 텍스트) |
| 키보드 탐색 | 모든 인터랙티브 요소 Tab 접근 가능 |
| Focus 가시성 | `focus-visible:outline-2 outline-ring` |
| 스크린 리더 | `<article>`, `<nav>`, `<main>`, `<aside>`, `<time>` 시맨틱 HTML |
| 이미지 | 모든 `<img>` alt 속성 필수 (장식용은 `alt=""`) |
| 색상 단독 정보 전달 | 금지 (아이콘/텍스트 병행) |
| 터치 타겟 | 최소 44×44px (모바일) |
| 애니메이션 | `prefers-reduced-motion` 대응 |

---

## 9. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|---|---|---|
| 2026-04-01 | 초안 작성 (PRD + velog 실측 기반) | PD |
