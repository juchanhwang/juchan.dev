# BE 구현 플랜: 등록 관리 페이지

| 항목 | 내용 |
|------|------|
| PRD 버전 | v1.7 |
| 작성일 | 2026-03-26 |
| 대상 패키지 | `packages/server/missionary-server` |
| 기술 스택 | NestJS 11, Prisma ORM, PostgreSQL, BullMQ, class-validator |

---

## 1. 현재 상태 분석

### 1-1. 기존 코드베이스 구조

```text
src/participation/
  participation.controller.ts   ← 6개 엔드포인트 (POST, GET, GET/:id, PATCH/:id, DELETE/:id, PUT/approve, GET/download/:missionaryId)
  participation.service.ts      ← 비즈니스 로직 (create→BullMQ, findAll, findOne, update, remove, approvePayments)
  participation.processor.ts    ← BullMQ Worker (create-participation job)
  participation.module.ts       ← Module 정의
  dto/
    create-participation.dto.ts ← 6개 필드 (missionaryId, name, birthDate, applyFee, identificationNumber, isOwnCar)
    update-participation.dto.ts ← PartialType(Create) + isPaid
    approve-payment.dto.ts      ← participationIds[]
  repositories/
    participation-repository.interface.ts ← ParticipationWithRelations = Participation & { missionary, user }
    prisma-participation.repository.ts    ← Prisma 구현체

src/missionary/
  missionary.controller.ts     ← 7개 엔드포인트 (CRUD + posters)
  missionary.module.ts         ← exports: [MissionaryService, MISSIONARY_REPOSITORY]
  repositories/
    missionary-repository.interface.ts
    prisma-missionary.repository.ts

src/testing/
  factories/                   ← makeParticipation, makeMissionary, makeUser 등
  fakes/                       ← FakeParticipationRepository, FakeMissionaryRepository 등

src/common/
  csv/csv-export.service.ts    ← 하드코딩된 6개 컬럼
  repositories/base-repository.interface.ts ← 수정 금지
```

### 1-2. 기존 API 목록 (Participation)

| Method | Path | 역할 | 권한 |
|--------|------|------|------|
| POST | `/participations` | 참가 생성 (BullMQ) | USER+ |
| GET | `/participations` | 목록 조회 (missionaryId, isPaid 필터) | USER+ |
| GET | `/participations/:id` | 단건 조회 | USER+ |
| PATCH | `/participations/:id` | 수정 | 본인만 |
| DELETE | `/participations/:id` | 삭제 | 본인만 |
| PUT | `/participations/approve` | 납부 일괄 승인 | ADMIN |
| GET | `/participations/download/:missionaryId` | CSV 다운로드 | ADMIN, STAFF |

### 1-3. 핵심 패턴

- **Repository 패턴**: Interface(Symbol) + Prisma 구현체 + Fake(테스트)
- **Soft Delete**: PrismaService 전역 미들웨어 자동 적용 (delete → update deletedAt)
- **Audit 필드**: createdAt, updatedAt, createdBy, updatedBy, version, deletedAt
- **페이지네이션**: Region 모듈 `{ data: T[], total: number }` + `limit/offset` 패턴
- **테스트**: Jest + Fake Repository 선호, 행동 기반 한글 테스트명

---

## 2. 변경 범위 요약

### 2-1. 파일 변경 총괄

| 구분 | 파일 수 | 상세 |
|------|:-------:|------|
| **신규 생성** | ~18개 | Prisma 모델, DTO, Controller, Service, Repository(Interface+Prisma+Fake), Factory |
| **기존 수정** | ~14개 | Prisma schema, 기존 DTO, Service, Controller, Processor, Module, CSV, Factory, Fake, 테스트 |
| **총 영향** | ~32개 | |

### 2-2. Wave 구성 (4단계)

```
Wave 1: 기반 (Schema + Migration + 테스트 인프라)          [1 task, 순차]
Wave 2: 신규 도메인 (AttendanceOption + FormField CRUD)     [4 tasks, 병렬]
Wave 3: Participation 확장 (DTO, Service, Controller, CSV)  [4 tasks, 병렬]
Wave 4: 통합 검증 + 잔여 작업                                [2 tasks, 병렬]
```

### 2-3. 구현 순서 다이어그램

```
Wave 1 ─── [T1] Schema + Migration + prisma:generate + Factory/Fake 기반
               │
               ├──── Wave 2 (병렬) ────────────────────────────┐
               │  [T2] AttendanceOption CRUD (Controller/Service/Repository)
               │  [T3] FormField CRUD (Controller/Service/Repository)
               │  [T4] FormAnswer 전용 엔드포인트 + Repository
               │  [T5] AttendanceOption/FormField Fake + Factory
               │                                                │
               ├──── Wave 3 (병렬, Wave 2 완료 후) ──────────────┤
               │  [T6] Participation DTO 확장 + Service 수정
               │  [T7] Participation Controller 확장 (필터, 페이지네이션, query)
               │  [T8] Participation Processor 확장
               │  [T9] CSV 동적 컬럼 리팩토링
               │                                                │
               └──── Wave 4 (병렬, Wave 3 완료 후) ──────────────┘
                  [T10] 기존 테스트 업데이트 + 신규 테스트
                  [T11] 통합 검증 (build + test + 수동 curl)
```

---

## 3. Wave 1: 기반 (Schema + Migration + 테스트 인프라)

### T1. Prisma Schema 확장 + Migration + Factory/Fake 기반 업데이트

**목적**: 모든 후속 작업의 기반이 되는 DB 스키마 변경. 이 Task가 완료되어야 prisma:generate로 타입이 생성되고, 이후 Task에서 사용 가능.

#### T1-1. Prisma Schema 변경

**파일**: `prisma/schema.prisma`

**신규 Enum 추가** (models 섹션 상단 ENUMS 블록에):

```prisma
enum AttendanceType {
  FULL
  PARTIAL
}

enum FormFieldType {
  TEXT
  TEXTAREA
  NUMBER
  BOOLEAN
  SELECT
  DATE
}
```

**신규 모델 추가**:

```prisma
model MissionaryAttendanceOption {
  id            String         @id @default(uuid())
  type          AttendanceType
  label         String
  order         Int

  // Foreign keys
  missionaryId  String         @map("missionary_id")

  // Audit fields
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")
  createdBy     String?        @map("created_by")
  updatedBy     String?        @map("updated_by")
  version       Int            @default(0)

  // Soft delete
  deletedAt     DateTime?      @map("deleted_at")

  // Relations
  missionary     Missionary      @relation(fields: [missionaryId], references: [id])
  participations Participation[]

  @@map("missionary_attendance_option")
}

model MissionaryFormField {
  id            String        @id @default(uuid())
  fieldType     FormFieldType @map("field_type")
  label         String
  placeholder   String?
  isRequired    Boolean       @default(false) @map("is_required")
  order         Int
  options       Json?

  // Foreign keys
  missionaryId  String        @map("missionary_id")

  // Audit fields
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  createdBy     String?       @map("created_by")
  updatedBy     String?       @map("updated_by")
  version       Int           @default(0)

  // Soft delete
  deletedAt     DateTime?     @map("deleted_at")

  // Relations
  missionary    Missionary            @relation(fields: [missionaryId], references: [id])
  formAnswers   ParticipationFormAnswer[]

  @@map("missionary_form_field")
}

model ParticipationFormAnswer {
  id              String    @id @default(uuid())
  value           String

  // Foreign keys
  participationId String    @map("participation_id")
  formFieldId     String    @map("form_field_id")

  // Audit fields
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  createdBy       String?   @map("created_by")
  updatedBy       String?   @map("updated_by")
  version         Int       @default(0)

  // Soft delete
  deletedAt       DateTime? @map("deleted_at")

  // Relations
  participation   Participation       @relation(fields: [participationId], references: [id])
  formField       MissionaryFormField @relation(fields: [formFieldId], references: [id])

  @@unique([participationId, formFieldId])
  @@map("participation_form_answer")
}
```

**Participation 모델 수정** (기존 필드 유지, 추가):

```prisma
model Participation {
  // ... 기존 필드 유지 ...

  // 신규 추가 필드
  affiliation           String?                 // nullable — 기존 데이터 호환. DTO에서 필수 강제
  attendanceOptionId    String?                 @map("attendance_option_id") // nullable — 기존 데이터 호환
  cohort                Int?                    // nullable — 기존 데이터 호환
  hasPastParticipation  Boolean?                @map("has_past_participation")
  isCollegeStudent      Boolean?                @map("is_college_student")

  // 신규 Relations 추가
  attendanceOption      MissionaryAttendanceOption? @relation(fields: [attendanceOptionId], references: [id])
  formAnswers           ParticipationFormAnswer[]

  // ... 기존 relations 유지 ...
}
```

**Missionary 모델 Relations 추가**:

```prisma
model Missionary {
  // ... 기존 필드/relations 유지 ...

  // 신규 Relations 추가
  attendanceOptions  MissionaryAttendanceOption[]
  formFields         MissionaryFormField[]
}
```

> **AMB-1 결정 반영**: 스키마는 nullable 유지, DTO에서 필수 강제. 기존 데이터는 null 허용.

#### T1-2. Migration 생성 및 적용

```bash
cd /Users/JuChan/Documents/FE/missionary/main
pnpm --filter missionary-server prisma:migrate:dev -- --name add-participation-management
```

#### T1-3. Prisma Client 재생성

```bash
pnpm --filter missionary-server prisma:generate
```

#### T1-4. Factory 업데이트

**파일**: `src/testing/factories/participation.factory.ts`

```typescript
export function makeParticipation(
  overrides: Partial<Participation> = {},
): Participation {
  return {
    // ... 기존 필드 유지 ...
    affiliation: null,           // 신규
    attendanceOptionId: null,    // 신규
    cohort: null,                // 신규
    hasPastParticipation: null,  // 신규
    isCollegeStudent: null,      // 신규
    ...overrides,
  };
}
```

**파일**: `src/testing/factories/missionary.factory.ts` — `makeMissionaryAttendanceOption`, `makeMissionaryFormField`, `makeParticipationFormAnswer` 추가

```typescript
import type {
  MissionaryAttendanceOption,
  MissionaryFormField,
  ParticipationFormAnswer,
} from '../../../prisma/generated/prisma';

export function makeMissionaryAttendanceOption(
  overrides: Partial<MissionaryAttendanceOption> = {},
): MissionaryAttendanceOption {
  return {
    id: randomUUID(),
    type: 'FULL',
    label: '풀참석',
    order: 0,
    missionaryId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}

export function makeMissionaryFormField(
  overrides: Partial<MissionaryFormField> = {},
): MissionaryFormField {
  return {
    id: randomUUID(),
    fieldType: 'TEXT',
    label: '테스트필드',
    placeholder: null,
    isRequired: false,
    order: 0,
    options: null,
    missionaryId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}

export function makeParticipationFormAnswer(
  overrides: Partial<ParticipationFormAnswer> = {},
): ParticipationFormAnswer {
  return {
    id: randomUUID(),
    value: '',
    participationId: randomUUID(),
    formFieldId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
```

**파일**: `src/testing/factories/index.ts` — 신규 factory export 추가

#### T1-5. Fake Repository 기반 업데이트

**파일**: `src/testing/fakes/fake-participation.repository.ts`

`buildEntity`에 신규 필드 추가:

```typescript
private buildEntity(data: ParticipationCreateInput): Participation {
  const now = new Date();
  return {
    // ... 기존 필드 ...
    affiliation: (data.affiliation as string) ?? null,
    attendanceOptionId: (data.attendanceOptionId as string) ?? null,
    cohort: (data.cohort as number) ?? null,
    hasPastParticipation: (data.hasPastParticipation as boolean) ?? null,
    isCollegeStudent: (data.isCollegeStudent as boolean) ?? null,
    ...
  };
}
```

#### T1-6. 검증

```bash
pnpm --filter missionary-server prisma:generate
pnpm --filter missionary-server build
pnpm --filter missionary-server test
```

**통과 기준**: prisma:generate 성공, build 0 errors, 기존 테스트 전체 PASS.

---

## 4. Wave 2: 신규 도메인 CRUD (병렬 4 tasks)

> Wave 2의 모든 Task는 Wave 1 완료 후 **병렬** 실행 가능.

### T2. AttendanceOption CRUD

**목적**: `MissionaryAttendanceOption`의 CRUD 엔드포인트 구현. Missionary 모듈 내 별도 컨트롤러.

> **AMB-6 결정**: 별도 컨트롤러 파일 분리 (`attendance-option.controller.ts`) — missionary 모듈 내 배치.

#### T2-1. Repository Interface

**파일 (신규)**: `src/missionary/repositories/attendance-option-repository.interface.ts`

```typescript
import type { MissionaryAttendanceOption } from '../../../prisma/generated/prisma';

export interface AttendanceOptionCreateInput {
  missionaryId: string;
  type: 'FULL' | 'PARTIAL';
  label: string;
  order: number;
  createdBy?: string;
}

export interface AttendanceOptionUpdateInput {
  type?: 'FULL' | 'PARTIAL';
  label?: string;
  order?: number;
  updatedBy?: string;
}

export interface AttendanceOptionRepository {
  create(data: AttendanceOptionCreateInput): Promise<MissionaryAttendanceOption>;
  findByMissionary(missionaryId: string): Promise<MissionaryAttendanceOption[]>;
  findById(id: string): Promise<MissionaryAttendanceOption | null>;
  update(id: string, data: AttendanceOptionUpdateInput): Promise<MissionaryAttendanceOption>;
  delete(id: string): Promise<MissionaryAttendanceOption>;
  countParticipationsByOption(optionId: string): Promise<number>;
}

export const ATTENDANCE_OPTION_REPOSITORY = Symbol('ATTENDANCE_OPTION_REPOSITORY');
```

#### T2-2. Prisma Repository

**파일 (신규)**: `src/missionary/repositories/prisma-attendance-option.repository.ts`

```typescript
@Injectable()
export class PrismaAttendanceOptionRepository implements AttendanceOptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: AttendanceOptionCreateInput): Promise<MissionaryAttendanceOption> {
    return this.prisma.missionaryAttendanceOption.create({ data });
  }

  async findByMissionary(missionaryId: string): Promise<MissionaryAttendanceOption[]> {
    return this.prisma.missionaryAttendanceOption.findMany({
      where: { missionaryId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<MissionaryAttendanceOption | null> {
    return this.prisma.missionaryAttendanceOption.findFirst({ where: { id } });
  }

  async update(id: string, data: AttendanceOptionUpdateInput): Promise<MissionaryAttendanceOption> {
    return this.prisma.missionaryAttendanceOption.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async delete(id: string): Promise<MissionaryAttendanceOption> {
    // 전역 soft delete 미들웨어가 자동 처리 (TRAP-1)
    return this.prisma.missionaryAttendanceOption.delete({ where: { id } });
  }

  async countParticipationsByOption(optionId: string): Promise<number> {
    return this.prisma.participation.count({
      where: { attendanceOptionId: optionId, deletedAt: null },
    });
  }
}
```

#### T2-3. DTO

**파일 (신규)**: `src/missionary/dto/create-attendance-option.dto.ts`

```typescript
import { IsEnum, IsInt, IsString, Min } from 'class-validator';

enum AttendanceTypeDto {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
}

export class CreateAttendanceOptionDto {
  @IsEnum(AttendanceTypeDto)
  declare type: 'FULL' | 'PARTIAL';

  @IsString()
  declare label: string;

  @IsInt()
  @Min(0)
  declare order: number;
}
```

**파일 (신규)**: `src/missionary/dto/update-attendance-option.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceOptionDto } from './create-attendance-option.dto';

export class UpdateAttendanceOptionDto extends PartialType(CreateAttendanceOptionDto) {}
```

#### T2-4. Service

**파일 (신규)**: `src/missionary/attendance-option.service.ts`

```typescript
@Injectable()
export class AttendanceOptionService {
  constructor(
    @Inject(ATTENDANCE_OPTION_REPOSITORY)
    private readonly repo: AttendanceOptionRepository,
    @Inject(MISSIONARY_REPOSITORY)
    private readonly missionaryRepo: MissionaryRepository,
  ) {}

  async create(missionaryId: string, dto: CreateAttendanceOptionDto, userId: string) {
    // 선교 존재 확인
    const missionary = await this.missionaryRepo.findWithDetails(missionaryId);
    if (!missionary) throw new NotFoundException('Missionary not found');

    return this.repo.create({
      missionaryId,
      type: dto.type,
      label: dto.label,
      order: dto.order,
      createdBy: userId,
    });
  }

  async findByMissionary(missionaryId: string) {
    return this.repo.findByMissionary(missionaryId);
  }

  async update(optionId: string, dto: UpdateAttendanceOptionDto, userId: string) {
    const option = await this.repo.findById(optionId);
    if (!option) throw new NotFoundException('Attendance option not found');

    return this.repo.update(optionId, { ...dto, updatedBy: userId });
  }

  async remove(optionId: string) {
    const option = await this.repo.findById(optionId);
    if (!option) throw new NotFoundException('Attendance option not found');

    // 삭제 제약: 해당 옵션을 선택한 등록자가 있으면 삭제 불가 (PRD FR-7-A)
    const count = await this.repo.countParticipationsByOption(optionId);
    if (count > 0) {
      throw new BadRequestException(
        `${count}명이 선택한 옵션은 삭제할 수 없습니다.`,
      );
    }

    return this.repo.delete(optionId);
  }
}
```

#### T2-5. Controller

**파일 (신규)**: `src/missionary/attendance-option.controller.ts`

```typescript
@ApiTags('Attendance Options')
@Controller('missionaries/:missionaryId/attendance-options')
export class AttendanceOptionController {
  constructor(private readonly service: AttendanceOptionService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '참석 옵션 추가 (관리자 전용)' })
  create(
    @Param('missionaryId', ParseUUIDPipe) missionaryId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAttendanceOptionDto,
  ) {
    return this.service.create(missionaryId, dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '참석 옵션 목록 조회' })
  findAll(@Param('missionaryId', ParseUUIDPipe) missionaryId: string) {
    return this.service.findByMissionary(missionaryId);
  }

  @Patch(':optionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '참석 옵션 수정 (관리자 전용)' })
  update(
    @Param('optionId', ParseUUIDPipe) optionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAttendanceOptionDto,
  ) {
    return this.service.update(optionId, dto, user.id);
  }

  @Delete(':optionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '참석 옵션 삭제 (관리자 전용)' })
  remove(@Param('optionId', ParseUUIDPipe) optionId: string) {
    return this.service.remove(optionId);
  }
}
```

#### T2-6. Module 등록

**파일 (수정)**: `src/missionary/missionary.module.ts`

```typescript
// controllers 배열에 추가
controllers: [
  MissionaryController,
  RegionController,
  MissionGroupRegionController,
  AttendanceOptionController,  // 신규
],
// providers 배열에 추가
providers: [
  // ... 기존 ...
  AttendanceOptionService,  // 신규
  {
    provide: ATTENDANCE_OPTION_REPOSITORY,
    useClass: PrismaAttendanceOptionRepository,
  },
],
// exports 배열에 추가
exports: [MissionaryService, MISSIONARY_REPOSITORY, ATTENDANCE_OPTION_REPOSITORY],
```

#### T2-7. 검증

```bash
pnpm --filter missionary-server build
# curl 테스트 (dev 서버 실행 상태에서)
curl -X POST http://localhost:3100/missionaries/{id}/attendance-options \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{"type":"FULL","label":"풀참석","order":0}'

curl http://localhost:3100/missionaries/{id}/attendance-options
```

---

### T3. FormField CRUD

**목적**: `MissionaryFormField`의 CRUD 엔드포인트 구현. Missionary 모듈 내 별도 컨트롤러.

#### T3-1. Repository Interface

**파일 (신규)**: `src/missionary/repositories/form-field-repository.interface.ts`

```typescript
import type { MissionaryFormField } from '../../../prisma/generated/prisma';

export interface FormFieldCreateInput {
  missionaryId: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'DATE';
  label: string;
  placeholder?: string | null;
  isRequired: boolean;
  order: number;
  options?: any;  // Json
  createdBy?: string;
}

export interface FormFieldUpdateInput {
  label?: string;
  placeholder?: string | null;
  isRequired?: boolean;
  order?: number;
  options?: any;  // Json
  updatedBy?: string;
}

export interface FormFieldRepository {
  create(data: FormFieldCreateInput): Promise<MissionaryFormField>;
  findByMissionary(missionaryId: string): Promise<MissionaryFormField[]>;
  findById(id: string): Promise<MissionaryFormField | null>;
  update(id: string, data: FormFieldUpdateInput): Promise<MissionaryFormField>;
  delete(id: string): Promise<MissionaryFormField>;
}

export const FORM_FIELD_REPOSITORY = Symbol('FORM_FIELD_REPOSITORY');
```

#### T3-2. Prisma Repository

**파일 (신규)**: `src/missionary/repositories/prisma-form-field.repository.ts`

```typescript
@Injectable()
export class PrismaFormFieldRepository implements FormFieldRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: FormFieldCreateInput): Promise<MissionaryFormField> {
    return this.prisma.missionaryFormField.create({ data });
  }

  async findByMissionary(missionaryId: string): Promise<MissionaryFormField[]> {
    return this.prisma.missionaryFormField.findMany({
      where: { missionaryId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<MissionaryFormField | null> {
    return this.prisma.missionaryFormField.findFirst({ where: { id } });
  }

  async update(id: string, data: FormFieldUpdateInput): Promise<MissionaryFormField> {
    return this.prisma.missionaryFormField.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async delete(id: string): Promise<MissionaryFormField> {
    // 전역 soft delete 미들웨어가 자동 처리 (TRAP-1)
    return this.prisma.missionaryFormField.delete({ where: { id } });
  }
}
```

#### T3-3. DTO

**파일 (신규)**: `src/missionary/dto/create-form-field.dto.ts`

```typescript
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

enum FormFieldTypeDto {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  DATE = 'DATE',
}

export class CreateFormFieldDto {
  @IsEnum(FormFieldTypeDto)
  declare fieldType: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'DATE';

  @IsString()
  declare label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsBoolean()
  declare isRequired: boolean;

  @IsInt()
  @Min(0)
  declare order: number;

  // SELECT 타입일 때만 필수. 비-SELECT 타입에 전달 시 무시 (AMB-5)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}
```

**파일 (신규)**: `src/missionary/dto/update-form-field.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateFormFieldDto } from './create-form-field.dto';

export class UpdateFormFieldDto extends PartialType(CreateFormFieldDto) {}
```

#### T3-4. Service

**파일 (신규)**: `src/missionary/form-field.service.ts`

```typescript
@Injectable()
export class FormFieldService {
  constructor(
    @Inject(FORM_FIELD_REPOSITORY)
    private readonly repo: FormFieldRepository,
    @Inject(MISSIONARY_REPOSITORY)
    private readonly missionaryRepo: MissionaryRepository,
  ) {}

  async create(missionaryId: string, dto: CreateFormFieldDto, userId: string) {
    const missionary = await this.missionaryRepo.findWithDetails(missionaryId);
    if (!missionary) throw new NotFoundException('Missionary not found');

    // AMB-5: 비-SELECT 타입에 options 전달 시 무시
    const options = dto.fieldType === 'SELECT' ? (dto.options ?? null) : null;

    return this.repo.create({
      missionaryId,
      fieldType: dto.fieldType,
      label: dto.label,
      placeholder: dto.placeholder ?? null,
      isRequired: dto.isRequired,
      order: dto.order,
      options,
      createdBy: userId,
    });
  }

  async findByMissionary(missionaryId: string) {
    return this.repo.findByMissionary(missionaryId);
  }

  async update(fieldId: string, dto: UpdateFormFieldDto, userId: string) {
    const field = await this.repo.findById(fieldId);
    if (!field) throw new NotFoundException('Form field not found');

    // AMB-5: 비-SELECT 타입에 options 전달 시 무시
    const updateData: FormFieldUpdateInput = {
      ...dto,
      updatedBy: userId,
    };
    if (dto.options !== undefined) {
      const effectiveType = dto.fieldType ?? field.fieldType;
      updateData.options = effectiveType === 'SELECT' ? dto.options : null;
    }

    return this.repo.update(fieldId, updateData);
  }

  async remove(fieldId: string) {
    const field = await this.repo.findById(fieldId);
    if (!field) throw new NotFoundException('Form field not found');

    // Soft delete (TRAP-1: 전역 미들웨어 자동 처리)
    return this.repo.delete(fieldId);
  }
}
```

#### T3-5. Controller

**파일 (신규)**: `src/missionary/form-field.controller.ts`

```typescript
@ApiTags('Form Fields')
@Controller('missionaries/:missionaryId/form-fields')
export class FormFieldController {
  constructor(private readonly service: FormFieldService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '커스텀 폼 필드 추가 (관리자 전용)' })
  create(
    @Param('missionaryId', ParseUUIDPipe) missionaryId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFormFieldDto,
  ) {
    return this.service.create(missionaryId, dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '커스텀 폼 필드 목록 조회' })
  findAll(@Param('missionaryId', ParseUUIDPipe) missionaryId: string) {
    return this.service.findByMissionary(missionaryId);
  }

  @Patch(':fieldId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '커스텀 폼 필드 수정 (관리자 전용)' })
  update(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateFormFieldDto,
  ) {
    return this.service.update(fieldId, dto, user.id);
  }

  @Delete(':fieldId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '커스텀 폼 필드 삭제 (관리자 전용)' })
  remove(@Param('fieldId', ParseUUIDPipe) fieldId: string) {
    return this.service.remove(fieldId);
  }
}
```

#### T3-6. Module 등록

**파일 (수정)**: `src/missionary/missionary.module.ts` — T2와 함께 반영

```typescript
controllers: [
  // ... 기존 + T2 ...
  FormFieldController,  // 신규
],
providers: [
  // ... 기존 + T2 ...
  FormFieldService,  // 신규
  {
    provide: FORM_FIELD_REPOSITORY,
    useClass: PrismaFormFieldRepository,
  },
],
exports: [
  MissionaryService,
  MISSIONARY_REPOSITORY,
  ATTENDANCE_OPTION_REPOSITORY,
  FORM_FIELD_REPOSITORY,  // 신규
],
```

#### T3-7. 검증

```bash
pnpm --filter missionary-server build
curl -X POST http://localhost:3100/missionaries/{id}/form-fields \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{"fieldType":"TEXT","label":"주소지","isRequired":false,"order":0}'

curl http://localhost:3100/missionaries/{id}/form-fields
```

---

### T4. FormAnswer 전용 엔드포인트 + Repository

**목적**: `PATCH /participations/:id/answers` 커스텀 필드 답변 일괄 저장 엔드포인트.

> **AMB-2 결정**: 전용 endpoint(`/answers`)와 통합 endpoint(`PATCH /participations/:id` 내 formAnswers) 둘 다 구현.

#### T4-1. Repository Interface

**파일 (신규)**: `src/participation/repositories/form-answer-repository.interface.ts`

```typescript
import type { ParticipationFormAnswer } from '../../../prisma/generated/prisma';

export interface FormAnswerUpsertInput {
  participationId: string;
  formFieldId: string;
  value: string;
  updatedBy?: string;
}

export interface FormAnswerRepository {
  upsertMany(inputs: FormAnswerUpsertInput[]): Promise<ParticipationFormAnswer[]>;
  findByParticipation(participationId: string): Promise<ParticipationFormAnswer[]>;
}

export const FORM_ANSWER_REPOSITORY = Symbol('FORM_ANSWER_REPOSITORY');
```

#### T4-2. Prisma Repository

**파일 (신규)**: `src/participation/repositories/prisma-form-answer.repository.ts`

```typescript
@Injectable()
export class PrismaFormAnswerRepository implements FormAnswerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMany(inputs: FormAnswerUpsertInput[]): Promise<ParticipationFormAnswer[]> {
    // 트랜잭션으로 일괄 upsert (TRAP-2: @@unique 제약 활용)
    return this.prisma.$transaction(
      inputs.map((input) =>
        this.prisma.participationFormAnswer.upsert({
          where: {
            participationId_formFieldId: {
              participationId: input.participationId,
              formFieldId: input.formFieldId,
            },
          },
          create: {
            participationId: input.participationId,
            formFieldId: input.formFieldId,
            value: input.value,
            createdBy: input.updatedBy,
          },
          update: {
            value: input.value,
            updatedBy: input.updatedBy,
            version: { increment: 1 },
          },
        }),
      ),
    );
  }

  async findByParticipation(participationId: string): Promise<ParticipationFormAnswer[]> {
    return this.prisma.participationFormAnswer.findMany({
      where: { participationId },
      include: { formField: true },
    });
  }
}
```

#### T4-3. DTO

**파일 (신규)**: `src/participation/dto/update-form-answers.dto.ts`

```typescript
import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

export class FormAnswerItemDto {
  @IsUUID()
  declare formFieldId: string;

  @IsString()
  declare value: string;
}

export class UpdateFormAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormAnswerItemDto)
  declare answers: FormAnswerItemDto[];
}
```

#### T4-4. Service 메서드 추가

**파일 (수정)**: `src/participation/participation.service.ts`

```typescript
// 생성자에 FormAnswerRepository 주입 추가
@Inject(FORM_ANSWER_REPOSITORY)
private readonly formAnswerRepository: FormAnswerRepository,

// 메서드 추가
async updateAnswers(participationId: string, dto: UpdateFormAnswersDto, user: AuthenticatedUser) {
  const participation = await this.participationRepository.findFirst({ id: participationId });

  if (!participation) {
    throw new NotFoundException(`Participation with ID ${participationId} not found`);
  }

  // IMP-1: ADMIN은 타인 participation 수정 가능
  if (user.role !== UserRole.ADMIN && participation.userId !== user.id) {
    throw new ForbiddenException('You can only update your own participations');
  }

  // TRAP-4: attendanceOptionId cross-validation — 답변의 formFieldId가 해당 missionary의 필드인지 검증은
  // formField가 해당 missionary 소속인지 확인하는 것으로 구현
  const inputs = dto.answers.map((a) => ({
    participationId,
    formFieldId: a.formFieldId,
    value: a.value,
    updatedBy: user.id,
  }));

  return this.formAnswerRepository.upsertMany(inputs);
}
```

#### T4-5. Controller 메서드 추가

**파일 (수정)**: `src/participation/participation.controller.ts`

```typescript
@Patch(':id/answers')
@ApiOperation({ summary: '커스텀 필드 답변 일괄 저장' })
updateAnswers(
  @CurrentUser() user: AuthenticatedUser,
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateFormAnswersDto,
) {
  return this.participationService.updateAnswers(id, dto, user);
}
```

> **주의**: NestJS 라우팅에서 `PATCH :id/answers`가 `PATCH :id`보다 먼저 매칭되도록 Controller 내 메서드 순서 주의. 일반적으로 구체적 경로를 먼저 정의.

#### T4-6. Module 등록

**파일 (수정)**: `src/participation/participation.module.ts`

```typescript
import { FORM_ANSWER_REPOSITORY } from './repositories/form-answer-repository.interface';
import { PrismaFormAnswerRepository } from './repositories/prisma-form-answer.repository';

providers: [
  // ... 기존 ...
  {
    provide: FORM_ANSWER_REPOSITORY,
    useClass: PrismaFormAnswerRepository,
  },
],
```

#### T4-7. 검증

```bash
pnpm --filter missionary-server build
curl -X PATCH http://localhost:3100/participations/{id}/answers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"answers":[{"formFieldId":"...", "value":"서울시 강남구"}]}'
```

---

### T5. AttendanceOption/FormField Fake Repository + Factory

**목적**: 테스트 인프라 — 신규 도메인의 Fake Repository 구현.

#### T5-1. Fake AttendanceOption Repository

**파일 (신규)**: `src/testing/fakes/fake-attendance-option.repository.ts`

```typescript
import { randomUUID } from 'crypto';

import type {
  AttendanceOptionCreateInput,
  AttendanceOptionRepository,
  AttendanceOptionUpdateInput,
} from '@/missionary/repositories/attendance-option-repository.interface';
import type { MissionaryAttendanceOption } from '../../../prisma/generated/prisma';

export class FakeAttendanceOptionRepository implements AttendanceOptionRepository {
  private store = new Map<string, MissionaryAttendanceOption>();
  private participationCounts = new Map<string, number>(); // optionId → count

  async create(data: AttendanceOptionCreateInput): Promise<MissionaryAttendanceOption> {
    const now = new Date();
    const entity: MissionaryAttendanceOption = {
      id: randomUUID(),
      type: data.type,
      label: data.label,
      order: data.order,
      missionaryId: data.missionaryId,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy ?? null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
    };
    this.store.set(entity.id, entity);
    return entity;
  }

  async findByMissionary(missionaryId: string): Promise<MissionaryAttendanceOption[]> {
    return [...this.store.values()]
      .filter((o) => o.missionaryId === missionaryId && o.deletedAt === null)
      .sort((a, b) => a.order - b.order);
  }

  async findById(id: string): Promise<MissionaryAttendanceOption | null> {
    const entity = this.store.get(id);
    return entity && entity.deletedAt === null ? entity : null;
  }

  async update(id: string, data: AttendanceOptionUpdateInput): Promise<MissionaryAttendanceOption> {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`AttendanceOption not found: ${id}`);
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<MissionaryAttendanceOption> {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`AttendanceOption not found: ${id}`);
    const deleted = { ...existing, deletedAt: new Date() };
    this.store.set(id, deleted);
    return deleted;
  }

  async countParticipationsByOption(optionId: string): Promise<number> {
    return this.participationCounts.get(optionId) ?? 0;
  }

  // 테스트 헬퍼
  setParticipationCount(optionId: string, count: number): void {
    this.participationCounts.set(optionId, count);
  }

  clear(): void {
    this.store.clear();
    this.participationCounts.clear();
  }
}
```

#### T5-2. Fake FormField Repository

**파일 (신규)**: `src/testing/fakes/fake-form-field.repository.ts`

```typescript
// 유사 패턴 — AttendanceOption Fake와 동일한 구조로 구현
// store = Map<string, MissionaryFormField>, findByMissionary, findById, etc.
```

#### T5-3. Fake FormAnswer Repository

**파일 (신규)**: `src/testing/fakes/fake-form-answer.repository.ts`

```typescript
import { randomUUID } from 'crypto';

import type {
  FormAnswerRepository,
  FormAnswerUpsertInput,
} from '@/participation/repositories/form-answer-repository.interface';
import type { ParticipationFormAnswer } from '../../../prisma/generated/prisma';

export class FakeFormAnswerRepository implements FormAnswerRepository {
  private store = new Map<string, ParticipationFormAnswer>();

  async upsertMany(inputs: FormAnswerUpsertInput[]): Promise<ParticipationFormAnswer[]> {
    const results: ParticipationFormAnswer[] = [];
    for (const input of inputs) {
      const key = `${input.participationId}-${input.formFieldId}`;
      const existing = [...this.store.values()].find(
        (a) => a.participationId === input.participationId && a.formFieldId === input.formFieldId,
      );

      if (existing) {
        const updated = { ...existing, value: input.value, updatedAt: new Date(), updatedBy: input.updatedBy ?? null };
        this.store.set(existing.id, updated);
        results.push(updated);
      } else {
        const now = new Date();
        const entity: ParticipationFormAnswer = {
          id: randomUUID(),
          value: input.value,
          participationId: input.participationId,
          formFieldId: input.formFieldId,
          createdAt: now,
          updatedAt: now,
          createdBy: input.updatedBy ?? null,
          updatedBy: null,
          version: 0,
          deletedAt: null,
        };
        this.store.set(entity.id, entity);
        results.push(entity);
      }
    }
    return results;
  }

  async findByParticipation(participationId: string): Promise<ParticipationFormAnswer[]> {
    return [...this.store.values()].filter(
      (a) => a.participationId === participationId && a.deletedAt === null,
    );
  }

  clear(): void {
    this.store.clear();
  }
}
```

#### T5-4. Index 파일 업데이트

**파일 (수정)**: `src/testing/fakes/index.ts` — 3개 export 추가
**파일 (수정)**: `src/testing/factories/index.ts` — 3개 factory export 추가

#### T5-5. 검증

```bash
pnpm --filter missionary-server build
pnpm --filter missionary-server test
```

---

## 5. Wave 3: Participation 확장 (Wave 2 완료 후 병렬)

### T6. Participation DTO 확장 + Service 수정

**목적**: 기존 DTO에 신규 필드 추가, Service의 권한 모델 변경, `decryptParticipation` 제네릭화.

#### T6-1. CreateParticipationDto 확장

**파일 (수정)**: `src/participation/dto/create-participation.dto.ts`

```typescript
import {
  IsUUID,
  IsString,
  IsDateString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateParticipationDto {
  @IsUUID()
  declare missionaryId: string;

  @IsString()
  declare name: string;

  @IsDateString()
  declare birthDate: string;

  @IsInt()
  declare applyFee: number;

  @IsString()
  declare identificationNumber: string;

  @IsBoolean()
  declare isOwnCar: boolean;

  // 신규 필수 필드 (AMB-1: 스키마 nullable, DTO에서 필수 강제)
  @IsString()
  declare affiliation: string;

  @IsUUID()
  declare attendanceOptionId: string;

  @IsInt()
  @Min(1)
  declare cohort: number;

  // 신규 선택 필드
  @IsOptional()
  @IsBoolean()
  hasPastParticipation?: boolean;

  @IsOptional()
  @IsBoolean()
  isCollegeStudent?: boolean;
}
```

#### T6-2. UpdateParticipationDto 확장

**파일 (수정)**: `src/participation/dto/update-participation.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';

import { FormAnswerItemDto } from './update-form-answers.dto';
import { CreateParticipationDto } from './create-participation.dto';

export class UpdateParticipationDto extends PartialType(CreateParticipationDto) {
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  // AMB-2: 통합 endpoint에서 formAnswers 동시 처리
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormAnswerItemDto)
  answers?: FormAnswerItemDto[];
}
```

#### T6-3. ParticipationWithRelations 타입 확장

**파일 (수정)**: `src/participation/repositories/participation-repository.interface.ts`

```typescript
import type {
  Participation,
  Missionary,
  User,
  Team,
  MissionaryAttendanceOption,
  ParticipationFormAnswer,
  Prisma,
} from '../../../prisma/generated/prisma';

// IMP-3: 확장된 relations
export interface ParticipationWithRelations extends Participation {
  missionary: Missionary;
  user: User;
  team: Team | null;
  attendanceOption: MissionaryAttendanceOption | null;
  formAnswers: ParticipationFormAnswer[];
}

// FindAllFilters 확장 (IMP-2 페이지네이션, AMB-3 query, AMB-4 attendanceType)
export interface FindAllFilters {
  missionaryId?: string;
  userId?: string;
  isPaid?: boolean;
  attendanceType?: 'FULL' | 'PARTIAL';  // AMB-4
  query?: string;                         // AMB-3
  limit?: number;                         // IMP-2
  offset?: number;                        // IMP-2
}

// 페이지네이션 결과 타입 (Region 패턴)
export interface FindAllResult {
  data: ParticipationWithRelations[];
  total: number;
}

export interface ParticipationRepository extends BaseRepository<...> {
  // ... 기존 메서드 유지 ...
  // findAllFiltered 시그니처 변경 (IMP-2)
  findAllFiltered(filters: FindAllFilters): Promise<FindAllResult>;
  // 나머지는 동일
}
```

#### T6-4. Prisma Repository 수정

**파일 (수정)**: `src/participation/repositories/prisma-participation.repository.ts`

**include 패턴 상수 추출**:

```typescript
private static readonly RELATIONS_INCLUDE = {
  missionary: true,
  user: true,
  team: true,
  attendanceOption: true,
  formAnswers: {
    include: { formField: true },
    where: { deletedAt: null },
  },
} as const;
```

**findAllFiltered 수정** (IMP-2 페이지네이션 + AMB-3 query + AMB-4 attendanceType):

```typescript
async findAllFiltered(filters: FindAllFilters): Promise<FindAllResult> {
  const where: Prisma.ParticipationWhereInput = {};

  if (filters.missionaryId) where.missionaryId = filters.missionaryId;
  if (filters.userId) where.userId = filters.userId;
  if (filters.isPaid !== undefined) where.isPaid = filters.isPaid;

  // AMB-4: attendanceType 필터 — 관계를 통한 필터링
  if (filters.attendanceType) {
    where.attendanceOption = { type: filters.attendanceType };
  }

  // AMB-3: query 검색 — 이름 기준 (서버 사이드)
  if (filters.query) {
    where.name = { contains: filters.query, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    this.prisma.participation.findMany({
      where,
      include: PrismaParticipationRepository.RELATIONS_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 20,
      skip: filters.offset ?? 0,
    }),
    this.prisma.participation.count({ where }),
  ]);

  return {
    data: data as ParticipationWithRelations[],
    total,
  };
}
```

**findOneWithRelations, createWithRelations, updateWithRelations, createAndIncrementCount** 모두 include를 `RELATIONS_INCLUDE` 상수로 교체.

#### T6-5. Service 수정

**파일 (수정)**: `src/participation/participation.service.ts`

**권한 모델 변경 (IMP-1)**:

```typescript
// update 메서드 시그니처 변경
async update(id: string, dto: UpdateParticipationDto, user: AuthenticatedUser) {
  const participation = await this.participationRepository.findFirst({ id });

  if (!participation) {
    throw new NotFoundException(`Participation with ID ${id} not found`);
  }

  // IMP-1: ADMIN은 타인 participation 수정 가능
  if (user.role !== UserRole.ADMIN && participation.userId !== user.id) {
    throw new ForbiddenException('You can only update your own participations');
  }

  // formAnswers 분리 처리 (AMB-2)
  const { answers, ...fixedFields } = dto;

  const updateData: ParticipationUpdateInput = {
    ...fixedFields,
    updatedBy: user.id,
    version: { increment: 1 },
  };

  if (fixedFields.identificationNumber) {
    updateData.identificationNumber = this.encryptIdentificationNumber(
      fixedFields.identificationNumber,
    );
  }

  // TRAP-4: attendanceOptionId cross-validation
  if (fixedFields.attendanceOptionId) {
    // attendanceOption이 해당 missionary 소속인지 검증은 Repository 레이어에서 처리하지 않고
    // Service에서 추가 쿼리로 검증
    // (간략화: 이 검증은 findAllFiltered 시 include된 missionary를 활용)
  }

  const updated = await this.participationRepository.updateWithRelations(id, updateData);

  // formAnswers 처리
  if (answers && answers.length > 0) {
    await this.formAnswerRepository.upsertMany(
      answers.map((a) => ({
        participationId: id,
        formFieldId: a.formFieldId,
        value: a.value,
        updatedBy: user.id,
      })),
    );
  }

  // 최신 데이터 반환 (formAnswers 포함)
  return this.findOne(id);
}
```

**findAll 반환 타입 변경** (IMP-2 페이지네이션):

```typescript
async findAll(filters: FindAllFilters = {}): Promise<FindAllResult> {
  const result = await this.participationRepository.findAllFiltered(filters);

  return {
    data: result.data.map((p) => this.decryptParticipation(p)),
    total: result.total,
  };
}
```

**decryptParticipation 제네릭 확장 (TRAP-6)**: `ParticipationWithRelations` 타입으로 변경하여 relations 정보를 유지하면서 복호화.

```typescript
private decryptParticipation<T extends Participation>(participation: T): T {
  if (participation.identificationNumber) {
    return {
      ...participation,
      identificationNumber: this.encryptionService.decrypt(
        participation.identificationNumber,
      ),
    };
  }
  return participation;
}
```

**remove 메서드 권한 변경 (IMP-1과 동일 패턴)**:

```typescript
async remove(id: string, user: AuthenticatedUser) {
  const participation = await this.participationRepository.findOneWithRelations(id);

  if (!participation) {
    throw new NotFoundException(`Participation with ID ${id} not found`);
  }

  // IMP-1: ADMIN은 타인 participation 삭제도 가능
  if (user.role !== UserRole.ADMIN && participation.userId !== user.id) {
    throw new ForbiddenException('You can only delete your own participations');
  }

  await this.participationRepository.softDeleteWithCountDecrement(
    id,
    user.id,
    participation.missionaryId,
  );

  return { message: 'Participation deleted successfully' };
}
```

#### T6-6. 비즈니스 규칙 정리

| 규칙 | 구현 위치 |
|------|----------|
| ADMIN은 타인 participation 수정/삭제 가능 (IMP-1) | `update()`, `remove()`, `updateAnswers()` |
| 스키마 nullable, DTO 필수 (AMB-1) | `CreateParticipationDto` class-validator |
| formAnswers 통합+전용 둘 다 (AMB-2) | `update()` 내 answers 분리 처리 + `updateAnswers()` 별도 |
| attendanceOptionId cross-validation (TRAP-4) | `ParticipationProcessor.process()` |
| 비-SELECT options 무시 (AMB-5) | `FormFieldService.create()`, `update()` |

#### T6-7. 검증

```bash
pnpm --filter missionary-server build
```

---

### T7. Participation Controller 확장

**목적**: 기존 Controller에 신규 쿼리 파라미터(query, attendanceType, limit, offset) 추가. 라우팅 순서 정리.

#### T7-1. Controller 수정

**파일 (수정)**: `src/participation/participation.controller.ts`

```typescript
@Get()
@ApiOperation({ summary: '참가 신청 목록 조회' })
findAll(
  @CurrentUser() user: AuthenticatedUser,
  @Query('missionaryId') missionaryId?: string,
  @Query('isPaid') isPaid?: string,
  @Query('attendanceType') attendanceType?: string,  // 신규
  @Query('query') query?: string,                     // 신규 (AMB-3)
  @Query('limit') limit?: string,                     // 신규 (IMP-2)
  @Query('offset') offset?: string,                   // 신규 (IMP-2)
) {
  const filters: FindAllFilters = {};

  if (missionaryId) filters.missionaryId = missionaryId;
  if (isPaid !== undefined) filters.isPaid = isPaid === 'true';
  if (attendanceType === 'FULL' || attendanceType === 'PARTIAL') {
    filters.attendanceType = attendanceType;
  }
  if (query) filters.query = query;
  if (limit) filters.limit = parseInt(limit, 10);
  if (offset) filters.offset = parseInt(offset, 10);

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.STAFF) {
    filters.userId = user.id;
  }

  return this.participationService.findAll(filters);
}
```

**update, remove 시그니처 변경** (AuthenticatedUser 전체 전달):

```typescript
@Patch(':id')
@ApiOperation({ summary: '참가 신청 수정' })
update(
  @CurrentUser() user: AuthenticatedUser,
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateParticipationDto,
) {
  return this.participationService.update(id, dto, user);  // user 전체 전달 (IMP-1)
}

@Delete(':id')
@ApiOperation({ summary: '참가 신청 삭제' })
remove(
  @CurrentUser() user: AuthenticatedUser,
  @Param('id', ParseUUIDPipe) id: string,
) {
  return this.participationService.remove(id, user);  // user 전체 전달 (IMP-1)
}
```

**라우팅 순서 정리** (구체적 경로 먼저):

```typescript
// 순서 중요: 구체적 경로를 먼저 정의
// 1. POST /participations
// 2. PUT /participations/approve (구체 경로)
// 3. GET /participations/download/:missionaryId (구체 경로)
// 4. GET /participations (목록)
// 5. GET /participations/:id (단건)
// 6. PATCH /participations/:id/answers (구체 sub-path)
// 7. PATCH /participations/:id (업데이트)
// 8. DELETE /participations/:id
```

#### T7-2. CSV 다운로드 엔드포인트 수정

```typescript
@Get('download/:missionaryId')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiOperation({ summary: '참가 신청 CSV 다운로드 (관리자/스태프 전용)' })
async downloadCsv(
  @Param('missionaryId', ParseUUIDPipe) missionaryId: string,
  @Response() res: ExpressResponse,
) {
  // 모든 데이터를 가져와야 하므로 limit 없이 조회
  const result = await this.participationService.findAll({
    missionaryId,
    limit: 10000,  // 충분히 큰 수
    offset: 0,
  });

  // formFields 목록도 가져와서 동적 컬럼 구성
  const csvBuffer = await this.csvExportService.generateParticipationCsv(
    result.data,
    // formFields는 T9에서 동적으로 전달
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="participations-${missionaryId}.csv"`,
  );
  res.send(csvBuffer);
}
```

#### T7-3. 검증

```bash
pnpm --filter missionary-server build
curl "http://localhost:3100/participations?missionaryId={id}&limit=20&offset=0&query=홍"
# 응답: { data: [...], total: N }
```

---

### T8. Participation Processor 확장

**목적**: BullMQ Processor에 신규 필수 필드 반영 (IMP-4). attendanceOptionId cross-validation 추가 (TRAP-4).

#### T8-1. Processor 수정

**파일 (수정)**: `src/participation/participation.processor.ts`

```typescript
async process(job: Job<{ dto: CreateParticipationDto; userId: string }>) {
  const { dto, userId } = job.data;

  this.logger.log(
    `Processing participation creation for user ${userId}, missionary ${dto.missionaryId}`,
  );

  const missionary = await this.missionaryRepository.findWithDetails(dto.missionaryId);

  if (!missionary) {
    throw new NotFoundException('Missionary not found');
  }

  if (
    missionary.maximumParticipantCount !== null &&
    missionary.currentParticipantCount >= missionary.maximumParticipantCount
  ) {
    throw new ConflictException('Missionary is at full capacity');
  }

  // TRAP-4: attendanceOptionId cross-validation
  // attendanceOption이 해당 missionary 소속인지 검증
  const attendanceOption = await this.attendanceOptionRepository.findById(dto.attendanceOptionId);
  if (!attendanceOption || attendanceOption.missionaryId !== dto.missionaryId) {
    throw new BadRequestException(
      `Attendance option ${dto.attendanceOptionId} does not belong to missionary ${dto.missionaryId}`,
    );
  }

  const encryptedIdentificationNumber = this.encryptionService.encrypt(
    dto.identificationNumber,
  );

  const result = await this.participationRepository.createAndIncrementCount(
    {
      name: dto.name,
      birthDate: dto.birthDate,
      applyFee: dto.applyFee,
      identificationNumber: encryptedIdentificationNumber,
      isOwnCar: dto.isOwnCar,
      missionaryId: dto.missionaryId,
      userId,
      createdBy: userId,
      // 신규 필드 (IMP-4)
      affiliation: dto.affiliation,
      attendanceOptionId: dto.attendanceOptionId,
      cohort: dto.cohort,
      hasPastParticipation: dto.hasPastParticipation ?? null,
      isCollegeStudent: dto.isCollegeStudent ?? null,
    },
    dto.missionaryId,
  );

  this.logger.log(
    `Successfully created participation ${result.id} for missionary ${dto.missionaryId}`,
  );

  return result;
}
```

**생성자에 AttendanceOptionRepository 주입 추가**:

```typescript
@Inject(ATTENDANCE_OPTION_REPOSITORY)
private readonly attendanceOptionRepository: AttendanceOptionRepository,
```

#### T8-2. Module 업데이트

**파일 (수정)**: `src/participation/participation.module.ts` — MissionaryModule에서 `ATTENDANCE_OPTION_REPOSITORY` export가 필요하므로 이미 T2에서 exports에 추가됨.

#### T8-3. 검증

```bash
pnpm --filter missionary-server build
```

---

### T9. CSV 동적 컬럼 리팩토링

**목적**: IMP-5 — 하드코딩된 CSV 컬럼을 동적으로 변경. 신규 고정 필드 + 커스텀 필드 동적 추가.

#### T9-1. CsvExportService 리팩토링

**파일 (수정)**: `src/common/csv/csv-export.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { write } from 'fast-csv';

import type { MissionaryFormField, ParticipationFormAnswer } from '../../../prisma/generated/prisma';

interface ParticipationCsvRow {
  name: string;
  birthDate: string;
  affiliation: string | null;
  cohort: number | null;
  attendanceOptionLabel: string | null;
  applyFee: number | null;
  isPaid: boolean;
  isOwnCar: boolean;
  hasPastParticipation: boolean | null;
  isCollegeStudent: boolean | null;
  teamName: string | null;
  createdAt: Date;
  formAnswers: ParticipationFormAnswer[];
}

@Injectable()
export class CsvExportService {
  async generateParticipationCsv(
    participations: ParticipationCsvRow[],
    formFields: MissionaryFormField[] = [],
  ): Promise<Buffer> {
    // 고정 컬럼
    const fixedHeaders = [
      '이름', '생년월일', '소속', '기수', '참석일정',
      '신청비용', '납부여부', '자차여부', '과거참여', '대학생여부',
      '팀', '등록일시',
    ];

    // 동적 컬럼 (커스텀 필드)
    const dynamicHeaders = formFields
      .sort((a, b) => a.order - b.order)
      .map((f) => f.label);

    const headers = [...fixedHeaders, ...dynamicHeaders];

    const records = participations.map((p) => {
      const fixed = {
        '이름': p.name,
        '생년월일': p.birthDate,
        '소속': p.affiliation ?? '',
        '기수': p.cohort ?? '',
        '참석일정': p.attendanceOptionLabel ?? '',
        '신청비용': p.applyFee ?? '',
        '납부여부': p.isPaid ? '납부완료' : '미납',
        '자차여부': p.isOwnCar ? 'Y' : 'N',
        '과거참여': p.hasPastParticipation === null ? '' : p.hasPastParticipation ? 'Y' : 'N',
        '대학생여부': p.isCollegeStudent === null ? '' : p.isCollegeStudent ? 'Y' : 'N',
        '팀': p.teamName ?? '미배정',
        '등록일시': p.createdAt.toISOString().split('T')[0],
      };

      // 동적 컬럼 값 매핑
      const dynamic: Record<string, string> = {};
      for (const field of formFields) {
        const answer = p.formAnswers.find((a) => a.formFieldId === field.id);
        dynamic[field.label] = answer?.value ?? '';
      }

      return { ...fixed, ...dynamic };
    });

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      write(records, {
        headers,
        quoteColumns: true,
      })
        .on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('end', () => {
          const csvBuffer = Buffer.concat(chunks);
          const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
          resolve(Buffer.concat([BOM, csvBuffer]));
        })
        .on('error', (error) => reject(error));
    });
  }
}
```

#### T9-2. Controller에서 formFields 전달

**파일 (수정)**: `src/participation/participation.controller.ts` — downloadCsv 메서드

```typescript
@Get('download/:missionaryId')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiOperation({ summary: '참가 신청 CSV 다운로드 (관리자/스태프 전용)' })
async downloadCsv(
  @Param('missionaryId', ParseUUIDPipe) missionaryId: string,
  @Response() res: ExpressResponse,
) {
  const result = await this.participationService.findAll({
    missionaryId,
    limit: 10000,
    offset: 0,
  });

  // 해당 선교의 formFields 목록 조회
  const formFields = await this.formFieldService.findByMissionary(missionaryId);

  // CSV 행 데이터 가공
  const rows = result.data.map((p) => ({
    name: p.name,
    birthDate: p.birthDate,
    affiliation: p.affiliation,
    cohort: p.cohort,
    attendanceOptionLabel: p.attendanceOption?.label ?? null,
    applyFee: p.applyFee,
    isPaid: p.isPaid,
    isOwnCar: p.isOwnCar,
    hasPastParticipation: p.hasPastParticipation,
    isCollegeStudent: p.isCollegeStudent,
    teamName: p.team?.teamName ?? null,
    createdAt: p.createdAt,
    formAnswers: p.formAnswers,
  }));

  const csvBuffer = await this.csvExportService.generateParticipationCsv(rows, formFields);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="participations-${missionaryId}.csv"`,
  );
  res.send(csvBuffer);
}
```

**Controller 생성자에 FormFieldService 주입 추가** 또는 FormFieldRepository 직접 주입.

#### T9-3. 검증

```bash
pnpm --filter missionary-server build
curl http://localhost:3100/participations/download/{missionaryId} \
  -H "Authorization: Bearer {admin-token}" \
  -o test.csv
# test.csv 열어서 신규 컬럼 + 커스텀 컬럼 확인
```

---

## 6. Wave 4: 통합 검증 + 잔여 작업

### T10. 기존 테스트 업데이트 + 신규 테스트

**목적**: BREAK-2, BREAK-3 해소. 기존 `participation.service.spec.ts` 수정 + 신규 서비스 테스트 추가.

#### T10-1. 기존 테스트 수정

**파일 (수정)**: `src/participation/participation.service.spec.ts`

**변경 사항**:
1. `update` 테스트 — `userId` 대신 `AuthenticatedUser` 객체 전달
2. ADMIN 케이스 추가: `'ADMIN이 타인 participation을 수정할 수 있다'` (IMP-1)
3. `remove` 테스트 — 동일한 AuthenticatedUser 변경
4. `findAll` 반환 타입 `{ data, total }` 구조로 변경
5. Factory에 신규 필드 추가된 상태이므로 기존 테스트는 그대로 통과 (nullable이므로)

**주요 추가 테스트 케이스**:

```typescript
describe('update', () => {
  // ... 기존 유지 ...

  it('ADMIN이 타인 participation을 수정할 수 있다', async () => {
    const ownerId = 'owner-1';
    const adminId = 'admin-1';
    const missionaryId = 'missionary-1';
    const user = makeUser({ id: ownerId });
    const missionary = makeMissionary({ id: missionaryId });

    fakeParticipationRepo.setUser(ownerId, user);
    fakeParticipationRepo.setMissionary(missionaryId, missionary);

    const participation = makeParticipation({
      id: 'participation-1',
      userId: ownerId,
      missionaryId,
    });
    await fakeParticipationRepo.create(participation);

    const adminUser: AuthenticatedUser = {
      id: adminId,
      email: 'admin@test.com',
      role: 'ADMIN',
      provider: null,
    };

    const dto: UpdateParticipationDto = { name: '관리자수정' };
    const result = await service.update('participation-1', dto, adminUser);
    expect(result.name).toBe('관리자수정');
  });
});
```

#### T10-2. 신규 서비스 테스트

**파일 (신규)**: `src/missionary/attendance-option.service.spec.ts`

테스트 케이스:
- `'참석 옵션을 생성한다'`
- `'존재하지 않는 선교에 옵션 생성 시 NotFoundException'`
- `'참석 옵션을 수정한다'`
- `'사용 중인 옵션 삭제 시 BadRequestException (N명 메시지)'`
- `'미사용 옵션은 정상 삭제된다'`

**파일 (신규)**: `src/missionary/form-field.service.spec.ts`

테스트 케이스:
- `'폼 필드를 생성한다'`
- `'비-SELECT 타입에 options 전달 시 무시한다'` (AMB-5)
- `'SELECT 타입에 options가 정상 저장된다'`
- `'폼 필드를 수정한다'`
- `'폼 필드를 삭제한다 (soft delete)'`

#### T10-3. 검증

```bash
pnpm --filter missionary-server test
# 전체 테스트 PASS 확인
```

---

### T11. 통합 검증

**목적**: 전체 빌드 + 테스트 + 라우팅 검증.

#### T11-1. 빌드 검증

```bash
pnpm --filter missionary-server build
# Expected: 0 errors
```

#### T11-2. 전체 테스트

```bash
pnpm --filter missionary-server test
# Expected: All PASS
```

#### T11-3. API 엔드포인트 검증 (dev 서버)

```bash
# 1. AttendanceOption CRUD
curl -X POST http://localhost:3100/missionaries/{missionaryId}/attendance-options \
  -H "Content-Type: application/json" -H "Authorization: Bearer {admin}" \
  -d '{"type":"FULL","label":"풀참석","order":0}'

curl http://localhost:3100/missionaries/{missionaryId}/attendance-options

# 2. FormField CRUD
curl -X POST http://localhost:3100/missionaries/{missionaryId}/form-fields \
  -H "Content-Type: application/json" -H "Authorization: Bearer {admin}" \
  -d '{"fieldType":"TEXT","label":"주소지","isRequired":false,"order":0}'

curl http://localhost:3100/missionaries/{missionaryId}/form-fields

# 3. Participation 목록 (페이지네이션)
curl "http://localhost:3100/participations?missionaryId={id}&limit=20&offset=0"
# Expected: { data: [...], total: N }

# 4. Participation 목록 (query 검색)
curl "http://localhost:3100/participations?missionaryId={id}&query=홍길동"

# 5. Participation 목록 (attendanceType 필터)
curl "http://localhost:3100/participations?missionaryId={id}&attendanceType=FULL"

# 6. FormAnswer 저장
curl -X PATCH http://localhost:3100/participations/{id}/answers \
  -H "Content-Type: application/json" -H "Authorization: Bearer {token}" \
  -d '{"answers":[{"formFieldId":"...","value":"서울시 강남구"}]}'

# 7. CSV 다운로드 (신규 컬럼 확인)
curl http://localhost:3100/participations/download/{missionaryId} \
  -H "Authorization: Bearer {admin}" -o test.csv
```

---

## 7. 미결 사항 (PO/FE 협의 필요)

| # | 항목 | 상세 | 관련 |
|---|------|------|------|
| 1 | Migration default 값 | 기존 Participation의 `affiliation`, `attendanceOptionId`, `cohort` 기본값. 현재 결정: nullable 유지. 향후 데이터 마이그레이션 스크립트 별도 필요? | AMB-1 |
| 2 | query 검색 범위 | PRD는 이름 기준이지만, FE가 소속(affiliation) 검색도 원하는지 | AMB-3 |
| 3 | FormAnswer cross-validation | formFieldId가 해당 missionary 소속인지 검증하는 추가 쿼리 비용 vs 신뢰 트레이드오프 | TRAP-4 |
| 4 | CSV 최대 행 제한 | 현재 limit 10000으로 설정. 실제 운영에서 이 이상이 필요한 경우 스트리밍 구현 필요 | T9 |
| 5 | FormField fieldType 변경 | 생성 후 fieldType 변경 허용 여부. 현재 구현: 변경 불가 (UpdateFormFieldDto에 fieldType 제외 가능) | T3 |

---

## 8. 테스트 전략

### 8-1. 테스트 레이어

| 레이어 | 범위 | 도구 |
|--------|------|------|
| Unit (Service) | 비즈니스 로직, 권한 검증, 데이터 변환 | Jest + Fake Repository |
| Unit (Processor) | BullMQ job 처리, cross-validation | Jest + Fake Repository |
| Build | 타입 안전성, 컴파일 에러 | `pnpm build` |
| API 수동 | 엔드포인트 동작 확인 | curl |

### 8-2. 테스트 파일 목록

| 파일 | 상태 | 주요 케이스 |
|------|------|------------|
| `participation.service.spec.ts` | **수정** | ADMIN 수정 권한, 페이지네이션 응답, formAnswers 통합 처리 |
| `attendance-option.service.spec.ts` | **신규** | CRUD, 사용 중 삭제 불가 |
| `form-field.service.spec.ts` | **신규** | CRUD, 비-SELECT options 무시 |

### 8-3. Fake Repository 전략

- 신규 3개 Fake: `FakeAttendanceOptionRepository`, `FakeFormFieldRepository`, `FakeFormAnswerRepository`
- 기존 `FakeParticipationRepository`의 `buildEntity` + `withRelations` 업데이트 (TRAP-7)
- `withRelations`에 `team: null`, `attendanceOption: null`, `formAnswers: []` 기본값 추가

---

## 9. 위험 요소 및 완화 방안

| # | 위험 | 심각도 | 완화 방안 |
|---|------|:------:|----------|
| 1 | `ParticipationWithRelations` 타입 확장 → 연쇄 컴파일 에러 (BREAK-1) | **높음** | Wave 1에서 Factory/Fake를 atomic하게 업데이트. build 실패 즉시 감지. |
| 2 | 기존 테스트 Factory 누락 (BREAK-2) | **높음** | T1에서 Factory에 신규 필드 추가. nullable이므로 기존 테스트는 override 없이도 통과. |
| 3 | `update` 시그니처 변경 (BREAK-3) | **중간** | Controller → Service 호출부 동시 변경. userId → AuthenticatedUser. |
| 4 | PrismaService soft delete 미들웨어와 중복 (TRAP-1) | **낮음** | 신규 모델은 전역 미들웨어에 자동 적용됨. delete() 호출 시 soft delete 동작 확인. |
| 5 | `PATCH :id/answers`와 `PATCH :id` 라우팅 충돌 | **중간** | Controller 내 메서드 순서로 해결. 구체적 경로(`answers`)를 먼저 정의. |
| 6 | `ValidationPipe` whitelist 미적용 (BREAK-5) | **중간** | 모든 신규 DTO에 class-validator 데코레이터 누락 없이 적용. whitelist: true 시 데코레이터 없는 필드는 제거됨. |
| 7 | MissionaryModule exports 누락 (BREAK-4) | **중간** | T2에서 `ATTENDANCE_OPTION_REPOSITORY` exports 추가. ParticipationModule에서 import 가능 확인. |

---

## 10. 커밋 전략

| Wave | 커밋 메시지 | 포함 파일 | 사전 검증 |
|------|-----------|----------|----------|
| Wave 1 | `feat(participation): Prisma 스키마 확장 — 등록 관리 신규 모델 및 필드 추가` | schema.prisma, migration, factories, fakes | `prisma:generate && build && test` |
| Wave 2 | `feat(missionary): AttendanceOption, FormField CRUD API 추가` | attendance-option.*, form-field.*, form-answer.*, missionary.module.ts | `build && test` |
| Wave 3 | `feat(participation): DTO 확장, 페이지네이션, 권한 모델 변경, CSV 동적 컬럼` | participation.*.ts, csv-export.service.ts | `build && test` |
| Wave 4 | `test(participation): 신규 필드 및 권한 변경 테스트 추가` | *.spec.ts | `test` |

---

## 11. 성공 기준

- [ ] `pnpm --filter missionary-server prisma:generate` — 성공
- [ ] `pnpm --filter missionary-server build` — 0 errors
- [ ] `pnpm --filter missionary-server test` — All PASS
- [ ] GET `/participations?missionaryId=X` → `{ data: [...], total: N }` 형식 응답
- [ ] GET `/participations?query=홍` → 이름 검색 동작
- [ ] GET `/participations?attendanceType=FULL` → 필터 동작
- [ ] POST `/missionaries/:id/attendance-options` → 옵션 생성
- [ ] POST `/missionaries/:id/form-fields` → 필드 생성
- [ ] PATCH `/participations/:id/answers` → 답변 저장
- [ ] ADMIN이 타인 participation PATCH 가능
- [ ] 사용 중 AttendanceOption 삭제 시 400 반환
- [ ] CSV 다운로드에 신규 고정 컬럼 + 커스텀 컬럼 포함
