import { describe, expect, it } from 'vitest';
import { AppView } from '../types';
import { CanonicalDestination, createCanonicalNavigationController, canonicalDestinationToLegacyView, legacyViewToCanonicalDestination } from './canonicalNavigation';

describe('canonical navigation adapter', () => {
  it('maps the pilot wellness features to their legacy AppView values', () => {
    const mappings: Array<[CanonicalDestination, AppView]> = [
      [{ type: 'feature', featureId: 'wellness.sleep' }, 'SLEEP_INSIGHTS'],
      [{ type: 'feature', featureId: 'wellness.hydration' }, 'HYDRATION_TRACKER'],
      [{ type: 'feature', featureId: 'wellness.bodyMetrics' }, 'BODY_METRICS'],
      [{ type: 'feature', featureId: 'wellness.physicalActivity' }, 'PHYSICAL_ACTIVITY'],
      [{ type: 'feature', featureId: 'wellness.medication' }, 'MEDICATION_TRACKER'],
    ];

    for (const [destination, legacyView] of mappings) {
      expect(canonicalDestinationToLegacyView(destination)).toBe(legacyView);
    }
  });

  it('reverse maps only the supported one-to-one pilot routes', () => {
    expect(legacyViewToCanonicalDestination('SLEEP_INSIGHTS')).toEqual({ type: 'feature', featureId: 'wellness.sleep' });
    expect(legacyViewToCanonicalDestination('HYDRATION_TRACKER')).toEqual({ type: 'feature', featureId: 'wellness.hydration' });
    expect(legacyViewToCanonicalDestination('BODY_METRICS')).toEqual({ type: 'feature', featureId: 'wellness.bodyMetrics' });
    expect(legacyViewToCanonicalDestination('PHYSICAL_ACTIVITY')).toEqual({ type: 'feature', featureId: 'wellness.physicalActivity' });
    expect(legacyViewToCanonicalDestination('MEDICATION_TRACKER')).toEqual({ type: 'feature', featureId: 'wellness.medication' });
  });

  it('rejects unknown canonical feature IDs and developer-only destinations', () => {
    expect(() => canonicalDestinationToLegacyView({ type: 'feature', featureId: 'wellness.unknown' as never })).toThrow('Unknown feature');
    expect(legacyViewToCanonicalDestination('KOTLIN_ANDROID_CODE')).toBeNull();
  });

  it('keeps the adapter aligned with the feature registry', () => {
    const registryMappings = [
      ['wellness.sleep', 'SLEEP_INSIGHTS'],
      ['wellness.hydration', 'HYDRATION_TRACKER'],
      ['wellness.bodyMetrics', 'BODY_METRICS'],
      ['wellness.physicalActivity', 'PHYSICAL_ACTIVITY'],
      ['wellness.medication', 'MEDICATION_TRACKER'],
    ] as const;

    for (const [featureId, route] of registryMappings) {
      expect(canonicalDestinationToLegacyView({ type: 'feature', featureId })).toBe(route);
      expect(legacyViewToCanonicalDestination(route)).toEqual({ type: 'feature', featureId });
    }
  });

  it('navigates through the canonical controller to the legacy AppView', () => {
    const visited: AppView[] = [];
    const nav = createCanonicalNavigationController((view) => {
      visited.push(view);
    });

    nav.navigate({ type: 'feature', featureId: 'wellness.sleep' });
    nav.navigate({ type: 'home' });

    expect(visited).toEqual(['SLEEP_INSIGHTS', 'HOME']);
  });
});
