# Medication Reference Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move Medication inventory behind a feature-owned mapper, repository, and hook while removing fabricated UI data and preserving existing routes and Supplements compatibility.

**Architecture:** `Medication` screens use a canonical feature hook backed by a single Medication repository and mapper. The legacy `src/hooks/useMedication.ts` remains a compatibility facade for the existing Supplement screen. Persisted Medication History is explicitly deferred because `medication_logs` differs between migrations and its status semantics cannot be verified.

**Tech Stack:** React 18, TypeScript, Clerk, Supabase JS, Vitest, Testing Library, Vite.

**Spec:** User-approved Part 3E requirements in the conversation attachment.

## Global Constraints

- Do not change production schema or connect Medication to the offline queue.
- Persist only fields supported by the active client and common migration evidence: `id`, `clerk_user_id`, `name`, `dosage`, `frequency`, `is_active`, and `created_at`.
- Do not infer active-deployment schema from migrations; report Schema and RLS as NOT VERIFIED.
- Do not query or write `medication_logs`; provide an honest unavailable History state.
- Do not migrate Supplements or alter global routing, auth, entitlement, passcode, CycleContext, or App.tsx.
- Keep user identity sourced from Clerk at the feature-hook/repository boundary; ignore caller-supplied ownership.
- No new medical behavior, calculations, or seeded health data.

## Review Focus

- User A requests or mutations resolving after account switch must not update User B state; test in the feature-hook task.
- A caller-supplied user ID must never change row ownership; test in the repository task.
- Schema or transport failures must not appear as successful saves or raw Supabase errors; test repository and screen operation results.
- Medication History must issue no medication-log query and display no fabricated records; test the screen task.
- Existing Supplement calls through the legacy hook must retain their API and persisted common-field behavior; test compatibility in the feature-hook task.

---

### Task 1: Medication Domain and Mapper

**Files:**
- Create: `src/features/medication/medication.types.ts`
- Create: `src/features/medication/medication.mappers.ts`
- Create: `src/features/medication/medication.mappers.test.ts`

**Interfaces:**
- Produces `MedicationEntry`, `MedicationEntryInput`, `MedicationLoadStatus`, `MedicationSaveResult`, `MedicationRepositoryError`, and `MedicationDto`.
- Mapper functions: `mapMedicationDtoToDomain(dto)` and `mapMedicationDomainToDto(entry, clerkUserId)`.
- Keep dosage and frequency opaque strings; map only common evidenced fields. No start/end date, route, reminder, notes, or medication-log fields.

- [ ] Write mapper tests first for each common field, null optional values, and domain-to-DTO ownership mapping.
- [ ] Run `npx vitest run src/features/medication/medication.mappers.test.ts`; verify expected missing-export failures.
- [ ] Implement types and pure mapping functions.
- [ ] Re-run the mapper test and verify bidirectional mapping assertions pass.

### Task 2: Medication Repository

**Files:**
- Create: `src/features/medication/MedicationRepository.ts`
- Create: `src/features/medication/MedicationRepository.test.ts`

**Interfaces:**
- `MedicationRepository(supabase, userId)`; `load(): Promise<MedicationEntry[]>`; `save(entry): Promise<MedicationEntry>`; `delete(id): Promise<void>`.
- Repository selects only common evidenced columns, filters every operation by trusted `clerk_user_id`, validates non-empty names, and normalizes validation/auth/schema/network/unknown errors.

- [ ] Write tests for unauthenticated load/save/delete, empty and populated load, exact table/columns/order/ownership, create/update persistence, forged caller ownership, delete, validation, returned Supabase errors, and thrown network errors.
- [ ] Run the focused repository test and verify it fails because the repository is absent.
- [ ] Implement repository CRUD without a `medication_logs` path or inferred columns.
- [ ] Re-run repository tests and verify all persistence DTO and query assertions pass.

### Task 3: Feature Hook and Compatibility Facade

**Files:**
- Create: `src/features/medication/hooks/useMedication.ts`
- Modify: `src/hooks/useMedication.ts`
- Create: `src/features/medication/hooks/useMedication.account-switch.test.tsx`

**Interfaces:**
- Feature hook exposes `medications`, `status`, `isLoading`, `error`, `load`, `saveMedication`, and `deleteMedication`.
- Mutations return `MedicationSaveResult` / explicit success booleans; caught repository errors are returned as safe messages.
- Legacy facade preserves `{ medications, isLoading, error, load, upsert, remove }` for the Supplement screen by delegating to the canonical feature hook.

- [ ] Write hook tests for initial load/loading/empty/error, save success/failure result, delete behavior, account switch clearing, and stale request/mutation completion rejection.
- [ ] Run the focused hook tests and verify they fail because the feature hook is absent.
- [ ] Implement request-generation and current-user guards; do not enqueue offline mutations.
- [ ] Adapt the old API in a thin facade, preserving existing Supplement call signatures without adding Supplement fields or UI changes.
- [ ] Re-run feature-hook and Supplement regression checks.

### Task 4: Tracker, History, and Registry

**Files:**
- Modify: `src/components/screens/ModernizedMedicationTrackerScreen.tsx`
- Modify: `src/components/screens/ModernizedMedicationHistoryScreen.tsx`
- Modify: `src/registry/featureRegistry.ts`
- Modify: `src/registry/featureRegistry.test.ts`
- Create: `src/components/screens/ModernizedMedicationTrackerScreen.integration.test.tsx`
- Create: `src/components/screens/ModernizedMedicationHistoryScreen.integration.test.tsx`

**Interfaces:**
- Tracker uses the Medication feature hook and renders persisted inventory plus loading, error, retry, and empty states. Remove fake schedule, take toggles, cabinet/refill/order behavior, and sample names/doses/times.
- History imports through the canonical Medication feature boundary but reports that history is unavailable pending schema verification; it must not query `medication_logs`.
- Add `wellness.medication → MEDICATION_TRACKER` registry metadata; preserve `MEDICATION_HISTORY` as existing child route.

- [ ] Write integration tests for real persisted rows, empty/loading/error states, no fake values, explicit save-failure behavior where mutation UI exists, and History's unavailable state/no medication-log calls.
- [ ] Write registry assertions for canonical ID/route uniqueness and preserve existing History navigation.
- [ ] Run the focused tests and verify they fail against current fabricated UI / absent registry entry.
- [ ] Migrate screen data/state to the feature hook, remove fabricated health UI, keep existing `AppView` callbacks and auth gates untouched, and add the registry entry.
- [ ] Re-run focused Medication and registry tests.

### Task 5: Verification Record and Regression Gates

**Files:**
- Create: `PART_3E_VERIFICATION.md`

- [ ] Document discovery, consumers, migration disagreement, excluded fields, compatibility facade, unavailable History rationale, no-calculation statement, and environment gaps.
- [ ] Run `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` independently; report that `npm run lint` is configured as TypeScript compilation, not an actual linter.
- [ ] Verify approved regressions: Sleep, Hydration, Body Metrics, Physical Activity, Cycle, Guides, Feature Registry, and Nearby Care.
- [ ] Search active Medication source for direct Supabase access outside the repository, medication-log access, fabricated health output, and offline-queue usage.
- [ ] Record Schema, RLS, Android, iOS, Responsive, and Offline status honestly; mark History persistence deferred and no calculations as NOT APPLICABLE.
- [ ] Set final decision to `REFERENCE SLICE APPROVED` only if implementation blockers are resolved; otherwise use `REFERENCE SLICE REQUIRES CORRECTION`.
