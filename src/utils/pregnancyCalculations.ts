// Pregnancy calculation utilities — pure deterministic math, no AI/ML.
// All outputs are estimates with clinical disclaimers.

import { parseISODate, addDays, daysBetween, formatDateToISO } from './cycleCalculations';

export const PREGNANCY_DISCLAIMER =
  'These pregnancy calculations are estimates based on Naegele\'s Rule and your logged data. ' +
  'They are not medical advice. Consult your healthcare provider for clinical decisions.';

export interface PregnancyInfo {
  dueDate: string;
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  isEstimate: true;
  disclaimer: string;
}

/**
 * Calculates pregnancy due date using Naegele's Rule:
 * Due date = LMP + 280 days (40 weeks)
 */
export function calculatePregnancyDueDate(lastPeriodStartDate: string): string {
  const lmp = parseISODate(lastPeriodStartDate);
  return formatDateToISO(addDays(lmp, 280));
}

/**
 * Calculates current pregnancy week, trimester, and remaining days.
 */
export function calculatePregnancyInfo(
  lastPeriodStartDate: string,
  targetDate: Date = new Date()
): PregnancyInfo {
  const lmp = parseISODate(lastPeriodStartDate);
  const dueDate = addDays(lmp, 280);
  const daysSinceLMP = daysBetween(lmp, targetDate);
  const currentWeek = Math.floor(daysSinceLMP / 7);
  const currentDay = daysSinceLMP % 7;
  const daysRemaining = Math.max(0, daysBetween(targetDate, dueDate));

  let trimester: 1 | 2 | 3;
  if (currentWeek < 13) trimester = 1;
  else if (currentWeek < 27) trimester = 2;
  else trimester = 3;

  return {
    dueDate: formatDateToISO(dueDate),
    currentWeek: Math.max(0, Math.min(currentWeek, 42)),
    currentDay: Math.max(0, currentDay),
    trimester,
    daysRemaining,
    isEstimate: true,
    disclaimer: PREGNANCY_DISCLAIMER,
  };
}
