// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NavigationProvider, useNavigation } from './NavigationContext';

describe('navigation ownership', () => {
  it('uses the existing onboarding-based default route', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NavigationProvider initialView="INITIAL_BASELINE_SETUP">{children}</NavigationProvider>
    );

    const { result } = renderHook(() => useNavigation(), { wrapper });
    expect(result.current.currentView).toBe('INITIAL_BASELINE_SETUP');

    act(() => {
      result.current.setCurrentView('HOME');
    });

    expect(result.current.currentView).toBe('HOME');
  });

  it('keeps navigation state isolated from unrelated provider state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NavigationProvider initialView="HOME">{children}</NavigationProvider>
    );

    const { result } = renderHook(() => useNavigation(), { wrapper });

    act(() => {
      result.current.setCurrentView('PROFILE');
    });

    expect(result.current.currentView).toBe('PROFILE');
  });
});
