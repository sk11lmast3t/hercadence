import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

interface PersonalizedInsightsScreenProps {
  onBack: () => void;
  onNext?: () => void;
}

export const PersonalizedInsightsScreen: React.FC<PersonalizedInsightsScreenProps> = ({ onBack, onNext }) => {
  const handleProceed = onNext || onBack;

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Fluid Wavy Artwork */}
        <div className="relative w-full h-[360px] overflow-hidden flex-shrink-0">
          <img
            src="/assets/personalized_waves_bg_1787988997650.jpg"
            alt="Fluid organic waves"
            className="w-full h-full object-cover object-top"
          />

          {/* Optional Back button */}
          <button
            onClick={onBack}
            className="absolute top-5 left-5 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#2A2328] hover:bg-white/90 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>

          {/* Floating Insights Hormone Curve Card */}
          <div className="absolute -bottom-2 inset-x-5 z-10">
            <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-[#EFE8E3] space-y-3">
              {/* Card Header & Legend */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-[15px] text-[#1E191D] tracking-tight">
                  Insights
                </span>

                <div className="flex items-center gap-2.5 text-[11px] font-medium text-[#4A3D47]">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FAF4F2] border border-[#F0E4DE] text-[#8E5E54] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#DE9E8E]" />
                    Estrogen
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F2F6F4] border border-[#DFE8E3] text-[#4F6C5B] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7B9988]" />
                    Progesterone
                  </span>
                </div>
              </div>

              {/* Dual Wave Curves Chart */}
              <div className="h-24 w-full pt-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 280 80">
                  <defs>
                    <linearGradient id="estrogenFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#DE9E8E" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#DE9E8E" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="progesteroneFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7B9988" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7B9988" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Estrogen Wave Shaded Area & Line */}
                  <path
                    d="M 10 70 Q 50 65 80 40 T 130 18 Q 155 35 180 58 T 240 68 T 270 70 L 270 75 L 10 75 Z"
                    fill="url(#estrogenFill)"
                  />
                  <path
                    d="M 10 70 Q 50 65 80 40 T 130 18 Q 155 35 180 58 T 240 68 T 270 70"
                    fill="none"
                    stroke="#C87B6F"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Progesterone Wave Shaded Area & Line */}
                  <path
                    d="M 10 72 Q 70 72 120 68 T 195 24 Q 225 35 250 55 T 270 72 L 270 75 L 10 75 Z"
                    fill="url(#progesteroneFill)"
                  />
                  <path
                    d="M 10 72 Q 70 72 120 68 T 195 24 Q 225 35 250 55 T 270 72"
                    fill="none"
                    stroke="#5F826E"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Peak and Intersection Dots */}
                  {/* Estrogen Peak Node */}
                  <circle cx="130" cy="18" r="3.5" fill="#C87B6F" stroke="#FFFFFF" strokeWidth="1.5" />
                  {/* Estrogen Intersection Node */}
                  <circle cx="130" cy="67" r="3" fill="#8C5C6A" stroke="#FFFFFF" strokeWidth="1" />

                  {/* Progesterone Peak Node */}
                  <circle cx="195" cy="24" r="3.5" fill="#5F826E" stroke="#FFFFFF" strokeWidth="1.5" />
                  {/* Progesterone Sub-node */}
                  <circle cx="195" cy="50" r="3" fill="#8C5C6A" stroke="#FFFFFF" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 px-7 sm:px-8 pt-10 pb-8 flex flex-col justify-between text-center">
          {/* Typography */}
          <div className="space-y-3.5 my-auto">
            <h1 className="font-serif text-[40px] sm:text-[44px] font-normal text-[#1E191D] leading-[1.15] tracking-tight">
              Personalized<br />for you.
            </h1>
            <p className="text-[17px] sm:text-[18px] text-[#4A3D47] font-normal leading-snug max-w-xs mx-auto">
              Receive tailored health tips<br />and cycle predictions.
            </p>
          </div>

          {/* Next Button */}
          <div className="w-full pt-6">
            <button
              onClick={handleProceed}
              id="personalized_insights_next_btn"
              className="w-full py-4.5 bg-[#543649] hover:bg-[#432939] active:scale-[0.98] text-white font-sans font-medium text-[18px] rounded-full shadow-[0_10px_28px_rgba(84,54,73,0.32)] transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

