// src/features/bodyMetrics/BodyMetricsRepository.ts
// Owns all body_metrics CRUD, DTO mapping, validation, ownership filtering,
// and error normalisation for the Body Metrics feature.
//
// Targets the 009 flat schema:
//   body_metrics (id, clerk_user_id, measured_date, weight, weight_unit,
//                 waist_cm, hip_cm, body_fat_pct, notes, created_at)
//   UNIQUE(clerk_user_id, measured_date)
//
// Schema note: migrations 001 and 008 define an EAV (recorded_date + metric_type + value)
// layout that conflicts with the 009 flat layout the active client code targets.
// This discrepancy is documented but NOT resolved here; the repository targets 009
// because that is the model used by every active client since migration 009 was applied.
// See PART_3C_VERIFICATION.md §Schema for the full discrepancy record.

import type { SupabaseClient } from '@supabase/supabase-js';
import { mapBodyMetricDtoToDomain, mapBodyMetricDomainToDto, BodyMetricDto } from './bodyMetrics.mappers';
import {
  BodyMetricEntry,
  BodyMetricEntryInput,
  BodyMetricsRepositoryError,
} from './bodyMetrics.types';

const BODY_METRICS_SELECT =
  'id, clerk_user_id, measured_date, weight, weight_unit, waist_cm, hip_cm, body_fat_pct, notes, created_at';

export class BodyMetricsRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string | null | undefined
  ) {}

  // ── Load ──────────────────────────────────────────────────────────────────

  async load(fromDate?: string, toDate?: string): Promise<BodyMetricEntry[]> {
    const userId = this.requireUser();

    let query = this.supabase
      .from('body_metrics')
      .select(BODY_METRICS_SELECT)
      .eq('clerk_user_id', userId)
      .order('measured_date', { ascending: false })
      .limit(90);

    if (fromDate) query = query.gte('measured_date', fromDate);
    if (toDate) query = query.lte('measured_date', toDate);

    let response: { data: unknown[] | null; error: unknown };
    try {
      response = await query;
    } catch (caught) {
      throw this.normalizeError(caught);
    }
    const { data, error } = response;
    if (error) throw this.normalizeError(error);

    return (data ?? []).map((dto) => mapBodyMetricDtoToDomain(dto as BodyMetricDto));
  }

  // ── Save (upsert) ─────────────────────────────────────────────────────────

  async save(entry: BodyMetricEntryInput & { id?: string }): Promise<BodyMetricEntry> {
    // userId is always sourced from requireUser() — never from the caller-supplied entry.
    const userId = this.requireUser();
    this.validateEntry(entry);

    const dto = mapBodyMetricDomainToDto({ ...entry, userId });

    let response: { data: unknown; error: unknown };
    try {
      response = await this.supabase
        .from('body_metrics')
        .upsert(dto, { onConflict: 'clerk_user_id, measured_date' })
        .select(BODY_METRICS_SELECT)
        .single();
    } catch (caught) {
      throw this.normalizeError(caught);
    }
    const { error } = response;
    if (error) throw this.normalizeError(error);

    return response.data
      ? mapBodyMetricDtoToDomain(response.data as BodyMetricDto)
      : ({ ...entry, userId } as BodyMetricEntry);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async delete(measuredDate: string): Promise<void> {
    const userId = this.requireUser();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(measuredDate)) {
      throw new BodyMetricsRepositoryError(
        'Measured date must use YYYY-MM-DD format',
        'validation'
      );
    }

    let response: { error: unknown };
    try {
      response = await this.supabase
        .from('body_metrics')
        .delete()
        .eq('clerk_user_id', userId)
        .eq('measured_date', measuredDate);
    } catch (caught) {
      throw this.normalizeError(caught);
    }
    const { error } = response;
    if (error) throw this.normalizeError(error);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private requireUser(): string {
    if (!this.userId) {
      throw new BodyMetricsRepositoryError('Not authenticated', 'unauthenticated');
    }
    return this.userId;
  }

  private validateEntry(entry: BodyMetricEntryInput & { id?: string }): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.measuredDate)) {
      throw new BodyMetricsRepositoryError(
        'Measured date must use YYYY-MM-DD format',
        'validation'
      );
    }
    if (
      entry.weight !== undefined &&
      (!Number.isFinite(entry.weight) || entry.weight < 0 || entry.weight > 500)
    ) {
      throw new BodyMetricsRepositoryError('Weight must be between 0 and 500', 'validation');
    }
    if (
      entry.waistCm !== undefined &&
      (!Number.isFinite(entry.waistCm) || entry.waistCm < 0 || entry.waistCm > 300)
    ) {
      throw new BodyMetricsRepositoryError('Waist must be between 0 and 300 cm', 'validation');
    }
    if (
      entry.hipCm !== undefined &&
      (!Number.isFinite(entry.hipCm) || entry.hipCm < 0 || entry.hipCm > 300)
    ) {
      throw new BodyMetricsRepositoryError('Hip must be between 0 and 300 cm', 'validation');
    }
    if (
      entry.bodyFatPct !== undefined &&
      (!Number.isFinite(entry.bodyFatPct) || entry.bodyFatPct < 0 || entry.bodyFatPct > 100)
    ) {
      throw new BodyMetricsRepositoryError(
        'Body fat percentage must be between 0 and 100',
        'validation'
      );
    }
  }

  private normalizeError(error: unknown): BodyMetricsRepositoryError {
    if (error instanceof BodyMetricsRepositoryError) return error;

    const candidate = error as {
      code?: string;
      message?: string;
      status?: number;
    } | null;

    const message = candidate?.message ?? 'Body metrics data could not be saved';

    // Supabase PostgREST schema/column error
    if (candidate?.code === '42703' || candidate?.code?.startsWith('PGRST')) {
      return new BodyMetricsRepositoryError(message, 'schema');
    }
    // Auth/permission HTTP status
    if (candidate?.status === 401) {
      return new BodyMetricsRepositoryError(message, 'unauthenticated');
    }
    if (candidate?.status === 403) {
      return new BodyMetricsRepositoryError(message, 'forbidden');
    }
    // 5xx or network fetch failure
    if ((candidate?.status !== undefined && candidate.status >= 500) ||
        error instanceof TypeError ||
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('fetch')) {
      return new BodyMetricsRepositoryError(message, 'network', true);
    }

    return new BodyMetricsRepositoryError(message, 'unknown');
  }
}
