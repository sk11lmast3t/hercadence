// src/features/physicalActivity/hooks/usePhysicalActivity.account-switch.test.tsx
// Proves that a stale User A response arriving after account switch to User B
// is discarded and never enters User B's hook state.

// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePhysicalActivity } from './usePhysicalActivity';

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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((fulfill) => {
    resolve = fulfill;
  });
  return { promise, resolve };
}

type FakeResponse = { data: unknown[] | null; error: null };

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
        const req = requests[capturedUserId] ?? {
          promise: Promise.resolve({ data: [], error: null }),
        };
        return req.promise.then(onFulfilled, onRejected);
      };
      return chain;
    },
  } as unknown as import('@supabase/supabase-js').SupabaseClient;
}

function Harness() {
  const { logs } = usePhysicalActivity();
  return (
    <output data-testid="dates">
      {logs.map((l) => l.logDate).join(',')}
    </output>
  );
}

describe('usePhysicalActivity account switching', () => {
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
            log_date: '2026-09-20',
            activity_type: 'Walking',
            duration_mins: 30,
            intensity: 'low',
            calories_burned: 100,
            steps: 3000,
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
            log_date: '2026-08-01',
            activity_type: 'Running',
            duration_mins: 45,
            intensity: 'high',
            calories_burned: 400,
            steps: 7000,
            notes: null,
            created_at: null,
          },
        ],
        error: null,
      });
    });

    expect(screen.getByTestId('dates').textContent).not.toContain('2026-08-01');
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

    await act(async () => {
      userARequest.resolve({
        data: [
          {
            id: 'a-1',
            clerk_user_id: 'user-a',
            log_date: '2026-08-01',
            activity_type: 'Running',
            duration_mins: 45,
            intensity: 'high',
            calories_burned: 400,
            steps: 7000,
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

    testState.userId = 'user-b';
    view.rerender(<Harness />);

    await waitFor(() =>
      expect(screen.getByTestId('dates').textContent).toBe('')
    );

    await act(async () => {
      userBRequest.resolve({
        data: [
          {
            id: 'b-1',
            clerk_user_id: 'user-b',
            log_date: '2026-09-20',
            activity_type: 'Walking',
            duration_mins: 30,
            intensity: 'low',
            calories_burned: 100,
            steps: 3000,
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
