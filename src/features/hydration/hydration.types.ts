export interface HydrationLogDto {
  id?: string;
  clerk_user_id?: string;
  log_date: string;
  amount_ml: number;
  goal_ml?: number;
  entries?: Array<{ time: string; amount_ml: number; type?: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface HydrationLogDomain {
  id?: string;
  userId?: string;
  logDate: string;
  amountMl: number;
  goalMl: number;
  entries?: Array<{ time: string; amountMl: number; type?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface HydrationSaveResult {
  ok: boolean;
  errorMessage: string | null;
  data: HydrationLogDomain | null;
}

export class HydrationRepositoryError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'HydrationRepositoryError';
  }
}
