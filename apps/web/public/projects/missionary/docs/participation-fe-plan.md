# FE 구현 플랜: 등록 관리 페이지

| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.1 |
| 작성일 | 2026-03-26 |
| 작성자 | FE |
| 참조 PRD | `./prd.md` (v1.7) |
| 참조 Design Spec | `./design-spec.md` (v1.5) |
| 참조 목업 | `./mockups/v3/` |
| 대상 패키지 | `packages/client/missionary-admin` |

### 변경 이력

| 버전 | 변경 내용 |
|------|----------|
| v1.0 | 초안 — Wave 0~9 구조, API 타입, PR 전략, 디렉토리 구조 |
| v1.1 | pre-planner 갭 분석 14건 반영 — 필터/검색 전략 명확화, `EnrollmentMissionSummary` 타입 추가, Section B `ENROLLMENT_PREPARING` 제외 명시, Form Builder 삭제 정책 확정(Design Spec 기준), 모집 중 0개 빈 상태 절충안, 이름/생년월일 읽기 전용 확정, ProgressBar className 분기, Form Builder 저장 실패 partial commit 처리, CSV 다운로드 로딩/에러 상태, Wave 8 조건부 표기, 체크박스 전체선택 현재 페이지 기준 명시 |

---

## 1. 개요

등록 관리 페이지(`/enrollment`)를 신규 구현한다.

**구현 범위:**
- FR-0: 등록 관리 메인 페이지 (카드 목록 + 통합 테이블)
- FR-1: 등록 현황 요약 카드
- FR-2: 등록자 목록 테이블 (고정 + 커스텀 컬럼)
- FR-3: 납부 여부 빠른 토글
- FR-4: 납부 일괄 승인
- FR-5: 등록자 상세/수정 슬라이드 오버 패널
- FR-6: CSV 다운로드
- FR-7-A: 참석 옵션 관리 (**조건부 — PO Scope 확정 대기**)
- FR-7-B: 커스텀 폼 필드 관리 (Form Builder)
- SidePanel 공통 컴포넌트 추출 + UserEditPanel 마이그레이션

---

## 2. 기술 결정사항

### 2-1. 기존 패턴 준수

| 영역 | 결정 | 근거 |
|------|------|------|
| API 클라이언트 | `apis/` 디렉토리에 도메인별 모듈 (`participation.ts` 등) | 기존 `apis/user.ts`, `apis/missionary.ts` 패턴 |
| 서버 데이터 패칭 | TanStack Query (`useQuery` + `useMutation`) | 기존 패턴. `useSuspenseQuery`는 프로젝트 미사용이므로 `useQuery` + `initialData` 유지 |
| SSR 초기 데이터 | 서버 컴포넌트 -> `initialData` prop 전달 | 기존 `users/page.tsx` 패턴 |
| Query Key | `lib/queryKeys.ts` 확장 | 기존 계층적 키 팩토리 패턴 |
| 폼 관리 | `react-hook-form` + `zod` | 기존 `UserForm`, `MissionForm` 패턴 |
| 모달 | `overlay.openAsync()` + `react-modal` | 기존 패턴 혼용 (새 코드는 `overlay.openAsync` 우선) |
| 토스트 | `sonner` (`toast.success` / `toast.error`) | 기존 글로벌 에러 토스트 + 개별 성공 토스트 |
| 라우팅 | Next.js App Router, `(admin)` route group 내 | 기존 패턴 |
| 컴포넌트 라이브러리 | `@samilhero/design-system` | 기존 패턴 |

### 2-2. 신규 결정

| 영역 | 결정 | 근거 |
|------|------|------|
| 드래그 앤 드롭 | `@dnd-kit/core` + `@dnd-kit/sortable` | 번들 사이즈 작음, React 18 호환, 접근성 내장 |
| 패널 열림 상태 | URL `searchParams` (`participantId`) | 기존 `UserEditPanel`의 `userId` searchParam 패턴 동일 |
| 서버 필터 | URL `searchParams` (`page`, `isPaid`, `attendanceType`) | 뒤로가기/URL 공유 시 필터 상태 보존. 기존 `UsersPageClient` 패턴과 동일 |
| 클라이언트 검색 (이름) | 로컬 `useState` (debounce 300ms) | PRD 명시: 한 차수 최대 수백 명. URL 저장 불필요 (일시적 검색) |
| 메인 페이지 선교명 검색 | 클라이언트 사이드 필터링 (debounce 300ms, 로컬 state) | Section B 데이터 전체 로드 후 프론트 필터링 |
| Form Builder 상태 | 로컬 `useState` (미저장 diff 관리) | 명시적 저장 버튼 패턴, 자동 저장 없음 |
| SidePanel 위치 | `src/components/ui/SidePanel.tsx` (앱 공용) | design-system 후보이나 우선 앱 내 공용 컴포넌트로 추출 |
| ProgressBar 스타일 분기 | `className` props로 컨텍스트별 스타일 전달 | 카드/테이블/요약에서 높이/색상이 다름. 과도한 variant 추상화 금지 |

> **필터 URL 전략 비고**: 기존 `UsersPageClient`는 검색어도 URL searchParams에 포함하지만, 등록 관리에서는 이름 검색을 로컬 state로 관리한다. 근거: (1) 이름 검색은 일시적 탐색 용도이므로 URL 보존 불필요, (2) 서버 필터(isPaid, attendanceType)만 URL에 두면 뒤로가기/공유 시 의미 있는 필터 상태가 보존된다. 서버 필터 변경 시 검색어는 유지된다.

---

## 3. 디렉토리 구조

```text
packages/client/missionary-admin/src/
+-- apis/
|   +-- participation.ts              # [신규] Participation CRUD API + 타입
|   +-- participation.server.ts       # [신규] 서버 컴포넌트용 래퍼
|   +-- enrollment.ts                 # [신규] 메인 페이지 선교 요약 API + EnrollmentMissionSummary 타입
|   +-- enrollment.server.ts          # [신규] 서버 컴포넌트용 래퍼
|   +-- formField.ts                  # [신규] MissionaryFormField CRUD API + 타입
|   +-- attendanceOption.ts           # [신규] MissionaryAttendanceOption CRUD API + 타입
|   +-- missionary.ts                 # [기존 유지] 메인 페이지용 데이터는 enrollment.ts로 분리
|
+-- lib/
|   +-- queryKeys.ts                  # [수정] participations, formFields, attendanceOptions, enrollmentSummary 키 추가
|
+-- components/
|   +-- sidebar/Sidebar.tsx           # [수정] NAV_ITEMS에 "등록 관리" 추가
|   +-- ui/
|       +-- SidePanel.tsx             # [신규] 공통 슬라이드 오버 패널
|
+-- app/(admin)/
|   +-- enrollment/                   # [신규] 등록 관리 메인
|   |   +-- page.tsx                  #   서버 컴포넌트 (SSR initial data)
|   |   +-- loading.tsx               #   스켈레톤 로딩
|   |   +-- _components/
|   |   |   +-- EnrollmentListPage.tsx        # 메인 페이지 클라이언트 컴포넌트
|   |   |   +-- HighlightCardSection.tsx      # Section A: 마감 임박 카드 그리드
|   |   |   +-- MissionEnrollmentCard.tsx     # 개별 선교 카드
|   |   |   +-- MissionEnrollmentTable.tsx    # Section B: 통합 테이블
|   |   |   +-- MissionStatusChips.tsx        # 상태 필터 칩
|   |   +-- _hooks/
|   |       +-- useGetEnrollmentSummary.ts    # 메인 페이지 데이터 훅
|   |
|   +-- enrollment/[missionaryId]/    # [신규] 선교별 등록 관리 상세
|   |   +-- page.tsx                  #   서버 컴포넌트
|   |   +-- loading.tsx               #   스켈레톤 로딩
|   |   +-- _components/
|   |   |   +-- EnrollmentDetailPage.tsx      # 상세 페이지 클라이언트 오케스트레이션
|   |   |   +-- EnrollmentDetailHeader.tsx    # 페이지 헤더 (뒤로가기 + 선교명 + 상태)
|   |   |   +-- EnrollmentSummaryCard.tsx     # FR-1: 등록 현황 요약
|   |   |   +-- SummaryStatItem.tsx           # 요약 카드 내 수치 항목
|   |   |   +-- ProgressBar.tsx               # 달성률 프로그레스 바 (className으로 스타일 분기)
|   |   |   +-- EnrollmentToolbar.tsx         # 도구 모음 (필터 + 검색 + 버튼)
|   |   |   +-- ParticipantTable.tsx          # FR-2: 등록자 테이블
|   |   |   +-- ParticipantRow.tsx            # 테이블 행 (분리)
|   |   |   +-- PaymentBadge.tsx              # FR-3: 납부 토글 배지
|   |   |   +-- BulkApproveModal.tsx          # FR-4: 납부 일괄 승인 모달
|   |   |   +-- panel/
|   |   |   |   +-- ParticipantPanel.tsx      # FR-5: 등록자 상세/수정 패널
|   |   |   |   +-- ParticipantForm.tsx       # 패널 내 폼
|   |   |   |   +-- CustomFieldInput.tsx      # fieldType별 입력 분기
|   |   |   +-- form-builder/
|   |   |       +-- FormBuilderSection.tsx    # FR-7-B: 폼 빌더 섹션 전체
|   |   |       +-- FormBuilderToolbar.tsx    # sticky 툴바 (미저장 + 저장)
|   |   |       +-- FormFieldCard.tsx         # 필드 카드 (미확장/확장/고정)
|   |   |       +-- FormFieldSettings.tsx     # 확장 시 편집 영역
|   |   |       +-- AddFieldButton.tsx        # 점선 추가 카드
|   |   |       +-- AttendanceOptionManager.tsx  # FR-7-A: 참석 옵션 관리 (조건부)
|   |   |       +-- TagInput.tsx              # SELECT 선택지 입력
|   |   +-- _hooks/
|   |   |   +-- useGetParticipations.ts       # 등록자 목록 조회
|   |   |   +-- useGetParticipation.ts        # 등록자 상세 조회
|   |   |   +-- useUpdateParticipation.ts     # 등록자 수정 mutation
|   |   |   +-- useTogglePayment.ts           # 납부 토글 (낙관적 업데이트)
|   |   |   +-- useBulkApprovePayment.ts      # 납부 일괄 승인
|   |   |   +-- useGetFormFields.ts           # 폼 필드 목록 조회
|   |   |   +-- useFormFieldMutations.ts      # 폼 필드 CRUD mutations
|   |   |   +-- useGetAttendanceOptions.ts    # 참석 옵션 목록 조회
|   |   |   +-- useAttendanceOptionMutations.ts  # 참석 옵션 CRUD mutations
|   |   +-- _schemas/
|   |   |   +-- participantSchema.ts          # 등록자 수정 폼 zod 스키마
|   |   |   +-- formFieldSchema.ts            # 폼 필드 추가/수정 zod 스키마
|   |   +-- _utils/
|   |       +-- formatParticipant.ts          # 등록자 데이터 포맷 유틸
|   |       +-- csvDownload.ts                # CSV 다운로드 유틸
|   |
|   +-- users/_components/panel/
|       +-- UserEditPanel.tsx         # [수정] SidePanel 공통 컴포넌트로 교체
```

---

## 4. API 클라이언트 & 타입 정의

### 4-1. `apis/enrollment.ts` (메인 페이지 전용)

```typescript
// === 메인 페이지 선교 요약 타입 ===

interface EnrollmentMissionSummary {
  id: string;
  name: string;
  order: number | null;
  category: 'DOMESTIC' | 'OVERSEAS';
  status: 'ENROLLMENT_PREPARING' | 'ENROLLMENT_OPENED' | 'ENROLLMENT_CLOSED' | 'COMPLETED';
  enrollmentDeadline: string | null;
  missionStartDate: string;
  missionEndDate: string;
  maximumParticipantCount: number | null;
  currentParticipantCount: number;
  paidCount: number;
  managerName: string | null;
}

interface GetEnrollmentSummaryResponse {
  missions: EnrollmentMissionSummary[];
  totalRecruitingCount: number;        // ENROLLMENT_OPENED 상태 선교 수
  totalRecruitingParticipants: number;  // 모집 중 선교 등록자 합계
}

// === API 함수 ===

const enrollmentApi = {
  getEnrollmentSummary(): Promise<GetEnrollmentSummaryResponse>,
};
```

> **BE 확인 필요**: 기존 `GET /missionaries` 확장 vs 신규 엔드포인트(`GET /enrollment/summary`) 결정. 응답에 `currentParticipantCount`, `paidCount` 집계가 포함되어야 함.

### 4-2. `apis/participation.ts`

```typescript
// === 타입 정의 ===

interface AttendanceOption {
  id: string;
  missionaryId: string;
  type: 'FULL' | 'PARTIAL';
  label: string;
  order: number;
}

interface FormFieldDefinition {
  id: string;
  missionaryId: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'DATE';
  label: string;
  placeholder: string | null;
  isRequired: boolean;
  order: number;
  options: string[] | null;
  hasAnswers: boolean;  // 삭제 가능 여부 판단용
}

interface FormAnswer {
  id: string;
  formFieldId: string;
  value: string;
}

interface ParticipationTeam {
  id: string;
  teamName: string;
}

interface Participation {
  id: string;
  name: string;
  birthDate: string;
  applyFee: number | null;
  isPaid: boolean;
  identificationNumber: string | null;
  isOwnCar: boolean;
  missionaryId: string;
  userId: string;
  teamId: string | null;
  team: ParticipationTeam | null;
  createdAt: string;
  // 신규 필드
  affiliation: string;
  attendanceOptionId: string;
  attendanceOption: AttendanceOption;
  cohort: number;
  hasPastParticipation: boolean | null;
  isCollegeStudent: boolean | null;
  // 커스텀 필드 답변
  formAnswers: FormAnswer[];
}

interface GetParticipationsParams {
  missionaryId: string;
  page?: number;
  pageSize?: number;
  isPaid?: boolean;               // 서버 필터 (URL searchParams)
  attendanceType?: 'FULL' | 'PARTIAL';  // 서버 필터 (URL searchParams)
  // query(이름 검색)는 클라이언트 사이드이므로 API 파라미터에 포함하지 않음
}

interface PaginatedParticipationsResponse {
  items: Participation[];
  total: number;
  page: number;
  pageSize: number;
}

interface UpdateParticipationPayload {
  // 이름, 생년월일은 읽기 전용이므로 수정 payload에서 제외 (PO 확인 필요 — Design Spec 기준)
  affiliation?: string;
  attendanceOptionId?: string;
  cohort?: number;
  hasPastParticipation?: boolean;
  isCollegeStudent?: boolean;
  isPaid?: boolean;
  answers?: { formFieldId: string; value: string }[];
}

// === API 함수 ===

const participationApi = {
  getParticipations(params: GetParticipationsParams),
  getParticipation(id: string),
  updateParticipation(id: string, data: UpdateParticipationPayload),
  bulkApprovePayment(ids: string[]),
  downloadCsv(missionaryId: string),  // blob 반환
};
```

> **PO 확인 필요 (GAP 5)**: 이름/생년월일 편집 가능 여부. 현재 Design Spec 기준 **읽기 전용**으로 구현한다. PRD는 편집 가능이라 명시했으나, Design Spec에서 개인정보 섹션(bg-gray-50 + 잠금 아이콘)으로 분류했으므로 읽기 전용이 의도. PO 확인 후 변경 용이하도록 `UpdateParticipationPayload`에서 분리해 놓았다.

### 4-3. `apis/formField.ts`

```typescript
const formFieldApi = {
  getFormFields(missionaryId: string),
  createFormField(missionaryId: string, data: CreateFormFieldPayload),
  updateFormField(missionaryId: string, fieldId: string, data: UpdateFormFieldPayload),
  deleteFormField(missionaryId: string, fieldId: string),
  reorderFormFields(missionaryId: string, data: { fieldIds: string[] }),
};
```

### 4-4. `apis/attendanceOption.ts`

```typescript
const attendanceOptionApi = {
  getAttendanceOptions(missionaryId: string),
  createAttendanceOption(missionaryId: string, data: CreateAttendanceOptionPayload),
  updateAttendanceOption(missionaryId: string, optionId: string, data: UpdateAttendanceOptionPayload),
  deleteAttendanceOption(missionaryId: string, optionId: string),
};
```

### 4-5. `lib/queryKeys.ts` 확장

```typescript
// 추가할 키
enrollmentSummary: {
  all: ['enrollmentSummary'] as const,
  list: () => [...queryKeys.enrollmentSummary.all, 'list'] as const,
},
participations: {
  all: ['participations'] as const,
  list: (params?: object) => [...queryKeys.participations.all, 'list', params] as const,
  detail: (id: string) => [...queryKeys.participations.all, 'detail', id] as const,
},
formFields: {
  all: ['formFields'] as const,
  list: (missionaryId: string) => [...queryKeys.formFields.all, 'list', missionaryId] as const,
},
attendanceOptions: {
  all: ['attendanceOptions'] as const,
  list: (missionaryId: string) => [...queryKeys.attendanceOptions.all, 'list', missionaryId] as const,
},
```

---

## 5. 구현 Wave (의존 관계 기반 순서)

### Wave 0: 사전 준비
> PR 없음 -- BE 의존성 확인 + 패키지 설치

| # | 작업 | 상세 |
|---|------|------|
| 0-1 | BE API 스펙 확인 | 참석 옵션, 폼 필드, participation 확장 API가 사용 가능한지 확인. 미완료 시 MSW mock으로 선행 개발 |
| 0-2 | 패키지 설치 | `pnpm --filter missionary-admin add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` |

---

### Wave 1: 데이터 레이어 (API + 타입 + 쿼리 훅)
> **PR 1**: `feat: 등록 관리 API 클라이언트 및 쿼리 훅 추가`
> 예상 ~300줄

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 1-1 | `apis/enrollment.ts` | 신규 생성 | `EnrollmentMissionSummary` 타입 + API 함수 |
| 1-2 | `apis/enrollment.server.ts` | 신규 생성 | SSR용 래퍼 (`getServerEnrollmentSummary`) |
| 1-3 | `apis/participation.ts` | 신규 생성 | 타입 + API 함수 |
| 1-4 | `apis/participation.server.ts` | 신규 생성 | SSR용 래퍼 (`getServerParticipations`) |
| 1-5 | `apis/formField.ts` | 신규 생성 | FormField CRUD API + 타입 |
| 1-6 | `apis/attendanceOption.ts` | 신규 생성 | AttendanceOption CRUD API + 타입 |
| 1-7 | `lib/queryKeys.ts` | 수정 | `enrollmentSummary`, `participations`, `formFields`, `attendanceOptions` 키 추가 |

> **Wave 1에서 `EnrollmentMissionSummary` 타입을 반드시 정의한다** (GAP 7). 메인 페이지 Section A/B 모두 이 타입에 의존한다.

---

### Wave 2: 공통 컴포넌트 -- SidePanel 추출
> **PR 2**: `refactor: UserEditPanel에서 SidePanel 공통 컴포넌트 추출`
> 예상 ~350줄

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 2-1 | `components/ui/SidePanel.tsx` | 신규 생성 | Design Spec SS2-7-A의 Props 인터페이스 구현. 슬라이드 인/아웃 애니메이션, backdrop, 헤더(닫기 + 타이틀 + 배지 + prev/next + 더보기), 스크롤 본문, 선택적 액션바, 선택적 푸터 |
| 2-2 | `users/_components/panel/UserEditPanel.tsx` | 수정 | 기존 패널 래퍼 로직을 `SidePanel`으로 교체. 동작 보존 필수 -- regression 확인 |

> **구현 순서 비고 (GAP 8)**: PRD SS6-2에서는 "FR-5 구현 -> 공통 추출 -> UserEditPanel 교체" 순서를 제시하지만, FE Plan에서는 "공통 추출(Wave 2) -> FR-5에서 재사용(Wave 6)" 순서를 채택했다. 근거: 공통 컴포넌트를 먼저 추출해야 ParticipantPanel에서 바로 재사용 가능하며, UserEditPanel 마이그레이션도 같은 PR에서 regression 확인이 가능하다.

**SidePanel 핵심 구현 사항:**
- 컨테이너: `fixed right-0 top-0 h-full w-[560px] z-30`
- 트랜지션: `transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`
- 그림자: `shadow-[-4px_0_24px_rgba(0,0,0,0.08),-1px_0_4px_rgba(0,0,0,0.04)]`
- Backdrop: `fixed inset-0 z-20 bg-black/20` (클릭 시 `onClose`)
- Esc 키로 닫기
- 마운트/언마운트 분리: 애니메이션 완료까지 DOM 유지 (`mountedId` 패턴)

**UserEditPanel 마이그레이션 체크리스트:**
- [ ] 슬라이드 인/아웃 애니메이션 동일
- [ ] 이전/다음 유저 네비게이션 동작
- [ ] 더보기 메뉴 (삭제) 동작
- [ ] 미저장 변경 경고 모달 동작
- [ ] 폼 저장/취소 동작

---

### Wave 3: 등록 관리 메인 페이지 (FR-0)
> **PR 3**: `feat: 등록 관리 메인 페이지 구현`
> 예상 ~450줄

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 3-1 | `components/sidebar/Sidebar.tsx` | 수정 | NAV_ITEMS에 `{ label: '등록 관리', href: '/enrollment', icon: <ClipboardList size={20} /> }` 추가 (선교 관리 아래) |
| 3-2 | `enrollment/page.tsx` | 신규 생성 | 서버 컴포넌트: `getServerEnrollmentSummary()` -> `initialData` prop |
| 3-3 | `enrollment/loading.tsx` | 신규 생성 | 스켈레톤 (카드 3개 + 테이블) |
| 3-4 | `enrollment/_hooks/useGetEnrollmentSummary.ts` | 신규 생성 | 메인 페이지 데이터 조회 훅 (`EnrollmentMissionSummary[]` 반환) |
| 3-5 | `enrollment/_components/EnrollmentListPage.tsx` | 신규 생성 | 페이지 오케스트레이션: 헤더 + Section A + Section B |
| 3-6 | `enrollment/_components/HighlightCardSection.tsx` | 신규 생성 | Section A: 마감 임박 카드 최대 3개, 0개 시 섹션 숨김 |
| 3-7 | `enrollment/_components/MissionEnrollmentCard.tsx` | 신규 생성 | 카드 컴포넌트 (컬러바 + 배지 + 프로그레스 바 + 푸터) |
| 3-8 | `enrollment/_components/MissionEnrollmentTable.tsx` | 신규 생성 | Section B: 통합 테이블 (헤더 + 필터 툴바 + 테이블 + 페이지네이션) |
| 3-9 | `enrollment/_components/MissionStatusChips.tsx` | 신규 생성 | 상태 필터 칩 (전체/모집 중/모집 마감/종료) |

**MissionEnrollmentCard 구현 사항:**
- `<a href="/enrollment/[missionId]">` 전체 클릭
- 상단 컬러 바: 정원 100% -> `bg-green-60`, 마감 3일 이내 -> `bg-warning-70`, 그 외 -> `bg-blue-60`
- 카테고리 배지: 국내=`bg-green-10 text-green-60`, 해외=`bg-blue-10 text-blue-60`
- D-day 배지: D-3 이내=`bg-warning-10 text-warning-70 font-bold`, 그 외=`bg-gray-100 text-gray-500`
- ProgressBar: `className` props로 높이/색상 전달 (카드: `h-1.5`, 정원 초과 시 `bg-warning-70`)
- hover: `hover:border-gray-400 hover:shadow-md`, 제목 `group-hover:text-primary-50`

**MissionEnrollmentTable 구현 사항:**
- **ENROLLMENT_PREPARING 상태 제외** (GAP 3): Section B에 표시하지 않는다. 준비 중 선교는 등록자가 없으므로 표시 대상이 아님.
- 표시 대상: `ENROLLMENT_OPENED` + `ENROLLMENT_CLOSED` + `COMPLETED`
- 컬럼: 선교명, 카테고리, 신청 마감(D-day), 등록자/정원, 달성률(인라인 프로그레스 바), 납부완료, 상태
- **선교명 검색**: 클라이언트 사이드 + debounce 300ms + 로컬 state (GAP 12). 상태 필터 칩 변경 시 검색어 유지.
- 필터: 클라이언트 사이드 (선교명 검색 + 상태 필터 칩)
- 정렬: 상태 우선(모집 중 -> 마감 -> 종료), 동일 상태 내 마감일 오름차순
- 행 클릭: `router.push('/enrollment/[missionaryId]')`
- 페이지네이션: 20건/페이지, `Pagination` 컴포넌트

**엣지 케이스:**
- **모집 중 0개 (GAP 4)**: Section A 자체를 숨기되, Section B 테이블 위에 인라인 안내 표시: `"현재 모집 중인 선교가 없습니다."` + `[선교 관리로 이동]` 링크 (`/missions`). **PO 확인 필요** -- Section A 영역에 빈 상태 UI를 표시할지, 테이블 위 인라인으로 충분한지.
- 모집 중 1~3개: 해당 수만큼 카드, Section B는 카드와 무관하게 전체 선교 표시 (ENROLLMENT_PREPARING 제외)
- 모집 중 4개+: 상위 3개만 카드, 전체 테이블 표시
- 정원 미설정: "N명", 달성률 `--`
- 빈 상태: 필터/검색 결과 없음 -> `TableEmptyState` + [초기화] 버튼

---

### Wave 4: 등록 관리 상세 -- 현황 + 테이블 (FR-1, FR-2, FR-3, FR-6)
> **PR 4**: `feat: 등록 관리 상세 페이지 -- 현황 요약 및 등록자 테이블`
> 예상 ~450줄

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 4-1 | `[missionaryId]/page.tsx` | 신규 생성 | 서버 컴포넌트: missionary 정보 + participations 초기 데이터 |
| 4-2 | `[missionaryId]/loading.tsx` | 신규 생성 | 스켈레톤 |
| 4-3 | `[missionaryId]/_hooks/useGetParticipations.ts` | 신규 생성 | 목록 조회 훅 (`initialData` 지원) |
| 4-4 | `[missionaryId]/_hooks/useTogglePayment.ts` | 신규 생성 | 낙관적 업데이트 mutation |
| 4-5 | `[missionaryId]/_components/EnrollmentDetailPage.tsx` | 신규 생성 | 상세 페이지 오케스트레이션 |
| 4-6 | `[missionaryId]/_components/EnrollmentDetailHeader.tsx` | 신규 생성 | 뒤로가기 + 선교명 + 상태 배지 |
| 4-7 | `[missionaryId]/_components/EnrollmentSummaryCard.tsx` | 신규 생성 | FR-1: 3열 그리드 요약 (총 등록/납부/참석 유형) |
| 4-8 | `[missionaryId]/_components/SummaryStatItem.tsx` | 신규 생성 | 요약 카드 내 개별 수치 |
| 4-9 | `[missionaryId]/_components/ProgressBar.tsx` | 신규 생성 | 달성률 바 — `className` props로 스타일 분기 |
| 4-10 | `[missionaryId]/_components/EnrollmentToolbar.tsx` | 신규 생성 | 필터 + 검색 + 버튼 |
| 4-11 | `[missionaryId]/_components/ParticipantTable.tsx` | 신규 생성 | FR-2: 고정 9컬럼 + 커스텀 컬럼(최대 3개) |
| 4-12 | `[missionaryId]/_components/ParticipantRow.tsx` | 신규 생성 | 행 컴포넌트 (체크박스 + 데이터 + 납부 배지) |
| 4-13 | `[missionaryId]/_components/PaymentBadge.tsx` | 신규 생성 | FR-3: ADMIN=클릭 토글, STAFF=읽기 전용 |
| 4-14 | `[missionaryId]/_utils/csvDownload.ts` | 신규 생성 | FR-6: blob -> 파일 다운로드 |

**필터/검색 전략 (GAP 6, GAP 14):**

| 필터 | 저장 위치 | 동작 |
|------|----------|------|
| 납부 여부 (`isPaid`) | URL searchParams | 서버 필터. 변경 시 페이지 1로 리셋. |
| 참석 일정 (`attendanceType`) | URL searchParams | 서버 필터. 변경 시 페이지 1로 리셋. |
| 페이지 (`page`) | URL searchParams | 서버 페이지네이션. |
| 이름 검색 (`query`) | 로컬 `useState` | 클라이언트 사이드 debounce 300ms. 서버 필터 변경 시 검색어 유지. |

> 서버 필터(`isPaid`, `attendanceType`, `page`)는 URL searchParams에 저장하여 뒤로가기/URL 공유 시 필터 상태를 보존한다. 이름 검색은 일시적 탐색 용도이므로 로컬 state로 관리한다.

**EnrollmentSummaryCard 구현 사항:**
- 3열 그리드: 총 등록자/정원 + 납부완료/미납 + 풀참석/옵션참여
- 각 항목: 라벨(`text-xs text-gray-400`) + 수치(`text-2xl font-bold`) + 보조 수치(`text-sm text-gray-500`)
- ProgressBar: `className="h-2"` (요약 카드용), 색상 `bg-gray-800`
- 정원 미설정: "총 N명", 프로그레스 바 숨김
- 정원 초과: 수치 `text-warning-70` + "정원 초과" 배지
- 로딩: skeleton (`animate-pulse`)

**ProgressBar 구현 (GAP - ProgressBar):**
```typescript
interface ProgressBarProps {
  value: number;       // 0~100 (퍼센트)
  className?: string;  // 외부에서 높이, 색상 등 전달
}
// 사용 예:
// 요약 카드: <ProgressBar value={46} className="h-2 bg-gray-800" />
// 메인 카드: <ProgressBar value={47} className="h-1.5 bg-blue-60" />
// 테이블:   <ProgressBar value={80} className="h-1.5 w-20 bg-blue-60" />
// 정원 초과: <ProgressBar value={110} className="h-1.5 bg-warning-70" />
```

**ParticipantTable 구현 사항:**
- 컬럼 순서: 체크박스(44px) | 등록일시(140px) | 이름(100px) | 생년월일(110px) | 소속(120px) | 참석 일정(110px) | 기수(70px) | 납부 여부(90px) | 팀(90px) | 커스텀 필드(각 100px)
- 커스텀 컬럼: 최대 3개, 초과분 미표시
- 테이블 컨테이너: `overflow-x-auto`
- **체크박스 전체선택: 현재 페이지 기준** (GAP 10). 전체 데이터 기준이 아님.
- 체크박스: ADMIN만 표시, 헤더 전체선택/해제
- 행 hover: `hover:bg-gray-50 cursor-pointer`
- 선택된 행: `bg-blue-10`
- 행 클릭: searchParams에 `participantId` 설정 (체크박스 영역 제외)
- 스켈레톤/빈 상태/에러 상태: 기존 `TableSkeleton`, `TableEmptyState` 활용

**CSV 다운로드 (GAP 13):**
- 다운로드 버튼 클릭 시 로딩 상태 표시 (버튼에 spinner)
- 다운로드 중: `Button variant="outline" loading` 상태, 클릭 비활성화
- 성공 시: 파일 자동 다운로드 (blob -> `<a>` + `URL.createObjectURL`)
- 실패 시: `toast.error("CSV 다운로드에 실패했습니다. 다시 시도해주세요.")`

**useTogglePayment 낙관적 업데이트:**
```typescript
// onMutate: queryClient.setQueryData로 isPaid 즉시 반영
// onError: context.previousData로 롤백 + toast.error
// onSettled: invalidateQueries (목록 + 요약)
```

---

### Wave 5: 납부 일괄 승인 (FR-4)
> **PR 4에 포함** (또는 분리 가능)

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 5-1 | `[missionaryId]/_hooks/useBulkApprovePayment.ts` | 신규 생성 | `PUT /participations/approve` mutation |
| 5-2 | `[missionaryId]/_components/BulkApproveModal.tsx` | 신규 생성 | 확인 모달 (`overlay.openAsync`) |

**BulkApproveModal:**
- 문구: "N명의 납부를 승인합니다. / 이 작업은 되돌릴 수 없습니다."
- 버튼: [취소] + [승인]
- 성공: 모달 닫기 + 목록 갱신 + 현황 카드 갱신 + `toast.success("N명의 납부가 승인되었습니다.")`
- 실패: `toast.error("납부 승인에 실패했습니다. 다시 시도해주세요.")`
- ADMIN 전용

---

### Wave 6: 등록자 상세/수정 패널 (FR-5)
> **PR 5**: `feat: 등록자 상세/수정 슬라이드 오버 패널`
> 예상 ~350줄

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 6-1 | `[missionaryId]/_hooks/useGetParticipation.ts` | 신규 생성 | 상세 조회 훅 |
| 6-2 | `[missionaryId]/_hooks/useUpdateParticipation.ts` | 신규 생성 | 수정 mutation (고정 필드 + 커스텀 답변) |
| 6-3 | `[missionaryId]/_schemas/participantSchema.ts` | 신규 생성 | zod 스키마 |
| 6-4 | `[missionaryId]/_components/panel/ParticipantPanel.tsx` | 신규 생성 | `SidePanel` 사용, URL 기반 열림/닫힘 |
| 6-5 | `[missionaryId]/_components/panel/ParticipantForm.tsx` | 신규 생성 | react-hook-form 폼 |
| 6-6 | `[missionaryId]/_components/panel/CustomFieldInput.tsx` | 신규 생성 | fieldType별 입력 분기 |
| 6-7 | `[missionaryId]/_utils/formatParticipant.ts` | 신규 생성 | 날짜 포맷 등 유틸 |

**ParticipantPanel 구현 사항:**

SidePanel Props 매핑:
- `title`: 등록자 이름
- `subtitle`: `"신청일 . 선교명"` (예: "2026.03.25 . 35차 군선교")
- `badge`: 납부 배지 (납부완료=success / 미납=warning)
- `onPrev` / `onNext`: 현재 목록 배열 기반 이전/다음 등록자
- `menuItems`: ADMIN -> 없음 (현재 Scope에 삭제 없음)
- `actionBar`: ADMIN -> 납부 여부 빠른 토글 바 (FR-3)
- `onSave` / `onCancel`: ADMIN -> 표시, STAFF -> 미표시

**ParticipantForm 섹션 구조:**
1. **참석 정보** (편집 가능, `bg-white`)
   - 소속(`InputField`), 참석 일정(`Select` -- 해당 선교 옵션), 기수(`InputField type="number"`), 과거 참여(`Switch`), 대학생 여부(`Switch`)
2. **개인 정보** (읽기 전용, `bg-gray-50`, 잠금 아이콘)
   - 이름 (읽기 전용), 생년월일 (읽기 전용)
   > **PO 확인 필요 (GAP 5)**: Design Spec 기준 읽기 전용. PRD와 충돌. 현재 읽기 전용으로 구현하되, 편집 전환이 필요하면 해당 필드의 `readOnly` prop만 제거하면 된다.
3. **기본 정보** (읽기 전용, `bg-gray-50`, 잠금 아이콘)
   - 등록일시, 신청 선교, 소속 팀
4. **추가 신청 정보** -- 커스텀 필드 (ADMIN이면 편집 가능, STAFF이면 읽기 전용)
   - `CustomFieldInput`으로 fieldType별 렌더링

**CustomFieldInput 분기:**

| fieldType | 컴포넌트 | 비고 |
|-----------|----------|------|
| TEXT | `InputField` | |
| TEXTAREA | `TextareaField` | |
| NUMBER | `InputField type="number"` | |
| BOOLEAN | `Switch` | 예/아니오 |
| SELECT | `Select` | options 배열 |
| DATE | `DatePicker` | ISO 8601 |

**미답변 필드:** 빈 값 + `text-xs text-gray-400 "미입력"` 레이블

**Dirty Guard:**
- `isDirtyRef`로 폼 변경 추적
- 닫기/외부 클릭/Esc 시: dirty면 확인 모달 (`overlay.openAsync`)
- 문구: "저장하지 않은 변경사항이 있습니다. 정말 닫으시겠어요?"
- [계속 수정] (primary) / [닫기] (outline destructive)

---

### Wave 7: 폼 필드 관리 -- Form Builder (FR-7-B)
> **PR 6**: `feat: 폼 필드 관리 (Form Builder) 구현`
> 예상 ~400줄

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 7-1 | `[missionaryId]/_hooks/useGetFormFields.ts` | 신규 생성 | 폼 필드 목록 조회 |
| 7-2 | `[missionaryId]/_hooks/useFormFieldMutations.ts` | 신규 생성 | CRUD + reorder mutations |
| 7-3 | `[missionaryId]/_schemas/formFieldSchema.ts` | 신규 생성 | 필드 추가/수정 zod 스키마 |
| 7-4 | `[missionaryId]/_components/form-builder/FormBuilderSection.tsx` | 신규 생성 | 전체 섹션 (ADMIN 전용 노출) |
| 7-5 | `[missionaryId]/_components/form-builder/FormBuilderToolbar.tsx` | 신규 생성 | sticky 툴바 (미저장 인디케이터 + [미리보기] + [저장]) |
| 7-6 | `[missionaryId]/_components/form-builder/FormFieldCard.tsx` | 신규 생성 | 카드 (미확장/확장/고정 3상태) |
| 7-7 | `[missionaryId]/_components/form-builder/FormFieldSettings.tsx` | 신규 생성 | 확장 시 편집 영역 |
| 7-8 | `[missionaryId]/_components/form-builder/AddFieldButton.tsx` | 신규 생성 | 점선 추가 카드 |
| 7-9 | `[missionaryId]/_components/form-builder/TagInput.tsx` | 신규 생성 | SELECT 선택지 칩 입력 |

> **Design Spec SS4 (모달 기반 흐름)는 v1.6 이전 잔재로 무시한다** (GAP 1). SS2-2의 인라인 WYSIWYG만 따른다.

**FormBuilderSection 상태 관리:**
```typescript
// 서버 데이터 (TanStack Query)
const { data: serverFields } = useGetFormFields(missionaryId);

// 로컬 편집 상태 (useState)
const [localFields, setLocalFields] = useState<LocalFormField[]>([]);
const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
const [isDirty, setIsDirty] = useState(false);

// serverFields 변경 시 localFields 동기화
useEffect(() => {
  if (serverFields && !isDirty) {
    setLocalFields(serverFields);
  }
}, [serverFields, isDirty]);
```

**FormFieldCard 3가지 상태:**

| 상태 | 조건 | 스타일 |
|------|------|--------|
| 미확장 (프리뷰) | `activeFieldId !== id` | `bg-white border border-gray-200 rounded-xl` |
| 확장 (편집 활성) | `activeFieldId === id` | `border-l-2 border-blue-60` + 연한 파란 배경 |
| 고정 필드 | `isSystemField` | `opacity-60`, 편집/삭제 불가, 잠금 아이콘 |

**미확장 카드 구성:**
1. 드래그 핸들 (`GripVertical`, `cursor-grab`) -- `@dnd-kit/sortable` `useSortable`
2. 타입 배지 (`Badge variant="outline"`)
3. 라벨 텍스트 (`font-medium`)
4. 필수 여부 (`*필수` warning / `선택` gray)
5. [펼치기] 버튼

**드래그 앤 드롭 구현:**
```typescript
// FormBuilderSection 내부
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
    {localFields.map(field => (
      <FormFieldCard key={field.id} field={field} ... />
    ))}
  </SortableContext>
</DndContext>
```

**삭제 규칙 (GAP 2):**
- **Design Spec 기준**: 답변이 있는 필드는 삭제 불가.
  - 답변 있는 필드: [삭제] disabled + Tooltip "답변이 있는 필드는 삭제할 수 없습니다."
  - 답변 없는 필드: 인라인 확인 -> "삭제된 필드는 목록에서 숨겨지지만 기존 답변은 보존됩니다. 삭제하시겠어요?"
- `hasAnswers` 필드를 `FormFieldDefinition` 타입에 포함하여 삭제 가능 여부를 프론트에서 사전 판단.
- **PO 확인 필요**: PRD(Soft delete, 답변 있어도 삭제 가능) vs Design Spec(답변 있으면 삭제 불가). 현재 Design Spec 기준으로 구현하되, Soft delete 전환이 필요하면 `hasAnswers` 체크 조건만 제거하면 된다.

**저장 로직 (GAP - Form Builder 저장 실패):**
- [저장] 클릭 -> 변경된 필드 diff 계산 -> 각 변경 유형별 API **순차 호출**
  - 추가된 필드: `POST /form-fields`
  - 수정된 필드: `PATCH /form-fields/:id`
  - 삭제된 필드: `DELETE /form-fields/:id`
  - 순서 변경: `PATCH /form-fields/reorder` (순서 일괄 업데이트)
- **Partial commit 처리**: 순차 호출 중 일부 실패 시:
  - 성공한 요청은 유지 (롤백하지 않음)
  - 실패한 건만 `toast.error("일부 필드 저장에 실패했습니다. 실패한 항목을 확인 후 다시 저장해주세요.")`
  - 실패한 필드는 로컬 상태에서 `isDirty` 유지 -> 재시도 가능
  - 성공한 필드는 서버와 동기화 (invalidateQueries)
- 전체 성공: `isDirty = false` + `toast.success("저장되었습니다.")`

**이탈 방지:**
- `isDirty` 상태에서 페이지 이탈(라우트 변경) 시: `beforeunload` 이벤트 + `router.events` 가드
- 문구: "저장되지 않은 변경 사항이 있습니다. 나가시겠어요?"

**빈 상태:**
- 필드 0개: 아이콘 + "아직 추가된 커스텀 필드가 없습니다." + [+ 필드 추가] CTA

---

### Wave 8: 참석 옵션 관리 (FR-7-A) -- 조건부
> **PR 6에 포함** (Form Builder와 같은 섹션)
> **PO Scope 확정 대기 (GAP 11)**: PO 확인 후 제외될 수 있음. 제외 시 Wave 8 전체 skip.

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 8-1 | `[missionaryId]/_hooks/useGetAttendanceOptions.ts` | 신규 생성 | 옵션 목록 조회 |
| 8-2 | `[missionaryId]/_hooks/useAttendanceOptionMutations.ts` | 신규 생성 | CRUD mutations |
| 8-3 | `[missionaryId]/_components/form-builder/AttendanceOptionManager.tsx` | 신규 생성 | 옵션 관리 UI |

**AttendanceOptionManager 구현:**
- Form Builder 섹션 상단에 위치 (ADMIN 전용)
- 현재 옵션 목록: type 배지 (`FULL`=info / `PARTIAL`=outline) + label + [삭제]
- [+ 옵션 추가]: 인라인 또는 간단 모달 -- type(`Select`: 풀참석/옵션참여) + label(`InputField`)
- 삭제 시 등록자 존재하면: `toast.error("N명이 선택한 옵션은 삭제할 수 없습니다.")`

---

### Wave 9: 통합 + 접근성 + 최종 점검
> **PR 7**: `feat: 등록 관리 접근성 및 통합 점검`
> 예상 ~150줄

| # | 파일 | 작업 | 비고 |
|---|------|------|------|
| 9-1 | 전체 | 접근성 속성 추가 | `aria-*` 속성 일괄 점검 |
| 9-2 | 전체 | 키보드 네비게이션 확인 | Tab 순서, Enter/Space 동작 |
| 9-3 | 전체 | 엣지 케이스 QA | Design Spec SS7 체크리스트 기반 |

**접근성 체크리스트** (Design Spec SS6):
- [ ] 납부 배지 토글: `role="button"` + `aria-label`
- [ ] 체크박스 헤더: `aria-label="전체 선택"`
- [ ] SidePanel: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- [ ] 드래그 핸들: `aria-label="순서 변경 핸들"` + 키보드 대체 수단
- [ ] 커스텀 필드 입력: `aria-required={isRequired}` + `htmlFor`/`id`
- [ ] 스켈레톤: `aria-busy="true"` + `aria-live="polite"`

---

## 6. PR 전략

| PR # | Wave | 제목 | 예상 줄 수 | 의존성 |
|------|------|------|-----------|--------|
| PR 1 | W1 | `feat: 등록 관리 API 클라이언트 및 쿼리 훅 추가` | ~300 | 없음 |
| PR 2 | W2 | `refactor: UserEditPanel에서 SidePanel 공통 컴포넌트 추출` | ~350 | 없음 |
| PR 3 | W3 | `feat: 등록 관리 메인 페이지 구현` | ~450 | PR 1 |
| PR 4 | W4+5 | `feat: 등록 관리 상세 -- 현황 요약 및 등록자 테이블` | ~450 | PR 1, PR 3 |
| PR 5 | W6 | `feat: 등록자 상세/수정 슬라이드 오버 패널` | ~350 | PR 2, PR 4 |
| PR 6 | W7+8 | `feat: 폼 필드 관리 (Form Builder) + 참석 옵션 관리` | ~400 | PR 4 |
| PR 7 | W9 | `feat: 등록 관리 접근성 및 통합 점검` | ~150 | PR 5, PR 6 |

> **병렬 가능**: PR 1 <-> PR 2 동시 작업 가능. PR 5 <-> PR 6 도 PR 4 이후 병렬 작업 가능.

**의존 관계 다이어그램:**
```
PR 1 (W1: API) -----> PR 3 (W3: 메인) -----> PR 4 (W4+5: 상세) --+-> PR 5 (W6: 패널)
                                                                   |
PR 2 (W2: SidePanel) -----------------------------------------+   +-> PR 6 (W7+8: Form Builder)
                                                               |
                                                               +-> PR 5 (W6: 패널)

                                                     PR 5 + PR 6 -> PR 7 (W9: 통합)
```

---

## 7. BE 의존성 체크리스트

FE 선행 개발이 가능하도록 MSW mock을 세팅하되, 실제 연동 전 아래 API가 완료되어야 한다.

| API | 우선순위 | Wave |
|-----|:--------:|:----:|
| 메인 페이지용 선교 목록 (enrollment 요약 정보 포함) — `EnrollmentMissionSummary` 타입 대응 | P0 | W3 |
| `GET /participations?missionaryId=&isPaid=&attendanceType=&page=&pageSize=` | P0 | W4 |
| `GET /participations/:id` (응답에 `formAnswers`, `attendanceOption` 포함) | P0 | W6 |
| `PATCH /participations/:id` (고정 필드 + 커스텀 답변) | P0 | W6 |
| `PUT /participations/approve` (일괄 승인) | P0 | W5 |
| `GET /participations/download/:missionaryId` (CSV) | P1 | W4 |
| `GET /missionaries/:id/form-fields` (응답에 `hasAnswers` 포함) | P0 | W7 |
| `POST /missionaries/:id/form-fields` | P0 | W7 |
| `PATCH /missionaries/:id/form-fields/:fieldId` | P0 | W7 |
| `DELETE /missionaries/:id/form-fields/:fieldId` | P0 | W7 |
| `PATCH /missionaries/:id/form-fields/reorder` (순서 일괄 업데이트) | P0 | W7 |
| `GET /missionaries/:id/attendance-options` | P0 (조건부) | W8 |
| `POST /missionaries/:id/attendance-options` | P0 (조건부) | W8 |
| `PATCH /missionaries/:id/attendance-options/:optionId` | P1 (조건부) | W8 |
| `DELETE /missionaries/:id/attendance-options/:optionId` | P1 (조건부) | W8 |

---

## 8. 미결 사항

### BE 확인 필요

| # | 항목 | 영향 Wave | 비고 |
|---|------|----------|------|
| 1 | 메인 페이지 데이터 API | W3 | 기존 `GET /missionaries` 확장 vs 신규 엔드포인트. `EnrollmentMissionSummary` 타입의 집계 필드(`currentParticipantCount`, `paidCount`) 포함 필요. |
| 2 | Form Builder 저장 API | W7 | 일괄 저장 vs 개별 CRUD. 현재 플랜은 개별 순차 호출 기준. 일괄 저장 API가 제공되면 partial commit 로직이 불필요해짐. |
| 3 | 폼 필드 순서 변경 API | W7 | `PATCH /form-fields/reorder` 별도 필요 여부 |
| 4 | `FormFieldDefinition` 응답에 `hasAnswers` 필드 포함 | W7 | 삭제 가능 여부 프론트 사전 판단용 |

### PO 확인 필요

| # | 항목 | 영향 Wave | 현재 기본값 | 비고 |
|---|------|----------|-----------|------|
| 1 | 참석 옵션 관리 UI (FR-7-A) Scope | W8 | **조건부 포함** | PO 확인 후 제외 가능. 제외 시 Wave 8 skip. |
| 2 | Form Builder 필드 삭제 정책 | W7 | **답변 있으면 삭제 불가** (Design Spec 기준) | PRD와 충돌. Soft delete 전환 시 `hasAnswers` 체크만 제거. |
| 3 | 모집 중 0개 시 빈 상태 UI | W3 | Section A 숨김 + Section B 위 인라인 안내 | Section A에 빈 상태 카드 표시할지 여부. |
| 4 | 이름/생년월일 편집 여부 | W6 | **읽기 전용** (Design Spec 기준) | PRD와 충돌. 편집 필요 시 `readOnly` prop 제거로 전환 용이. |
| 5 | 커스텀 컬럼 4개 초과 처리 | W4 | 초과분 테이블 미표시 | 헤더에 "(상세 패널에서 확인)" 안내 문구 여부. |

---

## 9. 테스트 전략

### 단위 테스트 (Vitest)
- 유틸 함수: `formatParticipant`, `csvDownload`, D-day 계산
- 커스텀 훅: `useTogglePayment` 낙관적 업데이트 로직

### 컴포넌트 테스트 (Vitest + RTL)
- `PaymentBadge`: ADMIN/STAFF 역할별 렌더링 + 클릭 동작
- `CustomFieldInput`: 6가지 fieldType별 렌더링
- `MissionEnrollmentCard`: 상태별 컬러 바, D-day 배지, 프로그레스 바
- `SidePanel`: 열기/닫기 애니메이션, Esc 키, dirty guard
- `ProgressBar`: className 전달에 따른 스타일 분기

### 통합 테스트 (Playwright -- 추후)
- 메인 -> 상세 -> 패널 열기 -> 수정 -> 저장 -> 목록 갱신 흐름
- 납부 토글 + 현황 카드 연동
- Form Builder 필드 추가/삭제/순서 변경/저장
- CSV 다운로드 성공/실패 흐름

---

## 10. Definition of Done

- [ ] TypeScript 에러 없음 (`pnpm type-check`)
- [ ] ESLint 통과 (`pnpm lint:all`)
- [ ] 핵심 유틸/훅 단위 테스트 작성
- [ ] 접근성 기본 체크 (SS6 체크리스트)
- [ ] 빌드 정상 (`pnpm --filter missionary-admin build`)
- [ ] Design Spec 엣지 케이스 처리 확인 (SS7 체크리스트)
- [ ] 기존 UserEditPanel regression 없음 (SidePanel 마이그레이션 후)
- [ ] CSV 다운로드 로딩/에러 상태 동작 확인
- [ ] Form Builder 저장 실패 시 partial commit 처리 동작 확인
