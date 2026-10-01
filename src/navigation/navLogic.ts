/**
 * navLogic.ts — Pure navigation-gate functions extracted from App.tsx.
 *
 * These are the exact decision functions used inside MainAppContent.
 * Keeping them as standalone pure functions makes them unit-testable without
 * mounting React or mocking Clerk.
 *
 * DO NOT add side effects here. Do NOT import React or Clerk.
 * This module belongs to the 4A.1 stabilization phase only; it will be
 * superseded when the canonical router is introduced.
 */

import { AppView } from '../types';

// ── Constants (mirrored from App.tsx) ─────────────────────────────────────────

/** Views reachable by signed-out users without being redirected to LOGIN_GATEWAY. */
export const PUBLIC_VIEWS: readonly AppView[] = [
  'ONBOARDING_WELCOME',
  'INITIAL_BASELINE_SETUP',
  'LOGIN_GATEWAY',
] as const;

/**
 * Views that are allowed while the user is authenticated but not yet entitled.
 * Mirrored exactly from the UNENTITLED_ALLOWLIST in App.tsx.
 */
export const UNENTITLED_ALLOWLIST: readonly AppView[] = [
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
] as const;

/**
 * Views that are not valid post-authentication destinations.
 * When sign-in completes with the user sitting on one of these views,
 * the navigation system falls back to HOME rather than restoring it.
 * Mirrored exactly from SIGNIN_ORIGIN_DISCARD in App.tsx.
 */
export const SIGNIN_ORIGIN_DISCARD: readonly AppView[] = [
  'LOGIN_GATEWAY',
  'ONBOARDING_WELCOME',
  'ONBOARDING_UNDERSTOOD',
  'ONBOARDING_TRACK_EASE',
  'ONBOARDING_SUCCESS',
  'INITIAL_BASELINE_SETUP',
  'FORGOT_PASSWORD',
] as const;

/**
 * Developer-only destinations that must not appear in the production screen
 * directory. Mirrored exactly from DEV_ONLY_VIEWS in ScreenDirectoryModal.tsx.
 */
export const DEV_ONLY_VIEWS: readonly AppView[] = [
  'KOTLIN_ANDROID_CODE',
] as const;

// ── Pure gate functions ────────────────────────────────────────────────────────

export interface EffectiveViewParams {
  isLoaded: boolean;
  isSignedIn: boolean;
  isEntitlementLoading: boolean;
  isPremium: boolean;
  currentView: AppView;
}

/**
 * Computes the effective view to render given the current auth + entitlement
 * state and the requested currentView.
 *
 * Exact mirror of the effectiveView useMemo in MainAppContent (App.tsx).
 */
export function computeEffectiveView({
  isLoaded,
  isSignedIn,
  isEntitlementLoading,
  isPremium,
  currentView,
}: EffectiveViewParams): AppView {
  // Fail closed while Clerk auth state is unresolved.
  if (!isLoaded) return 'LOGIN_GATEWAY';

  // Signed-out users are redirected to LOGIN_GATEWAY for all protected views.
  if (!isSignedIn && !(PUBLIC_VIEWS as readonly string[]).includes(currentView)) {
    return 'LOGIN_GATEWAY';
  }

  // Authenticated users who are not entitled are redirected to TRIAL_PAYWALL
  // for views that require entitlement.
  if (
    isSignedIn &&
    !isEntitlementLoading &&
    !isPremium &&
    !(UNENTITLED_ALLOWLIST as readonly string[]).includes(currentView)
  ) {
    return 'TRIAL_PAYWALL';
  }

  return currentView;
}

/**
 * Computes the navigation destination after successful sign-in.
 *
 * Exact mirror of the destination logic in the finally block of the
 * complete-onboarding effect in MainAppContent (App.tsx).
 *
 * @param capturedView  The AppView that was active at the moment the auth
 *                      state resolved to signed-in.
 * @returns The view to navigate to: the captured view if it is recoverable,
 *          otherwise 'HOME'.
 */
export function computePostSignInDestination(capturedView: AppView): AppView {
  if ((SIGNIN_ORIGIN_DISCARD as readonly string[]).includes(capturedView)) {
    return 'HOME';
  }
  return capturedView;
}

/**
 * Returns true if the given view is a developer-only destination that must be
 * hidden from the production screen directory.
 */
export function isDevOnlyView(view: AppView): boolean {
  return (DEV_ONLY_VIEWS as readonly string[]).includes(view);
}
