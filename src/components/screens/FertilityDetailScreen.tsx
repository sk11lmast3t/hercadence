import React from 'react';
import { 
  ChevronLeft, 
  Thermometer, 
  Droplet, 
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCycle } from '../../context/CycleContext';

interface FertilityDetailScreenProps {
  onBack: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToBBT?: () => void;
}

export const FertilityDetailScreen: React.FC<FertilityDetailScreenProps> = ({ 
  onBack,
  onNavigateToCalendar,
  onNavigateToBBT
}) => {
  const { currentCycle } = useCycle();

  // Forecast SVG Path matching screenshot
  // ViewBox: 0 0 340 120
  // Peak occurs around Nov 8-10 (x: 180, y: 15)
  const forecastPath = "M 20 80 C 40 80, 50 65, 80 65 C 110 65, 125 90, 150 90 C 165 90, 175 15, 195 15 C 215 15, 225 80, 250 80 C 275 80, 290 60, 320 60";
  const forecastArea = `${forecastPath} L 320 110 L 20 110 Z`;

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1E191D] pb-28 relative font-sans selection:bg-[#DE9E8E]/30">
      {/* Botanical Ribbon Header Art matching modernized_fertility_detail_variant_1.png */}
      <div className="relative w-full h-[160px] sm:h-[180px] overflow-hidden">
        <img
          src="/assets/fertility_botanical_ribbon_header_1788418543951.jpg"
          alt="Dusty rose and sage ribbons with golden botanicals"
          className="w-full h-full object-cover object-center"
        />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          id="fertility_back_btn"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#1E191D] hover:bg-white/90 active:scale-95 transition-all shadow-xs cursor-pointer"
          title="Back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>
      </div>

      <main className="max-w-md mx-auto px-5 sm:px-6 -mt-10 relative z-10 space-y-6">
        {/* Title Header */}
        <div className="pt-2">
          <h1 className="font-serif text-[32px] sm:text-[34px] font-semibold text-[#1E191D] tracking-tight leading-tight">
            Fertility &amp; Ovulation
          </h1>
          <p className="text-[14px] text-[#7A6C74] font-medium mt-0.5">
            Detail Variant 1
          </p>
        </div>

        {/* Current Chance of Conception Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[28px] bg-gradient-to-br from-[#FFFDFB] via-[#FAF6F2] to-[#F5EEE7] p-6 border border-[#EDE4DE] shadow-[0_8px_25px_rgba(0,0,0,0.03)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-medium text-[#221C20] tracking-tight mb-2">
                Current Chance of Conception
              </h2>
              <div className="font-serif text-[34px] sm:text-[36px] font-bold text-[#1E191D] tracking-tight">
                High - 85%
              </div>
            </div>

            {/* Circular Gradient Gauge Ring (Rose to Sage) matching screenshot */}
            <div className="relative w-18 h-18 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C48B96" />
                    <stop offset="100%" stopColor="#87A997" />
                  </linearGradient>
                </defs>
                {/* Background Track */}
                <path
                  className="text-[#EFE7E1]"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Gauge Fill (85%) */}
                <path
                  stroke="url(#gaugeGrad)"
                  strokeWidth="3.8"
                  strokeDasharray="85, 100"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>

          <p className="text-[13px] text-[#6E5D68] font-medium mt-3 pt-3 border-t border-[#EDE4DE]/70">
            Optimal window. Try for conception today.
          </p>
        </motion.div>

        {/* Key Fertility Markers Section */}
        <div className="space-y-3.5">
          <h3 className="font-serif text-[21px] font-semibold text-[#1E191D] tracking-tight">
            Key Fertility Markers
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Marker 1: Basal Body Temp */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={onNavigateToBBT}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-[#EDE4DE] shadow-xs flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F0F5F1] text-[#688D79] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shadow-2xs">
                <Thermometer size={22} strokeWidth={1.8} />
              </div>
              <h4 className="text-[12px] font-bold text-[#1E191D] leading-tight mb-1">
                Basal Body Temp
              </h4>
              <p className="text-[10.5px] text-[#7A6C74] font-medium">
                98.1°F (Rising)
              </p>
            </motion.div>

            {/* Marker 2: Cervical Mucus */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-[#EDE4DE] shadow-xs flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FAF0F3] text-[#B87383] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shadow-2xs">
                <Droplet size={22} strokeWidth={1.8} />
              </div>
              <h4 className="text-[12px] font-bold text-[#1E191D] leading-tight mb-1">
                Cervical Mucus
              </h4>
              <p className="text-[10.5px] text-[#7A6C74] font-medium">
                Egg White, Stretchy
              </p>
            </motion.div>

            {/* Marker 3: LH Surge */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-[#EDE4DE] shadow-xs flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FBF2EC] text-[#B8815F] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shadow-2xs">
                {/* Custom Test Strip Icon */}
                <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="5" y="4" width="14" height="16" rx="2" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="9" y1="12" x2="15" y2="12" strokeWidth="2.5" />
                  <line x1="9" y1="16" x2="15" y2="16" />
                </svg>
              </div>
              <h4 className="text-[12px] font-bold text-[#1E191D] leading-tight mb-1">
                LH Surge
              </h4>
              <p className="text-[10.5px] text-[#7A6C74] font-medium">
                Detected, Peak
              </p>
            </motion.div>
          </div>
        </div>

        {/* Fertility Forecast Section */}
        <div className="bg-white rounded-[26px] p-5 border border-[#EDE4DE] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
          <h3 className="font-serif text-[21px] font-semibold text-[#1E191D] tracking-tight">
            Fertility Forecast
          </h3>

          <div className="pt-2">
            <div className="flex">
              {/* Y Axis */}
              <div className="flex flex-col justify-between text-[11px] font-medium text-[#8A7983] pr-3 pb-6 text-right w-14 select-none">
                <span>High</span>
                <span>Medium</span>
                <span>Low</span>
              </div>

              {/* Chart SVG */}
              <div className="flex-1 relative pb-6">
                {/* Y Axis line */}
                <div className="absolute left-0 top-0 bottom-6 w-[1px] bg-[#E5DDD6]" />

                <svg 
                  viewBox="0 0 340 120" 
                  className="w-full h-[140px] overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="fertilityForecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C48B96" stopOpacity="0.55" />
                      <stop offset="50%" stopColor="#87A997" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#87A997" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline */}
                  <line x1="0" y1="20" x2="340" y2="20" stroke="#F4EDE8" strokeDasharray="3 3" />
                  <line x1="0" y1="65" x2="340" y2="65" stroke="#F4EDE8" strokeDasharray="3 3" />

                  {/* Area */}
                  <path d={forecastArea} fill="url(#fertilityForecastGrad)" />

                  {/* Stroke line */}
                  <path 
                    d={forecastPath} 
                    fill="none" 
                    stroke="#87A997" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />

                  {/* Highlighted peak dot */}
                  <circle cx="195" cy="15" r="5" fill="#BF7F8D" stroke="#FFFFFF" strokeWidth="2" />
                </svg>

                {/* X Axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[11.5px] font-medium text-[#7A6C74] select-none">
                  <span>Today</span>
                  <span>Nov 1</span>
                  <span>Nov 15</span>
                  <span>Dec 1</span>
                </div>
              </div>
            </div>

            {/* Subtext footnote */}
            <div className="text-center pt-2 select-none">
              <p className="text-[12px] font-medium text-[#543649]">
                Next predicted ovulation: <span className="font-semibold">Nov 8 - Nov 10</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
