export interface CycleEntry {
  startDate: string;
  cycleLengthDays: number;
  periodLengthDays: number;
}

export interface CycleDto {
  start_date: string;
  cycle_length?: number | null;
  period_length?: number | null;
}