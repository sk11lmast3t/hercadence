import { CyclePhase, CycleCalculationResult } from '../types';

// ────────────────────────────────────────────────
// Date helpers (pure, no side effects)
// ────────────────────────────────────────────────

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function daysBetween(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

// ────────────────────────────────────────────────
// Statistical helpers (pure, deterministic, no AI/ML)
// ────────────────────────────────────────────────

export interface CycleHistoryEntry {
  startDate: string;
  endDate?: string;
}

export type Confidence = 'Low' | 'Medium' | 'High';

/**
 * Computes a rolling average of cycle lengths over the last `windowSize` cycles.
 * Returns 28 (standard fallback) if no history is available.
 */
export function computeRollingAverage(lengths: number[], windowSize = 6): number {
  const slice = lengths.slice(-windowSize);
  if (slice.length === 0) return 28;
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
}

/**
 * Sample standard deviation of cycle lengths.
 */
export function computeStdDev(lengths: number[]): number {
  if (lengths.length < 2) return 0;
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (lengths.length - 1);
  return Math.sqrt(variance);
}

/**
 * Confidence indicator based on standard deviation of recent cycle lengths.
 * - High:   SD ≤ 2 days (very regular)
 * - Medium: SD ≤ 5 days (somewhat regular)
 * - Low:    SD > 5 days or fewer than 3 cycles of history
 */
export function getConfidence(lengths: number[]): Confidence {
  if (lengths.length < 3) return 'Low';
  const sd = computeStdDev(lengths);
  if (sd <= 2) return 'High';
  if (sd <= 5) return 'Medium';
  return 'Low';
}

/**
 * Extracts cycle lengths from a history array of start dates.
 * Filters out implausible lengths (≤0 or ≥100 days).
 */
export function extractCycleLengths(history: CycleHistoryEntry[]): number[] {
  const lengths: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const prev = parseISODate(history[i - 1].startDate);
    const curr = parseISODate(history[i].startDate);
    const len = daysBetween(prev, curr);
    if (len > 0 && len < 100) lengths.push(len);
  }
  return lengths;
}

// ────────────────────────────────────────────────
// HARD RULE disclaimer — every output is an estimate
// ────────────────────────────────────────────────

export const CYCLE_DISCLAIMER =
  'These calculations are estimates based on your logged data and statistical averages. ' +
  'They are not medical advice, diagnosis, or contraception guidance. ' +
  'Consult a healthcare provider for clinical decisions.';

// ────────────────────────────────────────────────
// Extended result type with confidence + disclaimer
// ────────────────────────────────────────────────

export interface EnhancedCycleCalculationResult extends CycleCalculationResult {
  confidence: Confidence;
  isEstimate: true;
  disclaimer: string;
}

// ────────────────────────────────────────────────
// Main calculation — pure deterministic math, NO AI/ML
// ────────────────────────────────────────────────

/**
 * Calculates current cycle status.
 *
 * When `cycleHistory` is provided (array of past cycle start dates),
 * the function uses a rolling average of the last N cycles for prediction
 * and computes a confidence indicator from their standard deviation.
 *
 * When no history is provided, falls back to the single `cycleLength` baseline value
 * (backward compatible with the original API).
 */
export function calculateCycleInfo(
  lastPeriodStartDateStr: string,
  cycleLength: number = 28,
  periodLength: number = 5,
  lutealPhaseDays: number = 14,
  targetDate: Date = new Date(),
  cycleHistory: CycleHistoryEntry[] = [],
  rollingWindowSize: number = 6
): EnhancedCycleCalculationResult {
  // Compute effective cycle length from history if available
  const cycleLengths = extractCycleLengths(cycleHistory);
  const effectiveCycleLength = cycleLengths.length > 0
    ? computeRollingAverage(cycleLengths, rollingWindowSize)
    : cycleLength;

  const confidence = getConfidence(cycleLengths);

  const lastPeriodStart = parseISODate(lastPeriodStartDateStr);
  const diffDays = daysBetween(lastPeriodStart, targetDate);

  // Normalize to current cycle loop
  const cycleDay = (diffDays >= 0
    ? (diffDays % effectiveCycleLength)
    : ((diffDays % effectiveCycleLength) + effectiveCycleLength)) + 1;

  // Ovulation typically occurs (cycleLength - lutealPhaseDays) days into the cycle
  const ovulationDay = Math.max(effectiveCycleLength - lutealPhaseDays, 1);
  const fertileStartDay = Math.max(ovulationDay - 5, 1);
  const fertileEndDay = Math.min(ovulationDay + 1, effectiveCycleLength);

  let currentPhase: CyclePhase;
  let phaseDisplayName: string;
  let phaseDescription: string;
  let phaseAdvice: string;
  let chanceOfPregnancy: 'Low' | 'Medium' | 'High' | 'Very High';

  if (cycleDay <= periodLength) {
    currentPhase = 'MENSTRUAL';
    phaseDisplayName = 'Menstrual Phase';
    phaseDescription = 'Your estrogen and progesterone levels are low. The uterine lining is gently shedding.';
    phaseAdvice = 'Rest, stay warm, hydrate with soothing teas, and practice gentle stretching.';
    chanceOfPregnancy = 'Low';
  } else if (cycleDay < fertileStartDay) {
    currentPhase = 'FOLLICULAR';
    phaseDisplayName = 'Follicular Phase';
    phaseDescription = 'FSH is stimulating follicle development. Estrogen rises, boosting mental focus and stamina.';
    phaseAdvice = 'Great time for creative work, high-energy workouts, and trying new activities.';
    chanceOfPregnancy = 'Medium';
  } else if (cycleDay <= fertileEndDay) {
    currentPhase = 'OVULATION';
    phaseDisplayName = 'Ovulation Phase';
    phaseDescription = 'LH surge triggers egg release. Peak fertility, social confidence, and vibrant energy.';
    phaseAdvice = 'Peak communication and vitality. Optimal window for conception if planning.';
    chanceOfPregnancy = cycleDay === ovulationDay ? 'Very High' : 'High';
  } else {
    currentPhase = 'LUTEAL';
    phaseDisplayName = 'Luteal Phase';
    phaseDescription = 'Progesterone peaks to support a possible pregnancy, then tapers off. Metabolism increases.';
    phaseAdvice = 'Prioritize magnesium-rich complex carbs, gentle yoga, and restorative evening rituals.';
    chanceOfPregnancy = 'Low';
  }

  // Calculate upcoming critical dates
  const nextPeriodDate = addDays(
    lastPeriodStart,
    Math.ceil((diffDays + 1) / effectiveCycleLength) * effectiveCycleLength
  );
  const currentCycleStart = Math.floor(diffDays / effectiveCycleLength) * effectiveCycleLength;
  const nextOvulationDate = addDays(lastPeriodStart, currentCycleStart + ovulationDay - 1);
  const fertileStartDate = addDays(lastPeriodStart, currentCycleStart + fertileStartDay - 1);
  const fertileEndDate = addDays(lastPeriodStart, currentCycleStart + fertileEndDay - 1);

  const daysUntilNextPeriod = Math.max(0, effectiveCycleLength - cycleDay + 1);

  return {
    currentDayOfCycle: cycleDay,
    currentPhase,
    daysUntilNextPeriod,
    nextPeriodStartDate: formatDateToISO(nextPeriodDate),
    nextOvulationDate: formatDateToISO(nextOvulationDate),
    fertileWindowStart: formatDateToISO(fertileStartDate),
    fertileWindowEnd: formatDateToISO(fertileEndDate),
    phaseDisplayName,
    phaseDescription,
    phaseAdvice,
    chanceOfPregnancy,
    confidence,
    isEstimate: true,
    disclaimer: CYCLE_DISCLAIMER,
  };
}
