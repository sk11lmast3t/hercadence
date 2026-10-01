export type WeightUnit = 'kg' | 'lb';

export interface BodyMetricEntry {
  id?: string;
  userId?: string;
  measuredDate: string;
  weight?: number;
  weightUnit?: WeightUnit;
  waistCm?: number;
  hipCm?: number;
  bodyFatPct?: number;
  notes?: string;
  createdAt?: string;
}

export interface BodyMetricEntryInput
  extends Omit<BodyMetricEntry, 'id' | 'userId' | 'createdAt'> {}

export interface BodyMetricsSaveResult {
  ok: boolean;
  errorMessage: string | null;
  data: BodyMetricEntry | null;
}

export type BodyMetricsLoadStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export class BodyMetricsRepositoryError extends Error {
  constructor(
    message: string,
    public readonly category: 'validation' | 'unauthenticated' | 'forbidden' | 'network' | 'schema' | 'unknown' = 'unknown',
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'BodyMetricsRepositoryError';
  }
}