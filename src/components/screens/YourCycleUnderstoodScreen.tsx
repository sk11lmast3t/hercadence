import React from 'react';

interface YourCycleUnderstoodScreenProps {
  onNext: () => void;
  onBack?: () => void;
}

export const YourCycleUnderstoodScreen: React.FC<YourCycleUnderstoodScreenProps> = ({ onNext }) => {
  return (
    <div className="w-full min-h-full bg-[#FAF9F7] flex flex-col justify-between relative selection:bg-[#DE9E8E]/30 pb-6">
      {/* Top Organic Fluid Waves Artwork with smooth curved bottom arch */}
      <div className="relative w-full h-[390px] sm:h-[415px] overflow-hidden rounded-b-[180px] sm:rounded-b-[195px] flex-shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <img
          src="/assets/personalized_waves_bg_1787988997650.jpg"
          alt="Organic fluid wave pattern"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 px-7 sm:px-8 pt-6 pb-6 flex flex-col justify-between text-center">
        {/* Main Display Typography */}
        <div className="my-auto py-2">
          <h1 className="font-serif text-[40px] sm:text-[44px] font-normal text-[#1E191D] leading-[1.12] tracking-tight">
            Your cycle,<br />
            understood.
          </h1>
        </div>

        {/* Action Button */}
        <div className="w-full pt-4">
          <button
            onClick={onNext}
            id="your_cycle_understood_get_started_btn"
            className="w-full py-4.5 bg-[#543649] hover:bg-[#432939] active:scale-[0.98] text-white font-sans font-medium text-[18px] rounded-full shadow-[0_10px_28px_rgba(84,54,73,0.32)] transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

