import { useCallback } from 'react';
import { useMedication as useMedicationFeature } from '../features/medication/hooks/useMedication';

export function useMedication() {
  const feature = useMedicationFeature();

  const load = useCallback(() => feature.load(), [feature]);

  const upsert = useCallback(async (entry: { id?: string; name: string; dosage?: string | null; frequency?: string | null }) => {
    const medication = await feature.saveMedication({
      id: entry.id,
      name: entry.name,
      dosage: entry.dosage ?? null,
      frequency: entry.frequency ?? null,
    });
    return medication ? {
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage ?? undefined,
      frequency: medication.frequency ?? undefined,
    } : null;
  }, [feature]);

  const remove = useCallback(async (id: string) => {
    await feature.deleteMedication(id);
  }, [feature]);

  return {
    medications: feature.medications.map((medication) => ({
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage ?? undefined,
      frequency: medication.frequency ?? undefined,
    })),
    isLoading: feature.isLoading,
    error: feature.error,
    load,
    upsert,
    remove,
  };
}

