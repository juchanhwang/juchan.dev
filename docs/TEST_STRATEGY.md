# 테스트 전략 — juchan.dev

> **Author**: QA | **Status**: Draft | **Last Updated**: 2026-04-02
> **Based on**: [PRD.md](./PRD.md), [DESIGN_SPEC.md](./DESIGN_SPEC.md)

---

## 1. 개요 & 철학

juchan.dev는 **정적 생성 기반의 퍼스널 브랜딩 사이트**다. 서버 연산이 없고 CDN에서 제공되므로 핵심 리스크는 다음에 집중된다.

| 리스크 영역 | 이유 |
|---|---|
| MDX 렌더링 품질 | 콘텐츠가 깨지면 방문자 경험 전체 붕괴 |
| 다크/라이트 모드 | FOUC(Flash of Unstyled Content), 토글 상태 유지 |
| SEO·메타데이터 | Lighthouse 100 목표, 구직 채용 담당자가 첫 접점 |
| 접근성(a11y) | DESIGN_SPEC 원칙 4: 처음부터 WCAG AA 이상 |
| 반응형 레이아웃 | ToC·floating 버튼 모바일 전환 |

**모델**: Kent C. Dodds의 **테스트 트로피** 적용. Next.js 웹 앱은 Integration 테스트가 ROI 최대.

```
        🏆
       /  \        E2E — 핵심 사용자 플로우만 (5% 미만)
      /----\
     /      \      Integration — 컴포넌트·페이지 렌더링 (65%)
    /--------\
   /          \    Unit — 순수 유틸 함수 (25%)
  /  Static    \   Static — TypeScript + ESLint (기반)
 /______________\
```

---

## 2. 테스트 도구 선정

| 도구 | 역할 | 선정 이유 |
|---|---|---|
| **Vitest** | Unit + Integration 테스트 러너 | Next.js 16 공식 권장, Turbopack 환경과 통합 우수 |
| **@testing-library/react** | 컴포넌트 렌더링·인터랙션 | 구현 세부사항이 아닌 사용자 행동 기준 검증 |
| **@testing-library/user-event** | 실제 사용자 이벤트 시뮬레이션 | fireEvent 대비 실제 브라우저 이벤트 체인 재현 |
| **Playwright** | E2E 테스트 | Chromium/Firefox/WebKit 멀티 브라우저, 접근성 검사 내장 |
| **axe-core + @axe-core/playwright** | 접근성 자동 검사 | WCAG 2.1 AA 기준 자동화 |
| **TypeScript** | 정적 분석 | 컴파일 타임 타입 오류 → 런타임 버그 사전 차단 |
| **ESLint + eslint-plugin-jsx-a11y** | 정적 분석 | a11y 규칙 lint 단계 적용 |

### 설치 명령어

```bash
# Unit/Integration
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom

# E2E
pnpm add -D @playwright/test @axe-core/playwright

# Lint
pnpm add -D eslint-plugin-jsx-a11y
```

---

## 3. 테스트 범위 정의

### 3-1. In Scope

| 레이어 | 대상 |
|---|---|
| **Unit** | 유틸 함수 (`readingTime`, `extractToc`, slug 생성, 날짜 포맷터, Fuse.js 검색 래퍼) |
| **Integration** | 컴포넌트 (`PostCard`, `TableOfContents`, `FloatingActions`, `PostDetail`, `BlogList`), 페이지 렌더링 (MSW 없이 정적 데이터 기반) |
| **E2E** | 블로그 목록 → 포스트 진입, 다크/라이트 모드 토글, ToC 클릭 스크롤, 이전/다음 포스트 내비게이션 |
| **접근성** | 모든 페이지 axe 자동 검사 + 키보드 내비게이션 |
| **시각적 회귀** | Wave 2+ 이후 Chromatic 도입 검토 (현재 스냅샷 테스트로 대체) |

### 3-2. Out of Scope

| 제외 항목 | 이유 |
|---|---|
| Giscus 댓글 컴포넌트 내부 | 외부 서비스, iframe 기반 — 연동 여부만 검증 |
| Vercel 빌드/배포 파이프라인 | Vercel 자체 인프라 책임 |
| MDX 파일 콘텐츠 정확성 | 콘텐츠 편집 영역, 렌더링 품질만 테스트 |
| Velite 내부 로직 | 외부 라이브러리 |
| 서드파티 분석(Vercel Analytics) | 제어 불가 외부 스크립트 |

---

## 4. 리스크 기반 우선순위

| 기능 | 임팩트 | 변경 빈도 | 복잡도 | **우선순위** |
|---|---|---|---|---|
| MDX 렌더링 (코드 블록 + Shiki) | 최상 | 중 | 높음 | **P0** |
| 다크/라이트 모드 (FOUC 방지) | 최상 | 낮음 | 중 | **P0** |
| 블로그 목록 렌더링 + 페이지네이션 | 높음 | 중 | 중 | **P1** |
| ToC 자동 추출 + 스크롤 하이라이트 | 높음 | 낮음 | 높음 | **P1** |
| 읽기 시간 계산 | 중 | 낮음 | 낮음 | **P2** |
| 이전/다음 포스트 내비게이션 | 중 | 낮음 | 낮음 | **P2** |
| OG Image 생성 (`/api/og`) | 중 | 낮음 | 낮음 | **P2** |
| Fuse.js 퍼지 검색 | 중 | 낮음 | 중 | **P2** |
| RSS Feed / sitemap.xml | 낮음 | 낮음 | 낮음 | **P3** |
| Floating 버튼 (좋아요 로컬 상태) | 낮음 | 낮음 | 낮음 | **P3** |
| 접근성 (axe WCAG AA) | 높음 | 높음 | 낮음 | **P1** |

---

## 5. 페이지별 테스트 케이스

### 5-1. 블로그 목록 (`/blog`)

**Integration 테스트**

| ID | 시나리오 | 타입 | 우선순위 |
|---|---|---|---|
| BL-01 | 포스트 목록이 날짜 역순으로 렌더링된다 | Integration | P1 |
| BL-02 | 각 PostCard에 제목·날짜·요약·태그·읽기시간이 표시된다 | Integration | P1 |
| BL-03 | draft: true 포스트는 목록에 포함되지 않는다 | Integration | P1 |
| BL-04 | 포스트가 없을 때 빈 상태 UI가 렌더링된다 | Integration | P2 |
| BL-05 | 페이지네이션: 11번째 포스트부터 2페이지로 이동된다 | Integration | P2 |
| BL-06 | 태그 필터 클릭 시 해당 태그를 가진 포스트만 표시된다 | Integration | P2 |
| BL-07 | Fuse.js 검색: 제목 키워드로 포스트 필터링된다 | Integration | P2 |
| BL-08 | Fuse.js 검색: 결과 없을 때 "검색 결과가 없습니다" 표시 | Integration | P2 |

**E2E 테스트**

| ID | 시나리오 | 브라우저 |
|---|---|---|
| BL-E01 | 목록 → 포스트 클릭 → 상세 페이지 진입 성공 | Chromium |
| BL-E02 | 접근성: axe-core WCAG AA 위반 0건 | Chromium |

---

### 5-2. 포스트 상세 (`/blog/[slug]`)

**Unit 테스트**

| ID | 시나리오 | 함수 |
|---|---|---|
| PD-U01 | `readingTime(200 단어)` → "1 min read" | `readingTime` |
| PD-U02 | `readingTime(0 단어)` → "1 min read" (최솟값) | `readingTime` |
| PD-U03 | `extractToc(mdx)` → H2/H3만 추출, H1 제외 | `extractToc` |
| PD-U04 | `extractToc(빈 문자열)` → 빈 배열 | `extractToc` |
| PD-U05 | `formatDate("2026-04-01")` → "2026년 4월 1일" | `formatDate` |

**Integration 테스트**

| ID | 시나리오 | 타입 | 우선순위 |
|---|---|---|---|
| PD-I01 | MDX 본문이 HTML로 정확히 렌더링된다 | Integration | P0 |
| PD-I02 | 코드 블록에 언어 레이블과 복사 버튼이 표시된다 | Integration | P0 |
| PD-I03 | 포스트 제목·날짜·태그 배지가 렌더링된다 | Integration | P1 |
| PD-I04 | TableOfContents: H2/H3 항목이 올바르게 추출된다 | Integration | P1 |
| PD-I05 | TableOfContents: ToC가 없는 포스트면 사이드바 렌더링 안 됨 | Integration | P2 |
| PD-I06 | FloatingActions: 좋아요 버튼 클릭 시 카운트 증가 (로컬 상태) | Integration | P3 |
| PD-I07 | 이전/다음 포스트 링크가 렌더링된다 (첫 포스트면 이전 없음) | Integration | P2 |
| PD-I08 | Giscus 컨테이너 요소가 DOM에 마운트된다 | Integration | P2 |
| PD-I09 | 존재하지 않는 slug 접근 시 404 렌더링 | Integration | P1 |
| PD-I10 | 썸네일 없는 포스트에서 이미지 요소 렌더링 안 됨 | Integration | P2 |

**E2E 테스트**

| ID | 시나리오 | 우선순위 |
|---|---|---|
| PD-E01 | ToC 항목 클릭 → 해당 섹션으로 스크롤 이동 | P1 |
| PD-E02 | 스크롤 시 ToC 현재 섹션 항목이 하이라이트된다 | P1 |
| PD-E03 | 접근성: axe WCAG AA 위반 0건 | P1 |
| PD-E04 | 키보드만으로 ToC 내비게이션 가능하다 | P1 |

---

### 5-3. 다크/라이트 모드 (공통)

| ID | 시나리오 | 타입 | 우선순위 |
|---|---|---|---|
| DM-01 | 초기 로드 시 `prefers-color-scheme: dark` → 다크 모드 적용 | E2E | P0 |
| DM-02 | 토글 클릭 시 라이트 ↔ 다크 전환 | E2E | P0 |
| DM-03 | 페이지 새로고침 후 선택한 모드가 유지된다 (localStorage) | E2E | P0 |
| DM-04 | 다크 모드에서 FOUC(깜박임) 없이 렌더링된다 | E2E | P0 |
| DM-05 | 다크/라이트 양 모드에서 접근성 대비비 WCAG AA 충족 | E2E | P0 |

---

### 5-4. 홈 (`/`) — Wave 3 대상, 현재 기본 검증

| ID | 시나리오 | 타입 |
|---|---|---|
| HM-01 | Hero 섹션, 최근 포스트 3개, 추천 프로젝트 3개 렌더링 | Integration |
| HM-02 | 접근성: axe WCAG AA 위반 0건 | E2E |

---

### 5-5. 공통 레이아웃

| ID | 시나리오 | 타입 | 우선순위 |
|---|---|---|---|
| LY-01 | Header에 네비게이션이 단 하나만 렌더링된다 (중복 없음) | Integration | P1 |
| LY-02 | 반응형: 768px 미만에서 ToC가 숨김 처리된다 | E2E | P1 |
| LY-03 | 반응형: 모바일에서 FloatingActions가 하단으로 이동 또는 숨김 | E2E | P2 |
| LY-04 | 포스트 콘텐츠 너비가 max-width: 768px 제한된다 | Integration | P2 |

---

## 6. 품질 기준 (Exit Criteria)

### 6-1. 테스트 커버리지 목표

| 대상 | Lines | Branches | Functions |
|---|---|---|---|
| `lib/` 유틸 함수 | **90%** | **85%** | **90%** |
| `components/blog/` | **75%** | **70%** | **75%** |
| `app/` 페이지 | **70%** | **65%** | **70%** |
| 전체 평균 | **80%** | **75%** | **80%** |

> **Branch coverage 우선**: `if/else`, early return, optional chaining 분기가 런타임 버그의 주요 원인.

### 6-2. Lighthouse 목표 (PRD 성공 지표)

| 항목 | 목표 | 측정 방법 |
|---|---|---|
| Performance | **90+** | CI에서 Lighthouse CI (`lhci`) 실행 |
| SEO | **100** | 동일 |
| Accessibility | **100** | Lighthouse + axe-core |
| LCP | **< 2.5s** | Lighthouse |

### 6-3. 릴리스 차단 기준 (Blocking)

아래 중 하나라도 미충족 시 머지 차단:

- [ ] P0 테스트 전원 통과
- [ ] TypeScript 컴파일 오류 0건
- [ ] ESLint 오류 0건 (warning은 허용)
- [ ] 접근성 axe WCAG AA 위반 0건
- [ ] 전체 커버리지 80% 이상 (branches 75%)

---

## 7. vitest.config.ts 설정 (권장)

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.config.*',
        'src/types/**',
        'src/test/**',
        'src/app/**/layout.tsx',   // 레이아웃 보일러플레이트 제외
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// apps/web/src/test/setup.ts
import '@testing-library/jest-dom';
```

---

## 8. Playwright 설정 (권장)

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['github']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // 모바일 반응형 검증
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 9. CI 연동 방안

### 9-1. GitHub Actions 워크플로우 구조

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile

      # 1. 정적 분석 (가장 빠름, 먼저 실행)
      - name: Type Check
        run: pnpm --filter web tsc --noEmit

      - name: Lint
        run: pnpm --filter web lint

      # 2. Unit + Integration 테스트
      - name: Vitest
        run: pnpm --filter web test --coverage

      # 3. 커버리지 리포트 PR 코멘트 첨부
      - name: Upload Coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: apps/web/coverage/

  e2e:
    runs-on: ubuntu-latest
    needs: quality          # 정적 분석 + 유닛 통과 후 실행
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter web build

      - name: Install Playwright Browsers
        run: pnpm --filter web exec playwright install --with-deps chromium firefox

      - name: E2E Tests
        run: pnpm --filter web exec playwright test

      - name: Upload Playwright Report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/web/playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter web build

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/blog
          budgetPath: ./lighthouserc.json
          uploadArtifacts: true
```

### 9-2. PR 체크 순서 (파이프라인)

```
push/PR → TypeCheck → Lint → Vitest(coverage) → [E2E + Lighthouse] → Merge 허용
                                ↑                      ↑
                          병렬 실행 가능           quality job 통과 후
```

### 9-3. `package.json` scripts 추가

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 10. Wave별 테스트 로드맵

| Wave | 테스트 목표 | 완료 기준 |
|---|---|---|
| **Wave 1** (현재) | P0/P1 Unit + Integration 완비, E2E 블로그 핵심 플로우, 다크모드 E2E | 커버리지 80%+, P0 전원 통과, axe AA |
| **Wave 2** | 태그 필터·검색·Giscus·OG Image 테스트 추가 | P2 케이스 전원 자동화 |
| **Wave 3** | 홈·프로젝트·About 페이지 테스트 추가 | 전체 페이지 axe AA |
| **Wave 4** | Lighthouse CI 연동, 마이그레이션 slug 검증 (`julog` 기존 URL 301) | Lighthouse Performance 90+, SEO 100 |

---

## 11. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|---|---|---|
| 2026-04-02 | 초안 작성. PRD Wave 1 기준 테스트 전략 수립 | QA |
