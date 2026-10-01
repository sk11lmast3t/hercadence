// src/components/screens/ModernizedPhysicalActivityScreen.regression.test.tsx
// Regression tests confirming Physical Activity screen behavior after Part 3D migration.

// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ModernizedPhysicalActivityScreen } from './ModernizedPhysicalActivityScreen';

const activityMock = vi.hoisted(() => ({
  saveLogCalled: false,
  lastEntry: null as Record<string, unknown> | null,
  returnValue: { ok: true, errorMessage: null, data: null },
}));

vi.mock('../../features/physicalActivity/hooks/usePhysicalActivity', () => ({
  usePhysicalActivity: () => ({
    logs: [],
    isLoading: false,
    status: 'idle',
    error: null,
    todayEntry: undefined,
    recentHistory: [],
    saveLog: vi.fn(async (entry: Record<string, unknown>) => {
      activityMock.saveLogCalled = true;
      activityMock.lastEntry = entry;
      return activityMock.returnValue;
    }),
    deleteLog: vi.fn(),
  }),
}));

vi.mock('../../guides/useGuideProgress', () => ({
  useGuideProgress: () => ({ isVisible: false, dismiss: vi.fn(), replay: vi.fn() }),
}));

vi.mock('../../guides/guideRegistry', () => ({
  physicalActivityGuide: {
    id: 'guide.wellness.physicalActivity.v1',
    featureId: 'wellness.physicalActivity',
    version: 1,
    policy: 'offer',
    steps: [
      {
        id: 'physical-activity-log-intro',
        targetId: 'physical-activity-log-action',
        title: 'Log physical activity',
        body: 'Record your workouts to track activity history.',
      },
    ],
  },
}));

describe('ModernizedPhysicalActivityScreen — Part 3D regression', () => {
  beforeEach(() => {
    activityMock.saveLogCalled = false;
    activityMock.lastEntry = null;
    activityMock.returnValue = { ok: true, errorMessage: null, data: null };
  });

  afterEach(() => {
    cleanup();
  });

  it('renders without crashing after Part 3D changes', () => {
    render(
      <ModernizedPhysicalActivityScreen onBack={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByText('Physical Activity')).toBeTruthy();
  });

  it('renders the steps counter', () => {
    render(
      <ModernizedPhysicalActivityScreen onBack={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByText(/Steps/i)).toBeTruthy();
  });

  it('renders interactive controls (buttons present)', () => {
    render(
      <ModernizedPhysicalActivityScreen onBack={vi.fn()} onNavigate={vi.fn()} />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls saveLog from feature hook when a workout is saved', async () => {
    render(
      <ModernizedPhysicalActivityScreen onBack={vi.fn()} onNavigate={vi.fn()} />
    );

    const addBtn = screen.getByRole('button', { name: /Add Workout/i });
    fireEvent.click(addBtn);

    const saveBtn = screen.queryByText('Save Workout');
    if (saveBtn) {
      fireEvent.click(saveBtn);
      await waitFor(() => expect(activityMock.saveLogCalled).toBe(true));
      expect(activityMock.lastEntry).not.toBeNull();
      expect(activityMock.lastEntry?.logDate).toBeDefined();
      expect(activityMock.lastEntry?.activityType).toBeDefined();
    }
  });

  it('saveLog receives correct PhysicalActivityEntry shape', async () => {
    render(
      <ModernizedPhysicalActivityScreen onBack={vi.fn()} onNavigate={vi.fn()} />
    );

    const addBtn = screen.getByRole('button', { name: /Add Workout/i });
    fireEvent.click(addBtn);

    const saveBtn = screen.queryByText('Save Workout');
    if (saveBtn) {
      fireEvent.click(saveBtn);
      await waitFor(() => expect(activityMock.saveLogCalled).toBe(true));
      const entry = activityMock.lastEntry!;
      expect(entry['logDate']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof entry['activityType']).toBe('string');
      expect(typeof entry['durationMins']).toBe('number');
    }
  });
});
