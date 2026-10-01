# HerCadence Architecture Migration Plan

> **For agentic workers:** This is a design-stage migration blueprint only. It is not authorization to execute Part 3. Every implementation phase requires a separately approved start and its stated review gates.

**Goal:** Incrementally move HerCadence from global `AppView`/`CycleContext` orchestration toward canonical feature navigation, separated feature data boundaries, and optional guided discovery without losing existing behavior or user data.

**Architecture:** Introduce compatibility layers first. Characterize live schemas and access behavior, then migrate routing, registry/state/data, local sync, canonical screens, and discovery one independently verifiable slice at a time. Do not replace the app, select a local database without evaluation, or delete variants before parity.

**Tech Stack:** Existing React 18, TypeScript, Vite, Clerk, Supabase, Capacitor Android/iOS, current localStorage/IndexedDB usage; adopt React Router v7 library mode and the official Capacitor App plugin for navigation/native Back/deep-link bridging. No new local database is approved by this plan.

**Spec:** [TARGET_ARCHITECTURE.md](./TARGET_ARCHITECTURE.md) and companion [NAVIGATION_ARCHITECTURE.md](./NAVIGATION_ARCHITECTURE.md), [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md), [STATE_ARCHITECTURE.md](./STATE_ARCHITECTURE.md), [DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md), [GUIDED_DISCOVERY_ARCHITECTURE.md](./GUIDED_DISCOVERY_ARCHITECTURE.md).

## Global constraints

- Do not rewrite the application from scratch; understand references before changing shared architecture; preserve UI and user data.
- Keep Home, Calendar, Insights, Profile as the primary tabs unless a separate approved product decision changes them.
- Do not change visual design except functional integration approved for a migration stage.
- Do not remove existing features or screen variants until parity and references are verified.
- Do not reset, drop, or destroy production Supabase data.
- Do not expose or commit secrets, API keys, tokens, or `.env` credentials.
- Preserve Clerk, entitlement, passcode, RLS, legal/privacy, account deletion, and onboarding behavior.
- Keep offline behavior available; do not connect the current offline queue to production writes until its durability/error semantics are fixed and tested.
- Defer local database selection until Web/Vite, Capacitor, Android, iOS, durability, transactions, migration, performance, security, and sync requirements are evaluated.
- Use `duration_hours`, `cycle_length`, and `period_length` as target canonical field names, subject to deployment characterization; retain compatibility while old clients may remain.
- Keep development fixtures and screen-directory tools out of production behavior and data.

---

## File responsibility map

Implementation paths below are target paths, not files created in this design phase.

| Path | Responsibility |
|---|---|
| `src/App.tsx` | Temporary legacy composition/gate host; shrink only after route and gate parity. |
| `src/context/CycleContext.tsx` | Compatibility facade during extraction; remove fields only after all consumers migrate. |
| `src/types.ts` | Temporary `AppView` contract; eventual domain route types live under navigation/features. |
| `src/navigation/*` | React Router route tree, typed destination resolver, runtime parameter parsers, route-modal handling, AppView adapter, tests. |
| `src/registry/*` | Feature metadata and route IDs; no UI or persistence. |
| `src/features/<domain>/*` | Domain screens/hooks/services/types and that feature's repository; no cross-feature mega state. |
| `src/data/repository-types/*` | Truly shared repository contracts/types only; never feature CRUD or domain-specific repositories. |
| `src/data/local/*` | Chosen shared local-store infrastructure only after the store evaluation gate. |
| `src/data/sync/*` | Durable outbox, user isolation, retries, idempotency, conflict policy. |
| `src/data/supabase/*` | Authenticated table/function adapter and persistence DTOs. |
| `src/discovery/*` | Explore/Search registry rendering and deterministic recommendations. |
| `src/journeys/*` | Optional journey definitions and progress. |
| `src/guides/*` | Declarative guide definitions, provider/overlay, per-user progress repository. |
| `supabase/migrations/*` | Additive compatibility only after schema characterization and separate approval. |
| `src/**/*.test.ts(x)` | Unit/integration coverage colocated with existing Vitest patterns. |

## Phase 0 — Characterize current behavior and build gates

**Deliverable:** A verified baseline matrix for every current `AppView`, entry point, Back callback, access outcome, storage key, hook/table mapping, and production/development-only surface.

- Inventory every `setCurrentView` and route switch case; record canonical candidate and source/return behavior.
- Add characterization tests for auth loading, signed-out routing, onboarding, entitlement loading/allowlist, passcode overlay, and route return destinations before altering root behavior.
- Inventory CycleContext consumers and localStorage keys; record empty/malformed/unavailable-storage behavior and current Supabase hydration/write ordering.
- Inventory all 74 screen files, aliases, caller references, prototype fixtures, and unclear production routes; create per-destination acceptance criteria.
- Capture current web build/test/lint baseline and available Android/iOS configuration/build commands without changing configuration.

**Gate:** No migration phase starts until the route/gate/data baseline and known test failures are recorded.

**Rollback:** No behavior change; remove only newly introduced characterization tests if they cannot be made deterministic, preserving baseline notes.

## Phase 1 — Characterize schema and prepare additive compatibility

**Deliverable:** Environment-by-environment schema contract and reviewed additive migration design for known mismatches.

- Read-only inspect `information_schema`, columns, types, defaults, constraints, indexes, foreign keys, RLS policies, triggers, and table row counts with authorized credentials for every environment.
- Verify live `sleep_logs` and `cycles` columns, including whether legacy aliases exist elsewhere; never infer all environments from the previous single live check.
- Compare DTO use in `useSleep.ts`, `CycleContext.tsx`, all migrations, and dependent functions.
- Define canonical database names: `sleep_logs.duration_hours`; `cycles.cycle_length` and `cycles.period_length`; map to domain names in repositories.
- For conflicts, specify additive columns/trigger or compatibility-view strategy, null-only backfills, conflict reports, client dual compatibility, rollback, and cleanup criteria.
- Validate upsert targets, relationship embeds, Clerk claim interpretation, and RLS for partner, guide-progress, and every table to be migrated.
- Obtain database owner approval, backup/restore proof, and separate migration approval before executing any migration.

**Gate:** Schema tests pass on fresh and upgraded staging copies; no ambiguous non-null values are silently overwritten; user-row parity is verified.

**Rollback:** Prefer forward-compatible additive rollback: disable compatibility trigger/client rollout but retain columns and data. Never drop/restore over newer user rows. Restore from backup only under database-owner-approved incident procedure.

## Phase 2 — React Router foundation and access parity

**Deliverable:** React Router v7 owns URL/history and nested route matching while existing callers continue through an `AppView` compatibility adapter.

- Add React Router v7 library-mode dependency after confirming Vite/React 18 compatibility at implementation time; use `createBrowserRouter`/`RouterProvider`, nested route branches, and the browser History API. Add the official Capacitor App plugin for Android Back and native URL events.
- Define four nested tab branches and one chronological browser-history stack. Do not build independent custom per-tab or modal stack managers.
- Define typed destination/feature IDs and a closed discriminated route union with feature-specific params; reject open-ended `Record<string,string>` params.
- Implement centralized runtime parsers for path, query, notification, legacy, and deep-link inputs, and a pure `resolveEntry` result: allow, redirect with validated return destination, or reject.
- Translate every `AppView` union value using the complete map in `NAVIGATION_ARCHITECTURE.md`; preserve aliases and developer-only classification.
- Implement parallel route tests for every old route and exact allowlist behavior; test auth readiness, onboarding, passcode, and entitlement precedence.
- Add browser-history tests for feature pushes, cross-tab transitions, modal/background restoration, auth return, unknown IDs/params, and Back/Forward.
- Specify Android `backButton` delegation (modal, known in-app history, root exit), iOS in-app Back (no promised edge-swipe), and cold/warm deep links (`getLaunchUrl`/`appUrlOpen`).
- Adapt `MobileAppShell`, `BottomNavBar`, `ScreenDirectoryModal` (dev only), and a single representative feature link to new navigation without migrating every screen.
- Compare old and new rendered destinations in development before making the new controller authoritative.

**Gate:** Every supported old value resolves to the expected same component/flow; route params are runtime-validated; no protected route becomes accessible; Android/iOS behavior is explicit and tested where available.

**Rollback:** Switch rendering back to legacy `currentView` while retaining the additive route definitions and adapter. Do not remove the router dependency/config or legacy route cases in this phase; no data changes occur.

## Phase 3 — Feature Registry and user-facing Explore

**Deliverable:** One typed feature catalogue used by navigation resolution and user-facing discovery; developer directory excluded from production.

- Add registry entries from `INFORMATION_ARCHITECTURE.md`, one canonical destination per intentional production feature; require stable ID, title/description, category, visibility, auth/premium policy, route, optional guide/journey relations.
- Validate registry consistency at test time: unique IDs/routes, valid relationships, known destination, required access metadata, no dangling suggestion or journey feature IDs.
- Move Search results to registry feature IDs; preserve query behavior and ensure every selected item opens the exact canonical route.
- Design/create Explore using existing design tokens/components; list categories, feature cards, journeys, recent/unseen items, search and contextual recommendations without changing primary tabs.
- Gate ScreenDirectoryModal/Kotlin viewer from production registry and route resolution; test production build output/unreachable destinations.
- Leave uncertain routes (`CYCLE_AI_ASSISTANT` alias intent, receipts destination, other unclear screens) explicitly unresolved for product review.

**Gate:** No production registry entry points to a dev screen; Explore/Search/legacy route select the same canonical destination.

**Rollback:** Hide new Explore entry and restore prior Search/catalog presentation while retaining the registry as a non-authoritative source until mapping defects are corrected.

## Phase 4 — Separate application and feature state

**Deliverable:** Navigation/session/profile/cycle responsibilities begin leaving CycleContext with a temporary compatibility facade.

- Move route state out of CycleContext into navigation controller; keep adapter behavior for old consumers.
- Extract transient log-sheet/modal/selected-content state to owning shell or feature controller.
- Introduce profile repository/hook while retaining existing profile local keys and read semantics.
- Characterize and extract daily logs/cycle hydration separately; fix column mapping through repository DTOs after Phase 1 gate.
- Move tag and community/appointment state only after consumer maps and backend ownership are verified.
- Add tests for per-user isolation, local-to-remote hydration, localStorage migration, error propagation, and sign-out cleanup.

**Gate:** Every migrated field has one declared owner; local and remote outcomes are surfaced; no data key is removed before import/parity tests pass.

**Rollback:** Keep CycleContext facade delegating to new owners; if a feature fails, restore that field's prior implementation without changing key names or deleting local records.

## Phase 5 — Shared data contracts and pilot readiness

**Deliverable:** Repository/local/sync interfaces and one pilot feature selected; no mass feature migration.

- Define shared infrastructure contracts in `src/data/repository-types/`, `src/data/local/`, `src/data/sync/`, and `src/data/supabase/`; keep each feature's CRUD repository under its feature folder.
- Define feature domain types separate from Supabase DTOs and mapping tests.
- Select Sleep as the first end-to-end pilot because it is a bounded, named feature with a current screen/hook and a concrete schema mismatch that validates compatibility handling. It must not begin until Phase 1's sleep schema characterization/compatibility is approved in staging.
- Keep old feature-hook exports as facades during migration; no other feature repository is migrated in bulk.
- Check returned Supabase errors, network errors, auth errors, loading, empty, and retryable states explicitly.
- Add parity tests against current behavior and user-scoped RLS tests.

**Gate:** Interfaces are small and typed; feature repositories have one owner; Sleep remains blocked until its schema compatibility is proven.

**Rollback:** Keep interfaces unused and old hook as the production path. Preserve local records and remote schema.

## Phase 6 — Local-store evaluation and offline sync foundation

**Deliverable:** An approved local-store adapter and tested sync foundation before the Sleep pilot writes through it.

- Time-box evaluation of current localStorage/IndexedDB and Capacitor-compatible candidates using the criteria in `DATA_ARCHITECTURE.md`.
- Test transactions, app kill/restart, offline/online transitions, quota/errors, Android/iOS WebView behavior, data migration, and security/encryption needs.
- Approve a versioned local entity/outbox format with user ownership, idempotency key, operation order, retry state, and migration/import path.
- Replace silent queue handling with explicit results; verify Supabase `{ error }` before acknowledging operations.
- Define per-entity conflict behavior and tombstone/delete semantics; test two-device edits and account switching.
- Do not yet connect existing production feature hooks to the queue.

**Gate:** Offline operation survives process restart; failed writes remain pending and visible; replay is idempotent and user-isolated; server RLS remains authoritative.

**Rollback:** Disable queue consumption and return to online repository path while retaining pending outbox data. Never clear a failed queue to “recover”; provide controlled export/retry/repair.

## Phase 7 — End-to-end Sleep vertical slice

**Deliverable:** A proven architecture template for exactly one feature, Sleep, through routing, registry, hook, repository, local storage, sync, guide, and one optional journey link.

- Use `wellness.sleep` as the sole pilot feature ID and route; register its current `ModernizedSleepInsightsScreen` without redesigning it.
- Adapt `useSleep` to `src/features/sleep/useSleep.ts` as the UI API and `src/features/sleep/SleepRepository.ts` as the feature-owned CRUD/mapping boundary; retain a compatibility re-export at the old hook path until all references migrate.
- Map canonical `sleep_logs.duration_hours` through the approved additive compatibility plan; no direct screen access to snake_case database columns.
- Use the chosen `LocalStore` adapter and outbox for the pilot only. Prove offline save, restart recovery, per-user isolation, idempotent replay, RLS, returned-error handling, and explicit sync state.
- Add one declarative sleep guide with an explicit policy (default `offer`; product may configure `auto-start` or `disabled`), versioned per-user progress, first-use prompt, replay, skip, offline persistence, and cross-device merge.
- Add Sleep as a feature in one existing optional wellness journey (for example Build Your Wellness Picture) using only journey state fields `journeyId`, `status`, `lastFeatureId`, and `updatedAt`; do not duplicate sleep logs.
- Route Home/Insights/Search/notification/legacy entry for Sleep through the same feature ID. Use mocked/fake feature repository only in tests, never as production fallback.
- Test screen behavior, navigation route equality, repository mapping, schema compatibility, guide lifecycle, one journey link, offline transition, and supported web/Android/iOS runtime behavior.

**Gate:** The full flow passes on a fresh and upgraded staging schema; offline state survives restart; guide is non-blocking; every entry source resolves to the same screen; UI behavior is preserved; known mismatches produce explicit errors and are no longer hidden.

**Rollback:** Map `wellness.sleep` back to the existing screen/hook path while leaving adapter data, additive columns, pending operations, and guide progress intact. Disable pilot guide/sync integration centrally; never clear user data or drop compatibility columns.

## Phase 8 — Scale repository/state slices by feature

**Deliverable:** Apply the proven hook/repository/local-store/error pattern one feature at a time, not across all screens in one refactor.

- Migrate feature repositories in bounded slices after the pilot proves each shared interface; preserve old hook exports during each transition.
- Extract `CycleContext` one responsibility at a time, beginning with navigation already moved in Phase 2, then profile, cycles/daily logs, tags, community, appointments, and transient UI only after consumer maps/tests.
- Prioritize existing live schema mismatches and user-data paths; validate RLS, conflict, storage, and error contracts per feature before the next slice.
- Keep feature screens visually unchanged; do not move all 70+ screens as a prerequisite for repository boundaries.

**Gate:** Every slice has independent tests, exactly one data owner, and compatibility coverage; no state/context big-bang replacement.

**Rollback:** Switch that feature's hook facade to its former implementation; retain local/remote data and context facade until the next release gate.

## Phase 9 — Canonical destination and screen consolidation

**Deliverable:** Consolidate only screen families with verified behavior parity and product-approved canonical implementation.

- Use the matrix in `INFORMATION_ARCHITECTURE.md` to compare Home, Calendar, Insights, Profile, then one-off feature families.
- Record behavior, data, callbacks, loading/errors, accessibility, visual differences, entry/exit points, and side effects for each implementation.
- Get product approval where variants differ in capability, content, data, intent, or user-facing copy.
- Route all entry points to the chosen canonical implementation; keep legacy aliases during validation.
- Search repository references and run route, repository, visual, mobile viewport, auth, entitlement, passcode, and platform tests before retiring any variant.

**Gate:** Each consolidated feature has one canonical implementation and all intended behavior; uncertain destinations remain labeled for product decision, not deleted.

**Rollback:** Point the registry back to the previous variant while retaining aliases and code until rollback window passes.

## Phase 10 — Expand guides, journeys, Explore and recommendations

**Deliverable:** Scale the tested Sleep guide/journey template and launch registry-backed user discovery with approved frequency/content policy.

- Add declarative guides per feature with `offer`, `auto-start`, or `disabled`; default to non-blocking `offer`. `auto-start` begins only after feature render/target readiness and remains immediately dismissible.
- Add only product-reviewed steps/target IDs; guide failures never block feature usage.
- Add journeys using only `journeyId`, `status`, `lastFeatureId`, and `updatedAt`; keep local-only unless remote sync is separately approved.
- Implement recommendation frequency through a versioned configuration: maximum one primary recommendation, configurable impression cap/window, dismissal cooldown, ignored cooldown, and suppression after meaningful target-feature use. No configuration approved means recommendations remain disabled.
- Finish user-oriented Explore, registry-backed Search and Replay Tutorial entry; isolate the screen directory/code viewer from production routes/builds.
- Test journey interruption/resume, recommendation explanation/dismissal/frequency, new/returning guide states, account isolation, and all entry paths.

**Gate:** No fixed sequence; guide policy and recommendation policy are explicit; no repeated prompts on every render; production cannot resolve developer destinations.

**Rollback:** Disable auto-start and recommendation presentation centrally; retain guide/journey state; restore old search/discovery entry without changing access to features.

## Phase 11 — Legacy removal and production readiness

**Deliverable:** Remove only proven-obsolete route/context/screen code and release with verified web/native behavior.

- Audit repository references, release telemetry/adoption where available, route tests, fixture imports, and backward compatibility for each proposed removal.
- Obtain product approval for each unclear screen/alias and legal/account route treatment.
- Remove one obsolete alias/component at a time; retain a release note and rollback mapping.
- Run full TypeScript/lint/tests, production build, staging integration/RLS tests, Android build/runtime checks, iOS build/runtime checks, guide and offline flows.
- Verify no secrets/test data in production bundles/logging, route access policy, local data migration, account deletion semantics, and Supabase schema parity.

**Gate:** No known P0/P1 navigation/data/security regression; rollback tested; release owner accepts platform-specific outstanding risks.

**Rollback:** Restore the prior app artifact/route map and retain additive schema/data. Never roll back by deleting migrated user data or dropping columns.

## Cross-phase test matrix

| Area | Required cases |
|---|---|
| Navigation | Every legacy route; alias convergence; route params; tabs; push/pop; modal return; unknown route; actual previous destination on Back |
| Access | Clerk loading/signed-out; onboarding; each allowlist member; unentitled protected route; premium user; entitlement request failure; passcode lock/unlock; account deletion flow |
| Data | DTO mapping; empty rows; validation; Supabase returned error; transport failure; RLS user isolation; migrations fresh/upgrade; schema conflicts |
| Local/offline | New install; upgrade from existing localStorage; unavailable storage; offline save; app termination/restart; reconnect; duplicate replay; edit/delete order; account switch |
| Discovery | Every registry item has valid route; Search/Explore/recommendation route equality; production excludes dev tools; explicit recommendation reason/no result |
| Guides/journeys | First visit, return, skip, completion, replay, version change, offline, cross-device merge, sign-out/account switch, missing target, keyboard/safe area, Android/iOS |
| Variants | Screen capability and visual parity; all cross-links; data writes; no removed entry point |
| Production fixtures | Network error never returns fake nearby care; sample alerts/demo defaults cannot masquerade as real user/provider data |

## Rollback policy summary

All schema changes are additive during compatibility windows. App rollback may restore old clients only while their required columns/behavior remain available. Navigation rollback uses the legacy adapter. Data rollback keeps local and remote copies and retries; it does not reset IndexedDB/localStorage or remote tables. Guide/journey rollback disables presentation/evaluation while preserving progress. Offline rollback pauses replay while preserving pending operations. Any production data restoration is an incident procedure owned by the database operator and requires verified backups; it is not a normal migration step.

## Part 3A execution status

Part 3A is authorized and implements the bounded Sleep reference slice plus the explicitly scoped Cycle and nearby-care correctness fixes. Completed work includes the Sleep repository/domain/DTO boundary, persisted Sleep loading and state handling, canonical Sleep registry/guide metadata, canonical cycle-column mapping, and removal of fabricated nearby-care fallback results. The offline queue remains disconnected by design.

Remaining gates are live multi-environment schema characterization, staging RLS/upsert verification, platform validation, and any additive compatibility migration approval. This phase does not authorize application-wide routing, context extraction, feature migration, journey implementation, or screen consolidation.

## Part 3A.1 execution status

The Part 3A verification blockers were addressed without migrating another feature. Sleep stage indicators no longer present fabricated measurements; asynchronous Sleep operations reject stale account responses; guide lifecycle semantics are explicit and locally tested; mounted Sleep behavior tests cover persisted records and honest save failures; and static care-team examples are explicitly documented as non-nearby informational data. The unsafe offline queue remains disconnected.

Live schema/RLS, native, and responsive visual checks remain `NOT VERIFIED`, not assumed from local tests or build output. Search/Explore/deep-link/journey convergence and the global router remain future work.
