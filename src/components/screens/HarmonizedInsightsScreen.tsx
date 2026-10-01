import React, { useState } from 'react';
import { 
  Smile, 
  Lightbulb, 
  Brain,
  Heart,
  Moon,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../../types';
import { MobileStatusBar } from '../common/MobileStatusBar';
import { useHealthInsights } from '../../hooks/useHealthInsights';

interface HarmonizedInsightsScreenProps {
  onNavigate: (view: AppView) => void;
}

export const HarmonizedInsightsScreen: React.FC<HarmonizedInsightsScreenProps> = ({
  onNavigate
}) => {
  const [activeDay, setActiveDay] = useState<string>('Sat');
  const insights = useHealthInsights();

  // Weekly Wellness 7 Days data matching Image 4 heights exactly
  const weeklyBars = [
    { day: 'Mon', height: 52 },
    { day: 'Tue', height: 72 },
    { day: 'Wed', height: 56 },
    { day: 'Thu', height: 82 },
    { day: 'Fri', height: 58 },
    { day: 'Sat', height: 92 }, // Peak bar in mockup
    { day: 'Sun', height: 76 }
  ];

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
        <header className="px-6 pt-3 pb-4">
          <h1 className="font-serif text-[32px] font-bold text-[#1E191D] tracking-tight">
            Harmonized Insights
          </h1>
        </header>

        {/* Main Content Area */}
        <main className="px-5 space-y-4">
          {/* Card 1: Frosted Glass Cycle & Symptoms Trend Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[30px] bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-6"
          >
            <h2 className="font-serif text-[22px] font-bold text-[#1E191D] tracking-tight mb-3">
              Cycle &amp; Symptoms Trend
            </h2>

            {/* Smooth Wave Curve with 4 Milestone Badges */}
            <div className="relative w-full h-36 my-2 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                <defs>
                  {/* Sage Green to Dusty Rose Stroke Gradient */}
                  <linearGradient id="trendStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#87A997" />
                    <stop offset="45%" stopColor="#B6AEA6" />
                    <stop offset="100%" stopColor="#BA8390" />
                  </linearGradient>

                  {/* Translucent Area Under Curve */}
                  <linearGradient id="trendAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#87A997" stopOpacity="0.22" />
                    <stop offset="60%" stopColor="#E4C8CE" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area under curve */}
                <path
                  d="M 10 95 Q 50 48, 80 62 T 155 82 T 235 22 T 310 52 L 310 120 L 10 120 Z"
                  fill="url(#trendAreaGradient)"
                />

                {/* Main Trend Line */}
                <path
                  d="M 10 95 Q 50 48, 80 62 T 155 82 T 235 22 T 310 52"
                  fill="none"
                  stroke="url(#trendStrokeGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Milestone 1: Smile Badge at Peak 1 */}
              <div className="absolute top-[38px] left-[25%] -translate-x-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/90 border border-[#D5E4DB] shadow-xs flex items-center justify-center text-[#1E191D]">
                  <Smile size={18} strokeWidth={1.8} />
                </div>
              </div>

              {/* Milestone 2: Lightbulb Badge at Trough 1 */}
              <div className="absolute top-[62px] left-[48%] -translate-x-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/90 border border-[#EBE1D8] shadow-xs flex items-center justify-center text-[#1E191D]">
                  <Lightbulb size={17} strokeWidth={1.8} />
                </div>
              </div>

              {/* Milestone 3: Brain Badge at Highest Peak */}
              <div className="absolute top-[5px] left-[73%] -translate-x-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/90 border border-[#EBD0D8] shadow-xs flex items-center justify-center text-[#1E191D]">
                  <Brain size={18} strokeWidth={1.8} />
                </div>
              </div>

              {/* Milestone 4: Lotus / Meditation Badge at Trough 2 */}
              <div className="absolute top-[34px] left-[92%] -translate-x-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/90 border border-[#E8CCD2] shadow-xs flex items-center justify-center text-[#1E191D]">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-[#1E191D] fill-none stroke-current" strokeWidth="1.8">
                    <path d="M12 4a3 3 0 0 1 3 3c0 2-3 5-3 5s-3-3-3-5a3 3 0 0 1 3-3z" />
                    <path d="M5 13c1.5-2.5 4-4 7-4s5.5 1.5 7 4c-2 2.5-4.5 4-7 4s-5-1.5-7-4z" />
                    <path d="M3 18c3-1 6-1.5 9-1.5s6 .5 9 1.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 3-Segment Horizontal Capsule Bar underneath curve */}
            <div className="w-full h-8 rounded-full overflow-hidden flex items-center mt-4 text-[13px] font-bold">
              {/* Left: Sage Green "Cycle" */}
              <div className="w-1/3 h-full bg-[#87A997] text-white flex items-center justify-center">
                Cycle
              </div>
              {/* Middle: Warm Cream "Cycle" */}
              <div className="w-1/3 h-full bg-[#E8DDD5] text-[#1E191D] flex items-center justify-center">
                Cycle
              </div>
              {/* Right: Dusty Rose "Phase" */}
              <div className="w-1/3 h-full bg-[#BA8390] text-white flex items-center justify-center">
                Phase
              </div>
            </div>
          </motion.div>

          {/* Card 2: Weekly Wellness Overview (7 Vertical Bars) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-[24px] bg-white p-5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)]"
          >
            <h3 className="font-serif text-[21px] font-bold text-[#1E191D] tracking-tight mb-4">
              Weekly Wellness Overview
            </h3>

            {/* 7 Vertical Capsule Bars */}
            <div className="flex items-end justify-between px-1">
              {weeklyBars.map((item) => {
                const isSelected = activeDay === item.day;
                return (
                  <div
                    key={item.day}
                    onClick={() => setActiveDay(item.day)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    {/* Outer Capsule Slot */}
                    <div className="w-8.5 sm:w-9 h-28 bg-[#EEEEEE] rounded-full overflow-hidden flex flex-col justify-end p-0.5 group-hover:bg-[#E5E5E5] transition-colors">
                      {/* Gradient Fill from bottom: Sage Green to Dusty Rose */}
                      <div
                        className={`w-full rounded-full transition-all duration-300 ${
                          isSelected ? 'ring-2 ring-[#543649]/40' : ''
                        }`}
                        style={{
                          height: `${item.height}%`,
                          background: 'linear-gradient(to top, #87A997 0%, #BA8390 100%)'
                        }}
                      />
                    </div>

                    {/* Day Label in Serif font */}
                    <span className="font-serif text-[14px] font-bold text-[#1E191D]">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Row 3: Two Side-by-Side Performance Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left Card: Cycle Insights */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-[24px] bg-white/90 p-5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex flex-col justify-between"
            >
              <h4 className="font-serif text-[17px] font-bold text-[#1E191D]">
                Cycle Insights
              </h4>
              <div className="font-serif text-[32px] font-bold text-[#1E191D] my-1 leading-tight">
                {insights.averageCycleLength} day cycle
              </div>
              <p className="text-[12px] font-medium text-[#1E191D]">
                {insights.averagePeriodLength}-day period • {insights.flowDays} flow days logged
              </p>
            </motion.div>

            {/* Right Card: Symptom Trends */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="rounded-[24px] bg-white/90 p-5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex flex-col justify-between"
            >
              <h4 className="font-serif text-[17px] font-bold text-[#1E191D]">
                Symptom Trends
              </h4>
              <div className="font-serif text-[23px] font-bold text-[#1E191D] my-1 leading-tight">
                {insights.topSymptoms.length > 0 ? insights.topSymptoms[0].name : 'No data'}
              </div>
              <p className="text-[12px] font-medium text-[#1E191D]">
                {insights.totalLogsCount} entries • {insights.topSymptoms.length} top symptoms
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};
