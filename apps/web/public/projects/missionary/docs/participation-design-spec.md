# Design Spec: 등록 관리 페이지

| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.6 |
| 작성일 | 2026-03-26 |
| 작성자 | PD |
| 참조 PRD | `./prd.md` (v1.7) |
| 대상 | FE 개발자 |
| 대상 디바이스 | 데스크톱 전용 (1280px+) |

---

## 1. 화면 구조 (레이아웃)

### 1-1. 전체 진입 구조

```
사이드바 네비게이션
└── [등록 관리] 메뉴 (독립 페이지)
    └── 카드 목록 화면 (/enrollment)                     ← §1-2, §2-1
        └── 선교 카드 클릭
            └── 등록 관리 상세 (/enrollment/[missionId]) ← §1-3, §2-2 ~
```

> **변경 이력 (v1.1)**: 기존 선교 상세 탭 구조에서 독립 페이지로 전환.
> 탭(FR-0) 스펙 폐기, 카드 목록 진입 화면 신규 추가.

### 1-2. 카드 목록 화면 — 전체 레이아웃 (/enrollment)

```
┌─────────────────────────────────────────────────────────┐
│  페이지 헤더                                             │
│  등록 관리                          모집 중 N건 | 총 XXX명 │
├─────────────────────────────────────────────────────────┤
│  섹션 레이블: 마감 임박 · 최대 3건                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ 카드 1   │ │ 카드 2   │ │ 카드 3   │                │
│  │(warning) │ │ (blue)   │ │ (blue)   │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│  → 신청 마감일 오름차순 상위 3개 (모집 중 4개 이상 시)   │
│    0~3개면 해당 수만큼 표시 / 0개면 섹션 자체 숨김       │
├─────────────────────────────────────────────────────────┤
│  ┌─ 통합 테이블 ──────────────────────────────────────┐  │
│  │  선교 목록                           전체 N건       │  │← 테이블 헤더 행
│  ├──────────────────────────────────────────────────  │  │
│  │  [🔍 선교명 검색___] | [전체★] [모집 중] [마감] [종료] ← 필터 툴바 (bg-gray-50/80)
│  ├──────────────────────────────────────────────────  │  │
│  │  선교명 | 카테고리 | 신청 마감(D-day) | 등록자/정원  │  │
│  │         | 달성률 | 납부완료 | 상태                   │  │
│  │  ...                                               │  │
│  │  [페이지네이션]                                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1-3. 등록 관리 상세 — 전체 레이아웃 (/enrollment/[missionId])

```
┌─────────────────────────────────────────────────────────┐
│  ← 등록 관리          [선교명]          [상태 배지]      │  ← 페이지 헤더 (뒤로가기 + 컨텍스트)
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─ ADMIN 전용 관리 섹션 (FR-7) ────────────────────┐   │
│  │  참석 옵션 관리 (FR-7-A)                         │   │
│  ├───────────────────────────────────────────────────┤   │
│  │  폼 필드 관리 (FR-7-B) — 인라인 WYSIWYG          │   │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 등록 현황 요약 카드 (FR-1) ─────────────────────┐   │
│  │  총 등록자/정원 | 납부완료/미납 | 풀참석/옵션참여  │   │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 도구 모음 ────────────────────────────────────────┐  │
│  │  [납부여부 필터] [참석일정 필터] [이름 검색______] │  │
│  │                       [납부 승인▾] [CSV 다운로드]  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 등록자 테이블 ────────────────────────────────────┐  │
│  │  고정 컬럼 7개 + 커스텀 컬럼(동적, 가로 스크롤)   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 페이지네이션 ─────────────────────────────────────┐  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
          ┌─────────────────────────────────┐
          │ 슬라이드 오버 패널 (행 클릭 시) │  ← 오른쪽에서 슬라이드인
          │ FR-5: 등록자 상세/수정          │
          └─────────────────────────────────┘
```

**페이지 헤더 상세**:
- 뒤로가기 버튼: `← 등록 관리` (ChevronLeft 아이콘 + 텍스트) → `/enrollment` 이동
- 선교명: `text-lg font-semibold text-gray-900`
- 상태 배지: `MissionStatusBadge` 컴포넌트 (선교 현재 상태 반영)

---

## 2. 컴포넌트별 상세 명세

### 2-1. 카드 목록 페이지 (FR-0) — `/enrollment`

> 선교 상세 탭 구조 폐기. 독립 페이지로 진입.
> Section A(마감 임박 하이라이트 카드 최대 3개) + Section B(통합 테이블) 두 섹션으로 구성.

---

#### 페이지 헤더

```
┌──────────────────────────────────────────────────────────┐
│  등록 관리                   모집 중 N건  |  총 신청 XXX명  │
└──────────────────────────────────────────────────────────┘
```

- 제목: `text-lg font-semibold text-gray-900`
- 요약(우측): `text-sm text-gray-500`
  - 모집 중 건수: `ENROLLMENT_OPENED` 상태 선교 총 수
  - 총 신청 수: 모집 중 선교 등록자 합계

> **페이지 레벨 검색/필터 없음** — 검색과 상태 필터는 Section B(통합 테이블) 내부에만 위치한다.

---

#### Section A: 하이라이트 카드 (마감 임박 상위 3개)

**섹션 레이블**: `"마감 임박 · N건"` — `text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3`

**카드 노출 로직 (엣지 케이스)**

| 모집 중 선교 수 | 카드 영역 표시 | 카드 수 | Section B 표시 |
|---------------|-------------|--------|--------------|
| 0개 | ❌ 섹션 자체 숨김 | — | 통합 테이블만 |
| 1~2개 | ✅ 해당 수만큼 | 1 또는 2 | 없음 (카드 = 전체) |
| 3개 | ✅ 3개 | 3 | 없음 (카드 = 전체) |
| 4개 이상 | ✅ 상위 3개만 | 3 | 나머지 모집 중 + 마감/종료 |

**정렬 기준**:
1. Primary: 신청 마감일 오름차순 (D-day 낮을수록 앞)
2. Secondary: 달성률 오름차순 (낮을수록 앞, 동점 시 더 긴급)

**그리드**: `grid grid-cols-3 gap-4`

**빈 상태**: 검색/필터 결과 없을 때
```
🗂 아이콘
"조건에 맞는 선교가 없습니다."
[필터 초기화] 버튼
```

#### 선교 카드 (MissionEnrollmentCard)

각 카드 구조:

```
┌─ 4px 컬러 바 (상태별 색상) ──────────────────────────────┐
│  [카테고리 배지]              [D-N 배지]                  │  ← 그룹 행
│  선교명                                                   │  ← font-bold
│  📅 선교 기간                                            │
│  ⏰ 신청 마감                                            │
│  신청 현황      47 / 100명                               │  ← 진행률
│  ████████░░░░░░  47%                                     │  ← 프로그레스 바
│  납부완료 35 · 미납 12                                   │
├─────────────────────────────────────────────────────────  │
│  담당: 김목사              [관리하기 →]                   │  ← 카드 푸터
└──────────────────────────────────────────────────────────┘
```

**컨테이너**: `bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-400 hover:shadow-md transition-all overflow-clip`
**클릭**: 카드 전체가 링크 (`<a href="/enrollment/[missionId]">`)

**상단 컬러 바** (`h-1`):
| 조건 | 색상 |
|------|------|
| 정원 100% 달성 | `bg-green-60` |
| 마감 3일 이내 | `bg-warning-70` |
| 그 외 | `bg-blue-60` |

**카테고리 배지**:
- 국내: `bg-green-10 text-green-60`
- 해외: `bg-blue-10 text-blue-60`

**D-day 배지** (상태 배지 위치에 표시):
- D-3 이내: `bg-warning-10 text-warning-70 font-bold`
- D-4 이상: `bg-gray-100 text-gray-500`
- 포맷: `"D-N"` (예: `D-2`, `D-66`)

**선교명 호버**: `group-hover:text-primary-50 transition-colors`

**프로그레스 바**:
- 컨테이너: `h-1.5 rounded-full bg-gray-100 overflow-hidden`
- 채워진 부분: `h-full rounded-full bg-blue-60`
- 정원 초과 시: `bg-warning-70`
- 달성률 = `(currentCount / maximumParticipantCount) * 100`
- 정원 미설정: 프로그레스 바 숨김, `"총 N명"` 텍스트만 표시

**카드 푸터**: `px-5 py-3 border-t border-gray-100 bg-gray-50`

**상태별 스켈레톤**: API 로딩 중 카드 위치에 `animate-pulse` 처리된 스켈레톤 카드

---

#### Section B: 통합 테이블

**표시 대상**: 모집 중(`ENROLLMENT_OPENED`) + 모집 마감(`ENROLLMENT_CLOSED`) + 완료(`COMPLETED`)
**제외**: `ENROLLMENT_PREPARING`(준비 중) — 등록자가 없으므로 표시하지 않음
**목적**: 모든 선교의 등록 현황 탐색 및 상세 진입

**섹션 헤더**: 테이블 컨테이너 최상단 행 — `flex items-center justify-between px-5 py-3.5 border-b border-gray-100`
- 좌: `"선교 목록"` — `text-sm font-semibold text-gray-900`
- 우: `"전체 N건"` — `text-xs text-gray-400`

**필터 툴바** — 테이블 헤더 행 바로 아래, 연계지 관리 패턴 동일 적용:
```
flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/80
```
- 좌: `SearchBox` — placeholder `"선교명 검색..."` (클라이언트 필터링)
- 구분선: `w-px h-[18px] bg-gray-200`
- 우: 상태 필터 칩

| 칩 | 대상 상태 | 기본값 |
|----|---------|-------|
| 전체 | 모든 상태 | ✅ 기본 활성 |
| 모집 중 | `ENROLLMENT_OPENED` | — |
| 모집 마감 | `ENROLLMENT_CLOSED` | — |
| 종료 | `COMPLETED` | — |

- 활성 칩: `bg-gray-900 text-white`
- 비활성 칩: `bg-gray-100 text-gray-500 hover:bg-gray-200`

**컬럼 정의**

| # | 컬럼명 | 내용 | 너비 | 비고 |
|---|--------|------|------|------|
| 1 | 선교명 | `missionary.name` + `order차` | — | `font-semibold`, 링크 스타일 |
| 2 | 카테고리 | `missionary.category` | 90px | `CategoryBadge` |
| 3 | 신청 마감 | `enrollmentDeadline` + D-day | 140px | 마감 D-3 이내 `text-warning-70 font-semibold` |
| 4 | 등록자/정원 | `currentCount / maxCount명` | 110px | 정원 미설정 시 `N명` |
| 5 | 달성률 | 인라인 프로그레스 바 + `N%` | 130px | 정원 미설정 시 `—` |
| 6 | 납부완료 | `paidCount명` | 80px | |
| 7 | 상태 | `MissionStatusBadge` | 100px | |

**달성률 인라인 프로그레스 바**:
```html
<div class="flex items-center gap-2">
  <div class="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden">
    <div class="h-full rounded-full bg-blue-60" style="width: N%"></div>
    <!-- 정원 초과(100% 이상) 시: bg-warning-70 (카드 섹션과 동일) -->
  </div>
  <span class="text-xs text-gray-500">N%</span>
</div>
```

- 기본: `bg-blue-60`
- 정원 초과(`currentCount > maximumParticipantCount`): `bg-warning-70` (카드 섹션 일관성)

**행 클릭**: `/enrollment/[missionId]`
- 모집 중 → 편집 가능 상세
- 모집 마감/완료 → 읽기 전용 상세 (STAFF 뷰)

**푸터**:
```
총 N건 중 1–20건     ← 좌측 텍스트
[페이지네이션]        ← 우측 정렬
```

**페이지네이션**: `Pagination` 컴포넌트, 20건/페이지

**빈 상태**: 검색/필터 결과 없음 → `"조건에 맞는 선교가 없습니다." + [초기화] 버튼`

---

### 2-2-A. 참석 옵션 관리 섹션 (FR-7-A)

**위치**: 등록 현황 요약 카드 위. 폼 필드 관리 섹션(FR-7-B) 위에 위치. ADMIN 권한만 노출.

**용도**: 등록 시 참가자가 선택하는 "참석 일정 옵션"을 선교별로 정의한다. `AttendanceType`(FULL/PARTIAL)은 FR-1 통계 집계용 기준 분류이며, `label`은 실제 표시 텍스트로 선교마다 다르게 설정할 수 있다.

> 예시: FULL → `"전체 참석"`, PARTIAL → `"목요일 출발"`, `"금요일 출발"`

**레이아웃**

```
┌─ 참석 옵션 ─────────────────────────────────────────────┐
│  참석 옵션                              [+ 옵션 추가]   │  ← 섹션 헤더 행
├─────────────────────────────────────────────────────────┤
│  라벨                유형          선택 인원   삭제      │  ← 컬럼 헤더
├─────────────────────────────────────────────────────────┤
│  전체 참석           [풀참석]      12명        [삭제]   │
│  목요일 출발         [옵션참여]     5명        [삭제]   │
│  금요일 출발         [옵션참여]     6명        [삭제∅]  │  ← 등록자 있음 → disabled
├─────────────────────────────────────────────────────────┤
│  [___ 옵션 라벨 ___]  [유형 선택▾]      [확인]  [×]   │  ← [+ 옵션 추가] 클릭 시 노출
└─────────────────────────────────────────────────────────┘
```

**섹션 헤더**: `flex items-center justify-between mb-3`
- 좌: `"참석 옵션"` — `text-xs font-semibold text-gray-600 uppercase tracking-wider`
- 우: `[+ 옵션 추가]` — `Button variant="outline" size="sm"`

**목록 컨테이너**: `rounded-xl border border-gray-200 bg-white divide-y divide-gray-100`

**옵션 행 구성** (좌 → 우):

| 요소 | 컴포넌트 | 스타일 |
|------|---------|--------|
| 라벨 | `span` | `text-sm font-medium text-gray-900 flex-1` |
| 유형 배지 | `Badge` | FULL: `bg-blue-10 text-blue-60 "풀참석"` / PARTIAL: `bg-purple-10 text-purple-60 "옵션참여"` |
| 선택 인원 | `span` | `text-sm text-gray-500 w-12 text-right` — `"N명"` |
| [삭제] | `Button variant="ghost" size="sm"` | `text-red-600 hover:bg-red-50 hover:text-red-700` |

행 레이아웃: `flex items-center gap-3 px-4 py-3`

**인라인 추가 폼** (`[+ 옵션 추가]` 클릭 시 목록 하단에 행으로 노출):

| 필드 | 컴포넌트 | 비고 |
|------|---------|------|
| 라벨 | `InputField` | placeholder `"옵션 라벨"`, 최대 20자, `flex-1` |
| 유형 | `Select` | 풀참석(FULL) / 옵션참여(PARTIAL) |
| [확인] | `Button variant="default" size="sm"` | 저장 |
| [×] | `Button variant="ghost" size="sm"` | 인라인 폼 닫기, 취소 |

폼 행 레이아웃: `flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200`

**삭제 처리**: BE에서 등록자 연결 시 에러 반환. FE는 에러 응답 수신 후 Toast로 처리.

| 조건 | [삭제] 버튼 | UI |
|------|------------|-----|
| 삭제 가능 | 활성 | `text-red-600` |
| BE 에러 응답 (연결 등록자 존재) | — | Toast(error) `"이 옵션을 선택한 등록자가 있어 삭제할 수 없습니다."` |

> **참고**: 사전 disabled 처리(`selectedCount` 기반)는 현재 미구현. BE 에러에 의존하는 방식으로 동작.

**빈 상태** (`attendanceOptions.length === 0`):

```
[CalendarDays 아이콘, text-gray-300]
"아직 추가된 참석 옵션이 없습니다."
[+ 첫 번째 옵션 추가] 버튼 (CTA, variant="outline")
```

**상태 정의**

| 상태 | 조건 | UI |
|------|------|----|
| 빈 상태 | 옵션 0개 | 빈 상태 UI + CTA |
| 목록 | 옵션 1개 이상 | 옵션 행 목록 |
| 추가 폼 열림 | `[+ 옵션 추가]` 클릭 | 목록 하단 인라인 폼 행 노출 |
| 추가 중 | `[확인]` 클릭 후 API 대기 | `[확인]` 버튼 `loading`, 인풋 `disabled` |
| 추가 성공 | 201 응답 | 인라인 폼 닫힘 + 목록 갱신 + Toast `"옵션이 추가되었습니다."` |
| 추가 실패 | API 오류 | Toast `"옵션 추가에 실패했습니다. 다시 시도해주세요."` |
| 삭제 중 | `[삭제]` 클릭 후 API 대기 | 해당 행 `opacity-50 pointer-events-none` |
| 삭제 성공 | 204 응답 | 목록에서 행 제거 + Toast `"옵션이 삭제되었습니다."` |
| 삭제 실패 — 등록자 연결 | BE 409/400 에러 | Toast(error) `"이 옵션을 선택한 등록자가 있어 삭제할 수 없습니다."` |
| 삭제 실패 — 기타 | API 오류 | Toast `"옵션 삭제에 실패했습니다. 다시 시도해주세요."` |

**유효성 검증** (인라인 추가 폼):
- 라벨 비어있으면: `[확인]` disabled
- 유형 미선택 시: `[확인]` disabled

---

### 2-2-B. 폼 필드 관리 섹션 (FR-7-B) — 인라인 WYSIWYG

**위치**: 등록 현황 요약 카드 위. ADMIN 권한만 노출.

**UI 방식**: Google Forms 스타일 인라인 WYSIWYG — 각 필드가 독립 카드로 표시되며 프리뷰와 설정을 겸용. 별도 모달 없음.

**sticky 툴바** (섹션 최상단, 스크롤 시 고정):

```
┌──────────────────────────────────────────────────────────────┐
│  ● 저장되지 않은 변경 사항이 있습니다.   [미리보기]  [저장]  │
└──────────────────────────────────────────────────────────────┘
```

- 미저장 인디케이터: `● text-warning-70 text-sm`
- 변경 없을 때: 인디케이터 숨김, 버튼 [저장] disabled
- [미리보기]: `variant="outline"` — 신청 폼 미리보기 (새 탭 또는 모달)
- [저장]: `variant="default"` — 명시적 저장 (자동 저장 없음)

**레이아웃**

```
┌─ 폼 필드 관리 ──────────────────────────────────────────────┐
│  [sticky 툴바: 미저장 인디케이터 | 미리보기 | 저장]          │
│                                                              │
│  ┌─ 필드 카드 (미확장 / 프리뷰) ──────────────────────────┐  │
│  │  ⠿  [단문] 군 복무 부대명  *필수          [펼치기▾]    │  │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ 필드 카드 (확장 / 편집 활성, 파란 좌측 보더) ─────────┐  │
│  │  ⠿  라벨: [_______________]  유형: [선택▾]              │  │
│  │     힌트: [_______________]                              │  │
│  │     선택지: [목저 출발×] [금저 출발×]  [+ 추가]         │  │
│  │     [☑ 등록 시 필수 입력]                      [삭제]   │  │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ 점선 추가 카드 ────────────────────────────────────────┐  │
│  │  [+ 필드 추가]                                           │  │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**필드 카드 상태**

| 상태 | 트리거 | 스타일 |
|------|--------|--------|
| 미확장 (프리뷰) | 기본 | `bg-white border border-gray-200 rounded-xl` |
| 확장 (편집 활성) | 카드 클릭 또는 [펼치기▾] | 좌측 파란 보더 `border-l-2 border-blue-60` + 연한 파란 배경 |
| 고정 필드 | `isSystemField === true` | 편집/삭제 불가, `opacity-60`, 잠금 아이콘 |

**미확장 카드 구성** (좌 → 우):
1. 드래그 핸들 (`⠿` 아이콘, `cursor-grab`)
2. 타입 뱃지 (`Badge variant="outline"`, 예: `단문`, `선택`)
3. 라벨 텍스트 (`font-medium`)
4. 필수 여부 (`*필수` warning 색상 / 회색 `선택`)
5. [펼치기▾] 버튼

**확장 카드 내부 편집 영역**:
- 라벨 입력: `InputField`, placeholder `"필드 이름을 입력하세요"`
- 필드 유형 Select: 6종
- 힌트(Placeholder) 입력: `InputField` — SELECT/BOOLEAN/DATE 타입 시 숨김
- 선택지 편집 (SELECT 타입 전용): 칩 기반 태그 입력 (Enter/쉼표로 추가, [×]로 제거)
- 필수 여부 체크박스: `"등록 시 필수 입력"`
- [삭제] 버튼: `variant="ghost"` destructive 색상

**필드 타입 Select 옵션 매핑**

| 표시 라벨 | 값 |
|-----------|-----|
| 단문 텍스트 | TEXT |
| 장문 텍스트 | TEXTAREA |
| 숫자 | NUMBER |
| 예/아니오 | BOOLEAN |
| 선택 | SELECT |
| 날짜 | DATE |

**드래그 순서 변경**:
- 핸들 드래그 (확장/미확장 모두 가능)
- 드래그 중 카드: `opacity-50 scale-[1.02]`
- 순서 변경은 로컬 상태에만 반영, sticky 툴바 [저장] 시 일괄 반영

**빈 상태** (`formFields.length === 0`):
```
🗂 아이콘
"아직 추가된 커스텀 필드가 없습니다."
[+ 필드 추가] 버튼 (CTA)
```

**상태 정의**

| 상태 | 조건 | UI |
|------|------|----|
| 빈 상태 | `formFields.length === 0` | 빈 상태 UI + CTA |
| 목록 | `formFields.length > 0` | 카드 목록 |
| 미저장 변경 | 편집 후 미저장 | sticky 툴바 경고 인디케이터 + [저장] 활성 |
| 드래그 중 | 드래그 핸들 활성 | 드래그 중인 카드 `opacity-50 scale-[1.02]` |
| 답변 있는 필드 삭제 시도 | `hasAnswers === true` + [삭제] 클릭 | `DeleteFieldConfirmModal` 노출 (답변 보존 안내) → 확인 시 삭제 진행 |
| 저장 중 | [저장] 클릭 후 API 응답 대기 | [저장] 버튼 `loading`, 카드 `pointer-events-none` |
| 저장 성공 | 200 응답 | 미저장 인디케이터 사라짐 + Toast `"저장되었습니다."` |
| 저장 실패 | API 오류 | Toast `"저장에 실패했습니다. 다시 시도해주세요."` |

---

### 2-3. 등록 현황 요약 카드 (FR-1)

**레이아웃** (카드 내부 3열 그리드)

```
┌────────────────────────────────────────────────────────────┐
│  등록 현황                                                  │
│                                                            │
│  ┌──────────────────┐ ┌───────────┐ ┌───────────────────┐  │
│  │ 23 / 50명        │ │ 납부완료  │ │ 풀참석    옵션참여│  │
│  │ [====    ] 46%   │ │ 18명      │ │ 15명      8명     │  │
│  │                  │ │ 미납 5명  │ │                   │  │
│  └──────────────────┘ └───────────┘ └───────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**각 수치 항목 구성**:
- 레이블: `text-xs text-gray-400`
- 수치: `text-2xl font-bold text-gray-900`
- 보조 수치: `text-sm text-gray-500`

**프로그레스 바**:
- 컨테이너: `h-2 bg-gray-100 rounded-full`
- 채워진 부분: `h-2 bg-gray-800 rounded-full transition-all`
- 달성률 계산: `(currentCount / maximumParticipantCount) * 100`

**데이터 소스**: `GET /participations/enrollment-summary/:missionaryId`
(participations 하위 경로. 순환 의존성 방지를 위해 missionaries 하위가 아님)

**상태 정의**

| 상태 | 조건 | UI 변화 |
|------|------|--------|
| 정원 미설정 | `maximumParticipantCount === null` | "총 23명" (분수 없이), 프로그레스 바 숨김 |
| 정원 초과 | `currentCount > maximumParticipantCount` | 등록자 수 수치 `text-warning-70` + 경고 뱃지 "정원 초과" |
| 로딩 | API 응답 대기 | 각 수치 위치에 `w-16 h-6 animate-pulse bg-gray-100 rounded` skeleton |

---

### 2-4. 도구 모음

**레이아웃** (좌 → 우):

```
[납부여부▾]  [참석일정▾]  [___이름 검색___]     [납부 승인]  [↓ CSV]
```

**납부여부 필터**: `Select` 컴포넌트
- 전체 (default)
- 납부완료
- 미납

**참석일정 필터**: `Select` 컴포넌트
- 전체 (default)
- 풀참석
- 옵션참여

**이름 검색**: `SearchBox` 컴포넌트 (클라이언트 사이드)
- placeholder: `"이름으로 검색"`

**납부 승인 버튼**:
- 체크박스 미선택 시: `Button` `variant="outline"` disabled 상태
- 1명 이상 선택 시: `Button` `variant="default"` 활성화
- 버튼 레이블: `"납부 승인 (N명)"` — 선택된 수 동적 표시

> STAFF 역할에서는 납부 승인 버튼 미노출

**CSV 다운로드 버튼**: `Button variant="outline"`, 다운로드 아이콘

---

### 2-5. 등록자 테이블 (FR-2, FR-3)

**컴포넌트**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` (design-system)

**컬럼 정의**

| # | 컬럼명 | 데이터 | 너비 | 비고 |
|---|--------|--------|------|------|
| 0 | (체크박스) | 다중선택 | 44px | ADMIN만 표시 |
| 1 | 등록일시 | `createdAt` | 140px | `YYYY.MM.DD HH:mm` 포맷 |
| 2 | 이름 | `name` | 100px | font-medium |
| 3 | 생년월일 | `birthDate` | 110px | |
| 4 | 소속 | `affiliation` | 120px | |
| 5 | 참석 일정 | `attendanceOption?.label` | 110px | nullable — 미선택 시 `"—"` (em dash) 표시 |
| 6 | 기수 | `cohort` | 70px | `N기` 포맷 |
| 7 | 납부 여부 | `isPaid` | 90px | Badge + 클릭 토글 (ADMIN) |
| 8 | 팀 | `team.teamName` | 90px | "미배정" 표시 (미배정 시), 읽기 전용, 회색 텍스트 |
| 9+ | 커스텀 필드 | `formAnswers` | 100px each | 동적 렌더링 |

**커스텀 필드 컬럼 렌더링 정책**:
- 고정 컬럼(체크박스 포함) 9개 + 커스텀 컬럼 최대 3개 = 총 12개 기준
- 커스텀 필드가 4개 초과 시 초과분은 테이블 미노출, 상세 패널에서만 확인 가능
- 테이블에 노출된 커스텀 컬럼은 `min-w-[100px]` 적용하여 가로 스크롤 허용
- 테이블 컨테이너: `overflow-x-auto`

**납부 여부 셀 (FR-3)**:

| 역할 | UI | 동작 |
|------|----|----|
| ADMIN | `Badge` 클릭 가능 (`cursor-pointer`) | 클릭 → 낙관적 업데이트 → PATCH API |
| STAFF | `Badge` (클릭 불가) | 읽기 전용 |

Badge 스타일:
- 납부완료: `Badge variant="success"` — "납부완료"
- 미납: `Badge variant="warning"` — "미납"

토글 중 로딩: 해당 셀 `opacity-50 pointer-events-none`

**행 스타일**:
- hover: `hover:bg-gray-50 cursor-pointer`
- 선택됨: `bg-blue-10`

**체크박스 헤더**: 전체 선택/해제 토글 (현재 페이지 기준)

**상태 정의**

| 상태 | 조건 | UI |
|------|------|----|
| 로딩 | API 응답 대기 | `TableSkeleton` (기존 컴포넌트 활용) |
| 빈 상태 — 등록자 없음 | 전체 목록 0건 | `TableEmptyState`: Users 아이콘 + "아직 등록된 참가자가 없습니다." |
| 빈 상태 — 검색 결과 없음 | 필터/검색 후 0건 | `TableEmptyState`: 검색 아이콘 + "검색 결과가 없습니다." + [초기화] 버튼 |
| 에러 | API 실패 | `TableEmptyState`: AlertCircle 아이콘 + "데이터를 불러오지 못했습니다." + [다시 시도] 버튼 |

---

### 2-6. 페이지네이션

**컴포넌트**: `Pagination` (design-system)

- 페이지 크기: 20건
- 서버 사이드 limit/offset
- 필터/검색 변경 시 1페이지로 리셋

---

### 2-7. SidePanel 공통 컴포넌트 & 등록자 상세/수정 패널 (FR-5)

#### 2-7-A. SidePanel 공통 컴포넌트

**위치**: `@samilhero/design-system` 또는 `src/components/ui/side-panel.tsx`

**개요**: 유저 관리(`UserEditPanel`)와 등록자 상세(`ParticipantPanel`)에서 동일한 구조를 사용하는 슬라이드 오버 패턴을 공통 컴포넌트로 추출. 헤더(닫기 + 타이틀 + 네비게이션)·스크롤 본문·선택적 푸터·선택적 액션 바로 구성.

**공통 레이아웃 구조**

```
┌──────────────────────────────────────────────────┐
│ [←]  타이틀 [배지]               [▲] [▼] [⋯]   │  헤더 (shrink-0)
│      서브타이틀 (선택)                            │
├──────────────────────────────────────────────────┤  ← actionBar (선택)
│  빠른 액션 바                                    │
├──────────────────────────────────────────────────┤
│  본문 (flex-1 overflow-y-auto)                  │
├──────────────────────────────────────────────────┤  ← footer (선택)
│                       [취소]  [저장]             │
└──────────────────────────────────────────────────┘
```

**컨테이너 스타일**

```
fixed right-0 top-0 h-full w-[560px] z-30
transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
shadow-[-4px_0_24px_rgba(0,0,0,0.08),-1px_0_4px_rgba(0,0,0,0.04)]
```

**Props 인터페이스**

```typescript
interface SidePanelProps {
  // 표시 제어
  open: boolean
  onClose: () => void

  // 헤더
  title: string               // 이름, 상세 제목 등
  subtitle?: string           // 서브텍스트 (신청일·선교명, 이메일 등)
  badge?: ReactNode           // 상태 배지 (납부 여부, 유저 역할 등)

  // 항목 네비게이션 (없으면 해당 버튼 disabled)
  onPrev?: () => void         // ChevronUp — 이전 항목
  onNext?: () => void         // ChevronDown — 다음 항목

  // 더보기 메뉴 (없으면 Ellipsis 버튼 미노출)
  menuItems?: SidePanelMenuItem[]

  // 빠른 액션 바 (헤더 ~ 본문 사이, 선택적)
  actionBar?: ReactNode

  // 본문
  children: ReactNode

  // 저장/취소 (없으면 푸터 미렌더링)
  onSave?: () => void
  onCancel?: () => void
  saveLabel?: string          // 기본값: "저장"
  cancelLabel?: string        // 기본값: "취소"
  saveLoading?: boolean
  saveDisabled?: boolean
}

interface SidePanelMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}
```

**현재 사용처**

| 컴포넌트 | title | subtitle | badge | actionBar | 비고 |
|---------|-------|----------|-------|-----------|------|
| `UserEditPanel` | 유저 이름 | 이메일 (선택) | 역할 배지 | 없음 | 유저 관리 |
| `ParticipantPanel` | 등록자 이름 | 신청일 · 선교명 | 납부 배지 | 납부 여부 토글 (FR-3, ADMIN) | 등록 관리 |

---

#### 2-7-B. 등록자 상세/수정 패널 (FR-5) — ParticipantPanel

**패턴**: `SidePanel` 공통 컴포넌트 사용 (§2-7-A)

**레이아웃**

```
┌──────────────────────────────────────────────────┐
│ [←]  이름  [납부 배지]          [▲] [▼] [⋯]    │  ← 헤더 (sticky)
│      신청일 · 선교명                              │
├──────────────────────────────────────────────────┤
│  납부 여부           미납  [toggle]               │  ← 빠른 토글 바 (FR-3, ADMIN 전용)
│  클릭하면 즉시 반영됩니다                          │
├──────────────────────────────────────────────────┤
│  [흰 배경] 참석 정보  ← 편집 가능 섹션           │
│  소속         [____________]                     │
│  참석 일정    [Select▾     ]                     │
│  기수         [____________]                     │
│  과거 참여    [Switch] 예 / 아니오                │
│  대학생 여부  [Switch] 예 / 아니오                │
├──────────────────────────────────────────────────┤
│  [회색 배경] 🔒 개인 정보  ← 읽기 전용 섹션      │
│  이름         홍길동          (readonly)         │
│  생년월일     2000.01.01      (readonly)         │
├──────────────────────────────────────────────────┤
│  [회색 배경] 🔒 기본 정보  ← 읽기 전용 섹션      │
│  등록일시    2026.03.25 14:30  (readonly)        │
│  신청 선교   35차 군선교        (readonly)        │
│  소속 팀     1팀 / 미배정       (readonly)        │
├──────────────────────────────────────────────────┤
│  [회색 배경] 🔒 추가 신청 정보  ← 읽기 전용 섹션 │
│  주소지       [____________]   (TEXT)            │
│  군필 여부    [Switch]         (BOOLEAN)         │
│  목저 여부    [Select▾     ]   (SELECT)          │
│  방문 날짜    [DatePicker  ]   (DATE)            │
├──────────────────────────────────────────────────┤
│                       [취소]  [저장]             │  ← 푸터 (sticky)
└──────────────────────────────────────────────────┘
```

> **섹션 순서 원칙**: 편집 가능 섹션(흰 배경)을 먼저, 읽기 전용 섹션(회색 배경 + 🔒 아이콘)을 나중에 배치하여 사용자가 수정 가능한 영역을 즉시 파악할 수 있게 한다.

> **납부 여부**: 별도 섹션 없이 헤더 하단의 빠른 토글 바(FR-3)에서 단독 처리. 본문 내 중복 표시 없음.

**패널 사이즈**: `w-[560px]` (고정) — `SidePanel` 기본 너비와 동일, 오른쪽에서 슬라이드인

**헤더 구조** (유저 관리 `UserEditPanel` 패턴 동일 적용):

```
컨테이너: flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3
```

| 영역 | 내용 |
|------|------|
| 좌측 | `ArrowRightFromLine`(18px) 닫기 버튼 + 이름(`text-sm font-semibold text-gray-900`) + 납부 배지 + 서브텍스트(신청일 · 선교명, `text-xs text-gray-400`) |
| 우측 | `ChevronUp`(이전 등록자) + `ChevronDown`(다음 등록자) + `Ellipsis`(더보기) |

버튼 공통 스타일:
```
flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800
```

이전/다음 버튼 비활성 조건:
- 목록 첫 번째 항목: `ChevronUp` → `disabled:opacity-30 disabled:pointer-events-none`
- 목록 마지막 항목: `ChevronDown` → `disabled:opacity-30 disabled:pointer-events-none`

**섹션 시각적 구분**

| 섹션 유형 | 배경 | 헤더 |
|----------|------|------|
| 편집 가능 | `bg-white` | `text-xs font-semibold text-gray-600 uppercase tracking-wider` |
| 읽기 전용 | `bg-gray-50` | 🔒 아이콘(11px) + 동일 헤더 스타일 |

- 읽기 전용 필드: `InputField readOnly` (회색 배경 `bg-gray-50`, 텍스트 `text-gray-500`)
- 🔒 아이콘: `Lock` SVG, `width=11 height=11 stroke-width=2.5 text-gray-400`

**역할별 동작**

| 역할 | 모든 입력 필드 | 저장 버튼 |
|------|--------------|----------|
| ADMIN | 편집 가능 섹션 편집 가능 | 노출 |
| STAFF | 전체 읽기 전용 (`readOnly`) | 미노출 |

**커스텀 필드 렌더링** (fieldType별):

| fieldType | 컴포넌트 | 비고 |
|-----------|----------|------|
| TEXT | `InputField` | |
| TEXTAREA | `TextareaField` | |
| NUMBER | `InputField type="number"` | |
| BOOLEAN | `Switch` | label: 예 / 아니오 |
| SELECT | `Select` | `options` 배열로 선택지 |
| DATE | `DatePicker` | ISO 8601 직렬화 |

**미답변 필드**: 빈 값으로 표시 + 필드 아래 `text-xs text-gray-400 "미입력"` 레이블

**이탈 방지 (Dirty Guard)**:
- 수정 후 닫기(X) 또는 외부 클릭 시 확인 모달 노출
- 모달 문구: `"저장하지 않은 변경사항이 있습니다. 정말 닫으시겠어요?"`
- 버튼: `[계속 수정]` (primary) / `[닫기]` (outline destructive)

**상태 정의**

| 상태 | 조건 | UI |
|------|------|----|
| 로딩 | 상세 API 응답 대기 | 각 필드 위치에 skeleton |
| 저장 중 | PATCH 요청 중 | 저장 버튼 `loading` 상태, 입력 필드 disabled |
| 저장 성공 | 200 응답 | Toast "저장되었습니다." + 목록 자동 갱신 |
| 저장 실패 | API 오류 | Toast "저장에 실패했습니다. 다시 시도해주세요." |

---

### 2-8. 납부 일괄 승인 확인 모달 (FR-4)

```
┌──────────────────────────────────────────────────┐
│  납부 일괄 승인                          [X]      │
├──────────────────────────────────────────────────┤
│                                                  │
│  N명의 납부를 승인합니다.                        │
│  이 작업은 되돌릴 수 없습니다.                   │
│                                                  │
├──────────────────────────────────────────────────┤
│                       [취소]  [승인]             │
└──────────────────────────────────────────────────┘
```

**ADMIN 전용** — STAFF 역할에서는 납부 승인 버튼 자체가 미노출

---

## 3. 인터랙션 정의

### 3-1. 납부 여부 인라인 토글 (FR-3)

```
사용자: 납부 배지 클릭
  → 해당 셀 opacity-50 + pointer-events-none (로딩 표시)
  → PATCH /participations/:id { isPaid: !currentValue } 호출

성공 시:
  → 배지 상태 즉시 전환 (낙관적 업데이트)
  → 현황 요약 카드 자동 갱신

실패 시:
  → 배지 원래 상태로 복구
  → Toast(error): "납부 상태 변경에 실패했습니다."
```

### 3-2. 납부 일괄 승인 (FR-4)

```
사용자: 체크박스로 N명 선택
  → 도구 모음 "납부 승인 (N명)" 버튼 활성화

사용자: 납부 승인 버튼 클릭
  → 확인 모달 노출

사용자: 모달 [승인] 클릭
  → PUT /participations/approve 호출
  → 모달 닫힘 + 목록 갱신 + 현황 카드 갱신
  → Toast(success): "N명의 납부가 승인되었습니다."

실패 시:
  → Toast(error): "납부 승인에 실패했습니다. 다시 시도해주세요."
```

### 3-3. 필터 & 검색 인터랙션

```
납부여부/참석일정 필터 변경:
  → 서버 API 재호출 (query param 변경)
  → 페이지 1로 리셋
  → 현황 카드는 갱신하지 않음 (전체 기준 유지)

이름 검색:
  → 클라이언트 사이드 필터링 (debounce 300ms)
  → 페이지 1로 리셋

검색 초기화:
  → 검색어 지우기 → 전체 목록 복원
```

### 3-4. 드래그로 필드 순서 변경 (FR-7-B)

```
사용자: 드래그 핸들(⠿) 마우스다운
  → cursor: grabbing
  → 드래그 중인 카드 opacity-50 scale-[1.02]

사용자: 드롭
  → 로컬 상태 순서 즉시 업데이트 (UI만 반영)
  → sticky 툴바 미저장 인디케이터 활성화

사용자: sticky 툴바 [저장] 클릭
  → PATCH /missionaries/:id/form-fields/reorder 호출 (변경된 순서 배열 일괄 전송)
  → 성공: 인디케이터 사라짐 + Toast(success): "저장되었습니다."
  → 실패: Toast(error): "저장에 실패했습니다. 다시 시도해주세요."
```

### 3-5. 슬라이드 오버 패널 열기/닫기

```
열기:
  → 테이블 행 클릭 (체크박스 영역 제외)
  → 패널이 오른쪽에서 280ms ease-out 슬라이드인
  → 배경에 dim(overlay, opacity-30)

닫기:
  → [X] 버튼 클릭 또는 dim 영역 클릭 또는 Esc 키
  → Dirty 상태라면 이탈 방지 모달 먼저 노출
  → 280ms ease-in 슬라이드아웃
```

---

## 4. Form Builder UI 흐름

### 4-1. 필드 추가 흐름

```
[+ 필드 추가] 클릭
  → 필드 추가 모달 열림

사용자: 필드 유형 선택
  - SELECT 선택 시 → 선택지 입력 영역 노출 (conditional reveal)

사용자: 라벨, 힌트, 필수 여부 입력

SELECT 타입이면: 선택지 1개 이상 입력

[추가하기] 클릭
  → 클라이언트 유효성 검증
    - 라벨 비어있으면: "라벨을 입력해주세요."
    - SELECT이고 options 없으면: "선택지를 1개 이상 입력해주세요."

  → POST /missionaries/:id/form-fields 호출
  → 성공: 모달 닫힘 + 필드 목록 갱신 + 등록자 테이블 컬럼 갱신
  → 실패: Toast(error) "필드 추가에 실패했습니다."
```

### 4-2. 필드 수정 흐름

```
[수정] 아이콘 클릭
  → 수정 모달 열림 (기존 값 pre-fill)

사용자: 수정 후 [수정하기] 클릭
  → PATCH /missionaries/:id/form-fields/:fieldId 호출
  → 성공: 모달 닫힘 + 목록 갱신
  → 실패: Toast(error)
```

### 4-3. 필드 삭제 흐름

> **확정 정책 (PO B안)**: 답변이 있는 필드도 삭제 가능. 삭제 시 필드는 목록에서 숨겨지고 기존 답변은 보존됨. 삭제 전 확인 모달로 사용자에게 안내.

```
[삭제] 버튼 클릭 (hasAnswers === false)
  → DELETE /missionaries/:id/form-fields/:fieldId 호출
  → 성공: 목록에서 제거
  → 실패: Toast(error) "필드 삭제에 실패했습니다."

[삭제] 버튼 클릭 (hasAnswers === true)
  → DeleteFieldConfirmModal 노출:
    "이 필드에 입력된 답변이 있습니다.
     삭제하면 목록에서 숨겨지지만 기존 답변은 보존됩니다.
     계속하시겠습니까?"
    [취소] [삭제]

  [삭제] 확인
    → DELETE /missionaries/:id/form-fields/:fieldId 호출
    → 성공: 모달 닫힘 + 목록에서 제거
    → 실패: Toast(error) "필드 삭제에 실패했습니다."
```

**[삭제] 버튼**: `Trash2` 아이콘, 항상 노출 (disabled 없음). 고정 필드(`isSystemField === true`)만 예외적으로 삭제 버튼 미노출.

---

## 5. 디자인 시스템 활용 가이드

### 5-1. 사용할 기존 컴포넌트

| 컴포넌트 | 사용처 |
|---------|--------|
| `Badge` | 납부 여부, 선교 상태, 카테고리, 필드 타입, 필수 여부 표시 |
| `Button` | 납부 승인, CSV 다운로드, 필드 추가, 저장/취소 |
| `IconButton` | 수정, 삭제 액션 |
| `Checkbox` | 등록자 다중 선택 |
| `Switch` | 납부 여부, BOOLEAN 커스텀 필드 입력 |
| `Select` | 납부 여부 필터, 참석 일정 필터, 필드 유형 선택, SELECT 타입 답변 |
| `SearchBox` | 이름 검색 |
| `InputField` | 라벨, TEXT/NUMBER 커스텀 필드 |
| `TextareaField` | TEXTAREA 커스텀 필드 |
| `DatePicker` | DATE 커스텀 필드 |
| `Chips` | SELECT 필드의 선택지 태그 입력 |
| `Tooltip` | 탭 비활성 사유, 삭제 불가 사유 |
| `Pagination` | 테이블 페이지네이션 |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | 등록자 테이블 |
| `TableEmptyState` | 빈 상태 / 에러 상태 (admin components) |
| `TableSkeleton` | 테이블 로딩 상태 (admin components) |
| `overlay` (overlay-kit) | 슬라이드 오버 패널, 확인 모달 |

### 5-2. 신규 구현 필요 컴포넌트

| 컴포넌트명 | 설명 | 위치 제안 |
|-----------|------|----------|
| `MissionEnrollmentCard` | 선교별 진입 카드 (카드 목록 화면) | `_components/` |
| `EnrollmentCardListPage` | 카드 목록 페이지 전체 (헤더 + 필터 + 그리드) | `app/(admin)/enrollment/` |
| `EnrollmentSummaryCard` | 등록 현황 요약 카드 전체 | `_components/` |
| `SummaryStatItem` | 카드 내 수치 항목 1개 | `_components/` (내부 사용) |
| `ProgressBar` | 정원 달성률 바 | `_components/` 또는 design-system 후보 |
| `ParticipantTable` | 등록자 테이블 + 커스텀 컬럼 동적 렌더링 | `_components/` |
| `PaymentBadge` | 납부 여부 토글 가능 배지 | `_components/` |
| `ParticipantDetailPanel` | 슬라이드 오버 상세/수정 패널 | `_components/` |
| `CustomFieldInput` | fieldType 분기 입력 컴포넌트 | `_components/` |
| `AttendanceOptionManager` | 참석 옵션 관리 섹션 전체 (목록 + 인라인 추가 폼) | `_components/` |
| `FormFieldManager` | 폼 필드 관리 섹션 전체 | `_components/` |
| `FormFieldRow` | 개별 필드 행 (드래그 핸들 포함) | `_components/` |
| `AddFormFieldModal` | 필드 추가/수정 모달 | `_components/` |
| `DeleteFieldConfirmModal` | 답변 있는 필드 삭제 확인 모달 (B안, `overlay.openAsync` 패턴) | `_components/` |
| `TagInput` | SELECT 타입 선택지 태그 입력 | `_components/` 또는 design-system 후보 |

### 5-3. 카드 컨테이너 스타일 (기존 패턴 준수)

```tsx
// 기존 MissionGroupDetail.tsx에서 확인된 카드 패턴
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip">
  {/* 카드 헤더 */}
  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 min-h-[61px]">
    <p className="text-[15px] font-semibold text-gray-900">섹션 제목</p>
  </div>
  {/* 카드 바디 */}
  <div className="p-5">...</div>
</div>
```

### 5-4. Toast 패턴

기존 에러/성공 피드백은 Toast를 사용한다. 프로젝트 내 Toast 구현체 확인 후 동일 방식 사용.

- 성공: `variant="success"` 또는 동등
- 실패: `variant="destructive"` 또는 동등

---

## 6. 접근성 (a11y)

| 항목 | 요구사항 |
|------|---------|
| 탭 비활성 | `aria-disabled="true"` + `tabIndex={-1}` |
| 납부 배지 토글 | `role="button"` + `aria-label="납부 완료로 변경"` / `"미납으로 변경"` |
| 체크박스 헤더 | `aria-label="전체 선택"` |
| 슬라이드 오버 | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` |
| 드래그 핸들 | `aria-label="순서 변경 핸들"` + 키보드 대체 수단 고려 |
| 커스텀 필드 입력 | `aria-required={isRequired}` + 필드별 `htmlFor` / `id` 연결 |
| 로딩 skeleton | `aria-busy="true"` + `aria-live="polite"` |

---

## 7. 엣지 케이스 처리 요약

| 케이스 | UI 처리 |
|--------|---------|
| 등록자 0명 | 빈 상태: "아직 등록된 참가자가 없습니다." + Users 아이콘 |
| 검색/필터 결과 0건 | 빈 상태: "검색 결과가 없습니다." + [초기화] 버튼 |
| 목록 로드 실패 | 에러 상태: "데이터를 불러오지 못했습니다." + [다시 시도] 버튼 |
| 정원 미설정 | 프로그레스 바 숨김, "총 N명"만 표시 |
| 정원 초과 | 등록자 수 `text-warning-70` + Badge "정원 초과" |
| 커스텀 필드 없음 | 빈 상태 + "아직 추가된 커스텀 필드가 없습니다." + [+ 필드 추가] CTA |
| 커스텀 필드 미답변 | 빈 입력 필드 + "미입력" 레이블 (`text-xs text-gray-400`) |
| SELECT 필드 options 없음 | 저장 시 "선택지를 1개 이상 입력해주세요." 검증 에러 |
| 패널 수정 중 닫기 | "저장하지 않은 변경사항이 있습니다." 확인 모달 |
| 답변 있는 필드 삭제 시도 | 삭제 버튼 disabled + Tooltip 안내 |
| 납부 토글 실패 | 낙관적 업데이트 롤백 + Toast(error) |

---

## 8. 미결 사항 (FE 구현 전 확인 필요)

| 항목 | 내용 | 담당 |
|------|------|------|
| 드래그 라이브러리 | `@dnd-kit/core` 또는 `react-beautiful-dnd` 선택 | FE |
| Toast 구현체 | 기존 프로젝트 내 Toast 패턴 확인 (없으면 신규 구현) | FE |
| 슬라이드 오버 구현 방식 | overlay-kit 내 Sheet 패턴 또는 직접 구현 | FE |
| 커스텀 컬럼 초과 처리 | 4개 초과 컬럼의 헤더에 "(상세 패널에서 확인)" 안내 문구 여부 | PO 확인 |
| 참석 옵션 순서 변경 | 드래그로 `order` 재정렬 기능 포함 여부 — FE PR #48은 추가/삭제만 구현 | FE·PO 확인 |
| FR-7-A 위치 | **확정**: 상단 (관리 섹션 — 요약 카드 위). design-spec §1-3·§2-2-A 그대로 유지 | ✅ 확정 |
| FR-7-A 유형 배지 라벨 | **확정**: `풀참석` / `옵션참여` — FR-1 통계 카드와 일관성 유지. FE 수정 필요 (`전체 참착/부분 참석` → `풀참석/옵션참여`) | ✅ 확정 |
| FormField reorder 엔드포인트 | **확정**: `PATCH /missionaries/:id/form-fields/reorder` — BE PR #47 커밋 `4713cd5` | ✅ 확정 |
| `hasAnswers` 계산 필드 | **확정**: FormField 삭제 B안 적용 — `hasAnswers === true` 시 확인 모달 표시 후 삭제 허용. BE 응답에 `hasAnswers` 필드 포함 필요. | ✅ 확정 |
| Enrollment Summary 엔드포인트 | **확정**: `GET /participations/enrollment-summary/:missionaryId` (participations 하위, 순환 의존성 방지) — BE PR #47 | ✅ 확정 |
