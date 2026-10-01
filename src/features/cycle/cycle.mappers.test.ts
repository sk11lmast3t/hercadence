import { describe, expect, it } from 'vitest';
import { mapCycleDto } from './cycle.mappers';

describe('Cycle DTO mapping', () => {
  it('maps canonical cycle columns to domain settings', () => {
    expect(mapCycleDto({
      start_date: '2026-09-01',
      cycle_length: 29,
      period_length: 6,
    })).toEqual({
      startDate: '2026-09-01',
      cycleLengthDays: 29,
      periodLengthDays: 6,
    });
  });
});