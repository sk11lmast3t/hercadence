import { describe, it, expect } from 'vitest';
import {
  calculateCycleInfo,
  computeRollingAverage,
  computeStdDev,
  getConfidence,
  extractCycleLengths,
  CYCLE_DISCLAIMER,
} from './cycleCalculations';

describe('cycleCalculations — pure math engine', () => {
  it('calculates regular 28-day cycle info correctly', () => {
    const history = [
      { startDate: '2026-01-01' },
      { startDate: '2026-01-29' },
      { startDate: '2026-02-26' },
      { startDate: '2026-03-26' },
    ];
    const targetDate = new Date(2026, 3, 5); // April 5, 2026 -> 10 days after March 26
    const result = calculateCycleInfo('2026-03-26', 28, 5, 14, targetDate, history);

    expect(result.currentDayOfCycle).toBe(11);
    expect(result.currentPhase).toBe('OVULATION');
    expect(result.isEstimate).toBe(true);
    expect(result.disclaimer).toBe(CYCLE_DISCLAIMER);
    expect(result.confidence).toBe('High');
  });

  it('handles first-time user with no cycle history', () => {
    const targetDate = new Date(2026, 2, 10);
    const result = calculateCycleInfo('2026-03-01', 28, 5, 14, targetDate, []);

    expect(result.currentDayOfCycle).toBe(10);
    expect(result.confidence).toBe('Low');
    expect(result.isEstimate).toBe(true);
    expect(typeof result.nextPeriodStartDate).toBe('string');
  });

  it('handles irregular cycles with low confidence', () => {
    const history = [
      { startDate: '2026-01-01' },
      { startDate: '2026-01-22' }, // 21 days
      { startDate: '2026-02-25' }, // 34 days
      { startDate: '2026-03-20' }, // 23 days
    ];
    const lengths = extractCycleLengths(history);
    expect(lengths).toEqual([21, 34, 23]);

    const stdDev = computeStdDev(lengths);
    expect(stdDev).toBeGreaterThan(5);

    const confidence = getConfidence(lengths);
    expect(confidence).toBe('Low');

    const result = calculateCycleInfo(
      '2026-03-20',
      28,
      5,
      14,
      new Date(2026, 2, 25),
      history
    );
    expect(result.confidence).toBe('Low');
    expect(result.isEstimate).toBe(true);
  });

  it('handles edge case with a single logged cycle', () => {
    const history = [{ startDate: '2026-03-01' }];
    const lengths = extractCycleLengths(history);
    expect(lengths).toEqual([]);

    const result = calculateCycleInfo(
      '2026-03-01',
      30,
      6,
      14,
      new Date(2026, 2, 15),
      history
    );
    expect(result.currentDayOfCycle).toBe(15);
    expect(result.confidence).toBe('Low');
    expect(result.isEstimate).toBe(true);
  });

  it('computes rolling averages accurately', () => {
    const lengths = [28, 30, 26, 29, 31, 27, 32];
    const avg = computeRollingAverage(lengths, 6);
    // last 6: 30, 26, 29, 31, 27, 32 -> sum 175 / 6 = 29.16 -> Math.round(29.16) = 29
    expect(avg).toBe(29);
  });
});
