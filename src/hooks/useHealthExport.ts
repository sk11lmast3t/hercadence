import { useState, useCallback } from 'react';
import { useEdgeFunction } from './useSupabase';

interface ExportState {
  isExporting: boolean;
  error: string | null;
}

/**
 * Premium-gated health report export hook.
 * Calls the export-health-report Edge Function, then writes to native storage / triggers file sharing.
 */
export function useHealthExport() {
  const { invoke } = useEdgeFunction();
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    error: null,
  });

  const exportReport = useCallback(
    async (options?: {
      includeCycleHistory?: boolean;
      includeSymptoms?: boolean;
      includeMedications?: boolean;
      includeDoctorsNotes?: boolean;
    }) => {
      setState({ isExporting: true, error: null });
      try {
        const data = await invoke<{ report: Record<string, unknown> }>(
          'export-health-report',
          options ?? {
            includeCycleHistory: true,
            includeSymptoms: true,
            includeMedications: true,
            includeDoctorsNotes: false,
          }
        );

        const fileName = `hercadence-health-report-${new Date().toISOString().slice(0, 10)}.json`;
        const jsonContent = JSON.stringify(data.report, null, 2);

        // Native / browser download execution
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setState({ isExporting: false, error: null });
        return data.report;
      } catch (err) {
        setState({ isExporting: false, error: (err as Error).message });
        throw err;
      }
    },
    [invoke]
  );

  return { ...state, exportReport };
}
