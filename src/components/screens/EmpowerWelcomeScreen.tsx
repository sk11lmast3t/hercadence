import React from 'react';
import { ArrowRight, Droplet, Sun, Heart, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface EmpowerWelcomeScreenProps {
  onNext: () => void;
}

export const EmpowerWelcomeScreen: React.FC<EmpowerWelcomeScreenProps> = ({ onNext }) => {
  const featurePills = [
    {
      id: 'period',
      title: 'Period\nTracker',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white" strokeWidth={1.75}>
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      )
    },
    {
      id: 'ovulation',
      title: 'Ovulation\nTracker',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white" strokeWidth={1.75}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.05-6.95l-1.41 1.41m-9.08 9.08l-1.41 1.41m0-11.9l1.41 1.41m9.08 9.08l1.41 1.41" />
        </svg>
      )
    },
    {
      id: 'pregnancy',
      title: 'Pregnancy\nTracker',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white" strokeWidth={1.75}>
          <path d="M12 4a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-2 4a4 4 0 0 0-4 4v3a7 7 0 0 0 13.9 1.2c-.3-1.6-1.5-3.2-3.4-3.2h-1a3 3 0 0 1-3-3v-2z" />
        </svg>
      )
    },
    {
      id: 'insights',
      title: 'Health\nInsights',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white" strokeWidth={1.75}>
          <path d="M3 3v18h18" />
          <path d="M18 9l-5 5-4-4-3 3" />
          <path d="M14 9h4v4" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5EFEA] text-[#241C22] flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden selection:bg-[#DE9E8E]/30">
      {/* Top Large Artwork Container */}
      <div className="relative w-full pt-2 flex flex-col items-center">
        <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-[32px] overflow-hidden">
          <img
            src="/assets/empower_rhythm_art_1787818023486.jpg"
            alt="Empower your rhythm illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6 text-center my-auto pt-2">
        {/* Headline */}
        <div className="space-y-2">
          <h1 className="font-serif text-[40px] sm:text-[44px] text-[#20141E] leading-tight tracking-tight">
            Empower your rhythm.
          </h1>
          <p className="text-[17px] sm:text-[18px] text-[#42363F] leading-snug max-w-xs mx-auto font-sans font-normal">
            Your journey, your health,<br />
            your holistic well-being.
          </p>
        </div>

        {/* 4 Circular Frosted Gradient Icons */}
        <div className="grid grid-cols-4 gap-2 pt-2 max-w-sm mx-auto">
          {featurePills.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9EB3A6]/60 via-[#E8C2BE]/60 to-[#DFCCD7]/70 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-[12px] font-medium text-[#20141E] leading-tight text-center whitespace-pre-line">
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 pt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8EA898]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4C8C2]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4C8C2]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4C8C2]" />
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-4 pb-2">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-4.5 bg-gradient-to-r from-[#8FA899] via-[#C9A49E] to-[#B97F76] hover:opacity-95 text-white font-sans font-medium text-[18px] rounded-full shadow-[0_8px_24px_rgba(185,127,118,0.35)] flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-98"
        >
          <span>Let's Begin</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
