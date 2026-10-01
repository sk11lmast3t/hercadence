// src/features/physicalActivity/PhysicalActivityRepository.test.ts
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PhysicalActivityRepository } from './PhysicalActivityRepository';
import { PhysicalActivityRepositoryError } from './physicalActivity.types';

function createMockSupabase(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null }),
    ...overrides,
  };

  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  };
}

describe('PhysicalActivityRepository', () => {
  const userId = 'user_test_123';

  describe('unauthenticated guard', () => {
    it('throws unauthenticated error if userId is missing on load', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, null);

      await expect(repo.load()).rejects.toThrow(PhysicalActivityRepositoryError);
      await expect(repo.load()).rejects.toMatchObject({
        category: 'unauthenticated',
      });
    });

    it('throws unauthenticated error if userId is missing on save', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, undefined);

      await expect(
        repo.save({ logDate: '2026-09-30', activityType: 'Walking', durationMins: 20 })
      ).rejects.toMatchObject({ category: 'unauthenticated' });
    });
  });

  describe('validation', () => {
    it('rejects invalid logDate format', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await expect(
        repo.save({ logDate: '09/30/2026', durationMins: 30 })
      ).rejects.toThrow('Log date must use YYYY-MM-DD format');
    });

    it('rejects duration out of 0-1440 range', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await expect(
        repo.save({ logDate: '2026-09-30', durationMins: -10 })
      ).rejects.toThrow('Duration must be between 0 and 1440 minutes');

      await expect(
        repo.save({ logDate: '2026-09-30', durationMins: 1500 })
      ).rejects.toThrow('Duration must be between 0 and 1440 minutes');
    });

    it('rejects negative calories burned', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await expect(
        repo.save({ logDate: '2026-09-30', caloriesBurned: -50 })
      ).rejects.toThrow('Calories burned must be a non-negative number');
    });

    it('rejects negative steps', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await expect(
        repo.save({ logDate: '2026-09-30', steps: -100 })
      ).rejects.toThrow('Steps must be a non-negative number');
    });
  });

  describe('load', () => {
    it('queries activity_logs table for current user', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await repo.load();

      expect(mockClient.from).toHaveBeenCalledWith('activity_logs');
      expect(mockClient._chain.eq).toHaveBeenCalledWith('clerk_user_id', userId);
    });

    it('applies date filters when provided', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await repo.load('2026-09-01', '2026-09-30');

      expect(mockClient._chain.gte).toHaveBeenCalledWith('log_date', '2026-09-01');
      expect(mockClient._chain.lte).toHaveBeenCalledWith('log_date', '2026-09-30');
    });
  });

  describe('save (ownership & persistence)', () => {
    it('uses authenticated userId from constructor, ignoring caller-supplied entry.userId', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await repo.save({
        logDate: '2026-09-30',
        activityType: 'Swimming',
        durationMins: 30,
        userId: 'attacker_user_id',
      });

      expect(mockClient._chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          clerk_user_id: userId,
        })
      );
    });

    it('uses insert for new entries without id', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await repo.save({
        logDate: '2026-09-30',
        activityType: 'Pilates',
        durationMins: 40,
      });

      expect(mockClient._chain.insert).toHaveBeenCalled();
    });

    it('uses upsert for existing entries with id', async () => {
      const mockClient = createMockSupabase();
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await repo.save({
        id: 'existing-act-id',
        logDate: '2026-09-30',
        activityType: 'Pilates',
        durationMins: 45,
      });

      expect(mockClient._chain.upsert).toHaveBeenCalled();
    });
  });

  describe('error normalization', () => {
    it('classifies schema error code 42703', async () => {
      const mockClient = createMockSupabase({
        then: (resolve: (v: unknown) => unknown) =>
          resolve({ error: { code: '42703', message: 'column duration_mins does not exist' } }),
      });
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await expect(repo.load()).rejects.toMatchObject({
        category: 'schema',
      });
    });

    it('classifies HTTP 500 error as retryable network error', async () => {
      const mockClient = createMockSupabase({
        then: (resolve: (v: unknown) => unknown) =>
          resolve({ error: { status: 503, message: 'Service unavailable' } }),
      });
      const repo = new PhysicalActivityRepository(mockClient as never, userId);

      await expect(repo.load()).rejects.toMatchObject({
        category: 'network',
        retryable: true,
      });
    });
  });
});
