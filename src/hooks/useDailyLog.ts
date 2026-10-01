import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useCycle } from '../context/CycleContext';
import { useSupabase } from './useSupabase';

export function useDailyLog() {
  const { userId } = useAuth();
  const { saveDayLog, dayLogs, settings } = useCycle();
  const supabase = useSupabase();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logDay = useCallback(
    async (
      date: string,
      entry: {
        flow?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
        cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'egg_white' | null;
        bbt?: number | null;
        moods?: string[];
        symptoms?: string[];
        notes?: string;
      }
    ) => {
      setIsSaving(true);
      setError(null);
      try {
        // 1. Update local state context
        saveDayLog(date, entry);

        // 2. Sync to Supabase if authenticated
        if (userId) {
          await supabase.from('daily_logs').upsert(
            {
              clerk_user_id: userId,
              log_date: date,
              flow: entry.flow || null,
              cervical_mucus: entry.cervicalMucus || null,
              bbt: entry.bbt || null,
              moods: entry.moods || [],
              symptoms: entry.symptoms || [],
              notes: entry.notes || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'clerk_user_id,log_date' }
          );
        }
      } catch (err: any) {
        console.error('useDailyLog error:', err);
        setError(err?.message || 'Failed to save log');
      } finally {
        setIsSaving(false);
      }
    },
    [supabase, userId, saveDayLog]
  );

  return {
    logDay,
    dayLogs,
    isSaving,
    error,
  };
}
