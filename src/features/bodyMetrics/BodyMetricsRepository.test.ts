// src/features/bodyMetrics/BodyMetricsRepository.test.ts
// Unit tests for BodyMetricsRepository using an injected test Supabase client.

import { describe, expect, it, vi } from 'vitest';
import { BodyMetricsRepository } from './BodyMetricsRepository';
import { BodyMetricsRepositoryError } from './bodyMetrics.types';

// ── Test client factory ───────────────────────────────────────────────────────

function makeChain(result: { data: unknown; error: unknown }) {
  return {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    gte: () => chain,
    lte: () => chain,
    upsert: () => chain,
    insert: () => chain,
    delete: () => chain,
    single: () => Promise.resolve(result),
    then: (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve),
  };
  var chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    gte: () => chain,
    lte: () => chain,
    upsert: () => chain,
    insert: () => chain,
    delete: () => chain,
    single: () => Promise.resolve(result),
    then: (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

function makeClient(result: { data: unknown; error: unknown }) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    gte: () => chain,
    lte: () => chain,
    upsert: (_dto: unknown, _opts?: unknown) => chain,
    delete: () => chain,
    single: () => Promise.resolve(result),
    // Thenable — allows `await supabase.from(...).select(...)...` pattern
    then: (
      onFulfilled: (v: { data: unknown; error: unknown }) => unknown,
      onRejected?: (r: unknown) => unknown
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return { from: (_table: string) => chain } as unknown as import('@supabase/supabase-js').SupabaseClient;
}

// ── Load ──────────────────────────────────────────────────────────────────────

describe('BodyMetricsRepository.load', () => {
  it('returns mapped domain entries on success', async () => {
    const client = makeClient({
      data: [
        {
          id: 'row-1',
          clerk_user_id: 'user-a',
          measured_date: '2026-09-10',
          weight: 68.5,
          weight_unit: 'kg',
          waist_cm: null,
          hip_cm: null,
          body_fat_pct: null,
          notes: null,
          created_at: '2026-09-10T07:00:00Z',
        },
      ],
      error: null,
    });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const result = await repo.load();
    expect(result).toHaveLength(1);
    expect(result[0].measuredDate).toBe('2026-09-10');
    expect(result[0].weight).toBe(68.5);
    expect(result[0].weightUnit).toBe('kg');
  });

  it('returns empty array when no rows', async () => {
    const client = makeClient({ data: [], error: null });
    const repo = new BodyMetricsRepository(client, 'user-a');
    expect(await repo.load()).toEqual([]);
  });

  it('returns empty array when data is null', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, 'user-a');
    expect(await repo.load()).toEqual([]);
  });

  it('throws BodyMetricsRepositoryError on Supabase returned error', async () => {
    const client = makeClient({ data: null, error: { message: 'DB down', code: '500' } });
    const repo = new BodyMetricsRepository(client, 'user-a');
    await expect(repo.load()).rejects.toBeInstanceOf(BodyMetricsRepositoryError);
  });

  it('throws unauthenticated when userId is null', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, null);
    const err = await repo.load().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BodyMetricsRepositoryError);
    expect((err as BodyMetricsRepositoryError).category).toBe('unauthenticated');
  });

  it('classifies PGRST schema errors correctly', async () => {
    const client = makeClient({
      data: null,
      error: { message: 'column missing', code: 'PGRST204' },
    });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo.load().catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('schema');
  });

  it('classifies 42703 column errors correctly', async () => {
    const client = makeClient({
      data: null,
      error: { message: 'column does not exist', code: '42703' },
    });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo.load().catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('schema');
  });
});

// ── Save ──────────────────────────────────────────────────────────────────────

describe('BodyMetricsRepository.save', () => {
  it('returns the persisted entry on success', async () => {
    const client = makeClient({
      data: {
        id: 'row-2',
        clerk_user_id: 'user-a',
        measured_date: '2026-09-11',
        weight: 70.0,
        weight_unit: 'kg',
        waist_cm: null,
        hip_cm: null,
        body_fat_pct: null,
        notes: null,
        created_at: '2026-09-11T08:00:00Z',
      },
      error: null,
    });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const saved = await repo.save({ measuredDate: '2026-09-11', weight: 70.0, weightUnit: 'kg' });
    expect(saved.measuredDate).toBe('2026-09-11');
    expect(saved.weight).toBe(70.0);
  });

  it('throws on Supabase returned error', async () => {
    const client = makeClient({ data: null, error: { message: 'RLS violation', status: 403 } });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo
      .save({ measuredDate: '2026-09-11', weight: 70 })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BodyMetricsRepositoryError);
    expect((err as BodyMetricsRepositoryError).category).toBe('forbidden');
  });

  it('throws validation error for invalid date format', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo.save({ measuredDate: 'not-a-date' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BodyMetricsRepositoryError);
    expect((err as BodyMetricsRepositoryError).category).toBe('validation');
  });

  it('throws validation error for negative weight', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo
      .save({ measuredDate: '2026-09-11', weight: -5 })
      .catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('validation');
  });

  it('throws validation error for weight > 500', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo
      .save({ measuredDate: '2026-09-11', weight: 600 })
      .catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('validation');
  });

  it('throws validation error for body fat > 100', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo
      .save({ measuredDate: '2026-09-11', bodyFatPct: 110 })
      .catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('validation');
  });

  it('throws unauthenticated when userId is null', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, null);
    const err = await repo
      .save({ measuredDate: '2026-09-11' })
      .catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('unauthenticated');
  });

  it('uses userId from repository constructor, never from caller entry', async () => {
    const insertedDto: Record<string, unknown> = {};
    const spyClient = {
      from: (_table: string) => ({
        upsert: (dto: Record<string, unknown>) => {
          Object.assign(insertedDto, dto);
          return {
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { ...dto, measured_date: dto.measured_date ?? '2026-09-12' },
                  error: null,
                }),
            }),
          };
        },
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient;

    const repo = new BodyMetricsRepository(spyClient, 'user-from-constructor');
    await repo.save({ measuredDate: '2026-09-12', weight: 65 });
    // The DTO sent to Supabase must use the constructor userId, not a caller-supplied one
    expect(insertedDto['clerk_user_id']).toBe('user-from-constructor');
  });
});

// ── Delete ────────────────────────────────────────────────────────────────────

describe('BodyMetricsRepository.delete', () => {
  it('resolves without error on success', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, 'user-a');
    await expect(repo.delete('2026-09-10')).resolves.toBeUndefined();
  });

  it('throws on Supabase returned error', async () => {
    const client = makeClient({ data: null, error: { message: 'Delete failed' } });
    const repo = new BodyMetricsRepository(client, 'user-a');
    await expect(repo.delete('2026-09-10')).rejects.toBeInstanceOf(BodyMetricsRepositoryError);
  });

  it('throws validation error for invalid date', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo.delete('bad-date').catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('validation');
  });

  it('throws unauthenticated when userId is null', async () => {
    const client = makeClient({ data: null, error: null });
    const repo = new BodyMetricsRepository(client, null);
    const err = await repo.delete('2026-09-10').catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('unauthenticated');
  });
});

// ── Error normalisation ───────────────────────────────────────────────────────

describe('BodyMetricsRepository error normalisation', () => {
  it('classifies 401 as unauthenticated', async () => {
    const client = makeClient({ data: null, error: { message: 'JWT expired', status: 401 } });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo.load().catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('unauthenticated');
  });

  it('classifies 5xx as network retryable', async () => {
    const client = makeClient({ data: null, error: { message: 'Server error', status: 503 } });
    const repo = new BodyMetricsRepository(client, 'user-a');
    const err = await repo.load().catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('network');
    expect((err as BodyMetricsRepositoryError).retryable).toBe(true);
  });

  it('classifies TypeError as network retryable', async () => {
    // Build a chain that throws a TypeError at await-time (via .then())
    const networkError = new TypeError('Failed to fetch');
    const throwingChain = {
      select: function() { return this; },
      eq: function() { return this; },
      order: function() { return this; },
      limit: function() { return this; },
      gte: function() { return this; },
      lte: function() { return this; },
      then(
        _onFulfilled: (v: unknown) => unknown,
        onRejected?: (r: unknown) => unknown
      ) {
        return Promise.reject(networkError).then(_onFulfilled, onRejected);
      },
    };
    const throwingClient = {
      from: () => throwingChain,
    } as unknown as import('@supabase/supabase-js').SupabaseClient;
    const repo = new BodyMetricsRepository(throwingClient, 'user-a');
    const err = await repo.load().catch((e: unknown) => e);
    expect((err as BodyMetricsRepositoryError).category).toBe('network');
    expect((err as BodyMetricsRepositoryError).retryable).toBe(true);
  });
});
