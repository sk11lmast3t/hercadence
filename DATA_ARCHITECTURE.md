# HerCadence Data Architecture

**Status:** Part 2 design only. No repository, schema, local database, or sync behavior was changed. Evidence and live schema checks are in [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md).

## Target data flow

```text
Feature Screen
   ↓ typed UI intent / state
Feature Hook
   ↓ domain operation
Feature Repository
   ├─ validates and maps domain models ↔ persistence DTOs
   ├─ Local Store interface
   └─ Sync Engine / Supabase adapter
          ├─ durable local outbox
          └─ authenticated Clerk-JWT Supabase / Edge Function call
```

### Responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| Screen | Presentation, local interaction state, accessible controls, route requests | Supabase table names, SQL column mapping, retry policy, direct persistence |
| Feature hook | UI-facing typed API, subscriptions to repository state, operation initiation | Storage internals, table schema, global navigation |
| Feature service/domain | Calculations and feature rules reusable across screens | React component state or platform storage |
| Feature repository | CRUD, domain/DTO mapping, validation boundary, local-first reads/writes, sync contract and surfaced errors | Rendering, cross-feature mega-state |
| Local store | Durable local entities and outbox operations through a platform abstraction | Entitlement decisions or business policy |
| Sync engine | Per-user queue recovery, ordering, retry/backoff, idempotency, conflicts, success/failure status | Silent deletion of failed writes |
| Supabase adapter | Authenticated transport, typed table/function requests, remote error normalization | UI copy or local optimistic updates |
| Supabase | Remote persistence, RLS, server functions, authoritative entitlement/security checks | Client-only feature-routing logic |

## Repository contract

### Repository ownership rule

**Feature-specific repositories live with their feature.** For example, `src/features/sleep/SleepRepository.ts` owns sleep operations and mapping. **Only truly shared infrastructure lives in `src/data/`**: `local/`, `sync/`, `supabase/`, and `repository-types/`. Do not create `src/data/repositories/` as a generic home for feature repositories; that would become a cross-domain dumping ground. Shared storage/transport abstractions may be reused, but domain logic and feature CRUD remain inside the owning feature.

Each feature repository exposes typed operations and observable state. Shapes below are design examples, not code to copy verbatim:

```ts
interface RepositoryResult<T> {
  data: T;
  source: 'local' | 'remote' | 'merged';
  sync: 'synced' | 'pending' | 'failed';
}

interface FeatureRepository<T, Id> {
  list(query?: FeatureQuery): Promise<RepositoryResult<T[]>>;
  get(id: Id): Promise<RepositoryResult<T | null>>;
  save(value: T, options?: { idempotencyKey?: string }): Promise<RepositoryResult<T>>;
  remove(id: Id, options?: { idempotencyKey?: string }): Promise<RepositoryResult<void>>;
  subscribe?(listener: () => void): () => void;
}
```

Errors are explicit discriminated results or typed thrown errors caught at the hook boundary. Validation errors, auth/permission errors, network/offline failures, schema/contract errors, and retryable sync errors remain distinguishable. Do not return a success-shaped empty value after a failed remote request.

## Feature mapping and ownership

| Domain | Existing entry point(s) | Repository boundary |
|---|---|---|
| Cycle and daily logs | `CycleContext`, `useDailyLog`, `useCycleCalendar`, `useCyclePredictions` | Feature repositories under `src/features/cycle/` own cycle/daily-log DTO mapping and date history. |
| Profile | `useProfile`, `CycleContext` | `src/features/profile/` owns profile repository, preferences and validated local migration. |
| Sleep | `useSleep` | `src/features/sleep/SleepRepository.ts` maps `duration_hours` and validated time fields. |
| Hydration | `useHydration` | `src/features/hydration/` owns hydration repository, log CRUD and units. |
| Body metrics/activity | `useBodyMetrics` | Separate repositories in their owning feature folders; may share transport, not model semantics. |
| Medication/pregnancy | `useMedication`, `usePregnancy` | Feature-owned repositories and domain rules. |
| Tags | `useCustomTags`, context tag arrays | Owning tag/symptom feature repository with local compatibility migration. |
| Insights/export | `useHealthInsights`, `useHealthExport` | Feature-owned query/service contracts; export remains server-authorized. |
| Notifications | `useNotificationPreferences`, `useNotificationInbox` where applicable | Notification feature owns preferences; device push registration/delivery remains a separate native integration. |
| Nearby care | `useNearbyCare` + Edge Function | Care repository returns real provider results only; failures are errors/empty results, not mock substitutes. |
| Community/partner | context and partner hooks | Separate community and sharing repositories; validate table relations/RLS before embedding queries. |

This is a target inventory, not an instruction to combine distinct domains into one repository.

## Local storage decision gate

Do not select a new local database in the design phase. Before the sync engine is connected to production writes, evaluate candidate/current mechanisms against:

| Criterion | Required evidence |
|---|---|
| Web/Vite | Browser support, IndexedDB transaction behavior, storage quota/eviction, upgrade path |
| Capacitor | Support in WebView and plugin alternative behavior without relying on undocumented APIs |
| Android and iOS | Cold start, app suspension, process termination, low storage, upgrade/downgrade behavior |
| Durability/transactions | Atomic entity + outbox commits and recovery after abrupt termination |
| Migration | Versioned schema migration, idempotence, rollback, ability to preserve existing localStorage records |
| Performance | Expected log/history volume, pagination/indexes and UI responsiveness |
| Security | PII/health-data exposure, encryption at rest requirements, secure key handling and threat model |
| Sync complexity | Conflict detection, operation ordering, deletion/tombstones, account isolation |
| Existing data | Import/export, key compatibility, user migration, no destructive reset |

The current dependencies include Capacitor Preferences and an IndexedDB queue, but their presence does not prove suitability, encryption, use, or native durability. Keep a `LocalStore` contract so the choice can be made after a time-boxed platform spike.

## Offline outbox and sync semantics

Before production integration, each queued operation must include:

```text
operation_id (stable UUID/idempotency key)
clerk_user_id (owner; revalidated before replay)
feature/entity type and entity key
operation kind + validated payload or tombstone
local sequence / created_at / updated_at
attempt count + next retry time + last classified error
schema/version marker
```

Requirements:

- Commit entity state and outbox operation atomically in the selected local store.
- Rehydrate pending operations from durable storage at startup; derived pending counts must reflect stored queue content.
- Replay in per-entity order, with bounded exponential retry for transient failures and no retry loop for validation/permission/schema failures.
- Check both thrown transport failures and Supabase `{ error }`; remove/mark an operation complete only after confirmed server success or explicit idempotent duplicate confirmation.
- Revalidate the active Clerk user for every replay. Pause other-user operations and never rewrite their owner ID.
- Define idempotency/unique conflict behavior per repository. Preserve server-side RLS.
- Return visible pending/sync-failed state; allow safe retry and support diagnostics without logging health payloads/secrets.
- Handle edits/deletes while older operations are queued; coalesce only where semantics are proven. Preserve tombstones until server acknowledgement.
- Do not apply a universal last-write-wins policy to health records. On conflicting records, use entity-specific rules; preserve both values or surface conflict when the safe merge is not deterministic.

Current `useOfflineSync` does not meet these criteria: it is not the common write path, does not restore pending count on startup, treats resolved calls with returned Supabase errors as success, and catches replay failures silently. Do not wire it into feature writes as-is.

## Error and loading contract

Feature hooks expose status sufficient to distinguish:

```text
idle | loading | success | empty | local-pending | syncing | sync-failed | error
```

`error` includes a stable category (`validation`, `unauthenticated`, `forbidden`, `offline`, `network`, `schema`, `conflict`, `unknown`), safe user-facing message key, retryability, and operation reference where relevant. UI chooses appropriate presentation. Logs contain no auth tokens, raw health payloads, or provider personal data.

## Database compatibility strategy

The actual production database is not modified in Part 2. Before any future migration, query `information_schema`, constraints, indexes, foreign keys, RLS policies, and row counts using authorized read-only credentials for each deployed environment. Record a migration checkpoint and backup/restore plan.

### `sleep_logs`: `duration_hours` vs `hours_slept`

| Concern | Design |
|---|---|
| Observed deployed schema | Live PostgREST accepts `duration_hours`; querying `hours_slept` returns SQLSTATE 42703. Foundational migrations 002/008 define `duration_hours`. |
| Current client expectation | `src/hooks/useSleep.ts` selects/writes `hours_slept`; 009 creates that name only when creating a new table, and does not reconcile an existing table. |
| Canonical field | `duration_hours numeric`; this is the live-accepted/foundational-migration-backed name approved for the target. |
| Characterize | Inspect all environments and rows. Check whether either/both fields exist, null distribution, constraints, triggers, and any partial writes. Preserve a pre-migration snapshot/restore route. |
| Additive compatibility | Where absent, add the canonical field. Where older deployed clients require `hours_slept`, retain/add that compatibility column and use a tested synchronization mechanism during rollout. Never drop or overwrite disagreeing non-null values automatically; report conflicts for explicit resolution. |
| Backfill | Copy only when the destination is null and source non-null. Validate row-level counts and numeric values; keep conflict rows unchanged and report counts. |
| Client rollout | Repository reads canonical `duration_hours`; during compatibility window it can read legacy value only when canonical is null. New writes use a validated compatibility write/trigger contract until minimum supported app version no longer expects the alias. |
| Verification | Schema assertions on fresh and upgraded database; read/write/upsert/delete under Clerk RLS; existing-data parity and old-client compatibility tests; live read-only REST probes. |
| Cleanup | Only after adoption/telemetry or explicit release policy proves old clients are retired, back up and verify no remaining alias-only values, then schedule a separately approved additive-safe cleanup. No cleanup in Part 2. |

### `cycles`: `cycle_length` / `period_length` vs `*_days`

| Concern | Design |
|---|---|
| Observed deployed schema | Live PostgREST accepts `cycle_length,period_length`; querying `cycle_length_days,period_length_days` on `cycles` returns SQLSTATE 42703. |
| Current client expectation | `CycleContext` reads `cycles.cycle_length_days` and `cycles.period_length_days`; profile columns with `_days` exist separately. |
| Canonical fields | `cycles.cycle_length` and `cycles.period_length`, matching live schema and foundational migrations. Profile names remain profile names and must not be conflated with cycle-row names. |
| Characterize | Inspect all environments, uniqueness, nullable/default behavior, dependent code, old app versions, and whether values differ from profile fields. |
| Additive compatibility | Keep canonical columns. If old clients require `*_days`, add aliases only where absent and synchronize rather than dropping/renaming canonical columns. Resolve contradictory non-null values explicitly, never with blind overwrite. |
| Client rollout | Repository maps canonical database fields to a stable domain model (`cycleLengthDays`, `periodLengthDays`); no screen directly consumes database column names. |
| Verification | Fresh/upgrade schema tests; row mapping tests; signed-in RLS read/write; parity check against local profile values; read-only live probe. |
| Cleanup | Retire aliases only after old-client support period, conflict/data verification, and separately approved migration. |

### Other schema gate

Migrations 001/002 and 008 overlap; `CREATE TABLE IF NOT EXISTS` does not reconcile columns on existing installations. Validate all repository DTOs against deployed schemas before feature migration, particularly partner relationships and upsert conflict constraints. Treat each repair as additive and independently verifiable.

## Production/demo data boundary

| Data class | Permitted environment | Failure behavior |
|---|---|---|
| Real production user/provider data | Production after authenticated/authorized repository response | Explicit empty/loading/error state; no fabricated substitution |
| Development fixtures | Explicit dev-only build/configuration | Never included in production bundles or selected by ordinary network failure |
| Unit/integration test fixtures | Test runner / isolated backend | Deterministic and clearly labeled |
| Demo mode | Only if separately product-approved and conspicuously marked | Never intermingle with a signed-in real-user account |

Audit examples requiring this boundary: sample notification reset data, mockup-default hydration/insight values, demo forgot-password email/code, and `useNearbyCare` fallback providers. Nearby-care failure must return a typed unavailable/error result; the UI may offer retry or clearly state no real provider data is available, but must not present fake providers as nearby care.

## Part 3A implementation checkpoint

Sleep now maps the domain field `durationHours` to the canonical `sleep_logs.duration_hours` field inside `src/features/sleep/SleepRepository.ts` and its mapper. The old hook path is a compatibility facade. No local store, outbox, database migration, or schema cleanup was added. The `hours_slept` migration disagreement and `bedtime`/`wake_time` type disagreement remain documented limitations until each deployed environment is characterized read-only.

Nearby-care failure handling now returns an explicit typed error and empty result; it does not substitute provider fixtures. The existing offline queue remains outside all production feature writes.

## Part 3A.1 checkpoint

Sleep stage cards no longer render fixed quantitative indicators when the persisted schema has no stage data. Sleep request state updates are guarded by the initiating user and request generation. Guide progress is local and explicitly limited to offered/dismissed/skipped state; it is not presented as cross-device completion. Static ordinary care-team profiles are informational examples and are never used for nearby lookup failure results. Live schema, RLS, and platform verification remain outstanding.
