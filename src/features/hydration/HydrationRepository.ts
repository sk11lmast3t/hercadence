import type { SupabaseClient } from '@supabase/supabase-js';
import {
  mapHydrationDtoToDomain,
  mapHydrationDomainToDto,
} from './hydration.mappers';
import {
  HydrationLogDto,
  HydrationLogDomain,
  HydrationRepositoryError,
} from './hydration.types';

const HYDRATION_SELECT = 'id, clerk_user_id, log_date, amount_ml, goal_ml, entries, created_at, updated_at';

export class HydrationRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string | null | undefined
  ) {}

  async load(fromDate?: string, toDate?: string): Promise<HydrationLogDomain[]> {
    const userId = this.requireUser();

    let query = this.supabase
      .from('hydration_logs')
      .select(HYDRATION_SELECT)
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

    return (data ?? []).map((dto) => mapHydrationDtoToDomain(dto as HydrationLogDto));
  }

  async save(
    entry: Omit<HydrationLogDomain, 'id' | 'userId'> & { id?: string; userId?: string }
  ): Promise<HydrationLogDomain> {
    const userId = this.requireUser();
    this.validateEntry(entry);

    const dto = mapHydrationDomainToDto({ ...entry, userId });

    let response: { data: unknown; error: unknown };
    try {
      response = await this.supabase
        .from('hydration_logs')
        .upsert(dto, {
          onConflict: 'clerk_user_id, log_date',
        })
        .select(HYDRATION_SELECT)
        .single();
    } catch (caught) {
      throw this.normalizeError(caught);
    }
    const { error } = response;
    if (error) throw this.normalizeError(error);

    return response.data
      ? mapHydrationDtoToDomain(response.data as HydrationLogDto)
      : { ...entry, userId, goalMl: entry.goalMl ?? 2000 };
  }

  async delete(logDate: string): Promise<void> {
    const userId = this.requireUser();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(logDate)) {
      throw new HydrationRepositoryError('Log date must use YYYY-MM-DD format');
    }

    let response: { error: unknown };
    try {
      response = await this.supabase
        .from('hydration_logs')
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
      throw new HydrationRepositoryError('Not authenticated');
    }
    return this.userId;
  }

  private validateEntry(
    entry: Omit<HydrationLogDomain, 'id' | 'userId'> & { id?: string; userId?: string }
  ): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.logDate)) {
      throw new HydrationRepositoryError('Log date must use YYYY-MM-DD format');
    }
    if (!Number.isFinite(entry.amountMl) || entry.amountMl < 0 || entry.amountMl > 10000) {
      throw new HydrationRepositoryError('Hydration amount must be between 0 and 10,000 ml');
    }
  }

  private normalizeError(error: unknown): HydrationRepositoryError {
    if (error instanceof HydrationRepositoryError) return error;
    const candidate = error as { code?: string; message?: string; status?: number } | null;
    const message = candidate?.message || 'Hydration data could not be saved';
    return new HydrationRepositoryError(message, error);
  }
}
