import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  User, 
  ChevronRight, 
  X,
  TrendingDown,
  Sparkles,
  Calendar,
  Activity,
  PieChart
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';

interface InsightsScreenProps {
  onNavigate: (view: AppView) => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ onNavigate }) => {
  const { currentCycle, settings } = useCycle();
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  return (
    <div className="w-full min-h-full bg-[#FAF9F7] flex flex-col justify-between relative selection:bg-[#DE9E8E]/30 pb-28">
      {/* Top Fluid Artwork Banner with Title */}
      <div className="relative w-full h-[215px] sm:h-[225px] overflow-hidden flex-shrink-0">
        <img
          src="/assets/insights_header_waves_1788068502124.jpg"
          alt="Fluid wavy ribbon pattern"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />

        {/* Profile Icon Button (Top Right) */}
        <button
          onClick={() => onNavigate('PROFILE')}
          id="insights_profile_btn"
          aria-label="View Profile"
          className="absolute top-4 right-6 w-8 h-8 rounded-full bg-black/85 text-white flex items-center justify-center shadow-md hover:bg-black transition-all cursor-pointer z-10"
        >
          <User size={17} strokeWidth={2.2} />
        </button>

        {/* Centered Display Title */}
        <div className="absolute inset-0 flex items-center justify-center pt-5 pointer-events-none">
          <h1 className="font-serif text-[38px] sm:text-[40px] font-normal text-[#1E191D] tracking-tight">
            Insights
          </h1>
        </div>
      </div>

        {/* Content Container (Card overlapping header) */}
        <div className="flex-1 bg-[#FAF9F7] rounded-t-[36px] -mt-8 relative z-10 px-4 sm:px-5 pt-3 pb-6 flex flex-col justify-between space-y-4">
          
          {/* Subtle Pull Indicator Handle */}
          <div className="w-10 h-1 rounded-full bg-[#D8CFC8] mx-auto mb-1" />

          {/* Top 3 Stat Cards Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* Stat 1: Cycle Length */}
            <button
              type="button"
              onClick={() => setSelectedStat('cycle')}
              id="stat_cycle_length_card"
              className="bg-white hover:bg-[#FDFCFB] active:scale-[0.98] rounded-[24px] p-3 sm:p-3.5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between text-center min-h-[145px] transition-all cursor-pointer group"
            >
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#1E191D] leading-tight">
                Cycle<br />Length
              </span>
              <div className="my-auto py-1">
                <span className="font-serif text-[22px] sm:text-[24px] font-normal text-[#1E191D] leading-none block">
                  {settings.cycleLengthDays || 31} Days
                </span>
              </div>
              <span className="text-[11px] sm:text-[12px] text-[#7A6C74] font-medium">
                Average
              </span>
            </button>

            {/* Stat 2: Period Duration */}
            <button
              type="button"
              onClick={() => setSelectedStat('period')}
              id="stat_period_duration_card"
              className="bg-white hover:bg-[#FDFCFB] active:scale-[0.98] rounded-[24px] p-3 sm:p-3.5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between text-center min-h-[145px] transition-all cursor-pointer group"
            >
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#1E191D] leading-tight">
                Period<br />Duration
              </span>
              <div className="my-auto py-1">
                <span className="font-serif text-[22px] sm:text-[24px] font-normal text-[#1E191D] leading-none block">
                  {settings.periodLengthDays || 5} Days
                </span>
              </div>
              <span className="text-[11px] sm:text-[12px] text-[#7A6C74] font-medium">
                Average
              </span>
            </button>

            {/* Stat 3: Symptom Trends */}
            <button
              type="button"
              onClick={() => setSelectedStat('symptoms')}
              id="stat_symptom_trends_card"
              className="bg-white hover:bg-[#FDFCFB] active:scale-[0.98] rounded-[24px] p-3 sm:p-3.5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between text-center min-h-[145px] transition-all cursor-pointer group"
            >
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#1E191D] leading-tight">
                Symptom<br />Trends
              </span>
              <div className="my-auto py-1">
                <span className="text-[15px] sm:text-[16px] font-bold text-[#1E191D] leading-tight block">
                  Headaches<br />Down
                </span>
              </div>
              <span className="text-[11px] sm:text-[12px] text-[#7A6C74] font-medium">
                Last 30 Days
              </span>
            </button>
          </div>

          {/* Quick Link to Modernized Harmonized Insights */}
          <button
            type="button"
            onClick={() => onNavigate('HARMONIZED_INSIGHTS')}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF3F0] to-[#EFF6F2] border border-[#EDE4DE] shadow-xs flex items-center justify-between text-left hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white text-[#543649] shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                <PieChart size={18} />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-[#1E191D]">
                  Harmonized Insights &amp; Symptoms
                </h4>
                <p className="text-[11px] text-[#7A6C74]">
                  Cycle curve milestones, weekly wellness bars, &amp; sleep quality
                </p>
              </div>
            </div>
            <ChevronRight size={17} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Large Mood & Energy Card with Dual Wave Chart */}
          <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#EDE6E1] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1E191D] tracking-tight">
                Mood & Energy
              </h2>
              <p className="text-[13px] text-[#7A6C74] font-medium mt-0.5">
                Over Last 30 Days
              </p>
            </div>

            {/* Dual Wave SVG Chart matching exact shape and colors */}
            <div className="relative w-full h-[180px] sm:h-[190px] pt-1">
              {/* 3 Horizontal Baseline Grid Lines */}
              <div className="absolute inset-x-0 top-[25%] border-b border-[#F0EBE6]" />
              <div className="absolute inset-x-0 top-[55%] border-b border-[#F0EBE6]" />
              <div className="absolute inset-x-0 top-[85%] border-b border-[#F0EBE6]" />

              <svg 
                viewBox="0 0 320 160" 
                className="w-full h-full overflow-visible relative z-10"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Rose Wave Gradient */}
                  <linearGradient id="roseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C98B84" stopOpacity="0.32" />
                    <stop offset="50%" stopColor="#C98B84" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#C98B84" stopOpacity="0.02" />
                  </linearGradient>

                  {/* Sage Green Wave Gradient */}
                  <linearGradient id="sageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8DA394" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#8DA394" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#8DA394" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Rose Wave Fill & Path */}
                <path
                  d="M 0 115 
                     C 30 95, 55 90, 85 98
                     C 115 106, 140 135, 165 125
                     C 190 115, 205 50, 230 48
                     C 255 46, 275 80, 300 70
                     L 320 62 
                     L 320 160 
                     L 0 160 Z"
                  fill="url(#roseGradient)"
                />
                <path
                  d="M 0 115 
                     C 30 95, 55 90, 85 98
                     C 115 106, 140 135, 165 125
                     C 190 115, 205 50, 230 48
                     C 255 46, 275 80, 300 70
                     L 320 62"
                  fill="none"
                  stroke="#C4847D"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Sage Green Wave Fill & Path */}
                <path
                  d="M 0 142 
                     C 35 120, 60 128, 90 135
                     C 120 142, 135 105, 165 80
                     C 195 55, 210 100, 240 104
                     C 270 108, 295 95, 320 90
                     L 320 160 
                     L 0 160 Z"
                  fill="url(#sageGradient)"
                />
                <path
                  d="M 0 142 
                     C 35 120, 60 128, 90 135
                     C 120 142, 135 105, 165 80
                     C 195 55, 210 100, 240 104
                     C 270 108, 295 95, 320 90"
                  fill="none"
                  stroke="#7E9685"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

      {/* Interactive Detail Modal for Stat Drilldowns */}
      {selectedStat && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 border border-[#EDE4DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-normal text-[#1E191D]">
                {selectedStat === 'cycle' && 'Cycle Length History'}
                {selectedStat === 'period' && 'Period Duration Breakdown'}
                {selectedStat === 'symptoms' && 'Symptom Trend Analysis'}
              </h3>
              <button 
                onClick={() => setSelectedStat(null)} 
                className="p-1 rounded-full hover:bg-stone-100 text-stone-600"
              >
                <X size={18} />
              </button>
            </div>
            
            {selectedStat === 'cycle' && (
              <div className="space-y-2 text-xs text-stone-600">
                <p>Your average cycle length is <strong>31 days</strong> across your last 6 tracked cycles. This falls within the normal clinical regularity window (24–38 days).</p>
                <div className="p-3 rounded-2xl bg-[#FAF9F7] border border-[#EDE4DE] space-y-1">
                  <div className="flex justify-between"><span>Current Cycle:</span><span className="font-semibold text-[#1E191D]">Day 14</span></div>
                  <div className="flex justify-between"><span>Next Estimated Period:</span><span className="font-semibold text-[#1E191D]">In 17 Days</span></div>
                </div>
              </div>
            )}

            {selectedStat === 'period' && (
              <div className="space-y-2 text-xs text-stone-600">
                <p>Your flow duration averages <strong>5 days</strong> with highest flow concentration on Days 1 and 2.</p>
                <div className="p-3 rounded-2xl bg-[#FAF9F7] border border-[#EDE4DE] space-y-1">
                  <div className="flex justify-between"><span>Heaviest Day:</span><span className="font-semibold text-[#1E191D]">Day 2</span></div>
                  <div className="flex justify-between"><span>Spotting:</span><span className="font-semibold text-[#1E191D]">None recorded</span></div>
                </div>
              </div>
            )}

            {selectedStat === 'symptoms' && (
              <div className="space-y-2 text-xs text-stone-600">
                <p>Reported headaches have decreased by <strong>40%</strong> this month, coinciding with higher hydration and consistent sleep routines.</p>
                <div className="p-3 rounded-2xl bg-[#FAF9F7] border border-[#EDE4DE] space-y-1">
                  <div className="flex justify-between"><span>Headache Frequency:</span><span className="font-semibold text-emerald-700">Down 40%</span></div>
                  <div className="flex justify-between"><span>Cramp Severity:</span><span className="font-semibold text-[#1E191D]">Mild</span></div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedStat(null)}
              className="w-full py-2.5 bg-[#543649] text-white text-xs font-medium rounded-full hover:bg-[#432939] transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

