// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModernizedHydrationTrackerScreen } from './ModernizedHydrationTrackerScreen';

const testState = vi.hoisted(() => ({
  hydration: {
    load: vi.fn(),
    saveLog: vi.fn(),
    todayTotal: 1000,
    logs: [{ id: 'hyd-1', logDate: new Date().toISOString().slice(0, 10), amountMl: 1000, goalMl: 2500 }],
    isLoading: false,
    error: null as string | null,
    status: 'success',
  },
}));

vi.mock('../../hooks/useHydration', () => ({
  useHydration: () => testState.hydration,
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ userId: 'user_test_123' }),
}));

describe('ModernizedHydrationTrackerScreen integration', () => {
  beforeEach(() => {
    testState.hydration.todayTotal = 1000;
    testState.hydration.error = null;
    testState.hydration.saveLog.mockReset();
  });

  afterEach(() => cleanup());

  it('renders real persisted hydration data correctly without fake default', async () => {
    render(<ModernizedHydrationTrackerScreen onBack={vi.fn()} />);

    expect(screen.getByText('Hydration Tracker')).toBeTruthy();
    expect(screen.getByText('1.0L / 2.5L')).toBeTruthy();
    expect(screen.getByText('40% of Goal')).toBeTruthy();
  });

  it('starts with initial error state null and displays explicit failure message returned by saveLog on save failure', async () => {
    // Section 7 Testing requirement: initial error state = null, save operation resolves with explicit failure
    testState.hydration.error = null;
    testState.hydration.saveLog.mockResolvedValueOnce({
      ok: false,
      errorMessage: 'Database write failed due to network error',
      data: null,
    });

    render(<ModernizedHydrationTrackerScreen onBack={vi.fn()} />);

    // Initial error message should not be present
    expect(screen.queryByText('Database write failed due to network error')).toBeNull();

    // Click 250ml quick-add button
    const add250Btn = screen.getByRole('button', { name: /250ml/i });
    fireEvent.click(add250Btn);

    await waitFor(() => {
      expect(screen.getByText('Database write failed due to network error')).toBeTruthy();
    });
  });
});
