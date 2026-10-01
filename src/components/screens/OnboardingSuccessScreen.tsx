import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingSuccessScreenProps {
  onFinish: () => void;
}

export const OnboardingSuccessScreen: React.FC<OnboardingSuccessScreenProps> = ({ onFinish }) => {
  const checklistItems = [
    'Personalized insights',
    'Smart reminders',
    'Privacy protected'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8C748C] via-[#C9B4C7] to-[#8C748C] text-[#20141E] flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Fluid Organic Wave Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6A4D67]/80 via-[#DFCFDE]/60 to-[#5B3E59]/90 pointer-events-none" />
      <div className="absolute top-10 -left-10 w-72 h-72 rounded-full bg-[#E5B5C8]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-10 w-80 h-80 rounded-full bg-[#83637F]/50 blur-3xl pointer-events-none" />

      {/* Top Spacer */}
      <div className="h-6" />

      {/* Centered White Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 bg-white/95 rounded-[36px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/80 space-y-8 my-auto max-w-sm w-full mx-auto"
      >
        <h1 className="font-serif text-[40px] sm:text-[44px] text-[#241422] leading-tight tracking-tight text-left">
          You're All Set!
        </h1>

        <div className="space-y-6 pt-2">
          {checklistItems.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full border border-[#C5A880] flex items-center justify-center text-[#B08F63] flex-shrink-0">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <span className="font-serif text-[22px] sm:text-[24px] text-[#332230] leading-snug">
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom Action */}
      <div className="relative z-10 pt-6 pb-4">
        <button
          type="button"
          onClick={onFinish}
          className="w-full py-4 bg-[#3B2237] hover:bg-[#2F182B] text-white font-serif text-[20px] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-98"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
