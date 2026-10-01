import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useCycle } from '../context/CycleContext';
import { useSupabase } from './useSupabase';

export function useNotificationPreferences() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const { settings, updateSettings } = useCycle();
  const [isUpdating, setIsUpdating] = useState(false);

  const savePreferences = useCallback(
    async (newPrefs: Partial<typeof settings.notifications>) => {
      const updated = { ...settings.notifications, ...newPrefs };
      updateSettings({ notifications: updated });
      setIsUpdating(true);

      try {
        if (userId) {
          await supabase.from('notification_preferences').upsert(
            {
              clerk_user_id: userId,
              period_reminders: updated.periodReminders,
              fertile_alerts: updated.fertileWindowAlerts,
              pill_reminders: updated.pillReminders,
              daily_prompt: updated.dailyLogPrompt,
            },
            { onConflict: 'clerk_user_id' }
          );
        }
      } catch (err) {
        console.error('savePreferences error:', err);
      } finally {
        setIsUpdating(false);
      }
    },
    [supabase, userId, settings.notifications, updateSettings]
  );

  const registerDeviceToken = useCallback(
    async (token: string, platform: 'ios' | 'android') => {
      try {
        if (userId) {
          await supabase.from('device_tokens').upsert(
            {
              clerk_user_id: userId,
              token,
              platform,
            },
            { onConflict: 'clerk_user_id,token' }
          );
        }
      } catch (err) {
        console.error('registerDeviceToken error:', err);
      }
    },
    [supabase, userId]
  );

  return {
    notifications: settings.notifications,
    savePreferences,
    registerDeviceToken,
    isUpdating,
  };
}
