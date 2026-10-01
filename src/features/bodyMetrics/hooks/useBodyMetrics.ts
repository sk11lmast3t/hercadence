import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '../../../hooks/useSupabase';
import { BodyMetricsRepository } from '../BodyMetricsRepository';
import {
  BodyMetricEntry,
  BodyMetricEntryInput,
  BodyMetricsSaveResult,
  BodyMetricsLoadStatus,
} from '../bodyMetrics.types';

export function useBodyMetrics() {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const repository = useMemo(() => new BodyMetricsRepository(supabase, userId), [supabase, userId]);
  const [logs, setLogs] = useState<BodyMetricEntry[]>([]);
  const [status, setStatus] = useState<BodyMetricsLoadStatus>('idle');
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
      const errMessage = caught instanceof Error ? caught.message : 'Body metrics data could not be loaded';
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
    async (entry: BodyMetricEntryInput & { id?: string; userId?: string }): Promise<BodyMetricsSaveResult> => {
      const requestUserId = currentUserId.current;
      const requestId = requestGeneration.current;
      setError(null);
      try {
        const saved = await repository.save(entry);
        if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) {
          return { ok: false, errorMessage: null, data: null };
        }
        setLogs((prev) => {
          const index = prev.findIndex((l) => l.measuredDate === entry.measuredDate);
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
        const errMessage = caught instanceof Error ? caught.message : 'Body metrics data could not be saved';
        setError(errMessage);
        return { ok: false, errorMessage: errMessage, data: null };
      }
    },
    [repository]
  );

  const deleteLog = useCallback(
    async (measuredDate: string): Promise<boolean> => {
      const requestUserId = currentUserId.current;
      const requestId = requestGeneration.current;
      setError(null);
      try {
        await repository.delete(measuredDate);
        if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return false;
        setLogs((prev) => prev.filter((l) => l.measuredDate !== measuredDate));
        return true;
      } catch (caught) {
        if (currentUserId.current !== requestUserId || requestGeneration.current !== requestId) return false;
        const errMessage = caught instanceof Error ? caught.message : 'Body metrics data could not be deleted';
        setError(errMessage);
        return false;
      }
    },
    [repository]
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayEntry = useMemo(
    () => logs.find((l) => l.measuredDate === todayStr),
    [logs, todayStr]
  );

  const latestWeight = useMemo(
    () => todayEntry?.weight ?? (logs.length > 0 ? logs[0].weight : undefined),
    [todayEntry, logs]
  );

  const latestWeightUnit = useMemo(
    () => todayEntry?.weightUnit ?? (logs.length > 0 ? logs[0].weightUnit : 'kg'),
    [todayEntry, logs]
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
    latestWeight,
    latestWeightUnit,
  };
}