import { describe, expect, it } from 'vitest';
import {
  mapHydrationDtoToDomain,
  mapHydrationDomainToDto,
} from './hydration.mappers';

describe('hydration mappers', () => {
  it('maps DTO to Domain model correctly', () => {
    const dto = {
      id: 'hyd-123',
      clerk_user_id: 'user_test',
      log_date: '2026-06-20',
      amount_ml: 1500,
      goal_ml: 2500,
      entries: [{ time: '09:00', amount_ml: 500, type: 'water' }],
      created_at: '2026-06-20T09:00:00Z',
    };

    const domain = mapHydrationDtoToDomain(dto);

    expect(domain).toEqual({
      id: 'hyd-123',
      userId: 'user_test',
      logDate: '2026-06-20',
      amountMl: 1500,
      goalMl: 2500,
      entries: [{ time: '09:00', amountMl: 500, type: 'water' }],
      createdAt: '2026-06-20T09:00:00Z',
      updatedAt: undefined,
    });
  });

  it('maps Domain to DTO model correctly', () => {
    const domain = {
      logDate: '2026-06-20',
      amountMl: 1250,
      goalMl: 2000,
      userId: 'user_test',
    };

    const dto = mapHydrationDomainToDto(domain);

    expect(dto).toEqual({
      log_date: '2026-06-20',
      amount_ml: 1250,
      goal_ml: 2000,
      clerk_user_id: 'user_test',
    });
  });
});
