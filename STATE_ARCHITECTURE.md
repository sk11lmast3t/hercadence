# HerCadence State Architecture

**Status:** Part 2 design only. See [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md) and [NAVIGATION_ARCHITECTURE.md](./NAVIGATION_ARCHITECTURE.md).

## State ownership rules

- A state value has one authoritative owner and an explicitly documented persistence policy.
- Do not move every `CycleContext` field into one new provider.
- Server data is owned by a feature repository/cache; React state is a view of that data, not an independent source of truth.
- Transient modal/input state stays close to the screen that owns it.
- Navigation and access policy are separate from cycle/profile data.
- User-scoped persisted state is never shared across Clerk users on one device.

## State boundary table

| State category | Target owner | Persistent? | Local/device storage | Remote | Scope and synchronization |
|---|---|---:|---|---|---|
| Auth/session | App auth boundary backed by Clerk | Provider-managed | Clerk SDK/session storage as configured | Clerk | Current session/user; clear protected return state on sign-out. Do not duplicate credentials in app storage. |
| Navigation | React Router v7 browser router | No, except explicitly safe restoration metadata | Router/browser history; optional non-sensitive restoration only after validation | No | One chronological history across four nested tab route branches; no independent tab-stack store. Routes/typed params validated; never persist credentials or sensitive record payloads. |
| Application bootstrap | App bootstrap/service | Minimal | Non-sensitive configuration/cache only | As required | App-wide; readiness/error state, not user-domain records. |
| Entitlement | `usePremiumEntitlement` adapter / policy service | Cache may be time-bounded | Non-authoritative cache only | Supabase Edge Function/backend | User-scoped; server result authoritative. Refresh on sign-in and policy-defined events. |
| Passcode configuration/lock | Privacy/security feature + app lock boundary | Yes, existing semantics preserved | Platform-appropriate secure adapter must be evaluated | Do not sync passcode/secret | Device/session scoped; secret material never enters Supabase or logs. |
| User profile/preferences | Profile repository and feature hook | Yes | Local cache/migration adapter | Supabase profiles | Per user. Reconcile by explicit field ownership; surface failed saves. |
| Cycle domain | Cycle repository/hook | Yes | Local store/cache selected after platform evaluation | Supabase cycle/profile/daily-log tables | Per user. Preserve date/log history; schema mapping must use verified names. |
| Feature domain state | Owning feature repository/hook (sleep, hydration, medication, body metrics, activity, pregnancy, tags, partner, etc.) | Yes when user data | Local cache/outbox adapter | Feature tables/Edge Functions | Per user and feature. Each entity gets an explicit idempotency/conflict policy. |
| Server/query state | Feature repository/query cache | Usually cache, not sole source | Reconstructable cache | Supabase/Edge Functions | Per user/request; loading, stale, empty, and error states distinguishable. No new global server-data context. |
| Local/offline queue | Sync engine | Yes, durable | Platform adapter under review; current IndexedDB hook is insufficient | Syncs to Supabase | Operations tagged with Clerk user, entity, idempotency key, sequence/version, and status; never replay one user's queue as another. |
| Transient UI state | Owning component or focused feature controller | No | React component state | No | Screen/modal/form scope. Clear on exit as intended; no persistence abstraction for ephemeral values. |
| Guide state | Guide-state repository | Yes | Durable local cache/outbox | User-scoped remote guide-progress table | Per Clerk user across devices (approved). Offline completion queues sync. |
| Journey progress | Journey service | Yes only for explicit progress | Local only by default | No by default | Store exactly `journeyId`, `status`, `lastFeatureId`, `updatedAt`; no health data. Remote sync needs separate product/privacy approval. |
| Discovery state | Discovery service | Minimal | Recent feature IDs and recommendation impression/dismissal metadata | No by default; only after privacy review | Apply configurable recommendation frequency policy; no inference or new health telemetry. |
| Fixtures/demo content | Test/dev fixture layer | No production persistence | Test/dev environment only | Never | Compile/runtime isolation prevents fixtures from being interpreted as real health or provider data. |

## CycleContext extraction boundary

`CycleContext` currently holds settings, logs, `currentView`, selected date, community posts, tags, selected content, appointment state, and log-sheet visibility; it also writes several values to localStorage and hydrates profile/log/cycle data from Supabase. It remains as a compatibility facade during extraction.

| Existing responsibility | Target owner |
|---|---|
| `currentView`, navigation callback | React Router v7 route state; legacy adapter during migration |
| `selectedDate` where part of calendar state | Calendar feature state; navigation may carry a validated date parameter |
| Profile settings | Profile repository/hook |
| Cycles and daily logs | Cycle/daily-log repository and feature hooks |
| Custom mood/symptom tags | Symptom/tag feature repository; preserve existing local keys while migrating |
| Posts and selected post | Community repository + community route params |
| Selected article | Learning destination parameter or learning feature state |
| Appointment | Care feature state/appointment ID route param |
| Log sheet visibility/date | Local shell/UI controller; no global cycle provider ownership |

Avoid moving state that has not been verified as used. Inventory and tests are prerequisites; the table is intended ownership, not permission to delete current fields.

## Persistence and lifecycle rules

- Read and migrate existing localStorage keys without destructive cleanup. A migration must be idempotent and preserve an export/rollback path.
- Data loaded locally remains distinguishable as local/pending from data confirmed remote.
- Sign-out clears or seals user-scoped in-memory state and prevents queued operations from being sent under a different user. Durable per-user pending data is retained only under that same user identity and handled according to account policy.
- Startup rehydrates queue state before reporting “synced”; account switches cannot reuse stale values.
- Error state is observable to callers and users through repository contracts; JSON/storage failure cannot silently fabricate successful persistence.
- Guide progress sync is per Clerk user; local unsynced completion survives offline transitions and reconciles when that same user returns.

## State transition contract

Remote-backed feature reads/writes expose a typed state equivalent to:

```text
idle → loading → success(data) | empty
                 └→ error(retryable, safe message)
offline → local(data, pending operations)
syncing → synced | sync-failed(retryable, operation reference)
```

Do not require identical UI for every feature. Preserve field-level validation and domain-specific errors. A request that resolves at the transport layer but returns a Supabase `error` is a failure, not success. Optimistic updates must have a defined rollback/pending indication.

## Guide and discovery lifecycle

Guide state is separate from route and entitlement state. Opening a feature may start its guide after the canonical screen is available; any error or inability to find a target must dismiss/fall back to normal screen use. Per-user sync/merge rules are detailed in [GUIDED_DISCOVERY_ARCHITECTURE.md](./GUIDED_DISCOVERY_ARCHITECTURE.md).

Discovery state stores only the small fields required for recency and recommendation impression/dismissal policy. Journey state uses exactly `journeyId`, `status`, `lastFeatureId`, and `updatedAt`. Recommendation rules read existing domain progress through repository interfaces; do not copy health data into discovery or journey state. See [GUIDED_DISCOVERY_ARCHITECTURE.md](./GUIDED_DISCOVERY_ARCHITECTURE.md) for `offer`/`auto-start`/`disabled` and frequency policy.
