import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { calculateSleepDurationHours, getSleepSaveMessage, SleepStageUnavailable, SleepStatusNotice } from './ModernizedSleepInsightsScreen';

describe('Sleep screen states', () => {
  it('shows a real error instead of claiming an offline save', () => {
    expect(getSleepSaveMessage(false, 'Database unavailable')).toBe('Database unavailable');
    expect(getSleepSaveMessage(false, null)).not.toContain('Saved locally');
  });

  it('renders loading, empty, and error notices', () => {
    expect(renderToStaticMarkup(<SleepStatusNotice status="loading" error={null} />)).toContain('Loading');
    expect(renderToStaticMarkup(<SleepStatusNotice status="empty" error={null} />)).toContain('No sleep records');
    expect(renderToStaticMarkup(<SleepStatusNotice status="error" error="Load failed" />)).toContain('Load failed');
  });

  it('calculates an overnight duration from the entered times', () => {
    expect(calculateSleepDurationHours('23:15', '06:45')).toBe(7.5);
    expect(calculateSleepDurationHours('bad', '06:45')).toBeNull();
  });

  it('does not render a measured progress value for unavailable sleep stages', () => {
    const markup = renderToStaticMarkup(<SleepStageUnavailable />);
    expect(markup).toContain('Not recorded');
    expect(markup).not.toMatch(/\d+%/);
  });
});