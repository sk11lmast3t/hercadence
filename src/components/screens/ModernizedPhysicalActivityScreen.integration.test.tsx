// src/components/screens/ModernizedPhysicalActivityScreen.integration.test.tsx
// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ModernizedPhysicalActivityScreen } from './ModernizedPhysicalActivityScreen';
import { PhysicalActivityEntry } from '../../features/physicalActivity/physicalActivity.types';

const mockLogs: PhysicalActivityEntry[] = [
  {
    id: 'act-1',
    logDate: '2026-09-30',
    activityType: 'Running',
    durationMins: 45,
    intensity: 'high',
    steps: 7500,
    caloriesBurned: 400,
    notes: 'Morning run in the park',
  },
];

const mockSaveLog = vi.fn();
const mockDeleteLog = vi.fn();

vi.mock('../../features/physicalActivity/hooks/usePhysicalActivity', () => ({
  usePhysicalActivity: () => ({
    logs: mockLogs,
    isLoading: false,
    status: 'success',
    error: null,
    todayEntry: mockLogs[0],
    recentHistory: mockLogs,
    saveLog: mockSaveLog,
    deleteLog: mockDeleteLog,
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

describe('ModernizedPhysicalActivityScreen — integration', () => {
  beforeEach(() => {
    mockSaveLog.mockResolvedValue({ ok: true, errorMessage: null, data: mockLogs[0] });
    mockDeleteLog.mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders real persisted activity data from repository', () => {
    render(<ModernizedPhysicalActivityScreen onBack={vi.fn()} />);

    expect(screen.getByText('Physical Activity')).toBeTruthy();
    expect(screen.getByText('Running')).toBeTruthy();
    expect(screen.getByText(/7,500 steps/i)).toBeTruthy();
    expect(screen.getAllByText(/45/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/400 kcal/i).length).toBeGreaterThan(0);
  });

  it('opens workout modal and submits new activity entry', async () => {
    render(<ModernizedPhysicalActivityScreen onBack={vi.fn()} />);

    const addBtn = screen.getByRole('button', { name: /Add Workout/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Log Physical Activity')).toBeTruthy();

    const saveBtn = screen.getByRole('button', { name: /Save Workout/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockSaveLog).toHaveBeenCalledWith(
        expect.objectContaining({
          activityType: 'Walking',
          durationMins: 30,
          intensity: 'moderate',
        })
      );
    });
  });

  it('shows error toast when save log returns failure result', async () => {
    mockSaveLog.mockResolvedValueOnce({
      ok: false,
      errorMessage: 'Database connection failed',
      data: null,
    });

    render(<ModernizedPhysicalActivityScreen onBack={vi.fn()} />);

    const addBtn = screen.getByRole('button', { name: /Add Workout/i });
    fireEvent.click(addBtn);

    const saveBtn = screen.getByRole('button', { name: /Save Workout/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeTruthy();
    });
  });

  it('calls deleteLog when delete button is clicked', async () => {
    render(<ModernizedPhysicalActivityScreen onBack={vi.fn()} />);

    const deleteBtn = screen.getByTitle('Delete log');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockDeleteLog).toHaveBeenCalledWith('2026-09-30');
    });
  });
});
