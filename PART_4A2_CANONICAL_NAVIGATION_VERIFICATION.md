# 1. Scope

This verification covers the Part 4A.2 canonical navigation foundation only. The project continues to use the legacy `AppView` switch as the compatibility layer, while a new typed canonical destination model is introduced to represent the pilot wellness destinations without replacing the full application or the existing auth/entitlement gates.

This phase intentionally does not perform a full route migration, does not install a router, does not change the database schema, does not connect the offline queue, and does not rewrite the CycleContext ownership model. The scope is limited to:

- the canonical destination type
- the legacy adapter
- a small navigation controller
- feature registry alignment for the five pilot features
- pilot call-site migration for the safe navigation entry points
- focused verification tests

# 2. Current Navigation Seam

The current application remains shaped as:

```text
CycleContext.currentView
  -> App.tsx
  -> 75-case switch
  -> screen component
```

This is still the execution seam for compatibility. The new canonical layer does not replace the root switch. Instead, it sits above the current `AppView` flow and translates canonical product intent into the existing legacy view before the existing `setCurrentView` boundary is used.

The requirement is deliberately narrow: define a canonical destination for the pilot feature set, translate it to the underlying `AppView`, and keep the old navigation system operational while the framework is being stabilized.

# 3. Canonical Destination Model

The canonical model is declared in `src/navigation/canonicalNavigation.ts` and is intentionally independent of React components, Screen names, and Supabase. It is a closed discriminated union:

```ts
export type CanonicalDestination =
  | { type: 'home' }
  | { type: 'calendar' }
  | { type: 'insights' }
  | { type: 'profile' }
  | { type: 'feature'; featureId: FeatureId };
```

This model is serializable, stable, and layered above the legacy UI system. It only expresses product intent and allows the application to produce a valid legacy `AppView` while keeping the access gates unchanged.

# 4. Pilot Feature Mappings

The authoritative pilot feature IDs remain the existing registry values in `src/registry/featureRegistry.ts`:

- `wellness.sleep` -> `SLEEP_INSIGHTS`
- `wellness.hydration` -> `HYDRATION_TRACKER`
- `wellness.bodyMetrics` -> `BODY_METRICS`
- `wellness.physicalActivity` -> `PHYSICAL_ACTIVITY`
- `wellness.medication` -> `MEDICATION_TRACKER`

These IDs are not duplicated in the canonical layer. The canonical adapter resolves through the registry and then produces the exact legacy destination expected by `App.tsx`.

# 5. Legacy Adapter

The adapter in `src/navigation/canonicalNavigation.ts` provides:

- `canonicalDestinationToLegacyView(...)`
- `legacyViewToCanonicalDestination(...)`
- `createCanonicalNavigationController(...)`

The adapter explicitly supports the migration seam without pretending the entire app has canonical coverage. It is intentionally limited to:

- supported one-to-one pilot mappings
- a small set of primary root destinations (`home`, `calendar`, `insights`, `profile`)
- resolving only features already present in the registry

Unsupported or developer-only views remain intentionally unsupported and return `null` in reverse mapping, rather than silently translating to a misleading destination.

# 6. Navigation Service / Controller

The navigation service is intentionally minimal and thin:

```ts
const nav = createCanonicalNavigationController(setCurrentView);
nav.navigate({ type: 'feature', featureId: 'wellness.sleep' });
```

This adapter is the only place where canonical intent is translated to the legacy root navigation API. It does not expose raw `AppView` strings from new call sites. New code may request a canonical destination, but the actual `setCurrentView` call remains behind the adapter boundary.

This preserves the critical migration seam:

```text
Canonical destination
  -> canonical adapter
  -> legacy AppView
  -> existing setCurrentView()
  -> CycleContext.currentView
```

# 7. Registry Integration

The registry remains the source of truth for the pilot feature identity. `src/registry/featureRegistry.ts` already contains the five production wellness features, and the canonical adapter resolves them through that authoritative mapping instead of reinserting the same destination logic in multiple files.

This avoids multiple definitions of the same canonical feature ID and ensures the canonical destination is connected to the existing production feature metadata rather than an invented parallel structure.

# 8. Migrated Pilot Call Sites

The following pilot call sites were migrated to the canonical navigation abstraction where the code was already safely entering the same route:

- `src/components/screens/HarmonizedForecastHomeScreen.tsx`
  - `MEDICATION_TRACKER` -> `wellness.medication`
  - `HYDRATION_TRACKER` -> `wellness.hydration`
  - `PHYSICAL_ACTIVITY` -> `wellness.physicalActivity`
  - safe because the destination is the same verified route and the AppView boundary remains unchanged

- `src/components/screens/ModernizedInsightsScreen.tsx`
  - `SLEEP_INSIGHTS` -> `wellness.sleep`
  - `BODY_METRICS` -> `wellness.bodyMetrics`
  - `PHYSICAL_ACTIVITY` -> `wellness.physicalActivity`
  - safe because they are the already-approved product destinations and the adapter only translates to the same legacy view

These are pilot migrations only. The rest of the 75+ navigation decisions remain untouched and continue to use the legacy `AppView` system.

# 9. Back Navigation Limitation

This phase does not introduce origin-aware history, fake navigation stacks, or a synthesized previous-destination model. Existing behavior continues via the current `onBack` flow and the established root switch.

The canonical layer does not make Back worse, does not fabricate a previous route, and does not add a new hard-coded global Back policy. Browser/history semantics remain intentionally deferred and explicitly documented as a later navigation-phase concern.

# 10. CycleContext Compatibility Boundary

The canonical navigation layer does not remove navigation ownership from `CycleContext` at this stage. The seam remains:

```text
Canonical Navigation Adapter
  -> legacy setCurrentView
  -> CycleContext.currentView
```

This keeps the migration seam explicit and avoids the larger Part 4B extraction effort while proving the new abstraction works with the current legacy state ownership model.

# 11. Access-Control Preservation

The new navigation layer does not bypass the existing Clerk-auth, onboarding, entitlement, or legal/privacy gates. It only expresses destination intent; access enforcement continues to be handled by the established app logic.

This matches the project intent and protects the Part 4A.1 stabilization work. The canonical destination is not an authorization decision. It is simply a typed way to request a given production destination.

# 12. Developer Destination Isolation

Developer-only navigation still remains out of the production canonical layer. The canonical system does not include `KOTLIN_ANDROID_CODE` and the registry remains free of developer-only entries. This keeps the existing Part 4A.1 production isolation intact.

# 13. Tests

Focused tests were added in `src/navigation/canonicalNavigation.test.ts` to verify:

- pilot mapping for `wellness.sleep`, `wellness.hydration`, `wellness.bodyMetrics`, `wellness.physicalActivity`, and `wellness.medication`
- reverse mapping for supported one-to-one routes
- invalid canonical feature ID fails explicitly
- developer destination is rejected
- registry and adapter stay aligned
- the controller translates canonical intent to the legacy `AppView`

# 14. Files Changed

- File: `src/navigation/canonicalNavigation.ts`
  - Reason changed: new canonical destination model, adapter, and small controller for typed pilot navigation.
  - Exact architectural responsibility: compatibility layer between canonical product destination and legacy `AppView`.
  - What was preserved: existing `CycleContext`, existing switch, existing auth gates, screen rendering system, registry model.

- File: `src/navigation/canonicalNavigation.test.ts`
  - Reason changed: verification of pilot mapping, reverse mapping, invalid destination handling, and controller translation.
  - Exact architectural responsibility: regression validation for canonical navigation behavior.
  - What was preserved: real app behavior remains behind the compatibility seam; no full router migration or architecture rewrite is introduced.

- File: `src/components/screens/HarmonizedForecastHomeScreen.tsx`
  - Reason changed: pilot home screen entry points migrated to canonical navigation.
  - Exact architectural responsibility: feature entry from the home screen to the pilot wellness destinations.
  - What was preserved: legacy `AppView` handoff and the root view switch remain the final compatibility boundary.

- File: `src/components/screens/ModernizedInsightsScreen.tsx`
  - Reason changed: pilot wellness destination links migrated away from raw `AppView` strings.
  - Exact architectural responsibility: feature entry from the insights screen to the canonical wellness destinations.
  - What was preserved: same underlying legacy route values, same auth and entitlement gating, and no broader navigation rewrite.

# 15. Validation Evidence

The required single-pass validation was run with the repository’s existing scripts:

```bash
npm test
npm run lint
npm run build
```

Observed evidence:

- `npm test`: 58 test files passed, 373 tests passed
- `npm run lint`: TypeScript verification passed (`tsc --noEmit`)
- `npm run build`: Vite production build succeeded and emitted the bundled server and client assets

Note: jsdom emitted `window.scrollTo` warnings during animation setup, but the suite still completed successfully and no tests failed. This is environmental noise from the motion library in jsdom and is not a production build or app regression.

# 16. Remaining Risks

- The canonical layer is intentionally not yet a complete app router.
- Browser history, deep links, and URL reflection remain deferred.
- Parameterized destinations are not yet introduced because pilot routes do not require them.
- The legacy `AppView` set remains the compatibility contract for the rest of the app.

These are accepted and intentional constraints for this phase.

# 17. Deferred Work

- full origin-aware history and browser stack migration
- deep-link and URL handling
- route-param introduction beyond real required feature usage
- broader conversion of all 75 legacy destinations
- CycleContext extraction
- offline/sync migration
- full router replacement
- Guided Discovery / Explore / LocalStore / SyncEngine work

# 18. Final Verdict

PART 4A.2 APPROVED
