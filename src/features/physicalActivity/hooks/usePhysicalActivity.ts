import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '../../../hooks/useSupabase';
import { PhysicalActivityRepository } from '../PhysicalActivityRepository';
import {
  PhysicalActivityEntry,
  PhysicalActivityEntryInput,
  PhysicalActivitySaveResult,
  PhysicalActivityLoadStatus,
} from '../physicalActivity.types';

export function usePhysicalActivity() {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const repository = useMemo(() => new PhysicalActivityRepository(supabase, userId), [supabase, userId]);
  const [logs, setLogs] = useState<PhysicalActivityEntry[]>([]);
  const [status, setStatus] = useState<PhysicalActivityLoadStatus>('idle');
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
      const errMessage = caught instanceof Error ? caught.message : 'Physical activity data could not be loaded';
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
    async (entry: PhysicalActivityEntryInput & { id?: string; userId?: string }): Promise<PhysicalActivitySaveResult> => {
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
        const errMessage = caught instanceof Error ? caught.message : 'Physical activity data could not be saved';
        setError(errMessage);
        return { ok: false, errorMessage: errMessage, data: null };
      }
    },
    [repository]
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
        const errMessage = caught instanceof Error ? caught.message : 'Physical activity data could not be deleted';
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

  const recentHistory = useMemo(
    () => logs.slice(0, 10),
    [logs]
  );

  return {
    logs,
    status,
    isLoading: status === 'loading',
    error,
    load,
    saveLog,
    deleteLog,
    todayEntry,
    recentHistory,
  };
}
