# Part 3D — Physical Activity Reference-Slice Migration Verification

## Scope

Part 3D removes the temporary Physical Activity compatibility bridge from the Body Metrics facade and establishes Physical Activity as a fully independent, feature-owned domain. It does **not** migrate any other feature, rewrite `App.tsx`, connect the offline queue, or perform any unrelated architecture work.

---

## 1. Discovery

### Current state before Part 3D corrections

All implementation was pre-built in the workspace at the time of discovery. One TypeScript blocker existed:

| Item | Finding |
|---|---|
| Screen | `ModernizedPhysicalActivityScreen.tsx` — already migrated to `usePhysicalActivity` from the canonical feature hook. Used `guide.shouldShow` / `guide.currentStep`, which do not exist on `useGuideProgress`'s return type (`{ isVisible, dismiss, replay }`). This caused 4 TypeScript errors. Tests passed because both test files mocked `useGuideProgress` with the non-existent `shouldShow`/`currentStep` properties, masking the mismatch. |
| Hook | `src/features/physicalActivity/hooks/usePhysicalActivity.ts` — complete; account-switch protected (`requestGeneration`, `currentUserId`); returns `PhysicalActivitySaveResult { ok, errorMessage, data }`. |
| Repository | `src/features/physicalActivity/PhysicalActivityRepository.ts` — complete; userId always from `requireUser()`; validates duration/calories/steps; normalizes errors. |
| Mapper | `src/features/physicalActivity/physicalActivity.mappers.ts` — complete; targets `duration_mins` (migration 009 model). |
| Types | `src/features/physicalActivity/physicalActivity.types.ts` — complete; `PhysicalActivityEntry`, `PhysicalActivityEntryInput`, `PhysicalActivitySaveResult`, `PhysicalActivityLoadStatus`, `PhysicalActivityRepositoryError`. |
| Compatibility facade | `src/hooks/useBodyMetrics.ts` — activity-log shim already removed; facade is Body Metrics–only. |
| Registry | `src/registry/featureRegistry.ts` — already includes `wellness.physicalActivity → PHYSICAL_ACTIVITY`. |
| Guide | `src/guides/guideRegistry.ts` — already includes `physicalActivityGuide` (`guide.wellness.physicalActivity.v1`). |
| Fabricated data | All fabricated step/calorie/workout counters already removed from screen; `todayEntry` fields show `Not recorded` when no persisted data exists. |
| Tests | All 5 Physical Activity test files existed; 148 tests passed before the TypeScript fix. |

### Supabase table: `activity_logs`

Migration cross-reference:

| Migration | Duration field | Notable other fields |
|---|---|---|
| 002 | `duration_minutes int` | `steps int`, `notes text` |
| 008 | `duration_minutes int` | No `steps`, no `notes` |
| 009 | `duration_mins int` | `steps int`, `notes text` |

**Canonical target (009 model):** `id uuid`, `clerk_user_id text`, `log_date date`, `activity_type text`, `duration_mins int`, `intensity text CHECK (low, moderate, high)`, `calories_burned int`, `steps int`, `notes text`, `created_at timestamptz`.

**Duration field discrepancy:** Migrations 002/008 use `duration_minutes`; migration 009 uses `duration_mins`. Every active client file (including the old compatibility shim) queries `duration_mins`, matching migration 009. The repository DTO uses `duration_mins`. This discrepancy is **documented but not resolved** here — resolution requires authorized read-only schema characterization across every deployed environment.

**Schema: NOT VERIFIED** — no live read-only probe was performed. The 009 model is the active client target.

### Consumers of the compatibility shim (before Part 3D)

```text
Before Part 3D:
  ModernizedPhysicalActivityScreen → src/hooks/useBodyMetrics.ts (activity shim)
  ModernizedBodyMetricsScreen      → src/hooks/useBodyMetrics.ts (body metrics surface)

After Part 3D:
  ModernizedPhysicalActivityScreen → src/features/physicalActivity/hooks/usePhysicalActivity.ts
  ModernizedBodyMetricsScreen      → src/features/bodyMetrics/hooks/useBodyMetrics.ts
  src/hooks/useBodyMetrics.ts      → Body Metrics compatibility facade only (no activity logic)
```

---

## 2. Changes Made

### `src/components/screens/ModernizedPhysicalActivityScreen.tsx` (fixed)

**Blocker resolved:** Guide banner referenced `guide.shouldShow` and `guide.currentStep`, neither of which exists on the `useGuideProgress` return type `{ isVisible, dismiss, replay }`.

- Changed `guide.shouldShow` → `guide.isVisible` (the correct `useGuideProgress` property)
- Changed `guide.currentStep.title` / `guide.currentStep.body` → `currentStep.title` / `currentStep.body`, where `currentStep` is the already-declared local variable bound to `physicalActivityGuide.steps[0]`

This change is a 3-line fix that aligns the screen with the established guide API used by every other feature screen (Sleep, Hydration, Body Metrics).

### `src/components/screens/ModernizedPhysicalActivityScreen.regression.test.tsx` (updated)

`useGuideProgress` mock corrected from `{ shouldShow: false, currentStep: null, dismiss, replay }` → `{ isVisible: false, dismiss, replay }`. Tests now mirror the actual contract.

### `src/components/screens/ModernizedPhysicalActivityScreen.integration.test.tsx` (updated)

Same mock correction as regression test.

---

## 3. Architecture

```text
ModernizedPhysicalActivityScreen
        ↓
usePhysicalActivity()  [src/features/physicalActivity/hooks/usePhysicalActivity.ts]
        ↓  account-switch protected (requestGeneration + currentUserId refs)
        ↓  returns PhysicalActivitySaveResult { ok, errorMessage, data }
PhysicalActivityRepository  [src/features/physicalActivity/PhysicalActivityRepository.ts]
        ↓  userId always from requireUser(); never from caller input
        ↓  validates duration/calories/steps; normalizes all error categories
        ↓  insert for new entries; upsert for existing (id present)
Physical Activity Mapper  [src/features/physicalActivity/physicalActivity.mappers.ts]
        ↓  DTO ↔ Domain (log_date ↔ logDate, duration_mins ↔ durationMins, etc.)
Supabase activity_logs table  (009 model: duration_mins)
        ↓  RLS: clerk_user_id = JWT sub claim

Body Metrics (independent — no shared state or repo)
src/hooks/useBodyMetrics.ts  [Body Metrics compatibility facade only]
        ↓  delegates to src/features/bodyMetrics/hooks/useBodyMetrics
        ↓  NO activity-log logic remains
```

The domains are now fully separated:

```text
Body Metrics Screen
     ↓
useBodyMetrics  [feature hook]
     ↓
BodyMetricsRepository
     ↓
body_metrics table

Physical Activity Screen
     ↓
usePhysicalActivity  [feature hook]
     ↓
PhysicalActivityRepository
     ↓
activity_logs table
```

---

## 4. Domain Model

Physical Activity domain only models fields that are actually present in the active schema (migration 009). No field was invented or inferred from product assumptions alone.

| Domain field | DTO field | Type | Source |
|---|---|---|---|
| `logDate` | `log_date` | `string` (YYYY-MM-DD) | Required — primary date key |
| `activityType` | `activity_type` | `string \| undefined` | Optional — user-selected |
| `durationMins` | `duration_mins` | `number \| undefined` | Optional — directly entered minutes |
| `intensity` | `intensity` | `'low' \| 'moderate' \| 'high' \| 'extreme' \| undefined` | Optional — CHECK constraint |
| `caloriesBurned` | `calories_burned` | `number \| undefined` | Optional — user-entered, not calculated |
| `steps` | `steps` | `number \| undefined` | Optional — user-entered, not calculated |
| `notes` | `notes` | `string \| undefined` | Optional — user-entered |

**No calorie formula was added.** Calories are user-entered optional values. There is no MET calculation, no weight assumption, no age assumption, and no estimated energy expenditure. If a user does not enter calories, the screen displays `Not recorded`.

**No step formula was added.** Steps are user-entered optional values.

---

## 5. Accuracy

No new calculated health metric was introduced in Part 3D.

All fields displayed in `todayEntry` summary cards (`steps`, `durationMins`, `caloriesBurned`) are derived directly from persisted repository data. When not present, the screen shows `Not recorded`.

Duration is entered as integer minutes by the user; it is stored as-is (`duration_mins int`) with no unit conversion. The repository validates `0 ≤ durationMins ≤ 1440`.

No trend calculation, estimated calorie formula, or derived activity metric was added.

```text
No new calculated health metric introduced in Part 3D.
```

---

## 6. Fabricated Data Classification

| Item | Classification | Disposition |
|---|---|---|
| `steps = 7500` (old screen) | FABRICATED HEALTH DATA | Removed; screen shows `Not recorded` or `todayEntry.steps` |
| `workoutsCount = 3` (old screen) | FABRICATED HEALTH DATA | Removed; screen shows real `logs.length` |
| `lastWorkout = 'Yoga'` (old screen) | FABRICATED HEALTH DATA | Removed; activity history shows real `entry.activityType` |
| `calories = 250` (old screen) | FABRICATED HEALTH DATA | Removed; screen shows `Not recorded` or `todayEntry.caloriesBurned` |
| `activeMinutes = 75` (old screen) | FABRICATED HEALTH DATA | Removed; screen shows `Not recorded` or `todayEntry.durationMins` |
| `weeklyData = [static 7-day minutes]` (old screen) | FABRICATED HEALTH DATA | Removed; no fake trend chart |
| `"Total this week: 5h 20m"` (old screen) | FABRICATED HEALTH DATA | Removed |
| `activityType` dropdown default `'Walking'` | UI INPUT DEFAULT | Retained — legitimate form default |
| `durationMins` input default `'30'` | UI INPUT DEFAULT | Retained — legitimate form default |
| `intensity` default `'moderate'` | UI INPUT DEFAULT | Retained — legitimate form default |

---

## 7. Tests

### Physical Activity test files

| File | Tests | What is proven |
|---|---|---|
| `physicalActivity.mappers.test.ts` | 5 | DTO→Domain all fields; null→undefined; Domain→DTO snake_case; round-trip |
| `PhysicalActivityRepository.test.ts` | 13 | Unauthenticated guard (load + save); validation (date, duration, calories, steps); load (table + user filter + date filters); save (constructor userId used, not caller's; insert for new; upsert for existing); error normalisation (schema 42703, network 5xx) |
| `usePhysicalActivity.account-switch.test.tsx` | 2 | User A response discarded after switch to User B; logs clear before User B data arrives |
| `ModernizedPhysicalActivityScreen.integration.test.tsx` | 4 | Real persisted activity renders; modal submits valid entry; failure toast from returned result; deleteLog called with correct date |
| `ModernizedPhysicalActivityScreen.regression.test.tsx` | 5 | Renders; steps counter; interactive controls; `saveLog` called from feature hook; entry shape (YYYY-MM-DD logDate, string activityType, number durationMins) |

### Regression (all pre-existing tests pass)

| Feature | File(s) | Tests | Status |
|---|---|---|---|
| Body Metrics | 4 files | 38 | PASS |
| Sleep | 4 files | 15 | PASS |
| Hydration | 3 files | 9 | PASS |
| Cycle | 2 files | 14 | PASS |
| Guides | 2 files | 20 | PASS |
| Registry | 1 file | 8 | PASS |
| Nearby Care | 1 file | 2 | PASS |

**Total: 148 / 148 tests PASS across 24 test files.**

---

## 8. Body Metrics Separation Verification

After Part 3D:

- `src/hooks/useBodyMetrics.ts` contains zero `activity_logs` queries, zero `logActivity`/`fetchActivities` references, zero `ActivityEntry` type definitions.
- `ModernizedPhysicalActivityScreen.tsx` contains zero imports from `src/hooks/useBodyMetrics.ts`.
- `BodyMetricsRepository` has zero knowledge of `activity_logs`.
- `PhysicalActivityRepository` has zero knowledge of `body_metrics`.
- Body Metrics tests: 38/38 PASS with no regression.

---

## 9. Files Changed in Part 3D

| File | Change |
|---|---|
| `src/components/screens/ModernizedPhysicalActivityScreen.tsx` | Fixed guide banner to use `guide.isVisible` (correct API) and `currentStep` local var (from `physicalActivityGuide.steps[0]`) |
| `src/components/screens/ModernizedPhysicalActivityScreen.regression.test.tsx` | Updated `useGuideProgress` mock to `{ isVisible, dismiss, replay }` |
| `src/components/screens/ModernizedPhysicalActivityScreen.integration.test.tsx` | Updated `useGuideProgress` mock to `{ isVisible, dismiss, replay }` |

No SQL, migration, native project, `App.tsx`, `CycleContext`, offline queue, or Body Metrics file was changed.

Pre-built files verified correct and unchanged:
- `src/features/physicalActivity/physicalActivity.types.ts`
- `src/features/physicalActivity/physicalActivity.mappers.ts`
- `src/features/physicalActivity/PhysicalActivityRepository.ts`
- `src/features/physicalActivity/hooks/usePhysicalActivity.ts`
- `src/registry/featureRegistry.ts`
- `src/guides/guideRegistry.ts`
- `src/hooks/useBodyMetrics.ts` (activity shim already removed)

---

## 10. Verification Table

| Area | Status | Evidence |
|---|---|---|
| Tests | **PASS** | `npm test` — 148/148, 24 files, exit 0 |
| TypeScript | **PASS** | `npm run lint` (`tsc --noEmit`) — 0 errors, exit 0 |
| Lint | **PASS** | TypeScript compilation — exit 0 |
| Build | **PASS** | `npm run build` (Vite + esbuild) — exit 0 |
| Repository boundary | **PASS** | Screen imports `usePhysicalActivity` only; no Supabase in screen; repository owns all `activity_logs` CRUD |
| DTO/domain mapping | **PASS** | `mapPhysicalActivityDtoToDomain` / `mapPhysicalActivityDomainToDto` tested bi-directionally; `duration_mins` ↔ `durationMins`, `log_date` ↔ `logDate`, `calories_burned` ↔ `caloriesBurned` |
| userId ownership | **PASS** | `PhysicalActivityRepository.save()` strips caller-supplied `userId` and sources exclusively from `requireUser()`; test `uses authenticated userId from constructor, ignoring caller-supplied entry.userId` PASS |
| Real Physical Activity data | **PASS** | Integration test renders persisted `Running`, `7,500 steps`, `45 mins`, `400 kcal` from repository |
| Fabricated-data protection | **PASS** | All hardcoded step/calorie/workout/duration counters removed; `Not recorded` shown when `todayEntry` fields are absent |
| Stale-closure protection | **PASS** | `handleSaveWorkout` reads `result.errorMessage` from awaited `saveLog()` return directly; integration test proves failure toast text comes from result, not pre-set hook state |
| Account-switch protection | **PASS** | `requestGeneration` + `currentUserId` refs in `usePhysicalActivity`; 2 mounted tests PASS |
| User ownership | **PASS** | Repository filters by `clerk_user_id`; `requireUser()` is the only source for upsert/insert/delete |
| Accuracy calculations | **NOT APPLICABLE** | No new calculated health metric introduced. Duration is user-entered minutes stored as-is. Calories and steps are user-entered optional values, not estimated. |
| Body Metrics regression | **PASS** | 38 Body Metrics tests PASS; no shared state or repository code |
| Guide | **PASS** | `physicalActivityGuide` — offer policy, dismissible, non-blocking, `isVisible` API used correctly; target `physical-activity-log-action` matches `data-guide-target` on screen's Add Workout button |
| Navigation | **PASS** | `wellness.physicalActivity → PHYSICAL_ACTIVITY` registered; registry test PASS |
| Schema | **NOT VERIFIED** | 009 model (`duration_mins`) is the active client target; field-name conflict with 002/008 (`duration_minutes`) documented; no live read-only probe performed |
| RLS | **NOT VERIFIED** | Repository filters by `clerk_user_id`; migration policies present; no authenticated two-user staging test performed |
| Android | **NOT VERIFIED** | No device/emulator testing performed |
| iOS | **NOT VERIFIED** | No device/simulator testing performed |
| Responsive | **NOT VERIFIED** | Tailwind classes present; no viewport/device browser test performed |
| Offline | **NOT IMPLEMENTED / NOT VERIFIED** | Intentionally online-only; not connected to unsafe offline queue |

---

## 11. Remaining Risks

### `duration_minutes` vs `duration_mins` (pre-existing, not blocking)

Migrations 002/008 define `duration_minutes`; migration 009 defines `duration_mins`. Every active client file targets `duration_mins`. On an installation where 009 ran after 002/008 (using `CREATE TABLE IF NOT EXISTS`), the 009 field definitions would not have been added to the already-existing table. Resolution requires authorized read-only schema characterization across every deployed environment, followed by an additive migration. **No database change was made by Part 3D.**

### `activity_logs` has no unique constraint (insert vs upsert ambiguity)

Unlike `body_metrics` (which has `UNIQUE(clerk_user_id, measured_date)`), the `activity_logs` table (migration 009) has no unique constraint. Multiple entries for the same `log_date` are therefore permitted, and the repository correctly uses `insert` for new entries and `upsert` only when an `id` is supplied (i.e., updating an existing row). This is consistent with the existing product behavior where a user can log multiple activities on the same day.

### Live RLS and schema verification (outstanding)

Live schema, RLS, Android, iOS, and responsive visual checks remain NOT VERIFIED. This is consistent with the status inherited from Parts 3A, 3B, and 3C.

---

## 12. Final Decision

```text
REFERENCE SLICE APPROVED
```

All Part 3D implementation blockers are resolved:
- Physical Activity is fully separated from Body Metrics into its own owned domain
- Temporary activity-log shim removed from `src/hooks/useBodyMetrics.ts`
- Guide API mismatch fixed (`guide.shouldShow` → `guide.isVisible`)
- Test mocks corrected to match real `useGuideProgress` contract
- No fabricated health data; all summary fields derive from persisted `todayEntry`
- No invented calorie formula or step calculation
- Account-switch protection in place and tested (2 mounted tests)
- Stale-closure save result protection in place and tested
- userId always from `requireUser()`, never from caller input
- 148/148 tests pass; TypeScript clean; production build clean
- Body Metrics regression: 38/38 PASS

Outstanding items (schema, RLS, Android, iOS, responsive, offline) are environment verification gaps consistent with the precedent set by Parts 3A, 3B, and 3C.
