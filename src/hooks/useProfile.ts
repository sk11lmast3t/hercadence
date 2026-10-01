import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useCycle } from '../context/CycleContext';
import { useSupabase } from './useSupabase';
import { UserSettings } from '../types';

export function useProfile() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const { settings, updateSettings } = useCycle();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      if (userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          updateSettings({
            userName: data.user_name || settings.userName,
            email: data.email || settings.email,
            cycleLengthDays: data.cycle_length_days || 28,
            periodLengthDays: data.period_length_days || 5,
            lutealPhaseDays: data.luteal_phase_days || 14,
            temperatureUnit: data.temperature_unit || 'Celsius',
            weightUnit: data.weight_unit || 'kg',
          });
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId, settings.userName, settings.email, updateSettings]);

  const saveProfile = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      updateSettings(newSettings);
      try {
        if (userId) {
          await supabase.from('profiles').upsert(
            {
              clerk_user_id: userId,
              user_name: newSettings.userName,
              email: newSettings.email,
              cycle_length_days: newSettings.cycleLengthDays,
              period_length_days: newSettings.periodLengthDays,
              luteal_phase_days: newSettings.lutealPhaseDays,
              temperature_unit: newSettings.temperatureUnit,
              weight_unit: newSettings.weightUnit,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'clerk_user_id' }
          );
        }
      } catch (err: any) {
        console.error('saveProfile error:', err);
      }
    },
    [supabase, userId, updateSettings]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile: settings,
    isLoading,
    error,
    saveProfile,
    refetch: fetchProfile,
  };
}
