import type { SupabaseClient } from '@supabase/supabase-js';
import { mapMedicationDomainToDto, mapMedicationDtoToDomain } from './medication.mappers';
import {
  MedicationDto,
  MedicationEntry,
  MedicationEntryInput,
  MedicationRepositoryError,
} from './medication.types';

const MEDICATION_COLUMNS = 'id, clerk_user_id, name, dosage, frequency, is_active, created_at';

export class MedicationRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly trustedClerkUserId: string | null | undefined
  ) {}

  async load(): Promise<MedicationEntry[]> {
    const userId = this.requireUser();
    let response: { data: unknown[] | null; error: unknown };

    try {
      response = await this.supabase
        .from('medications')
        .select(MEDICATION_COLUMNS)
        .eq('clerk_user_id', userId)
        .order('created_at', { ascending: false });
    } catch (caught) {
      throw this.normalizeError(caught, 'load');
    }

    if (response.error) throw this.normalizeError(response.error, 'load');
    return (response.data ?? []).map((dto) => mapMedicationDtoToDomain(dto as MedicationDto));
  }

  async save(entry: MedicationEntryInput): Promise<MedicationEntry> {
    const userId = this.requireUser();
    if (!entry.name?.trim()) {
      throw new MedicationRepositoryError('Medication name is required.', 'validation');
    }

    let response: { data: unknown; error: unknown };
    try {
      response = await this.supabase
        .from('medications')
        .upsert(mapMedicationDomainToDto(entry, userId))
        .select(MEDICATION_COLUMNS)
        .single();
    } catch (caught) {
      throw this.normalizeError(caught, 'save');
    }

    if (response.error) throw this.normalizeError(response.error, 'save');
    if (!response.data) {
      throw new MedicationRepositoryError('Medication could not be saved.', 'unknown');
    }
    return mapMedicationDtoToDomain(response.data as MedicationDto);
  }

  async delete(id: string): Promise<void> {
    const userId = this.requireUser();
    let response: { error: unknown };

    try {
      response = await this.supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('clerk_user_id', userId);
    } catch (caught) {
      throw this.normalizeError(caught, 'delete');
    }

    if (response.error) throw this.normalizeError(response.error, 'delete');
  }

  private requireUser(): string {
    if (!this.trustedClerkUserId) {
      throw new MedicationRepositoryError('Sign in to manage medications.', 'unauthenticated');
    }
    return this.trustedClerkUserId;
  }

  private normalizeError(
    error: unknown,
    operation: 'load' | 'save' | 'delete'
  ): MedicationRepositoryError {
    if (error instanceof MedicationRepositoryError) return error;

    const candidate = error as { code?: string; status?: number } | null;
    if (candidate?.status === 401) {
      return new MedicationRepositoryError('Sign in to manage medications.', 'unauthenticated');
    }
    if (candidate?.status === 403 || candidate?.code === '42501') {
      return new MedicationRepositoryError('Medication access was denied.', 'forbidden');
    }
    if (
      candidate?.code === '42703'
      || candidate?.code === '42P01'
      || candidate?.code?.startsWith('PGRST')
    ) {
      return new MedicationRepositoryError(
        'Medication data is unavailable because its saved format is incompatible.',
        'schema'
      );
    }
    if (
      error instanceof TypeError
      || (candidate?.status !== undefined && candidate.status >= 500)
    ) {
      return new MedicationRepositoryError(
        'Medication data could not be reached. Please try again.',
        'network',
        true
      );
    }

    const message = operation === 'load'
      ? 'Medication data could not be loaded.'
      : operation === 'delete'
        ? 'Medication could not be deleted.'
        : 'Medication could not be saved.';
    return new MedicationRepositoryError(message, 'unknown');
  }
}
