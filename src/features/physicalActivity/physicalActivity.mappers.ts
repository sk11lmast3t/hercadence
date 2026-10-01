// src/features/physicalActivity/physicalActivity.mappers.ts
// ── Canonical schema mapping ──────────────────────────────────────────────────
// Targets Supabase table: `public.activity_logs` (009 schema model)
//
// Key fields:
//   id              uuid (PK, default gen_random_uuid())
//   clerk_user_id   text (FK/ownership)
//   log_date        date (YYYY-MM-DD)
//   activity_type   text
//   duration_mins   int  (NOTE: 009 defines duration_mins; 002/008 define duration_minutes)
//   intensity       text check (low, moderate, high)
//   calories_burned int
//   steps           int
//   notes           text
//   created_at      timestamptz

import { PhysicalActivityEntry, PhysicalActivityEntryInput } from './physicalActivity.types';

export interface PhysicalActivityDto {
  id?: string;
  clerk_user_id?: string;
  log_date: string;
  activity_type?: string | null;
  duration_mins?: number | null;
  intensity?: string | null;
  calories_burned?: number | null;
  steps?: number | null;
  notes?: string | null;
  created_at?: string | null;
}

export function mapPhysicalActivityDtoToDomain(dto: PhysicalActivityDto): PhysicalActivityEntry {
  return {
    id: dto.id,
    userId: dto.clerk_user_id,
    logDate: dto.log_date,
    activityType: dto.activity_type ?? undefined,
    durationMins: dto.duration_mins ?? undefined,
    intensity: (dto.intensity as PhysicalActivityEntry['intensity']) ?? undefined,
    caloriesBurned: dto.calories_burned ?? undefined,
    steps: dto.steps ?? undefined,
    notes: dto.notes ?? undefined,
    createdAt: dto.created_at ?? undefined,
  };
}

export function mapPhysicalActivityDomainToDto(
  domain: PhysicalActivityEntryInput & { id?: string; userId?: string }
): PhysicalActivityDto {
  const dto: PhysicalActivityDto = {
    log_date: domain.logDate,
    activity_type: domain.activityType ?? null,
    duration_mins: domain.durationMins ?? null,
    intensity: domain.intensity ?? null,
    calories_burned: domain.caloriesBurned ?? null,
    steps: domain.steps ?? null,
    notes: domain.notes ?? null,
  };

  if (domain.id) {
    dto.id = domain.id;
  }
  if (domain.userId) {
    dto.clerk_user_id = domain.userId;
  }

  return dto;
}

