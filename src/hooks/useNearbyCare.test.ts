import { describe, expect, it } from 'vitest';
import { normalizeNearbyCareError } from './useNearbyCare';

describe('nearby-care errors', () => {
  it('normalizes backend failure without creating provider data', () => {
    const error = normalizeNearbyCareError({ message: 'provider service unavailable', status: 503 });

    expect(error.category).toBe('backend');
    expect(error.message).toBe('provider service unavailable');
  });

  it('classifies location timeout separately', () => {
    expect(normalizeNearbyCareError({ code: 'TIMEOUT', message: 'timed out' }).category).toBe('timeout');
  });
});