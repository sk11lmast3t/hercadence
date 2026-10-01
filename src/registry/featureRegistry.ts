// src/registry/featureRegistry.ts
// Canonical feature catalogue used by navigation resolution and Explore/Search.
// One entry per intentional production feature.
// Developer-only destinations must NOT appear here.

import { AppView } from '../types';

export type FeatureId =
  | 'wellness.medication'
  | 'wellness.sleep'
  | 'wellness.hydration'
  | 'wellness.bodyMetrics'
  | 'wellness.physicalActivity';

export interface FeatureDefinition {
  id: FeatureId;
  title: string;
  route: AppView;
  category: 'wellness';
  visibility: 'production';
  guideId?: string;
}

export const featureRegistry: readonly FeatureDefinition[] = [
  {
    id: 'wellness.medication',
    title: 'Medication Tracker',
    route: 'MEDICATION_TRACKER',
    category: 'wellness',
    visibility: 'production',
  },
  {
    id: 'wellness.sleep',
    title: 'Sleep Insights',
    route: 'SLEEP_INSIGHTS',
    category: 'wellness',
    visibility: 'production',
    guideId: 'guide.wellness.sleep.v1',
  },
  {
    id: 'wellness.hydration',
    title: 'Hydration Tracker',
    route: 'HYDRATION_TRACKER',
    category: 'wellness',
    visibility: 'production',
    guideId: 'guide.wellness.hydration.v1',
  },
  {
    id: 'wellness.bodyMetrics',
    title: 'Body Metrics',
    route: 'BODY_METRICS',
    category: 'wellness',
    visibility: 'production',
    guideId: 'guide.wellness.bodyMetrics.v1',
  },
  {
    id: 'wellness.physicalActivity',
    title: 'Physical Activity',
    route: 'PHYSICAL_ACTIVITY',
    category: 'wellness',
    visibility: 'production',
    guideId: 'guide.wellness.physicalActivity.v1',
  },
];

export function getFeatureById(id: FeatureId): FeatureDefinition {
  const feature = featureRegistry.find((candidate) => candidate.id === id);
  if (!feature) throw new Error(`Unknown feature: ${id}`);
  return feature;
}

export function resolveFeatureFromLegacyRoute(route: AppView): FeatureDefinition | null {
  return featureRegistry.find((feature) => feature.route === route) ?? null;
}
