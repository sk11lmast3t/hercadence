import { useMemo } from 'react';
import { useCycle } from '../context/CycleContext';
import {
  calculateCycleInfo,
  computeRollingAverage,
  CycleHistoryEntry,
} from '../utils/cycleCalculations';

/**
 * Pure deterministic cycle predictions hook.
 * No AI/ML — arithmetic only, mirrors supabase/functions/calculate-cycle/index.ts.
 * Always returns isEstimate: true + disclaimer.
 */
export function useCyclePredictions() {
  const { settings, currentCycle } = useCycle();

  return useMemo(() => {
    const result = calculateCycleInfo(
      settings.lastPeriodStartDate,
      settings.cycleLengthDays,
      settings.periodLengthDays,
      settings.lutealPhaseDays
    );

    return {
      ...result,
      isEstimate: true as const,
      disclaimer:
        'These predictions are estimates based on your logged cycle data. ' +
        'They are not a substitute for medical advice.',
    };
  }, [
    settings.lastPeriodStartDate,
    settings.cycleLengthDays,
    settings.periodLengthDays,
    settings.lutealPhaseDays,
  ]);
}
