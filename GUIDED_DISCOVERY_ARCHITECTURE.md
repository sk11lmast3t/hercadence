# Guided Discovery Architecture

**Status:** Part 2 design only; no overlay, registry, storage, or feature screen was changed. This design reuses the registry and route contract in [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) and [NAVIGATION_ARCHITECTURE.md](./NAVIGATION_ARCHITECTURE.md).

## Product contract

- Each feature explicitly chooses `guidePolicy: 'offer' | 'auto-start' | 'disabled'`; the guide engine is the same for every policy.
- The feature remains usable if the guide is skipped, dismissed, unavailable, offline, or broken.
- The same canonical feature has the same guide regardless of entry source.
- Guides, journeys, recommendations, and entitlement are separate systems.
- No AI recommendation engine, forced funnel, new medical functionality, or health inference is proposed.

## Components and boundaries

```text
Feature Registry
  ├─ feature ID → guide ID/version
  ├─ feature IDs → allowed next suggestions
  └─ feature IDs → journey memberships

Guide Registry → Guide Definition (versioned steps)
     ↓
useFeatureGuide(featureId)
     ↓
Guide Provider / Guide Controller
     ├─ guide-state repository (local durable cache + user-scoped remote sync)
     ├─ target locator/scroll coordinator
     └─ Guide Overlay (existing visual system, touch/accessibility safe)

Journey Registry → Journey Service → optional saved progress
Feature Registry + repository progress → deterministic recommendation evaluator
```

| Component | Responsibility | Must not do |
|---|---|---|
| Guide Registry | Validated guide definitions and current version by canonical feature | Store per-user progress or embed tutorial logic in each screen |
| Guide Definition | Explain a feature with ordered steps, stable target IDs, title/body, optional action | Navigate to a different feature or require completion |
| `useFeatureGuide` | Start/resume/complete/skip/replay API for the current feature | Make a screen inaccessible on errors |
| Guide Provider/Controller | Choose whether a guide may start, manage step state, handle unmount/navigation and dismissal | Own route history, auth, or entitlement |
| Guide Overlay | Render existing-system overlay, keyboard/safe-area/scroll behavior, accessible controls | Hide a critical control without a usable dismiss path |
| Guide State Repository | Per-user, per-version lifecycle persistence and remote sync | Store credentials or medical detail |
| Journey Registry/Service | Describe optional sequence and progress, pause/resume/exit | Require prerequisites or block direct feature access |
| Recommendation Evaluator | Apply deterministic rules and produce reasons/target IDs | Use AI, opaque scoring, or infer a medical condition |

Feature screens opt in declaratively through registry metadata. DOM target selectors use stable test/accessibility IDs, not brittle text or CSS positions. A missing target, changed screen, scroll failure, or overlay error skips that step or dismisses the guide with normal feature operation intact.

## Guide definition and state

```ts
type GuideStatus = 'not-seen' | 'in-progress' | 'completed' | 'skipped';

type GuideDefinition = {
  id: string;
  version: number;
  featureId: string;
  steps: Array<{
    id: string;
    targetId: string;
    title: string;
    description: string;
  }>;
};

type GuideProgress = {
  clerkUserId: string;
  guideId: string;
  version: number;
  status: GuideStatus;
  currentStepId?: string;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  updatedAt: string;
};
```

The data model is conceptual; code/schema names are finalized only with implementation review. One record is scoped to `(user, guide, version)`. Do not store step descriptions or health data in progress rows.

`guidePolicy` belongs to the feature-registry entry, not the guide definition. It is required for any feature with a guide and is one of `'offer' | 'auto-start' | 'disabled'`. A feature with no registered guide has no guide prompt. `offer` is the default policy until a feature explicitly opts into `auto-start` or `disabled`.

### Lifecycle rules

1. Resolve canonical feature and access policy first.
2. Render the feature normally and read progress asynchronously; feature interaction never waits for guide storage/network.
3. If the current version has terminal progress, do not auto-show. If unseen and policy is `disabled`, show no guide. If policy is `offer`, display a small non-blocking prompt such as **Learn how this works** with **Show me** and **Not now**. If policy is `auto-start`, wait until the feature and target layout are rendered, then start the guide prominently; the overlay must have a visible Skip/Close action and must not trap the user.
4. `auto-start` is the only policy that begins the guide without an affirmative Show me tap. It still renders the feature first and is dismissible immediately. The engine and progress model remain identical across policies.
5. Persist `in-progress` and step transitions locally; queue user-scoped sync.
6. `completed` or `skipped` is terminal for that version. Reopening does not auto-run it.
7. A greater guide version is a new lifecycle; older version records remain for history and merge.
8. Replay is an explicit user action from an appropriate Help/Explore feature page. Replay does not erase prior completion; record replay attempts separately or begin a new attempt while retaining terminal history.
9. If a new version is published while offline, use the bundled current definition and store progress locally; synchronize later.

### Offline and cross-device behavior

The user approved that completion follows the user across devices. Use a local-first cache/outbox and a remote user-scoped progress table behind a repository. A future additive schema can use a unique key on user, guide ID, and version plus RLS tied to the Clerk `sub` claim. No production migration is run now.

Reconciliation for one version: `completed` is terminal and wins over `in-progress` or `skipped`; `skipped` is terminal for auto-show but does not override a completed result; latest step/timestamp is used only for two in-progress records. Preserve timestamps and avoid time-based comparisons as the only merge mechanism if clocks disagree. Logout clears in-memory progress; after login, load only that Clerk user's rows. Account deletion must remove progress under existing deletion/privacy policy.

## Journey registry and progress

```ts
type JourneyDefinition = {
  id: string;
  title: string;
  description: string;
  reason: string;
  featureIds: string[];
  suggestedNext?: string[];
};

type JourneyProgress = {
  journeyId: string;
  status: 'not-started' | 'in-progress' | 'paused' | 'completed';
  lastFeatureId?: string;
  updatedAt: string;
};
```

Journey progress is deliberately lightweight: only `journeyId`, `status`, `lastFeatureId`, and `updatedAt`. Do not copy feature logs, health measurements, user answers, or other health data into a journey record. It is local-only by default; remote/cross-device journey sync requires separate product and privacy approval. Guide progress remains per-user synced as previously approved.

Initial journeys use only existing features:

- **Understand Your Cycle:** Calendar → daily check-in/symptoms → BBT/mucus → Fertility Details → Insights.
- **Build Your Wellness Picture:** Sleep → Hydration → Activity → Body Metrics → Insights.
- **Prepare for Care:** Health Profile → symptom/cycle history → Export Health Report → Care Team/Appointment.
- **Learn and Connect:** Video Library/article → Community → Partner Sync.

Steps may be skipped or entered out of order. Progress records optional started/paused/completed state and last feature ID; it does not gate registry destinations. Journey persistence may begin locally; cross-device sync requires confirming product need and privacy policy because the user explicitly approved cross-device sync for guide state, not necessarily journeys.

## Explainable recommendations and frequency policy

The evaluator combines registry relations with explicit user activity/progress obtained from existing repositories:

```text
input: canonical feature IDs visited/logged (only when already available),
       completed guides, current journey, registry suggestions
output: { featureId, reasonKey, reasonData?, sourceJourney? } | none
```

Example deterministic rules:

- After a user opens/logs Sleep, optionally suggest existing Wellness Insights with a copy reason derived from the registry, not a medical claim.
- After repeated symptom logging, optionally suggest Symptom History or Insights.
- After viewing a health record/export feature, optionally suggest Care Team.

Exact thresholds/copy must be product-reviewed and use only data already collected for the feature. No new activity tracking, diagnosis, or causal claim. A user can dismiss a suggestion; dismissal suppresses it for a defined interval or until relevant progress changes, and “Not now” never blocks later direct access.

The evaluator accepts a `RecommendationPolicy` configuration; frequency behavior is policy, not scattered UI logic:

```ts
type RecommendationPolicy = {
  maxPrimaryVisible: 1;
  maxImpressionsPerFeaturePerWindow: number;
  impressionWindowMs: number;
  dismissalCooldownMs: number;
  ignoredCooldownMs: number;
};
```

Rules:

- At most **one primary recommendation** may be shown at a time.
- Never repeat a recommendation after the user has meaningfully used the target feature; re-eligibility requires a new, explicitly defined progress/rule version, not a render or app restart.
- On dismissal, suppress the same recommendation for the configured dismissal cooldown.
- On ignore/close/navigation-away, record an impression and suppress repeated display for the configured ignored cooldown; do not re-show on every screen render/session.
- Apply the configured maximum impressions per feature within its policy window. A limit of zero means disabled.
- Recommendation dismissal is distinct from guide skip and journey progress.

The duration values and impression cap must be supplied by a versioned product-policy configuration and approved before release. Do not invent hard-coded timing/threshold defaults in feature components. Until a policy configuration is approved, recommendation output is disabled (the registry may still define candidate relationships and explanations).

## Explore behavior

Explore cards are feature registry renderings, not a separate screen catalog. Sections: categories, optional journeys, recommended features with reasons, recently visited features, and new/unseen features. Search shares the same registry query and canonical IDs. Replay Tutorial appears on the relevant feature or help surface and is generated from guide metadata.

`ScreenDirectoryModal` and `KotlinAndroidCodeViewerScreen` are developer-only. The directory must be imported/exposed only in development or test builds (e.g., Vite development guard plus an explicit development route); it is absent from production registry, search, notification, and deep-link resolution. Verify production bundle and navigation cannot invoke it; hiding a button alone is insufficient.

## Accessibility and mobile constraints

- Overlay includes keyboard-operable Next/Back/Skip/Close, focus management, visible focus, screen-reader labels, and a non-modal alternative if a target cannot be isolated.
- Respect safe areas and viewport resize/keyboard appearance; scroll target into view before placing the overlay.
- Do not block OS back/navigation gestures; dismissal is always available.
- Support touch sizing and reduce-motion settings using existing design tokens/components.
- On Android/iOS WebView, verify scroll anchoring, orientation/viewport changes, foreground/background resume, and overlay layering.
- Guides do not request extra permissions. Permission-required feature flows continue to own and explain permission errors.

## Verification scenarios

| Scenario | Expected result |
|---|---|
| New user opens feature | Feature renders; guide starts/offers once without blocking normal controls. |
| Returning user completed current version | No automatic replay; manual replay remains available. |
| User skips | Feature remains usable; no auto-show again for same version. |
| Guide version increments | New version may run once; old state remains intact. |
| Opens from Search/notification/deep link/journey | Same feature ID and guide progress as tab entry. |
| Premium feature, not entitled | Existing entitlement resolution occurs before protected feature/guide. |
| Offline first visit | Guide runs from bundled definition; progress persists locally and syncs later. |
| Target missing / page changed | Guide dismisses or skips unavailable step; feature remains operable. |
| Logs out then another account signs in | Progress is isolated to each Clerk user. |
| Android/iOS and small viewport/keyboard | Overlay remains dismissible, accessible, and does not hide critical controls. |
