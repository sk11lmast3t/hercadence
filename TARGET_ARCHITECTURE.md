# HerCadence Target Architecture

**Status:** Part 2 design specification. This document and its companion specifications describe future work only; no source, navigation behavior, native project, or database has been changed.

**Primary evidence:** [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md). The audit is the source of truth for current behavior and discovered mismatches.

## Product objective

HerCadence should help people discover, understand, use, and record its existing cycle, wellness, care, and community features, then make sense of patterns and optional next steps. Users remain free to use any feature in any order. Existing appearance, capabilities, auth, entitlement behavior, passcode protection, RLS, and user data must be preserved during the migration.

## Target architecture

```text
index.html / Vite / Capacitor bootstrap
  └─ app/
       ├─ session + Clerk integration
       ├─ access-policy resolver
       └─ React Router v7 (library mode)
            ├─ 4 nested tab route branches + one browser-history stack
            ├─ canonical destination resolver
            ├─ route-based modals
            └─ temporary AppView adapter
                 └─ features/
                      ├─ canonical screen
                      ├─ feature hook
                      ├─ feature repository
                      └─ feature service/domain logic
                           └─ shared data infrastructure/
                                ├─ repository contracts/types
                                ├─ local-store adapter
                                ├─ durable sync engine
                                └─ Supabase adapter

feature-registry ──> navigation / search / Explore
       ├─> guide registry + user guide progress
       ├─> journey registry + optional journey progress
       └─> explainable recommendation rules
```

The app is a React/Vite client packaged by Capacitor, uses Clerk for identity, and Supabase for remote persistence and Edge Functions. The target keeps those integrations. It inserts explicit boundaries around them instead of replacing the application or introducing another all-purpose context.

## Architectural decisions

| Decision | Target |
|---|---|
| Primary navigation | Preserve Home, Calendar, Insights, and Profile. Explore is a nested destination, not a fifth tab. |
| Navigation implementation | React Router v7 library mode (`createBrowserRouter`/`RouterProvider`) owns URL/history and nested routes. One browser-history stack traverses tab route branches; no custom independent tab-stack manager. Capacitor App bridges Android Back and native URL events. |
| Feature identity | One stable feature ID and one canonical route per product destination, independent of entry source or visual version. |
| Migration strategy | Compatibility-first and incremental. Existing `AppView` callers continue through a typed adapter until migrated. |
| State ownership | Session, navigation, profile, cycle, feature, server, offline, guide, discovery, and transient UI state each have distinct owners. No replacement mega-context. |
| Persistence | Screens call feature hooks; repositories own local/remote persistence and error/sync contracts. Local database selection is deferred until a platform/durability/security evaluation. |
| Guides and journeys | Separate registries/services. Guides teach controls; journeys suggest optional paths; neither controls feature access or navigation. |
| Production data | Development/test fixtures must be explicitly scoped. A backend failure cannot silently return fabricated health or provider data. |
| Schema canonical names | `sleep_logs.duration_hours`, `cycles.cycle_length`, and `cycles.period_length`, subject to re-characterization of every deployed environment before rollout. These names are accepted by the live read-only checks and match foundational migrations. |
| Appearance | Preserve existing UI and interactions except for the minimum functional integration needed for route/history or guide overlays. Visual redesign is out of scope. |

## Target module boundaries

```text
src/
  app/                 Bootstrap, provider composition, access policy, app lifecycle
  navigation/          Route types, resolver, stacks/tabs/modals, AppView adapter
  features/            Domain-owned screens, hooks, services, types and feature repositories
  registry/            Canonical feature metadata and route identifiers
  discovery/           Explore, search integration, recommendation evaluation
  journeys/            Optional journey definitions and progress
  guides/              Guide definitions, lifecycle, overlay and progress store
  data/
    repository-types/  Shared repository contracts and cross-feature types only
    local/             Platform-selected local-store interface/implementation
    sync/              Durable outbox, retry, idempotency and reconciliation
    supabase/          Authenticated Supabase adapter and schema DTOs
  shared/
    components/        Reused presentation-only UI
    hooks/             Truly cross-domain presentation/application hooks
  types/               Small shared primitives only; domain models stay in features
```

Repository location is a hard boundary: **a feature-specific repository lives with its feature** (for example `src/features/sleep/SleepRepository.ts`); **truly shared infrastructure lives under `src/data/`** (`local/`, `sync/`, `supabase/`, and shared `repository-types/`). There is no generic `data/repositories/` dumping ground. An authoritative definition of responsibilities and prohibited dependencies is in [DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md).

## Canonical feature architecture

Each user-facing product destination has one registry ID, route, access policy, optional guide and suggested-next relations. Tabs, Explore, Search, in-app notifications, external links, and journeys provide a feature ID or validated legacy route to the same resolver. Entry source may be retained as navigation metadata for Back behavior, but must not select an alternate implementation.

Routes use a closed feature-ID union and feature-specific parameter types. URL, notification, legacy, and deep-link values pass centralized runtime validation before a route is constructed; open-ended `Record<string, string>` params are prohibited.

Classic/Harmonized/Modernized names describe source/UI history, not domain identity. Variants remain until behavior and references are characterized; a single canonical feature route is selected only after parity checks. The consolidation matrix and unresolved product decisions are in [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md).

## Security and access boundaries

Access policy remains centralized and behaviorally equivalent during migration:

1. Wait for Clerk/session readiness.
2. Resolve public onboarding and unauthenticated flows, preserving current exceptions and their order.
3. Apply the passcode lock to an authenticated protected app session before protected content is rendered.
4. Apply entitlement rules and the existing unentitled allowlist.
5. Resolve and render the canonical destination.

The current passcode overlay and effective-view resolver are separate code paths. Characterization tests must establish edge-case precedence (including sign-out while a local passcode is enabled) before this target order is implemented. The allowlist is copied exactly in [NAVIGATION_ARCHITECTURE.md](./NAVIGATION_ARCHITECTURE.md); no feature becomes less protected through route translation. Supabase RLS and Clerk JWT behavior remain server-enforced and must not be replaced with client-only checks.

## Data and offline boundary

```text
Screen → feature hook → feature repository → local-store adapter
                                             ↕ durable sync engine
                                             ↕ Supabase adapter
```

The repository audit found localStorage, direct feature-hook Supabase calls, and an IndexedDB queue that is not the common write path. The target keeps existing user data and storage readable while a compatible store is evaluated. Do not wire the existing queue into writes until it checks Supabase result errors, restores queue state on startup, scopes operations by user, supports idempotency, and has defined conflict/error handling.

Data contracts and safe additive schema steps are in [DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md). No migration in this phase changes a database or selects a replacement local database.

## Guided discovery boundary

```text
Feature Registry ──> Explore/Search
       ├─> Guide Registry ──> Guide Provider/Overlay ──> per-user guide progress
       ├─> Journey Registry ──> optional journey progress
       └─> deterministic recommendation rules + explanation
```

Guide lifecycle, guide-version semantics, user-synced state, Explore behavior, and journeys are specified in [GUIDED_DISCOVERY_ARCHITECTURE.md](./GUIDED_DISCOVERY_ARCHITECTURE.md). Each feature selects `offer`, `auto-start`, or `disabled` guide policy. Recommendations use configurable frequency limits; journey progress stores only `journeyId`, `status`, `lastFeatureId`, and `updatedAt`. No AI model or opaque profiling system is proposed.

## Migration and verification

The migration is staged around schema characterization, navigation compatibility, registry, state/data boundaries, offline evaluation, then one complete Sleep vertical slice (including its feature repository, local-store/sync boundary, guide, and one journey link) before applying the pattern to other features. Every stage has a test and rollback gate. See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) and [STATE_ARCHITECTURE.md](./STATE_ARCHITECTURE.md).

## Scope and unresolved decisions

- The report classifies product destinations from the existing audit; it does not authorize deletion or redesign.
- The exact local-store technology is deliberately unresolved until web, Capacitor, Android, iOS, durability, transaction, migration, performance, encryption, and sync requirements are tested.
- Several single-purpose screen destinations and overlapping CycleContext data have ambiguous ownership; they are marked for characterization or product decision in companion documents.
- Native location, push, deep links, and offline behavior require real platform validation; project files alone do not establish runtime support.
