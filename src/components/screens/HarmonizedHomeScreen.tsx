import React from 'react';
import { 
  Smile, 
  Droplet, 
  Plus,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';
import { MobileStatusBar } from '../common/MobileStatusBar';

interface HarmonizedHomeScreenProps {
  onNavigate: (view: AppView) => void;
  onOpenLogModal: () => void;
}

export const HarmonizedHomeScreen: React.FC<HarmonizedHomeScreenProps> = ({
  onNavigate,
  onOpenLogModal
}) => {
  const { currentCycle } = useCycle();
  const cycleDay = currentCycle?.currentDayOfCycle || 12;

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
            Harmonized Home
          </h1>

          {/* Discreet pill switcher to view Home Dashboard (Variant 1) */}
          <button
            type="button"
            onClick={() => onNavigate('HARMONIZED_DASHBOARD')}
            className="text-[11.5px] font-medium bg-white/80 hover:bg-white backdrop-blur-md border border-white/80 px-3 py-1 rounded-full text-[#543649] shadow-2xs transition-all cursor-pointer"
            title="Switch to Home Dashboard layout"
          >
            Dashboard
          </button>
        </header>

        {/* Main Content Area */}
        <main className="px-5 space-y-4">
          {/* Card 1: Frosted Glass Cycle Status (Fertile Window) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onNavigate('FERTILITY_DETAIL')}
            className="rounded-[30px] bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-6 sm:p-7 text-center cursor-pointer hover:bg-white/80 active:scale-[0.99] transition-all"
            title="Tap for detailed fertility window"
          >
            <span className="font-serif text-[18px] sm:text-[19px] font-semibold text-[#1E191D] tracking-tight block">
              Cycle Status
            </span>
            <h2 className="font-serif text-[26px] sm:text-[28px] font-bold text-[#1E191D] tracking-tight mt-1">
              Day {cycleDay} - Fertile Window
            </h2>
            <p className="text-[11px] text-[#543649] font-medium mt-1">Tap for fertility insights →</p>
          </motion.div>

          {/* Upper Row: 3 Metric Cards matching Image 2 */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Card 1: Mood (Soft Blush/Rose Pastel) -> navigates to Feeling Today */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              onClick={() => onNavigate('FEELING_TODAY')}
              className="rounded-[24px] bg-[#F6DCDA] p-3.5 border border-[#F0D0CE] flex flex-col items-center justify-between text-center min-h-[148px] shadow-2xs cursor-pointer hover:opacity-95 active:scale-95 transition-all"
              title="Open Mood & Feeling tracker"
            >
              <span className="text-[13px] font-bold text-[#1E191D]">
                Mood
              </span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E191D] my-1">
                <Smile size={32} strokeWidth={1.5} />
              </div>
              <p className="text-[11.5px] font-medium text-[#1E191D] leading-tight">
                Calm, Optimistic
              </p>
            </motion.div>

            {/* Card 2: Symptoms (Soft Sage Green Pastel) -> navigates to Symptom History */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={() => onNavigate('SYMPTOM_HISTORY')}
              className="rounded-[24px] bg-[#D5E9DE] p-3.5 border border-[#C8DFD1] flex flex-col items-center justify-between text-center min-h-[148px] shadow-2xs cursor-pointer hover:opacity-95 active:scale-95 transition-all"
              title="View logged symptoms & patterns"
            >
              <span className="text-[13px] font-bold text-[#1E191D]">
                Symptoms
              </span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E191D] my-1">
                <Droplet size={30} strokeWidth={1.5} />
              </div>
              <p className="text-[11.5px] font-medium text-[#1E191D] leading-tight">
                Mild Cramps, Flow
              </p>
            </motion.div>

            {/* Card 3: Energy & Focus (Soft Warm Cream Pastel) -> navigates to Focus & Energy Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              onClick={() => onNavigate('FOCUS_ENERGY_TRACKER')}
              className="rounded-[24px] bg-[#F9F3DF] p-3.5 border border-[#EDE4CB] flex flex-col items-center justify-between text-center min-h-[148px] shadow-2xs cursor-pointer hover:opacity-95 active:scale-95 transition-all"
              title="Open Focus & Energy tracker"
            >
              <span className="text-[13px] font-bold text-[#1E191D]">
                Focus &amp; Energy
              </span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E191D] my-1">
                <Zap size={28} strokeWidth={1.6} className="text-[#876527]" />
              </div>
              <p className="text-[11.5px] font-medium text-[#1E191D] leading-tight">
                High, Sharp Focus
              </p>
            </motion.div>
          </div>

          {/* Lower Row: 1 Column Card on Left (Log Data) -> explicitly opens symptom logger */}
          <div className="w-1/3 pr-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={onOpenLogModal}
              className="rounded-[24px] bg-white/90 backdrop-blur-md p-3.5 border border-[#EDE5DF] flex flex-col items-center justify-between text-center min-h-[148px] shadow-2xs cursor-pointer hover:opacity-95 active:scale-95 transition-all"
              title="Quick Log today's symptoms, mood, and flow"
            >
              <span className="text-[13px] font-bold text-[#1E191D]">
                Log Data
              </span>
              <div className="w-10 h-10 rounded-full bg-[#543649] text-white flex items-center justify-center my-1 shadow-xs">
                <Plus size={22} strokeWidth={2.4} />
              </div>
              <p className="text-[11.5px] font-medium text-[#1E191D] leading-tight">
                + Daily Log
              </p>
            </motion.div>
          </div>
        </main>

        {/* iOS Home Indicator Bar */}
        <div className="pt-6 pb-2 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('HARMONIZED_DASHBOARD')}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>
      </div>
    </div>
  );
};
