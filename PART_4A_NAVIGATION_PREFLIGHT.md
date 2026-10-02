# Part 4A Navigation Preflight

## 1. Scope and evidence

This is a **read-only architectural audit** of the HerCadence navigation system. **No source, test, SQL, migration, config, or native file was changed for this report.** The only file created is this document.

An authoritative Part 4A specification was searched for first: `*.md` at the repository root, `docs/`, `.kilo/`, and a repository-wide grep for `PART_4A`, `Part 4A`, `PREFLIGHT`, `preflight`, and `21 sections`. No Part 4A specification document exists. The only related documents are [NAVIGATION_ARCHITECTURE.md](NAVIGATION_ARCHITECTURE.md) (a Part 2 **design-only target**, not a Part 4A audit spec), [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), and the Part 3A-3E verification reports. The 21-section structure supplied for this task was therefore used.

**Verified by direct static reading of the working tree:**

| Area | Method | Result |
|---|---|---|
| Route state model | Read `src/context/CycleContext.tsx` (606 lines) | Single `currentView` string, no params, no history |
| Root router | Read `src/App.tsx` (889 lines) end to end | 75-case `switch`, hand-written `onBack` per case |
| View catalogue | Parsed `src/types.ts:157-232` | 75 `AppView` union members |
| Bottom navigation | Read `src/components/common/BottomNavBar.tsx` (154 lines) | 11 tab-root views, 3 subview arrays |
| Canonical registry | Read `src/registry/featureRegistry.ts` (74 lines) | 5 features, all `wellness` / `production` |
| Registry call sites | Grepped `getFeatureById`, `resolveFeatureFromLegacyRoute` | 1 production call site, 1 test-only call site |
| Directory modal | Read `src/components/common/ScreenDirectoryModal.tsx` (1047 lines) | 72 entries including `KOTLIN_ANDROID_CODE` |
| App shell | Read `src/components/common/MobileAppShell.tsx` (710 lines) | Local sleep overlay, desktop-only chrome |
| Passcode enforcement | Grepped `isLocked` / `setIsLocked` across `src` | No `setIsLocked(true)` call site exists |
| Deep linking | Grepped `window.location`, `useSearchParams`, `useNavigate`, `createBrowserRouter`, `BrowserRouter`, `appUrlOpen`, `getLaunchUrl`, `@capacitor/app`, `pushState`, `popstate` | Absent (only `window.location.href` at `ExportSuccessScreen.tsx:23,35`) |
| Hardcoded navigation | Regex over all non-test `.ts`/`.tsx` | 283 literal calls, 65 unique targets |
| Test coverage | Enumerated all `*.test.ts` / `*.test.tsx` and grepped for navigation symbols | 28 test files, 0 navigation tests |
| Parallel tab surfaces | Traced every `case` in `App.tsx` to its screen | 4 defaults + 7 directory-only variants |

**NOT verified - requires an environment not available to a static read:**

| Item | Why static reading cannot settle it | Environment required |
|---|---|---|
| Visual regression | No render, screenshot, or viewport comparison was performed | Browser session at multiple viewports, plus iOS/Android device runs |
| On-device Android hardware Back | No Capacitor App plugin is installed, so behaviour is the platform default rather than app code | Physical Android device with `adb logcat` |
| iOS edge-swipe / swipe-back | No native navigation controller exists to observe | Physical iOS device |
| Runtime paywall/entitlement ordering | Gate behaviour is reasoned from `useState`/`useEffect` ordering, not observed | Mounted jsdom test or browser DevTools session with a real Clerk session |
| Account-switch data bleed in the field | Cross-account `localStorage` keys are proven by code; observed leakage is not | Two authenticated accounts on one device |
| Clerk `isLoaded` transition timing | The pre-gate render window is proven statically; its on-screen duration is not | Browser with throttled network |
| Live Supabase schema / RLS | Out of scope for navigation and not probed | Authorized staging read-only inspection |

`npm run lint`, `npm run test`, and `npm run build` were **not** executed for this report. Nothing in the source was modified, so no regression check is claimed.

## 2. Navigation architecture inventory

There is no router. Navigation is a single string held in React context and consumed by one `switch`.

| Component | File | Responsibility | Line evidence |
|---|---|---|---|
| `CycleProvider` | `src/context/CycleContext.tsx:257` | Owns `currentView`, `setCurrentView`, and 20 other state values | `currentView` state at `:347`; exposed at `:573-574` |
| `MainAppContent` | `src/App.tsx:107` | Applies two access gates, then a 75-case `switch` | `effectiveView` memo `:119-128`; `switch` `:223-806` |
| `renderCurrentView` | `src/App.tsx:222` | Maps one `AppView` to one screen element | 75 `case` labels, `:224-797`; `default` at `:799` |
| `MobileAppShell` | `src/components/common/MobileAppShell.tsx:40` | Device chrome, hardware simulation, local sleep overlay | Early return `:185-209`; desktop chrome `:211-709` |
| `BottomNavBar` | `src/components/common/BottomNavBar.tsx:12` | 4 tab buttons + 1 action button, rendered only on 11 tab roots | `primaryTabViews` `:18-30`; early `return null` `:32-34` |
| `ScreenDirectoryModal` | `src/components/common/ScreenDirectoryModal.tsx:82` | Developer screen picker listing 72 destinations | `screens` array `:91-645` |
| `LogEntryModal` | `src/components/common/LogEntryModal.tsx:12` | Daily-log bottom sheet, not a route | `if (!isOpen) return null` `:60` |
| `featureRegistry` | `src/registry/featureRegistry.ts:24` | 5 canonical feature identities | `:24-64` |

`react-router` does **not** appear in [package.json](package.json). The dependency block is `:14-31`; no routing library is present. `@capacitor/app` is also absent, so no native Back or deep-link bridge exists.

**Status: FAIL.** A 75-case single-file switch with no URL, no history, and no route params is a view switcher, not a navigation architecture. `NAVIGATION_ARCHITECTURE.md:62` explicitly requires navigation state to be owned by React Router, not `CycleContext`; `CycleContext.tsx:232` still owns it.

## 3. Route state model

`AppView` is a closed union of 75 string literals with **no parameter type**:

| Property | Actual | Required by `NAVIGATION_ARCHITECTURE.md` |
|---|---|---|
| Route identity | `string` literal union (`src/types.ts:157-232`) | Closed `FeatureRoute` union with typed params (`:44-50`) |
| Route parameters | None. No `postId`, `appointmentId`, or `articleId` anywhere | Runtime-validated IDs (`:60`, `:186`, `:194`) |
| History stack | None. `setCurrentView` overwrites one value | Single browser-history stack (`:64`) |
| Entry source metadata | None. No `source`, no `key`, no return intent | `NavigationEntry.source` (`:52-57`) |
| URL reflection | None. The URL never changes | Router owns URL and browser Back/Forward (`:28`) |
| Back mechanism | 58 hand-written `onBack` closures | History pop, or exact validated prior entry (`:68`, `:232`) |
| Modal state | 2 `useState` booleans outside the route model | Router location/background composition (`:24`, `:67`) |

The consequence is concrete: `POST_DETAIL` (`:189`), `APPOINTMENT_DETAIL` (`:170`), and `LUTEAL_ARTICLE` (`:185`) are all bare strings. Entering `POST_DETAIL` from the directory and entering it from `COMMUNITY` are indistinguishable to the application, and `CommunityPostDetailScreen` is handed no identifier at all (`src/App.tsx:479-484`).

**Status: FAIL.**

## 4. Canonical route registry coverage

| Metric | Value | Evidence |
|---|---|---|
| `AppView` union members | 75 | `src/types.ts:157-232` |
| Registry entries | 5 | `src/registry/featureRegistry.ts:24-64` |
| **Coverage ratio** | **5 / 75 = 6.67 %** | - |
| Categories represented | 1 of many (`'wellness'` only) | `featureRegistry.ts:19` types `category` as the literal `'wellness'` |
| Visibility values present | Only `'production'` | `featureRegistry.ts:20` |
| `resolveFeatureFromLegacyRoute` call sites | **Tests only** | `featureRegistry.test.ts:10,17,24,31,38,58`; **zero** production callers |
| `getFeatureById` production call sites | 1 | `ModernizedInsightsScreen.tsx:19` |

The 5 registered routes are `MEDICATION_TRACKER`, `SLEEP_INSIGHTS`, `HYDRATION_TRACKER`, `BODY_METRICS`, `PHYSICAL_ACTIVITY`. The 70 unregistered views include every tab root, every care destination, the entire community area, the whole legal surface, and all auth and onboarding routes. `FeatureDefinition.category` is typed as the single literal `'wellness'` (`featureRegistry.ts:19`), so the registry structurally cannot express a community, care, legal, or auth feature even if an entry were added.

**Status: FAIL.** 6.67 % coverage, and the resolver that exists to close the gap is dead code outside tests.

## 5. Entry point convergence

Every entry source except one writes a raw string literal.

| Entry source | Location | Registry-backed? |
|---|---|---|
| Bottom nav tabs | `App.tsx:860` to `BottomNavBar.tsx:84-88` | No - literals `'HOME'`, `'CALENDAR'`, `'INSIGHTS'`, `'PROFILE'` |
| Insights cards | `ModernizedInsightsScreen.tsx:287-476` | **1 of 10** - only line `329` |
| Developer directory | `App.tsx:875` to `ScreenDirectoryModal.tsx:944` | No - `screen.id` literals |
| Notification action pills | `ModernizedNotificationInboxScreen.tsx:313` | No - fixture `actionView` |
| Onboarding chain | `App.tsx:503-527` | No |
| Auto sign-in redirect | `App.tsx:152` | No - `setCurrentView('HOME')` |
| Offline banner button | `App.tsx:837` | No - `setCurrentView('NOT_FOUND_404')` |

**Total literal navigation call sites: 283, across 65 unique targets.** Top targets: `HOME` (61), `PROFILE` (50), `INSIGHTS` (21), `CALENDAR` (19), `TRIAL_PAYWALL` (8), `FEELING_TODAY` (7), `LOGIN_GATEWAY` (6).

The single registry-backed navigation call is `ModernizedInsightsScreen.tsx:329`, `onClick={() => onNavigate(sleepFeature.route)}`, with `sleepFeature` resolved at module scope on line `19`. The same file navigates to `BODY_METRICS` (`:350`) and `PHYSICAL_ACTIVITY` (`:371`) by raw literal - **both of which are registered features**. So the one screen that adopted the registry adopts it for exactly one of its three registered destinations, and the three literal and one registry call sit in the same list of ten cards.

Of 284 total navigation call sites, 1 (0.35 %) resolves through the canonical registry. There is no resolver, no policy layer, and no feature-ID plumbing at any entry point.

**Status: FAIL.**

## 6. Back navigation semantics

58 of the 75 cases declare a hand-written `onBack`. There is no history stack, so "Back" is a constant chosen at authoring time, unaware of where the user actually came from.

Cases whose declared `onBack` target is provably inconsistent with a real in-app path to that screen:

| Case | `onBack` target | In-app entry path that makes this wrong | Evidence |
|---|---|---|---|
| `PHYSICAL_ACTIVITY` | `HOME` | Insights card, so Back lands on Home not Insights | `App.tsx:597` vs `ModernizedInsightsScreen.tsx:371` |
| `SEARCH_HUB` | `HOME` | Insights card, so Back should return to Insights | `App.tsx:621` vs `ModernizedInsightsScreen.tsx:392` |
| `APPOINTMENT_DETAIL` | `INSIGHTS` | Care Team to appointment, so Back should return to Care Team | `App.tsx:317` vs `App.tsx:326` |
| `DOCTORS_CARE_TEAM` | `INSIGHTS` | `APPOINTMENT_DETAIL` to "navigate to care team", so Back should return to the appointment | `App.tsx:325` vs `App.tsx:318` |
| `BBT_LOG` | `HOME` | Fertility Detail to BBT, so Back should return to Fertility Detail | `App.tsx:280` vs `App.tsx:360` |
| `HYDRATION_TRACKER` | `HOME` | 2 in-app entry points, neither of them Home | `App.tsx:549` |
| `NOTIFICATION_INBOX` | `HOME` | Directory classifies it "Profile & Settings"; declared Back is Home | `App.tsx:709` vs `ScreenDirectoryModal.tsx:146` |
| `INITIAL_BASELINE_SETUP` | `PROFILE` | Signed-out onboarding screen; `PROFILE` is auth- and entitlement-gated, so the gate forces `LOGIN_GATEWAY` and Back does nothing | `App.tsx:787` vs `:121-123` |
| `SUPPLEMENT_TRACKER` | `HOME` | Directory classifies it "Care & Clinical", reached from non-Home contexts | `App.tsx:645` |

Two further structural problems:

- **No modal-first dismissal.** `NAVIGATION_ARCHITECTURE.md:68` requires Back to dismiss an open modal before traversing history. `isLogModalOpen` and `isDirectoryOpen` (`App.tsx:160-161`) sit outside the route model and have no Back or Escape path at all, so on a hardware-Back device nothing dismisses them.
- **No validated return destination after auth.** `NAVIGATION_ARCHITECTURE.md:69,236` require resuming the original intent after login. `App.tsx:152` unconditionally overwrites the view with `setCurrentView('HOME')` on every sign-in, destroying any pending destination.

Two screens are declared as route dead ends: `TERMS_OF_SERVICE` (`App.tsx:684`) and `PRIVACY_POLICY` (`:687`) receive **no navigation props at all**. Both work around this by reaching into context directly - `TermsOfServiceScreen.tsx:6` and `PrivacyPolicyScreen.tsx:6` call `useCycle().setCurrentView('PROFILE')` at line `12`. This is the only place in the codebase where a screen navigates by consuming `useCycle` instead of receiving a prop, and it is a direct consequence of the root switch passing no handlers.

**Status: FAIL.**

## 7. Authentication-gated navigation flow

The gate is a memo, `src/App.tsx:119-128`:

| Line | Condition | Effect |
|---|---|---|
| `:120` | `if (!isLoaded) return currentView;` | **No gate at all while Clerk is loading** |
| `:121-123` | `!isSignedIn` and view not in `['ONBOARDING_WELCOME', 'INITIAL_BASELINE_SETUP', 'LOGIN_GATEWAY']` | Force `LOGIN_GATEWAY` |
| `:127` | otherwise | Render `currentView` |

The signed-out logic itself is correct and fail-closed: all 75 views are covered, and the three exemptions are the intended public destinations. No bypass was found through the directory, the notification inbox, or any screen-level `onNavigate`.

**The defect is the early return on line 120.** `currentView` is initialised at `CycleContext.tsx:347-349` as `settings.hasCompletedBaseline ? 'HOME' : 'INITIAL_BASELINE_SETUP'`, and `settings` is loaded synchronously from `localStorage` at `CycleContext.tsx:285-292`. Therefore a returning user with `hasCompletedBaseline: true` in `localStorage` has `currentView === 'HOME'` on first paint. With `isLoaded === false`, line 120 returns `'HOME'` and `renderCurrentView()` mounts `HarmonizedForecastHomeScreen` (`App.tsx:226`) with cycle phase, day count, and `dayLogs` - all read from the non-user-scoped `localStorage` keys - before Clerk resolves and line 121 forces the login gateway.

So protected content is mounted and displayed for an unauthenticated session for at least one frame. The underlying data is device-local, so this is a UI and data-hygiene defect rather than a server data breach, but it is a real ungated render window and it compounds the account-isolation defect in section 17.

**Status: PARTIAL.** The gate logic is sound and fail-closed once Clerk has loaded; the pre-`isLoaded` window is not.
## 8. Entitlement / paywall gating

Two **independent and inconsistent** entitlement systems exist.

| System | Source of truth | Read by | Persistence |
|---|---|---|---|
| Server entitlement | `usePremiumEntitlement().isPremium` from the `get-entitlement` Edge Function (`src/hooks/usePremiumEntitlement.ts:29-52`) | `App.tsx:124` gate only | None; re-fetched per load |
| Client flag | `settings.isPremium` from `CycleContext` (`src/context/CycleContext.tsx:41`) | **6 screens** | `localStorage['cycle_tracker_user_settings']` via `CycleContext.tsx:356-360` |

Screens gating premium content on the **client** flag:

| Screen | Lines |
|---|---|
| `ConnectedDevicesScreen.tsx` | `:133`, `:288` |
| `CycleSyncedFitnessScreen.tsx` | `:112`, `:244`, `:280`, `:300` |
| `ExportHealthReportScreen.tsx` | `:262` |
| `ModernizedProfileScreen.tsx` | `:501`, `:503`, `:507`, `:511`, `:520`, `:539` |
| `PartnerSyncScreen.tsx` | `:54`, `:113` |
| `PremiumSubscriptionScreen.tsx` | `:12`, `:15` |

**The client flag is writable by two UI paths with no server transaction:**

- `ModernizedTrialPaywallScreen.tsx:37-48` - `handleStartTrial` sets a 1200 ms timer, then `updateSettings({ isPremium: true })` (line `42`). No `createSubscription()`, no Edge Function call, no order verification.
- `PremiumSubscriptionScreen.tsx:15` - `updateSettings({ isPremium: true })` on upgrade, again with no server call.

`usePremiumEntitlement` exports `createSubscription` (`:55-63`) and `createLifetimeOrder` (`:64-71`), which invoke the `paypal-create-subscription` and `paypal-create-lifetime-order` Edge Functions. A repository-wide grep found **zero call sites for either function in any file**. The purchase path is not wired.

Consequences:

1. **Client-side entitlement forgery.** Any user can set `localStorage['cycle_tracker_user_settings'].isPremium = true`, or simply tap "Start trial" once, and flip all six local content gates. The value is a plain boolean in a plain JSON blob with no signature, no server round-trip, and no user scoping.
2. **No legitimate path to premium.** The trial button and the upgrade button both write the local flag and navigate to `HOME`. `effectiveView` then re-evaluates against the *server* `isPremium`, still `false`, and forces `TRIAL_PAYWALL` again. The paywall is therefore a **dead end**: the user is trapped on a screen whose only forward action is a no-op.
3. **Paywall flash on every load.** `usePremiumEntitlement` initialises `{ isPremium: false, loading: false }` (`:19-26`). On the first render after `isSignedIn` becomes true, `isEntitlementLoading` is still `false`, so line `124` immediately forces `TRIAL_PAYWALL` for any non-allowlisted view - including the auto-redirected `HOME` from `App.tsx:152`. The gate only relaxes once `checkEntitlement()` sets `loading: true`. Every paying user sees the paywall on every cold start.
4. **Fail-closed on error, with no distinction.** If `invoke('get-entitlement')` throws, the catch at `:44-47` preserves `isPremium: false` and `loading: false`. The gate holds, which is the safe choice, but the navigation layer cannot distinguish "not entitled" from "could not reach the server", and no error is surfaced to the route.

**Can a user escape the paywall?** No durable escape exists **through the `effectiveView` gate**: it is fail-closed, re-evaluated on every `currentView` change, and `TRIAL_PAYWALL` is itself allowlisted so it cannot loop. Signing out routes to the allowlisted `LOGIN_GATEWAY`. The forgeable `settings.isPremium` flag does not by itself unlock any non-allowlisted screen, because the outer gate still forces the paywall. However, the forgery is real, the two systems disagree, and the moment the outer gate is relaxed or a premium screen is added to `UNENTITLED_ALLOWLIST`, the paid clinical content behind `ConnectedDevicesScreen`, `CycleSyncedFitnessScreen`, `ExportHealthReportScreen`, and `PartnerSyncScreen` becomes reachable with no server authorisation whatsoever.

**Status: FAIL.**

## 9. Onboarding funnel integrity

| Step | Screen | Forward | Back | Assessment |
|---|---|---|---|---|
| 1 | `ONBOARDING_WELCOME` | `ONBOARDING_UNDERSTOOD` (`:503`) | **none** | No exit; no `onBack` prop passed |
| 2 | `ONBOARDING_UNDERSTOOD` | `ONBOARDING_TRACK_EASE` (`:510`) | `ONBOARDING_WELCOME` (`:511`) | Consistent |
| 3 | `ONBOARDING_TRACK_EASE` | `ONBOARDING_SUCCESS` (`:518`) | `ONBOARDING_UNDERSTOOD` (`:519`) | Consistent |
| 4 | `ONBOARDING_SUCCESS` | `HOME` (`:526`) | **none** | Terminates into the paywall gate |
| - | `INITIAL_BASELINE_SETUP` | `LOGIN_GATEWAY` (`:788`) | `PROFILE` (`:787`) | **Broken Back** - `PROFILE` is gate-forced to `LOGIN_GATEWAY` for a signed-out user, so the control appears inert |
| - | `WELLNESS_REMINDERS_PERMISSION` | - | `HOME` (`:565`) | `HOME` is not in the allowlist; Back is gate-forced for unentitled users |

Two systemic problems:

1. **The sign-in effect hijacks navigation.** `App.tsx:134-157` fires on every fresh sign-in, gated by the `hadFiredOnboarding` ref. Its `.finally()` (`:150-153`) calls `checkEntitlement()` and then `setCurrentView('HOME')` unconditionally - including on the error path. Any view the user was on, and any validated return destination, is destroyed on every sign-in. `NAVIGATION_ARCHITECTURE.md:69,236` requires resuming the original intent.
2. **The funnel terminates in a dead end.** `ONBOARDING_SUCCESS` to `HOME` to the entitlement gate forcing `TRIAL_PAYWALL` to the only forward action being the fake trial write that bounces back to `TRIAL_PAYWALL`. A new unentitled user cannot reach the app.

`ONBOARDING_UNDERSTOOD` and `ONBOARDING_TRACK_EASE` are absent from `UNENTITLED_ALLOWLIST` (`App.tsx:90-105`). This matches `NAVIGATION_ARCHITECTURE.md:105`, which explicitly warns against silently adding them, so it is an intentional documented decision rather than a defect - but its consequence is that a signed-in unentitled user is paywalled mid-onboarding, which combined with finding 2 above makes the funnel unpassable.

**Status: FAIL.**

## 10. Parallel and duplicate implementations

| Tab | Default screen | App.tsx line | Alternative roots | Alternative line |
|---|---|---|---|---|
| Home | `HarmonizedForecastHomeScreen` | `:226` | `HomeScreen` (`CLASSIC_HOME`) | `:232` |
| | | | `HarmonizedHomeScreen` (`HARMONIZED_HOME`) | `:396` |
| | | | `HarmonizedDashboardScreen` (`HARMONIZED_DASHBOARD`) | `:388` |
| Calendar | `HarmonizedCalendarScreen` | `:242` | `HarmonizedCalendarScreen` again (`HARMONIZED_CALENDAR`) | `:404` |
| Insights | `ModernizedInsightsScreen` | `:250` | `InsightsScreen` (`CLASSIC_INSIGHTS`) | `:255` |
| | | | `HarmonizedInsightsScreen` (`HARMONIZED_INSIGHTS`) | `:412` |
| Profile | `ModernizedProfileScreen` | `:264` | `ProfileScreen` (`CLASSIC_PROFILE`) | `:270` |

**Ten parallel implementations for three primary surfaces.** All seven non-default variants are reachable, and every one of them is reachable **only** through the developer directory - the `BottomNavBar` always navigates to the four canonical roots (`BottomNavBar.tsx:84-88`). They are therefore not alternative user choices; they are unreachable-by-design parallel code paths that no user-facing affordance selects.

`HARMONIZED_CALENDAR` is a strict duplicate: `App.tsx:242` and `:404` render the **same component with the same props**. It is pure dead weight.

Additional duplication found outside the tabs:

| Duplicate | Evidence |
|---|---|
| `CYCLE_AI_ASSISTANT` and `CYCLE_SYNCED_FITNESS` | Both render `CycleSyncedFitnessScreen` with identical props - `App.tsx:372-378` and `:380-386`. `NAVIGATION_ARCHITECTURE.md:181` flags this as requiring a product decision. |
| Two modal state channels | `isLogModalOpen` / `isDirectoryOpen` in `App.tsx:160-161`, and a separate `isLogSheetOpen` / `setIsLogSheetOpen` in `CycleContext.tsx:251-252, 353, 592-593` that has **zero consumers outside `CycleContext` itself** |
| Two entitlement flags | Section 8 |
| Two screen-navigation conventions | Prop injection for 73 screens; direct `useCycle().setCurrentView` in `TermsOfServiceScreen.tsx:6,12` and `PrivacyPolicyScreen.tsx:6,12` |
| Two local `selectedArticle` values | `CycleContext.tsx:351` (unused by any consumer) and a private `useState` inside `DiscoveryVideoLibraryScreen.tsx:42` |

**Maintenance risk.** Every change to tab behaviour must be reasoned about across up to four implementations, and the six obsolete variants have no test coverage and no way for QA to know which one shipped. The registry design in `NAVIGATION_ARCHITECTURE.md:158-161` anticipated exactly this ("alternate screen variants retained for comparison") but requires parity proof before consolidation; no such proof exists.

**Status: FAIL.**

## 11. Modal vs. navigation separation

| Surface | Mechanism | Gate participation | Dismissal | History |
|---|---|---|---|---|
| `LogEntryModal` | `useState` boolean, `App.tsx:160` | **None** - sibling of `renderCurrentView()` at `:865-869` | Close button `:301`, backdrop `:116`, `onClose()` `:73,258`. **No Escape** | None |
| `ScreenDirectoryModal` | `useState` boolean, `App.tsx:161` | **None** - sibling at `:872-877` | Two Close buttons (`:769-776`, `:1035-1041`). **No backdrop click, no Escape** | None |
| `MobileAppShell` install sheet | Local `useState`, `MobileAppShell.tsx:69` | None | Close `:654`, "Got it" `:699`. No Escape | None |
| `MobileAppShell` sleep overlay | Local `useState`, `MobileAppShell.tsx:66` | None | Click anywhere `:585` | None |

Confirmed: both App-level modals bypass `effectiveView` entirely. They are siblings of the rendered route, not routes themselves, so they cannot be gated - which is correct for a log sheet, but **incorrect for the screen directory**, because the directory's entire function is to select destinations, and it does so through an ungated path (section 19). Neither modal is unmounted or hidden when the underlying route changes, so the previously-rendered screen remains mounted and scrollable beneath the overlay. There is no focus trap, no `role="dialog"`, and no `aria-modal` on either (section 18). Neither participates in Back, and there is no validated background location to restore, which `NAVIGATION_ARCHITECTURE.md:24,235` requires.

**Status: PARTIAL.** Modals are correctly outside the route model, but the directory is an ungated navigation surface and no modal has a dismiss path outside its own buttons.

## 12. Passcode lock overlay interaction

This is the most severe finding in the audit.

| Evidence | Line |
|---|---|
| `isLocked` declared with initial value `false` | `App.tsx:162` |
| Enforcing branch condition | `App.tsx:203` |
| Only write to the state | `App.tsx:216` - `onUnlocked={() => setIsLocked(false)}` |
| `setIsLocked(true)` call sites in all of `src` | **0** |

The enforcing lock branch at `App.tsx:203-220` is **unreachable dead code**. `isLocked` is initialised to `false`, the only mutation sets it to `false` again, and nothing in the codebase ever sets it to `true`. The branch cannot execute under any user action, cold start, deep link, or state restore.

Meanwhile the passcode is fully functional as a *setting*:

- `PasscodeLockScreen.tsx:46-49` persists `{ isPasscodeEnabled: true, passcode: enteredPin }` into `CycleContext`, which writes it to `localStorage['cycle_tracker_user_settings']` (`CycleContext.tsx:356-360`).
- `ModernizedProfileScreen` and the `PASSCODE_LOCK` screen present it to the user as active protection.
- The directory entry at `ScreenDirectoryModal.tsx:484-489` advertises "4-digit PIN security, Face ID / Fingerprint protection for health data".

**The user can enable the passcode, be told their health data is protected, and receive no lock on the next launch.** A privacy control is advertised and persisted but never enforced.

Three further defects inside the unenforced screen, which become live the moment the branch is wired up:

| Defect | Evidence | Severity |
|---|---|---|
| Passcode stored in plaintext, not hashed, in a **non-user-scoped** `localStorage` key | `PasscodeLockScreen.tsx:48` to `CycleContext.tsx:358` | High - readable by any script on the origin; inherited by the next account that signs in on the device |
| Hardcoded fallback master PIN `'1234'` | `PasscodeLockScreen.tsx:39` - `if (enteredPin === (settings.passcode \|\| '1234'))` | High - if `settings.passcode` is empty, the PIN is `1234` |
| "Face ID" unlocks with no verification at all | `PasscodeLockScreen.tsx:59-63` - `if (isEnforcingLock) { onUnlocked(); }` | High - an unconditional unlock, presented to the user as biometric authentication |
| The early return would pre-empt **both** access gates | `App.tsx:203-220` returns before `renderCurrentView()` at `:855`, so neither the auth gate (`:121`) nor the entitlement gate (`:124`) is consulted | Informational while unreachable; ordering must be fixed before wiring |

`NAVIGATION_ARCHITECTURE.md:78` requires the passcode boundary to sit above protected content and states explicitly that "Logout/session expiry must not be bypassed by a persisted unlocked state." The current ordering would satisfy the letter of the passcode requirement while violating the root ordering in `NAVIGATION_ARCHITECTURE.md:75-80`, because the lock returns a shell whose `onOpenDirectory` (`App.tsx:209`) and `onNavigate` (`:207`) are live during lock. The directory modal itself is not mounted in that branch, so the header button is a no-op - an inconsistency, not a bypass.

**Status: FAIL.**

## 13. Offline and 404 handling

| Behaviour | Evidence | Assessment |
|---|---|---|
| Online/offline detection | `App.tsx:163-190` - `navigator.onLine` plus `online` / `offline` listeners | Correct and cleaned up |
| Offline banner | `App.tsx:820-853` | Dismissible (`:844`), has `aria-label` (`:846`) |
| Banner "View 404 / Offline" button | `App.tsx:837` - `setCurrentView('NOT_FOUND_404')` | **Conflates offline with not-found.** A network outage navigates the user to a 404 screen whose recovery affordances are unrelated to connectivity. `NOT_FOUND_404` is a real route (`App.tsx:722-728`) and is also a directory entry (`ScreenDirectoryModal.tsx:161-168`). |
| `OFFLINE_SYNC` screen | `App.tsx:714-720`, `ModernizedOfflineStateScreen` | Renders, `onBack` to `HOME`. It is in the directory (`:153-160`) and nowhere else. Not a real offline queue. |
| `NOT_FOUND_404` as unmatched fallback | `App.tsx:799-805` `default:` case | Correctly defensive: any value outside the 75 union members renders the not-found screen rather than a blank page |
| Offline queue | `src/hooks/useOfflineSync.ts` exists | Per `PART_3A_VERIFICATION.md:212,256`, no active feature source references it. Not connected to navigation. |
| Recovery on reconnect | None | Reconnection sets `isOnline` and hides the banner (`App.tsx:169-172`) but does not retry the navigation that failed or restore the prior view |

There is no 404 route reachable by URL, because there is no URL. `NOT_FOUND_404` is only reachable by the offline banner or the directory.

**Status: PARTIAL.** Detection and the defensive default are sound; offline is conflated with not-found, and there is no reconnect recovery.
## 14. Notification-driven navigation

`ModernizedNotificationInboxScreen` holds a **local fixture array** in `useState` (`:96-119`, with a `handleResetSample` at `:119`). No notification is fetched from any source.

| Interaction | Line | Navigates? |
|---|---|---|
| Tapping the notification **row** | `:277` - `onClick={() => handleToggleRead(item.id)}` | **No.** Toggles read state only. Tapping a notification is inert with respect to navigation. |
| Notification **action pill** | `:309-319` - `onClick` to `if (item.actionView) onNavigate(item.actionView)` | **Yes**, but only when `item.actionLabel` is set (`:307`) |
| Empty-state CTA row | `:365` HOME, `:374` CALENDAR, `:384` `SYMPTOM_INTENSITY_LOG`, `:395` INSIGHTS, `:404` PROFILE, `:416` HOME | Yes - literal targets |
| Header back | `:194` - `onBack \|\| (() => onNavigate('HOME'))` | Yes - note this prefers `onBack` over `onNavigate`, inverting the pattern used everywhere else |

The action pill navigates using a hardcoded `actionView: AppView` field on the fixture (`:39-40`). Five of the fixture items carry one: `HOME` (`:51-52`), `MEDICATION_TRACKER` (`:61-62`), `PARTNER_SYNC` (`:71-72`), `SYMPTOM_INTENSITY_LOG` (`:81-82`), `EXPORT_HEALTH_REPORT` (`:91-92`).

**Push notification navigation does not exist.** `@capacitor/push-notifications` is a declared dependency ([package.json](package.json) line `19`) but a grep for `PushNotifications`, `pushNotification`, and `addListener` across all of `src` returned **zero matches**. No push payload is ever received, parsed, or routed. `NAVIGATION_ARCHITECTURE.md:137-138` requires notification payloads to carry a stable notification ID, a canonical feature ID, and typed destination parameters; none of this exists.

So notification-driven navigation is partially present, but only for locally-defined sample data, and only through a fixture field rather than a delivery contract. A repository-wide grep for `onNavigate` originating from any notification click handler returns only the six lines inside this one screen.

**Status: PARTIAL.**

## 15. Deep link and external URL handling

Searched for and **not found** anywhere in `src`:

| Pattern | Result |
|---|---|
| `createBrowserRouter`, `BrowserRouter`, `useNavigate`, `useLocation`, `useSearchParams` | 0 matches |
| `history.pushState`, `popstate`, `hashchange` | 0 matches |
| `appUrlOpen`, `getLaunchUrl`, `@capacitor/app` | 0 matches (package is not a dependency) |
| `react-router` in `package.json` | 0 matches |

The only `window.location` usage is `ExportSuccessScreen.tsx:23` and `:35`, which reads and copies `window.location.href` as the "shareable" report URL. Because the app never changes the URL, that value is a **constant app-root address with no destination, no record ID, and no state**. Any user who shares their exported health report link shares a URL that opens the app root.

No Android intent filters or iOS URL/universal-link configuration are present; `NAVIGATION_ARCHITECTURE.md:31,135-142` requires scheme/host allowlisting, runtime ID validation, a cold-start path, and a warm-start `appUrlOpen` path. None is implemented.

**Absence of deep linking is a legitimate and reportable audit result.** It is recorded as a `FAIL` against the architecture in `NAVIGATION_ARCHITECTURE.md`, not as a crash-level defect. Two consequences beyond the missing feature itself:

- There is **no cold-start route recovery**. `currentView` is derived only from `localStorage` at `CycleContext.tsx:348`, so the app always opens at `HOME` or `INITIAL_BASELINE_SETUP` regardless of how it was launched or what the user was last viewing. App termination and relaunch loses the current view, selected date, and scroll position.
- There is **no Android hardware Back handling**. With `@capacitor/app` absent, the system Back gesture is unhandled and will background or close the app from any of the 75 screens, bypassing both the passcode surface and any in-app parent.

**Status: FAIL.**

## 16. State preservation across navigation

| State | Location | Survives navigate-away-and-back? |
|---|---|---|
| `selectedDate` | `CycleContext.tsx:346` | **Yes** - context outlives the switch |
| `selectedPost` | `CycleContext.tsx:350` | **Yes**, but see below |
| `appointment` | `CycleContext.tsx:352` | **Yes**, but never populated |
| `selectedArticle` | `CycleContext.tsx:351` | **Yes** - and **never read by anyone** |
| `dayLogs`, `posts`, custom tags, `settings` | `CycleContext.tsx:285-332` | Yes |
| All per-screen local state | Screen component `useState` | **No** - the `switch` unmounts the screen on every navigation |
| Scroll position, active filter, expanded accordions | - | **No** - nothing persists them |

Three specific defects:

1. **`selectedArticle` is dead context state.** `CycleContext.tsx:351` initialises it to `initialArticles[0]` and exports both `selectedArticle` and `setSelectedArticle` (`:584-585`). A grep for `setSelectedArticle` finds only the context itself. `DiscoveryVideoLibraryScreen.tsx:42` declares its **own private** `useState<ArticleItem | null>(null)`, shadowing the context value. So the context article selection is written by nobody and read by nobody.
2. **`appointment` is never populated by a selection flow.** `DoctorsCareTeamScreen` receives only `onSelectDoctorAppointment`, which navigates to `APPOINTMENT_DETAIL` (`App.tsx:326`) and passes **no appointment**. `AppointmentDetailScreen.tsx:14` reads `appointment` from context, and `updateAppointment` is called only from within `AppointmentDetailScreen` itself (`:32,38,47,62,200`) to edit the record already displayed. The context initialises it to an all-empty `initialAppointment` (`CycleContext.tsx:207-217`). Care Team to Appointment therefore renders a blank record and any edit is written back into that blank.
3. **Detail screens are not addressable.** `POST_DETAIL` reads `selectedPost` from context (`CommunityPostDetailScreen.tsx:15`) and renders a not-found fallback when it is null (`:19`). Reaching `POST_DETAIL` through the directory (`ScreenDirectoryModal.tsx:425`) leaves `selectedPost` null, so the screen shows "not found" rather than any post. `LutealNutritionArticleScreen` is worse: it receives only `onBack` (`:6`) and reads nothing from context, rendering its own fixed content.

`selectedDate` is the one selection that genuinely works end to end, because it is set through context by the calendar and read by the fertility and log paths.

**Status: PARTIAL.**

## 17. Account switch and sign-out behavior

**Guards present.** `CycleContext.tsx:382-453` hydrates from Supabase keyed on `userId` from `useAuth()`. It declares `let isMounted = true` at `:385` and returns a cleanup that sets it to `false` at `:450-452`. All three state writes re-check it after their awaits: `:394` before `setDayLogs`, `:418` before `setSettings`, `:435` before the cycle `setSettings`.

**Honest assessment of the race question:** there is **no request-generation token or numeric counter**. However, the mount guard is functionally sufficient for the stale-write race in this specific code. When `userId` changes, React runs the previous effect's cleanup, flipping that closure's `isMounted` to `false`, and a fresh closure starts with `isMounted = true`. A User A response that resolves afterwards re-checks the **old** `false` flag and is discarded. All three writes are guarded this way. So a stale in-flight response from User A cannot write into User B's state.

What the guard does **not** address is worse:

| Defect | Evidence | Impact |
|---|---|---|
| `localStorage` keys are **not user-scoped** | `CycleContext.tsx:17-20` - `cycle_tracker_user_settings`, `cycle_tracker_day_logs`, `cycle_tracker_community_posts`, `cycle_tracker_custom_tags_moods` / `_symptoms` | Every account on the device shares one storage namespace |
| `settings` hydration is a **merge**, not a replacement | `CycleContext.tsx:419-429` - `setSettings(prev => ({ ...prev, ...}))` | User B inherits User A's `isPremium`, `isPasscodeEnabled`, `passcode`, `selectedGoal`, and baseline data, then writes them back to `localStorage` at `:358` |
| The inherited passcode is **live** | `settings.passcode` is never cleared on sign-out | The next account's lock comparison uses the previous account's PIN |
| `posts`, `customMoodTags`, `customSymptomTags`, `selectedPost`, `appointment` are **never reset** on `userId` change | No effect in `CycleContext.tsx` observes `userId` for any of these | The previous account's community posts and custom tags are visible to the next account |
| `dayLogs` is the only strict replacement | `CycleContext.tsx:407-408` - `setDayLogs(remoteLogs)` | Correct for signed-in users, but the `localStorage` copy at `:362-366` still holds the previous account's logs whenever the new account's fetch errors |
| Sign-out does not reset the route | `App.tsx:154-156` resets only `hadFiredOnboarding` | `currentView` persists; the auth gate masks it, but the ungated pre-`isLoaded` window in section 7 can briefly re-render the previous account's cached cycle data |

Positive: `setDayLogs` is a strict replacement (`:408`) with an explicit comment at `:407` about preventing stale test-data leaks, and the `isMounted` guard does correctly block cross-account Supabase response writes. The feature-level hooks (`useSleep`, `useHydration`, `useBodyMetrics`, `useMedication`, `usePhysicalActivity`) have dedicated `*.account-switch.test.tsx` suites. None of that protects the shared `localStorage` layer, which is where the actual cross-account leakage occurs.

**Status: FAIL.**

## 18. Accessibility of navigation affordances

### `ScreenDirectoryModal` - 72 navigation targets, keyboard- and screen-reader-inaccessible

Each list item is a `motion.div` (`ScreenDirectoryModal.tsx:932-1000`) with `onClick` at `:943-946`, `whileHover` at `:941`, and `whileTap` at `:942`.

| Attribute | Present? | Line |
|---|---|---|
| `role` | **No** | - |
| `tabIndex` | **No** | - |
| `onKeyDown` / key handler | **No** | - |
| `aria-label` on the item | **No** - only a `<span>` with visible text (`:962-964`) | `:962` |

A grep for `role=`, `tabIndex=`, `onKeyDown`, `keydown`, and `Escape` across all of `src` returns **zero** `role`, **zero** `tabIndex`, and **zero** `Escape` handlers. The only two key handlers in the entire application are `Enter`-to-submit in `ModernizedSupportFaqScreen.tsx:469` and `CustomTagsScreen.tsx:206-207`.

Consequence: all 72 destinations - including every tab, every care screen, `LOGIN_GATEWAY`, `ONBOARDING_WELCOME`, `INITIAL_BASELINE_SETUP`, `TRIAL_PAYWALL`, and `KOTLIN_ANDROID_CODE` - are unreachable by keyboard and invisible to screen readers. The directory is the only non-tab navigation surface in the app.

### Modals - no dialog semantics, no Escape, no focus management

| Attribute | `LogEntryModal` | `ScreenDirectoryModal` |
|---|---|---|
| `role="dialog"` | **No** - plain `div` at `:104` | **No** - plain `div` at `:739` |
| `aria-modal` | **No** | **No** |
| `aria-labelledby` / `aria-label` | **No** | **No** - the close button at `:769-776` has `title` but no `aria-label` |
| Escape to close | **No** | **No** |
| Backdrop click to close | Yes (`:116`) | **No** - the overlay `div` at `:739` has no `onClick` |
| Focus moved into the dialog on open | **No** | **No** |
| Focus trapped inside | **No** | **No** |
| Focus restored on close | **No** | **No** |
| Background scroll/inert | **No** | **No** |

`LogEntryModal` does sync its internal form state on open (`useEffect` at `:36-58`) and returns `null` when closed (`:60`), so no stale field values leak - but focus is left wherever it was, so a keyboard or screen-reader user who triggers it by any means has no announced dialog and no way back to the trigger.

### `BottomNavBar` - comparatively sound, one gap

`BottomNavBar` is in materially better shape and this should be stated plainly:

| Attribute | Present? | Line |
|---|---|---|
| Semantic landmark | Yes - `<nav id="app_bottom_nav_bar">` | `:93-95` |
| Real focusable elements | Yes - `motion.button` renders a native `<button>`, so Enter/Space and tab focus work | `:100-111`, `:119-148` |
| Accessible name on the action button | Yes - `aria-label="Add Daily Log"` | `:108` |
| Visible text label on every tab | Yes | `:147` |
| `aria-current` on the active tab | **No** - active state is conveyed only by colour class (`:127-129`) and an animated indicator (`:133-139`) | - |
| Announced selected state | **No** - no `aria-pressed`, `aria-selected`, or `role="tablist"` / `role="tab"` | - |

So the active tab is not programmatically exposed. A screen-reader user hears five buttons with no indication of which is current.

The `id` attributes on each button (`:102`, `:121`) do make the tabs targetable by automated tests, which is a useful testability affordance, though no test uses it.

`MobileAppShell` has one `aria-label` (`:635`, the home bar). Its simulated hardware buttons, the "All 45+ Screens" directory button (`:233-241`), the dynamic island (`:436-470`), and the sleep overlay (`:581-613`) are all non-semantic or unlabelled interactive surfaces.

**Status: FAIL.**

## 19. Developer-only destinations in production surfaces

[src/registry/featureRegistry.ts](src/registry/featureRegistry.ts) line `4` states the rule explicitly:

```text
// Developer-only destinations must NOT appear here.
```

`NAVIGATION_ARCHITECTURE.md:225` is stricter still: `KOTLIN_ANDROID_CODE` is `none in production; dev.kotlin-viewer in development`, requiring compile-time/dev-only reachability.

Actual state:

| Requirement | Actual | Status |
|---|---|---|
| `KOTLIN_ANDROID_CODE` absent from the registry | Absent - the registry has only the 5 wellness features | PASS |
| `KOTLIN_ANDROID_CODE` requires compile-time/dev-only reachability | It is a normal member of the `AppView` union (`src/types.ts:228`) with a normal `case` in the production switch (`src/App.tsx:792-797`) | FAIL |
| `KOTLIN_ANDROID_CODE` not discoverable in a production surface | It is a **named, described entry** in the production screen directory | FAIL |
| `ScreenDirectoryModal` not registry-discoverable | Correctly absent from the registry, but shipped as a user-reachable modal | FAIL |

**The full reachability trace, confirmed:**

1. `src/App.tsx:264-267` - the default `PROFILE` case renders `ModernizedProfileScreen` with `onOpenDirectory={() => setIsDirectoryOpen(true)}`.
2. `src/components/screens/ModernizedProfileScreen.tsx:46` declares `onOpenDirectory?: () => void`; `:147-157` renders a visible button (`aria-label="Open Directory"`, `title="Open All Screens Directory"`) whenever the prop is supplied. It is supplied, so the button is live in production.
3. `src/App.tsx:161` - `isDirectoryOpen` becomes `true`.
4. `src/App.tsx:872-877` - `ScreenDirectoryModal` renders with `isOpen={true}`.
5. `src/components/common/ScreenDirectoryModal.tsx:586-593` - a directory entry: `id: 'KOTLIN_ANDROID_CODE'`, title **"Kotlin Android Native Codebase"**, description **"Explore and copy the full native Kotlin codebase: Jetpack Compose, Room SQLite, ViewModel, Coroutines"**, badge "Native Android", `icon: Code2`, categorised "Profile & Settings" so it is listed among genuine user settings.
6. `ScreenDirectoryModal.tsx:943-946` - `onClick` calls `onSelectView(screen.id)` then `onClose()`.
7. `src/App.tsx:875` - `onSelectView={(v) => setCurrentView(v)}` sets `currentView = 'KOTLIN_ANDROID_CODE'`.
8. `src/App.tsx:119-128` - `effectiveView` recomputes. **The auth gate (`:121-123`) and the entitlement gate (`:124`) both still apply.** A signed-out user is forced to `LOGIN_GATEWAY`; a signed-in unentitled user is forced to `TRIAL_PAYWALL`.
9. `src/App.tsx:792-797` - for a **signed-in, entitled** user neither gate fires, and `KotlinAndroidCodeViewerScreen` renders.

**Verdict on this specific exposure:** the entitlement gate is the only thing standing between a paying production user and the native source-code viewer. It is a coincidence of configuration, not a control - the directory itself performs no permission check, and the entry is presented as an ordinary Profile setting with user-facing marketing copy. Remove `KOTLIN_ANDROID_CODE` from `UNENTITLED_ALLOWLIST` decisions, add it to the registry, or change one gate condition, and it is exposed to everyone.

Other developer-only or internal surfaces reachable through the same directory: `OFFLINE_SYNC` (`:153-160`), `NOT_FOUND_404` (`:161-168`), and all seven dead tab variants (`HARMONIZED_DASHBOARD`, `HARMONIZED_HOME`, `CLASSIC_HOME`, `HARMONIZED_CALENDAR`, `CLASSIC_INSIGHTS`, `HARMONIZED_INSIGHTS`, `CLASSIC_PROFILE`).

The directory also exposes destinations that bypass the product funnel: `LOGIN_GATEWAY` (`:638-644`), `ONBOARDING_WELCOME` (`:610-616`), `ONBOARDING_UNDERSTOOD` (`:617-623`), `ONBOARDING_TRACK_EASE` (`:624-630`), `INITIAL_BASELINE_SETUP` (`:578-585`), and `TRIAL_PAYWALL` (`:537-544`) are all selectable at will, letting an established user re-enter or skip onboarding and forcing themselves back to the paywall. The two union members missing from the directory are `CYCLE_AI_ASSISTANT` and `TERMS_OF_SERVICE` (72 of 75 covered).

**Status: FAIL.**

## 20. Architectural debt and risk register

Ordered by severity. Severity reflects user impact and the cost of undetected failure.

| # | Item | Severity | Evidence | Consequence |
|---|---|---|---|---|
| 1 | Passcode lock is unreachable; the setting is persisted and advertised but never enforced | **Critical** | `App.tsx:162,203,216`; zero `setIsLocked(true)`; `PasscodeLockScreen.tsx:46-49` | A security control the user believes is active provides no protection |
| 2 | Passcode stored in plaintext in a non-user-scoped `localStorage` key | **Critical** | `PasscodeLockScreen.tsx:48` to `CycleContext.tsx:358` | Readable by any script on the origin; inherited across accounts |
| 3 | Hardcoded fallback PIN `'1234'` and an unconditional "Face ID" unlock | **Critical** | `PasscodeLockScreen.tsx:39`, `:59-63` | Become live bypasses the moment the lock is wired |
| 4 | `settings.isPremium` is a client-forgeable authorization flag gating premium clinical content in 6 screens | **Critical** | `ModernizedTrialPaywallScreen.tsx:42`, `PremiumSubscriptionScreen.tsx:15`; readers listed in section 8 | Paid clinical content unlocked with no server authorisation; masked today only by the outer gate |
| 5 | No purchase path exists; `createSubscription` and `createLifetimeOrder` have zero call sites | **Critical** | `usePremiumEntitlement.ts:55-71`; grep returned no callers | Every unentitled user is trapped on the paywall permanently |
| 6 | Developer-only `KOTLIN_ANDROID_CODE` exposed via a production-reachable directory | **High** | `ModernizedProfileScreen.tsx:147-157`; `ScreenDirectoryModal.tsx:586-593`; `App.tsx:875,792-797` | Native source code reachable by any entitled user; only the entitlement gate intervenes |
| 7 | `localStorage` state is not user-scoped and `settings` hydration is a merge | **High** | `CycleContext.tsx:17-20`, `:419-429`, `:358` | Cross-account leakage of premium flag, passcode, profile, and cycle data |
| 8 | `posts`, custom tags, `selectedPost`, `appointment` never reset on account switch | **High** | `CycleContext.tsx` - no `userId` observer for these | Previous account's data visible to the next |
| 9 | Zero navigation test coverage across 28 test files | **High** | grep for `currentView`, `setCurrentView`, `effectiveView`, `UNENTITLED`, `App`, `BottomNavBar`, `ScreenDirectoryModal`, `MobileAppShell` returned nothing | No regression protection on any gate, gate bypass, or back-semantics change |
| 10 | `ScreenDirectoryModal` items are non-focusable `motion.div` with no `role` | **High** | `ScreenDirectoryModal.tsx:932-1000` | 72 navigation destinations unreachable by keyboard or screen reader |
| 11 | Sign-in effect unconditionally overwrites the route with `HOME` | **High** | `App.tsx:150-153` | No validated return destination; auth flow destroys user context |
| 12 | No Escape handling, no `role="dialog"`, no focus trap in any modal | **Medium** | section 18 | Keyboard and screen-reader users can be stranded |
| 13 | Paywall flash on every load for entitled users | **Medium** | `usePremiumEntitlement.ts:19-26`; `App.tsx:124,152` | Every paying user sees the paywall before entitlement resolves |
| 14 | 9 provably inconsistent `onBack` targets; no origin-aware back | **Medium** | section 6 table | Back returns users to unrelated screens |
| 15 | 10 parallel implementations of 3 primary surfaces; 7 reachable only via the directory | **Medium** | section 10 table | Divergent behaviour, no parity proof, no QA signal on which variant shipped |
| 16 | 6.67 % registry coverage; 283 of 284 navigation calls are literals | **Medium** | section 4, section 5 | No single source of truth for destinations |
| 17 | `TERMS_OF_SERVICE` and `PRIVACY_POLICY` receive no navigation props and bypass the prop convention | **Medium** | `App.tsx:684,687`; `TermsOfServiceScreen.tsx:6,12`; `PrivacyPolicyScreen.tsx:6,12` | Convention erosion; these are the two legal screens |
| 18 | No deep links, no URL state, no Android Back handling, no cold-start recovery | **Medium** | section 15 | `ExportSuccessScreen.tsx:23,35` shares a meaningless constant URL |
| 19 | Offline banner navigates to a 404 screen; no reconnect recovery | **Medium** | `App.tsx:837` | Confusing recovery path during network loss |
| 20 | Notification row tap is inert; push dependency unused | **Medium** | `ModernizedNotificationInboxScreen.tsx:277`; zero `PushNotifications` imports | Tapping a notification appears broken; push integration is declared but absent |
| 21 | `selectedArticle` context state has zero consumers; `appointment` is never populated | **Low** | `CycleContext.tsx:351`; `DiscoveryVideoLibraryScreen.tsx:42`; `App.tsx:326` | Appointment detail renders blank from the normal entry path |
| 22 | Dead `isLogSheetOpen` context channel | **Low** | `CycleContext.tsx:251-252,353,592-593` | Third parallel modal state; zero consumers |
| 23 | 31 subview-to-tab mappings in `BottomNavBar` are unreachable dead code | **Low** | `BottomNavBar.tsx:37-79` vs early return `:32-34` | Misleads maintainers about tab-highlight behaviour |
| 24 | Ungated render window before Clerk `isLoaded` | **Medium** | `App.tsx:120`; `CycleContext.tsx:285-292,347-349` | Cached cycle content renders for an unauthenticated session |
| 25 | `HARMONIZED_CALENDAR` renders the identical component and props as `CALENDAR` | **Low** | `App.tsx:242,404` | Pure duplication |

No `MegaRepository`, no `SleepContext`-style mega-context, and no `useOfflineSync` connection from navigation were found. The debt here is navigation-specific, not a new mega-abstraction.
## 21. Final scorecard and verdict

| Requirement | Status | Evidence (`file:line`) | Remaining limitation |
|---|---|---|---|
| Navigation architecture | FAIL | `App.tsx:223-806`; `package.json:14-31` | No router, no URL, no history. A 75-case switch is a view switcher, not a navigation architecture |
| Route state model | FAIL | `CycleContext.tsx:347,573-574`; `types.ts:157-232` | One string, zero parameters, zero history, zero entry-source metadata |
| Registry coverage | FAIL | `featureRegistry.ts:24-64` vs `types.ts:157-232` | 5 / 75 = 6.67 %. `category` is typed as `'wellness'` only, so the registry cannot express any other domain |
| Entry convergence | FAIL | `ModernizedInsightsScreen.tsx:19,329` vs 283 literals | 1 canonical call out of 284. `resolveFeatureFromLegacyRoute` has zero production callers |
| Back semantics | FAIL | `App.tsx:280,317,325,597,621,709,787`; 58 `onBack` closures | 9 provably inconsistent targets, no origin awareness, no modal-first dismissal, no validated return after auth |
| Auth gating | PARTIAL | `App.tsx:120-123` | Gate is correct and fail-closed once Clerk loads, but `if (!isLoaded) return currentView` mounts `HOME` with cached `localStorage` data for an unauthenticated session before the gate engages |
| Entitlement gating | FAIL | `App.tsx:124`; `ModernizedTrialPaywallScreen.tsx:42`; `PremiumSubscriptionScreen.tsx:15`; `usePremiumEntitlement.ts:55-71` | Two inconsistent systems; `settings.isPremium` is client-forgeable and gates 6 screens; zero purchase call sites; paywall is an unescapable dead end; paywall flash on every load |
| Onboarding integrity | FAIL | `App.tsx:134-157`, `:503-527`, `:787` | Sign-in effect destroys the route via `setCurrentView('HOME')`; funnel terminates at an unescapable paywall; `INITIAL_BASELINE_SETUP` Back is inert for signed-out users |
| Modal separation | PARTIAL | `App.tsx:160-161`, `:865-877`; `ScreenDirectoryModal.tsx:769-1041` | Modals correctly sit outside the route model, but the directory is an ungated navigation surface with no backdrop or Escape dismissal, and `isLogSheetOpen` is a third dead channel |
| Lock overlay | FAIL | `App.tsx:162,203,216`; `PasscodeLockScreen.tsx:39,46-49,59-63` | Enforcing branch is unreachable dead code (zero `setIsLocked(true)`); plaintext passcode in a non-user-scoped key; `'1234'` fallback; "Face ID" unlocks unconditionally |
| Deep linking | FAIL | grep: 0 matches for router, `appUrlOpen`, `getLaunchUrl`, `pushState`, `popstate` | Absent entirely. No cold-start recovery, no Android Back handling; `ExportSuccessScreen.tsx:23` shares a constant root URL |
| Notification nav | PARTIAL | `ModernizedNotificationInboxScreen.tsx:277,307-319,365-416` | Row tap is inert; action pill navigates only via a local fixture `actionView`; `@capacitor/push-notifications` declared with zero imports; no push payload contract |
| State preservation | PARTIAL | `CycleContext.tsx:346,350-352`; `App.tsx:479-484,792-797` | Context selections survive, but all per-screen state is lost on navigate-away; `selectedArticle` has zero consumers; `appointment` is never populated; detail screens are not addressable |
| Account isolation | FAIL | `CycleContext.tsx:17-20,385,394,418,435,450-452,419-429` | `isMounted` guard does correctly block stale Supabase writes, but `localStorage` keys are not user-scoped, `settings` hydration is a merge, and `posts` / tags / `selectedPost` / `appointment` are never reset |
| Accessibility | FAIL | `ScreenDirectoryModal.tsx:932-1000`; `BottomNavBar.tsx:93,108,116-148`; 0 `role` / 0 `tabIndex` / 0 `Escape` in `src` | 72 navigation targets are non-focusable `motion.div`s; no dialog semantics, no Escape, no focus trap anywhere; `BottomNavBar` lacks `aria-current` |
| Test coverage | FAIL | 28 test files; 0 importing `App`, `BottomNavBar`, `ScreenDirectoryModal`, or `MobileAppShell`; 0 asserting `currentView` / `effectiveView` / `UNENTITLED_ALLOWLIST` | The 11 `onNavigate` matches are all `vi.fn()` prop stubs. Zero protection on gates, gate ordering, back semantics, or directory exposure |
| Visual regression | NOT VERIFIED | Static reading only | Requires a browser session at multiple viewports plus iOS and Android device runs. No screenshot, interaction, or responsive check was performed |

**Row totals:** 17 rows - **0 PASS**, **4 PARTIAL**, **12 FAIL**, **1 NOT VERIFIED**.

### Remediation required before approval, ordered by severity

1. **Wire or remove the passcode lock.** Either introduce a real `setIsLocked(true)` entry point (app background, cold start, manual lock) and reorder the boundary per `NAVIGATION_ARCHITECTURE.md:75-80`, or delete the passcode UI and the persisted `isPasscodeEnabled` flag. Shipping a control that never fires is the single most damaging item in this audit.
2. **If the lock is kept: hash the passcode, scope it per user, remove the `'1234'` fallback, and make `simulateFaceId` perform a real platform check.** `PasscodeLockScreen.tsx:39,48,59-63`.
3. **Delete `settings.isPremium` as an authorization signal.** All six readers must use the server entitlement from `usePremiumEntitlement`. Remove `updateSettings({ isPremium: true })` from `ModernizedTrialPaywallScreen.tsx:42` and `PremiumSubscriptionScreen.tsx:15`.
4. **Wire the real purchase path**, or remove the trial and upgrade CTAs. `createSubscription` / `createLifetimeOrder` must have call sites, or the paywall must be re-specified as a hard stop. This is what makes the entitlement gate escapable legitimately.
5. **Make `ScreenDirectoryModal` compile-time dev-only.** Guard `KOTLIN_ANDROID_CODE` and all seven tab variants behind `import.meta.env.DEV`, or remove them. Add a regression test asserting the directory contains no developer destination in a production build.
6. **Scope all `localStorage` keys by `userId` and change `settings` hydration to a replacement, not a merge.** `CycleContext.tsx:17-20`, `:419-429`. Reset `posts`, custom tags, `selectedPost`, and `appointment` on `userId` change.
7. **Add navigation characterization tests before any refactor.** Cover: signed-out forcing `LOGIN_GATEWAY` for all 75 views except the three exemptions; unentitled honouring `UNENTITLED_ALLOWLIST` exactly; entitlement loading not producing a premature paywall; directory selection of `KOTLIN_ANDROID_CODE` and of `TRIAL_PAYWALL`; the `setCurrentView('HOME')` sign-in side effect.
8. **Make the directory keyboard-accessible.** Convert the 72 `motion.div` items to `button` elements (or add `role`, `tabIndex`, and Enter/Space handlers), and add `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape-to-close, backdrop-to-close, focus entry, and focus restore to both modals.
9. **Add a request-generation guard to `CycleContext` hydration** to replace reliance on the mount flag alone, and add an authenticated two-user account-switch test. The existing `isMounted` guard is adequate today; a generation token makes the invariant explicit and survives future refactors.
10. **Stop overwriting the route on sign-in.** Remove the unconditional `setCurrentView('HOME')` at `App.tsx:152` and add a validated return destination.
11. **Fix the 9 inconsistent `onBack` targets**, or adopt origin-aware back. At minimum correct `PHYSICAL_ACTIVITY`, `SEARCH_HUB`, `APPOINTMENT_DETAIL`, `DOCTORS_CARE_TEAM`, `BBT_LOG`, `NOTIFICATION_INBOX`, and `INITIAL_BASELINE_SETUP`.
12. **Pass navigation props to `TERMS_OF_SERVICE` and `PRIVACY_POLICY`** instead of letting them consume `useCycle` directly, so the legal screens follow the same convention as the other 73.
13. **Consolidate the tab surfaces.** Remove `HARMONIZED_CALENDAR` (an exact duplicate), and either delete the six remaining dead variants or record the parity evidence required by `NAVIGATION_ARCHITECTURE.md:158-161`.
14. **Fix the offline/404 conflation** at `App.tsx:837` and add a reconnect recovery path that restores the prior view.
15. **Populate `appointment` from the care-team selection** and remove or wire the dead `selectedArticle` context state.
16. **Complete the registry migration** toward the 75-view catalogue, then add an `import.meta.env.DEV` guard on `ScreenDirectoryModal` and delete the 31 unreachable tab-mapping entries in `BottomNavBar.tsx:37-79`.
17. **Re-run this preflight** with a mounted browser session once items 1-9 land, and record the browser and device evidence required to move the `Visual regression` row off `NOT VERIFIED`.

### Verdict

`NAVIGATION PREFLIGHT BLOCKED`

**Justification:** the audit found 12 `FAIL` rows and three integrity breaches - a passcode lock that can never engage, a client-forgeable premium flag gating paid clinical content with no purchase path, and a developer-only native-source-code destination reachable from a production surface - so no approval is possible regardless of the remaining 4 `PARTIAL` and 1 `NOT VERIFIED` rows.

---

**NAVIGATION PREFLIGHT BLOCKED**