import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppView } from '../../types';

interface ModernizedMedicationHistoryScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedMedicationHistoryScreen: React.FC<ModernizedMedicationHistoryScreenProps> = ({
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-[#F3EFF7] text-[#1A181B] pb-28 relative overflow-x-hidden font-sans select-none">
      <div className="relative w-full h-[180px] sm:h-[190px] overflow-hidden bg-gradient-to-r from-[#FCEAE6] via-[#F3E6F5] to-[#E7F4EB]">
        <div className="absolute top-5 left-5 z-20">
          <button
            type="button"
            onClick={onBack}
            className="text-[#1A181B] hover:text-black p-1 transition-all active:scale-90 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={24} strokeWidth={2.4} />
          </button>
        </div>

        <div className="absolute bottom-5 left-6 z-20 pointer-events-none">
          <h1 className="font-serif text-[32px] sm:text-[34px] font-bold text-[#1A181B] tracking-tight leading-tight">
            Medication History
          </h1>
        </div>
      </div>

      <div className="px-5 sm:px-6 pt-5 max-w-lg mx-auto relative">
        <div className="rounded-[22px] border border-[#EAE4EE] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6E6A75]">Unavailable</p>
          <h2 className="mt-3 text-[22px] font-bold text-[#1A181B]">History unavailable / not connected yet</h2>
          <p className="mt-2 text-[15px] leading-6 text-[#4C4850]">
            Medication history is not connected in this build, so there is no verified medication log data to display.
          </p>
        </div>
      </div>
    </div>
  );
};
