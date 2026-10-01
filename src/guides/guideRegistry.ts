// src/guides/guideRegistry.ts
// Declarative guide definitions. Each guide is:
//   - user-scoped (progress keyed by userId)
//   - version-scoped (keyed by version number)
//   - optional and non-blocking (policy: 'offer')
//   - dismissible and replayable
//   - never controls feature access

import { FeatureId } from '../registry/featureRegistry';

export interface GuideStep {
  id: string;
  targetId: string;
  title: string;
  body: string;
}

export interface GuideDefinition {
  id: string;
  featureId: FeatureId;
  version: number;
  policy: 'offer' | 'auto-start' | 'disabled';
  steps: readonly GuideStep[];
}

// ── Sleep ─────────────────────────────────────────────────────────────────────

export const sleepGuide: GuideDefinition = {
  id: 'guide.wellness.sleep.v1',
  featureId: 'wellness.sleep',
  version: 1,
  policy: 'offer',
  steps: [
    {
      id: 'sleep-log-intro',
      targetId: 'sleep-log-action',
      title: 'Log your sleep times',
      body: 'Save your bedtime and wake time to build a personal sleep record.',
    },
  ],
};

// ── Hydration ─────────────────────────────────────────────────────────────────

export const hydrationGuide: GuideDefinition = {
  id: 'guide.wellness.hydration.v1',
  featureId: 'wellness.hydration',
  version: 1,
  policy: 'offer',
  steps: [
    {
      id: 'hydration-log-intro',
      targetId: 'hydration-add-action',
      title: 'Track your daily water intake',
      body: 'Log your water consumption throughout the day to meet your personal hydration goal.',
    },
  ],
};

// ── Body Metrics ──────────────────────────────────────────────────────────────

export const bodyMetricsGuide: GuideDefinition = {
  id: 'guide.wellness.bodyMetrics.v1',
  featureId: 'wellness.bodyMetrics',
  version: 1,
  policy: 'offer',
  steps: [
    {
      id: 'body-metrics-log-intro',
      targetId: 'body-metrics-log-action',
      title: 'Log your weight',
      body: 'Record a weight entry to start tracking changes over time. Your data is private and only visible to you.',
    },
  ],
};

// ── Physical Activity ─────────────────────────────────────────────────────────

export const physicalActivityGuide: GuideDefinition = {
  id: 'guide.wellness.physicalActivity.v1',
  featureId: 'wellness.physicalActivity',
  version: 1,
  policy: 'offer',
  steps: [
    {
      id: 'physical-activity-log-intro',
      targetId: 'physical-activity-log-action',
      title: 'Log physical activity',
      body: 'Record your workouts and movement to track activity history over time. Your data is private and owned by you.',
    },
  ],
};

