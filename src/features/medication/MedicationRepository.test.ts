import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { MedicationRepository } from './MedicationRepository';
import { MedicationRepositoryError } from './medication.types';

const SELECTED_COLUMNS = 'id, clerk_user_id, name, dosage, frequency, is_active, created_at';

interface TestCall {
  method: string;
  args: unknown[];
}

function createSupabase(
  response: { data: unknown; error: unknown } = { data: null, error: null },
  thrown?: unknown
) {
  const calls: TestCall[] = [];
  const builder: Record<string, unknown> = {};
  const execute = () => thrown ? Promise.reject(thrown) : Promise.resolve(response);

  for (const method of ['select', 'eq', 'order', 'upsert', 'delete']) {
    builder[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    };
  }
  builder.single = () => {
    calls.push({ method: 'single', args: [] });
    return execute();
  };
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
    execute().then(resolve, reject);

  const client = {
    from(table: string) {
      calls.push({ method: 'from', args: [table] });
      return builder;
    },
  } as unknown as SupabaseClient;

  return { client, calls };
}

const persistedDto = {
  id: 'med-1',
  clerk_user_id: 'trusted-user',
  name: 'Vitamin D',
  dosage: '1000 IU',
  frequency: 'Daily',
  is_active: true,
  created_at: '2026-09-30T08:00:00.000Z',
};

describe('MedicationRepository', () => {
  it('rejects unauthenticated load, save, and delete without querying Supabase', async () => {
    const { client, calls } = createSupabase();
    const repository = new MedicationRepository(client, null);

    await expect(repository.load()).rejects.toMatchObject({ category: 'unauthenticated' });
    await expect(repository.save({ name: 'Vitamin D' })).rejects.toMatchObject({ category: 'unauthenticated' });
    await expect(repository.delete('med-1')).rejects.toMatchObject({ category: 'unauthenticated' });
    expect(calls).toEqual([]);
  });

  it('loads an empty list with the exact table, selected columns, owner filter, and ordering', async () => {
    const { client, calls } = createSupabase({ data: [], error: null });
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.load()).resolves.toEqual([]);
    expect(calls).toEqual([
      { method: 'from', args: ['medications'] },
      { method: 'select', args: [SELECTED_COLUMNS] },
      { method: 'eq', args: ['clerk_user_id', 'trusted-user'] },
      { method: 'order', args: ['created_at', { ascending: false }] },
    ]);
  });

  it('maps populated inventory rows into domain entries', async () => {
    const { client } = createSupabase({ data: [persistedDto], error: null });
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.load()).resolves.toEqual([{
      id: 'med-1',
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
      isActive: true,
      createdAt: '2026-09-30T08:00:00.000Z',
    }]);
  });

  it('saves a new entry using only approved fields and trusted ownership', async () => {
    const { client, calls } = createSupabase({ data: persistedDto, error: null });
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.save({
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
    })).resolves.toMatchObject({ id: 'med-1', name: 'Vitamin D' });

    expect(calls.find((call) => call.method === 'from')?.args).toEqual(['medications']);
    expect(calls.find((call) => call.method === 'upsert')?.args[0]).toEqual({
      clerk_user_id: 'trusted-user',
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
    });
    expect(calls.find((call) => call.method === 'select')?.args).toEqual([SELECTED_COLUMNS]);
  });

  it('updates an existing entry by its id', async () => {
    const { client, calls } = createSupabase({
      data: { ...persistedDto, name: 'Vitamin D Updated' },
      error: null,
    });
    const repository = new MedicationRepository(client, 'trusted-user');

    await repository.save({ id: 'med-1', name: 'Vitamin D Updated' });
    expect(calls.find((call) => call.method === 'upsert')?.args[0]).toMatchObject({
      id: 'med-1',
      clerk_user_id: 'trusted-user',
      name: 'Vitamin D Updated',
    });
  });

  it('ignores forged caller ownership', async () => {
    const { client, calls } = createSupabase({ data: persistedDto, error: null });
    const repository = new MedicationRepository(client, 'trusted-user');
    const forged = {
      name: 'Vitamin D',
      clerk_user_id: 'malicious-user',
    } as { name: string; clerk_user_id: string };

    await repository.save(forged);
    expect(calls.find((call) => call.method === 'upsert')?.args[0]).toMatchObject({
      clerk_user_id: 'trusted-user',
    });
  });

  it('deletes only the requested row owned by the trusted user', async () => {
    const { client, calls } = createSupabase({ data: null, error: null });
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.delete('med-1')).resolves.toBeUndefined();
    expect(calls).toEqual([
      { method: 'from', args: ['medications'] },
      { method: 'delete', args: [] },
      { method: 'eq', args: ['id', 'med-1'] },
      { method: 'eq', args: ['clerk_user_id', 'trusted-user'] },
    ]);
  });

  it('rejects an empty name without querying Supabase', async () => {
    const { client, calls } = createSupabase();
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.save({ name: '  ' })).rejects.toMatchObject({ category: 'validation' });
    expect(calls).toEqual([]);
  });

  it('normalizes returned schema errors without exposing raw Supabase messages', async () => {
    const { client } = createSupabase({
      data: null,
      error: { code: '42703', message: 'raw missing-column database detail' },
    });
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.load()).rejects.toMatchObject({
      name: 'MedicationRepositoryError',
      category: 'schema',
      message: expect.not.stringContaining('raw missing-column database detail'),
    });
  });

  it('rejects a save when Supabase returns an error', async () => {
    const { client } = createSupabase({
      data: null,
      error: { code: '42703', message: 'raw missing-column database detail' },
    });
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.save({ name: 'Vitamin D' })).rejects.toMatchObject({
      category: 'schema',
      message: expect.not.stringContaining('raw missing-column database detail'),
    });
  });

  it('rejects a delete when Supabase returns an authorization error', async () => {
    const { client } = createSupabase({
      data: null,
      error: { status: 403, message: 'raw permission detail' },
    });
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.delete('med-1')).rejects.toMatchObject({
      category: 'forbidden',
      message: expect.not.stringContaining('raw permission detail'),
    });
  });

  it('normalizes thrown network errors', async () => {
    const { client } = createSupabase({ data: null, error: null }, new TypeError('fetch failed'));
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.load()).rejects.toMatchObject({
      category: 'network',
      name: 'MedicationRepositoryError',
    });
  });

  it('never returns a fabricated saved row when Supabase returns no data', async () => {
    const { client } = createSupabase({ data: null, error: null });
    const repository = new MedicationRepository(client, 'trusted-user');

    await expect(repository.save({ name: 'Vitamin D' })).rejects.toBeInstanceOf(MedicationRepositoryError);
  });
});
