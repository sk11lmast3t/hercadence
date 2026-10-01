import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from './useSupabase';

interface PartnerConnection {
  id?: string;
  partner_clerk_user_id: string;
  partner_name?: string;
  share_phase: boolean;
  share_symptoms: boolean;
  share_moods: boolean;
  share_notes: boolean;
}

/**
 * Partner sharing consent and permissions hook.
 */
export function usePartnerPermissions() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const [connection, setConnection] = useState<PartnerConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('partner_connections')
        .select('*, partner_permissions(*)')
        .maybeSingle();
      if (error) throw error;
      setConnection(data ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const save = useCallback(async (perms: Partial<PartnerConnection>) => {
    setError(null);
    try {
      if (!userId) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('partner_connections')
        .upsert({ ...perms, clerk_user_id: userId }, { onConflict: 'clerk_user_id' })
        .select()
        .single();
      if (error) throw error;
      setConnection(data);
      return data;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [supabase, userId]);

  const disconnect = useCallback(async () => {
    if (!connection?.id) return;
    setError(null);
    try {
      const { error } = await supabase
        .from('partner_connections')
        .delete()
        .eq('id', connection.id);
      if (error) throw error;
      setConnection(null);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [supabase, connection]);

  return { connection, isLoading, error, load, save, disconnect };
}
