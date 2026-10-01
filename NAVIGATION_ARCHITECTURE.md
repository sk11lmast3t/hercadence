# HerCadence Navigation Architecture

**Status:** Part 2 design-only specification. Current behavior and route inventory are in [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md); canonical product hierarchy is in [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md).

## Navigation implementation decision

The repository currently has React 18, Vite, and Capacitor, but no routing dependency or router use in `src`; `AppView` plus the root switch is the current mechanism. Adopt **React Router v7 in library mode**, using `createBrowserRouter` and `RouterProvider`. It owns route matching, URL changes, nested layouts, and the browser History API. Do not build another custom router or a parallel large stack manager.

React Router has one browser-history stack, not independent native stacks for each tab. Represent the four tabs as nested route branches:

```text
/app/home
/app/home/daily-check-in
/app/calendar
/app/calendar/fertility/:cycleId
/app/insights
/app/insights/personalized
/app/profile
/app/profile/preferences
```

The route hierarchy represents each tab's branch; the browser history represents the chronological stack across all branches. Selecting a tab navigates to its canonical tab route. Back returns to the actual previous route, which may be in another tab. Do not implement independently preserved per-tab stacks unless later product validation requires them and a router-supported approach is approved.

Use React Router nested route/location composition for modals. An in-app modal entry retains its validated background location and closing restores that exact location. A direct URL/deep link has no assumed background and renders a standalone page. No separate modal stack is needed.

### Platform behavior

- **Web:** React Router owns URL and browser Back/Forward behavior through the History API.
- **Android:** add the official Capacitor App plugin in the implementation phase. Its `backButton` listener delegates Back to the router: dismiss an open modal first; otherwise return through known in-app history; at an app root with no in-app parent, follow the documented root policy and exit. Do not navigate into unknown/external browser history. Remove the native listener on teardown.
- **iOS:** use in-app Back controls and React Router history. A single Capacitor WebView is not a native navigation-controller stack; do not promise or synthesize the iOS edge-swipe navigation gesture.
- **Deep links:** register approved Android intent filters and iOS URL/universal-link configuration only during implementation. Read a cold-start URL through Capacitor App's launch URL API and warm-start URLs through `appUrlOpen`; send both through one parser and `router.navigate()`. Validate scheme/host, destination ID, and typed parameters. After auth/unlock, resume only that validated intent.

These choices are based on the existing React 18/Vite/Capacitor setup and current [React Router browser-router documentation](https://reactrouter.com/start/data/installation) and [Capacitor App documentation](https://capacitorjs.com/docs/apis/app). `react-router` and `@capacitor/app` are not dependencies in the current `package.json`; no dependency or native configuration changes are made in this design phase.

## Goals

- Preserve the four tabs, auth, onboarding, entitlement, passcode, and current feature behavior.
- Replace the conceptual dependency on a global `AppView` switch gradually, not all at once.
- Make one canonical destination resolve identically from tabs, feature links, Explore, Search, notifications, recommendations, journeys, and external entry.
- Keep origin-aware Back behavior and support nested routes, modals, deep links, and protected destinations.

## Destination and navigation model

```ts
type FeatureRoute =
  | { featureId: 'community.post'; params: { postId: PostId } }
  | { featureId: 'care.appointment'; params: { appointmentId: AppointmentId } }
  | { featureId: 'learn.article'; params: { articleId: ArticleId } }
  | { featureId: 'wellness.sleep'; params?: never }
  | { featureId: 'wellness.hydration'; params?: never };

type NavigationEntry = {
  destination: FeatureRoute | TabRoute | RootRoute | SystemRoute | ModalRoute;
  source: 'tab' | 'feature-link' | 'explore' | 'search' | 'notification'
    | 'deep-link' | 'recommendation' | 'journey' | 'legacy' | 'system';
  key: string;
};
```

These are conceptual shapes; actual route types must use a closed feature-ID union and feature-specific parameter types. Do not accept `Record<string, string>` or let arbitrary strings select components. Examples: `community.post` requires a runtime-validated `postId`; `care.appointment` requires a runtime-validated `appointmentId`; `learn.article` requires a runtime-validated `articleId`. Parse and validate path, query, notification, legacy, and deep-link data before constructing a typed route. A valid record ID is not authorization; the feature repository must still apply user/RLS checks.

Navigation state is owned by React Router, not CycleContext:

- Four tab roots are nested route branches under the application layout; React Router's single browser-history stack records chronological navigation across them.
- Feature transitions use React Router navigation and retain validated source metadata only where needed.
- Selecting a tab navigates to its canonical tab route; separately preserved per-tab stacks are not part of this design.
- Modal destinations use React Router location/background composition and close to that exact validated route.
- Back first dismisses an open modal; otherwise it traverses known in-app history; at a root with no in-app parent it follows the platform policy above.
- External entry validates/authenticates/authorizes, then opens the canonical route; after login, return only to the previously validated destination.

## Root and access-resolution order

The design target is:

1. **Bootstrap/readiness:** wait for Clerk and required app configuration; show a non-sensitive loading state.
2. **Authentication boundary:** resolve public legal/auth/onboarding destinations. For protected destinations, use the existing `LOGIN_GATEWAY` behavior and retain a validated return destination.
3. **Onboarding boundary:** preserve existing welcome/understood/track-ease/success and baseline-setup distinctions; do not force already-complete users through setup.
4. **Passcode boundary:** for an authenticated session with passcode enabled and locked, show the enforcing passcode surface above protected content. Logout/session expiry must not be bypassed by a persisted unlocked state.
5. **Entitlement boundary:** preserve the existing `UNENTITLED_ALLOWLIST` exactly; non-allowlisted routes require the current premium entitlement result.
6. **Canonical destination resolution:** verify registry membership and parameters, then render the single registered implementation.

The code currently computes an effective view from auth/entitlement in `App.tsx` and separately overlays passcode. The above ordering is a target, not an assertion that the current implementation is already ordered this way. Before implementation, characterization tests must cover signed-out baseline setup, reauthentication return, unentitled allowlisted routes, a passcode-locked session, entitlement loading, and route changes while a gate is active.

### Existing unentitled allowlist

Preserve this exact set until a separately reviewed product entitlement change:

```text
TRIAL_PAYWALL
PREMIUM
MANAGE_BILLING
DELETE_ACCOUNT
TERMS_OF_SERVICE
PRIVACY_POLICY
TERMS_CLINICAL_DISCLAIMER
DATA_PRIVACY_SECURITY
PASSCODE_LOCK
LOGIN_GATEWAY
ONBOARDING_WELCOME
INITIAL_BASELINE_SETUP
ONBOARDING_SUCCESS
FORGOT_PASSWORD
```

`ONBOARDING_UNDERSTOOD` and `ONBOARDING_TRACK_EASE` are not in the list. Do not silently add routes because they appear onboarding-related. Signed-out and entitlement behavior must match the current resolver and existing tests/observed behavior.

## Canonical destination resolver

```text
AppView adapter ─┐
Tab / link ──────┤
Explore ─────────┤
Search ──────────┤
Notification ────┼─> parse + validate entry → access policy → canonical route → stack/modal
Deep link ────────┤
Recommendation ──┤
Journey ─────────┘
```

Resolver contract:

```ts
resolveEntry(
  entry: NavigationEntryRequest,
  context: { auth: AuthState; entitlement: EntitlementState; passcode: PasscodeState }
): Resolution;
```

`Resolution` is one of `allow(destination)`, `redirect(destination, reason, returnTo?)`, or `reject(reason)`. It performs no network or persistence work. `navigate()` applies the result to the proper tab stack or modal layer. All sources provide a `featureId` wherever possible; legacy values are translated once by the adapter.

`NavigationEntryRequest` must be a closed discriminated union with feature-specific raw parameter shapes. Each feature has a runtime parser that accepts untrusted URL/notification/legacy input and returns either a validated route or a structured rejection. Do not pass arbitrary `Record<string, string>` into route state.

### External and notification contract

- Use a versioned, opaque route contract such as `hercadence://feature/wellness.sleep` or an approved HTTPS universal link only after platform registration exists.
- Allowlist host/path patterns and validate all IDs/parameters; reject unknown routes to the not-found destination.
- Notification payload carries stable notification ID, canonical feature ID, and typed destination parameters; never put health details or credentials in a URL/payload.
- Mark/acknowledge notification state only after the destination intent is accepted; surface unavailable routes explicitly.
- The audit found native URL forwarding but no app resolver/listener and incomplete platform link registration. Implementation requires native Info.plist/Android intent filters and runtime validation.
- Entry to a protected destination follows normal auth, passcode, and entitlement gates. After login/unlock, resume only a validated intended destination.
- Cold-start URLs use Capacitor App's launch URL lookup; warm-start URLs use `appUrlOpen`. Register and clean up listeners with the app lifecycle and test duplicate/replayed links.
- Android hardware Back uses Capacitor App's `backButton` event and router history. iOS uses in-app Back and router history; no native edge-swipe stack is assumed.

## Legacy `AppView` compatibility adapter

No existing caller is removed in the foundation stage. During migration:

```text
setCurrentView(oldAppView)
  → legacyRouteMap[oldAppView]
  → canonical destination + optional parameters
  → policy resolver
  → navigation state
```

| Legacy value(s) | Canonical destination | Classification / migration note |
|---|---|---|
| `HOME`, `CLASSIC_HOME`, `HARMONIZED_HOME`, `HARMONIZED_DASHBOARD` | `tab.home` | One destination; alternate screen variants retained for comparison. |
| `CALENDAR`, `HARMONIZED_CALENDAR` | `tab.calendar` | Alias. |
| `INSIGHTS`, `CLASSIC_INSIGHTS`, `HARMONIZED_INSIGHTS` | `tab.insights` | One destination; variant migration requires parity. |
| `PROFILE`, `CLASSIC_PROFILE` | `tab.profile` | One destination; variant migration requires parity. |
| `BBT_LOG` | `feature.cycle.bbt` | One-to-one. |
| `BIRTH_CONTROL` | `feature.cycle.birth-control` | One-to-one. |
| `FERTILITY_DETAIL` | `feature.fertility.details` | One-to-one; preserve selected-date/cycle parameters. |
| `MUCUS_LOG` | `feature.cycle.mucus` | One-to-one. |
| `SYMPTOM_HISTORY` | `feature.cycle.symptom-history` | One-to-one. |
| `SYMPTOM_INTENSITY_LOG` | `feature.cycle.symptom-log` | One-to-one. |
| `FEELING_TODAY` | `feature.cycle.daily-check-in` | One-to-one. |
| `PREGNANCY_MODE` | `feature.cycle.pregnancy-mode` | One-to-one. |
| `SLEEP_INSIGHTS` | `feature.wellness.sleep` | Product destination remains Sleep; preserve insights semantics/title internally if needed. |
| `HYDRATION_TRACKER` | `feature.wellness.hydration` | One-to-one. |
| `PHYSICAL_ACTIVITY` | `feature.wellness.activity` | One-to-one. |
| `BODY_METRICS` | `feature.wellness.body-metrics` | One-to-one. |
| `FOCUS_ENERGY_TRACKER` | `feature.wellness.focus-energy` | One-to-one. |
| `PHYSICAL_COMFORT_TRACKER` | `feature.wellness.physical-comfort` | One-to-one. |
| `MEDICATION_TRACKER` | `feature.wellness.medication` | One-to-one. |
| `MEDICATION_HISTORY` | `feature.wellness.medication-history` | One-to-one; preserve tracker parent for Back. |
| `SUPPLEMENT_TRACKER` | `feature.wellness.supplements` | One-to-one. |
| `NUTRITION_CYCLE` | `feature.wellness.nutrition` | One-to-one; Explore category can also include education. |
| `WELLNESS_REMINDERS_PERMISSION` | `feature.wellness.reminder-permissions` | One-to-one. |
| `CYCLE_AI_ASSISTANT`, `CYCLE_SYNCED_FITNESS` | `feature.wellness.cycle-fitness` | Duplicate route values render one component; **REQUIRES PRODUCT DECISION** whether labels/intent are true aliases. |
| `PERSONALIZED_INSIGHTS` | `feature.insights.personalized` | One-to-one. |
| `VIDEO_LIBRARY` | `feature.learn.video-library` | One-to-one. |
| `LUTEAL_ARTICLE` | `feature.learn.luteal-article` | One destination; if article-addressable, require runtime-validated `articleId`; selection never chooses a screen implementation. |
| `DOCTORS_CARE_TEAM` | `feature.care.team` | One-to-one. |
| `APPOINTMENT_DETAIL` | `feature.care.appointment` | One destination; runtime-validated `appointmentId` is required. |
| `EMERGENCY_HELP` | `feature.care.emergency` | One-to-one. |
| `HEALTH_PROFILE` | `feature.care.health-profile` | One-to-one. |
| `CONNECTED_DEVICES` | `feature.care.connected-devices` | One-to-one. |
| `EXPORT_HEALTH_REPORT` | `feature.care.export` | One-to-one. |
| `EXPORT_SUCCESS` | `feature.care.export-success` | Flow result destination; avoid treating as separate feature. |
| `COMMUNITY` | `feature.community.feed` | One-to-one. |
| `CREATE_POST` | `feature.community.create-post` | One-to-one; preserve draft handling. |
| `POST_DETAIL` | `feature.community.post` | One destination; runtime-validated `postId` is required. |
| `PARTNER_SYNC` | `feature.connections.partner` | One-to-one. |
| `PARTNER_SYNC_DETAILS` | `feature.connections.partner-details` | One-to-one. |
| `APP_PREFERENCES` | `feature.profile.preferences` | One-to-one. |
| `EDIT_PROFILE` | `feature.profile.edit` | One-to-one. |
| `CUSTOM_TAGS` | `feature.profile.custom-tags` | One-to-one. |
| `NOTIFICATIONS` | `feature.profile.notification-preferences` | Preference settings, distinct from inbox. |
| `NOTIFICATION_INBOX` | `feature.profile.notification-inbox` | Inbox destination. |
| `DATA_PRIVACY_SECURITY` | `feature.profile.privacy-security` | One-to-one. |
| `PASSCODE_LOCK` | `feature.profile.passcode` | Explicit user-managed screen; enforcing lock remains a root guard. |
| `SUPPORT_FAQ` | `feature.help.support` | One-to-one. |
| `PREMIUM` | `feature.subscription.premium` | Preserve existing premium destination. |
| `TRIAL_PAYWALL` | `feature.subscription.paywall` | Access redirect destination. |
| `MANAGE_BILLING` | `feature.subscription.billing` | **REQUIRES PRODUCT DECISION** on relationship to the receipts screen. |
| `DELETE_ACCOUNT` | `feature.account.delete` | Sensitive flow; preserve confirmation and deletion semantics. |
| `APP_REVIEW` | `feature.account.review` | One-to-one; platform availability must be explicit. |
| `WHATS_NEW` | `feature.account.whats-new` | One-to-one. |
| `TERMS_OF_SERVICE` | `legal.terms` | One-to-one; modal vs page presentation is retained as a route presentation choice. |
| `PRIVACY_POLICY` | `legal.privacy` | One-to-one. |
| `TERMS_CLINICAL_DISCLAIMER` | `legal.clinical-disclaimer` | One-to-one. |
| `LOGIN_GATEWAY` | `root.auth.login` | Root auth flow. |
| `FORGOT_PASSWORD` | `root.auth.forgot-password` | Root auth flow; preserve validated return state. |
| `INITIAL_BASELINE_SETUP` | `root.onboarding.baseline` | Root onboarding; preserve signed-out access. |
| `ONBOARDING_WELCOME` | `root.onboarding.welcome` | Root onboarding. |
| `ONBOARDING_UNDERSTOOD` | `root.onboarding.understood` | Root onboarding; currently absent from unentitled allowlist. |
| `ONBOARDING_TRACK_EASE` | `root.onboarding.track-ease` | Root onboarding; currently absent from unentitled allowlist. |
| `ONBOARDING_SUCCESS` | `root.onboarding.success` | Root onboarding. |
| `SEARCH_HUB` | `system.search` | Search becomes registry-backed and returns canonical feature IDs. |
| `OFFLINE_SYNC` | `system.offline-status` | Status/sync destination; not a separate persistence implementation. |
| `NOT_FOUND_404` and unmatched fallback | `system.not-found` | Merge duplicate entry mechanics after behavior is characterized. |
| `ScreenDirectoryModal` | none in production; `dev.screen-directory` in development | Developer-only; never registry-discoverable. |
| `KOTLIN_ANDROID_CODE` | none in production; `dev.kotlin-viewer` in development | Developer-only screen; compile-time/dev-only reachability required. |
| `ModernizedBillingReceiptsScreen` | unresolved | Screen file not established as independent route; **REQUIRES PRODUCT DECISION**. |

The current union is in `src/types.ts`; actual screen selection is in `src/App.tsx`. Before implementing the map, verify every call site and confirm the screen catalogue count/references repository-wide.

## Back, tab, modal and return behavior

- A push stores the current route and the selected tab; Back pops that exact prior entry.
- Cross-tab feature entry is a normal React Router navigation to the canonical route; the prior route remains the previous browser-history entry. Do not create a second hidden per-tab stack.
- A tab root never returns to an arbitrary feature. Platform Back at the root follows platform conventions.
- Modal open stores a navigation-state key; close returns to that exact state, including selected tab and scroll/date state where already persisted.
- Successful auth/unlock resumes only the validated original intent. A rejected/expired destination falls back to a safe tab with a reason.
- Search/notification/journey/recommendation pushes retain their source so that Back returns to the source context while feature identity stays canonical.

## Migration compatibility and removal

1. Add route types/resolver alongside `AppView`; keep `setCurrentView` working by translation.
2. Update shared shell and one caller group at a time; add parity tests for every mapped route and guard.
3. Migrate the registry/catalog and all entry sources to canonical IDs.
4. Keep legacy constants and screen variants until static references and route tests show no supported callers remain.
5. Remove adapter entries only in a separately reviewed cleanup; never remove legal, auth, premium, privacy, passcode, or data deletion boundaries as part of route cleanup.
