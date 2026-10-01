import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.EXPO_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  'https://mbruxnggsbhsbboplhai.supabase.co';

const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && (process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY)) ||
  'sb_publishable_J3Q6wKnPzmcHDI7AMdJrwQ_9WOFlMlN';

/**
 * DEPRECATED — do not import this.
 *
 * This anonymous client has no Clerk access token and will fail any
 * Supabase call that requires authentication (RLS policies reject it).
 * All hooks now use `useSupabase()` from `../hooks/useSupabase` which
 * provides a client configured with Clerk's `getToken` callback.
 *
 * import { supabase } from '../lib/supabase';  ← DON'T DO THIS
 * const { supabase } = useSupabase();          ← DO THIS INSTEAD
 */

/**
 * Creates a Supabase client that authenticates with a Clerk JWT.
 * Pass the `getToken` function from Clerk's `useAuth()` hook.
 */
export function createSupabaseClient(
  getToken: (opts?: { template?: string }) => Promise<string | null>
): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    accessToken: async () => {
      const token = await getToken();
      return token ?? null;
    },
  });
}

/**
 * Calls a Supabase Edge Function with Clerk auth.
 */
export async function callEdgeFunction(
  client: SupabaseClient,
  functionName: string,
  body?: Record<string, unknown>
) {
  const { data, error } = await client.functions.invoke(functionName, {
    body: body ?? {},
  });
  if (error) throw error;
  return data;
}

