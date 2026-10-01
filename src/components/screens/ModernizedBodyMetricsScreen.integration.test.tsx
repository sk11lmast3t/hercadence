// src/components/screens/ModernizedBodyMetricsScreen.integration.test.tsx
// Mounted integration tests for ModernizedBodyMetricsScreen.
// Verifies: real persisted data renders, empty state, loading, error,
// save-failure shown from operation result (not stale hook error),
// and no fabricated health values.

// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ModernizedBodyMetricsScreen } from './ModernizedBodyMetricsScreen';

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockHookState = vi.hoisted(() => ({
  logs: [] as Array<{
    id?: string;
    measuredDate: string;
    weight?: number;
    weightUnit?: 'kg' | 'lb';
    notes?: string;
  }>,
  status: 'idle' as 'idle' | 'loading' | 'success' | 'empty' | 'error',
  error: null as string | null,
  saveResult: { ok: true, errorMessage: null, data: null } as {
    ok: boolean;
    errorMessage: string | null;
    data: unknown;
  },
}));

vi.mock('../../features/bodyMetrics/hooks/useBodyMetrics', () => ({
  useBodyMetrics: () => ({
    logs: mockHookState.logs,
    status: mockHookState.status,
    isLoading: mockHookState.status === 'loading',
    error: mockHookState.error,
    load: vi.fn(),
    saveLog: vi.fn(async () => mockHookState.saveResult),
    deleteLog: vi.fn(),
    todayEntry: mockHookState.logs.find(
      (l) => l.measuredDate === new Date().toISOString().slice(0, 10)
    ),
    latestWeight: mockHookState.logs[0]?.weight,
    latestWeightUnit: mockHookState.logs[0]?.weightUnit ?? 'kg',
  }),
}));

vi.mock('../../guides/useGuideProgress', () => ({
  useGuideProgress: () => ({ isVisible: false, dismiss: vi.fn(), replay: vi.fn() }),
}));

vi.mock('../../guides/guideRegistry', () => ({
  bodyMetricsGuide: {
    id: 'guide.wellness.bodyMetrics.v1',
    featureId: 'wellness.bodyMetrics',
    version: 1,
    policy: 'offer',
    steps: [
      {
        id: 'body-metrics-log-intro',
        targetId: 'body-metrics-log-action',
        title: 'Log your weight',
        body: 'Record a weight entry to start tracking.',
      },
    ],
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderScreen() {
  return render(
    <ModernizedBodyMetricsScreen onBack={vi.fn()} onNavigate={vi.fn()} />
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ModernizedBodyMetricsScreen — persisted data', () => {
  beforeEach(() => {
    mockHookState.logs = [];
    mockHookState.status = 'idle';
    mockHookState.error = null;
    mockHookState.saveResult = { ok: true, errorMessage: null, data: null };
  });

  afterEach(() => { cleanup(); });

  it('renders a real persisted weight from repository', async () => {
    mockHookState.logs = [
      { id: 'row-1', measuredDate: '2026-09-10', weight: 68.5, weightUnit: 'kg' },
    ];
    mockHookState.status = 'success';

    renderScreen();

    // The real persisted value must be visible
    await waitFor(() => expect(screen.getByText(/68\.5/)).toBeTruthy());
    // No fabricated values
    expect(screen.queryByText(/135\.2/)).toBeNull();
    expect(screen.queryByText(/Oct 26/)).toBeNull();
  });

  it('shows loading indicator while status is loading', () => {
    mockHookState.status = 'loading';
    renderScreen();
    expect(screen.getByText(/Loading your metrics/i)).toBeTruthy();
  });

  it('shows empty state when status is empty and no logs', () => {
    mockHookState.status = 'empty';
    renderScreen();
    expect(screen.getByTestId('empty-weight')).toBeTruthy();
    expect(screen.getByTestId('empty-weight').textContent).toMatch(/not recorded/i);
  });

  it('shows error message from hook when status is error', () => {
    mockHookState.status = 'error';
    mockHookState.error = 'Unable to load metrics';
    renderScreen();
    expect(screen.getByRole('alert').textContent).toMatch(/unable to load metrics/i);
  });

  it('shows recent history entries from persisted logs', async () => {
    mockHookState.logs = [
      { id: 'r1', measuredDate: '2026-09-10', weight: 68.5, weightUnit: 'kg' },
      { id: 'r2', measuredDate: '2026-09-05', weight: 69.0, weightUnit: 'kg' },
    ];
    mockHookState.status = 'success';

    renderScreen();

    await waitFor(() => {
      expect(screen.getByText(/68\.5/)).toBeTruthy();
    });
    expect(screen.getByText(/69\.0/)).toBeTruthy();
  });

  it('shows no-history notice when status is empty', () => {
    mockHookState.status = 'empty';
    mockHookState.logs = [];
    renderScreen();
    expect(screen.getByTestId('no-history')).toBeTruthy();
  });
});

describe('ModernizedBodyMetricsScreen — no fabricated health data', () => {
  afterEach(() => { cleanup(); });
  it('does not render the hardcoded 135.2 lbs value', () => {
    mockHookState.status = 'empty';
    renderScreen();
    expect(screen.queryByText(/135\.2/)).toBeNull();
  });

  it('does not render static Oct 26 date label', () => {
    mockHookState.status = 'empty';
    renderScreen();
    expect(screen.queryByText(/Today, Oct 26/)).toBeNull();
  });

  it('does not render static weight history entries', () => {
    mockHookState.status = 'empty';
    renderScreen();
    expect(screen.queryByText(/Luteal phase day 24/)).toBeNull();
    expect(screen.queryByText(/Post-ovulation/)).toBeNull();
    expect(screen.queryByText(/Follicular phase baseline/)).toBeNull();
  });

  it('does not render +3.0 lbs cycle flux badge', () => {
    mockHookState.status = 'empty';
    renderScreen();
    expect(screen.queryByText(/\+3\.0/)).toBeNull();
    expect(screen.queryByText(/cycle flux/)).toBeNull();
  });

  it('does not render the SVG chart with fabricated data points', () => {
    mockHookState.status = 'empty';
    const { container } = renderScreen();
    // The old screen had an SVG with hardcoded 132/134/136 text nodes
    const svgTexts = Array.from(container.querySelectorAll('svg text')).map(
      (el) => el.textContent
    );
    expect(svgTexts).not.toContain('132');
    expect(svgTexts).not.toContain('136');
  });
});

describe('ModernizedBodyMetricsScreen — save operation', () => {
  beforeEach(() => {
    mockHookState.logs = [];
    mockHookState.status = 'empty';
    mockHookState.error = null;
  });

  afterEach(() => { cleanup(); });

  it('shows success toast text when save succeeds', async () => {
    mockHookState.saveResult = { ok: true, errorMessage: null, data: null };
    renderScreen();

    // Open modal
    fireEvent.click(screen.getByText('Log Weight'));
    const input = document.getElementById('weight-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    fireEvent.change(input, { target: { value: '70.0' } });
    fireEvent.click(screen.getByText('Save Entry'));

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toMatch(/Weight logged: 70\.0/i)
    );
  });

  it('shows failure toast from returned result, not stale hook error', async () => {
    // Error starts null — stale closure test: error is null at render time
    mockHookState.error = null;
    mockHookState.saveResult = {
      ok: false,
      errorMessage: 'Weight could not be saved — server error',
      data: null,
    };

    renderScreen();

    fireEvent.click(screen.getByText('Log Weight'));
    const input = document.getElementById('weight-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    fireEvent.change(input, { target: { value: '70.0' } });
    fireEvent.click(screen.getByText('Save Entry'));

    await waitFor(() => {
      const toast = screen.getByRole('status');
      expect(toast.textContent).toMatch(/Weight could not be saved/i);
    });
  });

  it('shows validation error when weight input is empty', async () => {
    renderScreen();

    fireEvent.click(screen.getByText('Log Weight'));
    // Leave input empty
    fireEvent.click(screen.getByText('Save Entry'));

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toMatch(/Please enter a valid weight/i)
    );
  });
});
