import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '../lib/supabase';
import { useMemo, useCallback } from 'react';

/**
 * Returns a Supabase client authenticated with the current Clerk JWT.
 * Memoized so child hooks share a single instance per render cycle.
 */
export function useSupabase() {
  const { getToken } = useAuth();
  const supabase = useMemo(() => createSupabaseClient(getToken), [getToken]);
  return supabase;
}

/**
 * Calls a Supabase Edge Function with the current Clerk session.
 */
export function useEdgeFunction() {
  const supabase = useSupabase();

  const invoke = useCallback(
    async <T = unknown>(functionName: string, body?: Record<string, unknown>): Promise<T> => {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: body ?? {},
      });
      if (error) throw error;
      return data as T;
    },
    [supabase]
  );

  return { invoke, supabase };
}
