// src/guides/guideRegistry.test.ts
// Tests guide metadata — policy, version, target, and feature association.
// Covers Sleep, Hydration, Body Metrics, and Physical Activity guides.

import { describe, expect, it } from 'vitest';
import { sleepGuide, hydrationGuide, bodyMetricsGuide, physicalActivityGuide } from './guideRegistry';

describe('sleepGuide metadata', () => {
  it('has the correct ID and version', () => {
    expect(sleepGuide.id).toBe('guide.wellness.sleep.v1');
    expect(sleepGuide.version).toBe(1);
  });

  it('has offer policy', () => {
    expect(sleepGuide.policy).toBe('offer');
  });

  it('links to the correct feature', () => {
    expect(sleepGuide.featureId).toBe('wellness.sleep');
  });

  it('has at least one step with a targetId', () => {
    expect(sleepGuide.steps.length).toBeGreaterThan(0);
    expect(sleepGuide.steps[0].targetId).toBeTruthy();
  });
});

describe('hydrationGuide metadata', () => {
  it('has the correct ID and version', () => {
    expect(hydrationGuide.id).toBe('guide.wellness.hydration.v1');
    expect(hydrationGuide.version).toBe(1);
  });

  it('has offer policy', () => {
    expect(hydrationGuide.policy).toBe('offer');
  });

  it('links to the correct feature', () => {
    expect(hydrationGuide.featureId).toBe('wellness.hydration');
  });

  it('has at least one step with a targetId', () => {
    expect(hydrationGuide.steps.length).toBeGreaterThan(0);
    expect(hydrationGuide.steps[0].targetId).toBeTruthy();
  });
});

describe('bodyMetricsGuide metadata', () => {
  it('has the correct ID and version', () => {
    expect(bodyMetricsGuide.id).toBe('guide.wellness.bodyMetrics.v1');
    expect(bodyMetricsGuide.version).toBe(1);
  });

  it('has offer policy — never auto-start', () => {
    expect(bodyMetricsGuide.policy).toBe('offer');
    expect(bodyMetricsGuide.policy).not.toBe('auto-start');
    expect(bodyMetricsGuide.policy).not.toBe('disabled');
  });

  it('links to the Body Metrics feature', () => {
    expect(bodyMetricsGuide.featureId).toBe('wellness.bodyMetrics');
  });

  it('has at least one step with a targetId', () => {
    expect(bodyMetricsGuide.steps.length).toBeGreaterThan(0);
    expect(bodyMetricsGuide.steps[0].targetId).toBeTruthy();
  });

  it('step targetId matches the data-guide-target on the screen', () => {
    expect(bodyMetricsGuide.steps[0].targetId).toBe('body-metrics-log-action');
  });

  it('step title and body are non-empty strings', () => {
    const step = bodyMetricsGuide.steps[0];
    expect(typeof step.title).toBe('string');
    expect(step.title.length).toBeGreaterThan(0);
    expect(typeof step.body).toBe('string');
    expect(step.body.length).toBeGreaterThan(0);
  });

  it('does not contain medical advice or health claims in the guide copy', () => {
    const allCopy = bodyMetricsGuide.steps
      .flatMap((s) => [s.title, s.body])
      .join(' ')
      .toLowerCase();
    expect(allCopy).not.toMatch(/healthy|unhealthy|bmi range|ideal weight|you should/);
  });
});

describe('physicalActivityGuide metadata', () => {
  it('has the correct ID and version', () => {
    expect(physicalActivityGuide.id).toBe('guide.wellness.physicalActivity.v1');
    expect(physicalActivityGuide.version).toBe(1);
  });

  it('has offer policy — never auto-start', () => {
    expect(physicalActivityGuide.policy).toBe('offer');
    expect(physicalActivityGuide.policy).not.toBe('auto-start');
    expect(physicalActivityGuide.policy).not.toBe('disabled');
  });

  it('links to the Physical Activity feature', () => {
    expect(physicalActivityGuide.featureId).toBe('wellness.physicalActivity');
  });

  it('has at least one step with a targetId', () => {
    expect(physicalActivityGuide.steps.length).toBeGreaterThan(0);
    expect(physicalActivityGuide.steps[0].targetId).toBeTruthy();
  });

  it('step targetId matches the data-guide-target on the screen', () => {
    expect(physicalActivityGuide.steps[0].targetId).toBe('physical-activity-log-action');
  });
});

describe('guide registry — cross-guide constraints', () => {
  it('all guide IDs are unique', () => {
    const ids = [sleepGuide.id, hydrationGuide.id, bodyMetricsGuide.id, physicalActivityGuide.id];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all guide featureIds reference distinct features', () => {
    const featureIds = [
      sleepGuide.featureId,
      hydrationGuide.featureId,
      bodyMetricsGuide.featureId,
      physicalActivityGuide.featureId,
    ];
    expect(new Set(featureIds).size).toBe(featureIds.length);
  });
});
