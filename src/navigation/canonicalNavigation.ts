import { AppView } from '../types';
import { FeatureId, getFeatureById, resolveFeatureFromLegacyRoute } from '../registry/featureRegistry';

export type CanonicalDestination =
  | { type: 'home' }
  | { type: 'calendar' }
  | { type: 'insights' }
  | { type: 'profile' }
  | { type: 'feature'; featureId: FeatureId };

export interface CanonicalNavigationController {
  navigate: (destination: CanonicalDestination) => AppView;
  resolveLegacyView: (destination: CanonicalDestination) => AppView;
}

export function canonicalDestinationToLegacyView(destination: CanonicalDestination): AppView {
  switch (destination.type) {
    case 'home':
      return 'HOME';
    case 'calendar':
      return 'CALENDAR';
    case 'insights':
      return 'INSIGHTS';
    case 'profile':
      return 'PROFILE';
    case 'feature': {
      const feature = getFeatureById(destination.featureId);
      return feature.route;
    }
    default:
      throw new Error(`Unsupported canonical destination: ${JSON.stringify(destination)}`);
  }
}

export function legacyViewToCanonicalDestination(view: AppView): CanonicalDestination | null {
  const feature = resolveFeatureFromLegacyRoute(view);
  if (feature) {
    return { type: 'feature', featureId: feature.id };
  }

  switch (view) {
    case 'HOME':
    case 'CLASSIC_HOME':
    case 'HARMONIZED_HOME':
    case 'HARMONIZED_DASHBOARD':
      return { type: 'home' };
    case 'CALENDAR':
    case 'HARMONIZED_CALENDAR':
      return { type: 'calendar' };
    case 'INSIGHTS':
    case 'CLASSIC_INSIGHTS':
    case 'HARMONIZED_INSIGHTS':
      return { type: 'insights' };
    case 'PROFILE':
    case 'CLASSIC_PROFILE':
      return { type: 'profile' };
    default:
      return null;
  }
}

export function createCanonicalNavigationController(
  setCurrentView: (view: AppView) => void,
): CanonicalNavigationController {
  const navigate = (destination: CanonicalDestination): AppView => {
    const legacyView = canonicalDestinationToLegacyView(destination);
    setCurrentView(legacyView);
    return legacyView;
  };

  return {
    navigate,
    resolveLegacyView: canonicalDestinationToLegacyView,
  };
}
