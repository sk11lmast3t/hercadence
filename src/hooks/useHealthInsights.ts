import { useMemo } from 'react';
import { useCycle } from '../context/CycleContext';
import { computeRollingAverage } from '../utils/cycleCalculations';

/**
 * Cycle statistics and symptom history trends.
 * Pure deterministic math only — no AI/ML.
 */
export function useHealthInsights() {
  const { dayLogs, settings } = useCycle();

  return useMemo(() => {
    const logEntries = Object.entries(dayLogs);

    // Symptom frequency
    const symptomCounts: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};
    let bbtReadings: number[] = [];
    let flowDays = 0;

    for (const [, log] of logEntries) {
      (log.symptoms ?? []).forEach(s => {
        symptomCounts[s] = (symptomCounts[s] ?? 0) + 1;
      });
      (log.moods ?? []).forEach(m => {
        moodCounts[m] = (moodCounts[m] ?? 0) + 1;
      });
      if (log.bbt && log.bbt > 35) bbtReadings.push(log.bbt);
      if (log.flow && log.flow !== null) flowDays++;
    }

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topMoods = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const avgBbt =
      bbtReadings.length > 0
        ? +(bbtReadings.reduce((a, b) => a + b, 0) / bbtReadings.length).toFixed(2)
        : null;

    const averageCycleLength = settings.cycleLengthDays;
    const averagePeriodLength = settings.periodLengthDays;

    return {
      totalLogsCount: logEntries.length,
      flowDays,
      topSymptoms,
      topMoods,
      avgBbt,
      averageCycleLength,
      averagePeriodLength,
    };
  }, [dayLogs, settings]);
}
