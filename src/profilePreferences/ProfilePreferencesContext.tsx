/**
 * ProfilePreferencesContext.tsx
 *
 * Single-owner slice for the 10 profile + simple-preference fields extracted
 * from CycleContext.
 *
 * OWNED FIELDS (exactly these 10):
 *   userName, email, avatarUrl,
 *   temperatureUnit, weightUnit,
 *   startDayOfWeek, showWeekNumbers,
 *   language, region, selectedGoal
 *
 * INVARIANT: This is the ONE mutable owner of these fields. CycleContext
 * composes them into its `settings` shape for existing consumers but owns
 * NOTHING for these 10 fields — it only reads from here.
 *
 * STORAGE: This slice reads initial values from the existing
 * `cycle_tracker_user_settings` localStorage key on first mount (picking only
 * the 10 owned fields). It performs NO writes itself; CycleContext's single
 * persistence effect continues to write the fully-composed settings object.
 */

import React, { createContext, useContext, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProfilePreferences {
  userName: string;
  email: string;
  avatarUrl: string;
  temperatureUnit: 'Celsius' | 'Fahrenheit';
  weightUnit: 'kg' | 'lb';
  startDayOfWeek: 'Sunday' | 'Monday';
  showWeekNumbers: boolean;
  language: string;
  region: string;
  selectedGoal: 'PERIOD' | 'OVULATION' | 'PREGNANCY' | 'WELLNESS';
}

interface ProfilePreferencesContextType {
  profilePreferences: ProfilePreferences;
  updateProfilePreferences: (patch: Partial<ProfilePreferences>) => void;
}

// ── Defaults (mirror initialSettings in CycleContext for the 10 owned fields) ─

export const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  userName: '',
  email: '',
  avatarUrl: '',
  temperatureUnit: 'Celsius',
  weightUnit: 'kg',
  startDayOfWeek: 'Sunday',
  showWeekNumbers: true,
  language: 'English (US)',
  region: 'United States',
  selectedGoal: 'PERIOD',
};

// ── Storage key (shared with CycleContext — read-only here) ───────────────────

const STORAGE_KEY_SETTINGS = 'cycle_tracker_user_settings';

/**
 * Pick only the 10 owned fields from a raw stored settings object.
 * Falls back to defaults for any missing/invalid field.
 */
function pickProfilePreferences(raw: Record<string, unknown>): ProfilePreferences {
  return {
    userName:
      typeof raw.userName === 'string' ? raw.userName : DEFAULT_PROFILE_PREFERENCES.userName,
    email:
      typeof raw.email === 'string' ? raw.email : DEFAULT_PROFILE_PREFERENCES.email,
    avatarUrl:
      typeof raw.avatarUrl === 'string' ? raw.avatarUrl : DEFAULT_PROFILE_PREFERENCES.avatarUrl,
    temperatureUnit:
      raw.temperatureUnit === 'Celsius' || raw.temperatureUnit === 'Fahrenheit'
        ? raw.temperatureUnit
        : DEFAULT_PROFILE_PREFERENCES.temperatureUnit,
    weightUnit:
      raw.weightUnit === 'kg' || raw.weightUnit === 'lb'
        ? raw.weightUnit
        : DEFAULT_PROFILE_PREFERENCES.weightUnit,
    startDayOfWeek:
      raw.startDayOfWeek === 'Sunday' || raw.startDayOfWeek === 'Monday'
        ? raw.startDayOfWeek
        : DEFAULT_PROFILE_PREFERENCES.startDayOfWeek,
    showWeekNumbers:
      typeof raw.showWeekNumbers === 'boolean'
        ? raw.showWeekNumbers
        : DEFAULT_PROFILE_PREFERENCES.showWeekNumbers,
    language:
      typeof raw.language === 'string' && raw.language !== ''
        ? raw.language
        : DEFAULT_PROFILE_PREFERENCES.language,
    region:
      typeof raw.region === 'string' && raw.region !== ''
        ? raw.region
        : DEFAULT_PROFILE_PREFERENCES.region,
    selectedGoal:
      raw.selectedGoal === 'PERIOD' ||
      raw.selectedGoal === 'OVULATION' ||
      raw.selectedGoal === 'PREGNANCY' ||
      raw.selectedGoal === 'WELLNESS'
        ? raw.selectedGoal
        : DEFAULT_PROFILE_PREFERENCES.selectedGoal,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

const ProfilePreferencesContext = createContext<ProfilePreferencesContextType | undefined>(
  undefined
);

// ── Provider ──────────────────────────────────────────────────────────────────

export const ProfilePreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profilePreferences, setProfilePreferences] = useState<ProfilePreferences>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return pickProfilePreferences(parsed);
      }
    } catch {
      // Corrupt storage — fall through to defaults
    }
    return DEFAULT_PROFILE_PREFERENCES;
  });

  const updateProfilePreferences = (patch: Partial<ProfilePreferences>) => {
    setProfilePreferences(prev => ({ ...prev, ...patch }));
  };

  return (
    <ProfilePreferencesContext.Provider value={{ profilePreferences, updateProfilePreferences }}>
      {children}
    </ProfilePreferencesContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useProfilePreferences = (): ProfilePreferencesContextType => {
  const ctx = useContext(ProfilePreferencesContext);
  if (!ctx) {
    throw new Error('useProfilePreferences must be used within a ProfilePreferencesProvider');
  }
  return ctx;
};
