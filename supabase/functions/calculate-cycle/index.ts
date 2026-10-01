// supabase/functions/calculate-cycle/index.ts
// Server-side mirror of the pure cycle math engine.
// Used for server-generated notifications/reports where the client isn't available.
// HARD RULE: No AI/ML. Pure deterministic math only.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { verifyClerkToken } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ────────────────────────────────────────────────
// Pure math helpers — identical to client-side
// ────────────────────────────────────────────────

type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION' | 'LUTEAL';
type Confidence = 'Low' | 'Medium' | 'High';

interface CycleHistoryEntry { startDate: string; endDate?: string }

interface CycleCalculationResult {
  currentDayOfCycle: number;
  currentPhase: CyclePhase;
  daysUntilNextPeriod: number;
  nextPeriodStartDate: string;
  nextOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  phaseDisplayName: string;
  phaseDescription: string;
  phaseAdvice: string;
  chanceOfPregnancy: 'Low' | 'Medium' | 'High' | 'Very High';
  confidence: Confidence;
  isEstimate: true;
  disclaimer: string;
}

function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function computeRollingAverage(lengths: number[], windowSize = 6): number {
  const slice = lengths.slice(-windowSize);
  if (slice.length === 0) return 28;
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
}

function computeStdDev(lengths: number[]): number {
  if (lengths.length < 2) return 0;
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (lengths.length - 1);
  return Math.sqrt(variance);
}

function getConfidence(lengths: number[]): Confidence {
  if (lengths.length < 3) return 'Low';
  const sd = computeStdDev(lengths);
  if (sd <= 2) return 'High';
  if (sd <= 5) return 'Medium';
  return 'Low';
}

const DISCLAIMER = 'These calculations are estimates based on your logged data and statistical averages. They are not medical advice, diagnosis, or contraception guidance. Consult a healthcare provider for clinical decisions.';

function calculateCycleInfo(
  lastPeriodStartDateStr: string,
  cycleLength: number = 28,
  periodLength: number = 5,
  lutealPhaseDays: number = 14,
  targetDate: Date = new Date(),
  cycleHistory: CycleHistoryEntry[] = [],
  rollingWindowSize: number = 6
): CycleCalculationResult {
  // Compute effective cycle length from history if available
  const cycleLengths: number[] = [];
  for (let i = 1; i < cycleHistory.length; i++) {
    const prev = parseISODate(cycleHistory[i - 1].startDate);
    const curr = parseISODate(cycleHistory[i].startDate);
    const len = daysBetween(prev, curr);
    if (len > 0 && len < 100) cycleLengths.push(len);
  }

  const effectiveCycleLength = cycleLengths.length > 0
    ? computeRollingAverage(cycleLengths, rollingWindowSize)
    : cycleLength;

  const confidence = getConfidence(cycleLengths);
  const lastPeriodStart = parseISODate(lastPeriodStartDateStr);
  const diffDays = daysBetween(lastPeriodStart, targetDate);
  const cycleDay = (diffDays >= 0 ? (diffDays % effectiveCycleLength) : ((diffDays % effectiveCycleLength) + effectiveCycleLength)) + 1;

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

  const nextPeriodDate = addDays(lastPeriodStart, Math.ceil((diffDays + 1) / effectiveCycleLength) * effectiveCycleLength);
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
    disclaimer: DISCLAIMER,
  };
}

// ────────────────────────────────────────────────
// HTTP handler
// ────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the Clerk JWT — required for rate-limiting / audit, even though
    // the calculation itself is stateless. Platform verify_jwt is disabled
    // because Clerk tokens are not Supabase JWTs.
    try {
      await verifyClerkToken(authHeader);
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      lastPeriodStartDate,
      cycleLength = 28,
      periodLength = 5,
      lutealPhaseDays = 14,
      targetDate,
      cycleHistory = [],
      rollingWindowSize = 6,
    } = body;

    if (!lastPeriodStartDate) {
      return new Response(
        JSON.stringify({ error: 'lastPeriodStartDate is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const target = targetDate ? parseISODate(targetDate) : new Date();
    const result = calculateCycleInfo(
      lastPeriodStartDate,
      cycleLength,
      periodLength,
      lutealPhaseDays,
      target,
      cycleHistory,
      rollingWindowSize
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('calculate-cycle error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
