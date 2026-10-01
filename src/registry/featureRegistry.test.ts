// src/registry/featureRegistry.test.ts
import { describe, expect, it } from 'vitest';
import { getFeatureById, resolveFeatureFromLegacyRoute, featureRegistry } from './featureRegistry';

describe('feature registry', () => {
  it('resolves Medication entry points to one canonical feature', () => {
    const feature = getFeatureById('wellness.medication');

    expect(feature.route).toBe('MEDICATION_TRACKER');
    expect(resolveFeatureFromLegacyRoute('MEDICATION_TRACKER')).toBe(feature);
  });

  it('resolves Sleep entry points to one canonical feature', () => {
    const feature = getFeatureById('wellness.sleep');

    expect(feature.route).toBe('SLEEP_INSIGHTS');
    expect(resolveFeatureFromLegacyRoute('SLEEP_INSIGHTS')).toBe(feature);
  });

  it('resolves Hydration entry points to one canonical feature', () => {
    const feature = getFeatureById('wellness.hydration');

    expect(feature.route).toBe('HYDRATION_TRACKER');
    expect(resolveFeatureFromLegacyRoute('HYDRATION_TRACKER')).toBe(feature);
  });

  it('resolves Body Metrics entry points to one canonical feature', () => {
    const feature = getFeatureById('wellness.bodyMetrics');

    expect(feature.route).toBe('BODY_METRICS');
    expect(resolveFeatureFromLegacyRoute('BODY_METRICS')).toBe(feature);
  });

  it('resolves Physical Activity entry points to one canonical feature', () => {
    const feature = getFeatureById('wellness.physicalActivity');

    expect(feature.route).toBe('PHYSICAL_ACTIVITY');
    expect(resolveFeatureFromLegacyRoute('PHYSICAL_ACTIVITY')).toBe(feature);
    expect(feature.guideId).toBe('guide.wellness.physicalActivity.v1');
    expect(feature.visibility).toBe('production');
  });

  it('all registered features have unique IDs', () => {
    const ids = featureRegistry.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all registered features have unique routes', () => {
    const routes = featureRegistry.map((f) => f.route);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('throws for unknown feature ID', () => {
    expect(() => getFeatureById('wellness.unknown' as never)).toThrow('Unknown feature');
  });

  it('returns null for unknown legacy route', () => {
    expect(resolveFeatureFromLegacyRoute('UNKNOWN_VIEW' as never)).toBeNull();
  });
});
