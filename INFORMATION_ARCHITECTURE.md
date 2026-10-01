# HerCadence Information Architecture

**Status:** Part 2 design-only specification; based on [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md). Preserve current features and visual design. This proposal introduces no new product capability.

## Principles

- Keep Home, Calendar, Insights, and Profile as the four primary destinations.
- Make every intentional production feature discoverable without requiring its internal `AppView` name.
- Give each feature one canonical destination; Classic/Harmonized/Modernized is not part of the user-facing information hierarchy.
- Organize discovery by user goal and existing feature function, not by implementation history.
- Keep journeys optional and interruptible. Categories, guides, and recommendations do not gate access.
- Keep screen directory/code-browser tools out of production discovery.

## Primary navigation

| Primary destination | Canonical purpose | Existing primary implementation |
|---|---|---|
| Home | Today, cycle overview, daily check-in entry points, and existing home recommendations | `HarmonizedForecastHomeScreen` |
| Calendar | Date-oriented cycle and log history | `HarmonizedCalendarScreen` |
| Insights | Patterns and existing cycle/wellness insights | `ModernizedInsightsScreen` |
| Profile | User profile, settings, privacy, subscription/account access | `ModernizedProfileScreen` |

These are provisional canonical choices because they are the audit’s current main-tab implementations, not a judgment that alternatives are feature-equivalent. Alternatives remain available to development/test and during parity review.

## Explore hierarchy

Explore is a nested user-facing destination, reachable from existing discovery/search entry points and feature cross-links. Do not add a fifth primary tab in this phase of the design.

```text
Explore HerCadence
├─ Cycle & Fertility
│  ├─ Daily check-in and symptom logging
│  ├─ Calendar and cycle tracking
│  ├─ BBT and cervical mucus
│  ├─ Fertility details
│  ├─ Birth control
│  └─ Pregnancy mode
├─ Wellness
│  ├─ Sleep
│  ├─ Hydration
│  ├─ Physical activity
│  ├─ Body metrics
│  ├─ Focus and energy
│  ├─ Physical comfort
│  ├─ Medication history/tracking
│  ├─ Supplements
│  ├─ Cycle nutrition and nutrition education
│  └─ Wellness reminder permissions
├─ Understand
│  ├─ Cycle and personalized insights
│  ├─ Sleep insights
│  ├─ Discovery video library
│  └─ Luteal nutrition article
├─ Care & Records
│  ├─ Doctors/care team and appointments
│  ├─ Emergency help
│  ├─ Health profile
│  ├─ Connected devices
│  └─ Health report export
├─ Community & Connections
│  ├─ Community feed, post details, create post
│  ├─ Partner sync
│  └─ Partner sync details
└─ Account & Help
   ├─ Profile, edit profile, preferences, custom tags
   ├─ Notifications and notification preferences
   ├─ Privacy/security and passcode
   ├─ Support FAQ
   ├─ Subscription, trial/paywall, billing
   ├─ What's new and app review
   └─ Legal, clinical disclaimer, delete account
```

Search, feature cards, recent activity, journeys, notification actions, and contextual recommendations must all target the same canonical feature ID. Search results must not expose developer-only screens.

## Canonical destination catalogue

| Canonical destination | Existing `AppView` values / current screen intent | Category |
|---|---|---|
| `home` | `HOME`, `CLASSIC_HOME`, `HARMONIZED_HOME`, `HARMONIZED_DASHBOARD` | Primary |
| `calendar` | `CALENDAR`, `HARMONIZED_CALENDAR` | Primary |
| `insights` | `INSIGHTS`, `CLASSIC_INSIGHTS`, `HARMONIZED_INSIGHTS` | Primary |
| `profile` | `PROFILE`, `CLASSIC_PROFILE` | Primary |
| `cycle.daily-check-in` | `FEELING_TODAY` | Cycle & Fertility |
| `cycle.symptom-history` | `SYMPTOM_HISTORY` | Cycle & Fertility |
| `cycle.symptom-log` | `SYMPTOM_INTENSITY_LOG` | Cycle & Fertility |
| `cycle.bbt` | `BBT_LOG` | Cycle & Fertility |
| `cycle.mucus` | `MUCUS_LOG` | Cycle & Fertility |
| `cycle.birth-control` | `BIRTH_CONTROL` | Cycle & Fertility |
| `cycle.pregnancy-mode` | `PREGNANCY_MODE` | Cycle & Fertility |
| `fertility.details` | `FERTILITY_DETAIL` | Cycle & Fertility |
| `wellness.sleep` | `SLEEP_INSIGHTS` | Wellness |
| `wellness.hydration` | `HYDRATION_TRACKER` | Wellness |
| `wellness.activity` | `PHYSICAL_ACTIVITY` | Wellness |
| `wellness.body-metrics` | `BODY_METRICS` | Wellness |
| `wellness.focus-energy` | `FOCUS_ENERGY_TRACKER` | Wellness |
| `wellness.physical-comfort` | `PHYSICAL_COMFORT_TRACKER` | Wellness |
| `wellness.medication` | `MEDICATION_TRACKER` | Wellness |
| `wellness.medication-history` | `MEDICATION_HISTORY` | Wellness |
| `wellness.supplements` | `SUPPLEMENT_TRACKER` | Wellness |
| `wellness.nutrition` | `NUTRITION_CYCLE` | Wellness / Understand |
| `wellness.reminder-permissions` | `WELLNESS_REMINDERS_PERMISSION` | Wellness |
| `wellness.cycle-fitness` | `CYCLE_AI_ASSISTANT`, `CYCLE_SYNCED_FITNESS` | Wellness; alias requires product clarification |
| `insights.personalized` | `PERSONALIZED_INSIGHTS` | Understand |
| `learn.video-library` | `VIDEO_LIBRARY` | Understand |
| `learn.luteal-article` | `LUTEAL_ARTICLE` | Understand |
| `care.team` | `DOCTORS_CARE_TEAM` | Care & Records |
| `care.appointment` | `APPOINTMENT_DETAIL` | Care & Records |
| `care.emergency` | `EMERGENCY_HELP` | Care & Records |
| `care.health-profile` | `HEALTH_PROFILE` | Care & Records |
| `care.connected-devices` | `CONNECTED_DEVICES` | Care & Records |
| `care.export` | `EXPORT_HEALTH_REPORT` | Care & Records |
| `care.export-success` | `EXPORT_SUCCESS` | Care & Records |
| `community.feed` | `COMMUNITY` | Community & Connections |
| `community.create-post` | `CREATE_POST` | Community & Connections |
| `community.post` | `POST_DETAIL` | Community & Connections |
| `connections.partner` | `PARTNER_SYNC` | Community & Connections |
| `connections.partner-details` | `PARTNER_SYNC_DETAILS` | Community & Connections |
| `profile.edit` | `EDIT_PROFILE` | Account & Help |
| `profile.preferences` | `APP_PREFERENCES` | Account & Help |
| `profile.custom-tags` | `CUSTOM_TAGS` | Account & Help |
| `profile.notification-preferences` | `NOTIFICATIONS` | Account & Help |
| `profile.notification-inbox` | `NOTIFICATION_INBOX` | Account & Help |
| `profile.privacy-security` | `DATA_PRIVACY_SECURITY` | Account & Help |
| `profile.passcode` | `PASSCODE_LOCK` | Account & Help / auth boundary |
| `help.support` | `SUPPORT_FAQ` | Account & Help |
| `subscription.premium` | `PREMIUM` | Account & Help |
| `subscription.paywall` | `TRIAL_PAYWALL` | Account & Help |
| `subscription.billing` | `MANAGE_BILLING` | Account & Help |
| `subscription.receipts` | `MANAGE_BILLING` currently uses billing route; `ModernizedBillingReceiptsScreen` is a screen file | **REQUIRES PRODUCT DECISION:** determine whether receipt history is a distinct destination or part of billing |
| `account.delete` | `DELETE_ACCOUNT` | Account & Help |
| `account.review` | `APP_REVIEW` | Account & Help |
| `account.whats-new` | `WHATS_NEW` | Account & Help |
| `legal.terms` | `TERMS_OF_SERVICE` | Account & Help |
| `legal.privacy` | `PRIVACY_POLICY` | Account & Help |
| `legal.clinical-disclaimer` | `TERMS_CLINICAL_DISCLAIMER` | Account & Help |
| `auth.login` | `LOGIN_GATEWAY` | Root auth |
| `auth.forgot-password` | `FORGOT_PASSWORD` | Root auth |
| `onboarding.baseline` | `INITIAL_BASELINE_SETUP` | Root onboarding |
| `onboarding.welcome` | `ONBOARDING_WELCOME` | Root onboarding |
| `onboarding.understood` | `ONBOARDING_UNDERSTOOD` | Root onboarding |
| `onboarding.track-ease` | `ONBOARDING_TRACK_EASE` | Root onboarding |
| `onboarding.success` | `ONBOARDING_SUCCESS` | Root onboarding |
| `system.search` | `SEARCH_HUB` | System |
| `system.offline-status` | `OFFLINE_SYNC` | System |
| `system.not-found` | `NOT_FOUND_404` and unmatched-route fallback | System |
| `dev.kotlin-viewer` | `KOTLIN_ANDROID_CODE` | Development-only |
| `dev.screen-directory` | `ScreenDirectoryModal` (not an `AppView` union value) | Development-only |

Names for canonical IDs are design identifiers, not code added in Part 2. A route can carry validated parameters (for example selected post/article/date) without creating a second feature destination.

## Screen consolidation matrix

The primary choices below follow current main-tab rendering where the audit establishes it. “Canonical candidate” is provisional until functional parity and product intent are verified. Rows marked **REQUIRES PRODUCT DECISION** must not be deleted or renamed based on code similarity alone.

| Product destination | Current implementations | Primary implementation candidate | Differences/status | Migration action |
|---|---|---|---|---|
| Home/dashboard | `HomeScreen`; `HarmonizedHomeScreen`; `HarmonizedDashboardScreen`; `HarmonizedForecastHomeScreen` | `HarmonizedForecastHomeScreen` (current `HOME`) | Classic Home includes cycle recommendations and inline symptom-save behavior; Harmonized variants are alternate layouts; Dashboard uses mockup-derived hydration state. Exact data/interaction parity is not established. | Route all home entries to one ID; characterize every action/data path and fixture; retain all variants until parity/product review. |
| Calendar | `CalendarScreen`; `HarmonizedCalendarScreen` | `HarmonizedCalendarScreen` (current `CALENDAR`) | Both have screen-local calendar/phase logic; harmonized component is also used for `HARMONIZED_CALENDAR`. Equality of date selection, predictions, and logging needs tests. | Unify route aliases first; compare date/log behavior and preserve selected-date state before retiring Classic Calendar. |
| Insights | `InsightsScreen`; `HarmonizedInsightsScreen`; `ModernizedInsightsScreen`; `PersonalizedInsightsScreen` (related, distinct destination) | `ModernizedInsightsScreen` (current `INSIGHTS`) | Harmonized and Modernized both use `useHealthInsights`, but display and feature scope may differ. Personalized Insights is a separate intent, not presumed a duplicate. | Compare output, errors, data semantics, and links. Keep `PersonalizedInsightsScreen` as a separate feature unless product explicitly merges it. |
| Profile | `ProfileScreen`; `ModernizedProfileScreen`; `ModernizedEditProfileScreen` (separate edit flow) | `ModernizedProfileScreen` (current `PROFILE`) | Profile variants may differ in account/settings coverage. Edit Profile has distinct write intent and must not be dropped as a visual variant. | Inventory actions and profile fields; preserve edit route; consolidate main profile only after settings and auth parity. |
| Cycle fitness / assistant | `CycleSyncedFitnessScreen` reached by `CYCLE_AI_ASSISTANT` and `CYCLE_SYNCED_FITNESS` | `CycleSyncedFitnessScreen` as one current renderer | Route values are aliases in the root switch, but labels/intent are unclear. | **REQUIRES PRODUCT DECISION:** confirm whether these names are true aliases or whether one capability is missing. Do not discard an intent. |
| Billing and receipts | `ModernizedBillingReceiptsScreen`; `MANAGE_BILLING` route and subscription screens | `MANAGE_BILLING` remains current billing route; receipts candidate unresolved | The audit does not establish whether receipts are a separate route or an unreferenced screen. | **REQUIRES PRODUCT DECISION:** determine whether receipts belong inside billing or are an independent user destination; verify production references first. |
| Sleep | `ModernizedSleepInsightsScreen`; `useSleep` data hook | `ModernizedSleepInsightsScreen` | No parallel screen implementation identified. Existing screen name and hook semantics include the `duration_hours`/`hours_slept` mismatch. | Treat as one canonical Sleep destination; migrate only after schema compatibility and test gate. |
| Hydration | `ModernizedHydrationTrackerScreen`; `useHydration` | `ModernizedHydrationTrackerScreen` | One screen; mockup-derived defaults exist in other dashboard code and must not be interpreted as persisted user hydration. | Keep one destination; separate fixture/default state from production data. |
| Activity and body metrics | `ModernizedPhysicalActivityScreen`; `ModernizedBodyMetricsScreen`; shared `useBodyMetrics` hook | One destination per feature; each current Modernized screen | Distinct domains/actions despite shared hook; hook is transport/API reuse, not evidence of one screen. | Keep separate feature IDs and repositories/contracts; verify units and writes independently. |
| Symptom and cycle logs | `HowAreYouFeelingScreen`; `ModernizedSymptomHistoryScreen`; `ModernizedSymptomIntensityLogScreen`; `ModernizedMucusLogScreen`; `BbtLogScreen`; `CalendarScreen`/Harmonized calendar entry points | One canonical destination per user task in Cycle & Fertility | Related data but different interaction histories; not presumed duplicates. | Make feature links converge on relevant canonical log/history IDs; preserve data model and calendar context. |
| Medication | `ModernizedMedicationTrackerScreen`; `ModernizedMedicationHistoryScreen` | Separate tracker and history destinations | Different task/route relationship; history returns to tracker. | Keep as two linked canonical destinations unless product approves an integrated screen. |
| Community | `CommunityGatewayScreen`; `CommunityPostDetailScreen`; `CreatePostScreen` | Feed, post, and create destinations | Distinct list/detail/create flows. | Preserve route params and drafts; one feature module with distinct canonical child destinations. |
| Care and export | `DoctorsCareTeamScreen`; `AppointmentDetailScreen`; `EmergencyHelpScreen`; `HealthProfileScreen`; `ExportHealthReportScreen`; `ExportSuccessScreen`; `ConnectedDevicesScreen` | Distinct care/records destinations under one category | Related but not duplicates; Export Success is a flow result. Nearby care has a mock fallback that is unsafe as success-shaped production data. | Keep separate feature IDs; remove mock fallback only in an approved implementation phase, replacing it with explicit error/empty UI. |
| Education | `DiscoveryVideoLibraryScreen`; `LutealNutritionArticleScreen`; `ModernizedNutritionCategoryScreen` | Distinct library/article/nutrition destinations | Different content/function; article selection may be route state. | Keep distinct IDs or validated article params; never clone the feature for alternate entry sources. |
| Auth/onboarding | `EmpowerWelcomeScreen`; `YourCycleUnderstoodScreen`; `TrackWithEaseScreen`; `OnboardingSuccessScreen`; `InitialBaselineSetupScreen`; `LoginGatewayScreen`; Modernized recovery/permission screens | Existing auth/onboarding route cases | Multi-step onboarding and baseline setup serve different states; do not merge solely by appearance. | Preserve exact flow and pending onboarding data; test return/resume and allowlist before any consolidation. |
| Account/legal/support | Classic/Modernized Profile and settings/legal/privacy/security/delete/support/subscription screens | Current root switch implementation per destination | Separate access/legal/account tasks; only main profile variants are known alternatives. | Keep canonical destination per policy; review every route and explicit Back behavior; no route removed without product/access review. |
| Notification/system | `ModernizedNotificationInboxScreen`; `ModernizedOfflineStateScreen`; `ModernizedNotFoundScreen`; notification preferences and other system states | One destination per distinct system task | Inbox includes sample reset content; Not Found has explicit route and fallback; settings differ from inbox. | Separate production data from fixtures; converge duplicate not-found mechanics; do not combine inbox and preferences. |
| Developer tools | `ScreenDirectoryModal`; `KotlinAndroidCodeViewerScreen` | None in production | Developer/test catalog and embedded Kotlin code, not user-facing product features. | Isolate from production registry and route resolution, and verify production build reachability is absent. |

Every other one-off screen listed by its `AppView` in the canonical destination catalogue remains a distinct candidate destination until its actual user intent and production reachability have been characterized. “No duplicate identified” is not proof that a route is production-facing.

## Feature relationships and optional journeys

These journeys connect existing features and do not invent product functionality:

| Journey | Existing feature sequence | Why it can help |
|---|---|---|
| Understand Your Cycle | Calendar → daily check-in/symptoms → BBT and mucus → Fertility details → Insights | Combines cycle dates and user-logged observations with existing cycle insights. |
| Build Your Wellness Picture | Sleep → Hydration → Activity → Body Metrics → Insights | Introduces existing wellness trackers and the existing insights area. It does not imply clinical causality. |
| Prepare for Care | Health Profile → symptom/cycle history → Export Health Report → Care Team / Appointment | Connects existing records and care features; does not provide medical advice or guarantee provider availability. |
| Learn and Connect | Video Library / Luteal Article → Community → Partner Sync | Connects existing education, community, and partner functionality. Each destination remains independently available. |

Journeys are suggestions, not prerequisites. The user can start, pause, resume, skip, or leave them at any time.

## Discoverability and visibility rules

- Home retains its existing featured actions and daily overview; links use feature IDs.
- Explore groups all intentional end-user destinations by category and includes optional journey cards.
- Search indexes only registry entries marked discoverable; screen/component names and developer tools are excluded.
- Recently visited items are a convenience list, not a progress gate. Store only the minimum state required.
- New/unseen indicators are based on registry release metadata or first successful visit; do not infer health status.
- Recommendations require an explicit reason and a valid destination. Rules are deterministic and can yield no recommendation.
- Hidden/disabled entries must explain a real access state (for example premium required) without leaking protected data.
- Only features that the existing access policy considers unentitled are marked premium. Preserve the present allowlist during migration; changing product entitlements is a separate product/security review.
- Development-only entries are omitted from production registry exports and production navigation bundles/entry points.

### Registry metadata and policy boundaries

Each feature-registry entry owns its canonical ID/route, user-facing title and summary, Explore category, discoverability, authentication/entitlement policy, optional guide reference plus `guidePolicy: 'offer' | 'auto-start' | 'disabled'`, and related journey/recommendation IDs. A feature without a guide has no guide policy/prompt. The default for a guided feature is `offer`; `auto-start` is an explicit feature-level choice.

Recommendation evaluation returns at most one primary item at a time. Impression caps/windows and dismissal/ignored cooldown durations are supplied by versioned, product-approved configuration, not hard-coded in screens. Meaningful use of the suggested destination suppresses the same recommendation until a new explicit rule/progress version. If frequency values are not approved, recommendation display remains disabled. See [GUIDED_DISCOVERY_ARCHITECTURE.md](./GUIDED_DISCOVERY_ARCHITECTURE.md).

## Variants and decisions

The four primary implementations above are provisional because they are currently used by main tabs. Other unresolved product decisions include:

- Whether `CYCLE_AI_ASSISTANT` is genuinely the same product destination as `CYCLE_SYNCED_FITNESS`.
- Whether `ModernizedBillingReceiptsScreen` is its own feature or part of billing.
- Whether `NOTIFICATIONS` preference settings and `NOTIFICATION_INBOX` should share a profile category but remain separate destinations (recommended).
- Which one-off routes are intentionally production-facing versus only present in the screen directory.

Do not remove a route or screen until its production intent, entry points, behavior, and parity have been confirmed.
