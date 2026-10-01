# HerCadence Architecture Audit

**Scope:** Part 1 of the architecture rebuild brief. This is an audit and proposed information architecture only. No application code, database, or native project files were changed.

## 1. Current architecture diagram

```text
index.html
  └─ src/main.tsx
      └─ Clerk/auth and application providers
          └─ src/App.tsx
              ├─ auth + entitlement + passcode gates
              ├─ AppView switch
              ├─ MobileAppShell / BottomNavBar
              └─ screen components
                  ├─ CycleContext and screen-local state
                  ├─ feature hooks ──> Supabase / Edge Functions
                  └─ localStorage in selected flows

CycleContext
  ├─ application and cycle state
  ├─ currentView / selectedDate / settings / daily logs
  ├─ localStorage persistence
  └─ direct Supabase hydration and writes

Feature hook ──> useSupabase (Clerk token) ──> Supabase tables / Edge Functions

useOfflineSync ──> IndexedDB queue ──> attempted Supabase replay
                     (not wired into reviewed feature writes)
```

The client is a React/Vite application packaged for Capacitor. Navigation and much of data access are composed directly in the application and screen layers rather than flowing through distinct navigation, repository, and sync layers.

## 2. Current navigation map

### Root and account flow

```text
main.tsx
  └─ App.tsx
      ├─ initial view: HOME when baseline setup is complete;
      │                 INITIAL_BASELINE_SETUP otherwise
      ├─ signed out: most views resolve to LOGIN_GATEWAY
      ├─ signed in, not entitled: most views resolve to TRIAL_PAYWALL
      ├─ PASSCODE_LOCK screen + separate locked-app overlay
      └─ effective AppView → large switch → screen component
```

The onboarding sequence is `ONBOARDING_WELCOME → ONBOARDING_UNDERSTOOD → ONBOARDING_TRACK_EASE → ONBOARDING_SUCCESS → HOME`. `INITIAL_BASELINE_SETUP` is also used as the initial view for users without completed baseline data and leads to login when completed. Fresh sign-in has an app-level `complete-onboarding` call and entitlement check.

### Main navigation and screen transitions

```text
Main tabs: HOME ── CALENDAR ── INSIGHTS ── PROFILE
               │       │          │           │
               └───────┴── screen-specific callbacks ─┘

ScreenDirectoryModal / route buttons / notifications / feature callbacks
  └─ setCurrentView(AppView)
      └─ App.tsx switch
```

The `AppView` union is declared in `src/types.ts`; `CycleContext` holds `currentView`; `src/App.tsx` translates it into screen components. `MobileAppShell`, `BottomNavBar`, and `ScreenDirectoryModal` also navigate by setting that value. There is no URL router or general navigation history/stack evident in the reviewed app. Most Back actions are hard-coded destinations supplied by the route case, rather than returning to the actual originating screen.

| Destination family | Current route(s) and screen | Common entry / exit behavior |
|---|---|---|
| Home | `HOME` → `HarmonizedForecastHomeScreen`; `CLASSIC_HOME` → `HomeScreen`; `HARMONIZED_HOME` → `HarmonizedHomeScreen`; `HARMONIZED_DASHBOARD` → `HarmonizedDashboardScreen` | Main tab enters `HOME`; alternate routes can be selected through callbacks/directory. Feature links commonly return to `HOME`. |
| Calendar and fertility | `CALENDAR` / `HARMONIZED_CALENDAR` → `HarmonizedCalendarScreen`; `FERTILITY_DETAIL` → `FertilityDetailScreen`; `BBT_LOG` → `BbtLogScreen`; `BIRTH_CONTROL` → `BirthControlScreen`; `MUCUS_LOG`, `SYMPTOM_HISTORY`, `SYMPTOM_INTENSITY_LOG` → corresponding Modernized screens | Calendar tab enters `CALENDAR`; fertility detail links back to calendar or BBT; BBT returns home; mucus/symptom histories return to calendar. |
| Insights and learning | `INSIGHTS` → `ModernizedInsightsScreen`; `CLASSIC_INSIGHTS` → `InsightsScreen`; `HARMONIZED_INSIGHTS` → `HarmonizedInsightsScreen`; `PERSONALIZED_INSIGHTS`, `SLEEP_INSIGHTS`, `NUTRITION_CYCLE`, `VIDEO_LIBRARY`, `LUTEAL_ARTICLE` | Insights tab enters `INSIGHTS`; these feature screens commonly return to Insights. Modernized and Harmonized insights both use `useHealthInsights`; learning pages are separate destinations. |
| Profile and settings | `PROFILE` → `ModernizedProfileScreen`; `CLASSIC_PROFILE` → `ProfileScreen`; `APP_PREFERENCES`, `EDIT_PROFILE`, `HEALTH_PROFILE`, `CUSTOM_TAGS`, `CONNECTED_DEVICES`, `NOTIFICATIONS`, `PASSCODE_LOCK`, `PARTNER_SYNC` | Profile tab enters `PROFILE`; most settings routes return to Profile. Health Profile also links to export/devices; emergency help links to Health Profile. |
| Daily wellness and activity | `FEELING_TODAY`, `FOCUS_ENERGY_TRACKER`, `PHYSICAL_COMFORT_TRACKER`, `HYDRATION_TRACKER`, `PHYSICAL_ACTIVITY`, `BODY_METRICS`, `WELLNESS_REMINDERS_PERMISSION` | Commonly entered from Home or Insights; several routes hard-code Back to Home or Insights. Body Metrics and Physical Activity call `useBodyMetrics`; hydration has its own feature hook. |
| Medication, supplements, pregnancy | `MEDICATION_TRACKER`, `MEDICATION_HISTORY`, `SUPPLEMENT_TRACKER`, `PREGNANCY_MODE` | Medication tracker returns to Home and links to history; history returns to tracker. Other routes commonly return Home or Profile. |
| Care and records | `DOCTORS_CARE_TEAM`, `APPOINTMENT_DETAIL`, `EMERGENCY_HELP`, `EXPORT_HEALTH_REPORT`, `EXPORT_SUCCESS` | Care/appointment routes are linked to one another and return to Insights; Emergency Help returns to Profile. Export uses `useHealthExport`; export completion returns to Profile or its prior explicit destination. |
| Community and partner features | `COMMUNITY`, `CREATE_POST`, `POST_DETAIL`, `PARTNER_SYNC_DETAILS`, `CYCLE_AI_ASSISTANT`, `CYCLE_SYNCED_FITNESS` | Community → create/detail → Community; both cycle-assistant route IDs render `CycleSyncedFitnessScreen`. Partner details return to Profile. |
| Search, notifications, utility | `SEARCH_HUB`, `NOTIFICATION_INBOX`, `OFFLINE_SYNC`, `WHATS_NEW`, `NOT_FOUND_404` | Most utility routes return to Home. Search, notification, journey, and deep-link entry do not converge through an explicit canonical destination registry. `NOT_FOUND_404` is routed and can also be shown from the offline banner. |
| Subscription, legal, account | `TRIAL_PAYWALL`, `PREMIUM`, `MANAGE_BILLING`, `DELETE_ACCOUNT`, `TERMS_OF_SERVICE`, `PRIVACY_POLICY`, `TERMS_CLINICAL_DISCLAIMER`, `DATA_PRIVACY_SECURITY`, `FORGOT_PASSWORD` | Entitlement redirects most protected routes to the paywall. The routes above include allowlisted exceptions; several legal route cases do not pass an explicit Back callback. Delete Account returns to privacy/security and completes to onboarding welcome. |
| Onboarding and authentication | `INITIAL_BASELINE_SETUP`, `ONBOARDING_WELCOME`, `ONBOARDING_UNDERSTOOD`, `ONBOARDING_TRACK_EASE`, `ONBOARDING_SUCCESS`, `LOGIN_GATEWAY` | Explicit onboarding sequence; baseline completion leads to login; successful login leads to Home. |
| Alternate/developer screens | `KOTLIN_ANDROID_CODE`; screen directory modal; `CLASSIC_*` and `HARMONIZED_*` alternatives | The Kotlin viewer is a code browser. Directory entries expose alternate screen variants in the same navigation system as production routes. |

The switch also has a fallback to `ModernizedNotFoundScreen`; the explicit `NOT_FOUND_404` route is a separate entry. `CYCLE_AI_ASSISTANT` and `CYCLE_SYNCED_FITNESS` currently point to the same component. The allowlist in `App.tsx` is the authoritative exception list; all other destinations are subject to the premium gate.

## 3. Screen and feature inventory

The screen directory contains **74 screen files**: 39 Classic, 5 Harmonized, and 30 Modernized. These names are not a strict one-to-one mapping: some variants are alternate layouts, some are unique feature pages, and some are mockup or developer surfaces.

| Product area | Current screens and variants | Data, shared state, dependencies, and notes |
|---|---|---|
| Home, dashboard, daily check-in | `HomeScreen`, `HarmonizedHomeScreen`, `HarmonizedDashboardScreen`, `HarmonizedForecastHomeScreen`, `HowAreYouFeelingScreen`, `FocusEnergyTrackerScreen`, `PhysicalComfortTrackerScreen` | Core cycle/settings/log state is exposed by `CycleContext`; Home includes phase recommendations and inline symptom-save behavior. Harmonized dashboard includes mockup-derived hydration defaults. |
| Calendar, cycle, fertility | `CalendarScreen`, `HarmonizedCalendarScreen`, `FertilityDetailScreen`, `BbtLogScreen`, `BirthControlScreen`, `ModernizedMucusLogScreen`, `ModernizedSymptomHistoryScreen`, `ModernizedSymptomIntensityLogScreen`, `ModernizedPregnancyModeScreen` | Cycle dates, selected date, and logs are coupled to shared state. Calendar and Harmonized Calendar contain screen-local date/phase logic; some log features have direct feature hooks. |
| Insights, sleep, hydration, body, activity | `InsightsScreen`, `HarmonizedInsightsScreen`, `ModernizedInsightsScreen`, `PersonalizedInsightsScreen`, `ModernizedSleepInsightsScreen`, `ModernizedHydrationTrackerScreen`, `ModernizedBodyMetricsScreen`, `ModernizedPhysicalActivityScreen` | Insights variants use `useHealthInsights` in at least Modernized/Harmonized implementations. Sleep, hydration, body metrics, and activity have separate hooks that talk to Supabase; Body Metrics and Physical Activity share `useBodyMetrics`. Several screens contain UI-local sample state. |
| Medication, supplements, nutrition | `ModernizedMedicationTrackerScreen`, `ModernizedMedicationHistoryScreen`, `ModernizedSupplementTrackerScreen`, `ModernizedNutritionCategoryScreen`, `LutealNutritionArticleScreen` | Feature hooks exist for medication/supplement/nutrition-like data; the article and category screens include content-oriented UI. Persistence and read/write behavior are not mediated by a common repository layer. |
| Profile, account, privacy, subscription | `ProfileScreen`, `ModernizedProfileScreen`, `ModernizedEditProfileScreen`, `AppPreferencesScreen`, `PasscodeLockScreen`, `ModernizedPrivacySecurityScreen`, `PrivacyPolicyScreen`, `TermsOfServiceScreen`, `ModernizedLegalDisclaimerScreen`, `ModernizedForgotPasswordScreen`, `ModernizedDeleteAccountScreen`, `PremiumSubscriptionScreen`, `ModernizedTrialPaywallScreen`, `ModernizedBillingReceiptsScreen`, `ModernizedAppReviewScreen`, `ModernizedWhatsNewScreen` | Profile/settings share application state and profile-related hooks. Forgot Password contains demo defaults/sample OTP behavior; allowlisting and premium access are enforced in the root view gate. |
| Care, health records, devices, support | `DoctorsCareTeamScreen`, `AppointmentDetailScreen`, `HealthProfileScreen`, `ExportHealthReportScreen`, `ExportSuccessScreen`, `ConnectedDevicesScreen`, `EmergencyHelpScreen`, `ModernizedSupportFaqScreen` | Export calls `useHealthExport`; care lookup uses geolocation and a nearby-care hook/Edge Function, with mock-provider fallback on error. |
| Community, partner, discovery | `CommunityGatewayScreen`, `CommunityPostDetailScreen`, `CreatePostScreen`, `PartnerSyncScreen`, `ModernizedPartnerSyncDetailsScreen`, `DiscoveryVideoLibraryScreen` | Community and partner data are represented in shared state and feature hooks; navigation is callback-driven rather than route-stack based. |
| Notifications, search, system states | `ModernizedNotificationInboxScreen`, `ModernizedSearchScreen`, `ModernizedOfflineStateScreen`, `ModernizedNotFoundScreen`, `ModernizedWellnessPermissionScreen` | Inbox includes an initial sample-notification array/reset behavior. Offline/Not Found screen checks browser network state and calls `/api/health`. |
| Onboarding and login | `EmpowerWelcomeScreen`, `YourCycleUnderstoodScreen`, `TrackWithEaseScreen`, `InitialBaselineSetupScreen`, `LoginGatewayScreen`, `OnboardingSuccessScreen` | Baseline setup writes pending onboarding data to `localStorage`; Login Gateway reads it, invokes an Edge Function, then removes it. |
| Developer/test navigation | `KotlinAndroidCodeViewerScreen`; `ScreenDirectoryModal` (common component) | The Kotlin screen presents embedded Android code. The directory exposes screen names and variant routes and is developer/test-style rather than user-oriented discovery. |

### Common dependency observations

- Most screens are rendered inside the root application and can access global context, but consumption differs by feature. `CycleContext` is both shared domain state and navigation state, not a narrowly scoped cycle-only context.
- Feature hooks often call Supabase directly through the Clerk-aware `useSupabase` hook. A uniform feature repository boundary is not present.
- Some screens combine presentation with domain calculations, local persistence, remote calls, or seeded demonstration data. Examples include calendar calculations, onboarding `localStorage`, and mock-derived dashboard/notification values.
- No shared, versioned, declarative first-use guide registry or guide lifecycle was found. There is onboarding copy and baseline setup, but it is not a reusable guide system for each feature.
- Screen grouping is approximate where a destination is cross-feature or where a Classic/Harmonized/Modernized name does not represent a direct replacement.

## 4. State and data-flow diagram

```text
                    ┌─ Clerk auth/session
App.tsx / screens ──┼─ CycleContext
                    │    ├─ currentView, selectedDate
                    │    ├─ settings, cycles, daily logs
                    │    ├─ community/tags and other shared data
                    │    └─ localStorage hydration/persistence
                    │
                    ├─ useFeature hooks ──> useSupabase
                    │                         ├─ Supabase tables
                    │                         └─ Edge Functions
                    │
                    └─ screen-local React state / sample data

useOfflineSync ──> IndexedDB pending operations ──> replay to Supabase
                         (separate from feature writes; error semantics incomplete)
```

The browser/local state and Supabase are competing sources for some data. CycleContext persists values locally and separately hydrates user data remotely; hooks maintain their own in-memory arrays. There is no single reconciliation, invalidation, or retry contract shared across features.

## 5. Current architecture problems

1. **Navigation and UI composition are coupled.** The `AppView` union, root switch, shell, directory, and screen callbacks all need to know route IDs. Back destinations are hard-coded and there is no general stack, URL, or state-restoration model.
2. **`CycleContext` has broad responsibilities.** It owns navigation as well as user settings, cycles/logs, and other app-level/feature data. Changes in unrelated features can therefore interact through one provider.
3. **Screen variants duplicate feature intent.** Classic/Harmonized/Modernized components and route aliases coexist, while only selected versions are reached through the primary tabs. It is unclear which implementation is canonical for several destinations.
4. **Presentation and business/persistence logic are mixed.** Calendar math, recommendations, onboarding persistence, remote calls, and sample values occur in screens.
5. **Persistence is inconsistent.** Some flows use CycleContext/localStorage, others call Supabase through independent hooks, and the offline queue is not a common write path.
6. **Offline behavior is incomplete.** `useOfflineSync` defines IndexedDB queue/replay behavior but is not used by the reviewed daily-log or feature-hook writes. It deletes queued operations after resolved Supabase calls without checking the returned error object, and queue-count state can diverge after IndexedDB failures.
7. **Errors/loading differ by feature.** Some hooks set error state, some only log, and some ignore returned Supabase errors. Loading and authentication readiness are not handled consistently.
8. **Prototype content can be mistaken for production data.** Fixed mockup values, sample notifications, and demo login values are present in screens. Nearby-care errors can fall back to mock providers, so a failed real lookup may look like successful results.
9. **Discovery is developer-oriented.** `ScreenDirectoryModal` catalogs screen IDs/variants, but no user-facing Explore/feature registry, journey graph, or contextual next-step system was found.
10. **No reusable first-use system was found.** Onboarding covers initial setup, but individual destinations do not have a shared guide registry, versioned completion state, or replay mechanism.
11. **Documentation and runtime configuration are not fully aligned.** README describes offline-ready behavior, but the queue is disconnected from feature writes and VitePWA is imported but not configured as a plugin in `vite.config.ts`.

## 6. Duplicate implementations and orphan/reachability concerns

- Home, Calendar, Insights, and Profile have multiple Classic/Harmonized/Modernized implementations. The primary route uses Harmonized Forecast Home, Harmonized Calendar, Modernized Insights, and Modernized Profile; alternate variants remain routable.
- `CYCLE_AI_ASSISTANT` and `CYCLE_SYNCED_FITNESS` render the same `CycleSyncedFitnessScreen`.
- `HARMONIZED_HOME`, `HARMONIZED_DASHBOARD`, and `HARMONIZED_INSIGHTS` are alternate routes not used by the main tab flow. `HARMONIZED_CALENDAR` is also used by the main calendar route.
- The screen directory exposes variants in the same route system as ordinary features; no separate dev-only build gate was evident in the reviewed navigation.
- `NOT_FOUND_404` is explicitly routed, while an unmatched-route fallback also renders the Not Found screen.
- Legal routes do not all receive explicit Back callbacks. With no general route history, their exit behavior should be verified.
- Feature destinations may be reachable only through callbacks or the screen directory rather than a coherent user-facing feature map. The audit found no canonical mechanism ensuring Search, notification, deep-link, or future journey entry all resolve to the same feature destination.
- The audit did not establish that every route is reachable from production UI, nor that a route is intentionally public; this should be resolved from product requirements before deleting or gating routes.

## 7. Critical dependencies

| Dependency | Current role | Migration sensitivity |
|---|---|---|
| Clerk | Authentication/session, user IDs, JWT token access | Keep existing auth and signed-in user data behavior; feature queries rely on Clerk identity. |
| `CycleContext` | Shared settings, cycle/log data, route state and local persistence | High. Many screens consume it; split incrementally and retain a compatibility provider until call sites migrate. |
| `AppView` and `App.tsx` switch | Route contract and screen mounting | High. Shell tabs, screen callbacks, gates, and developer directory all depend on the route union. |
| `useSupabase` / Supabase | Authenticated data access and Edge Function calls | High. Preserve RLS/Clerk token behavior and validate actual schema before changing repository contracts. |
| `localStorage` | Settings/log persistence and pending onboarding handoff | High for continuity; migrations must preserve existing keys/data and safe fallback behavior. |
| Capacitor Android/iOS WebView | Native packaging and plugin bridge | High. Runtime permissions/plugin configuration differ by platform and are not proven by web builds. |
| IndexedDB offline queue | Intended retry boundary | High risk if enabled without idempotency, durable queue recovery, and returned-error handling. |

## 8. Database/schema inconsistencies

### `sleep_logs`

The migrations disagree. `002_medical_tables.sql` and `008_backend_schema.sql` define `duration_hours`; `009_schema_fixes.sql` creates `hours_slept` only if the table does not already exist. Since `CREATE TABLE IF NOT EXISTS` does not reconcile an existing table, it does not add or rename the column. `src/hooks/useSleep.ts` selects and writes `hours_slept`.

A live, read-only PostgREST check was performed with `limit=0`:

```text
select=id,log_date,bedtime,wake_time,hours_slept,quality,notes
HTTP 400: column sleep_logs.hours_slept does not exist

select=id,log_date,bedtime,wake_time,duration_hours,quality,notes
HTTP 200: []
```

The empty result means no rows were requested/returned; the successful query confirms the selected `duration_hours` column is accepted. This is not resolved in the current schema/client pairing.

### `cycles`

`CycleContext` reads `cycles.cycle_length_days` and `cycles.period_length_days`; the migrations define `cycles.cycle_length` and `cycles.period_length`. The `_days` names appear on profile data rather than the `cycles` table. A live, read-only schema probe also confirmed the mismatch:

```text
select=cycle_length,period_length
HTTP 200: []

select=cycle_length_days,period_length_days
HTTP 400: column cycles.cycle_length_days does not exist
```

The context's cycle query does not surface the returned Supabase error, so users can see missing/stale data without an explicit schema error.

### Migration overlap and related risks

Migrations `001/002` and `008` overlap on core tables with differing column definitions. `009` relies on `CREATE TABLE IF NOT EXISTS` for feature tables, which cannot make a pre-existing table conform to its newer definition. The live checks above demonstrate why migration files alone do not establish the deployed schema. Before feature/repository migration, compare deployed columns, constraints, relationships, and RLS policies; make any repair additive and preserve existing rows.

Other code/schema concerns found during the source review include a `usePartnerPermissions` nested relationship query and upsert conflict target that need validation against the deployed foreign keys/unique constraints. No destructive database operation is recommended.

## 9. Recommended target architecture

This is a proposal for later design, not an implementation in this audit.

```text
App bootstrap
  ├─ auth/session provider
  ├─ route resolver + tab/stack/modal navigation
  ├─ entitlement and passcode guards
  └─ feature registry / discovery
       └─ canonical feature destination
            └─ feature screen
                 └─ feature hook
                      └─ feature repository
                           ├─ local/offline store
                           ├─ sync engine
                           └─ Supabase

Feature registry ──> guide registry / journey registry ──> contextual suggestions
```

Recommended boundaries:

- Make a typed route/navigation layer the canonical entry for tabs, nested feature destinations, Back, modal routes, and future external entries. Keep a compatibility adapter for existing `AppView` callers during migration.
- Keep auth/session and entitlement at the app boundary. Preserve current allowlist/paywall behavior while route IDs are migrated.
- Narrow global state to app/session-level needs. Move cycle domain state and feature state to their owning feature boundary; keep transient screen/modal state local.
- Move persistence and remote calls behind feature repositories incrementally. Feature hooks remain the UI-facing API; repositories own data mapping, local persistence, remote calls, and errors.
- Treat local/offline writes as explicit pending/synced/failed operations with durable recovery and returned-error checks. Do not select or replace storage technology until its web, Android, and iOS constraints are evaluated.
- Establish a canonical feature registry to describe user-visible destinations, protection/discoverability, and future guide/journey metadata. Keep developer screen tools out of production discovery.
- Consolidate screen variants only after their routes, behavior, shared state, analytics/data, and visual differences are inventoried and tests cover parity. Do not delete a variant solely because the primary tab does not use it.

### Proposed information architecture

```text
Home
Calendar
Insights
Profile

Explore
├─ Cycle & fertility
│  ├─ Daily check-in / symptoms
│  ├─ Calendar, BBT, mucus, fertility
│  └─ Birth control / pregnancy mode
├─ Wellness
│  ├─ Sleep, hydration, body metrics, activity
│  ├─ Medication, supplements, nutrition
│  └─ Focus, energy, physical comfort
├─ Understand
│  ├─ Cycle and wellness insights
│  └─ Videos and educational articles
├─ Care & records
│  ├─ Care team, appointments, emergency help
│  ├─ Health profile and export
│  └─ Connected devices
├─ Community & connections
│  ├─ Community
│  └─ Partner sync
└─ Account & help
   ├─ Profile, preferences, privacy, security
   ├─ Notifications and support
   └─ Subscription, billing, legal
```

This grouping reflects existing screens; it does not assume new product features. The screen directory and Kotlin code viewer are developer utilities and should not be part of ordinary user discovery.

## 10. Migration risks

- **Route compatibility:** direct `setCurrentView` references are distributed across screens and shared navigation components. Removing or renaming `AppView` too early risks broken entry points and callbacks.
- **Auth/premium behavior:** changing routing can accidentally bypass login, entitlement, allowlist, deletion, or passcode behavior.
- **User-data continuity:** localStorage and remote data may differ. Replacing either source or changing IDs/column mappings can hide or overwrite existing entries.
- **Schema uncertainty:** the live `sleep_logs` and `cycles` schemas differ from some migrations and client expectations. A client-only rename or destructive reset would not be a safe repair.
- **Offline data loss:** the current queue is not the write path. Enabling it without durable replay, idempotency, deletion semantics, conflict policy, and visible failures could duplicate or lose writes.
- **Variant parity:** visually similar screens may have different data behavior and route reachability. Consolidation must preserve feature capabilities and existing visual design.
- **Mock/live confusion:** mock providers, sample notifications, and demo defaults need explicit production boundaries before moving data logic.
- **Native regressions:** web type/build success does not validate location permissions, push registration, deep links, storage, or navigation on Android/iOS.
- **Test gap:** the repository contains a focused cycle-calculation unit test, but no route-level or end-to-end journey suite was found in the reviewed test inventory. Architecture changes need navigation/data-flow regression coverage.

## 11. Proposed migration order

1. **Characterize current flows and data contracts.** Record route callbacks, gates, local keys, hook/table mappings, and current screen variants. Add tests before changing behavior.
2. **Resolve deployed schema safely.** Confirm table columns, relationships, constraints, and RLS. Define additive/compatible migration(s) for `sleep_logs` and `cycles`; preserve old columns/data until compatibility is verified.
3. **Introduce navigation foundation and compatibility adapter.** Add canonical typed destinations and route history while keeping `AppView` callers operational. Reproduce auth, entitlement, passcode, tabs, and Back semantics.
4. **Create feature registry.** Use it to back feature discovery and eliminate duplicate route/catalog definitions. Keep developer tools separately accessible for development.
5. **Separate application and feature state.** Extract navigation/auth/session responsibilities first, then move cycle and feature state in small slices without introducing a replacement mega-context.
6. **Add repository boundaries by feature.** Start with a well-bounded domain, map DTOs to domain types, expose errors/loading consistently, and keep current hooks/screens compatible during transition.
7. **Connect local/offline storage and sync deliberately.** Specify durability, queue recovery, retries, conflict behavior, idempotency, and platform storage before changing feature writes.
8. **Migrate and consolidate canonical destinations incrementally.** Compare Classic/Harmonized/Modernized behavior, migrate one destination at a time, update all entry points, and remove old code only after repository-wide references and behavior tests confirm it is obsolete.
9. **Add guided discovery after the registry/navigation boundaries exist.** Build shared versioned guide and journey services around existing screens; do not block feature usage or redesign screens.
10. **Verify each stage.** Run TypeScript/lint, focused and full tests, production build, Android build/config validation, and iOS build/config validation where tooling is available. Exercise auth, entitlement, offline/reconnect, deep links, and native permissions on target platforms.

## Audit limits and verification

- This was a source/configuration review plus read-only schema-only PostgREST checks (`limit=0`); no user rows were read or changed.
- No native build/device/simulator, push delivery, geolocation prompt, deep-link launch, or offline/reconnect runtime flow was exercised.
- Screen grouping is approximate for shared/cross-feature views. Route exit behavior is based on the callbacks passed at the root switch; UI-only exit paths should be verified before any migration.
- This document is the only intended deliverable for Part 1. The application remains functionally unchanged; stop here before target architecture specification or implementation.
