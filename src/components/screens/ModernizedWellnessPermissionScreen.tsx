import React, { useState } from 'react';
import { Signal, Wifi, Battery, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedWellnessPermissionScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedWellnessPermissionScreen: React.FC<ModernizedWellnessPermissionScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [enabled, setEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleEnable = () => {
    setEnabled(true);
    setToastMessage('Wellness Reminders Enabled');
    setTimeout(() => {
      setToastMessage(null);
      if (onNavigate) {
        onNavigate('HOME');
      } else {
        onBack();
      }
    }, 1400);
  };

  const handleMaybeLater = () => {
    if (onNavigate) {
      onNavigate('HOME');
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#1E191D] relative flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* Background Watercolor Art */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Watercolor image with smooth fallbacks */}
        <img
          src="/assets/wellness_prompt_bg_1788510568808.jpg"
          alt="Watercolor wash background"
          className="w-full h-full object-cover object-center opacity-90"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Soft atmospheric gradient washes matching modernized_permission_prompt_screen.png */}
        <div className="absolute -top-12 -left-12 w-80 h-80 rounded-full bg-[#957F9D]/25 blur-3xl" />
        <div className="absolute top-1/4 -right-16 w-80 h-96 rounded-full bg-[#E5B5AC]/35 blur-3xl" />
        <div className="absolute -bottom-16 right-0 w-96 h-96 rounded-full bg-[#E8A59C]/40 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-[#FCE5DA]/50 blur-3xl" />
      </div>

      {/* Top iOS Status Bar (9:41, Cellular, Wifi, Battery) */}
      <div className="relative z-20 w-full pt-3 px-8 flex items-center justify-between text-[#1E191D] text-[14px] font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-2">
          <Signal size={15} strokeWidth={2.4} />
          <Wifi size={15} strokeWidth={2.4} />
          <Battery size={18} strokeWidth={2.4} />
        </div>
      </div>

      {/* Centered Modal Card */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[370px] bg-white rounded-[32px] px-6 sm:px-7 pt-8 pb-8 shadow-[0_18px_50px_rgba(65,35,55,0.08)] border border-white/80 text-center flex flex-col items-center"
        >
          {/* Golden Bell Icon with Organic Leaf Accent matching prompt image */}
          <div className="w-16 h-16 flex items-center justify-center relative mb-2">
            <svg
              width="54"
              height="54"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#C5A880]"
            >
              {/* Bell Body */}
              <path
                d="M 27 12 C 20.5 12 16 17.5 16 26 C 16 32 13.5 35 11 37.5 C 10.2 38.3 10.8 39.5 12 39.5 L 42 39.5 C 43.2 39.5 43.8 38.3 43 37.5 C 40.5 35 38 32 38 26 C 38 17.5 33.5 12 27 12 Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Bell Clapper */}
              <path
                d="M 23.5 40 C 23.8 42.5 25.2 44.5 27 44.5 C 28.8 44.5 30.2 42.5 30.5 40"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Top Handle Loop */}
              <path
                d="M 25 12 V 9.5 C 25 8.4 25.9 7.5 27 7.5 C 28.1 7.5 29 8.4 29 9.5 V 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Delicate Botanical Leaf Sprout */}
              <path
                d="M 29 9 C 33 8.5 37 10 39.5 13.5 C 37 14.5 33.5 14 31 11"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M 35 10 C 37.5 7.5 41 7.5 43 9 C 41.5 11 38.5 11.5 36.5 10"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-[27px] sm:text-[29px] font-bold text-[#1E191D] tracking-tight leading-[1.2] mt-2 mb-4">
            Unlock Your<br />Wellness Journey
          </h1>

          {/* Descriptive Copy */}
          <p className="text-[14.5px] sm:text-[15px] text-[#2D252B] leading-[1.5] font-normal mb-8 px-1">
            Receive smart reminders for cycle phases, fertility windows, and personalized self-care tips. Stay in tune with your body's natural rhythm and never miss a crucial moment.
          </p>

          {/* Action Buttons Row */}
          <div className="w-full flex items-center justify-center gap-3">
            {/* Maybe Later Button */}
            <button
              type="button"
              onClick={handleMaybeLater}
              className="flex-1 py-3 px-4 rounded-full border border-[#52324A] bg-white hover:bg-[#52324A]/5 text-[#52324A] font-medium text-[14.5px] tracking-tight transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Maybe Later
            </button>

            {/* Enable Reminders Button with plum drop shadow */}
            <button
              type="button"
              onClick={handleEnable}
              className="flex-1 py-3 px-4 rounded-full bg-[#52324A] hover:bg-[#41273B] text-white font-medium text-[14.5px] tracking-tight transition-all shadow-[0_10px_24px_rgba(82,50,74,0.38)] active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {enabled ? 'Enabled' : 'Enable Reminders'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="relative z-20 w-full pb-3 flex justify-center">
        <button
          type="button"
          onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
          className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
          title="Home Bar - Tap to return"
          aria-label="Home"
        />
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-[#52324A] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full shadow-xl z-50 flex items-center gap-2"
          >
            <Check size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
