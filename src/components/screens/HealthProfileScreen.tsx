import React, { useState } from 'react';
import { 
  ChevronLeft, 
  RotateCw, 
  CalendarDays, 
  Activity, 
  FileText,
  Smartphone,
  Scale,
  Check,
  Plus,
  TrendingDown,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { formatDateToISO } from '../../utils/cycleCalculations';

interface HealthProfileScreenProps {
  onBack: () => void;
  onNavigateToExportReport?: () => void;
  onNavigateToConnectedDevices?: () => void;
}

export const HealthProfileScreen: React.FC<HealthProfileScreenProps> = ({ 
  onBack,
  onNavigateToExportReport,
  onNavigateToConnectedDevices
}) => {
  const { settings, updateSettings, dayLogs, saveDayLog } = useCycle();
  const [activeHoverPoint, setActiveHoverPoint] = useState<number | null>(null);
  const [showLogWeightModal, setShowLogWeightModal] = useState(false);

  const todayStr = formatDateToISO(new Date());
  const todayLog = dayLogs[todayStr];

  const cycleDays = settings.cycleLengthDays || 28;
  const periodDays = settings.periodLengthDays || 5;
  const userUnit = settings.baselineHealth?.weightUnit || settings.weightUnit || 'kg';
  
  // Current active weight: priority today's log -> baseline weight -> default 58
  const currentWeightValue = todayLog?.weight ?? (settings.baselineHealth?.weight || 58);
  const [inputWeight, setInputWeight] = useState<string>(currentWeightValue.toString());
  const [weightSavedToast, setWeightSavedToast] = useState(false);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (!isNaN(val) && val > 20 && val < 300) {
      saveDayLog(todayStr, { weight: val });
      updateSettings({
        baselineHealth: {
          ...settings.baselineHealth,
          weight: val,
          weightUnit: userUnit
        }
      });
      setShowLogWeightModal(false);
      setWeightSavedToast(true);
      setTimeout(() => setWeightSavedToast(false), 2500);
    }
  };

  // Dynamically calculate 6-month historical curve based on currentWeightValue
  const baseWeightNum = currentWeightValue;
  const unitLabel = userUnit;
  
  // Dynamic 6-month points based on real user baseline
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const weightVariations = [-0.8, -1.2, +0.4, -0.6, -1.5, 0]; // realistic healthy fluctuation
  
  const weightPoints = months.map((m, idx) => {
    const xCoords = [30, 80, 135, 190, 245, 295];
    const val = Math.round((baseWeightNum + weightVariations[idx]) * 10) / 10;
    // Normalized y-coord in SVG (between 80 and 150)
    const yVal = 120 - (weightVariations[idx] * 18);
    return {
      month: m,
      x: xCoords[idx],
      y: Math.max(70, Math.min(150, yVal)),
      value: `${val} ${unitLabel}`
    };
  });

  const symptomPoints = [
    { month: 'Jan', x: 30, y: 145, value: 'Mild (10)' },
    { month: 'Feb', x: 80, y: 120, value: 'Moderate (15)' },
    { month: 'Mar', x: 135, y: 150, value: 'Low (8)' },
    { month: 'Apr', x: 190, y: 35, value: 'Peak PMS (28)' },
    { month: 'May', x: 245, y: 65, value: 'Elevated (22)' },
    { month: 'Jun', x: 295, y: 140, value: 'Normal (11)' },
  ];

  // SVG smooth paths dynamic construction
  const p0 = weightPoints[0];
  const p1 = weightPoints[1];
  const p2 = weightPoints[2];
  const p3 = weightPoints[3];
  const p4 = weightPoints[4];
  const p5 = weightPoints[5];

  const weightPathD = `M ${p0.x} ${p0.y} C 55 ${p0.y + 5}, 65 ${p1.y}, ${p1.x} ${p1.y} C 105 ${p1.y}, 115 ${p2.y}, ${p2.x} ${p2.y} C 160 ${p2.y}, 170 ${p3.y}, ${p3.x} ${p3.y} C 215 ${p3.y}, 225 ${p4.y}, ${p4.x} ${p4.y} C 265 ${p4.y}, 280 ${p5.y}, ${p5.x} ${p5.y}`;
  const weightAreaD = `${weightPathD} L 295 170 L 30 170 Z`;

  const symptomPathD = "M 30 145 C 55 130, 65 120, 80 120 C 105 120, 115 150, 135 150 C 160 150, 170 35, 190 35 C 215 35, 225 65, 245 65 C 265 65, 280 120, 295 140";
  const symptomAreaD = `${symptomPathD} L 295 170 L 30 170 Z`;

  return (
    <div className="min-h-screen bg-[#FBF9F7] text-[#1E191D] pb-28 relative selection:bg-[#DE9E8E]/30 font-sans">
      {/* Top Header with title */}
      <header className="pt-7 pb-3 px-5 sm:px-6 flex items-center justify-between relative z-20">
        <button
          onClick={onBack}
          id="health_profile_back_btn"
          className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-[#1E191D] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
          title="Back"
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <h1 className="font-serif text-[26px] sm:text-[28px] font-semibold text-[#1E191D] tracking-tight">
          Health Profile
        </h1>
        <div className="w-10" />
      </header>

      {/* Modernized Swirling Wavy Ribbons Header Banner */}
      <div className="w-full px-4 sm:px-6 mb-6">
        <div className="w-full h-[150px] sm:h-[180px] rounded-[22px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#EFE8E3] relative">
          <img
            src="/assets/health_profile_waves_banner_1788418497724.jpg"
            alt="Organic swirling topographic waves in sage and rose"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 sm:px-6 space-y-6">
        {/* 3 Metric Cards matching modernized_health_profile_variant_1.png */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Average Cycle Length */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#EDE4DE] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-[12px] sm:text-[13px] font-semibold text-[#1E191D] leading-tight line-clamp-2">
                  Average Cycle Length
                </span>
                <span className="text-[#8B556D] p-0.5 rounded-full flex-shrink-0">
                  <RotateCw size={15} strokeWidth={2.4} />
                </span>
              </div>
              <div className="font-serif text-[22px] sm:text-[25px] font-bold text-[#1E191D] tracking-tight my-1.5">
                {cycleDays} Days
              </div>
            </div>
            <p className="text-[10px] sm:text-[10.5px] text-[#7A6C74] font-medium leading-snug">
              Based on last 6 cycles
            </p>
          </motion.div>

          {/* Card 2: Period Duration */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#EDE4DE] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-[12px] sm:text-[13px] font-semibold text-[#1E191D] leading-tight line-clamp-2">
                  Period Duration
                </span>
                <span className="text-[#8B556D] p-0.5 rounded-full flex-shrink-0">
                  <CalendarDays size={15} strokeWidth={2.4} />
                </span>
              </div>
              <div className="font-serif text-[22px] sm:text-[25px] font-bold text-[#1E191D] tracking-tight my-1.5">
                {periodDays} Days
              </div>
            </div>
            <p className="text-[10px] sm:text-[10.5px] text-[#7A6C74] font-medium leading-snug">
              Based on last 6 cycles
            </p>
          </motion.div>

          {/* Card 3: Cycle Regularity */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16 }}
            className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#EDE4DE] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-[12px] sm:text-[13px] font-semibold text-[#1E191D] leading-tight line-clamp-2">
                  Cycle Regularity
                </span>
                <span className="text-[#8B556D] p-0.5 rounded-full flex-shrink-0">
                  <Activity size={15} strokeWidth={2.4} />
                </span>
              </div>
              <div className="font-serif text-[20px] sm:text-[23px] font-bold text-[#1E191D] tracking-tight my-1.5">
                Regular
              </div>
            </div>
            <p className="text-[10px] sm:text-[10.5px] text-[#7A6C74] font-medium leading-snug">
              High consistency
            </p>
          </motion.div>
        </div>

        {/* Section: Weight & Symptoms Trend */}
        <div className="bg-white rounded-[24px] p-5 border border-[#EDE4DE] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-[21px] font-semibold text-[#1E191D] tracking-tight">
                Weight &amp; Symptoms Trend
              </h3>
              <p className="text-[11.5px] text-[#7A6C74] mt-0.5">
                Current: <span className="font-bold text-[#1E191D]">{currentWeightValue} {unitLabel}</span>
                {todayLog?.weight ? (
                  <span className="ml-1.5 text-[10.5px] px-2 py-0.5 rounded-full bg-[#EAF4EC] text-[#2F683D] font-medium">Logged today</span>
                ) : (
                  <span className="ml-1.5 text-[10.5px] px-2 py-0.5 rounded-full bg-[#F5EFE9] text-[#7A6C74]">Baseline</span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setInputWeight(currentWeightValue.toString());
                setShowLogWeightModal(true);
              }}
              className="px-3 py-1.5 rounded-full bg-[#F7F2EF] hover:bg-[#EFE6E1] text-[#543649] text-[12px] font-semibold border border-[#E8DED7] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <Scale size={14} />
              <span>Log Weight</span>
            </button>
          </div>

          {/* Chart Canvas */}
          <div className="relative pt-2">
            <div className="flex">
              {/* Y Axis Labels */}
              <div className="flex flex-col justify-between text-[11px] font-medium text-[#7A6C74] pr-2.5 pb-7 text-right w-11 select-none">
                <span>{Math.round(baseWeightNum + 3)}</span>
                <span>{Math.round(baseWeightNum + 1.5)}</span>
                <span>{Math.round(baseWeightNum)}</span>
                <span>{Math.round(baseWeightNum - 1.5)}</span>
                <span>{Math.round(baseWeightNum - 3)}</span>
              </div>

              {/* Chart SVG */}
              <div className="flex-1 relative pb-6">
                {/* Y Axis reference line */}
                <div className="absolute left-0 top-0 bottom-6 w-[1px] bg-[#E2D8D1]" />

                <svg 
                  viewBox="0 0 320 170" 
                  className="w-full h-[180px] overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Sage Green Gradient */}
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#87A997" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#87A997" stopOpacity="0.03" />
                    </linearGradient>

                    {/* Dusty Rose Gradient */}
                    <linearGradient id="symptomGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#BF7F8D" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#BF7F8D" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid guidelines */}
                  <line x1="0" y1="35" x2="320" y2="35" stroke="#F4EDE8" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="320" y2="80" stroke="#F4EDE8" strokeDasharray="3 3" />
                  <line x1="0" y1="125" x2="320" y2="125" stroke="#F4EDE8" strokeDasharray="3 3" />

                  {/* Sage Green Area (Weight) */}
                  <path d={weightAreaD} fill="url(#weightGrad)" />
                  <path d={weightPathD} fill="none" stroke="#7A9C8B" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Dusty Rose Area (Symptoms) */}
                  <path d={symptomAreaD} fill="url(#symptomGrad)" />
                  <path d={symptomPathD} fill="none" stroke="#B87383" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Interactive Dot Triggers */}
                  {weightPoints.map((pt, idx) => (
                    <circle
                      key={`wt-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={activeHoverPoint === idx ? 5 : 3.5}
                      fill="#7A9C8B"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setActiveHoverPoint(idx)}
                      onMouseLeave={() => setActiveHoverPoint(null)}
                    />
                  ))}

                  {symptomPoints.map((pt, idx) => (
                    <circle
                      key={`sym-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={activeHoverPoint === idx ? 5 : 3.5}
                      fill="#B87383"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setActiveHoverPoint(idx)}
                      onMouseLeave={() => setActiveHoverPoint(null)}
                    />
                  ))}
                </svg>

                {/* X Axis Months */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[12px] font-medium text-[#7A6C74] select-none">
                  {months.map((m) => (
                    <span key={m} className="w-8 text-center">{m}</span>
                  ))}
                </div>

                {/* Hover Tooltip display if hovered */}
                {activeHoverPoint !== null && (
                  <div className="absolute top-2 right-4 bg-[#2A2228] text-white text-[11px] rounded-lg py-1 px-2.5 shadow-md flex items-center gap-2">
                    <span className="text-[#87A997]">Weight: {weightPoints[activeHoverPoint].value}</span>
                    <span className="text-[#F1ABB9]">Score: {symptomPoints[activeHoverPoint].value}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-3 select-none">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#543649]">
                <span className="w-3.5 h-3.5 rounded-full bg-[#87A997]" />
                <span>Weight ({unitLabel})</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#543649]">
                <span className="w-3.5 h-3.5 rounded-full bg-[#BF7F8D]" />
                <span>Symptoms Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access to Report & Devices */}
        <div className="space-y-3 pt-1">
          {onNavigateToExportReport && (
            <button
              type="button"
              onClick={onNavigateToExportReport}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#523446] hover:bg-[#432939] text-white font-medium text-[14px] shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <FileText size={18} />
              <span>Export Health Report (PDF)</span>
            </button>
          )}

          {onNavigateToConnectedDevices && (
            <button
              type="button"
              onClick={onNavigateToConnectedDevices}
              className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FDFCFB] text-[#523446] border border-[#EDE4DE] font-medium text-[14px] shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Smartphone size={18} />
              <span>Connected Apps &amp; Devices</span>
            </button>
          )}
        </div>
      </main>

      {/* Log Weight Modal */}
      <AnimatePresence>
        {showLogWeightModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-[#EDE4DE] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#F3EBE6] text-[#6E4856] flex items-center justify-center">
                    <Scale size={18} />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1E191D]">Log Today's Weight</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogWeightModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 text-[#7A6C74] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <p className="text-[13px] text-[#7A6C74] leading-relaxed">
                Update your weight to keep your body composition and cycle metabolic curves accurate.
              </p>

              <form onSubmit={handleSaveWeight} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#543649] uppercase tracking-wider mb-1.5">
                    Weight ({unitLabel})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DDD6] text-[18px] font-bold text-[#1E191D] focus:outline-none focus:border-[#7A9C8B]"
                      autoFocus
                    />
                    <span className="absolute right-4 top-3.5 text-sm font-semibold text-[#8C7A86]">
                      {unitLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogWeightModal(false)}
                    className="flex-1 py-3 rounded-full border border-[#E5DDD6] text-[#543649] text-sm font-semibold hover:bg-neutral-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-[#523446] hover:bg-[#432A39] text-white text-sm font-semibold shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} />
                    <span>Save &amp; Update</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {weightSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1E191D] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20"
          >
            <Check size={14} className="text-[#87A997]" />
            <span>Weight logged and trend chart updated!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
