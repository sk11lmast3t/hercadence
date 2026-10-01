// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModernizedSleepInsightsScreen } from './ModernizedSleepInsightsScreen';

const testState = vi.hoisted(() => ({
  sleep: {
    logs: [] as Array<{ id: string; logDate: string; bedtime: string; wakeTime: string; durationHours: number; quality: 'good' }>,
    status: 'success' as 'loading' | 'empty' | 'success' | 'error',
    isLoading: false,
    error: null as string | null,
    saveSleepLog: vi.fn(),
  },
}));

vi.mock('../../features/sleep/hooks/useSleep', () => ({
  useSleep: () => testState.sleep,
}));

vi.mock('../../guides/useGuideProgress', () => ({
  useGuideProgress: () => ({ isVisible: false, dismiss: vi.fn(), replay: vi.fn() }),
}));

describe('ModernizedSleepInsightsScreen mounted behavior', () => {
  beforeEach(() => {
    testState.sleep.logs = [];
    testState.sleep.status = 'success';
    testState.sleep.isLoading = false;
    testState.sleep.error = null;
    testState.sleep.saveSleepLog.mockReset();
  });

  afterEach(() => cleanup());

  it('renders a persisted Sleep record', () => {
    testState.sleep.logs = [{
      id: 'sleep-1',
      logDate: '2026-09-29',
      bedtime: '23:15',
      wakeTime: '06:45',
      durationHours: 7.5,
      quality: 'good',
    }];

    render(<ModernizedSleepInsightsScreen onBack={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByText('2026-09-29')).toBeTruthy();
    expect(screen.getAllByText('7h 30m').length).toBeGreaterThan(0);
  });

  it('renders loading, empty, and error states from the hook', () => {
    testState.sleep.status = 'loading';
    testState.sleep.isLoading = true;
    const view = render(<ModernizedSleepInsightsScreen onBack={vi.fn()} onNavigate={vi.fn()} />);
    expect(screen.getByText('Loading your sleep records...')).toBeTruthy();

    testState.sleep.status = 'empty';
    testState.sleep.isLoading = false;
    view.rerender(<ModernizedSleepInsightsScreen onBack={vi.fn()} onNavigate={vi.fn()} />);
    expect(screen.getByText(/No sleep records yet/)).toBeTruthy();

    testState.sleep.status = 'error';
    testState.sleep.isLoading = false;
    testState.sleep.error = 'Database unavailable';
    view.rerender(<ModernizedSleepInsightsScreen onBack={vi.fn()} onNavigate={vi.fn()} />);
    expect(screen.getByText('Database unavailable')).toBeTruthy();
  });

  it('shows an honest error after a failed save (reads from result, not stale closure)', async () => {
    // The hook's error state starts null; the error must come from the operation result.
    // This test verifies the stale-closure fix: the toast message is taken directly
    // from saveSleepLog's returned errorMessage, not from the pre-render sleepError.
    testState.sleep.error = null;
    testState.sleep.saveSleepLog.mockResolvedValue({ ok: false, errorMessage: 'Database unavailable' });
    render(<ModernizedSleepInsightsScreen onBack={vi.fn()} onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Log Sleep Times' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Log' }));

    await waitFor(() => expect(screen.getByText('Database unavailable')).toBeTruthy());
    expect(screen.queryByText(/Saved locally/i)).toBeNull();
  });
});