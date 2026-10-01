import type { SupabaseClient } from '@supabase/supabase-js';
import { mapCycleDto } from './cycle.mappers';
import { CycleEntry } from './cycle.types';

export class CycleRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async loadLatest(): Promise<CycleEntry | null> {
    const { data, error } = await this.supabase
      .from('cycles')
      .select('start_date, cycle_length, period_length')
      .eq('clerk_user_id', this.userId)
      .order('start_date', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? mapCycleDto(data[0]) : null;
  }
}