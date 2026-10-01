import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '../../../hooks/useSupabase';
import { HydrationRepository } from '../HydrationRepository';
import {
  HydrationLogDomain,
  HydrationSaveResult,
} from '../hydration.types';

export type HydrationLoadStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export function useHydration() {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const repository = useMemo(() => new HydrationRepository(supabase, userId), [supabase, userId]);
  const [logs, setLogs] = useState<HydrationLogDomain[]>([]);
  const [status, setStatus] = useState<HydrationLoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const previousUserId = useRef(userId);
  const currentUserId = useRef(userId);
  const requestGeneration = useRef(0);
  currentUserId.current = userId;

  const load = useCallback(async (fromDate?: string, toDate?: string) => {
    const requestUserId = currentUserId.current;
    const requestId = requestGeneration.current;
    setStatus('loading');
    setError(null);
    try {
      const entries = await repository.load(fromDate, toDate);
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return [];
      setLogs(entries);
      setStatus(entries.length === 0 ? 'empty' : 'success');
      return entries;
    } catch (caught) {
      if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return [];
      const errMessage = caught instanceof Error ? caught.message : 'Hydration data could not be loaded';
      setError(errMessage);
      setStatus('error');
      return [];
    }
  }, [repository]);

  useEffect(() => {
    if (previousUserId.current !== userId) {
      requestGeneration.current += 1;
      setLogs([]);
      setError(null);
      setStatus('idle');
      previousUserId.current = userId;
    }
    if (userId) void load();
  }, [load, userId]);

  const saveLog = useCallback(
    async (
      entry: Omit<HydrationLogDomain, 'id' | 'userId'> & { id?: string; userId?: string }
    ): Promise<HydrationSaveResult> => {
      const requestUserId = currentUserId.current;
      const requestId = requestGeneration.current;
      setError(null);
      try {
        const saved = await repository.save(entry);
        if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) {
          return { ok: false, errorMessage: null, data: null };
        }
        setLogs((prev) => {
          const index = prev.findIndex((l) => l.logDate === entry.logDate);
          if (index < 0) return [saved, ...prev];
          const updated = [...prev];
          updated[index] = { ...saved, id: prev[index].id };
          return updated;
        });
        setStatus('success');
        return { ok: true, errorMessage: null, data: saved };
      } catch (caught) {
        if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) {
          return { ok: false, errorMessage: null, data: null };
        }
        const errMessage = caught instanceof Error ? caught.message : 'Hydration data could not be saved';
        setError(errMessage);
        return { ok: false, errorMessage: errMessage, data: null };
      }
    },
    [repository]
  );

  const log = useCallback(
    async (legacyEntry: { log_date?: string; logDate?: string; amount_ml?: number; amountMl?: number; goal_ml?: number; goalMl?: number }) => {
      const logDate = legacyEntry.logDate ?? legacyEntry.log_date ?? new Date().toISOString().slice(0, 10);
      const amountMl = legacyEntry.amountMl ?? legacyEntry.amount_ml ?? 0;
      const goalMl = legacyEntry.goalMl ?? legacyEntry.goal_ml ?? 2000;
      const result = await saveLog({ logDate, amountMl, goalMl });
      if (!result.ok) {
        throw new Error(result.errorMessage || 'Failed to save water log');
      }
      return result.data;
    },
    [saveLog]
  );

  const deleteLog = useCallback(
    async (logDate: string): Promise<boolean> => {
      const requestUserId = currentUserId.current;
      const requestId = requestGeneration.current;
      setError(null);
      try {
        await repository.delete(logDate);
        if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return false;
        setLogs((prev) => prev.filter((l) => l.logDate !== logDate));
        return true;
      } catch (caught) {
        if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return false;
        const errMessage = caught instanceof Error ? caught.message : 'Hydration data could not be deleted';
        setError(errMessage);
        return false;
      }
    },
    [repository]
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayEntry = useMemo(
    () => logs.find((l) => l.logDate === todayStr),
    [logs, todayStr]
  );

  const todayTotal = useMemo(
    () => (todayEntry ? todayEntry.amountMl : 0),
    [todayEntry]
  );

  return {
    logs,
    status,
    isLoading: status === 'loading',
    error,
    load,
    saveLog,
    log,
    deleteLog,
    todayTotal,
    todayEntry,
  };
}
