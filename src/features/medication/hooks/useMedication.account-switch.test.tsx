// @vitest-environment jsdom
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMedication } from './useMedication';

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
          then(onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
            return requests[userId].promise.then(onFulfilled, onRejected);
          },
        }),
      }),
    }),
  };
}

function Harness() {
  const { medications } = useMedication();
  return <output data-testid="medications">{medications.map((med) => med.id).join(',')}</output>;
}

describe('useMedication account switching', () => {
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
        data: [{ id: 'b-1', clerk_user_id: 'user-b', name: 'Vitamin D', dosage: '1000 IU', frequency: 'Daily', is_active: true, created_at: '2026-09-30T00:00:00.000Z' }],
        error: null,
      });
    });
    await waitFor(() => expect(screen.getByTestId('medications').textContent).toContain('b-1'));

    await act(async () => {
      userARequest.resolve({
        data: [{ id: 'a-1', clerk_user_id: 'user-a', name: 'Iron', dosage: '25 mg', frequency: 'Daily', is_active: true, created_at: '2026-09-01T00:00:00.000Z' }],
        error: null,
      });
    });

    expect(screen.getByTestId('medications').textContent).not.toContain('a-1');
  });
});
