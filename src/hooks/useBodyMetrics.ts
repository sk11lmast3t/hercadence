// src/hooks/useBodyMetrics.ts
// ── Compatibility facade for Body Metrics ─────────────────────────────────────
//
// BODY METRICS consumers: import from src/features/bodyMetrics/hooks/useBodyMetrics
// or continue to import from this path — both resolve to the same implementation.
//
// Physical Activity was migrated to src/features/physicalActivity in Part 3D.
// The temporary activity-log compatibility bridge has been removed from this facade.

import { useCallback } from 'react';
import { useBodyMetrics as useBodyMetricsCanonical } from '../features/bodyMetrics/hooks/useBodyMetrics';

// Re-export canonical Body Metrics hook and types so old import paths keep working.
export type { BodyMetricEntry } from '../features/bodyMetrics/bodyMetrics.types';
export { useBodyMetrics as useBodyMetricsFeature } from '../features/bodyMetrics/hooks/useBodyMetrics';

export function useBodyMetrics() {
  const bodyMetricsHook = useBodyMetricsCanonical();

  // Surface legacy names used by existing callers:
  //   { saveBodyMetric, bodyMetrics, isLoading, error }
  const saveBodyMetric = useCallback(
    async (entry: {
      measuredDate: string;
      weight?: number;
      weightUnit?: 'kg' | 'lb';
      waistCm?: number;
      hipCm?: number;
      bodyFatPct?: number;
      notes?: string;
    }): Promise<boolean> => {
      const result = await bodyMetricsHook.saveLog(entry);
      return result.ok;
    },
    [bodyMetricsHook]
  );

  return {
    bodyMetrics: bodyMetricsHook.logs,
    isLoading: bodyMetricsHook.isLoading,
    error: bodyMetricsHook.error,
    saveBodyMetric,
    fetchBodyMetrics: bodyMetricsHook.load,
  };
}
