import { describe, expect, it } from 'vitest';
import { sleepGuide } from './guideRegistry';
import {
  dismissGuide,
  readGuideState,
  replayGuide,
} from './useGuideProgress';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('guide progress lifecycle', () => {
  it('offers on first visit, dismisses, and replays explicitly', () => {
    const storage = createStorage();

    expect(readGuideState(storage, 'user-a', sleepGuide, true)).toBe('offered');
    dismissGuide(storage, 'user-a', sleepGuide);
    expect(readGuideState(storage, 'user-a', sleepGuide, true)).toBe('dismissed');
    replayGuide(storage, 'user-a', sleepGuide);
    expect(readGuideState(storage, 'user-a', sleepGuide, true)).toBe('offered');
  });

  it('isolates users and guide versions', () => {
    const storage = createStorage();
    dismissGuide(storage, 'user-a', sleepGuide);

    expect(readGuideState(storage, 'user-b', sleepGuide, true)).toBe('offered');
    expect(readGuideState(storage, 'user-a', { ...sleepGuide, version: 2 }, true)).toBe('offered');
  });

  it('skips safely when the target is missing or storage is unavailable', () => {
    const storage = createStorage();
    expect(readGuideState(storage, 'user-a', sleepGuide, false)).toBe('skipped');

    const failingStorage = {
      getItem: () => { throw new Error('storage unavailable'); },
      setItem: () => { throw new Error('storage unavailable'); },
      removeItem: () => { throw new Error('storage unavailable'); },
    };
    expect(readGuideState(failingStorage, 'user-a', sleepGuide, true)).toBe('offered');
    expect(() => dismissGuide(failingStorage, 'user-a', sleepGuide)).not.toThrow();
    expect(() => replayGuide(failingStorage, 'user-a', sleepGuide)).not.toThrow();
  });
});