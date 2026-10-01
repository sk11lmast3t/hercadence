import React, { useState } from 'react';
import { 
  Droplet, 
  Leaf
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';
import { MobileStatusBar } from '../common/MobileStatusBar';

interface HarmonizedDashboardScreenProps {
  onNavigate: (view: AppView) => void;
  onOpenLogModal: () => void;
}

export const HarmonizedDashboardScreen: React.FC<HarmonizedDashboardScreenProps> = ({
  onNavigate,
  onOpenLogModal
}) => {
  const { currentCycle } = useCycle();
  
  // Hydration state (default 4 of 8 glasses as shown in mockup)
  const [hydrationGlasses, setHydrationGlasses] = useState(4);
  const maxGlasses = 8;

  const cycleDay = currentCycle?.currentDayOfCycle || 12;

  const handleToggleWater = () => {
    setHydrationGlasses((prev) => (prev >= maxGlasses ? 1 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1E191D] pb-28 relative font-sans select-none overflow-x-hidden">
      {/* Top Background: Silk Waves Artwork spanning top of screen */}
      <div className="absolute top-0 left-0 right-0 h-[360px] pointer-events-none z-0 overflow-hidden">
        <img
          src="/assets/harmonized_waves_bg.jpg"
          alt="Fluid silk waves in sage green and blush rose"
          className="w-full h-full object-cover object-top"
        />
        {/* Subtle linear fade into off-white screen bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-[#FDFCFB]" />
      </div>

      <div className="max-w-[430px] mx-auto relative z-10 flex flex-col">
        {/* Mobile Phone Status Bar (9:41, cellular, wifi, battery) */}
        <MobileStatusBar />

        {/* Screen Header */}
        <header className="px-6 pt-3 pb-4 flex items-center justify-between">
          <h1 className="font-serif text-[32px] font-bold text-[#1E191D] tracking-tight">
            Home Dashboard
          </h1>

          {/* Discreet pill switcher to view Harmonized Home (Variant 2) */}
          <button
            type="button"
            onClick={() => onNavigate('HARMONIZED_HOME')}
            className="text-[11.5px] font-medium bg-white/80 hover:bg-white backdrop-blur-md border border-white/80 px-3 py-1 rounded-full text-[#543649] shadow-2xs transition-all cursor-pointer"
            title="Switch to Harmonized Home layout"
          >
            Harmonized Home
          </button>
        </header>

        {/* Main Content Area */}
        <main className="px-5 space-y-4">
          {/* Card 1: Frosted Glass Cycle Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[30px] bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center text-center"
          >
            <div className="w-full text-left mb-1">
              <span className="text-[15px] font-medium text-[#20181E] tracking-tight block">
                Cycle Status
              </span>
              <h2 className="font-serif text-[24px] font-bold text-[#4B3041] tracking-tight mt-0.5">
                Day {cycleDay}: Ovulation Phase
              </h2>
            </div>

            {/* Circular Gauge Ring matching Image 1 */}
            <div className="relative w-56 h-56 my-2 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background base track */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#EFE8E2"
                  strokeWidth="8.5"
                  fill="none"
                />

                {/* Left Arc: Sage Green (from 6 o'clock to 12 o'clock counter-clockwise) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#95B1A2"
                  strokeWidth="8.5"
                  strokeDasharray="119.38 238.76"
                  strokeDashoffset="119.38"
                  fill="none"
                  strokeLinecap="butt"
                />

                {/* Right Arc: Deep Plum (from 12 o'clock to 6 o'clock clockwise) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#543649"
                  strokeWidth="8.5"
                  strokeDasharray="119.38 238.76"
                  strokeDashoffset="0"
                  fill="none"
                  strokeLinecap="butt"
                />

                {/* Sage Green Dot on Left Arc at 9 o'clock position (angle = 180deg) */}
                <circle
                  cx="12"
                  cy="50"
                  r="4.25"
                  fill="#95B1A2"
                />
              </svg>

              {/* Center Silhouette: Deep Plum Droplet with Overlapping Sage Green Leaf */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Deep Plum Droplet */}
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-16 h-16 text-[#543649] fill-current drop-shadow-xs"
                  >
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>

                  {/* Overlapping Sage Green Leaf on lower right */}
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-12 h-12 text-[#95B1A2] fill-current absolute -bottom-1 right-1 drop-shadow-xs transform rotate-12"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#543649" strokeWidth="1.2" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Daily Briefing - Hydration Goal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)]"
          >
            <h3 className="font-serif text-[20px] font-bold text-[#1E191D] tracking-tight mb-3">
              Daily Briefing
            </h3>

            {/* Pill Capsule with soft gradient */}
            <div 
              onClick={handleToggleWater}
              className="w-full rounded-full p-2.5 px-4 bg-gradient-to-r from-[#F1F6F3] via-[#FAF3F2] to-[#F8ECEB] border border-[#ECE0D9] flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
              title="Click to log water glasses"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DFEDE4] text-[#47735B] flex items-center justify-center shrink-0">
                  <Droplet size={17} strokeWidth={1.8} />
                </div>
                <span className="text-[14px] font-medium text-[#1E191D]">
                  Hydration Goal: {hydrationGlasses}/{maxGlasses} Glasses
                </span>
              </div>

              {/* Slider Capsule Pill (Left filled with deep plum) */}
              <div className="w-20 h-4 rounded-full bg-[#E5D6D8] p-0.5 overflow-hidden flex items-center shrink-0">
                <div 
                  className="h-full rounded-full bg-[#543649] transition-all duration-300"
                  style={{ width: `${(hydrationGlasses / maxGlasses) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Daily Briefing - Mood Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)]"
          >
            <h3 className="font-serif text-[20px] font-bold text-[#1E191D] tracking-tight mb-3">
              Daily Briefing
            </h3>

            {/* Pill Capsule with soft cream to pale sage gradient */}
            <div 
              onClick={() => onNavigate('FEELING_TODAY')}
              className="w-full rounded-full p-2.5 px-4 bg-gradient-to-r from-[#FAF6EE] via-[#F4F8F4] to-[#DEECE2] border border-[#D5E7DB] flex items-center justify-between gap-3 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all shadow-2xs"
              title="Click to open Feeling Today mood tracker"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DFEDE4] text-[#47735B] flex items-center justify-center shrink-0">
                  <Leaf size={17} strokeWidth={1.8} />
                </div>
                <span className="text-[14px] font-medium text-[#1E191D]">
                  Mood Tracker: Calm &amp; Focused
                </span>
              </div>
              <span className="text-[11px] text-[#47735B] font-semibold pr-1">Check In →</span>
            </div>
          </motion.div>
        </main>

        {/* iOS Home Indicator Bar */}
        <div className="pt-6 pb-2 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('HOME')}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>
      </div>
    </div>
  );
};
