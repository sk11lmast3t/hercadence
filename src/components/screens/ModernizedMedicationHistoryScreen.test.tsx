// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModernizedMedicationHistoryScreen } from './ModernizedMedicationHistoryScreen';

vi.mock('../../hooks/useMedication', () => ({
  useMedication: () => {
    throw new Error('History screen must not query medication inventory');
  },
}));

describe('ModernizedMedicationHistoryScreen', () => {
  it('renders the unavailable state and avoids inventory queries during history display', () => {
    render(<ModernizedMedicationHistoryScreen onBack={() => undefined} />);

    expect(screen.getByText(/history unavailable/i)).toBeTruthy();
    expect(screen.getByText(/not connected yet/i)).toBeTruthy();
  });
});
