import { useState } from 'react';
import { useEdgeFunction } from './useSupabase';

export interface DoctorPlace {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
}

export type NearbyCareErrorCategory = 'backend' | 'permission' | 'timeout' | 'network' | 'unknown';

export class NearbyCareError extends Error {
  constructor(
    message: string,
    public readonly category: NearbyCareErrorCategory
  ) {
    super(message);
    this.name = 'NearbyCareError';
  }
}

export function normalizeNearbyCareError(error: unknown): NearbyCareError {
  const candidate = error as { code?: string; message?: string; status?: number } | null;
  const message = candidate?.message || 'Nearby care providers could not be loaded';
  if (candidate?.code === 'PERMISSION_DENIED' || message.toLowerCase().includes('permission')) {
    return new NearbyCareError(message, 'permission');
  }
  if (candidate?.code === 'TIMEOUT' || message.toLowerCase().includes('timeout')) {
    return new NearbyCareError(message, 'timeout');
  }
  if (candidate?.status && candidate.status >= 500) {
    return new NearbyCareError(message, 'backend');
  }
  if (candidate?.status || message.toLowerCase().includes('network')) {
    return new NearbyCareError(message, 'network');
  }
  return new NearbyCareError(message, 'unknown');
}

export function useNearbyCare() {
  const { invoke } = useEdgeFunction();
  const [doctors, setDoctors] = useState<DoctorPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<NearbyCareErrorCategory | null>(null);

  const searchNearby = async (lat: number, lng: number, radius = 5000) => {
    setIsLoading(true);
    setError(null);
    setErrorCategory(null);
    try {
      const data = await invoke<{ results: DoctorPlace[] }>('nearby-care-proxy', {
        lat,
        lng,
        radius,
        type: 'doctor',
      });

      setDoctors(data.results || []);
      return data.results;
    } catch (err: any) {
      const normalizedError = normalizeNearbyCareError(err);
      console.error('useNearbyCare error:', normalizedError);
      setError(normalizedError.message);
      setErrorCategory(normalizedError.category);
      setDoctors([]);
      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    doctors,
    isLoading,
    error,
    errorCategory,
    searchNearby,
  };
}
