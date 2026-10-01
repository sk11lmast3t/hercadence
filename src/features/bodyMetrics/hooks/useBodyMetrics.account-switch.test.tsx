// src/features/bodyMetrics/hooks/useBodyMetrics.account-switch.test.tsx
// Proves that a stale User A response arriving after account switch to User B
// is discarded and never enters User B's hook state.

// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBodyMetrics } from './useBodyMetrics';

// ── Hoisted shared state ──────────────────────────────────────────────────────

const testState = vi.hoisted(() => ({
  userId: 'user-a' as string | null,
  client: null as unknown,
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ userId: testState.userId }),
}));

vi.mock('../../../hooks/useSupabase', () => ({
  useSupabase: () => testState.client,
}));

// ── Deferred promise helper ───────────────────────────────────────────────────

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((fulfill) => { resolve = fulfill; });
  return { promise, resolve };
}

type FakeResponse = { data: unknown[] | null; error: null };

function createClient(
  requests: Record<string, ReturnType<typeof deferred<FakeResponse>>>
) {
  const chain = (userId: string): unknown => ({
    select: () => chain(userId),
    eq: (_col: string, val: string) => chain(val ?? userId),
    order: () => chain(userId),
    limit: () => chain(userId),
    gte: () => chain(userId),
    lte: () => chain(userId),
    then(
      onFulfilled: (v: FakeResponse) => unknown,
      onRejected?: (r: unknown) => unknown
    ) {
      return requests[userId]?.promise.then(onFulfilled, onRejected)
        ?? Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
    },
  });

  return {
    from: () => chain('__start__'),
    // Build a simpler version: the first .eq('clerk_user_id', userId) captures userId
    _requests: requests,
  } as unknown as import('@supabase/supabase-js').SupabaseClient;
}

// We need a more targeted mock where .eq captures the user filter value
function createUserCapturingClient(
  requests: Record<string, ReturnType<typeof deferred<FakeResponse>>>
) {
  return {
    from: (_table: string) => {
      let capturedUserId = '__unknown__';
      const chain: Record<string, unknown> = {};
      chain['select'] = () => chain;
      chain['eq'] = (_col: string, val: string) => {
        if (_col === 'clerk_user_id') capturedUserId = val;
        return chain;
      };
      chain['order'] = () => chain;
      chain['limit'] = () => chain;
      chain['gte'] = () => chain;
      chain['lte'] = () => chain;
      chain['then'] = (
        onFulfilled: (v: FakeResponse) => unknown,
        onRejected?: (r: unknown) => unknown
      ) => {
        const req = requests[capturedUserId] ?? { promise: Promise.resolve({ data: [], error: null }) };
        return req.promise.then(onFulfilled, onRejected);
      };
      return chain;
    },
  } as unknown as import('@supabase/supabase-js').SupabaseClient;
}

// ── Test harness component ────────────────────────────────────────────────────

function Harness() {
  const { logs } = useBodyMetrics();
  return (
    <output data-testid="dates">
      {logs.map((l) => l.measuredDate).join(',')}
    </output>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useBodyMetrics account switching', () => {
  beforeEach(() => {
    testState.userId = 'user-a';
  });

  afterEach(() => {
    cleanup();
  });

  it('discards User A response arriving after switch to User B', async () => {
    const userARequest = deferred<FakeResponse>();
    const userBRequest = deferred<FakeResponse>();

    testState.client = createUserCapturingClient({
      'user-a': userARequest,
      'user-b': userBRequest,
    });

    const view = render(<Harness />);

    // Switch to User B before User A's request resolves
    testState.userId = 'user-b';
    view.rerender(<Harness />);

    // Resolve User B first
    await act(async () => {
      userBRequest.resolve({
        data: [
          {
            id: 'b-1',
            clerk_user_id: 'user-b',
            measured_date: '2026-09-20',
            weight: 65.0,
            weight_unit: 'kg',
            waist_cm: null,
            hip_cm: null,
            body_fat_pct: null,
            notes: null,
            created_at: null,
          },
        ],
        error: null,
      });
    });

    await waitFor(() =>
      expect(screen.getByTestId('dates').textContent).toContain('2026-09-20')
    );

    // Now resolve User A's stale response — it must NOT appear
    await act(async () => {
      userARequest.resolve({
        data: [
          {
            id: 'a-1',
            clerk_user_id: 'user-a',
            measured_date: '2026-08-01',
            weight: 80.0,
            weight_unit: 'kg',
            waist_cm: null,
            hip_cm: null,
            body_fat_pct: null,
            notes: null,
            created_at: null,
          },
        ],
        error: null,
      });
    });

    // User A's data must not appear in User B's state
    expect(screen.getByTestId('dates').textContent).not.toContain('2026-08-01');
    // User B's data must still be visible
    expect(screen.getByTestId('dates').textContent).toContain('2026-09-20');
  });

  it('clears logs on account switch before new data loads', async () => {
    const userARequest = deferred<FakeResponse>();
    const userBRequest = deferred<FakeResponse>();

    testState.client = createUserCapturingClient({
      'user-a': userARequest,
      'user-b': userBRequest,
    });

    const view = render(<Harness />);

    // Resolve User A immediately
    await act(async () => {
      userARequest.resolve({
        data: [
          {
            id: 'a-1',
            clerk_user_id: 'user-a',
            measured_date: '2026-08-01',
            weight: 80.0,
            weight_unit: 'kg',
            waist_cm: null,
            hip_cm: null,
            body_fat_pct: null,
            notes: null,
            created_at: null,
          },
        ],
        error: null,
      });
    });

    await waitFor(() =>
      expect(screen.getByTestId('dates').textContent).toContain('2026-08-01')
    );

    // Switch to User B — logs must clear before User B's data arrives
    testState.userId = 'user-b';
    view.rerender(<Harness />);

    await waitFor(() =>
      expect(screen.getByTestId('dates').textContent).toBe('')
    );

    // Now resolve User B
    await act(async () => {
      userBRequest.resolve({
        data: [
          {
            id: 'b-1',
            clerk_user_id: 'user-b',
            measured_date: '2026-09-20',
            weight: 65.0,
            weight_unit: 'kg',
            waist_cm: null,
            hip_cm: null,
            body_fat_pct: null,
            notes: null,
            created_at: null,
          },
        ],
        error: null,
      });
    });

    await waitFor(() =>
      expect(screen.getByTestId('dates').textContent).toContain('2026-09-20')
    );
    expect(screen.getByTestId('dates').textContent).not.toContain('2026-08-01');
  });
});
