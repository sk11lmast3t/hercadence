export interface MedicationEntry {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface MedicationEntryInput {
  id?: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export type MedicationLoadStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface MedicationSaveResult {
  ok: boolean;
  errorMessage: string | null;
  medication: MedicationEntry | null;
}

export type MedicationErrorCategory =
  | 'validation'
  | 'unauthenticated'
  | 'forbidden'
  | 'schema'
  | 'network'
  | 'unknown';

export class MedicationRepositoryError extends Error {
  constructor(
    message: string,
    public readonly category: MedicationErrorCategory,
    public readonly retryable = false
  ) {
    super(message);
    this.name = 'MedicationRepositoryError';
  }
}

export interface MedicationDto {
  id: string;
  clerk_user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MedicationDtoWrite {
  id?: string;
  clerk_user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  is_active?: boolean;
  created_at?: string;
}
