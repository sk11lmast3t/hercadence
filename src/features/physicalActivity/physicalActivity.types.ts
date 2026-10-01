export type ActivityIntensity = 'low' | 'moderate' | 'high' | 'extreme';

export interface PhysicalActivityEntry {
  id?: string;
  userId?: string;
  logDate: string; // YYYY-MM-DD
  activityType?: string;
  durationMins?: number;
  intensity?: ActivityIntensity;
  caloriesBurned?: number;
  steps?: number;
  notes?: string;
  createdAt?: string;
}

export interface PhysicalActivityEntryInput
  extends Omit<PhysicalActivityEntry, 'id' | 'userId' | 'createdAt'> {}

export interface PhysicalActivitySaveResult {
  ok: boolean;
  errorMessage: string | null;
  data: PhysicalActivityEntry | null;
}

export type PhysicalActivityLoadStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export class PhysicalActivityRepositoryError extends Error {
  constructor(
    message: string,
    public readonly category: 'validation' | 'unauthenticated' | 'forbidden' | 'network' | 'schema' | 'unknown' = 'unknown',
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'PhysicalActivityRepositoryError';
  }
}
