import React, { useState } from 'react';
import { 
  Smile, 
  Sparkles,
  ChevronDown,
  Pill,
  Droplet,
  Search,
  Dumbbell,
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../../types';
import { createCanonicalNavigationController } from '../../navigation/canonicalNavigation';
import { MobileStatusBar } from '../common/MobileStatusBar';
import { useCycle } from '../../context/CycleContext';
import { formatDateToISO } from '../../utils/cycleCalculations';

interface HarmonizedForecastHomeScreenProps {
  onNavigate: (view: AppView) => void;
  onOpenLogModal: () => void;
}

export const HarmonizedForecastHomeScreen: React.FC<HarmonizedForecastHomeScreenProps> = ({
  onNavigate,
  onOpenLogModal
}) => {
  const { currentCycle, dayLogs, settings } = useCycle();
  const canonicalNavigation = createCanonicalNavigationController(onNavigate);
  const todayStr = formatDateToISO(new Date());
  const todayLog = dayLogs[todayStr];

  const activeMood = (todayLog?.moods && todayLog.moods.length > 0) 
    ? todayLog.moods.join(', ') 
    : 'Calm, Happy';
  const activeFocus = todayLog?.focus || 'Sharp, Productive';
  const activeComfort = todayLog?.physicalComfort || 'Good, No Pain';

  const [tipIndex, setTipIndex] = useState(0);

  const wellnessTips = [
    'Incorporate short stretch breaks throughout the day to maintain flow.',
    'Sip warm ginger tea with lemon to soothe digestive energy and increase vitality.',
    'Take five diaphragmatic breaths when transitioning between deep work sessions.'
  ];

  const handleCycleTip = () => {
    setTipIndex((prev) => (prev + 1) % wellnessTips.length);
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
        <header className="px-6 pt-3 pb-3 flex items-center justify-between">
          <h1 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1E191D] tracking-tight">
            {settings.userName ? `Good morning, ${settings.userName}` : 'Good morning'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('NOTIFICATION_INBOX')}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-xs flex items-center justify-center text-[#554C53] hover:bg-white active:scale-95 transition-all relative cursor-pointer"
              title="Notifications & Activity"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#C86D7F]" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('SEARCH_HUB')}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-xs flex items-center justify-center text-[#554C53] hover:bg-white active:scale-95 transition-all cursor-pointer"
              title="Search Articles & Videos"
            >
              <Search size={18} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-5 space-y-3.5 sm:space-y-4">
          {/* Card 1: Cycle Forecast Frosted Glass Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onNavigate('PERSONALIZED_INSIGHTS')}
            className="rounded-[30px] sm:rounded-[34px] bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_12px_36px_rgba(0,0,0,0.04)] p-7 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/80 transition-all"
            title="View detailed cycle forecast"
          >
            <span className="font-serif text-[23px] sm:text-[25px] font-semibold text-[#1E191D] tracking-tight">
              Cycle Forecast
            </span>
            <h2 className="font-serif text-[28px] sm:text-[31px] font-bold text-[#1E191D] tracking-tight mt-1">
              {currentCycle.phaseDisplayName === 'Ovulation' ? 'Today: High Energy' : `Today: ${currentCycle.phaseDisplayName}`}
            </h2>
            <div className="mt-1 text-[12px] text-[#63555D] font-medium flex items-center gap-1">
              <span>Day {currentCycle.currentDayOfCycle} of {settings.cycleLengthDays}</span>
              <span>•</span>
              <span className="text-[#543649] font-bold">Tap for deep insights →</span>
            </div>
          </motion.div>

          {/* Row 2: 3 Square Metric Cards (Mood, Focus, Physical Comfort) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Card 1: Mood (Dusty Rose / Blush Pastel) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              onClick={() => onNavigate('FEELING_TODAY')}
              className="rounded-[24px] bg-[#E8C5C8]/90 border border-[#DFC0C3] p-3 sm:p-3.5 flex flex-col items-center justify-between text-center min-h-[152px] shadow-2xs cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all"
              title="Open Mood & Emotional Well-Being"
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#1E191D]">
                  Mood
                </span>
                <span className="text-[9.5px] bg-[#1E191D]/10 text-[#1E191D] px-1.5 py-0.5 rounded-full font-semibold">Log</span>
              </div>

              {/* Minimalist Smile Face Outline */}
              <div className="w-11 h-11 flex items-center justify-center my-1 text-[#1E191D]">
                <Smile size={36} strokeWidth={1.4} />
              </div>

              <p className="text-[12px] font-semibold text-[#1E191D] leading-tight line-clamp-2">
                {activeMood}
              </p>
            </motion.div>

            {/* Card 2: Focus (Sage Green Pastel) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={() => onNavigate('FOCUS_ENERGY_TRACKER')}
              className="rounded-[24px] bg-[#BDD4C8]/90 border border-[#ACC7B9] p-3 sm:p-3.5 flex flex-col items-center justify-between text-center min-h-[152px] shadow-2xs cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all"
              title="Open Focus & Cognitive Energy Tracker"
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#1E191D]">
                  Focus
                </span>
                <span className="text-[9.5px] bg-[#1E191D]/10 text-[#1E191D] px-1.5 py-0.5 rounded-full font-semibold">Log</span>
              </div>

              {/* Brain with radiating light rays / lightbulb spark outline */}
              <div className="w-11 h-11 flex items-center justify-center my-1 text-[#1E191D]">
                <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Brain halves */}
                  <path d="M12 21c-2.2 0-4-1.8-4-4 0-1.2.5-2.2 1.3-2.9C8.5 13.4 8 12.3 8 11c0-2.8 2.2-5 5-5 .4 0 .7.1 1.1.2C14.7 4.9 16 4 17.5 4c2.2 0 4 1.8 4 4" />
                  <path d="M20 21c2.2 0 4-1.8 4-4 0-1.2-.5-2.2-1.3-2.9.8-.7 1.3-1.8 1.3-3.1 0-2.8-2.2-5-5-5-.4 0-.7.1-1.1.2C18.3 4.9 17 4 15.5 4" />
                  <path d="M16 8v13" />
                  <path d="M13 24h6" />
                  <path d="M14 27h4" />
                  {/* Radiating light rays */}
                  <path d="M7 6L5 4" />
                  <path d="M25 6l2-2" />
                  <path d="M4 14H2" />
                  <path d="M30 14h-2" />
                  <path d="M16 2V0.5" />
                </svg>
              </div>

              <p className="text-[12px] font-semibold text-[#1E191D] leading-tight line-clamp-2">
                {activeFocus}
              </p>
            </motion.div>

            {/* Card 3: Physical Comfort (Warm Ivory / Beige Pastel) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              onClick={() => onNavigate('PHYSICAL_COMFORT_TRACKER')}
              className="rounded-[24px] bg-[#F2EADB]/90 border border-[#E6DCC9] p-3 sm:p-3.5 flex flex-col items-center justify-between text-center min-h-[152px] shadow-2xs cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all"
              title="Open Physical Comfort & Somatic Tracker"
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#1E191D]">
                  Physical
                </span>
                <span className="text-[9.5px] bg-[#1E191D]/10 text-[#1E191D] px-1.5 py-0.5 rounded-full font-semibold">Log</span>
              </div>

              {/* Seated Lotus Meditation Pose Outline */}
              <div className="w-11 h-11 flex items-center justify-center my-1 text-[#1E191D]">
                <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Head */}
                  <circle cx="16" cy="7" r="3" />
                  {/* Torso */}
                  <path d="M16 11v8" />
                  {/* Arms & Hands in lap */}
                  <path d="M11 15c1 3 3 4 5 4s4-1 5-4" />
                  {/* Lotus Legs / Base */}
                  <path d="M7 23c2-3 5-4 9-4s7 1 9 4" />
                  <path d="M6 25c4-1 7-2 10-2s6 1 10 2" />
                  {/* Leaf petals on sides */}
                  <path d="M11 20c-2.5-.5-4 1-4 3 2.5.5 4-1 4-3z" />
                  <path d="M21 20c2.5-.5 4 1 4 3-2.5.5-4-1-4-3z" />
                </svg>
              </div>

              <p className="text-[12px] font-semibold text-[#1E191D] leading-tight line-clamp-2">
                {activeComfort}
              </p>
            </motion.div>
          </div>

          {/* Subtle Ambient Depth circles layer */}
          <div className="h-2 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-12 h-1.5 rounded-full bg-black/5" />
          </div>

          {/* Row 4: Wellness Tip of the Day Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={handleCycleTip}
            className="rounded-[26px] bg-white/95 backdrop-blur-md border border-[#ECE3DC] p-4 sm:p-5 shadow-[0_6px_22px_rgba(0,0,0,0.03)] flex items-center gap-3.5 cursor-pointer hover:shadow-md transition-shadow"
            title="Click to view next wellness tip"
          >
            {/* Left Circular Sage Badge with Botanical Leaf/Sprout */}
            <div className="w-11 h-11 rounded-full bg-[#DFEDE4] text-[#47735B] flex items-center justify-center shrink-0 shadow-2xs">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M12 2a9 9 0 0 0-9 9c0 4.1 2.8 7.6 6.7 8.6L12 22l2.3-2.4C18.2 18.6 21 15.1 21 11a9 9 0 0 0-9-9zm-1 14.9V13h2v3.9c2.9-.5 5-3 5-5.9 0-3.3-2.7-6-6-6s-6 2.7-6 6c0 2.9 2.1 5.4 5 5.9z" />
              </svg>
            </div>

            {/* Right Text Content */}
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-[#1E191D]">
                Wellness Tip of the Day
              </h3>
              <p className="text-[12.5px] text-[#4A4247] leading-snug mt-0.5">
                {wellnessTips[tipIndex]}
              </p>
            </div>
          </motion.div>

          {/* Row 5: Quick Daily Trackers (Medication & Hydration) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              onClick={() => canonicalNavigation.navigate({ type: 'feature', featureId: 'wellness.medication' })}
              className="rounded-[22px] bg-white border border-[#E9E4DF] p-3.5 flex items-center gap-3 cursor-pointer hover:border-[#D8CFCE] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E2EDF4] text-[#1E3A4B] flex items-center justify-center shrink-0">
                <Pill size={18} className="rotate-45" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#1E191D] truncate">Medications</div>
                <div className="text-[11px] text-[#7A6C74] truncate">3 scheduled today</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              onClick={() => canonicalNavigation.navigate({ type: 'feature', featureId: 'wellness.hydration' })}
              className="rounded-[22px] bg-white border border-[#E9E4DF] p-3.5 flex items-center gap-3 cursor-pointer hover:border-[#D8CFCE] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                <Droplet size={18} fill="#0284C7" strokeWidth={0} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#1E191D] truncate">Hydration</div>
                <div className="text-[11px] text-[#7A6C74] truncate">1.5L / 2.5L logged</div>
              </div>
            </motion.div>
          </div>

          {/* Row 6: Physical Activity Tracker Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            onClick={() => canonicalNavigation.navigate({ type: 'feature', featureId: 'wellness.physicalActivity' })}
            className="rounded-[22px] bg-white border border-[#E9E4DF] p-3.5 flex items-center justify-between cursor-pointer hover:border-[#D8CFCE] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FCECE8] to-[#F5D5D0] text-[#B05B64] flex items-center justify-center shrink-0">
                <Dumbbell size={18} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#1E191D] truncate">Physical Activity</div>
                <div className="text-[11px] text-[#7A6C74] truncate">7,500 / 10,000 steps · 3 logged</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCECE8] text-[#B05B64] text-[11.5px] font-bold shrink-0">
              75%
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
