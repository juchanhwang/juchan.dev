# PRD: 등록 관리 페이지

| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.11 |
| 작성일 | 2026-03-25 |
| 작성자 | PO |
| 상태 | Complete |
| UI 명세 | `./ui-spec.md` |
| 대상 디바이스 | 데스크톱 전용 (1280px+) |

---

## 변경 이력

| 버전 | 변경 내용 |
|------|----------|
| v1.0 | 초안 — 등록자 목록 조회, 등록 현황, 입금 현황, 등록자 수정, Participation 스키마 확장 |
| v1.1 | `organization` → `affiliation`(필수) 변경; 기수 필수 필드로 변경 + 필드명 BE 협의 중; `attendanceType` 옵션참여 구체 선택지 BE 협의 중으로 유보; `Missionary.order`(차수)와 기수(유저 코호트) 개념 구분 명확화 |
| v1.2 | **Form Builder 도입** — `address` 고정 필드 제거 → 커스텀 필드로 전환; `MissionaryFormField`·`ParticipationFormAnswer` 신규 모델 추가; FR-7(폼 필드 관리) 신규; FR-2·FR-5 커스텀 필드 반영; "등록 폼 커스터마이징" Scope 밖 항목 제거 |
| v1.3 | **미결 항목 전체 확정** — `cohort` 필드명 확정; `FormFieldType` 6종 확정; 참석 일정 구조 B안(`MissionaryAttendanceOption`) 확정 → `Participation.attendanceType` enum 제거·`attendanceOptionId` FK 추가; `MissionaryAttendanceOption` 모델 신규; 협의 중 문구 전체 제거 |
| v1.4 | **진입 구조 전면 변경** — 선교 상세 탭 방식 폐기 → 독립 `/enrollment` 페이지 도입; FR-0 재정의(모집 중 카드 + 비모집 선교 테이블 두 섹션); 비모집 선교도 등록자 조회·CSV 접근 가능; 탭 관련 활성화 조건 제거 |
| v1.5 | **팀 관련 scope 확정** — 팀 관리 기능 이번 Scope 외부로 분리; FR-2 테이블에 팀 컬럼 추가; FR-5 슬라이드 패널에 팀 읽기 전용 표시 추가; Scope 밖 팀 관리 항목 상세화 |
| v1.6 | **FR-0 구조 확정** — Section A 카드 수 3개로 제한(마감 임박순); Section B 전체 선교 통합 테이블로 변경(상태 필터 칩 추가); 검색/필터 위치 테이블 내부 헤더로 변경; **FR-7-B** Google Forms 스타일 인라인 WYSIWYG으로 변경(모달 없음, sticky 툴바) |
| v1.7 | **기술 작업 추가** — `SidePanel` 공통 컴포넌트 추출 §6-2에 기재 (FR 번호 없음) |
| v1.8 | **BE API 확정 반영** — FR-7-B bulk reorder 엔드포인트 추가; FR-7-B 삭제 경고(hasAnswers) UX 추가; FR-1 데이터 소스를 별도 `enrollment-summary` 엔드포인트로 변경; §6-1 신규 API 3건 추가 |
| v1.9 | **구현 검토 사후 반영** — §7 설계 결정사항에 패널 이전/다음 네비게이션 추가; SSR 연동 Blocking 해제(클라이언트 사이드 hook으로 기능 동작 확인, SSR은 성능 최적화 목적으로 재분류) |
| v1.10 | **Enrollment Summary URL 확정** — `GET /missionaries/:id/enrollment-summary` → `GET /participations/enrollment-summary/:missionaryId` (BE 순환 의존성 방지 설계) |
| v1.11 | **FR-0 헤더 통계 사후 반영** — 목록 페이지 헤더에 "모집 중 N건 \| 총 신청 N명" 통계 표시 추가 (v3 목업 반영, `GET /missionaries` 클라이언트 집계) |
| v1.12 | **FR-7-A Scope 제외** — 참석 옵션 관리 UI를 등록 상세 페이지에서 제거. 참석 옵션 정보는 등록자 슬라이드 패널(FR-5)에서 읽기 전용 표시만 유지. BE API는 구현 상태로 유지. |

---

## 1. 문제 정의 (Problem Statement)

### 해결하려는 문제

35차 군선교 등록자 관리 화면이 없다. 현재 `Participation` 테이블에 등록 데이터가 존재하지만, 관리자가 이를 조회·수정할 수 있는 관리 UI가 없어 운영이 불가능한 상태다.

또한 군선교 운영에 필요한 추가 등록 정보(팀 소속, 참석 일정, 유저 기수, 과거 참여 여부, 대학생 여부, 주소지)가 현재 스키마에 없어 수집 자체가 불가능하다.

### 현재 상태 (As-Is)

- `Participation` 테이블: 기본 필드(이름, 생년월일, 신청비용, 납부여부, 주민번호, 자차여부)만 존재
- 백엔드 API는 구현되어 있으나 관리자 화면이 없음
- 군선교 운영에 필요한 팀 소속, 유저 기수, 참석 일정 등의 필드 누락
- 입금 확인, 정원 현황 파악 등 핵심 운영 업무를 시스템으로 처리 불가

### 목표 상태 (To-Be)

- 독립 등록 관리 페이지(`/enrollment`)에서 **모든 상태** 선교의 등록자를 관리
- 관리자(ADMIN/STAFF)가 특정 차수의 등록자를 목록으로 조회
- 총 등록자 수, 정원 대비 현황, 입금 현황을 한눈에 파악
- 등록자 정보 수정(납부 여부 포함)
- 군선교 운영에 필요한 추가 필드 수집
- 선교별 커스텀 폼 필드를 관리자가 동적으로 구성 (Form Builder)

---

## 2. 사용자 및 권한 (Users & Permissions)

| 역할 | 목록 조회 | 현황 조회 | 등록자 수정 | 납부 승인 | CSV 다운로드 | 폼 필드 관리 |
|------|:--------:|:--------:|:----------:|:--------:|:-----------:|:-----------:|
| ADMIN (관리자) | O | O | O | O | O | O |
| STAFF (스태프) | O | O | O | X | O | X |
| USER (일반) | — | — | — | — | — | — |

> 등록 관리 페이지 자체는 ADMIN/STAFF 전용이다. 일반 USER는 접근 불가.

---

## 3. 도메인 모델 (Data Model)

### 3-1. 용어 구분: 차수 vs 기수

이 두 개념은 완전히 다르며 혼동하지 않는다.

| 용어 | DB 위치 | 타입 | 의미 | 예시 |
|------|---------|------|------|------|
| **차수** (order) | `Missionary.order` | Int? | 선교 행사 회차. 몇 번째 군선교인지를 나타냄 | 35차 군선교 |
| **기수** (cohort) | `Participation.cohort` | Int | 참가자의 교회 내 기수. 나이대 가늠 용도 | 35기 |

---

### 3-2. Participation 스키마 변경

기존 필드는 유지하고, 군선교 운영에 필요한 필드를 추가한다.

#### 기존 필드 (변경 없음)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (UUID) | 고유 식별자 |
| name | String | 참가자 이름 |
| birthDate | String | 생년월일 |
| applyFee | Int? | 신청 비용 |
| isPaid | Boolean | 납부 여부 |
| identificationNumber | String? | 주민등록번호 (AES 암호화) |
| isOwnCar | Boolean | 자차 여부 |
| missionaryId | String | 연결된 선교 ID (FK) |
| userId | String | 신청 사용자 ID (FK) |
| teamId | String? | 배정 팀 ID (FK) |
| createdAt | DateTime | 등록 타임스탬프 (기존 존재) |

#### 신규 추가 필드

| 필드 | 타입 | 설명 | 필수 여부 | 비고 |
|------|------|------|:--------:|------|
| affiliation | String | 교회 내 팀 소속 (예: 6진 3팀) | **필수** | 구 `organization`에서 변경 |
| attendanceOptionId | String (UUID) | 참석 옵션 ID (FK → `MissionaryAttendanceOption`) | **필수** | v1.3: enum 방식 → FK 방식으로 전환 (§ 3-3 참조) |
| cohort | Int | 유저 기수 (예: 35기). 나이대 가늠 용도 | **필수** | |
| hasPastParticipation | Boolean? | 과거 참여 여부 | 선택 | |
| isCollegeStudent | Boolean? | 대학생 여부 | 선택 | |

> **v1.2 변경**: `address`(주소지) 고정 필드 제거. 주소지가 필요한 경우 Form Builder 커스텀 필드(§ 3-5)로 수집한다.
>
> **v1.3 변경**: `attendanceType: Enum` 제거 → `attendanceOptionId: String` FK로 교체. 참석 옵션은 선교별로 어드민이 직접 정의한다 (§ 3-3).

### 3-3. MissionaryAttendanceOption (참석 옵션 — v1.3 확정)

**확정 구조: B안** — 차수별 참석 옵션 설정 테이블.

어드민이 선교별로 참석 옵션을 정의한다. `AttendanceType`(FULL/PARTIAL)은 통계 집계용 기준 분류로 남기고, 실제 표시 라벨은 선교마다 다르게 설정할 수 있다.

#### MissionaryAttendanceOption 모델

| 필드 | 타입 | 설명 | 필수 |
|------|------|------|:----:|
| id | String (UUID) | 고유 식별자 | 자동 |
| missionaryId | String | 연결된 선교 ID (FK) | Y |
| type | AttendanceType | 기준 분류: `FULL`(풀참석) / `PARTIAL`(옵션참여). 통계 집계 기준 | Y |
| label | String | 표시 라벨 (예: "풀참석", "목저 출발", "금저 출발") | Y |
| order | Int | 표시 순서 | Y |

#### AttendanceType Enum (확정)

```prisma
enum AttendanceType {
  FULL      // 풀참석 — FR-1 현황 집계에서 "풀참석 인원"으로 카운트
  PARTIAL   // 옵션참여 — FR-1 현황 집계에서 "옵션참여 인원"으로 카운트
}
```

#### 운영 예시

| 선교 | 옵션 label | type |
|------|-----------|------|
| 35차 군선교 | 풀참석 | FULL |
| 35차 군선교 | 목저 출발 | PARTIAL |
| 35차 군선교 | 금저 출발 | PARTIAL |

#### 관리 시점
- 어드민이 선교 생성/수정 시 또는 등록 관리 페이지에서 참석 옵션을 구성
- 옵션은 등록 시작 전에 설정하는 것을 권장. 등록 중 추가는 가능하나 기존 등록자에게 소급 변경 불가.
- 참석 옵션 삭제: 해당 옵션을 선택한 등록자가 있으면 삭제 불가 (API에서 400 반환)

### 3-4. 관계

```
Missionary (차수) ──1:N──▶ Participation (등록)
Missionary (차수) ──1:N──▶ MissionaryAttendanceOption (참석 옵션)  ← 신규 (v1.3)
Missionary (차수) ──1:N──▶ MissionaryFormField (커스텀 폼 필드 정의)  ← 신규 (v1.2)
User ──1:N──▶ Participation
Team ──1:N──▶ Participation (optional)
MissionaryAttendanceOption ──1:N──▶ Participation (attendanceOptionId FK)  ← 신규 (v1.3)
Participation ──1:N──▶ ParticipationFormAnswer (커스텀 필드 답변)  ← 신규 (v1.2)
MissionaryFormField ──1:N──▶ ParticipationFormAnswer
```

---

### 3-5. Form Builder 신규 모델

#### MissionaryFormField (선교별 커스텀 폼 필드 정의)

어드민이 선교별로 동적으로 추가하는 커스텀 필드 정의.

| 필드 | 타입 | 설명 | 필수 |
|------|------|------|:----:|
| id | String (UUID) | 고유 식별자 | 자동 |
| missionaryId | String | 연결된 선교 ID (FK) | Y |
| fieldType | Enum | 필드 유형 | Y |
| label | String | 필드 라벨 (예: "주소지", "목저 출발 여부") | Y |
| placeholder | String? | 입력 힌트 | N |
| isRequired | Boolean | 등록 시 필수 여부 | Y |
| order | Int | 표시 순서 | Y |
| options | Json? | SELECT 유형의 선택지 목록 (예: `["목저 출발", "금저 출발"]`) | N |

**FormFieldType Enum (확정)**:

```prisma
enum FormFieldType {
  TEXT        // 단문 텍스트
  TEXTAREA    // 장문 텍스트
  NUMBER      // 숫자
  BOOLEAN     // 예/아니오 (체크박스)
  SELECT      // 단일 선택
  DATE        // 날짜
}
```

#### ParticipationFormAnswer (커스텀 필드 답변)

등록자가 커스텀 필드에 입력한 값.

| 필드 | 타입 | 설명 | 필수 |
|------|------|------|:----:|
| id | String (UUID) | 고유 식별자 | 자동 |
| participationId | String | 연결된 등록 ID (FK) | Y |
| formFieldId | String | 연결된 폼 필드 ID (FK) | Y |
| value | String | 직렬화된 답변값 (모든 타입을 String으로 저장) | Y |

> **설계 노트**: 모든 답변을 `String`으로 저장하고 `fieldType`에 따라 역직렬화한다. Boolean은 `"true"/"false"`, Number는 숫자 문자열, Date는 ISO 8601 문자열.

#### Form Builder 운영 규칙

| 규칙 | 내용 |
|------|------|
| 필드 추가 타이밍 | 등록 시작 전·후 언제든지 추가 가능 |
| 필드 삭제 | Soft delete — 삭제된 필드의 기존 답변은 보존 |
| 등록 후 필드 추가 | 기존 등록자는 해당 필드 답변이 없는 상태로 존재. 관리자가 상세 패널에서 직접 입력 가능 |
| 필드 순서 변경 | `order` 값으로 드래그 정렬 (이번 Scope) |

---

## 4. 기능 요구사항 (Functional Requirements)

### FR-0: 등록 관리 메인 페이지 (`/enrollment`)

등록 관리 페이지는 선교 상세 탭이 아닌 독립 페이지로 운영된다. 두 섹션으로 구성된다.

#### 페이지 헤더 통계 (v3 목업)

- **위치**: 페이지 상단 우측
- **표시 항목**: "모집 중 N건 | 총 신청 N명"
  - `모집 중 N건`: `status === 'ENROLLMENT_OPENED'` 선교 수
  - `총 신청 N명`: 모집 중 선교 전체 `currentParticipantCount` 합산
- **데이터 소스**: `GET /missionaries` 응답 클라이언트 집계 — 별도 API 없음

#### Section A — 모집 중 선교 (카드)

- **표시 조건**: `status === 'ENROLLMENT_OPENED'`인 선교
- **표시 수**: 모집 종료일 임박순 **최대 3개**
  - 0개: 카드 영역 없음(빈 상태 표시)
  - 1~2개: 해당 수만큼만 표시
  - 3개: 3개 표시
  - 4개 이상: 상위 3개만 카드, 나머지는 Section B 테이블에 포함
- **정렬 기준**: 모집 종료일 오름차순 (동일 종료일 시 등록률 낮은 순 보조 정렬)
- **카드 클릭**: `/enrollment/[missionaryId]` 이동 (등록자 목록, 현황 요약, CSV 등 전체 기능)
- **빈 상태**: "현재 모집 중인 선교가 없습니다." + [선교 관리로 이동 →] 링크 (`/missions`)

#### Section B — 전체 선교 통합 테이블

- **표시 조건**: 전체 선교 (모집 중 포함, Section A 표시 여부 무관). 모집 중 4개 이상인 경우 Section A에 미표시된 선교도 테이블에 포함
- **레이아웃**: 테이블 (선교명, 카테고리, 기간, 상태, 총 등록자 수, 납부 완료 수)
- **검색/필터**: 테이블 내부 헤더에 위치 (연계지 관리 패턴)
  - 상태 필터 칩: `[전체★] [모집 중] [모집 마감] [종료]` — 기본값: 전체
  - 선교명 검색: 테이블 헤더 내 검색 입력창
- **행 클릭**: `/enrollment/[missionaryId]` 이동
- **접근 가능 기능**: 등록자 목록 조회, 납부 여부 수정, 납부 일괄 승인(ADMIN), CSV 다운로드
- **빈 상태**: "선교가 없습니다." (필터 적용 시: "조건에 맞는 선교가 없습니다.")

### FR-1: 등록 현황 요약

- **설명**: 페이지 상단에 등록 현황 요약 카드를 표시한다.
- **사용자**: ADMIN, STAFF
- **표시 항목**:
  - 총 등록자 수 / 정원 (예: `23 / 50명`)
  - 정원 달성률 프로그레스 바
  - 납부 완료 인원 / 미납 인원
  - 풀참석 인원 / 옵션참여 인원
- **API**: `GET /participations/enrollment-summary/:missionaryId`
  - 응답: `{ totalParticipants, maxParticipants, paidCount, unpaidCount, fullAttendanceCount, partialAttendanceCount }`
  - 목록 조회(`GET /participations`)와 분리 — 요약 통계는 별도 집계 쿼리로 성능 최적화

### FR-2: 등록자 목록 조회

- **설명**: 특정 차수의 등록자 전체를 테이블로 표시한다.
- **사용자**: ADMIN, STAFF
- **필요 API**: `GET /participations?missionaryId=&isPaid=&query=` (기존 + 검색 파라미터 추가)
- **표시 컬럼**:
  - 등록일시 (createdAt)
  - 이름 (name)
  - 생년월일 (birthDate)
  - 소속 (affiliation)
  - 참석 일정 (`attendanceOption.label` 표시, type별 색상 구분)
  - 기수 (cohort)
  - 납부 여부 (isPaid: 뱃지)
  - **팀** (`participation.team.teamName` — 미배정 시 "미배정" 표시, 읽기 전용)
  - 커스텀 필드 컬럼 (선교별 `MissionaryFormField` 목록 기반으로 동적 렌더링)

  > **커스텀 컬럼 표시 정책**: 커스텀 필드가 많을 경우 테이블 가로 스크롤 허용. 테이블 컬럼은 최대 12개를 기준으로 하며, 초과 시 상세 패널에서만 확인 가능.
- **필터**:
  - 납부 여부: 전체 / 납부완료 / 미납
  - 참석 일정: 전체 / 풀참석(`FULL`) / 옵션참여(`PARTIAL`) — `attendanceOption.type` 기준
- **검색**: 이름(name) 기준 클라이언트 사이드 검색
- **정렬**: 등록일시 내림차순 기본 (최신 등록 먼저)
- **페이지네이션**: 페이지 크기 20건, 서버 사이드 `limit`/`offset`

### FR-3: 납부 여부 빠른 토글

- **설명**: 목록에서 납부 여부를 행 단위로 즉시 토글할 수 있다.
- **사용자**: ADMIN만
- **동작**: isPaid 뱃지 클릭 → 즉시 `PATCH /participations/:id` 호출 (낙관적 업데이트)
- **피드백**: 성공 시 뱃지 상태 변경 + 현황 요약 카드 자동 갱신. 실패 시 원상 복구 + 에러 Toast.

### FR-4: 납부 일괄 승인

- **설명**: 여러 등록자를 선택하여 납부 완료를 일괄 처리한다.
- **사용자**: ADMIN만
- **API**: `PUT /participations/approve` (기존 존재)
- **동작**: 체크박스 다중 선택 → "납부 승인" 버튼 활성화 → 확인 다이얼로그 → API 호출
- **확인 문구**: "N명의 납부를 승인합니다."

### FR-5: 등록자 상세 조회 및 수정

- **설명**: 등록자 행 클릭 시 상세 패널(슬라이드 오버)에서 정보를 확인·수정한다.
- **사용자**: ADMIN (수정), STAFF (조회만)
- **조회 API**: `GET /participations/:id`
- **수정 API**: `PATCH /participations/:id`
- **수정 가능 필드**:
  - 이름, 생년월일
  - 소속(affiliation), 참석 일정(attendanceOptionId — 해당 선교의 옵션 중 선택), 기수(cohort)
  - 과거 참여 여부, 대학생 여부
  - 납부 여부 (isPaid)
  - 커스텀 필드 답변 (`ParticipationFormAnswer`) — fieldType에 맞는 입력 컴포넌트로 렌더링
- **읽기 전용 필드**: 등록일시, 신청 선교, 신청자 계정 (userId), 팀 (`team.teamName` — 팀 배정 후 표시, 미배정 시 "미배정")
- **커스텀 필드 미답변 처리**: 등록 후 추가된 필드는 답변이 없음(null). 패널에서 빈 입력 필드로 표시하며 ADMIN이 직접 입력 가능.

### FR-6: CSV 다운로드

- **설명**: 현재 차수의 등록자 전체를 CSV로 다운로드한다.
- **사용자**: ADMIN, STAFF
- **API**: `GET /participations/download/:missionaryId` (기존 존재 — 신규 필드 컬럼 추가 필요)
- **포함 컬럼**: 등록일시, 이름, 생년월일, 소속(affiliation), 참석일정(attendanceOption.label), 기수(cohort), 납부여부, 과거참여, 대학생여부 + 커스텀 필드 컬럼(동적 추가)

### FR-7: 폼 필드 관리 (Form Builder)

등록 상세 페이지에 커스텀 폼 필드 관리(FR-7-B) 기능이 위치한다.

#### FR-7-A: 참석 옵션 관리 — ~~이번 Scope 제외~~ (v1.12)

> **v1.12 결정**: 참석 옵션 관리 UI를 등록 상세 페이지에서 제거한다.
> - 참석 옵션 정보(label)는 등록자 슬라이드 패널(FR-5)에서 읽기 전용으로만 표시한다.
> - BE API(`GET/POST/PATCH/DELETE /missionaries/:id/attendance-options`)는 구현 상태로 유지한다.
> - 참석 옵션 CRUD는 향후 선교 생성/수정 페이지 또는 별도 관리 화면에서 처리한다.

#### FR-7-B: 커스텀 폼 필드 관리

- **설명**: ADMIN이 선교별 커스텀 폼 필드를 동적으로 추가·삭제·순서 변경할 수 있다.
- **사용자**: ADMIN만
- **진입 경로**: `/enrollment/[missionaryId]` → 폼 필드 관리 섹션
- **UI 방식**: Google Forms 스타일 인라인 WYSIWYG
  - 각 필드가 독립 카드로 표시되며, 프리뷰와 설정을 겸용
  - 카드 클릭 시 인라인 확장 편집 (별도 모달 없음)
  - 미확장 상태: 필드 프리뷰 표시 (label, fieldType 뱃지, 필수 여부)
  - 확장 상태: label·placeholder 편집, isRequired 토글, options 목록 편집(SELECT 타입)
  - 드래그로 순서 변경 (확장 상태에서도 가능)
  - 상단 sticky 툴바: 미저장 변경 사항 표시("저장되지 않은 변경 사항이 있습니다") + [미리보기] + [저장] 버튼
  - 저장은 명시적 액션(툴바 [저장]) — 자동 저장 없음
- **API**:
  - `GET /missionaries/:id/form-fields` — 필드 목록 조회 (각 필드에 `hasAnswers: boolean` 포함)
  - `POST /missionaries/:id/form-fields` — 필드 추가
  - `PATCH /missionaries/:id/form-fields/:fieldId` — 필드 수정 (label, isRequired, order, options)
  - `PATCH /missionaries/:id/form-fields/reorder` — 필드 순서 일괄 변경 (body: `{ items: [{ id, order }] }`)
  - `DELETE /missionaries/:id/form-fields/:fieldId` — 필드 삭제 (Soft delete)
- **필드 속성**:
  - `fieldType` (TEXT / TEXTAREA / NUMBER / BOOLEAN / SELECT / DATE)
  - `label` (필수)
  - `placeholder` (선택)
  - `isRequired` (등록 시 필수 여부)
  - `options` (SELECT 타입 시 선택지 목록)
- **타이밍**: 선교 상태와 무관하게 언제든지 추가/삭제 가능
- **삭제 정책**: Soft delete. 삭제된 필드는 목록에서 숨겨지지만 기존 답변(`ParticipationFormAnswer`) 보존.
- **삭제 경고**: `hasAnswers === true`인 필드 삭제 시 확인 다이얼로그 표시. 문구: "이 필드에 입력된 답변이 있습니다. 삭제하면 목록에서 숨겨지지만 기존 답변은 보존됩니다. 계속하시겠습니까?"
- **피드백**: 저장 성공 시 툴바 미저장 상태 초기화 + 성공 Toast. 실패 시 에러 Toast.
- **엣지 케이스**:
  - 등록자 있는 상태에서 필드 추가: 허용. 기존 등록자는 미답변 상태로 표시.
  - 필수 필드 추가: 기존 등록자 소급 미적용. 신규 등록자에게만 필수.
  - 미저장 상태에서 페이지 이탈: "저장되지 않은 변경 사항이 있습니다. 나가시겠습니까?" 확인 다이얼로그.

---

## 5. 기술 스펙 (Technical Specs)

> 기술 구현 상세는 별도 문서를 참조한다.
>
> - 프론트엔드: `./fe-plan.md`
> - 백엔드: `./be-plan.md`

---

## 6. 영향 범위 (Impact Scope)

### 6-1. Backend 변경 범위

| 항목 | 변경 내용 |
|------|----------|
| Prisma 스키마 | `Participation` 5개 필드 추가(`address` 제거, `attendanceType` 제거 → `attendanceOptionId` FK 추가) + `AttendanceType`·`FormFieldType` enum + `MissionaryAttendanceOption`·`MissionaryFormField`·`ParticipationFormAnswer` 신규 모델 |
| DB 마이그레이션 | `participation` 컬럼 추가. 필수 3개(`affiliation`·`attendanceOptionId`·`cohort`) 기존 데이터 처리 방안 별도 협의 |
| CreateParticipationDto | `affiliation`, `attendanceOptionId`, `cohort` 필수; `hasPastParticipation`, `isCollegeStudent` 선택 추가 |
| UpdateParticipationDto | 신규 고정 필드 + 커스텀 답변(`answers: { formFieldId, value }[]`) partial 추가 |
| 신규 API — Attendance Options | `GET/POST/PATCH/DELETE /missionaries/:id/attendance-options` |
| 신규 API — Form Fields | `GET/POST/PATCH/DELETE /missionaries/:id/form-fields` |
| 신규 API — Form Answers | `PATCH /participations/:id/answers` (커스텀 필드 답변 일괄 저장) |
| 신규 API — Form Fields reorder | `PATCH /missionaries/:id/form-fields/reorder` (bulk 순서 변경, body: `{ items: [{ id, order }] }`) |
| 신규 API — Enrollment Summary | `GET /participations/enrollment-summary/:missionaryId` (응답: `{ totalParticipants, maxParticipants, paidCount, unpaidCount, fullAttendanceCount, partialAttendanceCount }`) |
| Form Fields 응답 확장 | `GET /missionaries/:id/form-fields` 각 필드에 `hasAnswers: boolean` 추가 (`ParticipationFormAnswer` count > 0 체크) |
| `GET /participations` | `query` 검색 파라미터 추가, 응답에 `formAnswers` 포함 |
| `GET /participations/download` | CSV 컬럼에 고정 신규 필드 + 커스텀 필드 동적 추가 |

### 6-2. Frontend 변경 범위

| 항목 | 변경 내용 |
|------|----------|
| 신규 페이지 | `/enrollment` (메인 — 모집 중 카드 + 비모집 테이블), `/enrollment/[missionaryId]` (선교별 등록 관리 상세) |
| API 클라이언트 | `participation.ts`, `formField.ts`, `attendanceOption.ts` 신규 생성 |
| 등록 관리 메인 페이지 컴포넌트 | 신규 — Section A(마감 임박순 최대 3개 카드), Section B(전체 선교 통합 테이블 + 상태 필터 칩 + 테이블 내부 검색) |
| 등록 현황 요약 컴포넌트 | 신규 |
| 등록자 테이블 컴포넌트 | 신규 (필터, 다중선택, 납부토글, **커스텀 필드 컬럼 동적 렌더링** 포함) |
| 등록자 상세/수정 패널 | 신규 (슬라이드 오버, **커스텀 필드 답변 표시/편집** 포함) |
| `SidePanel` 공통 컴포넌트 추출 | **기술 작업** — 기존 `UserEditPanel` 패널 래퍼를 공통 컴포넌트로 추출 → 등록 관리 슬라이드 오버에서 재사용 → 기존 `UserEditPanel`도 공통 컴포넌트로 교체(동작 보존). 구현 순서: FR-5 구현 → 공통 추출 → `UserEditPanel` 교체 |
| 폼 필드 관리 섹션 | 신규 (필드 추가/삭제/순서 변경 UI) |
| 사이드바/내비게이션 | "등록 관리" 메뉴 항목 추가 (`/enrollment` 링크) |
| SSR 연동 (성능 최적화) | `page.tsx`에서 `formFields`/`attendanceOptions` SSR fetch 추가 — `formField.server.ts`, `attendanceOption.server.ts` 생성 후 `Promise.all`에 포함. 클라이언트 hook으로 기능 동작 중이므로 Blocking 아님. BE PR #47 머지 후 연동 (작업 30분 이내). |

---

## 7. 화면 구성 (UI/UX)

> UI 상세 명세: `./ui-spec.md`

### 설계 결정사항

| 결정 | 내용 | 근거 |
|------|------|------|
| 진입 경로 | 독립 페이지 `/enrollment` | 탭 구조 폐기 — 모든 상태 선교 접근 필요 |
| 활성화 조건 | 상태 무관 — 전체 접근 가능 | 비모집 선교도 등록자 조회·CSV·납부 관리 필요 |
| 검색 방식 | 클라이언트 사이드 (이름 검색) | 한 차수 등록자 최대 수백 명 수준 |
| 납부 토글 | 행 인라인 토글 (즉시 반영) | 운영 중 빠른 납부 처리 필요 |
| 수정 폼 위치 | 슬라이드 오버 패널 | 목록 컨텍스트 유지하며 상세 편집 |
| 일괄 납부 승인 | 체크박스 다중 선택 | 여러 건 동시 처리 운영 효율화 |
| 패널 이전/다음 네비게이션 | 슬라이드 오버 패널 내 이전/다음 버튼 — 현재 페이지 참여자 목록 기준, 첫/마지막 항목 비활성, dirty 상태 이탈 시 UnsavedChangesModal 표시, URL searchParams(`participantId`) 기반(뒤로가기 호환) | FE 구현 중 추가 — users 도메인 UserEditPanel 동일 패턴 |
| 대상 디바이스 | 데스크톱 전용 (1280px+) | Admin 페이지 공통 정책 |

### 페이지 구성

```
/enrollment  ← 등록 관리 메인 페이지 (FR-0)
├── [Section A] 모집 중 선교 — 마감 임박순 최대 3개 카드
│   └── 카드 클릭 → /enrollment/[missionaryId]
└── [Section B] 전체 선교 통합 테이블 (상태 필터 칩 + 테이블 내부 검색)
    └── 행 클릭 → /enrollment/[missionaryId]

/enrollment/[missionaryId]  ← 선교별 등록 관리 상세
├── 관리 설정 섹션 (FR-7) ← ADMIN 전용
│   └── 커스텀 폼 필드 관리 (FR-7-B)
│       ├── 필드 카드 목록 (Google Forms 스타일 인라인 WYSIWYG, 드래그 순서 변경)
│       ├── [+ 필드 추가] 버튼
│       └── sticky 툴바: 미저장 상태 표시 + [미리보기] + [저장]
├── 등록 현황 요약 카드 (FR-1)
│   ├── 총 등록자 / 정원
│   ├── 납부완료 / 미납
│   └── 풀참석 / 옵션참여
├── 도구 모음
│   ├── 납부 여부 필터
│   ├── 참석 일정 필터
│   ├── 이름 검색
│   ├── [납부 승인] 버튼 (다중선택 시 활성)
│   └── [CSV 다운로드] 버튼
└── 등록자 테이블 (FR-2)
    ├── 고정 컬럼: 등록일시, 이름, 생년월일, 소속, 참석일정, 기수, 납부여부
    ├── 커스텀 필드 컬럼 (동적, 가로 스크롤)
    └── 행 클릭 → 슬라이드 오버 패널 (FR-5)
        ├── 고정 필드 표시/수정
        ├── 커스텀 필드 답변 표시/수정
        └── 이전/다음 네비게이션 (현재 페이지 목록 기준, URL searchParams 기반)
```

### 빈 상태 (Empty States)

- **등록자 없음**: "아직 등록된 참가자가 없습니다." + Users 아이콘
- **검색 결과 없음**: "검색 결과가 없습니다." + 검색어 초기화 버튼

### 에러 상태 (Error States)

- **목록 로드 실패**: "데이터를 불러오지 못했습니다." + [다시 시도] 버튼
- **수정/납부 승인 실패**: 에러 Toast (낙관적 업데이트 롤백 포함)

### 엣지 케이스 처리

- **이탈 방지**: 수정 패널 dirty 상태에서 닫기 시 "저장하지 않은 변경사항이 있습니다." 확인 모달
- **정원 초과**: 등록자 수가 `maximumParticipantCount` 초과 시 현황 카드에 경고 뱃지 표시
- **정원 미설정**: `maximumParticipantCount`가 null이면 정원 표시 없이 총 등록자 수만 표시
- **커스텀 필드 없음**: 폼 필드 관리 섹션에 빈 상태 UI — "아직 추가된 커스텀 필드가 없습니다." + [+ 필드 추가] CTA
- **커스텀 필드 미답변**: 등록 후 추가된 필드는 상세 패널에서 빈 값으로 표시 ("미입력" 레이블)
- **SELECT 필드 옵션 없음**: options 빈 배열인 SELECT 필드 저장 시 "선택지를 1개 이상 입력해주세요." 검증 에러

---

## 8. Scope 밖 (Out of Scope)

| 항목 | 사유 |
|------|------|
| 신규 등록 (관리자 직접 등록) | 현재 등록은 사용자 앱에서 신청. 관리자 직접 입력은 별도 작업. |
| 등록자 삭제 | 등록 취소는 민감한 작업, 운영 정책 정의 필요. 별도 기획. |
| **팀 관리 기능** | 별도 PRD로 분리. `/enrollment/[missionaryId]`에 "팀 관리" 탭으로 추가 예정. 활성 조건: `ENROLLMENT_CLOSED` 이후. BE 선행 작업: `Team.regionId` FK 추가 (팀-연계지 1:1 매핑 구현을 위해 필요). |
| 모바일/태블릿 반응형 | Admin 페이지 공통 정책 — 데스크톱 전용. |
| 커스텀 필드 타입 확장 (멀티셀렉트, 파일 업로드 등) | 이번 Scope는 6개 기본 타입. 추후 고도화 시 검토. |
| 주민등록번호 조회 | 관리자 화면에서는 마스킹 표시만. 상세 조회는 별도 보안 정책 필요. |
| 커스텀 필드 복사 (차수 간 필드 템플릿 재사용) | 추후 운영 편의 기능으로 검토. |

---

## 9. 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 등록 현황 파악 가능 여부 | 관리자가 총 등록자/정원/납부 현황을 한 화면에서 확인 가능 | 기능 테스트 통과 |
| 납부 처리 속도 | 단건 납부 토글 < 500ms 응답 | API 응답 시간 측정 |
| CSV 다운로드 완결성 | 신규 필드 포함한 전체 데이터 정확히 출력 | 데이터 검증 |
| 마이그레이션 데이터 정합성 | 기존 Participation 데이터 유실 0건 | 마이그레이션 전후 건수 비교 |

---

## 10. 기술 의존성 (Dependencies)

| 의존성 | 상태 | 담당 | 우선순위 |
|--------|------|------|:--------:|
| Prisma 스키마 확장 — `Participation` 신규 필드 + `AttendanceType`·`FormFieldType` enum + `MissionaryAttendanceOption`·`MissionaryFormField`·`ParticipationFormAnswer` 모델 | **미완료** | Backend | P0 |
| DB 마이그레이션 — 기존 `Participation` 데이터 처리 방안 (필수 3개 필드 default값 결정) | **미완료** | Backend | P0 |
| DTO 업데이트 — `attendanceOptionId` 포함 고정 신규 필드 + 커스텀 답변 | **미완료** | Backend | P0 |
| Attendance Options CRUD API — `GET/POST/PATCH/DELETE /missionaries/:id/attendance-options` | **미완료** | Backend | P0 |
| Form Fields CRUD API — `GET/POST/PATCH/DELETE /missionaries/:id/form-fields` | **미완료** | Backend | P0 |
| `PATCH /participations/:id/answers` — 커스텀 필드 답변 일괄 저장 | **미완료** | Backend | P0 |
| `GET /participations` — 응답에 `attendanceOption`·`formAnswers` 포함 + `query` 파라미터 지원 | **미완료** | Backend | P1 |
| CSV 다운로드 — 고정 신규 필드 + 커스텀 필드 동적 컬럼 추가 | **미완료** | Backend | P1 |
| 선교 상세 페이지 탭 구조 확인 | 확인 필요 | Frontend | P0 |
