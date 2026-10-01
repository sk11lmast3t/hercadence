export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface SleepEntry {
  id?: string;
  logDate: string;
  bedtime?: string;
  wakeTime?: string;
  durationHours: number | null;
  quality?: SleepQuality;
  notes?: string;
}

export type SleepEntryInput = Omit<SleepEntry, 'id'> & { id?: string };

export type SleepErrorCategory =
  | 'validation'
  | 'unauthenticated'
  | 'forbidden'
  | 'network'
  | 'schema'
  | 'unknown';

export class SleepRepositoryError extends Error {
  constructor(
    message: string,
    public readonly category: SleepErrorCategory,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'SleepRepositoryError';
  }
}