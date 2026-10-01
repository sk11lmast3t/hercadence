import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '../../../hooks/useSupabase';
import { MedicationRepository } from '../MedicationRepository';
import { MedicationEntry, MedicationEntryInput, MedicationErrorCategory, MedicationLoadStatus } from '../medication.types';

export function useMedication() {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const repository = useMemo(() => new MedicationRepository(supabase, userId), [supabase, userId]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [status, setStatus] = useState<MedicationLoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<MedicationErrorCategory | null>(null);
  const previousUserId = useRef(userId);
  const currentUserId = useRef(userId);
  const requestGeneration = useRef(0);
  currentUserId.current = userId;

  const load = useCallback(async () => {
    const requestUserId = currentUserId.current;
    const requestId = requestGeneration.current;
    setStatus('loading');
    setError(null);
    setErrorCategory(null);
    try {
      const entries = await repository.load();
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return [];
      setMedications(entries);
      setStatus(entries.length === 0 ? 'empty' : 'success');
      return entries;
    } catch (caught) {
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return [];
      const repositoryError = caught instanceof Error ? caught : new Error('Medication data could not be loaded');
      setError(repositoryError.message);
      setErrorCategory('category' in repositoryError ? repositoryError.category as MedicationErrorCategory : 'unknown');
      setStatus('error');
      return [];
    }
  }, [repository]);

  useEffect(() => {
    if (previousUserId.current !== userId) {
      requestGeneration.current += 1;
      setMedications([]);
      setError(null);
      setErrorCategory(null);
      setStatus('idle');
      previousUserId.current = userId;
    }
    if (userId) void load();
  }, [load, userId]);

  const saveMedication = useCallback(async (entry: MedicationEntryInput): Promise<MedicationEntry | null> => {
    const requestUserId = currentUserId.current;
    const requestId = requestGeneration.current;
    setError(null);
    setErrorCategory(null);
    try {
      const savedEntry = await repository.save(entry);
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) {
        return null;
      }
      setMedications((previous) => {
        const index = previous.findIndex((item) => item.id === savedEntry.id || (entry.id && item.id === entry.id));
        if (index < 0) return [savedEntry, ...previous];
        const updated = [...previous];
        updated[index] = savedEntry;
        return updated;
      });
      setStatus('success');
      return savedEntry;
    } catch (caught) {
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) {
        return null;
      }
      const repositoryError = caught instanceof Error ? caught : new Error('Medication data could not be saved');
      setError(repositoryError.message);
      setErrorCategory('category' in repositoryError ? repositoryError.category as MedicationErrorCategory : 'unknown');
      setStatus('error');
      return null;
    }
  }, [repository]);

  const deleteMedication = useCallback(async (id: string): Promise<boolean> => {
    const requestUserId = currentUserId.current;
    const requestId = requestGeneration.current;
    setError(null);
    setErrorCategory(null);
    try {
      await repository.delete(id);
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return false;
      setMedications((previous) => previous.filter((item) => item.id !== id));
      setStatus('success');
      return true;
    } catch (caught) {
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return false;
      const repositoryError = caught instanceof Error ? caught : new Error('Medication data could not be deleted');
      setError(repositoryError.message);
      setErrorCategory('category' in repositoryError ? repositoryError.category as MedicationErrorCategory : 'unknown');
      setStatus('error');
      return false;
    }
  }, [repository]);

  return {
    medications,
    status,
    isLoading: status === 'loading',
    error,
    errorCategory,
    load,
    saveMedication,
    deleteMedication,
  };
}
