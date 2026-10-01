import { SleepEntry, SleepEntryInput, SleepQuality } from './sleep.types';

export interface SleepDto {
  id?: string;
  log_date: string;
  bedtime?: string | null;
  wake_time?: string | null;
  duration_hours?: number | null;
  quality?: SleepQuality | null;
  notes?: string | null;
}

export function mapSleepDto(dto: SleepDto): SleepEntry {
  return {
    id: dto.id,
    logDate: dto.log_date,
    bedtime: dto.bedtime ?? undefined,
    wakeTime: dto.wake_time ?? undefined,
    durationHours: dto.duration_hours ?? null,
    quality: dto.quality ?? undefined,
    notes: dto.notes ?? undefined,
  };
}

export function toSleepDto(entry: SleepEntryInput, userId: string) {
  return {
    clerk_user_id: userId,
    log_date: entry.logDate,
    bedtime: entry.bedtime ?? null,
    wake_time: entry.wakeTime ?? null,
    duration_hours: entry.durationHours,
    quality: entry.quality ?? null,
    notes: entry.notes ?? null,
  };
}