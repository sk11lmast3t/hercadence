// src/features/bodyMetrics/bodyMetrics.mappers.ts
// Converts between the Supabase persistence DTO and the Body Metrics domain model.
//
// Canonical 009 flat schema fields:
//   id, clerk_user_id, measured_date, weight, weight_unit,
//   waist_cm, hip_cm, body_fat_pct, notes, created_at

import { BodyMetricEntry, BodyMetricEntryInput } from './bodyMetrics.types';

// ── Persistence DTO ───────────────────────────────────────────────────────────
// Mirrors the body_metrics table as defined in migration 009.
export interface BodyMetricDto {
  id?: string;
  clerk_user_id?: string;
  measured_date: string;          // date  (YYYY-MM-DD)
  weight?: number | null;         // numeric(6,2)
  weight_unit?: string | null;    // 'kg' | 'lb'
  waist_cm?: number | null;       // numeric(5,2)
  hip_cm?: number | null;         // numeric(5,2)
  body_fat_pct?: number | null;   // numeric(4,2)
  notes?: string | null;
  created_at?: string | null;
}

// ── DTO → Domain ─────────────────────────────────────────────────────────────

export function mapBodyMetricDtoToDomain(dto: BodyMetricDto): BodyMetricEntry {
  return {
    id: dto.id,
    userId: dto.clerk_user_id,
    measuredDate: dto.measured_date,
    weight: dto.weight ?? undefined,
    weightUnit: (dto.weight_unit as 'kg' | 'lb') ?? 'kg',
    waistCm: dto.waist_cm ?? undefined,
    hipCm: dto.hip_cm ?? undefined,
    bodyFatPct: dto.body_fat_pct ?? undefined,
    notes: dto.notes ?? undefined,
    createdAt: dto.created_at ?? undefined,
  };
}

// ── Domain → DTO ─────────────────────────────────────────────────────────────

export function mapBodyMetricDomainToDto(
  domain: BodyMetricEntryInput & { id?: string; userId?: string }
): BodyMetricDto {
  const dto: BodyMetricDto = {
    measured_date: domain.measuredDate,
    weight: domain.weight ?? null,
    weight_unit: domain.weightUnit ?? 'kg',
    waist_cm: domain.waistCm ?? null,
    hip_cm: domain.hipCm ?? null,
    body_fat_pct: domain.bodyFatPct ?? null,
    notes: domain.notes ?? null,
  };

  if (domain.id) dto.id = domain.id;
  if (domain.userId) dto.clerk_user_id = domain.userId;

  return dto;
}
