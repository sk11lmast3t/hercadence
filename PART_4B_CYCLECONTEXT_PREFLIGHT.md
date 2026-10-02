# 1. Executive Summary

The current `CycleContext` is a compatibility container, not a single domain store. The code in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) owns navigation state, settings, cycle-derived calculations, daily logs, community records, custom tags, appointment data, selected-detail state, and transient UI state, while also performing localStorage persistence and Supabase hydration.

This makes the file broad but not irreducibly monolithic. The strongest extraction seam is already visible: the app’s navigation boundary has been narrowed by the Part 4A.2 canonical navigation layer, and the five approved wellness feature slices are already conceptually separated from `CycleContext` in their own feature-owned repositories and hooks. The safest future Part 4B boundary is therefore not a wholesale extraction of all context values, but a staged split that isolates navigation compatibility first and then moves feature-domain state by ownership.

The audited dependency graph does not justify a “replace the whole context” action today, but it does justify a bounded extraction effort once the navigation state is decoupled and protected with tests. The current preflight supports a narrow and defensible Part 4B boundary.

# 2. CycleContext Inventory

| Name | Type | Initial value | State owner | Setter | Read consumers | Write consumers | Persistence | Remote source | Domain | Navigation-related? | Transient UI? | User-scoped? | Feature-owned? | Global app concern? | Migration difficulty |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| settings | UserSettings | `initialSettings` | `CycleProvider` local state | `updateSettings` | many screens and hooks | `updateSettings`, hydration effect | localStorage + profile hydration | Supabase profiles + cycle repository | User settings/preferences | No | No | Yes | No | Yes | Medium |
| updateSettings | `(newSettings: Partial<UserSettings>) => void` | function closure | `CycleProvider` | N/A | many screens | called by screens | writes localStorage via effect | N/A | User settings/preferences | No | No | Yes | No | Yes | Low |
| dayLogs | Record<string, DayLog> | `{}` or localStorage read | `CycleProvider` | `saveDayLog` | screens, hooks, insights | `saveDayLog`, hydration effect | localStorage + Supabase hydration | `daily_logs` | Daily logging | No | No | Yes | No | Yes | High |
| saveDayLog | `(date, log) => void` | function closure | `CycleProvider` | N/A | screens, hooks | many screens/hook callers | updates local state only; localStorage sync via effect | N/A | Daily logging | No | No | Yes | No | Yes | Medium |
| selectedDate | string | `formatDateToISO(new Date())` | `CycleProvider` | `setSelectedDate` | calendar, daily log flows, dashboard hooks | screens and hooks | no direct persistence | N/A | Daily logging / calendar | Partially | No | Yes | No | Yes | Medium |
| setSelectedDate | `(date: string) => void` | function closure | `CycleProvider` | N/A | screens, hooks | multiple screen flows | no direct persistence | N/A | Daily logging / calendar | Partially | No | Yes | No | Yes | Low |
| currentCycle | CycleCalculationResult | derived from settings | `CycleProvider` | N/A | screens, hooks | derived value only | no direct persistence | derived locally | Cycle domain | No | No | Yes | No | Yes | Low |
| currentView | AppView | `settings.hasCompletedBaseline ? 'HOME' : 'INITIAL_BASELINE_SETUP'` | `CycleProvider` | `setCurrentView` | `App.tsx`, screens, hooks | `App.tsx`, some screens | no direct persistence | N/A | Navigation | Yes | No | Yes | No | Yes | Low |
| setCurrentView | `(view: AppView) => void` | function closure | `CycleProvider` | N/A | `App.tsx`, screens, hooks | many navigation entry points | no direct persistence | N/A | Navigation | Yes | No | Yes | No | Yes | Low |
| posts | CommunityPost[] | `initialPosts` or localStorage read | `CycleProvider` | `addPost` and like/bookmark/comment helpers | community screen | `addPost`, like/bookmark/comment | localStorage | none in current code | Community | No | No | Yes | No | Yes | Medium |
| addPost | `(title, content, tags) => void` | function closure | `CycleProvider` | N/A | community create screen | create-post screen | writes posts state; then persisted via effect | N/A | Community | No | No | Yes | No | Yes | Medium |
| togglePostLike | `(postId) => void` | function closure | `CycleProvider` | N/A | community detail/gateway screen | community screens | writes posts state | N/A | Community | No | No | Yes | No | Yes | Medium |
| togglePostBookmark | `(postId) => void` | function closure | `CycleProvider` | N/A | community screens | community screens | writes posts state | N/A | Community | No | No | Yes | No | Yes | Medium |
| addComment | `(postId, content) => void` | function closure | `CycleProvider` | N/A | community detail screen | community detail screen | writes posts state | N/A | Community | No | No | Yes | No | Yes | Medium |
| selectedPost | CommunityPost | null | `CycleProvider` | `setSelectedPost` | community detail screen | detail screen | no direct persistence | N/A | Community | Partially | No | Yes | No | Yes | Medium |
| setSelectedPost | `(post: CommunityPost | null) => void` | function closure | `CycleProvider` | N/A | community screens | screen navigation / selection | no direct persistence | N/A | Community | Partially | No | Yes | No | Yes | Low |
| videos | VideoItem[] | `initialVideos` | `CycleProvider` | N/A | discovery screens (if used) | none | no direct persistence | N/A | Discovery/content | No | No | No | No | No | Low |
| articles | ArticleItem[] | `initialArticles` | `CycleProvider` | N/A | discovery/article screens | none | no direct persistence | N/A | Discovery/content | No | No | No | No | No | Low |
| selectedArticle | ArticleItem | `initialArticles[0]` | `CycleProvider` | `setSelectedArticle` | article detail screens | screens | no direct persistence | N/A | Discovery/content | Partially | No | Yes | No | Yes | Medium |
| setSelectedArticle | `(article: ArticleItem | null) => void` | function closure | `CycleProvider` | N/A | article screens | article screens | no direct persistence | N/A | Discovery/content | Partially | No | Yes | No | Yes | Low |
| appointment | DoctorAppointment | `initialAppointment` | `CycleProvider` | `updateAppointment` | appointment detail / emergency help screens | appointment screens | no direct persistence | N/A | Care/appointments | Partially | No | Yes | No | Yes | Medium |
| updateAppointment | `(appt: Partial<DoctorAppointment>) => void` | function closure | `CycleProvider` | N/A | appointment screens | appointment detail flows | no direct persistence | N/A | Care/appointments | Partially | No | Yes | No | Yes | Low |
| customMoodTags | string[] | initial tags or localStorage read | `CycleProvider` | `addCustomTag` / `removeCustomTag` | custom tags screen, log modal | tag UI | localStorage | N/A | User settings/preferences | No | No | Yes | No | Yes | Medium |
| customSymptomTags | string[] | initial tags or localStorage read | `CycleProvider` | `addCustomTag` / `removeCustomTag` | custom tags screen, log modal | tag UI | localStorage | N/A | User settings/preferences | No | No | Yes | No | Yes | Medium |
| addCustomTag | `(category, tag) => void` | function closure | `CycleProvider` | N/A | tag screens | custom tag management | writes local state + localStorage effect | N/A | User settings/preferences | No | No | Yes | No | Yes | Low |
| removeCustomTag | `(category, tag) => void` | function closure | `CycleProvider` | N/A | tag screens | custom tag management | writes local state + localStorage effect | N/A | User settings/preferences | No | No | Yes | No | Yes | Low |
| isLogSheetOpen | boolean | false | `CycleProvider` | `setIsLogSheetOpen` | `LogEntryModal` / shell modal UI | app shell / modal flows | no direct persistence | N/A | Modal/UI state | No | Yes | No | No | No | Low |
| setIsLogSheetOpen | `(open: boolean) => void` | function closure | `CycleProvider` | N/A | modal callers | modal flows | no direct persistence | N/A | Modal/UI state | No | Yes | No | No | No | Low |

# 3. Complete Public API Inventory

The public `CycleContextType` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) exposes 28 value/function entries to consumers.

Count summary:

- 10 state values that are not simple wrappers around a setter
- 13 helper functions / mutators
- 5 persistence-backed state groups
- 1 computed value (`currentCycle`)
- 1 route state (`currentView`)
- 2 selected-item states (`selectedPost`, `selectedArticle`)
- 2 modal UI values (`isLogSheetOpen`)
- 1 appointment value (`appointment`)

The actual API shape is not a feature-specific module contract; it is a broad application facade. That is precisely why it became a god context.

# 4. Context Consumer Matrix

A repository-wide trace of `useCycle()` reveals a broad and mixed usage surface. The same provider is consulted by screens, hooks, UI modals, and compatibility code. The following table summarizes the real consumer pattern as observed from the source.

| Consumer | Properties read from `useCycle()` | Notes |
|---|---|---|
| [src/App.tsx](src/App.tsx) | `currentView`, `setCurrentView`, `selectedDate`, `setSelectedDate`, `settings`, `currentCycle` | Root app state owner; navigation gating and selected-date coordination live here. |
| [src/components/common/LogEntryModal.tsx](src/components/common/LogEntryModal.tsx) | `dayLogs`, `saveDayLog`, `customMoodTags`, `customSymptomTags`, `settings`, `setCurrentView` | Cross-cuts daily logging and feature navigation. |
| [src/components/common/CheckInModal.tsx](src/components/common/CheckInModal.tsx) | `selectedDate`, `settings` | Daily check-in modal; not a full feature repository. |
| [src/components/screens/AppointmentDetailScreen.tsx](src/components/screens/AppointmentDetailScreen.tsx) | `appointment`, `updateAppointment` | Care feature state disguised as global context state. |
| [src/components/screens/AppPreferencesScreen.tsx](src/components/screens/AppPreferencesScreen.tsx) | `settings`, `updateSettings` | Settings UI.
| [src/components/screens/BbtLogScreen.tsx](src/components/screens/BbtLogScreen.tsx) | `settings`, `updateSettings`, `dayLogs`, `saveDayLog`, `currentCycle` | Cycle + daily logging + preferences.
| [src/components/screens/BirthControlScreen.tsx](src/components/screens/BirthControlScreen.tsx) | `settings`, `updateSettings`, `dayLogs`, `saveDayLog` | Settings and log writing.
| [src/components/screens/CalendarScreen.tsx](src/components/screens/CalendarScreen.tsx) | `currentCycle`, `dayLogs`, `settings`, `selectedDate`, `setSelectedDate`, `setCurrentView` | Calendar is a direct consumer of both domain data and navigation state. |
| [src/components/screens/CommunityGatewayScreen.tsx](src/components/screens/CommunityGatewayScreen.tsx) | `posts`, `togglePostLike`, `togglePostBookmark`, `setSelectedPost` | Community UI.
| [src/components/screens/CommunityPostDetailScreen.tsx](src/components/screens/CommunityPostDetailScreen.tsx) | `selectedPost`, `togglePostLike`, `addComment`, `settings` | Community detail and interaction state. |
| [src/components/screens/ConnectedDevicesScreen.tsx](src/components/screens/ConnectedDevicesScreen.tsx) | `settings`, `saveDayLog` | Mixed profile + log state.
| [src/components/screens/CreatePostScreen.tsx](src/components/screens/CreatePostScreen.tsx) | `addPost` | Community write action.
| [src/components/screens/CustomTagsScreen.tsx](src/components/screens/CustomTagsScreen.tsx) | `customMoodTags`, `customSymptomTags`, `addCustomTag`, `removeCustomTag` | User-defined typing data.
| [src/components/screens/CycleSyncedFitnessScreen.tsx](src/components/screens/CycleSyncedFitnessScreen.tsx) | `currentCycle`, `settings` | wellness-related screen but still reading global domain state. |
| [src/components/screens/EmergencyHelpScreen.tsx](src/components/screens/EmergencyHelpScreen.tsx) | `settings`, `appointment` | care + profile state.
| [src/components/screens/ExportHealthReportScreen.tsx](src/components/screens/ExportHealthReportScreen.tsx) | `dayLogs`, `settings`, `currentCycle` | export uses domain/log data.
| [src/components/screens/FertilityDetailScreen.tsx](src/components/screens/FertilityDetailScreen.tsx) | `currentCycle` | cycle-derived data only.
| [src/components/screens/FocusEnergyTrackerScreen.tsx](src/components/screens/FocusEnergyTrackerScreen.tsx) | `currentCycle`, `dayLogs`, `saveDayLog` | daily log + cycle state.
| [src/components/screens/HarmonizedCalendarScreen.tsx](src/components/screens/HarmonizedCalendarScreen.tsx) | `currentCycle`, `dayLogs`, `settings` | same broad cycle-domain use.
| [src/components/screens/HarmonizedDashboardScreen.tsx](src/components/screens/HarmonizedDashboardScreen.tsx) | `currentCycle` | dashboard readiness state.
| [src/components/screens/HarmonizedForecastHomeScreen.tsx](src/components/screens/HarmonizedForecastHomeScreen.tsx) | `currentCycle`, `dayLogs`, `settings` | home/dashboard state.
| [src/components/screens/HarmonizedHomeScreen.tsx](src/components/screens/HarmonizedHomeScreen.tsx) | `currentCycle` | home/dashboard.
| [src/components/screens/HealthProfileScreen.tsx](src/components/screens/HealthProfileScreen.tsx) | `settings`, `updateSettings`, `dayLogs`, `saveDayLog` | profile + daily logs.
| [src/components/screens/HomeScreen.tsx](src/components/screens/HomeScreen.tsx) | `currentCycle`, `settings`, `dayLogs`, `saveDayLog`, `setSelectedDate` | home screen custom date and logs.
| [src/components/screens/HowAreYouFeelingScreen.tsx](src/components/screens/HowAreYouFeelingScreen.tsx) | `currentCycle`, `dayLogs`, `saveDayLog` | daily log intake.
| [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx) | `settings`, `updateSettings`, `setCurrentView` | onboarding + settings + navigation.
| [src/components/screens/InsightsScreen.tsx](src/components/screens/InsightsScreen.tsx) | `currentCycle`, `settings` | insight presentation.
| [src/components/screens/LoginGatewayScreen.tsx](src/components/screens/LoginGatewayScreen.tsx) | `updateSettings` | auth boundary reads settings in a mixed way.
| [src/components/screens/ModernizedEditProfileScreen.tsx](src/components/screens/ModernizedEditProfileScreen.tsx) | `settings`, `updateSettings` | profile edit.
| [src/components/screens/ModernizedNotFoundScreen.tsx](src/components/screens/ModernizedNotFoundScreen.tsx) | `dayLogs` | not-feature-specific domain dependency.
| [src/components/screens/ModernizedOfflineStateScreen.tsx](src/components/screens/ModernizedOfflineStateScreen.tsx) | `dayLogs` | not-feature-specific domain dependency.
| [src/components/screens/ModernizedPartnerSyncDetailsScreen.tsx](src/components/screens/ModernizedPartnerSyncDetailsScreen.tsx) | `settings` | settings only.
| [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx) | `settings`, `updateSettings` | profile UI.
| [src/components/screens/ModernizedSupportFaqScreen.tsx](src/components/screens/ModernizedSupportFaqScreen.tsx) | `settings` | settings only.
| [src/components/screens/ModernizedTrialPaywallScreen.tsx](src/components/screens/ModernizedTrialPaywallScreen.tsx) | `updateSettings` | entitlement / access UI touches settings.
| [src/components/screens/NotificationAlertsScreen.tsx](src/components/screens/NotificationAlertsScreen.tsx) | `settings` | settings UI.
| [src/components/screens/PartnerSyncScreen.tsx](src/components/screens/PartnerSyncScreen.tsx) | `settings`, `updateSettings` | sharing profile settings.
| [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx) | `settings`, `updateSettings` | access/security settings.
| [src/components/screens/PersonalizedInsightsScreen.tsx](src/components/screens/PersonalizedInsightsScreen.tsx) | N/A (no property read captured in current preflight, but this file is in the grep set) | likely screen import but not directly used in the current code excerpt.
| [src/components/screens/PhysicalComfortTrackerScreen.tsx](src/components/screens/PhysicalComfortTrackerScreen.tsx) | `currentCycle`, `dayLogs`, `saveDayLog` | daily log + cycle state.
| [src/components/screens/PremiumSubscriptionScreen.tsx](src/components/screens/PremiumSubscriptionScreen.tsx) | `settings`, `updateSettings` | subscription settings.
| [src/components/screens/PrivacyPolicyScreen.tsx](src/components/screens/PrivacyPolicyScreen.tsx) | `setCurrentView` | privacy screen with navigation callback.
| [src/components/screens/ProfileScreen.tsx](src/components/screens/ProfileScreen.tsx) | `settings`, `updateSettings` | profile screen.
| [src/components/screens/TermsOfServiceScreen.tsx](src/components/screens/TermsOfServiceScreen.tsx) | `setCurrentView` | legal screen with navigation callback.
| [src/hooks/useCycleCalendar.ts](src/hooks/useCycleCalendar.ts) | `dayLogs`, `currentCycle`, `selectedDate`, `setSelectedDate`, `setCurrentView` | calendar hook crosses domain + navigation logic.
| [src/hooks/useCyclePredictions.ts](src/hooks/useCyclePredictions.ts) | `settings`, `currentCycle` | prediction logic using user settings + derived cycle.
| [src/hooks/useDailyLog.ts](src/hooks/useDailyLog.ts) | `saveDayLog`, `dayLogs`, `settings` | domain hook around daily logs.
| [src/hooks/useDashboard.ts](src/hooks/useDashboard.ts) | `currentCycle`, `dayLogs`, `settings`, `selectedDate`, `setSelectedDate`, `setCurrentView` | dashboard loop points into cycle + navigation.
| [src/hooks/useHealthInsights.ts](src/hooks/useHealthInsights.ts) | `dayLogs`, `settings` | cycle insight query.
| [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts) | `settings`, `updateSettings` | settings hook.
| [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | `settings`, `updateSettings` | profile hook.

This matrix shows the real problem: `CycleContext` is not a domain slice, it is the application’s compatibility bus. The issue is cross-cutting and not just `currentView`.

# 5. Setter Graph

The most important setters are not isolated feature setters; they are application-wide commands with broad consumers.

| Setter | Function shape | Production callers | Write behavior | Persistence | Cross-cutting note |
|---|---|---|---|---|---|
| `setCurrentView` | `(view: AppView) => void` | `App.tsx`, screens, hooks | memory only | none | This is navigation state, but it is still owned by the broad app context. |
| `setSelectedDate` | `(date: string) => void` | calendar, dashboard, home, hooks | memory only | none | Date selection is not full screen state; it is part of calendar and log context. |
| `setSelectedPost` | `(post: CommunityPost | null) => void` | community screens | memory only | none | This is a detail-route state, and could become canonical route params later. |
| `setSelectedArticle` | `(article: ArticleItem | null) => void` | article/detail screens | memory only | none | Similar to `selectedPost` and likely better as route param or feature state. |
| `setIsLogSheetOpen` | `(open: boolean) => void` | shell/modal flows | memory only | none | clearly transient UI state |
| `updateSettings` | partial merge | many profile/settings screens | state merge | localStorage effect | global user settings bucket |
| `saveDayLog` | `(date, log) => void` | multiple log screens and hooks | merge by date | localStorage effect | daily log writes are a domain write but are still served by global context |
| `addPost` | create post | create-post screen | insert into posts array | localStorage effect | community write action |
| `togglePostLike` | like/unlike | community detail/gateway | update list/detail values | localStorage effect | community domain write |
| `togglePostBookmark` | bookmark toggle | community screens | update list | localStorage effect | community domain write |
| `addComment` | append comment | community detail | update list/detail | localStorage effect | community domain write |
| `updateAppointment` | partial merge | appointment screen | merge appointment object | no direct persistence | care-domain state |
| `addCustomTag` / `removeCustomTag` | add/remove tags | custom tags screen | update arrays | localStorage effect | user customization state |

This is the core reason the provider is “god context”: the setters are global commands disguised as state writes.

# 6. Persistence Responsibilities

The provider performs the following persistence work in [src/context/CycleContext.tsx](src/context/CycleContext.tsx):

## LocalStorage keys and ownership

| Key | Written by | Used for | Ownership |
|---|---|---|---|
| `cycle_tracker_user_settings` | settings effect | serialized `UserSettings` | settings/profile domain |
| `cycle_tracker_day_logs` | dayLogs effect | serialized `Record<string, DayLog>` | daily logging domain |
| `cycle_tracker_community_posts` | posts effect | serialized community posts | community domain |
| `cycle_tracker_custom_tags_moods` | customMoodTags effect | custom mood tags | preferences / tagging domain |
| `cycle_tracker_custom_tags_symptoms` | customSymptomTags effect | custom symptom tags | preferences / tagging domain |
| `luna_clean_slate_ready_v2` | one-time cleanup guard | reset stale mock data | bootstrap + cleanup |

The provider also clears stale demo user data on first run when a known sample account is discovered. This is a bootstrap-cleanup concern, not a feature state concern.

## Supabase hydration and read responsibilities

The hydration effect in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) does three remote reads when `userId` is present:

1. `daily_logs` table read, filtered by `clerk_user_id`
2. `profiles` table read, filtered by `clerk_user_id`
3. `cycleRepository.loadLatest()` call

The effect then writes the results back into the provider state and replaces the local in-memory day logs with server data.

This is a direct sign that the provider is not only UI state; it is also acting as a hydration orchestration layer. That is a major extraction boundary candidate.

## Persistence risk

Persistence is currently split across:

- localStorage for app state
- a direct hydration effect for user data
- `CycleRepository` integration for cycle data

This cross-cutting persistence model is exactly what should be moved out of the app-wide provider before the context split becomes unsafe.

# 7. Identity and Account Dependencies

The provider binds state to Clerk identity through `useAuth()` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx):

- `const { userId } = useAuth();`
- the hydration effect runs when `userId` changes
- `const cycleRepository = useMemo(() => userId ? new CycleRepository(supabase, userId) : null, [supabase, userId]);`

This means:

- the provider is user-scoped by active Clerk identity
- it rehydrates remote data on account change
- it writes aggregated settings and logs to localStorage without direct user key scoping
- it does not isolate one user’s state from another when the same browser/user profile is reused across accounts

This is a real risk area and one of the strongest reasons to keep the current preflight scoped and not to extract everything at once.

# 8. Domain Data Flow

## Cycle / baseline

Data flow:

- `settings.lastPeriodStartDate`, `cycleLengthDays`, `periodLengthDays`, `lutealPhaseDays` are consumed by `calculateCycleInfo()`
- the result is exposed as `currentCycle`
- the cycle is then used by home screen, calendar, insights, and daily-log screens

Source: [src/context/CycleContext.tsx](src/context/CycleContext.tsx) and [src/App.tsx](src/App.tsx)

## Daily logs

Data flow:

- `saveDayLog` updates `dayLogs` in memory
- the effect persists to `localStorage`
- the hydration effect replaces `dayLogs` on authenticated user fetch
- screens call `saveDayLog` and read `dayLogs`

## Settings

Data flow:

- `settings` is initialized from localStorage
- `updateSettings` merges partial updates
- persisted to localStorage immediately through an effect
- remote profile hydration merges into `settings` on user login

## Community

Data flow:

- `posts` starts from `initialPosts` or localStorage
- `addPost`, like, bookmark, and comment functions mutate `posts`
- `selectedPost` is a pointer into the community domain
- no remote community source is configured in the provider

## Tags

Data flow:

- mood/symptom arrays are localStorage-backed
- the tag UI modifies them via helper functions
- the log modal reads them for daily logging

## Appointment

Data flow:

- `appointment` is a single object
- `updateAppointment` mutates it
- screens read it directly
- there is no remote persistence or appointment repository in the provider

## Navigation

Data flow:

- `currentView` is stored in context and used by root app gating
- `setCurrentView` is called from screens and App logic
- the canonical navigation layer in Part 4A.2 has already introduced a typed seam above this

# 9. Cross-Domain Coupling

| Coupling | Evidence | Severity | Why it matters |
|---|---|---|---|
| auth → settings hydration | `useAuth` + `hydrateUserData` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | High | settings are user-fetched from Supabase into context state |
| settings → cycle calculation | `calculateCycleInfo(settings.lastPeriodStartDate, ...)` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | High | a profile setting directly drives a derived cycle model |
| daily logs → selectedDate / calendar | `selectedDate` and `dayLogs` together in [src/hooks/useCycleCalendar.ts](src/hooks/useCycleCalendar.ts) and [src/App.tsx](src/App.tsx) | High | date selection is used both as UI state and domain query context |
| nav → app gating | `currentView` and `effectiveView` logic in [src/App.tsx](src/App.tsx) | Critical | navigation is still part of global app policy |
| profile → navigation reset | onboarding baseline logic in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) and [src/App.tsx](src/App.tsx) | High | onboarding status influences default app route |
| community → selected post detail | `selectedPost` + `posts` + `addComment` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | Medium | a detail view is represented as global state |
| content → article selection | `selectedArticle` + initial article list in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | Medium | content navigation is mixed with app state |
| modal UI → daily log | `isLogSheetOpen` + `saveDayLog` + `selectedDate` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | Medium | modal state is global, though it is UI-only |

This is not a pure “one feature” context. It is a carefully mixed app state container.

# 10. Derived State Analysis

The provider exposes both true state and computed state.

| Value | Type | True state or derived? | Notes |
|---|---|---|---|
| `settings` | persisted state | true state | directly supplied by localStorage and remote hydration |
| `dayLogs` | persisted state | true state | stored and restored |
| `posts` | persisted state | true state | stored and restored |
| `customMoodTags` | persisted state | true state | stored and restored |
| `customSymptomTags` | persisted state | true state | stored and restored |
| `currentCycle` | derived | derived | computed from settings and current date |
| `selectedDate` | UI state | true state | not persisted |
| `currentView` | app state | true state | route state in a legacy compatibility model |
| `selectedPost` | UI/route state | derived pointer | pointer into `posts` |
| `selectedArticle` | UI/route state | derived pointer | pointer into `articles` |
| `appointment` | user state | true state | local object, no persistence |
| `videos` / `articles` | static fixtures | static data | not loaded from remote data |
| `isLogSheetOpen` | UI state | true state | transient modal state |

This means the provider is mixing storage, router-like state, and UI state without a clear boundary. That is the core reason extraction must be staged.

# 11. Five Feature-Slice Dependencies

The five approved feature slices remain conceptually separated from the broad app context:

| Feature | Current dependency on `CycleContext` | Evidence | Safe extraction boundary |
|---|---|---|---|
| `wellness.sleep` | no direct `CycleContext` dependency at the feature layer | feature hooks and repos are separate under `src/features/sleep` | feature hook + repository boundary |
| `wellness.hydration` | no direct `CycleContext` dependency at the feature layer | feature hooks and repos are separate under `src/features/hydration` | feature hook + repository boundary |
| `wellness.bodyMetrics` | no direct `CycleContext` dependency at the feature layer | feature hooks and repos under `src/features/bodyMetrics` | feature hook + repository boundary |
| `wellness.physicalActivity` | no direct `CycleContext` dependency at the feature layer | feature hooks and repos under `src/features/physicalActivity` | feature hook + repository boundary |
| `wellness.medication` | no direct `CycleContext` dependency at the feature layer | feature hooks and repos under `src/features/medication` | feature hook + repository boundary |

The current issue is not that these five features are still inside the god context; the issue is that the app shell and legacy screens still pull a broad set of app state from the provider. That makes the provider a compatibility facade around feature-owned logic rather than a feature-owned store.

# 12. Legacy Compatibility Dependencies

The provider is doing explicit legacy compatibility work for screens and old navigation patterns.

| Legacy compatibility value | Classification | Why |
|---|---|---|
| `currentView` | Temporary compatibility + navigation state | still used by root `App.tsx` and legacy screen switching |
| `selectedDate` | Mostly compatibility state | used by calendar and log flows, but could become a real calendar/date parameter later |
| `selectedPost` | compatibility route state | detail selection is effectively a route parameter |
| `selectedArticle` | compatibility route state | selection is a content detail pointer |
| `appointment` | care feature state, partly legacy | acts like a detail state but is not yet repo-backed |
| `videos` / `articles` | static content data | not a major state-management issue |
| `isLogSheetOpen` | UI state | definitely not feature/domain state |

The important conclusion is that not every field should be treated as “real domain state”. Some are outdated app-shell compatibility values, and some are feature-detail pointers that should later be represented as route parameters or screen-owned state.

# 13. Context Size and Complexity Metrics

Measured from the provider shape and persistence logic in [src/context/CycleContext.tsx](src/context/CycleContext.tsx):

- Public API values/functions: 28
- Setter functions: 13
- LocalStorage persistence groups: 5 primary writes + 1 migration/cleanup gate
- Supabase hydration fetch groups: 3
- Distinct domains present in the provider: 8+ major domains
  - navigation
  - cycle domain
  - daily logging
  - settings/preferences
  - community
  - discovery/content
  - appointments/care
  - modal/UI state
  - tag management
- Derived state values: 1 (`currentCycle`)
- Raw local state not clearly domain-owned: 5+ (`selectedDate`, `selectedPost`, `selectedArticle`, `appointment`, `isLogSheetOpen`)

This is a broad compatibility surface by any reasonable measure.

# 14. Proposed Extraction Modules

The most defensible extraction structure is a small number of bounded modules, not a giant rewrite.

| Proposed module | Responsibility | Current fields/functions | Persistence responsibility | Migration difficulty |
|---|---|---|---|---|
| Navigation compatibility | hold legacy route state and adapter boundary | `currentView`, `setCurrentView` | none | Low |
| Profile/settings | settings + notification/profile preferences | `settings`, `updateSettings` | localStorage + profile hydration | Medium |
| Cycle and daily logs | cycle calculations, daily logs, selected date | `currentCycle`, `selectedDate`, `dayLogs`, `saveDayLog` | localStorage + `daily_logs` hydration | High |
| Community and content detail | posts, likes, bookmarks, comments, selected post/article | `posts`, `selectedPost`, `selectedArticle`, comment and post helpers | localStorage | Medium |
| App UI modal state | log-sheet and transient UI controls | `isLogSheetOpen`, `setIsLogSheetOpen` | none | Low |
| Care/appointment state | appointment detail and care metadata | `appointment`, `updateAppointment` | none currently | Medium |

The point is not to create a generic mega-store; it is to split the provider by real ownership and persistence behavior.

# 15. Navigation Extraction Seam

The current navigation seam is already clear and bounded:

```text
Screen
  -> useCycle().setCurrentView(...)
  -> CycleContext.currentView
  -> App.tsx
```

Part 4A.2 introduced the canonical navigation layer in front of this seam, which yields a better future shape:

```text
Screen
  -> canonical navigation
  -> navigation adapter
  -> temporary legacy bridge
  -> CycleContext.currentView
  -> App.tsx
```

This is the key safe boundary because:

- `currentView` is one of the clearest global concerns
- `App.tsx` already performs auth/entitlement gating against `currentView`
- navigation is the only domain already explicitly separated by the canonical adapter
- navigation is the least coupled to an underlying feature repository

No extraction should happen until that seam has tests and remains stable. The current code supports the claim that navigation is the first safe extraction boundary.

# 16. Future State Ownership

| State group | Current owner | Future owner | Why |
|---|---|---|---|
| Navigation | `CycleContext` + root app | navigation layer / adapter | route and access policy do not belong to profile or log state |
| Session/access | Clerk + app auth boundary | auth/access boundary | user identity and access policy are not feature data |
| Settings/preferences | `CycleContext` | profile repository / settings module | clear user-specific domain |
| Cycle and daily logs | `CycleContext` | cycle repository + daily-log feature modules | repo-owned domain logic already exists in the feature architecture |
| Community/posts | `CycleContext` | community feature module | stand-alone community domain |
| Appointment/care | `CycleContext` | care feature module | app-level view state but real care-domain state |
| Modal/UI state | `CycleContext` | local component / app shell state | transient UI, no persistence |
| Feature-owned state | feature hooks/repos | same feature repos | already the intended architecture |

This is the conceptual target that matches the architecture docs.

# 17. Provider Dependency Graph

The provider itself depends on:

- `useAuth` from Clerk
- `useSupabase` from the app-level Supabase hook
- `CycleRepository`
- browser `localStorage`
- pure utility functions such as `calculateCycleInfo()`, `formatDateToISO()`, and `addDays()`

The key point is that `CycleProvider` does not import the feature-owned repositories directly. That lowers the risk of circular dependency when extracting feature state, but it also shows why a generic replacement store is not necessary: the provider is a state aggregator, not a fundamental domain layer.

The main circular-risk scenario would be a future extraction that causes a feature module to import the old context while the context imports that feature module back. This is not present in the current codebase, and it is not a reason to block a narrow navigation-first extraction.

# 18. Existing Test Coverage

The repository already has meaningful tests in the navigation and feature-registry space, but not a provider-level lifecycle test suite for `CycleContext` extraction.

| Test file | What it verifies | What it does not verify |
|---|---|---|
| [src/navigation/navLogic.test.ts](src/navigation/navLogic.test.ts) | auth gate, sign-in semantics, entitlement gating, developer-only view isolation | does not test provider state ownership or migration boundary |
| [src/registry/featureRegistry.test.ts](src/registry/featureRegistry.test.ts) | canonical feature IDs and route integrity | does not cover provider state extraction |
| feature slice tests under [src/features](src/features) | feature behavior, mapping, repository, account-switch safety | does not test app-provider ownership or global context lifecycle |

This is important: the project has characterization tests for navigation gates and feature slices, but not for the actual `CycleContext` provider contract. That means the extraction seam is understood in architecture terms, but not yet protected by a provider-level test suite.

# 19. Risk Register

| Risk | Severity | Evidence | Why it matters |
|---|---|---|---|
| navigation regression | High | [src/App.tsx](src/App.tsx), [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | `currentView` is directly used by app gating and screen switching |
| account-switch regression | High | hydration effect keyed to `userId` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | stale or mixed user data is possible during identity changes |
| localStorage regression | High | multiple localStorage writes/reads in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | settings and logs are persisted in a shared app bucket |
| Supabase hydration regression | High | hydration effect in provider | server data replaces local state without a structured state machine |
| state reset regression | Medium | first-run cleanup + default state initialization in provider | reset logic can remove previously valid user state |
| feature-slice regression | Medium | broad app context is still used by screens of many domains | extraction could inadvertently break screens that still depend on mixed state |
| authentication regression | High | app effective-view logic in [src/App.tsx](src/App.tsx) and Clerk usage | navigation/auth boundary is sensitive and must remain stable |
| entitlement regression | High | effective-view logic in [src/App.tsx](src/App.tsx) | route decisions depend on access policy |
| onboarding regression | High | default route bootstrapping and onboarding logic in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | route startup depends on context defaults |
| community regression | Medium | posts and selectedPost domain in provider | detail and write flows can be disrupted by extraction |
| appointment regression | Medium | appointment state in provider | care features are not yet repository-backed |
| developer-tooling regression | Low | developer-only screens remain isolated from production route logic | no direct production risk |
| test regression | High | no provider-level extraction tests exist | the current suite does not protect the large extraction seam |

This is not a reason to block the concept of extraction, but it is a reason to keep the first extraction small and navigation-first.

# 20. Smallest Safe Part 4B Boundary

The safest first extraction is not “move the whole provider” but “isolate navigation compatibility and leave all domain state temporarily in place.”

Recommended sequence:

1. Extract the navigation-only boundary first.
   - `currentView`
   - `setCurrentView`
   - the root app-gate interface that reads `currentView`
   - the canonical navigation adapter continues to translate to the legacy boundary

2. Keep the rest of the provider in place temporarily.
   - settings
   - day logs
   - posts
   - tags
   - appointment
   - modal state

3. Add provider-level tests before larger extraction.
   - route transition tests
   - account-switch state tests
   - localStorage persistence tests
   - default state / onboarding tests

4. Only after navigation is stable, move feature domains by ownership.
   - settings/profile
   - cycle/day logs
   - community
   - care domain
   - UI modal state

This is the smallest safe Part 4B boundary and aligns with the target architecture without pretending the app is already fully state-factored.

# 21. Deferred Work

The following remain deliberately deferred and are not part of this preflight:

- React Router migration
- browser history or route stack implementation
- deep links and URL handling
- Capacitor navigation bridge
- LocalStore replacement
- SyncEngine implementation
- IndexedDB rewrite
- Supabase schema changes
- RLS changes
- passcode redesign
- premium purchase integration
- Explore
- Guided Discovery
- journey system
- Classic/Harmonized/Modernized consolidation
- feature registry expansion
- UI redesign

These are all later phases and should not be bundled into Part 4B extraction.

# 22. Validation Evidence

This preflight was intentionally read-only and did not modify application source.

No source validation was run as part of this audit action itself. The repository was not changed to satisfy any test or build gate. The earlier project-level validation for this workspace did include the following single-pass run:

- `npm test ; npm run lint ; npm run build`
- Result: passed in the earlier Part 4A.2 validation cycle
- Evidence: 58 test files passed; TypeScript `tsc --noEmit` passed; Vite production build succeeded

That validation is relevant to the app state as it existed at the time of approval, but it is not a new validation of the preflight document itself and it does not authorize source changes in this phase.

# 23. Final Verdict

PREFLIGHT APPROVED

The dependency graph supports a bounded Part 4B extraction, but only with a narrow and explicit boundary. The current provider is broad, but the strongest safe seam is navigation compatibility first; feature domains are already conceptually separated in the architecture, and the app’s canonical adapter has already started reducing the god-context problem without rewriting the rest of the app. The preflight shows a safe path and does not justify the full extraction of all context state or a replacement state library at this stage.
