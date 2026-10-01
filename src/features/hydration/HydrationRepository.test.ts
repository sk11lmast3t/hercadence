import { describe, expect, it } from 'vitest';
import { HydrationRepository } from './HydrationRepository';
import { HydrationRepositoryError } from './hydration.types';

function createClient(result: { data?: unknown; error?: { code?: string; message: string } | null }) {
  const query = {
    select: () => query,
    eq: () => query,
    order: () => query,
    limit: () => query,
    gte: () => query,
    lte: () => query,
    upsert: () => query,
    single: async () => result,
    delete: () => query,
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };

  return { from: () => query };
}

describe('HydrationRepository', () => {
  it('loads hydration entries filtered by authenticated user id', async () => {
    const mockData = [
      {
        id: 'hyd-1',
        clerk_user_id: 'user_123',
        log_date: '2026-06-20',
        amount_ml: 1500,
        goal_ml: 2500,
      },
    ];
    const client = createClient({ data: mockData, error: null });
    const repo = new HydrationRepository(client as never, 'user_123');

    const result = await repo.load();

    expect(result).toHaveLength(1);
    expect(result[0].amountMl).toBe(1500);
  });

  it('throws error when user is not authenticated', async () => {
    const client = createClient({ data: [], error: null });
    const repo = new HydrationRepository(client as never, null);

    await expect(repo.load()).rejects.toThrow('Not authenticated');
  });

  it('saves hydration entry and returns mapped domain object', async () => {
    const mockReturned = {
      id: 'hyd-2',
      clerk_user_id: 'user_123',
      log_date: '2026-06-20',
      amount_ml: 2000,
      goal_ml: 2500,
    };
    const client = createClient({ data: mockReturned, error: null });
    const repo = new HydrationRepository(client as never, 'user_123');

    const result = await repo.save({ logDate: '2026-06-20', amountMl: 2000, goalMl: 2500 });

    expect(result.id).toBe('hyd-2');
    expect(result.amountMl).toBe(2000);
  });

  it('validates invalid logDate format', async () => {
    const client = createClient({ data: null, error: null });
    const repo = new HydrationRepository(client as never, 'user_123');

    await expect(
      repo.save({ logDate: 'invalid-date', amountMl: 500, goalMl: 2000 })
    ).rejects.toThrow('Log date must use YYYY-MM-DD format');
  });

  it('validates invalid amountMl', async () => {
    const client = createClient({ data: null, error: null });
    const repo = new HydrationRepository(client as never, 'user_123');

    await expect(
      repo.save({ logDate: '2026-06-20', amountMl: -100, goalMl: 2000 })
    ).rejects.toThrow('Hydration amount must be between 0 and 10,000 ml');
  });

  it('normalizes database errors into HydrationRepositoryError', async () => {
    const client = createClient({ data: null, error: { message: 'DB connection error' } });
    const repo = new HydrationRepository(client as never, 'user_123');

    await expect(repo.load()).rejects.toBeInstanceOf(HydrationRepositoryError);
  });
});
