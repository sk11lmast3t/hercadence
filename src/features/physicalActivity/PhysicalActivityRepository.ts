import type { SupabaseClient } from '@supabase/supabase-js';
import { mapPhysicalActivityDtoToDomain, mapPhysicalActivityDomainToDto, PhysicalActivityDto } from './physicalActivity.mappers';
import {
  PhysicalActivityEntry,
  PhysicalActivityEntryInput,
  PhysicalActivityRepositoryError,
} from './physicalActivity.types';

const PHYSICAL_ACTIVITY_SELECT = 'id, clerk_user_id, log_date, activity_type, duration_mins, intensity, calories_burned, steps, notes, created_at';

export class PhysicalActivityRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string | null | undefined
  ) {}

  async load(fromDate?: string, toDate?: string): Promise<PhysicalActivityEntry[]> {
    const userId = this.requireUser();

    let query = this.supabase
      .from('activity_logs')
      .select(PHYSICAL_ACTIVITY_SELECT)
      .eq('clerk_user_id', userId)
      .order('log_date', { ascending: false })
      .limit(90);

    if (fromDate) query = query.gte('log_date', fromDate);
    if (toDate) query = query.lte('log_date', toDate);

    let response: { data: unknown[] | null; error: unknown };
    try {
      response = await query;
    } catch (caught) {
      throw this.normalizeError(caught);
    }
    const { data, error } = response;
    if (error) throw this.normalizeError(error);

    return (data ?? []).map((dto) => mapPhysicalActivityDtoToDomain(dto as PhysicalActivityDto));
  }

  async save(entry: PhysicalActivityEntryInput & { id?: string; userId?: string }): Promise<PhysicalActivityEntry> {
    const userId = this.requireUser();
    this.validateEntry(entry);

    // Strip any caller-supplied userId to enforce authenticated ownership
    const { userId: _unusedCallerUserId, ...cleanEntry } = entry;
    const dto = mapPhysicalActivityDomainToDto({ ...cleanEntry, userId });

    let response: { data: unknown; error: unknown };
    try {
      if (cleanEntry.id) {
        response = await this.supabase
          .from('activity_logs')
          .upsert(dto)
          .select(PHYSICAL_ACTIVITY_SELECT)
          .single();
      } else {
        response = await this.supabase
          .from('activity_logs')
          .insert(dto)
          .select(PHYSICAL_ACTIVITY_SELECT)
          .single();
      }
    } catch (caught) {
      throw this.normalizeError(caught);
    }
    const { error } = response;
    if (error) throw this.normalizeError(error);

    return response.data
      ? mapPhysicalActivityDtoToDomain(response.data as PhysicalActivityDto)
      : ({ ...cleanEntry, userId } as PhysicalActivityEntry);
  }

  async delete(logDate: string): Promise<void> {
    const userId = this.requireUser();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(logDate)) {
      throw new PhysicalActivityRepositoryError('Log date must use YYYY-MM-DD format', 'validation');
    }

    let response: { error: unknown };
    try {
      response = await this.supabase
        .from('activity_logs')
        .delete()
        .eq('clerk_user_id', userId)
        .eq('log_date', logDate);
    } catch (caught) {
      throw this.normalizeError(caught);
    }
    const { error } = response;
    if (error) throw this.normalizeError(error);
  }

  private requireUser(): string {
    if (!this.userId) {
      throw new PhysicalActivityRepositoryError('Not authenticated', 'unauthenticated');
    }
    return this.userId;
  }

  private validateEntry(entry: PhysicalActivityEntryInput & { id?: string; userId?: string }): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.logDate)) {
      throw new PhysicalActivityRepositoryError('Log date must use YYYY-MM-DD format', 'validation');
    }
    if (entry.durationMins !== undefined && (!Number.isFinite(entry.durationMins) || entry.durationMins < 0 || entry.durationMins > 1440)) {
      throw new PhysicalActivityRepositoryError('Duration must be between 0 and 1440 minutes', 'validation');
    }
    if (entry.caloriesBurned !== undefined && (!Number.isFinite(entry.caloriesBurned) || entry.caloriesBurned < 0)) {
      throw new PhysicalActivityRepositoryError('Calories burned must be a non-negative number', 'validation');
    }
    if (entry.steps !== undefined && (!Number.isFinite(entry.steps) || entry.steps < 0)) {
      throw new PhysicalActivityRepositoryError('Steps must be a non-negative number', 'validation');
    }
  }

  private normalizeError(error: unknown): PhysicalActivityRepositoryError {
    if (error instanceof PhysicalActivityRepositoryError) return error;
    const candidate = error as { code?: string; message?: string; status?: number } | null;
    const message = candidate?.message || 'Physical activity data could not be saved';
    if (candidate?.code === '42703' || candidate?.code?.startsWith('PGRST')) {
      return new PhysicalActivityRepositoryError(message, 'schema');
    }
    if (candidate?.status === 401 || candidate?.status === 403) {
      return new PhysicalActivityRepositoryError(
        message,
        candidate.status === 401 ? 'unauthenticated' : 'forbidden'
      );
    }
    if (candidate?.status && candidate.status >= 500) {
      return new PhysicalActivityRepositoryError(message, 'network', true);
    }
    if (error instanceof TypeError || message.toLowerCase().includes('network')) {
      return new PhysicalActivityRepositoryError(message, 'network', true);
    }
    return new PhysicalActivityRepositoryError(message, 'unknown');
  }
}
