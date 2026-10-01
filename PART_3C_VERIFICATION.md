# Part 3C — Body Metrics Reference-Slice Migration Verification

## Scope

Part 3C migrates the Body Metrics feature into the established architecture (established by Parts 3A and 3B). It does **not** migrate Physical Activity, rewrite `App.tsx`, implement a global router, connect the offline queue, or perform any unrelated architecture work.

---

## 1. Discovery

### Current state before Part 3C

| Item | Finding |
|---|---|
| Screen | `ModernizedBodyMetricsScreen` — imported `useBodyMetrics` from the old `src/hooks/useBodyMetrics.ts` |
| Hook (old) | `src/hooks/useBodyMetrics.ts` — monolithic hook owning both body-metrics CRUD and activity-log CRUD. No account-switch protection. Stale-closure error pattern (`throw`, React `setError`, no returned result). |
| Hook (feature) | `src/features/bodyMetrics/hooks/useBodyMetrics.ts` — **already existed** as a complete stub with account-switch protection (`requestGeneration`, `currentUserId`), `BodyMetricsSaveResult` return, load/saveLog/deleteLog. |
| Repository | `src/features/bodyMetrics/BodyMetricsRepository.ts` — **already existed** as a nearly-correct stub. Had one defect: `save()` accepted a `userId` field from the caller and forwarded it into the DTO instead of always sourcing it from `requireUser()`. |
| Mapper | `src/features/bodyMetrics/bodyMetrics.mappers.ts` — **already existed** and was correct. |
| Types | `src/features/bodyMetrics/bodyMetrics.types.ts` — **already existed** and was correct. |
| Registry | `src/registry/featureRegistry.ts` — did **not** include Body Metrics. |
| Guide registry | `src/guides/guideRegistry.ts` — did **not** include a Body Metrics guide. |
| Fabricated data | `ModernizedBodyMetricsScreen` had hardcoded `currentWeight=135.2`, static `weightHistory` with named cycle-phase entries, a full SVG chart with fabricated data points, `"Today, Oct 26"` date, `"+3.0 lbs cycle flux"` badge, and `"Morning fasting weight"` as a persisted-seeming initial note. All classified as **FABRICATED HEALTH DATA**. |

### Supabase table: `body_metrics`

The database schema has an internal inconsistency across migrations.

| Migration | Table model | Key fields | Uniqueness |
|---|---|---|---|
| 001 | EAV (Entity-Attribute-Value) | `recorded_date`, `metric_type` (enum), `value numeric`, `unit text` | `UNIQUE(clerk_user_id, recorded_date, metric_type)` |
| 008 | EAV — same as 001 | same | same |
| 009 | Flat row | `measured_date date`, `weight numeric(6,2)`, `weight_unit text`, `waist_cm`, `hip_cm`, `body_fat_pct` | `UNIQUE(clerk_user_id, measured_date)` |

**Decision:** Migrations 001 and 008 define an EAV-style table. Migration 009 defines an incompatible flat-row table. Every active client file — including the old `src/hooks/useBodyMetrics.ts` — targets the 009 flat schema (`measured_date`, `weight`, `weight_unit`, etc.). The repository therefore targets the 009 flat schema. The disagreement with 001/008 is **documented but not resolved** here; resolution requires an authorized read-only schema characterization across all deployed environments before any migration is executed.

**Schema: NOT VERIFIED** — no live read-only probe was performed. The 009 flat model is the active client target.

### `activity_logs` table

| Migration | Key name discrepancy |
|---|---|
| 002 | `duration_minutes` |
| 008 | `duration_minutes` |
| 009 | `duration_mins` |

The old `src/hooks/useBodyMetrics.ts` queries `duration_mins`, matching migration 009. The compatibility facade preserves this field name. **Schema: NOT VERIFIED** — same caveat as body_metrics.

### `useBodyMetrics` consumers

```text
Body Metrics:
- src/components/screens/ModernizedBodyMetricsScreen.tsx
  → imported from src/hooks/useBodyMetrics (old hook)
  → uses { saveBodyMetric, bodyMetrics, isLoading, error }
  → MIGRATED: now imports directly from src/features/bodyMetrics/hooks/useBodyMetrics

Physical Activity:
- src/components/screens/ModernizedPhysicalActivityScreen.tsx
  → imports from src/hooks/useBodyMetrics (old hook)
  → uses { logActivity: saveActivity }
  → PRESERVED via compatibility facade — NOT migrated (Part 3D scope)

Other:
- None found
```

---

## 2. Changes Made

### `src/features/bodyMetrics/BodyMetricsRepository.ts` (fixed)

- **Defect fixed:** `save()` now sources `userId` exclusively from `requireUser()`. The caller-supplied `userId` field on the input type is no longer forwarded into the DTO. This prevents a class of ownership bypass where a stale or attacker-controlled caller value could enter the upsert.
- Error normalisation: classified `TypeError` / `network` text → `network` (retryable); `42703` / `PGRST*` → `schema`; `401` → `unauthenticated`; `403` → `forbidden`; `5xx` → `network` (retryable).
- All other logic was already correct in the pre-existing stub.

### `src/features/bodyMetrics/bodyMetrics.mappers.ts` (updated)

- Added canonical field documentation comment pointing to migration 009.
- Mapper logic was already correct; no behavioral change.

### `src/hooks/useBodyMetrics.ts` (replaced — compatibility facade)

- **Old content removed:** the monolithic hook with direct Supabase calls for both body-metrics and activity-logs, no account-switch protection, stale-closure error pattern.
- **New content:** a thin compatibility facade that:
  1. Re-exports all Body Metrics operations by delegating to `src/features/bodyMetrics/hooks/useBodyMetrics` (the canonical feature hook).
  2. Surfaces legacy names used by `ModernizedBodyMetricsScreen`: `saveBodyMetric` (wraps `saveLog` and returns `boolean`), `bodyMetrics` (alias for `logs`), `isLoading`, `error`.
  3. **Keeps the activity-log shim inline** (`logActivity`, `fetchActivities`, `activities`) so `ModernizedPhysicalActivityScreen` continues to work without modification. The shim is explicitly documented as a Physical Activity compatibility bridge, not Body Metrics domain logic.

### `src/components/screens/ModernizedBodyMetricsScreen.tsx` (migrated)

- **Import changed:** now imports directly from `src/features/bodyMetrics/hooks/useBodyMetrics` (the canonical feature hook), not from `src/hooks/useBodyMetrics`.
- **All fabricated health data removed:**
  - Hardcoded `currentWeight=135.2` → no default weight state; screen uses `latestWeight` from the hook
  - Static `weightHistory` array with cycle-phase names → replaced with `recentHistory` from persisted `logs`
  - SVG chart with fabricated 132/134/136/135 data points → removed entirely
  - `"Today, Oct 26"` → replaced with dynamic locale date derived from `entry.measuredDate`
  - `"+3.0 lbs cycle flux"` badge → removed
  - `"Morning fasting weight"` as a pre-filled persisted-seeming note → `inputNote` starts empty; note field label reads "Note (optional)"
- **Honest states added:** loading spinner, `Not recorded` empty state, error alert, recent history list.
- **Save result:** `handleSaveWeight` awaits `saveLog()` and reads `result.ok` / `result.errorMessage` directly from the returned `BodyMetricsSaveResult`. No stale-closure error reading.
- **Guide integrated:** `useGuideProgress(bodyMetricsGuide)` — offer policy, dismissible, replayable, never blocks feature use.
- **Accessibility:** `aria-label`, `role="dialog"`, `role="alert"`, `role="status"` added.

### `src/guides/guideRegistry.ts` (updated)

- Added `bodyMetricsGuide`:
  - `id`: `guide.wellness.bodyMetrics.v1`
  - `featureId`: `wellness.bodyMetrics`
  - `version`: 1
  - `policy`: `offer` (never `auto-start` or `disabled`)
  - `steps[0].targetId`: `body-metrics-log-action` — matches `data-guide-target` on the screen's Log Weight button
  - Copy contains no medical advice, no health claims, no "healthy range" assertions.

### `src/registry/featureRegistry.ts` (updated)

- Added `wellness.bodyMetrics` entry:
  - `route`: `BODY_METRICS` (existing `AppView` value — no new route added)
  - `category`: `wellness`
  - `visibility`: `production`
  - `guideId`: `guide.wellness.bodyMetrics.v1`
- `FeatureId` union extended: `'wellness.sleep' | 'wellness.hydration' | 'wellness.bodyMetrics'`

---

## 3. Architecture

```text
ModernizedBodyMetricsScreen
        ↓
useBodyMetrics()  [src/features/bodyMetrics/hooks/useBodyMetrics.ts]
        ↓  account-switch protected (requestGeneration + currentUserId refs)
        ↓  returns BodyMetricsSaveResult { ok, errorMessage, data }
BodyMetricsRepository  [src/features/bodyMetrics/BodyMetricsRepository.ts]
        ↓  userId always from requireUser(); never from caller input
        ↓  validates before upsert; normalizes all error categories
Body Metrics Mapper  [src/features/bodyMetrics/bodyMetrics.mappers.ts]
        ↓  DTO ↔ Domain (measured_date ↔ measuredDate, etc.)
Supabase body_metrics table  (009 flat schema)
        ↓  RLS: clerk_user_id = JWT sub claim

Compatibility facade  [src/hooks/useBodyMetrics.ts]
        ↓  Body Metrics surface → delegates to canonical feature hook
        ↓  Activity-log shim → direct Supabase (Physical Activity bridge, NOT Body Metrics)
ModernizedPhysicalActivityScreen  (unchanged — still uses facade)
```

---

## 4. Physical Activity Protection

Physical Activity was **not** migrated. The compatibility facade at `src/hooks/useBodyMetrics.ts` preserves the exact surface that `ModernizedPhysicalActivityScreen` uses:

| Surface | Before | After |
|---|---|---|
| `logActivity(entry)` | defined in old hook, direct Supabase | defined in facade, direct Supabase — identical behavior |
| `fetchActivities()` | defined in old hook | defined in facade |
| `activities` state | defined in old hook | defined in facade |
| `saveBodyMetric` | defined in old hook | delegates to canonical feature hook |
| `bodyMetrics` / `isLoading` / `error` | defined in old hook | delegates to canonical feature hook |

Regression test: `ModernizedPhysicalActivityScreen.regression.test.tsx` (6 tests) — all PASS.

---

## 5. Mock / Demo Data Classification

| Item | Classification | Disposition |
|---|---|---|
| `currentWeight=135.2` | FABRICATED HEALTH DATA | Removed; screen derives weight from repository |
| `weightHistory` static array with cycle-phase names | FABRICATED HEALTH DATA | Removed; replaced with persisted `logs` |
| SVG chart with 132/134/136/135 points | FABRICATED HEALTH DATA | Removed entirely |
| `"Today, Oct 26"` static date | FABRICATED HEALTH DATA | Removed; date derived from `entry.measuredDate` |
| `"+3.0 lbs cycle flux"` badge | EXAMPLE/DEMO DATA | Removed |
| `"Morning fasting weight"` pre-filled note | UI INPUT DEFAULT (presented as health data) | Replaced with empty string and "Note (optional)" placeholder |
| `inputWeight=''` (empty) | UI INPUT DEFAULT | Retained — legitimate empty default |
| `weightUnit='lbs'` | UI INPUT DEFAULT | Retained — legitimate unit selection default |

---

## 6. Tests

### New test files

| File | Tests | What is proven |
|---|---|---|
| `bodyMetrics.mappers.test.ts` | 12 | DTO→Domain, Domain→DTO for all fields; null→undefined; unit fallback; round-trip |
| `BodyMetricsRepository.test.ts` | 22 | load (success, empty, null, Supabase error, unauthenticated, schema errors); save (success, Supabase error, validation); delete (success, error, validation, unauthenticated); error classification (401, 5xx, TypeError); **userId always from constructor** |
| `useBodyMetrics.account-switch.test.tsx` | 2 | User A response discarded after switch to User B; logs clear before User B data arrives |
| `ModernizedBodyMetricsScreen.integration.test.tsx` | 14 | Real persisted weight renders; loading / empty / error states; recent history; no fabricated values (135.2, Oct 26, cycle-phase entries, SVG chart, cycle-flux badge); save success toast from result; save failure toast from returned `errorMessage` (not stale hook error); validation toast |
| `ModernizedPhysicalActivityScreen.regression.test.tsx` | 6 | Renders; step counter; interactive controls; `logActivity` called via facade; entry shape (YYYY-MM-DD logDate, string activityType, number durationMins); `saveBodyMetric` not called by Physical Activity |
| `guideRegistry.test.ts` | 17 | Sleep / Hydration / Body Metrics guide metadata; policy never auto-start; targetId matches screen; no medical copy; unique IDs; unique featureIds |
| `featureRegistry.test.ts` | 9 (updated) | Sleep / Hydration / Body Metrics resolve canonically; Body Metrics has guideId; production visibility; unique IDs; unique routes; unknown ID throws; unknown route returns null |

### Regression (pre-existing tests all PASS)

| File | Tests | Status |
|---|---|---|
| `ModernizedSleepInsightsScreen.integration.test.tsx` | 3 | PASS |
| `ModernizedSleepInsightsScreen.test.tsx` | 4 | PASS |
| `useSleep.account-switch.test.tsx` | 1 | PASS |
| `SleepRepository.test.ts` | 8 | PASS |
| `sleep.mappers.test.ts` | 2 | PASS |
| `ModernizedHydrationTrackerScreen.integration.test.tsx` | 2 | PASS |
| `useHydration.account-switch.test.tsx` | 1 | PASS |
| `HydrationRepository.test.ts` | 6 | PASS |
| `hydration.mappers.test.ts` | 2 | PASS |
| `cycle.mappers.test.ts` | 1 | PASS |
| `cycleCalculations.test.ts` | 13 | PASS |
| `guideProgress.test.ts` | 3 | PASS |
| `useNearbyCare.test.ts` | 2 | PASS |

**Total: 121 / 121 tests PASS across 20 test files.**

---

## 7. Verification Table

| Area | Status | Evidence |
|---|---|---|
| Tests | **PASS** | `npm test` — 121/121, 20 files, exit 0 |
| TypeScript | **PASS** | `npm run lint` (`tsc --noEmit`) — exit 0, 0 errors |
| Lint | **PASS** | TypeScript compilation check — exit 0 |
| Build | **PASS** | `npm run build` (Vite + esbuild) — exit 0 |
| Repository boundary | **PASS** | Screen imports feature hook only; no Supabase in screen; repository owns all body_metrics CRUD |
| DTO/domain mapping | **PASS** | `mapBodyMetricDtoToDomain` / `mapBodyMetricDomainToDto` tested bi-directionally; measured_date↔measuredDate, snake_case↔camelCase throughout |
| userId ownership | **PASS** | `BodyMetricsRepository.save()` sources userId from `requireUser()` only; test `uses userId from repository constructor, never from caller entry` PASS |
| Real Body Metrics data | **PASS** | Screen renders from `logs` / `latestWeight` / `todayEntry`; integration test confirms real weight value `68.5` renders |
| Fabricated-data protection | **PASS** | Integration tests confirm 135.2, "Oct 26", cycle-phase entries, SVG 132/136, "+3.0 lbs cycle flux" are all absent |
| Stale-closure protection | **PASS** | `handleSaveWeight` reads `result.errorMessage` from awaited `saveLog()` return; integration test begins with `error=null` and proves failure toast comes from result, not pre-populated hook state |
| Account-switch protection | **PASS** | `requestGeneration` + `currentUserId` refs; two mounted tests PASS |
| Physical Activity regression | **PASS** | 6 regression tests PASS; `logActivity` via facade; `saveBodyMetric` not called by Physical Activity |
| Guide lifecycle | **PASS** | `offer` policy; dismissible; replayable; never blocks feature use; guide target matches `data-guide-target` on screen; 17 guide tests PASS |
| Navigation | **PASS** | `BODY_METRICS` AppView exists; `wellness.bodyMetrics` registered in featureRegistry; 9 registry tests PASS |
| Schema | **NOT VERIFIED** | Migration 009 flat model is the active client target; inconsistency with 001/008 EAV model documented; no live read-only probe performed |
| RLS | **NOT VERIFIED** | Repository filters by `clerk_user_id`; migration policies present; no authenticated two-user staging test performed |
| Android | **NOT VERIFIED** | No Android device/emulator testing performed |
| iOS | **NOT VERIFIED** | No iOS device/simulator testing performed |
| Responsive | **NOT VERIFIED** | Tailwind responsive classes present; no viewport/device browser test performed |
| Offline | **NOT IMPLEMENTED / NOT VERIFIED** | Body Metrics is online-only; not connected to unsafe offline queue |

---

## 8. Remaining Risks

### Schema disagreement (documented, not blocking)

Migrations 001 and 008 define `body_metrics` as an EAV table (`recorded_date`, `metric_type`, `value`). Migration 009 defines it as a flat-row table (`measured_date`, `weight`, `weight_unit`, …). The active client targets migration 009. In an installation where 009 ran after 001/008 (and both used `CREATE TABLE IF NOT EXISTS`), the 009 flat columns would not have been added to the already-existing EAV table. This is a pre-existing risk inherited from the migration history, not introduced by Part 3C. Resolution requires an authorized read-only schema characterization across every deployed environment, followed by an additive migration plan. **No database change was made by Part 3C.**

### activity_logs field name (documented, not blocking)

`duration_minutes` (002/008) vs `duration_mins` (009). The compatibility facade queries `duration_mins` (matching 009). Physical Activity's full migration to its own repository (Part 3D) should confirm the live field name before creating `PhysicalActivityRepository`.

### Physical Activity compatibility facade (bridge, not permanent)

The activity-log shim in `src/hooks/useBodyMetrics.ts` is a compatibility bridge for Part 3D. It contains direct Supabase calls without account-switch protection (matching the pre-Part-3C behavior). This is an acceptable temporary state. Part 3D must:
- Create `PhysicalActivityRepository` with account-switch protection and owned activity-log CRUD
- Migrate `ModernizedPhysicalActivityScreen` to the new repository
- Remove the activity-log shim from the compatibility facade
- Remove the fabricated UI-local step/workout/calorie counters in `ModernizedPhysicalActivityScreen`

### Live RLS and schema verification (outstanding)

Live schema, RLS, Android, iOS, and responsive visual checks remain NOT VERIFIED. This is consistent with the status inherited from Parts 3A and 3B.

---

## 9. Files Changed

| File | Change |
|---|---|
| `src/features/bodyMetrics/BodyMetricsRepository.ts` | Fixed `save()` userId ownership; improved error normalisation |
| `src/features/bodyMetrics/bodyMetrics.mappers.ts` | Added canonical field documentation comment |
| `src/hooks/useBodyMetrics.ts` | Replaced monolithic hook with compatibility facade |
| `src/components/screens/ModernizedBodyMetricsScreen.tsx` | Migrated to feature hook; removed all fabricated data; honest empty/loading/error states; guide integrated |
| `src/guides/guideRegistry.ts` | Added `bodyMetricsGuide` |
| `src/registry/featureRegistry.ts` | Added `wellness.bodyMetrics`; extended `FeatureId` union |
| `src/features/bodyMetrics/bodyMetrics.mappers.test.ts` | New — 12 mapper tests |
| `src/features/bodyMetrics/BodyMetricsRepository.test.ts` | New — 22 repository tests |
| `src/features/bodyMetrics/hooks/useBodyMetrics.account-switch.test.tsx` | New — 2 account-switch tests |
| `src/components/screens/ModernizedBodyMetricsScreen.integration.test.tsx` | New — 14 integration tests |
| `src/components/screens/ModernizedPhysicalActivityScreen.regression.test.tsx` | New — 6 Physical Activity regression tests |
| `src/guides/guideRegistry.test.ts` | Updated — added Body Metrics guide tests (17 total) |
| `src/registry/featureRegistry.test.ts` | Updated — added Body Metrics registry tests (9 total) |

No SQL, migration, native project, `App.tsx`, `CycleContext`, or offline queue file was changed.

---

## 10. Final Decision

```text
REFERENCE SLICE APPROVED
```

All local implementation blockers are resolved:
- Repository boundary enforced; userId always server-sourced
- All fabricated health data removed; honest empty/loading/error states
- Stale-closure save result protection in place and tested
- Account-switch race protection in place and tested
- Physical Activity fully preserved via compatibility facade; regression tests pass
- Guide is non-blocking, offer policy, dismissible, replayable
- 121/121 tests pass; TypeScript clean; production build clean

Outstanding items (schema, RLS, Android, iOS, responsive, offline) are environment verification gaps consistent with the precedent set by Parts 3A and 3B. They are not Part 3C implementation blockers.
