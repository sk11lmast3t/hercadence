# Architecture Migration Checkpoint

## Part 3A status

Part 3A implements a bounded reference slice rather than an application-wide migration. Sleep now has a feature-owned domain model, DTO mapper, repository, React hook, canonical registry entry, and optional guide. Cycle hydration uses a repository mapper for canonical `cycle_length` and `period_length` fields. Nearby-care failures return typed errors and empty nearby results instead of fabricated providers.

The legacy `AppView`/`CycleContext` composition remains in place for compatibility. The existing offline queue remains isolated and is not a production write path.

## Verification boundary

Part 3A.1 closes the local reference-slice blockers: unavailable stage metrics no longer show quantitative fills; Sleep requests are guarded against account-switch races; guide state is explicitly offered/dismissed/skipped; and mounted Sleep rendering/save-failure tests are present. The current local verification pass is recorded in `PART_3A_VERIFICATION.md`. Live schema, RLS, Android/iOS, and responsive visual behavior still require authorized staging/platform verification.
