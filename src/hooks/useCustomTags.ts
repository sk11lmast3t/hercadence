// src/hooks/useCustomTags.ts
// Reads and writes custom_tags for the signed-in Clerk user.

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from './useSupabase';

export interface CustomTag {
  id: string;
  name: string;
  category: 'symptom' | 'mood' | 'activity' | 'medication' | 'other';
  color?: string;
  icon?: string;
  isActive: boolean;
}

export function useCustomTags() {
  const supabase = useSupabase();
  const { userId } = useAuth();

  const [tags, setTags] = useState<CustomTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('custom_tags')
        .select('*')
        .eq('clerk_user_id', userId)
        .order('name', { ascending: true });

      if (fetchErr) throw fetchErr;

      setTags(
        (data ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          color: t.color ?? undefined,
          icon: t.icon ?? undefined,
          isActive: t.is_active ?? true,
        }))
      );
    } catch (err: any) {
      console.error('useCustomTags.fetchTags error:', err);
      setError(err?.message || 'Failed to load custom tags');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = useCallback(
    async (
      name: string,
      category: 'symptom' | 'mood' | 'activity' | 'medication' | 'other',
      color?: string,
      icon?: string
    ) => {
      if (!userId) {
        setError('Not authenticated');
        return null;
      }
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: insertErr } = await supabase
          .from('custom_tags')
          .insert({
            clerk_user_id: userId,
            name: name.trim(),
            category,
            color: color || null,
            icon: icon || null,
            is_active: true,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        const newTag: CustomTag = {
          id: data.id,
          name: data.name,
          category: data.category,
          color: data.color || undefined,
          icon: data.icon || undefined,
          isActive: data.is_active,
        };

        setTags((prev) => [...prev, newTag]);
        return newTag;
      } catch (err: any) {
        console.error('useCustomTags.addTag error:', err);
        setError(err?.message || 'Failed to add custom tag');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, userId]
  );

  const removeTag = useCallback(
    async (id: string) => {
      if (!userId) {
        setError('Not authenticated');
        return false;
      }
      setIsLoading(true);
      setError(null);
      try {
        const { error: delErr } = await supabase
          .from('custom_tags')
          .delete()
          .eq('id', id)
          .eq('clerk_user_id', userId);

        if (delErr) throw delErr;

        setTags((prev) => prev.filter((t) => t.id !== id));
        return true;
      } catch (err: any) {
        console.error('useCustomTags.removeTag error:', err);
        setError(err?.message || 'Failed to remove custom tag');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, userId]
  );

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    addTag,
    removeTag,
  };
}
