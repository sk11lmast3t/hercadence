# Sleep Vertical Slice

## Implemented

- `wellness.sleep` is the canonical feature ID for the existing `SLEEP_INSIGHTS` AppView route.
- `src/features/sleep/` owns the Sleep domain types, DTO mappers, repository, and hook.
- The legacy `src/hooks/useSleep.ts` path remains a compatibility re-export.
- Sleep loads persisted records through the repository and exposes loading, empty, success, and error states.
- Sleep saves use `duration_hours`; failed remote saves remain failures and are never reported as local offline saves.
- The optional versioned Sleep guide targets the existing sleep-log action and supports dismiss/replay through user-scoped local progress.

## Schema checkpoint

The repository uses the live-accepted `sleep_logs.duration_hours` field. No database migration was executed. Historical migrations still disagree: foundational migrations use `duration_hours`, while `009_schema_fixes.sql` defines `hours_slept` only inside `CREATE TABLE IF NOT EXISTS` and also uses different `bedtime`/`wake_time` types.

This phase does not claim fresh-schema or multi-environment compatibility. An authorized read-only characterization of every deployed environment, including column types, constraints, triggers, RLS, and rows, remains required before an additive repair migration.

## Deliberate limitations

- The existing IndexedDB queue is not connected to Sleep.
- RLS and platform runtime behavior require staging/device verification; unit tests do not prove them.
- No journey was added because the journey system is not implemented.
- Search and Explore have no existing Sleep registry surface to migrate; the existing Insights entry resolves through the canonical registry and the legacy AppView adapter remains functional.

## Verification

- Full Vitest suite: 22 tests passed.
- TypeScript check: passed.
- Production build: passed.
- Live schema/RLS and native platform verification: not available in this workspace and still required before release.

## Part 3A.1 blocker closure

- Removed the fabricated Deep/REM/Awake progress fills. Stage data remains explicitly `Not recorded`.
- Added user/request-generation guards so stale Sleep responses cannot update state after account changes.
- Kept Sleep disconnected from `useOfflineSync`; remote failures remain honest failures.
- Made guide state explicit as `offered`, `dismissed`, or `skipped`; completion is not claimed. Lifecycle tests cover first offer, dismiss, replay, user/version isolation, storage failure, and missing targets.
- Added a mounted Sleep screen test covering persisted rendering, loading, empty, error, and failed-save behavior.
- Classified ordinary care-team profiles as static informational examples; nearby failures still clear results and surface errors.

Schema/RLS, native, and responsive visual verification remain not verified because no authorized staging/device environment is available.
