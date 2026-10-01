import { describe, expect, it } from 'vitest';
import { mapSleepDto, toSleepDto } from './sleep.mappers';

describe('Sleep DTO mapping', () => {
  it('maps canonical persistence fields to the domain model', () => {
    expect(mapSleepDto({
      id: 'sleep-1',
      log_date: '2026-09-28',
      bedtime: '23:15',
      wake_time: '06:45',
      duration_hours: 7.5,
      quality: 'good',
      notes: 'Restful night',
    })).toEqual({
      id: 'sleep-1',
      logDate: '2026-09-28',
      bedtime: '23:15',
      wakeTime: '06:45',
      durationHours: 7.5,
      quality: 'good',
      notes: 'Restful night',
    });
  });

  it('maps the domain model to the canonical persistence fields', () => {
    expect(toSleepDto({
      logDate: '2026-09-28',
      bedtime: '23:15',
      wakeTime: '06:45',
      durationHours: 7.5,
      quality: 'good',
      notes: 'Restful night',
    }, 'user-1')).toEqual({
      clerk_user_id: 'user-1',
      log_date: '2026-09-28',
      bedtime: '23:15',
      wake_time: '06:45',
      duration_hours: 7.5,
      quality: 'good',
      notes: 'Restful night',
    });
  });
});