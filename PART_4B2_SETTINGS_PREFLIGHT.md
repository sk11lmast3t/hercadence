## 1. Executive Summary

This preflight confirms that the next extraction seam after navigation is not a single undifferentiated “settings store,” but a bounded subset of user-specific profile/preference state that is currently mixed into the broader compatibility provider in [src/context/CycleContext.tsx](src/context/CycleContext.tsx). The evidence shows a real settings domain, but it is entangled with cycle configuration, onboarding state, entitlement display state, passcode/security state, and remote profile hydration.

The authoritative `UserSettings` contract is defined in [src/types.ts](src/types.ts). It includes profile identity, unit preferences, lifecycle baseline data, notification settings, birth control, partner sync, security controls, and premium state. It is read and written through the broad `CycleContext` API, with additional persistence and sync hooks in [src/hooks/useProfile.ts](src/hooks/useProfile.ts), [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts), and the hydration path in [src/context/CycleContext.tsx](src/context/CycleContext.tsx).

The most important finding is that the settings object is not monolithic, and it is not safe to extract as one mega-module. Several fields are actual profile or preference data, while others are cycle-domain state or authorization-like state. For example:

- `cycleLengthDays`, `periodLengthDays`, `lutealPhaseDays`, and `lastPeriodStartDate` are consumed by cycle calculations and are tightly coupled to onboarding in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) and [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx).
- `isPasscodeEnabled` and `passcode` are access/security state and are written by [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx) and enforced in [src/App.tsx](src/App.tsx).
- `isPremium` is not the source of truth for entitlement; the server-side entitlement hook in [src/hooks/usePremiumEntitlement.ts](src/hooks/usePremiumEntitlement.ts) is the authoritative gate, while the route policy in [src/App.tsx](src/App.tsx) uses the server state from `usePremiumEntitlement()`.
- `settings` is persisted at several layers: localStorage in [src/context/CycleContext.tsx](src/context/CycleContext.tsx), remote profile hydration in the same file, plus direct profile and notification writes in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) and [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts).

The safe conclusion is that a future settings extraction must be bounded to actual user-specific profile/preference data, while cycle config, access state, and entitlement state remain explicitly outside the first extraction boundary. The current evidence supports a future settings module only after the dependency graph is split more carefully and after access and entitlement concerns are kept separate from the settings data model.

## 2. UserSettings Field Inventory

Authoritative type: [src/types.ts](src/types.ts)

| Field | Type | Default value | Read consumers | Write consumers | localStorage usage | Supabase usage | Domain | User-specific | Security-sensitive | Entitlement-sensitive | Onboarding-sensitive | Cycle-sensitive | Future owner | Migration difficulty |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `userName` | `string` | `''` | [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx), [src/components/screens/HomeScreen.tsx](src/components/screens/HomeScreen.tsx), [src/components/screens/EmergencyHelpScreen.tsx](src/components/screens/EmergencyHelpScreen.tsx) | [src/hooks/useProfile.ts](src/hooks/useProfile.ts), [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx), [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx) | yes, via `cycle_tracker_user_settings` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | `profiles.user_name` in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) and [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | A. Profile | yes | no | no | no | Profile/settings module | Low |
| `email` | `string` | `''` | [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx), [src/components/screens/ModernizedSupportFaqScreen.tsx](src/components/screens/ModernizedSupportFaqScreen.tsx) | [src/hooks/useProfile.ts](src/hooks/useProfile.ts), [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx) | yes | `profiles.email` in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | A. Profile | yes | no | no | no | no | Profile/settings module | Low |
| `avatarUrl` | `string` | `''` | [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx), [src/components/screens/HomeScreen.tsx](src/components/screens/HomeScreen.tsx) | [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx), [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | yes | local profile sync in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) only indirectly | A. Profile | yes | no | no | no | Profile/settings module | Low |
| `cycleLengthDays` | `number` | `28` | [src/components/screens/CalendarScreen.tsx](src/components/screens/CalendarScreen.tsx), [src/components/screens/HarmonizedCalendarScreen.tsx](src/components/screens/HarmonizedCalendarScreen.tsx), [src/hooks/useCyclePredictions.ts](src/hooks/useCyclePredictions.ts), [src/components/screens/InsightsScreen.tsx](src/components/screens/InsightsScreen.tsx) | [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx), [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | yes | `profiles.cycle_length_days` in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | C. Cycle configuration | yes | no | no | yes | Cycle domain module | Medium |
| `periodLengthDays` | `number` | `5` | [src/components/screens/CalendarScreen.tsx](src/components/screens/CalendarScreen.tsx), [src/components/screens/HarmonizedCalendarScreen.tsx](src/components/screens/HarmonizedCalendarScreen.tsx), [src/hooks/useCyclePredictions.ts](src/hooks/useCyclePredictions.ts) | [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx), [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | yes | `profiles.period_length_days` in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | C. Cycle configuration | yes | no | no | yes | Cycle domain module | Medium |
| `lutealPhaseDays` | `number` | `14` | [src/hooks/useCyclePredictions.ts](src/hooks/useCyclePredictions.ts), [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | [src/hooks/useProfile.ts](src/hooks/useProfile.ts), [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx) | yes | `profiles.luteal_phase_days` in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | C. Cycle configuration | yes | no | no | yes | Cycle domain module | Medium |
| `lastPeriodStartDate` | `string` | default computed in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | [src/hooks/useCyclePredictions.ts](src/hooks/useCyclePredictions.ts), [src/components/screens/CalendarScreen.tsx](src/components/screens/CalendarScreen.tsx), [src/components/screens/HarmonizedCalendarScreen.tsx](src/components/screens/HarmonizedCalendarScreen.tsx) | [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx) | yes | remote cycle data via `CycleRepository` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | C. Cycle configuration | yes | no | yes | yes | Cycle domain module | High |
| `temperatureUnit` | `'Celsius' | 'Fahrenheit'` | `'Celsius'` | [src/components/common/LogEntryModal.tsx](src/components/common/LogEntryModal.tsx), [src/components/screens/AppPreferencesScreen.tsx](src/components/screens/AppPreferencesScreen.tsx), [src/components/screens/BbtLogScreen.tsx](src/components/screens/BbtLogScreen.tsx) | [src/components/screens/AppPreferencesScreen.tsx](src/components/screens/AppPreferencesScreen.tsx), [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | yes | `profiles.temperature_unit` in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | B. Preferences | yes | no | no | no | Profile/settings module | Low |
| `weightUnit` | `'kg' | 'lb'` | `'kg'` | [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx), [src/components/screens/HealthProfileScreen.tsx](src/components/screens/HealthProfileScreen.tsx) | [src/components/screens/AppPreferencesScreen.tsx](src/components/screens/AppPreferencesScreen.tsx), [src/hooks/useProfile.ts](src/hooks/useProfile.ts), [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx) | yes | `profiles.weight_unit` in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | B. Preferences | yes | no | yes | no | Profile/settings module | Low |
| `startDayOfWeek` | `'Sunday' | 'Monday'` | `'Sunday'` | [src/components/screens/CalendarScreen.tsx](src/components/screens/CalendarScreen.tsx) | no direct write found in the inspected sources; global settings default from context | yes | no direct mapping found in inspected profile path | B. Preferences | yes | no | no | no | Profile/settings module | Low |
| `showWeekNumbers` | `boolean` | `true` | likely UI settings, but no main direct usage found in the inspected paths | no direct write found in inspected sources | yes | no direct mapping found | B. Preferences | yes | no | no | no | Profile/settings module | Low |
| `language` | `string` | `'English (US)'` | likely UI display, not heavily used in inspected flows | no direct write found | yes | no direct mapping found | B. Preferences | yes | no | no | no | Profile/settings module | Low |
| `region` | `string` | `'United States'` | likely UI display, not heavily used in inspected flows | no direct write found | yes | no direct mapping found | B. Preferences | yes | no | no | no | Profile/settings module | Low |
| `isPasscodeEnabled` | `boolean` | `false` | [src/App.tsx](src/App.tsx), [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx) | [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx) | yes | no direct `profiles` mapping found | F. Access / security | yes | yes | no | no | Deferred security boundary | High |
| `passcode` | `string` | `''` | [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx), [src/App.tsx](src/App.tsx) | [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx) | yes | no direct remote mapping found | F. Access / security | yes | yes | no | no | Deferred security boundary | High |
| `isPremium` | `boolean` | `false` | [src/components/screens/ConnectedDevicesScreen.tsx](src/components/screens/ConnectedDevicesScreen.tsx), [src/components/screens/CycleSyncedFitnessScreen.tsx](src/components/screens/CycleSyncedFitnessScreen.tsx), [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx), [src/components/screens/PremiumSubscriptionScreen.tsx](src/components/screens/PremiumSubscriptionScreen.tsx) | [src/components/screens/ModernizedTrialPaywallScreen.tsx](src/components/screens/ModernizedTrialPaywallScreen.tsx) | yes, local cache | not in `profiles` contract inspected here | G. Entitlement | yes | no | yes | no | Authorization / entitlement boundary | High |
| `selectedGoal` | `'PERIOD' | 'OVULATION' | 'PREGNANCY' | 'WELLNESS'` | `'PERIOD'` | read in some profile / wellness UI, but not deeply inspected | no direct write found in inspected code | B. Preferences | yes | no | no | no | Profile/settings module | Low |
| `hasCompletedBaseline` | `boolean` | `false` | [src/context/CycleContext.tsx](src/context/CycleContext.tsx), [src/App.tsx](src/App.tsx), [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx) | [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx), [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | yes | `profiles.has_completed_baseline` is not shown in the inspected path | E. Onboarding / baseline | yes | no | yes | no | Onboarding boundary | Medium |
| `baselineHealth` | `UserBaselineHealth` | object with default health values | [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx), [src/components/screens/HealthProfileScreen.tsx](src/components/screens/HealthProfileScreen.tsx), [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx) | [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx) | yes | no explicit remote mapping shown in inspected path | E. Onboarding / baseline | yes | no | yes | no | Onboarding boundary | Medium |
| `notifications` | nested object | defined in `initialSettings` | [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts), [src/components/screens/NotificationAlertsScreen.tsx](src/components/screens/NotificationAlertsScreen.tsx) | [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts), [src/components/screens/BirthControlScreen.tsx](src/components/screens/BirthControlScreen.tsx) | yes | `notification_preferences` table in [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts) | D. Notification settings | yes | no | no | no | Notification settings module | Medium |
| `birthControl` | nested object | defined in `initialSettings` | [src/components/screens/BirthControlScreen.tsx](src/components/screens/BirthControlScreen.tsx), [src/components/screens/HomeScreen.tsx](src/components/screens/HomeScreen.tsx) | [src/components/screens/BirthControlScreen.tsx](src/components/screens/BirthControlScreen.tsx) | yes | no direct mapping found in the inspected profile path | B. Preferences or C. Cycle configuration (primary: B) | yes | no | no | no | Profile/settings module | Medium |
| `partnerSync` | nested object | defined in `initialSettings` | [src/components/screens/PartnerSyncScreen.tsx](src/components/screens/PartnerSyncScreen.tsx), [src/components/screens/ModernizedPartnerSyncDetailsScreen.tsx](src/components/screens/ModernizedPartnerSyncDetailsScreen.tsx) | [src/components/screens/PartnerSyncScreen.tsx](src/components/screens/PartnerSyncScreen.tsx) | yes | no direct mapping found in inspected path | B. Preferences | yes | no | no | no | Profile/settings module | Medium |

Nested items below are part of the above grouped values and must be tracked at field level for the preflight.

### `baselineHealth` nested fields

| Field | Type | Default value | Primary ownership |
|---|---|---|---|
| `weight` | `number` | `58` | E. Onboarding / baseline |
| `weightUnit` | `'kg' | 'lb'` | `'kg'` | E. Onboarding / baseline |
| `heightCm` | `number` | `165` | E. Onboarding / baseline |
| `heightFeet` | `number` | `5` | E. Onboarding / baseline |
| `heightInches` | `number` | `5` | E. Onboarding / baseline |
| `heightUnit` | `'cm' | 'ft_in'` | `'cm'` | E. Onboarding / baseline |
| `age` | `number` | `26` | E. Onboarding / baseline |
| `birthDate` | `string` | not set | A. Profile |
| `cycleRegularity` | `'Regular' | 'Somewhat Regular' | 'Irregular' | 'Not Sure'` | `'Regular'` | E. Onboarding / baseline |
| `averageCycleLength` | `number` | not set | C. Cycle configuration |
| `averagePeriodLength` | `number` | not set | C. Cycle configuration |
| `primaryGoals` | `string[]` | `['Cycle Tracking', 'Hormonal Balance', 'Wellness & Energy']` | E. Onboarding / baseline |
| `typicalSymptoms` | `string[]` | `['Cramps', 'Fatigue', 'Bloating']` | E. Onboarding / baseline |
| `sleepHoursBaseline` | `number` | `7.5` | E. Onboarding / baseline |
| `activityLevel` | `'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active'` | `'Moderately Active'` | E. Onboarding / baseline |
| `birthControlMethod` | `string` | `'Natural / None'` | E. Onboarding / baseline |
| `completedAt` | `string` | not set | E. Onboarding / baseline |

### `notifications` nested fields

| Field | Type | Default value | Primary ownership |
|---|---|---|---|
| `periodReminders` | `boolean` | `true` | D. Notification settings |
| `fertileWindowAlerts` | `boolean` | `true` | D. Notification settings |
| `pillReminders` | `boolean` | `false` | D. Notification settings |
| `dailyLogPrompt` | `boolean` | `true` | D. Notification settings |
| `periodReminderDaysBefore` | `number` | `2` | D. Notification settings |
| `pillReminderTime` | `string` | `'08:00 AM'` | D. Notification settings |

### `birthControl` nested fields

| Field | Type | Default value | Primary ownership |
|---|---|---|---|
| `type` | `'Pill' | 'IUD' | 'Implant' | 'Ring' | 'Patch' | 'Natural'` | `'Natural'` | B. Preferences |
| `brandName` | `string` | `''` | B. Preferences |
| `packTotalPills` | `number` | `28` | B. Preferences |
| `currentPillIndex` | `number` | `0` | B. Preferences |
| `reminderTime` | `string` | `'09:00 AM'` | D. Notification settings |
| `lastTakenTimestamp` | `string` | optional | B. Preferences |
| `streakDays` | `number` | `0` | B. Preferences |

### `partnerSync` nested fields

| Field | Type | Default value | Primary ownership |
|---|---|---|---|
| `isEnabled` | `boolean` | `false` | B. Preferences |
| `partnerCode` | `string` | `''` | B. Preferences |
| `connectedPartnerName` | `string` | `''` | B. Preferences |
| `sharePhase` | `boolean` | `true` | B. Preferences |
| `shareSymptoms` | `boolean` | `true` | B. Preferences |
| `shareMoods` | `boolean` | `true` | B. Preferences |
| `shareNotes` | `boolean` | `false` | B. Preferences |

## 3. Settings Ownership Classification

The fields fall into distinct ownership buckets, but not all are pure settings.

| Primary category | Fields |
|---|---|
| A. Profile | `userName`, `email`, `avatarUrl`, `birthDate` |
| B. Preferences | `temperatureUnit`, `weightUnit`, `startDayOfWeek`, `showWeekNumbers`, `language`, `region`, `selectedGoal`, `birthControl.*`, `partnerSync.*` |
| C. Cycle configuration | `cycleLengthDays`, `periodLengthDays`, `lutealPhaseDays`, `lastPeriodStartDate`, `averageCycleLength`, `averagePeriodLength` |
| D. Notification settings | `notifications.*`, `pillReminderTime`, `reminderTime` where used for reminder scheduling |
| E. Onboarding / baseline | `hasCompletedBaseline`, `baselineHealth.*` |
| F. Access / security | `isPasscodeEnabled`, `passcode` |
| G. Entitlement | `isPremium` |
| H. Discovery/content preference | no strong evidence of a dedicated field beyond generic UI preference values |
| I. Deprecated / dead | no strong evidence of a fully dead field in the inspected source |
| J. Other | none required beyond utility display or fallback values |

A few fields have multiple responsibilities, but the primary ownership is still explicit above. For example, `hasCompletedBaseline` and `baselineHealth` are both onboarding state and user profile state, but they are also part of the app’s startup route logic and therefore should not be treated as a generic preference bucket in a first extraction.

## 4. Security-Sensitive Fields

The passcode state is explicitly security-sensitive and must remain outside any generic settings extraction:

- `isPasscodeEnabled` and `passcode` are defined in [src/types.ts](src/types.ts).
- They are set by [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx).
- They are read in [src/App.tsx](src/App.tsx) to gate the passcode lock screen and in [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx) for verification.
- The app writes them as part of the general `settings` object via `updateSettings(...)` in the same screen.
- `settings` is serialized to localStorage via the `cycle_tracker_user_settings` effect in [src/context/CycleContext.tsx](src/context/CycleContext.tsx).

This means the current passcode state is persisted as a normal settings payload, and the app is using the same settings structure as ordinary profile data. This is a known higher-risk area, and it should be marked clearly as:

DEFERRED SECURITY BOUNDARY

This phase must not normalize or redesign it. The preflight should treat it as a known later concern rather than part of the first bounded settings extraction.

## 5. Entitlement-Sensitive Fields

`isPremium` is the clearest entitlement-sensitive setting, but it should not be confused with the actual authorization truth.

The evidence is:

- `isPremium` exists in [src/types.ts](src/types.ts).
- It is read in profile and feature screens including [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx), [src/components/screens/ConnectedDevicesScreen.tsx](src/components/screens/ConnectedDevicesScreen.tsx), and [src/components/screens/CycleSyncedFitnessScreen.tsx](src/components/screens/CycleSyncedFitnessScreen.tsx).
- It is also written in [src/components/screens/ModernizedTrialPaywallScreen.tsx](src/components/screens/ModernizedTrialPaywallScreen.tsx).
- The actual entitlement source of truth is server-side in [src/hooks/usePremiumEntitlement.ts](src/hooks/usePremiumEntitlement.ts), which calls the backend edge function `get-entitlement` and returns `isPremium` from server data.
- The route policy in [src/App.tsx](src/App.tsx) uses `usePremiumEntitlement()` and not the local `settings.isPremium` value as the basis for gating.
- The test intent at [src/navigation/navLogic.test.ts](src/navigation/navLogic.test.ts) explicitly documents that server entitlement is authoritative.

Conclusion: `settings.isPremium` is a local UI/cache state and should be treated as a display or compatibility flag, not as the app’s source-of-truth authorization mechanism.

## 6. Onboarding and Baseline Fields

The onboarding/baseline state is the highest-risk mixed domain inside `UserSettings`.

The most important fields are:

- `hasCompletedBaseline`
- `lastPeriodStartDate`
- `cycleLengthDays`
- `periodLengthDays`
- `lutealPhaseDays`
- `baselineHealth`

Evidence:

- The default route is initialized based on `settings.hasCompletedBaseline` in [src/context/CycleContext.tsx](src/context/CycleContext.tsx).
- The app uses `currentView` and user onboarding state in [src/App.tsx](src/App.tsx).
- The baseline form writes multiple settings values in [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx).
- A localStorage payload named `pendingOnboardingData` is created there and later used during auth completion in [src/App.tsx](src/App.tsx).

This shows that onboarding/baseline values are not ordinary preferences. They are part of the app lifecycle and route startup flow. They must stay distinct from a generic profile/settings module until a more explicit onboarding boundary is designed.

## 7. Profile and Preference Fields

The strongest settings subset for a first extraction is the true user profile and user preference slice:

- `userName`
- `email`
- `avatarUrl`
- `temperatureUnit`
- `weightUnit`
- `startDayOfWeek`
- `showWeekNumbers`
- `language`
- `region`
- `selectedGoal`
- `notifications.*`
- `birthControl.*`
- `partnerSync.*`

This is the set most clearly aligned with a profile/preferences domain. It is already represented by dedicated hooks in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) and [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts).

The key point is that these fields are user-specific and relatively simple. They are also the best candidate for a future extracted module because they do not directly own the route lifecycle or cycle calculations.

## 8. Read/Write Matrix

| Setting field | Read consumers | Write consumers | Domain | Persistence | Security risk | Authorization risk |
|---|---|---|---|---|---|---|
| `userName` | profile screens, home screen | `useProfile`, profile screens | Profile | localStorage + Supabase | Low | Low |
| `email` | profile screens | `useProfile` | Profile | localStorage + Supabase | Low | Low |
| `avatarUrl` | profile/home screens | profile screens | Profile | localStorage + Supabase (limited) | Low | Low |
| `cycleLengthDays` | calendar, predictions, insights | baseline, profile hook | Cycle configuration | localStorage + Supabase | Low | Low |
| `periodLengthDays` | calendar, predictions | baseline, profile hook | Cycle configuration | localStorage + Supabase | Low | Low |
| `lutealPhaseDays` | predictions | baseline, profile hook | Cycle configuration | localStorage + Supabase | Low | Low |
| `lastPeriodStartDate` | cycle screens | baseline | Cycle configuration | localStorage + remote cycle loader | Low | Low |
| `temperatureUnit` | BBT, preferences | app preferences, profile hook | Preferences | localStorage + Supabase | Low | Low |
| `weightUnit` | health profile, baseline | app preferences, profile hook | Preferences | localStorage + Supabase | Low | Low |
| `startDayOfWeek` | calendar | not strongly evidenced | Preferences | localStorage | Low | Low |
| `showWeekNumbers` | UI settings | not strongly evidenced | Preferences | localStorage | Low | Low |
| `language` | UI settings | not strongly evidenced | Preferences | localStorage | Low | Low |
| `region` | UI settings | not strongly evidenced | Preferences | localStorage | Low | Low |
| `isPasscodeEnabled` | app lock screen | passcode screen | Access/security | localStorage | High | Medium |
| `passcode` | passcode validation | passcode screen | Access/security | localStorage | Critical | Medium |
| `isPremium` | premium display UI | trial paywall UI | Entitlement | localStorage + server sync | Low | High |
| `selectedGoal` | likely profile/wellness UI | not strongly evidenced | Preferences | localStorage | Low | Low |
| `hasCompletedBaseline` | route startup | baseline screen | Onboarding | localStorage | Low | Low |
| `baselineHealth` | baseline, profile | baseline screen | Onboarding | localStorage | Low | Low |
| `notifications` | notification settings screens | notification hook | Notification settings | localStorage + notification table | Low | Low |
| `birthControl` | home, birth control screen | birth control screen | Preferences | localStorage | Low | Low |
| `partnerSync` | partner sync screens | partner sync screen | Preferences | localStorage | Low | Low |

## 9. updateSettings Usage Graph

The production usage of `updateSettings(...)` is broad and mixed. This is the shape that makes the context a compatibility facade rather than a domain store.

Examples:

- [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx) writes a large set of onboarding fields in one call.
- [src/components/screens/AppPreferencesScreen.tsx](src/components/screens/AppPreferencesScreen.tsx) writes unit preferences and invokes `saveProfile(...)` in a separate hook.
- [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx) updates `avatarUrl`, `userName`, and `email` while calling `saveProfile(...)`.
- [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx) writes both `isPasscodeEnabled` and `passcode`.
- [src/components/screens/PartnerSyncScreen.tsx](src/components/screens/PartnerSyncScreen.tsx) updates nested `partnerSync` values.
- [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts) merges nested `notifications` updates and then upserts into the `notification_preferences` table.
- [src/hooks/useProfile.ts](src/hooks/useProfile.ts) writes profile fields into the `profiles` table.

The broad calls matter because they show that `updateSettings` is acting as a general-purpose merge API rather than a field-specific setter. That is not a safe boundary for a first extraction without a stricter field-level contract.

## 10. Persistence Graph

The persistence graph is currently split across localStorage and Supabase.

- Initial localStorage read: [src/context/CycleContext.tsx](src/context/CycleContext.tsx)
- Settings persistence effect: [src/context/CycleContext.tsx](src/context/CycleContext.tsx)
- Daily log persistence effect: [src/context/CycleContext.tsx](src/context/CycleContext.tsx)
- Community and tag persistence effects: [src/context/CycleContext.tsx](src/context/CycleContext.tsx)
- `cycle_tracker_user_settings` key: used for serialized `UserSettings`
- `hydrateUserData()` in the provider: reads `daily_logs`, `profiles`, and then calls `cycleRepository.loadLatest()`
- `useProfile()` writes to `profiles` via `supabase.from('profiles').upsert(...)`
- `useNotificationPreferences()` writes to `notification_preferences`

The current merge behavior is important:

- settings are loaded from localStorage before user hydration
- remote profile hydration merges into settings in [src/context/CycleContext.tsx](src/context/CycleContext.tsx)
- `updateSettings` is a partial merge, not a replacement of the whole object
- it is therefore easy for local data, remote profile data, and onboarding state to drift together in one object

This is exactly why a settings extraction should start by separating data domains instead of moving all of `UserSettings` into a single module at once.

## 11. Supabase Profile Contract

The profile mapping is partially explicit in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) and partially indirect in [src/context/CycleContext.tsx](src/context/CycleContext.tsx).

| UI field | UserSettings field | Database field | Read path | Write path |
|---|---|---|---|---|
| user name | `userName` | `user_name` | `profiles` select in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | `profiles` upsert in [src/hooks/useProfile.ts](src/hooks/useProfile.ts) |
| email | `email` | `email` | same | same |
| cycle length | `cycleLengthDays` | `cycle_length_days` | same | same |
| period length | `periodLengthDays` | `period_length_days` | same | same |
| luteal phase days | `lutealPhaseDays` | `luteal_phase_days` | same | same |
| temperature unit | `temperatureUnit` | `temperature_unit` | same | same |
| weight unit | `weightUnit` | `weight_unit` | same | same |

The inspected code does not show a complete remote contract for the full settings object. In practice, the provider is merging several local settings values with the `profiles` table, while the notification state is handled by a separate `notification_preferences` table and the cycle state is handled through `CycleRepository` rather than the same settings payload.

That is evidence of a real domain split even though the object still lives in one `UserSettings` type.

## 12. Cycle-Domain Leakage

The clearest leakage is into cycle configuration:

- `calculateCycleInfo(...)` is called in [src/context/CycleContext.tsx](src/context/CycleContext.tsx) using `settings.lastPeriodStartDate`, `settings.cycleLengthDays`, `settings.periodLengthDays`, and `settings.lutealPhaseDays`.
- The derived `currentCycle` value is then read across calendar, insights, and home screens.
- The same fields are used by [src/hooks/useCyclePredictions.ts](src/hooks/useCyclePredictions.ts).
- These are not just profile preferences; they are domain inputs for cycle prediction logic.

This means a naive settings extraction is likely to pull cycle state into a “preferences” module and create a mixed domain store. The current evidence is strong that cycle configuration belongs separately from identity/profile preferences.

## 13. Feature-Slice Dependencies

The five approved wellness feature slices are already separated conceptually, and they are not the immediate problem. The evidence from the repo points to their features being independent under [src/features](src/features), while the legacy app shell still reaches across a broad provider.

| Feature slice | Dependency on `settings` through `CycleContext` |
|---|---|
| `wellness.sleep` | Not shown as direct `CycleContext` coupling in the inspected sources |
| `wellness.hydration` | Not shown as direct `CycleContext` coupling in the inspected sources |
| `wellness.bodyMetrics` | Not shown as direct `CycleContext` coupling in the inspected sources |
| `wellness.physicalActivity` | Not shown as direct `CycleContext` coupling in the inspected sources |
| `wellness.medication` | Not shown as direct `CycleContext` coupling in the inspected sources |

This supports a bounded settings extraction only after the app shell and global compatibility layer are handled; it does not imply a broad global settings extraction should happen first.

## 14. Authentication Dependencies

The app route gating in [src/App.tsx](src/App.tsx) depends on both authentication and route state, and onboarding defaults are influenced by `settings.hasCompletedBaseline`.

This means settings are involved in:

- startup authentication flow
- onboarding completion status
- sign-in recovery flow
- route selection after account completion

The route gate itself is not a settings concern, but the fact that `settings` still participates in startup route logic makes a naive extraction hazardous. The route boundary should stay separate from profile settings until the lifecycle is explicitly modeled.

## 15. Entitlement Dependencies

Entitlement logic is split across:

- `settings.isPremium` for display/local state
- `usePremiumEntitlement()` in [src/hooks/usePremiumEntitlement.ts](src/hooks/usePremiumEntitlement.ts) for server truth
- route gating in [src/App.tsx](src/App.tsx)

The evidence is clear that local settings are not the same as authorization state. The user settings object includes premium UI state, but the gate decision is derived from the server-side entitlement check. This must remain outside any settings extraction if the architecture is to avoid mixing display state with authorization truth.

## 16. Account-Switch Behavior

The account-switch risk is visible in [src/context/CycleContext.tsx](src/context/CycleContext.tsx):

- the provider reads `const { userId } = useAuth();`
- the hydration effect runs when `userId` changes
- the provider replaces local daily logs from the server response
- it merges profile values back into local settings state
- localStorage is written globally without user-namespace scoping

This is a concrete risk pattern: when a user signs out or switches accounts, the provider may carry forward a shared local settings bag. This is a known later-phase concern but it is not a reason to block a bounded settings extraction as long as the first extraction excludes auth-by-identity and access state.

## 17. Existing Test Coverage

The repo has meaningful tests in route logic and feature registry, but not a full provider-level extraction suite for settings.

Relevant tests:

- [src/navigation/navLogic.test.ts](src/navigation/navLogic.test.ts) verifies entitlement and sign-in route logic.
- [src/navigation/canonicalNavigation.test.ts](src/navigation/canonicalNavigation.test.ts) verifies canonical route mapping.
- [src/registry/featureRegistry.test.ts](src/registry/featureRegistry.test.ts) validates the feature registry.

Gaps:

- no provider-level test that protects the settings merge contract
- no explicit test that distinguishes profile settings from cycle configuration
- no test that proves `settings.isPremium` is not authoritative
- no test protecting passcode state in a secure boundary

This means the architecture is understood, but the actual extraction boundary is not yet protected by a dedicated settings contract test suite.

## 18. Proposed Ownership Modules

The smallest safe future boundary is not one giant settings store. The evidence suggests a modular split based on domain semantics and persistence:

| Module | Fields | Current consumers | Persistence | Remote source | Security implications | Dependency risks | Migration difficulty |
|---|---|---|---|---|---|---|---|
| Profile identity | `userName`, `email`, `avatarUrl` | profile screens | localStorage + `profiles` | Supabase `profiles` table | low | low | low |
| User preferences | `temperatureUnit`, `weightUnit`, `selectedGoal`, `startDayOfWeek`, `showWeekNumbers`, `language`, `region`, `birthControl.*`, `partnerSync.*` | preferences screens | localStorage + partial supabase writes | partial `profiles` + some dedicated tables | low | low | medium |
| Notification preferences | `notifications.*` | notification screens | localStorage + `notification_preferences` table | Supabase notification table | low | low | medium |
| Cycle configuration | `cycleLengthDays`, `periodLengthDays`, `lutealPhaseDays`, `lastPeriodStartDate`, `averageCycleLength`, `averagePeriodLength` | cycle screens, predictions, calendar | localStorage + cycle repository | `CycleRepository` / legacy hydration | low | high if mixed with profile | high |
| Baseline / onboarding | `hasCompletedBaseline`, `baselineHealth.*` | onboarding, startup route | localStorage + pending onboarding payload | partially local only | low | medium | medium |
| Security state | `isPasscodeEnabled`, `passcode` | app lock gate | localStorage | no secure remote mapping found | critical | high | high |
| Entitlement state | `isPremium` | premium UI | localStorage + server sync | server entitlement API | low | medium | medium |

## 19. Fields Remaining in CycleContext

The following should remain in `CycleContext` until a later extraction boundary is approved:

- `currentCycle` and all cycle calculation logic, because its input shape is mixed with onboarding and cycle configuration in [src/context/CycleContext.tsx](src/context/CycleContext.tsx)
- `dayLogs`, `saveDayLog`, and related daily logging state
- `selectedDate`, `setSelectedDate`
- `currentView`, `setCurrentView` (already partially extracted in Part 4B.1)
- `posts`, `selectedPost`, and related community feature state
- `appointment`, `updateAppointment`
- `customMoodTags`, `customSymptomTags`, `addCustomTag`, `removeCustomTag`
- `isLogSheetOpen`, `setIsLogSheetOpen`
- `hasCompletedBaseline` and baseline data unless a dedicated onboarding module is created
- `isPasscodeEnabled` and `passcode` remain explicitly deferred
- `isPremium` remains centralized in entitlement logic and should not be treated as a generic settings field in the first extraction

These remain because moving them now would destabilize the app shell, access flow, or cycle logic without a stronger repository boundary.

## 20. Dead / Duplicated Settings

The codebase clearly contains some duplicated or legacy-like settings data:

- `isPremium` is present in the settings object but the app’s real source of truth is server entitlement in [src/hooks/usePremiumEntitlement.ts](src/hooks/usePremiumEntitlement.ts).
- `isPasscodeEnabled` and `passcode` are in the same settings object as ordinary preferences even though they are security state.
- `hasCompletedBaseline` is used as route startup state, yet it sits in a profile-like settings object.
- Some fields appear as display-only preferences but are not materially used beyond UI toggles (for example `showWeekNumbers`, `language`, `region`, and `selectedGoal`).
- `useProfile()` and `useNotificationPreferences()` are both already wrappers over the same underlying `settings` object, which means there are multiple overlapping abstraction layers over one broad state bucket.

These are not dead fields in the sense of unused, but they are not yet cleanly separated by ownership or storage semantics.

## 21. Future Settings Architecture

A future architecture should separate the data model by true ownership instead of by one mixed object:

- Profile/identity: user name, email, avatar
- User preferences: units, calendar preferences, app language and region
- Notification preferences: reminder and alert state
- Cycle configuration: cycle length, period length, luteal phase, period start date
- Baseline/onboarding: baseline survey answers and completion state
- Security state: passcode/lock state, protected behind a dedicated security boundary
- Entitlement: server-backed premium state only, outside the settings data model

This is compatible with the pattern noted in the architecture documents:

Screen -> Feature Hook -> Feature Repository -> Local Store <-> Sync <-> Supabase

The important distinction is that profile and notification preferences are not the same as cycle configuration, onboarding state, or access logic. The future architecture should not flatten all of those into a single “settings” module.

## 22. Smallest Safe Implementation Boundary

The smallest safe implementation boundary is not a full settings extraction. It is a clearly bounded subset of profile and preference data only after the boundary is proven.

Recommended next step:

1. Extract a `ProfileSettings` subset for identity/preferences fields only.
2. Keep cycle configuration, onboarding data, passcode state, and entitlement state in `CycleContext` or a dedicated auxiliary module until later.
3. Preserve the compatibility API through `updateSettings(...)` while reducing the object shape at the new boundary.
4. Require provider-level tests before extracting any more mixed fields.
5. Keep all existing screens and hooks working with the compatibility adapter.

The likely first extraction candidates are:

- `userName`
- `email`
- `avatarUrl`
- `temperatureUnit`
- `weightUnit`
- `selectedGoal`
- `notifications.*`
- `birthControl.*`
- `partnerSync.*`

But only if a clear compatibility layer is introduced and those fields are proven to be independent from cycle logic and route startup logic.

Files that should remain untouched in the next extraction stage:

- [src/context/CycleContext.tsx](src/context/CycleContext.tsx)
- [src/App.tsx](src/App.tsx)
- [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx)
- [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx)
- [src/hooks/usePremiumEntitlement.ts](src/hooks/usePremiumEntitlement.ts)
- [src/navigation/navLogic.ts](src/navigation/navLogic.ts)

## 23. Risk Register

| Risk | Severity | Evidence | Why it matters |
|---|---|---|---|
| settings regression | Medium | [src/context/CycleContext.tsx](src/context/CycleContext.tsx) and several screens | a broad object is used across many screens |
| profile regression | Medium | [src/hooks/useProfile.ts](src/hooks/useProfile.ts), [src/components/screens/ModernizedProfileScreen.tsx](src/components/screens/ModernizedProfileScreen.tsx) | profile writes are shared with localStorage and remote sync |
| cycle calculation regression | High | [src/context/CycleContext.tsx](src/context/CycleContext.tsx), [src/hooks/useCyclePredictions.ts](src/hooks/useCyclePredictions.ts) | cycle settings are on the same object as profile state |
| onboarding regression | High | [src/components/screens/InitialBaselineSetupScreen.tsx](src/components/screens/InitialBaselineSetupScreen.tsx), [src/App.tsx](src/App.tsx) | default app route is tied to onboarding state |
| auth regression | High | [src/App.tsx](src/App.tsx), [src/components/screens/LoginGatewayScreen.tsx](src/components/screens/LoginGatewayScreen.tsx) | route gating and auth flow are coupled to app state |
| entitlement regression | High | [src/hooks/usePremiumEntitlement.ts](src/hooks/usePremiumEntitlement.ts), [src/App.tsx](src/App.tsx) | entitlement is server-backed and must stay separate |
| passcode regression | Critical | [src/components/screens/PasscodeLockScreen.tsx](src/components/screens/PasscodeLockScreen.tsx), [src/App.tsx](src/App.tsx) | access control is in a settings object |
| notification regression | Medium | [src/hooks/useNotificationPreferences.ts](src/hooks/useNotificationPreferences.ts) | separate notification persistence exists |
| account-switch regression | High | [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | local state and remote hydration are merged without user-named storage |
| localStorage regression | High | [src/context/CycleContext.tsx](src/context/CycleContext.tsx) | shared settings storage is used by many domains |
| Supabase profile hydration regression | Medium | [src/context/CycleContext.tsx](src/context/CycleContext.tsx), [src/hooks/useProfile.ts](src/hooks/useProfile.ts) | remote profile reads merge into a broad local object |
| feature-slice regression | Medium | [src/components/screens](src/components/screens) | extraction could break hidden dependent screens |

## 24. Deferred Work

This preflight explicitly does not implement or redesign any of the following:

- user-scoped localStorage
- LocalStore
- SyncEngine
- Supabase schema changes
- RLS changes
- passcode redesign
- biometric implementation
- premium purchase implementation
- entitlement redesign
- React Router
- deep links
- Capacitor navigation
- community extraction
- daily-log extraction
- cycle-domain extraction
- Guided Discovery
- Explore
- feature registry expansion
- UI redesign

These are all future-phase concerns and should remain separate from the settings preflight.

## 25. Validation Evidence

This phase was intentionally read-only and did not change source code.

Validation command run during the current session:

- `npm test -- --run src/navigation/NavigationContext.test.tsx src/navigation/canonicalNavigation.test.ts`

Result:

- 2 test files passed
- 7 tests passed
- exit code 0

This validation is relevant to the navigation seam that was already extracted in the prior phase, and it is not a claim that the settings extraction itself is implemented or verified. No settings code was changed in this preflight.

## 26. Final Verdict

PREFLIGHT APPROVED

The dependency graph is sufficiently bounded to justify a future settings extraction, but only after the settings domain is narrowed to a true profile/preferences subset and the cycle, onboarding, passcode, and entitlement concerns remain separated. The evidence does not support a broad “extract all settings at once” action, but it does support a future bounded settings boundary that avoids destabilizing navigation, auth, entitlement, onboarding, or cycle calculations.
