import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { GuideDefinition } from './guideRegistry';

export type GuideProgressState = 'offered' | 'dismissed' | 'skipped';
export type GuideStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function guideProgressKey(userId: string, guide: GuideDefinition): string {
  return `hercadence:guide:${userId}:${guide.id}:v${guide.version}`;
}

export function readGuideState(
  storage: GuideStorage,
  userId: string,
  guide: GuideDefinition,
  targetAvailable: boolean
): GuideProgressState {
  if (guide.policy === 'disabled' || !targetAvailable) return 'skipped';
  try {
    return storage.getItem(guideProgressKey(userId, guide)) === 'dismissed' ? 'dismissed' : 'offered';
  } catch {
    return 'offered';
  }
}

export function dismissGuide(storage: GuideStorage, userId: string, guide: GuideDefinition): void {
  try {
    storage.setItem(guideProgressKey(userId, guide), 'dismissed');
  } catch {
    // Guide progress is optional when storage is unavailable.
  }
}

export function replayGuide(storage: GuideStorage, userId: string, guide: GuideDefinition): void {
  try {
    storage.removeItem(guideProgressKey(userId, guide));
  } catch {
    // Guide replay remains available for the current session.
  }
}

export function useGuideProgress(guide: GuideDefinition) {
  const { userId } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!userId || guide.policy !== 'offer') return;
    const targetId = guide.steps[0]?.targetId;
    const targetAvailable = typeof document === 'undefined' || Boolean(
      targetId && document.querySelector(`[data-guide-target="${targetId}"]`)
    );
    setIsVisible(readGuideState(localStorage, userId, guide, targetAvailable) === 'offered');
  }, [guide, userId]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    if (userId) dismissGuide(localStorage, userId, guide);
  }, [guide, userId]);

  const replay = useCallback(() => {
    setIsVisible(true);
    if (userId) replayGuide(localStorage, userId, guide);
  }, [guide, userId]);

  return { isVisible, dismiss, replay };
}