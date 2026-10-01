// @vitest-environment jsdom
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHydration } from './useHydration';

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

function createClient(requests: Record<string, ReturnType<typeof deferred<{ data: unknown[]; error: null }>>>) {
  return {
    from: () => ({
      select: () => ({
        eq: (_column: string, userId: string) => ({
          order() { return this; },
          limit() { return this; },
          then(onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
            return requests[userId].promise.then(onFulfilled, onRejected);
          },
        }),
      }),
    }),
  };
}

function Harness() {
  const { logs } = useHydration();
  return <output data-testid="logs">{logs.map((log) => log.logDate).join(',')}</output>;
}

describe('useHydration account switching', () => {
  beforeEach(() => {
    testState.userId = 'user-a';
  });

  it('does not apply an old user response after switching accounts', async () => {
    const userARequest = deferred<{ data: unknown[]; error: null }>();
    const userBRequest = deferred<{ data: unknown[]; error: null }>();
    testState.client = createClient({ 'user-a': userARequest, 'user-b': userBRequest });

    const view = render(<Harness />);
    testState.userId = 'user-b';
    view.rerender(<Harness />);

    await act(async () => {
      userBRequest.resolve({
        data: [{ id: 'b-1', log_date: '2026-06-20', amount_ml: 1500, goal_ml: 2500 }],
        error: null,
      });
    });
    await waitFor(() => expect(screen.getByTestId('logs').textContent).toContain('2026-06-20'));

    await act(async () => {
      userARequest.resolve({
        data: [{ id: 'a-1', log_date: '2026-06-01', amount_ml: 1000, goal_ml: 2500 }],
        error: null,
      });
    });

    expect(screen.getByTestId('logs').textContent).not.toContain('2026-06-01');
  });
});
