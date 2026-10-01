import React, { useState } from 'react';
import { Check, ChevronLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { motion } from 'motion/react';

interface PremiumSubscriptionScreenProps {
  onBack?: () => void;
}

export const PremiumSubscriptionScreen: React.FC<PremiumSubscriptionScreenProps> = ({ onBack }) => {
  const { settings, updateSettings } = useCycle();
  const [upgraded, setUpgraded] = useState(settings.isPremium);

  const handleSubscribe = () => {
    updateSettings({ isPremium: true });
    setUpgraded(true);
  };

  const proFeatures = [
    'Advanced Hormonal Insights',
    'Unlimited Journaling',
    'Exclusive Content'
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Fluid Artwork with Gold Ribbons & Figures */}
        <div className="relative w-full h-[320px] overflow-hidden flex-shrink-0">
          <img
            src="/assets/premium_hero_artwork_1787938715259.jpg"
            alt="Gold ribbons and abstract figures"
            className="w-full h-full object-cover object-center"
          />

          {/* Optional Back Button if opened from settings */}
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-5 left-5 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#2A2328] hover:bg-white/90 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Back"
            >
              <ChevronLeft size={22} strokeWidth={2.4} />
            </button>
          )}

          {/* Thin Gold Border Bar Underneath Art */}
          <div className="absolute bottom-0 inset-x-0 h-[3.5px] bg-gradient-to-r from-[#D8B467] via-[#F4E3AB] to-[#C99C49]" />
        </div>

        {/* Content Section */}
        <div className="flex-1 px-7 sm:px-8 pt-7 pb-6 flex flex-col justify-between space-y-6">
          {/* Main Headline */}
          <div>
            <h1 className="font-serif text-[34px] sm:text-[38px] font-normal text-[#1E191D] tracking-tight leading-[1.18]">
              Unlock Your Full Potential
            </h1>
          </div>

          {/* 3 Gold Checkmark List Items */}
          <div className="space-y-4.5 py-1">
            {proFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3.5">
                <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-[#E2B968] via-[#D5A754] to-[#BD8E3C] flex items-center justify-center text-white shadow-[0_2px_6px_rgba(213,167,84,0.35)] flex-shrink-0">
                  <Check size={14} strokeWidth={3.2} />
                </div>
                <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] leading-tight">
                  {feat}
                </span>
              </div>
            ))}
          </div>

          {/* Subscribe Action Button & Pricing */}
          <div className="space-y-4 pt-2">
            <button
              onClick={handleSubscribe}
              id="subscribe_now_btn"
              disabled={upgraded}
              className="w-full py-4.5 bg-[#543649] hover:bg-[#432939] active:scale-[0.98] text-white font-sans font-medium text-[18px] rounded-full shadow-[0_10px_28px_rgba(84,54,73,0.35),0_0_20px_rgba(226,185,104,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {upgraded ? (
                <>
                  <ShieldCheck size={20} />
                  <span>Subscribed & Active</span>
                </>
              ) : (
                <span>Try Free & Subscribe</span>
              )}
            </button>

            {/* Pricing Options Text */}
            <div className="text-center text-[15px] sm:text-[16px] text-[#1E191D] leading-relaxed font-normal">
              <p>Monthly Plan: $9.99/mo</p>
              <p className="font-medium">Annual Plan: $89.99/yr (Save 25%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

