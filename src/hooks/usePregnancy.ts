import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from './useSupabase';

interface PregnancyProfile {
  id?: string;
  lmp_date: string;
  due_date?: string;
  week_number?: number;
  notes?: string;
}

interface PregnancyState {
  profile: PregnancyProfile | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Pregnancy mode hook — loads and upserts pregnancy profile from Supabase.
 * Due date is auto-computed server-side by the set_pregnancy_due_date trigger.
 * Always returns isEstimate: true + disclaimer.
 */
export function usePregnancy() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const [state, setState] = useState<PregnancyState>({
    profile: null,
    isLoading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase
        .from('pregnancies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      setState({ profile: data ?? null, isLoading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: (err as Error).message }));
    }
  }, [supabase]);

  const save = useCallback(async (lmpDate: string, notes?: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      if (!userId) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('pregnancies')
        .upsert(
          { clerk_user_id: userId, lmp_date: lmpDate, notes: notes ?? null },
          { onConflict: 'clerk_user_id' }
        )
        .select()
        .single();
      if (error) throw error;
      setState({ profile: data, isLoading: false, error: null });
      return data;
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: (err as Error).message }));
      throw err;
    }
  }, [supabase, userId]);

  return {
    ...state,
    load,
    save,
    isEstimate: true as const,
    disclaimer:
      'Pregnancy week estimates are based on your last menstrual period (LMP) date and are approximate. Consult your healthcare provider.',
  };
}
