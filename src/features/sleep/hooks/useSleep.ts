import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '../../../hooks/useSupabase';
import { SleepRepository } from '../SleepRepository';
import { SleepEntry, SleepEntryInput, SleepErrorCategory } from '../sleep.types';

export interface SleepSaveResult {
  ok: boolean;
  errorMessage: string | null;
}

export type SleepLoadStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export function useSleep() {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const repository = useMemo(() => new SleepRepository(supabase, userId), [supabase, userId]);
  const [logs, setLogs] = useState<SleepEntry[]>([]);
  const [status, setStatus] = useState<SleepLoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<SleepErrorCategory | null>(null);
  const previousUserId = useRef(userId);
  const currentUserId = useRef(userId);
  const requestGeneration = useRef(0);
  currentUserId.current = userId;

  const fetchLogs = useCallback(async (fromDate?: string, toDate?: string) => {
    const requestUserId = currentUserId.current;
    const requestId = requestGeneration.current;
    setStatus('loading');
    setError(null);
    setErrorCategory(null);
    try {
      const entries = await repository.load(fromDate, toDate);
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return [];
      setLogs(entries);
      setStatus(entries.length === 0 ? 'empty' : 'success');
      return entries;
    } catch (caught) {
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return [];
      const repositoryError = caught instanceof Error ? caught : new Error('Sleep data could not be loaded');
      setError(repositoryError.message);
      setErrorCategory('category' in repositoryError ? repositoryError.category as SleepErrorCategory : 'unknown');
      setStatus('error');
      return [];
    }
  }, [repository]);

  useEffect(() => {
    if (previousUserId.current !== userId) {
      requestGeneration.current += 1;
      setLogs([]);
      setError(null);
      setErrorCategory(null);
      setStatus('idle');
      previousUserId.current = userId;
    }
    if (userId) void fetchLogs();
  }, [fetchLogs, userId]);

  const saveSleepLog = useCallback(async (entry: SleepEntryInput): Promise<SleepSaveResult> => {
    const requestUserId = currentUserId.current;
    const requestId = requestGeneration.current;
    setError(null);
    setErrorCategory(null);
    try {
      const savedEntry = await repository.save(entry);
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) {
        return { ok: false, errorMessage: null };
      }
      setLogs((previous) => {
        const index = previous.findIndex((item) => item.logDate === entry.logDate);
        if (index < 0) return [savedEntry, ...previous];
        const updated = [...previous];
        updated[index] = { ...savedEntry, id: previous[index].id };
        return updated;
      });
      setStatus('success');
      return { ok: true, errorMessage: null };
    } catch (caught) {
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) {
        return { ok: false, errorMessage: null };
      }
      const repositoryError = caught instanceof Error ? caught : new Error('Sleep data could not be saved');
      setError(repositoryError.message);
      setErrorCategory('category' in repositoryError ? repositoryError.category as SleepErrorCategory : 'unknown');
      return { ok: false, errorMessage: repositoryError.message };
    }
  }, [repository]);

  const deleteSleepLog = useCallback(async (logDate: string): Promise<boolean> => {
    const requestUserId = currentUserId.current;
    const requestId = requestGeneration.current;
    setError(null);
    setErrorCategory(null);
    try {
      await repository.delete(logDate);
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return false;
      setLogs((previous) => previous.filter((item) => item.logDate !== logDate));
      return true;
    } catch (caught) {
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return false;
      const repositoryError = caught instanceof Error ? caught : new Error('Sleep data could not be deleted');
      setError(repositoryError.message);
      setErrorCategory('category' in repositoryError ? repositoryError.category as SleepErrorCategory : 'unknown');
      return false;
    }
  }, [repository]);

  return {
    logs,
    status,
    isLoading: status === 'loading',
    error,
    errorCategory,
    fetchLogs,
    saveSleepLog,
    deleteSleepLog,
  };
}