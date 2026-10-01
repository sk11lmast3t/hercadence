/**
 * navLogic.test.ts — Characterization tests for Part 4A.1 Navigation Integrity.
 *
 * These tests describe and lock the current intended behavior of the navigation
 * gate established in the 4A.1 stabilization phase. They are NOT end-to-end
 * tests; they exercise pure logic extracted into navLogic.ts so that:
 *
 *   1. No React component mounting is required.
 *   2. No Clerk mock is required.
 *   3. They run in < 50 ms with zero I/O.
 *
 * REGRESSION NOTICE: Do not alter these tests to make failing source code pass.
 * If a test fails, fix the source. Existing tests encode the required behavior.
 *
 * Coverage:
 *   A. Clerk loading state — protected content is blocked while isLoaded=false
 *   B. Auth gate — every AppView redirects to LOGIN_GATEWAY when signed out,
 *      except the documented PUBLIC_VIEWS allowlist
 *   C. Entitlement gate — authenticated users without entitlement see TRIAL_PAYWALL
 *      except the documented UNENTITLED_ALLOWLIST
 *   D. Sign-in navigation — successful auth preserves recoverable intent
 *   E. Developer directory isolation — KOTLIN_ANDROID_CODE not reachable in production
 */

import { describe, it, expect } from 'vitest';
import {
  computeEffectiveView,
  computePostSignInDestination,
  isDevOnlyView,
  PUBLIC_VIEWS,
  UNENTITLED_ALLOWLIST,
  SIGNIN_ORIGIN_DISCARD,
  DEV_ONLY_VIEWS,
} from './navLogic';
import { AppView } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** All AppView values — derived from the canonical type so the test stays in sync. */
const ALL_VIEWS: AppView[] = [
  'HOME',
  'CALENDAR',
  'INSIGHTS',
  'PROFILE',
  'CLASSIC_HOME',
  'CLASSIC_INSIGHTS',
  'CLASSIC_PROFILE',
  'BBT_LOG',
  'BIRTH_CONTROL',
  'PARTNER_SYNC',
  'PASSCODE_LOCK',
  'PREMIUM',
  'APPOINTMENT_DETAIL',
  'DOCTORS_CARE_TEAM',
  'EMERGENCY_HELP',
  'EXPORT_HEALTH_REPORT',
  'EXPORT_SUCCESS',
  'FERTILITY_DETAIL',
  'CONNECTED_DEVICES',
  'HARMONIZED_DASHBOARD',
  'HARMONIZED_HOME',
  'HARMONIZED_CALENDAR',
  'HARMONIZED_INSIGHTS',
  'CUSTOM_TAGS',
  'HEALTH_PROFILE',
  'NOTIFICATIONS',
  'VIDEO_LIBRARY',
  'LUTEAL_ARTICLE',
  'PERSONALIZED_INSIGHTS',
  'COMMUNITY',
  'CREATE_POST',
  'POST_DETAIL',
  'FEELING_TODAY',
  'APP_PREFERENCES',
  'ONBOARDING_WELCOME',
  'ONBOARDING_UNDERSTOOD',
  'ONBOARDING_TRACK_EASE',
  'ONBOARDING_SUCCESS',
  'LOGIN_GATEWAY',
  'MEDICATION_TRACKER',
  'HYDRATION_TRACKER',
  'MEDICATION_HISTORY',
  'WELLNESS_REMINDERS_PERMISSION',
  'MUCUS_LOG',
  'NUTRITION_CYCLE',
  'PARTNER_SYNC_DETAILS',
  'PHYSICAL_ACTIVITY',
  'PREGNANCY_MODE',
  'DATA_PRIVACY_SECURITY',
  'SEARCH_HUB',
  'SYMPTOM_HISTORY',
  'SLEEP_INSIGHTS',
  'SUPPLEMENT_TRACKER',
  'SUPPORT_FAQ',
  'BODY_METRICS',
  'SYMPTOM_INTENSITY_LOG',
  'DELETE_ACCOUNT',
  'FORGOT_PASSWORD',
  'EDIT_PROFILE',
  'NOTIFICATION_INBOX',
  'OFFLINE_SYNC',
  'NOT_FOUND_404',
  'TRIAL_PAYWALL',
  'MANAGE_BILLING',
  'APP_REVIEW',
  'WHATS_NEW',
  'TERMS_CLINICAL_DISCLAIMER',
  'FOCUS_ENERGY_TRACKER',
  'PHYSICAL_COMFORT_TRACKER',
  'INITIAL_BASELINE_SETUP',
  'KOTLIN_ANDROID_CODE',
  'CYCLE_AI_ASSISTANT',
  'CYCLE_SYNCED_FITNESS',
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
];

// ── A. Clerk loading state ────────────────────────────────────────────────────

describe('A. Clerk loading state', () => {
  it('returns LOGIN_GATEWAY for every view while isLoaded is false', () => {
    for (const view of ALL_VIEWS) {
      const result = computeEffectiveView({
        isLoaded: false,
        isSignedIn: false,
        isEntitlementLoading: false,
        isPremium: false,
        currentView: view,
      });
      expect(result, `isLoaded=false, currentView=${view}`).toBe('LOGIN_GATEWAY');
    }
  });

  it('returns LOGIN_GATEWAY even if isSignedIn would be true while isLoaded is false', () => {
    // This guards the specific pre-auth HOME render window identified in the preflight.
    const result = computeEffectiveView({
      isLoaded: false,
      isSignedIn: true,   // hypothetical — Clerk should not emit this combination
      isEntitlementLoading: false,
      isPremium: true,
      currentView: 'HOME',
    });
    expect(result).toBe('LOGIN_GATEWAY');
  });

  it('does NOT return LOGIN_GATEWAY for HOME once isLoaded becomes true and user is signed in', () => {
    const result = computeEffectiveView({
      isLoaded: true,
      isSignedIn: true,
      isEntitlementLoading: false,
      isPremium: true,
      currentView: 'HOME',
    });
    expect(result).toBe('HOME');
  });
});

// ── B. Auth gate — signed-out behavior ───────────────────────────────────────

describe('B. Auth gate — signed-out users', () => {
  const signedOut = (view: AppView) =>
    computeEffectiveView({
      isLoaded: true,
      isSignedIn: false,
      isEntitlementLoading: false,
      isPremium: false,
      currentView: view,
    });

  it('redirects every non-public view to LOGIN_GATEWAY when signed out', () => {
    const protectedViews = ALL_VIEWS.filter(
      (v) => !(PUBLIC_VIEWS as readonly string[]).includes(v)
    );

    for (const view of protectedViews) {
      expect(signedOut(view), `signed-out redirect for ${view}`).toBe('LOGIN_GATEWAY');
    }
  });

  it('allows exactly the PUBLIC_VIEWS allowlist when signed out', () => {
    // Exact allowlist assertion — do not silently extend this.
    const expectedPublicViews: AppView[] = [
      'ONBOARDING_WELCOME',
      'INITIAL_BASELINE_SETUP',
      'LOGIN_GATEWAY',
    ];

    // Every expected public view must be reachable.
    for (const view of expectedPublicViews) {
      expect(signedOut(view), `public view ${view} should be reachable signed-out`).toBe(view);
    }

    // The public allowlist must not contain any view beyond the expected set.
    // This prevents silent additions to PUBLIC_VIEWS from bypassing the auth gate.
    expect([...PUBLIC_VIEWS].sort()).toEqual([...expectedPublicViews].sort());
  });

  it('sends HOME to LOGIN_GATEWAY when signed out', () => {
    // Regression: the specific view that was previously rendered before auth resolved.
    expect(signedOut('HOME')).toBe('LOGIN_GATEWAY');
  });

  it('sends PROFILE to LOGIN_GATEWAY when signed out', () => {
    expect(signedOut('PROFILE')).toBe('LOGIN_GATEWAY');
  });

  it('sends CALENDAR to LOGIN_GATEWAY when signed out', () => {
    expect(signedOut('CALENDAR')).toBe('LOGIN_GATEWAY');
  });

  it('keeps LOGIN_GATEWAY as LOGIN_GATEWAY when signed out', () => {
    expect(signedOut('LOGIN_GATEWAY')).toBe('LOGIN_GATEWAY');
  });
});

// ── C. Entitlement gate ───────────────────────────────────────────────────────

describe('C. Entitlement gate — authenticated users', () => {
  const withEntitlement = (view: AppView, isPremium: boolean, isEntitlementLoading = false) =>
    computeEffectiveView({
      isLoaded: true,
      isSignedIn: true,
      isEntitlementLoading,
      isPremium,
      currentView: view,
    });

  it('allows HOME when authenticated and entitled', () => {
    expect(withEntitlement('HOME', true)).toBe('HOME');
  });

  it('allows PROFILE when authenticated and entitled', () => {
    expect(withEntitlement('PROFILE', true)).toBe('PROFILE');
  });

  it('redirects HOME to TRIAL_PAYWALL when authenticated but not entitled', () => {
    expect(withEntitlement('HOME', false)).toBe('TRIAL_PAYWALL');
  });

  it('redirects CALENDAR to TRIAL_PAYWALL when not entitled', () => {
    expect(withEntitlement('CALENDAR', false)).toBe('TRIAL_PAYWALL');
  });

  it('does NOT redirect to TRIAL_PAYWALL while entitlement is still loading', () => {
    // The loading=true state must not flash TRIAL_PAYWALL before the check completes.
    const result = withEntitlement('HOME', false, /* isEntitlementLoading */ true);
    expect(result).toBe('HOME');
  });

  it('server entitlement (isPremium) is the authoritative gate — settings.isPremium is not tested here', () => {
    // This test documents intent: we use the server-side isPremium from
    // usePremiumEntitlement, not settings.isPremium from localStorage.
    // The gate correctly redirects when isPremium=false even if a local
    // settings flag might claim otherwise.
    expect(withEntitlement('INSIGHTS', false)).toBe('TRIAL_PAYWALL');
    expect(withEntitlement('INSIGHTS', true)).toBe('INSIGHTS');
  });

  it('allows every UNENTITLED_ALLOWLIST view when not entitled', () => {
    for (const view of UNENTITLED_ALLOWLIST) {
      expect(
        withEntitlement(view, false),
        `unentitled allowlist view ${view} should be reachable`
      ).toBe(view);
    }
  });

  it('UNENTITLED_ALLOWLIST is exactly the documented set — do not silently extend it', () => {
    const expectedAllowlist: AppView[] = [
      'TRIAL_PAYWALL',
      'PREMIUM',
      'MANAGE_BILLING',
      'DELETE_ACCOUNT',
      'TERMS_OF_SERVICE',
      'PRIVACY_POLICY',
      'TERMS_CLINICAL_DISCLAIMER',
      'DATA_PRIVACY_SECURITY',
      'PASSCODE_LOCK',
      'LOGIN_GATEWAY',
      'ONBOARDING_WELCOME',
      'INITIAL_BASELINE_SETUP',
      'ONBOARDING_SUCCESS',
      'FORGOT_PASSWORD',
    ];
    expect([...UNENTITLED_ALLOWLIST].sort()).toEqual([...expectedAllowlist].sort());
  });
});

// ── D. Sign-in navigation — preserve recoverable intent ──────────────────────

describe('D. Sign-in navigation — post-sign-in destination', () => {
  it('returns the captured view unchanged when it is a recoverable destination', () => {
    const recoverableViews: AppView[] = [
      'HOME',
      'CALENDAR',
      'INSIGHTS',
      'PROFILE',
      'SLEEP_INSIGHTS',
      'BODY_METRICS',
      'MEDICATION_TRACKER',
      'HYDRATION_TRACKER',
      'COMMUNITY',
    ];
    for (const view of recoverableViews) {
      expect(
        computePostSignInDestination(view),
        `recoverable view ${view} should be preserved`
      ).toBe(view);
    }
  });

  it('falls back to HOME when captured view is LOGIN_GATEWAY', () => {
    // The most common case: user was on the login screen when they signed in.
    expect(computePostSignInDestination('LOGIN_GATEWAY')).toBe('HOME');
  });

  it('falls back to HOME for every SIGNIN_ORIGIN_DISCARD view', () => {
    for (const view of SIGNIN_ORIGIN_DISCARD) {
      expect(
        computePostSignInDestination(view),
        `discard view ${view} should fall back to HOME`
      ).toBe('HOME');
    }
  });

  it('SIGNIN_ORIGIN_DISCARD is exactly the documented set', () => {
    // Regression: do not silently add non-onboarding destinations to the discard list.
    const expectedDiscard: AppView[] = [
      'LOGIN_GATEWAY',
      'ONBOARDING_WELCOME',
      'ONBOARDING_UNDERSTOOD',
      'ONBOARDING_TRACK_EASE',
      'ONBOARDING_SUCCESS',
      'INITIAL_BASELINE_SETUP',
      'FORGOT_PASSWORD',
    ];
    expect([...SIGNIN_ORIGIN_DISCARD].sort()).toEqual([...expectedDiscard].sort());
  });

  it('does NOT unconditionally navigate to HOME when a non-auth destination is captured', () => {
    // Regression test for the original defect: the old code always called
    // setCurrentView('HOME') in the finally block regardless of where the user was.
    const wasOnCalendar = computePostSignInDestination('CALENDAR');
    expect(wasOnCalendar).not.toBe('HOME');
    expect(wasOnCalendar).toBe('CALENDAR');
  });

  it('does NOT unconditionally navigate to HOME when user was on INSIGHTS', () => {
    const wasOnInsights = computePostSignInDestination('INSIGHTS');
    expect(wasOnInsights).not.toBe('HOME');
    expect(wasOnInsights).toBe('INSIGHTS');
  });
});

// ── E. Developer directory isolation ─────────────────────────────────────────

describe('E. Developer directory isolation', () => {
  it('KOTLIN_ANDROID_CODE is a dev-only view', () => {
    expect(isDevOnlyView('KOTLIN_ANDROID_CODE')).toBe(true);
  });

  it('DEV_ONLY_VIEWS is exactly the documented set', () => {
    // Regression: lock the exact set so production exposure is auditable.
    const expectedDevOnly: AppView[] = ['KOTLIN_ANDROID_CODE'];
    expect([...DEV_ONLY_VIEWS].sort()).toEqual([...expectedDevOnly].sort());
  });

  it('production screen directory does NOT include KOTLIN_ANDROID_CODE', () => {
    // Simulate the filter applied by ScreenDirectoryModal when import.meta.env.DEV is false.
    // We model the production filter directly here without mounting the modal.
    const isDevEnv = false; // production
    const allScreenIds: AppView[] = ALL_VIEWS;

    const productionScreenIds = allScreenIds.filter((id) => {
      if (!isDevEnv && isDevOnlyView(id)) return false;
      return true;
    });

    expect(productionScreenIds).not.toContain('KOTLIN_ANDROID_CODE');
  });

  it('development screen directory DOES include KOTLIN_ANDROID_CODE', () => {
    const isDevEnv = true;
    const allScreenIds: AppView[] = ALL_VIEWS;

    const devScreenIds = allScreenIds.filter((id) => {
      if (!isDevEnv && isDevOnlyView(id)) return false;
      return true;
    });

    expect(devScreenIds).toContain('KOTLIN_ANDROID_CODE');
  });

  it('production directory includes genuine production destinations', () => {
    const isDevEnv = false;
    const productionScreenIds = ALL_VIEWS.filter((id) => {
      if (!isDevEnv && isDevOnlyView(id)) return false;
      return true;
    });

    // Spot-check that key production views are not accidentally removed.
    const mustInclude: AppView[] = [
      'HOME', 'CALENDAR', 'INSIGHTS', 'PROFILE',
      'MEDICATION_TRACKER', 'HYDRATION_TRACKER', 'SLEEP_INSIGHTS',
      'BODY_METRICS', 'PHYSICAL_ACTIVITY', 'COMMUNITY',
    ];
    for (const view of mustInclude) {
      expect(productionScreenIds, `production should include ${view}`).toContain(view);
    }
  });

  it('KOTLIN_ANDROID_CODE is not reachable via the auth gate in production', () => {
    // Even if someone manually sets currentView to KOTLIN_ANDROID_CODE,
    // the auth gate itself does not block it (it is a protected view requiring sign-in).
    // The protection is the directory filter + the switch-case guard in App.tsx.
    // This test documents that KOTLIN_ANDROID_CODE requires authentication at minimum.
    const signedOut = computeEffectiveView({
      isLoaded: true,
      isSignedIn: false,
      isEntitlementLoading: false,
      isPremium: false,
      currentView: 'KOTLIN_ANDROID_CODE',
    });
    expect(signedOut).toBe('LOGIN_GATEWAY');
  });
});

// ── F. Combined gate ordering ─────────────────────────────────────────────────

describe('F. Gate ordering — isLoaded check takes absolute precedence', () => {
  it('loading gate fires before auth gate', () => {
    // Even with isSignedIn=true, isLoaded=false must win.
    expect(
      computeEffectiveView({
        isLoaded: false,
        isSignedIn: true,
        isEntitlementLoading: false,
        isPremium: true,
        currentView: 'HOME',
      })
    ).toBe('LOGIN_GATEWAY');
  });

  it('loading gate fires before entitlement gate', () => {
    expect(
      computeEffectiveView({
        isLoaded: false,
        isSignedIn: true,
        isEntitlementLoading: false,
        isPremium: false,
        currentView: 'INSIGHTS',
      })
    ).toBe('LOGIN_GATEWAY');
  });

  it('auth gate fires before entitlement gate', () => {
    // Signed out + not entitled — auth gate should handle it (LOGIN_GATEWAY, not TRIAL_PAYWALL).
    expect(
      computeEffectiveView({
        isLoaded: true,
        isSignedIn: false,
        isEntitlementLoading: false,
        isPremium: false,
        currentView: 'INSIGHTS',
      })
    ).toBe('LOGIN_GATEWAY');
  });
});
