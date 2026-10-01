import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSleepDto, SleepDto, toSleepDto } from './sleep.mappers';
import {
  SleepEntry,
  SleepEntryInput,
  SleepRepositoryError,
} from './sleep.types';

const SLEEP_SELECT = 'id, log_date, bedtime, wake_time, duration_hours, quality, notes';

export class SleepRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string | null | undefined
  ) {}

  async load(fromDate?: string, toDate?: string): Promise<SleepEntry[]> {
    const userId = this.requireUser();

    let query = this.supabase
      .from('sleep_logs')
      .select(SLEEP_SELECT)
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

    return (data ?? []).map((dto) => mapSleepDto(dto as SleepDto));
  }

  async save(entry: SleepEntryInput): Promise<SleepEntry> {
    const userId = this.requireUser();
    this.validateEntry(entry);

    let response: { data: unknown; error: unknown };
    try {
      response = await this.supabase
        .from('sleep_logs')
        .upsert(toSleepDto(entry, userId), {
          onConflict: 'clerk_user_id, log_date',
        })
        .select(SLEEP_SELECT)
        .single();
    } catch (caught) {
      throw this.normalizeError(caught);
    }
    const { error } = response;

    if (error) throw this.normalizeError(error);
      return response.data ? mapSleepDto(response.data as SleepDto) : entry;
  }

  async delete(logDate: string): Promise<void> {
    const userId = this.requireUser();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(logDate)) {
      throw new SleepRepositoryError('Sleep date must use YYYY-MM-DD format', 'validation');
    }

    let response: { error: unknown };
    try {
      response = await this.supabase
        .from('sleep_logs')
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
      throw new SleepRepositoryError('Not authenticated', 'unauthenticated');
    }
    return this.userId;
  }

  private validateEntry(entry: SleepEntryInput): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.logDate)) {
      throw new SleepRepositoryError('Sleep date must use YYYY-MM-DD format', 'validation');
    }
    if (entry.durationHours !== null && (!Number.isFinite(entry.durationHours) || entry.durationHours < 0 || entry.durationHours > 24)) {
      throw new SleepRepositoryError('Sleep duration must be between 0 and 24 hours', 'validation');
    }
    for (const time of [entry.bedtime, entry.wakeTime]) {
      if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        throw new SleepRepositoryError('Sleep times must use HH:MM format', 'validation');
      }
    }
  }

  private normalizeError(error: unknown): SleepRepositoryError {
    if (error instanceof SleepRepositoryError) return error;
    const candidate = error as { code?: string; message?: string; status?: number } | null;
    const message = candidate?.message || 'Sleep data could not be saved';
    if (candidate?.code === '42703' || candidate?.code?.startsWith('PGRST')) {
      return new SleepRepositoryError(message, 'schema');
    }
    if (candidate?.status === 401 || candidate?.status === 403) {
      return new SleepRepositoryError(message, candidate.status === 401 ? 'unauthenticated' : 'forbidden');
    }
    if (candidate?.status && candidate.status >= 500) {
      return new SleepRepositoryError(message, 'network', true);
    }
    if (error instanceof TypeError || message.toLowerCase().includes('network')) {
      return new SleepRepositoryError(message, 'network', true);
    }
    return new SleepRepositoryError(message, 'unknown');
  }
}