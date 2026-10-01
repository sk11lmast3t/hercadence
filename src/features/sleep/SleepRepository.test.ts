import { describe, expect, it } from 'vitest';
import { SleepRepository } from './SleepRepository';
import { SleepRepositoryError } from './sleep.types';

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

const validEntry = {
  logDate: '2026-09-28',
  bedtime: '23:15',
  wakeTime: '06:45',
  durationHours: 7.5,
  quality: 'good' as const,
};

describe('SleepRepository', () => {
  it('loads persisted entries for the current user', async () => {
    const repository = new SleepRepository(createClient({
      data: [{ id: 'sleep-1', log_date: '2026-09-28', duration_hours: 7.5 }],
      error: null,
    }) as never, 'user-1');

    await expect(repository.load()).resolves.toEqual([
      { id: 'sleep-1', logDate: '2026-09-28', durationHours: 7.5 },
    ]);
  });

  it('returns the persisted row after a successful save', async () => {
    const repository = new SleepRepository(createClient({
      data: { id: 'sleep-1', log_date: '2026-09-28', duration_hours: 7.5 },
      error: null,
    }) as never, 'user-1');

    await expect(repository.save(validEntry)).resolves.toMatchObject({ id: 'sleep-1', durationHours: 7.5 });
  });

  it('returns an empty list when no records exist', async () => {
    const repository = new SleepRepository(createClient({ data: [], error: null }) as never, 'user-1');

    await expect(repository.load()).resolves.toEqual([]);
  });

  it('rejects invalid duration before making a remote write', async () => {
    const client = createClient({ data: [], error: null });
    const repository = new SleepRepository(client as never, 'user-1');

    await expect(repository.save({ ...validEntry, durationHours: 25 })).rejects.toMatchObject({
      category: 'validation',
    });
  });

  it('normalizes a remote schema error', async () => {
    const repository = new SleepRepository(createClient({
      data: [],
      error: { code: '42703', message: 'column does not exist' },
    }) as never, 'user-1');

    await expect(repository.save(validEntry)).rejects.toMatchObject({ category: 'schema', retryable: false } satisfies Partial<SleepRepositoryError>);
  });

  it('completes a successful delete', async () => {
    const repository = new SleepRepository(createClient({ data: null, error: null }) as never, 'user-1');

    await expect(repository.delete('2026-09-28')).resolves.toBeUndefined();
  });

  it('surfaces a delete error', async () => {
    const repository = new SleepRepository(createClient({
      data: null,
      error: { message: 'delete failed' },
    }) as never, 'user-1');

    await expect(repository.delete('2026-09-28')).rejects.toMatchObject({ message: 'delete failed' });
  });
});