# PRD: juchan.dev — 기술 블로그 + 포트폴리오 통합 웹앱

> **Author**: PO | **Status**: Draft | **Last Updated**: 2026-04-01
> **Reviewers**: PD (디자인 스펙), FE (구현), QA (검증)

---

## 1. 배경 & 문제

### 현재 상황

| 프로젝트 | 스택 | 문제 |
|---|---|---|
| `julog` | Gatsby 2.x + React 16 (gatsby-starter-bee) | Gatsby 2 EOL — 보안패치 없음, 빌드 불안정 |
| `my-blog-starter` | Gatsby 2.x + React 16 | 동일 |
| `juchanhwang` | React 18 + Vite (CSR only) | SSG 없음 → SEO 취약, Google 크롤링 불리 |

- 블로그와 포트폴리오가 분리된 두 프로젝트 → 유지비 2배, 브랜딩 일관성 없음
- Gatsby 2.x 플러그인 생태계 지원 종료 → 의존성 업데이트 불가

### 기회

최신 스택 단일 사이트로 신규 구축 시:
- SEO 개선 → 검색 유입 증가
- 유지보수 비용 절반 이하
- 커리어 브랜딩 도구로 직접 활용

---

## 2. 제품 비전

**개발자 주찬황의 기술력과 사고를 보여주는 퍼스널 브랜딩 플랫폼.**

방문자(채용 담당자, 동료 개발자)가 깔끔하고 빠른 인터페이스로 기술 글쓰기와 프로젝트 경험을 접하고, "이 개발자 실력 있다"는 인상을 받게 한다.

---

## 3. 목표 & 비목표

### Goals

1. 블로그 + 포트폴리오를 **단일 Next.js 사이트 (`juchan.dev`)** 로 통합 구축
2. Google Lighthouse **Performance 90+, SEO 100** 달성
3. 기존 `julog` 블로그 포스트 **콘텐츠 마이그레이션** 완료

### Non-Goals

- CMS 관리자 UI (Admin 페이지) — 로컬 MDX 파일로 관리
- 다중 사용자/팀 블로그 기능
- 댓글 직접 구현 (Giscus 외부 서비스 사용)
- 유료 구독/멤버십
- i18n 다국어 지원 (한국어 단일)
- 서버사이드 데이터베이스 (정적 빌드 only)

---

## 4. 타겟 사용자

**Primary: 채용 담당자 / 협업 제안자**
- JTBD: "이 개발자가 어떤 사람인지 5분 내에 판단하고 싶다"
- 핵심 페이지: 홈, About, 프로젝트 쇼케이스

**Secondary: 기술 커뮤니티 독자 (개발자)**
- JTBD: "검색으로 찾은 기술 글을 읽기 편하게 보고 싶다"
- 핵심 페이지: 블로그 목록, 포스트 상세

**Non-target**: 비개발자, 모바일 퍼스트 콘텐츠 소비자

---

## 5. 페이지 구조 (사이트맵)

```
/                       홈 — Hero + 최근 포스트 + 추천 프로젝트
/blog                   블로그 목록 — 전체 포스트, 태그 필터
/blog/[slug]            포스트 상세 (velog 레이아웃 레퍼런스)
/blog/tags/[tag]        태그별 포스트 목록
/projects               프로젝트 쇼케이스
/about                  소개 + 경력 타임라인
```

---

## 6. 핵심 기능 명세

### 6-1. 블로그 포스트 상세 (`/blog/[slug]`) — velog 레이아웃 레퍼런스

velog.io 포스트 상세 페이지를 직접 확인하여 아래 레이아웃을 도출하였다.

**레이아웃 구조 (velog 레퍼런스, 목업 피드백 반영):**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Header (로고 + 네비게이션 단일 구성 + 다크모드 토글)                  │
│  ※ 헤더 내 네비게이션은 하나만 유지 — 중복 네비게이션 없음             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│         [포스트 제목 — bold, large]                                  │
│         [작성자 · 날짜]                                              │
│         [태그 배지들 — pill, green border]                           │
│         [썸네일 이미지 (옵션)]                                       │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│                                                                      │
│           ┌──────────────────────────────┐   ┌─────────────────┐    │
│  [♥]      │  본문 콘텐츠                  │   │  ToC (플로팅)   │    │
│  [공유]   │  max-width: 768px            │   │  콘텐츠 바깥    │    │
│           │  · 코드 블록                 │   │  우측 고정      │    │
│           │  · 이미지                    │   │  1. H2 섹션     │    │
│           │  · 인용구                    │   │  1.1 H3 섹션    │    │
│           │  · H2/H3 섹션               │   │  2. H2 섹션     │    │
│           └──────────────────────────────┘   └─────────────────┘    │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│         [이전 포스트] ←→ [다음 포스트]                               │
│         [관련 포스트 (같은 태그, 3개)]                               │
│         [Giscus 댓글]                                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**velog에서 직접 확인한 디자인 특징 (목업 피드백 반영):**
- 제목: 매우 bold, large sans-serif (한글 + 영문 혼용)
- 왼쪽 floating: 좋아요(하트) + 공유 버튼 — 둥근 버튼, 스크롤 시 따라옴
- 우측 ToC: **콘텐츠 영역 바깥 우측 플로팅** (position: sticky, top: 100px) — 번호 목차, 현재 섹션 하이라이트
- 태그: `green/teal` 컬러 pill 형태 (`#20c997` 계열)
- 다크 배경: 거의 검은색 (`#1a1a1a` 계열)
- 콘텐츠 너비: **max-width 768px** 중앙 정렬 (전체 페이지는 넓게 활용)
- 코드 블록: 어두운 배경, 파일명 표시, 모노스페이스 폰트
- **헤더 네비게이션**: 최상단 단일 헤더 네비게이션만 존재 — 페이지 내 중복 네비게이션 없음

**Acceptance Criteria:**
- [ ] MDX 파일 기반 렌더링 (Velite 사용)
- [ ] 코드 블록: Shiki 문법 하이라이팅 + 언어/파일명 표시 + 복사 버튼
- [ ] **콘텐츠 영역**: max-width 768px 중앙 정렬, 전체 페이지 너비는 넓게 활용
- [ ] **ToC**: H2/H3 자동 추출, **콘텐츠 영역 바깥 우측에 플로팅** (position: sticky), 스크롤 위치에 따라 활성 항목 하이라이트, lg 이상 화면에서만 표시
- [ ] **헤더 네비게이션**: 전역 단일 헤더 nav만 존재, 포스트 내부 중복 네비게이션 없음
- [ ] 왼쪽 floating: 좋아요(로컬 상태) + 공유 버튼
- [ ] 읽기 시간: 200 wpm 기준 자동 계산
- [ ] OG Image: 포스트 제목 기반 자동 생성 (`/api/og`)
- [ ] 이전/다음 포스트 네비게이션
- [ ] 관련 포스트: 동일 태그 기준 최대 3개
- [ ] Giscus 댓글 컴포넌트

### 6-2. 블로그 목록 (`/blog`)

- [ ] 포스트 카드: 제목, 날짜, 요약, 태그, 읽기 시간
- [ ] 태그 필터 — 멀티 선택
- [ ] 검색: Fuse.js 클라이언트 퍼지 검색 (제목 + 태그 + 요약)
- [ ] 페이지네이션 (페이지당 10개)
- [ ] Draft 포스트 빌드 시 제외

#### MDX Frontmatter 스펙

```yaml
---
title: "포스트 제목"
date: "2026-04-01"
tags: ["React", "TypeScript"]
series: "시리즈명"        # optional
draft: false
description: "SEO/OG 요약 (160자 이내)"
thumbnail: "/images/thumb.png"  # optional
---
```

### 6-3. 포트폴리오

#### 홈 (`/`)
- Hero: 이름, 직함, 한줄 소개, CTA (블로그 / 프로젝트)
- 최근 블로그 포스트 3개
- 추천 프로젝트 3개

#### 프로젝트 쇼케이스 (`/projects`)
- 프로젝트명, 설명, 기술스택 배지, GitHub + 데모 링크, 썸네일

#### About (`/about`)
- Bio (사진 + 소개글)
- 경력 타임라인
- 기술스택 카테고리별 표시
- 이력서 PDF 다운로드 버튼
- 소셜 링크 (GitHub, LinkedIn, 이메일)

### 6-4. 공통

| 기능 | 구현 | 우선순위 |
|---|---|---|
| 다크/라이트 모드 | `next-themes` | P0 |
| 반응형 | Tailwind breakpoints | P0 |
| RSS Feed | `/feed.xml` | P1 |
| sitemap.xml | `next-sitemap` | P1 |
| JSON-LD 구조화 데이터 | Article + Person | P1 |
| OG Image 자동 생성 | Next.js `/api/og` (ImageResponse) | P1 |
| Giscus 댓글 | GitHub Discussions 연동 | P1 |
| Analytics | Vercel Analytics | P2 |

---

## 7. 타이포그래피 & 폰트 (velog 레퍼런스)

velog의 가독성 높은 타이포그래피를 레퍼런스로 하되, Pretendard로 적용한다.

> **현재 `apps/web/src/app/layout.tsx`는 Geist 폰트를 사용 중.**
> PRD 확정 후 Pretendard로 교체 필요.

| 용도 | 폰트 | 이유 |
|---|---|---|
| 한글/영문 본문 + UI | **Pretendard** | 최고 가독성 한글 웹폰트, velog 스타일 |
| 코드 블록 | **JetBrains Mono** | 개발자 표준 모노스페이스 |

**본문 타이포그래피 스펙 (velog 레퍼런스):**

```css
/* 본문 */
font-size: 17px (≥768px) / 15px (< 768px)
line-height: 1.8
letter-spacing: -0.01em
word-break: keep-all   /* 한글 단어 분리 방지 */

/* H1 (포스트 제목) */
font-size: clamp(2rem, 5vw, 3rem)
font-weight: 800

/* H2 */
font-size: 1.75rem
font-weight: 700

/* 인라인 코드 */
font-family: JetBrains Mono
font-size: 0.9em
background: rgba(127,127,127,0.1)
border-radius: 3px
padding: 2px 5px
```

---

## 8. 기술 스택 (확정)

프로젝트 `juchan.dev`는 **이미 아래 스택으로 scaffold 되어 있음.**

| 레이어 | 선택 | 버전 |
|---|---|---|
| 프레임워크 | **Next.js** | 16.2.2 |
| 런타임 | **React** | 19.2.4 |
| 언어 | **TypeScript** | ^5 |
| 스타일 | **Tailwind CSS** | v4 |
| UI 컴포넌트 | **shadcn/ui + @base-ui/react** | 최신 |
| 모노레포 | **Turbo + pnpm workspace** | turbo ^2, pnpm 10.28.1 |
| 패키지 | `@juchan/ui`, `@juchan/tsconfig` | workspace 공유 패키지 |

**추가 설치 필요 패키지:**

```
velite          # MDX 콘텐츠 관리 (type-safe)
shiki           # 코드 하이라이팅
next-themes     # 다크모드
@giscus/react   # 댓글
fuse.js         # 클라이언트 검색
next-sitemap    # sitemap 생성
pretendard      # 한글 폰트
@vercel/og      # OG Image (Next.js 내장)
```

**배포**: Vercel (Next.js 최적화, 무료 티어)

---

## 9. 프로젝트 구조 (제안)

현재 `apps/web/src/` 기준 확장:

```
apps/web/src/
├── app/
│   ├── layout.tsx                # 루트 레이아웃 (Pretendard 폰트)
│   ├── page.tsx                  # 홈
│   ├── blog/
│   │   ├── page.tsx              # 블로그 목록
│   │   ├── [slug]/page.tsx       # 포스트 상세 (velog 레이아웃)
│   │   └── tags/[tag]/page.tsx
│   ├── projects/page.tsx
│   ├── about/page.tsx
│   └── api/og/route.tsx          # OG Image 생성
├── components/
│   ├── blog/
│   │   ├── PostCard.tsx
│   │   ├── PostDetail.tsx        # velog 스타일 포스트 레이아웃
│   │   ├── TableOfContents.tsx   # 우측 고정 ToC
│   │   ├── FloatingActions.tsx   # 좌측 좋아요/공유 버튼
│   │   └── GiscusComments.tsx
│   └── portfolio/
│       ├── ProjectCard.tsx
│       └── CareerTimeline.tsx
├── content/                      # Velite가 처리하는 MDX 파일
│   ├── posts/                    # 블로그 포스트 (.mdx)
│   └── projects/                 # 프로젝트 데이터 (.mdx or .json)
└── lib/
    ├── velite.ts                 # Velite 설정
    └── fonts.ts                  # 폰트 설정
```

---

## 10. MVP 범위 (Wave별)

### Wave 1 — 블로그 핵심 (Must Have)
- [ ] Pretendard 폰트 적용 (Geist 교체)
- [ ] Velite + Shiki 설정
- [ ] 블로그 목록 페이지
- [ ] 포스트 상세 페이지 (velog 레이아웃)
  - 제목/날짜/태그 헤더
  - MDX 본문 렌더링
  - 우측 고정 ToC
  - 왼쪽 floating 버튼
  - 이전/다음 포스트 네비게이션
- [ ] 다크/라이트 모드 (next-themes)
- [ ] 반응형 레이아웃

### Wave 2 — 블로그 완성 (Should Have)
- [ ] 태그 필터 + 태그 페이지
- [ ] Giscus 댓글
- [ ] OG Image 자동 생성
- [ ] Fuse.js 검색
- [ ] RSS Feed + sitemap.xml + JSON-LD

### Wave 3 — 포트폴리오 (Should Have)
- [ ] 홈 페이지 (Hero + 최근 포스트 + 추천 프로젝트)
- [ ] 프로젝트 쇼케이스
- [ ] About (Bio + 경력 + 기술스택 + 이력서)

### Wave 4 — 마이그레이션 & 배포 (Must Have)
- [ ] 기존 `julog` 포스트 MDX 마이그레이션
- [ ] Vercel 배포 설정
- [ ] Google Search Console 등록
- [ ] Lighthouse 성능 검증

---

## 11. 향후 확장 계획 (Could Have / 이후 버전)

| 기능 | 설명 | 우선순위 |
|---|---|---|
| 시리즈 그룹핑 | 연재 포스트 묶어 표시 | P2 |
| 관련 포스트 | 동일 태그 기준 추천 | P2 |
| `/uses` 페이지 | 사용 도구/장비 소개 | P3 |
| Vercel Analytics | 방문자 통계 | P2 |
| 이력서 PDF 다운로드 | About 페이지 연동 | P2 |
| 읽기 진행 바 | 포스트 상단 progress bar | P3 |

---

## 12. 성공 지표

| 지표 | 목표 | 측정 방법 |
|---|---|---|
| Lighthouse Performance | **90+** | Vercel Analytics |
| Lighthouse SEO | **100** | Google Search Console |
| LCP | **< 2.5s** | Lighthouse |
| Google 색인 | 전체 포스트 색인 | GSC Coverage |

---

## 13. 미결 사항

- [ ] 좋아요 수 유지 방법 — 로컬스토리지 only? 또는 외부 서비스?
- [ ] Giscus GitHub repo — 별도 `blog-comments` 저장소 생성 여부?
- [ ] 도메인 — `juchan.dev` 구매/연결 여부 확인 필요
- [ ] 기존 `julog` URL 구조 유지 여부 (301 redirect 설정 필요 시)
- [ ] 이력서 PDF 공개 여부 및 파일 호스팅 위치

---

## 14. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|---|---|---|
| 2026-04-01 | 초안 작성. velog.io 직접 확인 후 레이아웃 반영. juchan.dev 실제 스택(Next.js 16, React 19) 기준으로 작성 | PO |
| 2026-04-02 | 목업 피드백 반영: 1) 헤더 네비게이션 단일화 (중복 제거), 2) 콘텐츠 max-width 660px → 768px, 3) ToC 콘텐츠 바깥 우측 플로팅 (position: sticky) | PO |
