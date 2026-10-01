import React, { useEffect } from 'react';
import { ArrowLeft, History } from 'lucide-react';
import { AppView } from '../../types';
import { useMedication } from '../../features/medication/hooks/useMedication';

interface ModernizedMedicationTrackerScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedMedicationTrackerScreen: React.FC<ModernizedMedicationTrackerScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { medications, status, isLoading, error, load } = useMedication();

  useEffect(() => {
    void load();
  }, [load]);

  const renderInventoryState = () => {
    if (isLoading) {
      return (
        <div className="rounded-[22px] border border-[#E8E0DB] bg-[#FAF9F7] p-4 text-sm text-[#5B4E57]">
          Loading medication inventory...
        </div>
      );
    }

    if (status === 'error' || error) {
      return (
        <div className="rounded-[22px] border border-[#F0C7BE] bg-[#FFF8F5] p-4 text-sm text-[#5B4E57]">
          <p className="font-semibold text-[#153347]">Medication inventory unavailable</p>
          <p className="mt-1">We could not load your saved medication list.</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded-full bg-[#153347] px-3 py-1.5 text-xs font-medium text-white"
          >
            Retry
          </button>
        </div>
      );
    }

    if (status === 'empty' || medications.length === 0) {
      return (
        <div className="rounded-[22px] border border-dashed border-[#D9D3D0] bg-[#F7F5F3] p-5 text-sm text-[#5B4E57]">
          No medication inventory saved yet.
        </div>
      );
    }

    return medications.map((medication) => (
      <div
        key={medication.id}
        className="rounded-[22px] bg-[#F4F4F6] px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="text-[#153347] shrink-0 flex items-center justify-center w-7 h-7">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-45">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[#153347] truncate">{medication.name}</div>
            {(medication.dosage || medication.frequency) && (
              <div className="text-xs text-[#5B4E57]">
                {medication.dosage ?? 'Dosage unavailable'}
                {medication.dosage && medication.frequency ? ' • ' : ''}
                {medication.frequency ?? ''}
              </div>
            )}
          </div>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#153347]">
          Active
        </span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#153347] pb-28 relative overflow-x-hidden font-sans select-none">
      <div className="relative w-full h-[225px] overflow-hidden bg-[#6CB5C9]">
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={onBack}
            className="text-white hover:text-white/85 p-1 transition-all active:scale-90 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={24} strokeWidth={2.6} />
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('MEDICATION_HISTORY')}
              className="text-white/80 hover:text-white text-[12px] font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer bg-black/10 px-3 py-1 rounded-full backdrop-blur-xs"
              title="View History"
            >
              <History size={13} />
              <span>History</span>
            </button>
          )}
        </div>

        <div className="absolute bottom-5 left-6 z-20">
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#153347] tracking-tight leading-[1.12]">
            Medication &amp;<br />Supplements
          </h1>
        </div>
      </div>

      <div className="relative -mt-4 bg-white rounded-t-[36px] px-5 sm:px-6 pt-6 pb-12 shadow-[0_-6px_24px_rgba(0,0,0,0.02)] min-h-[calc(100vh-210px)] max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative w-6 h-6 border-2 border-[#153347] rounded-[6px] flex flex-col items-center justify-center text-[#153347] shrink-0">
            <div className="w-full h-[3px] bg-[#153347] -mt-1 rounded-t-xs" />
            <span className="text-[9px] font-bold leading-none mt-0.5">26</span>
          </div>
          <h2 className="text-[20px] font-bold text-[#153347] tracking-tight">
            Medication Inventory
          </h2>
        </div>

        <div className="space-y-3 mb-8">{renderInventoryState()}</div>
      </div>
    </div>
  );
};
