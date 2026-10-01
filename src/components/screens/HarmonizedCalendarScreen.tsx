import React, { useState } from 'react';
import { 
  Droplet, 
  Leaf, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Plus,
  X,
  Activity,
  Thermometer,
  Moon,
  Sun,
  Flame,
  ArrowRight,
  Check,
  Smile,
  Clock,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { MobileStatusBar } from '../common/MobileStatusBar';
import { useCycle } from '../../context/CycleContext';
import { formatDateToISO, calculateCycleInfo } from '../../utils/cycleCalculations';

interface HarmonizedCalendarScreenProps {
  onNavigate: (view: AppView) => void;
  onOpenLogModal: (dateStr: string) => void;
}

export const HarmonizedCalendarScreen: React.FC<HarmonizedCalendarScreenProps> = ({
  onNavigate,
  onOpenLogModal
}) => {
  const { currentCycle, dayLogs, settings } = useCycle();
  
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);

  // Dedicated modal states to fix duplicate log modal bug
  const [showPhasePredictionModal, setShowPhasePredictionModal] = useState(false);
  const [showSymptomsDetailModal, setShowSymptomsDetailModal] = useState(false);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = monthNames[month];

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Helper to check markers
  const periodStartDate = new Date(settings.lastPeriodStartDate);
  const cycleLen = settings.cycleLengthDays || 28;
  const periodLen = settings.periodLengthDays || 5;

  const getDayInfo = (dayNum: number) => {
    const checkDate = new Date(year, month, dayNum);
    const dateStr = formatDateToISO(checkDate);
    const dayLog = dayLogs[dateStr];

    // Days difference from lastPeriodStartDate
    const diffTime = checkDate.getTime() - periodStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Cycle day in current cycle (0-indexed modulo)
    const cycleDay = ((diffDays % cycleLen) + cycleLen) % cycleLen + 1;

    let marker: 'period' | 'fertile' | 'ovulation' | null = null;

    if (dayLog?.flow) {
      marker = 'period';
    } else if (cycleDay <= periodLen) {
      marker = 'period';
    } else if (cycleDay === 14) {
      marker = 'ovulation';
    } else if (cycleDay >= 11 && cycleDay <= 16) {
      marker = 'fertile';
    }

    const isToday = 
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear();

    const isSelected = 
      checkDate.getDate() === selectedDate.getDate() &&
      checkDate.getMonth() === selectedDate.getMonth() &&
      checkDate.getFullYear() === selectedDate.getFullYear();

    return { dateStr, cycleDay, marker, isToday, isSelected, dayLog };
  };

  const selectedDateStr = formatDateToISO(selectedDate);
  const selectedDayLog = dayLogs[selectedDateStr];

  // Specific cycle calculation for the selected calendar date
  const selectedDayCycle = calculateCycleInfo(
    settings.lastPeriodStartDate,
    settings.cycleLengthDays,
    settings.periodLengthDays,
    settings.lutealPhaseDays,
    selectedDate
  );

  // Phase metadata for the prediction sheet
  const phaseStyles: Record<string, {
    bg: string;
    text: string;
    border: string;
    iconBg: string;
    hormoneEstrogen: string;
    hormoneProgesterone: string;
    hormoneLH: string;
    energyLevel: string;
    focusMood: string;
    nutrition: string;
    workout: string;
  }> = {
    MENSTRUAL: {
      bg: 'bg-gradient-to-br from-[#FAF0F2] to-[#F5DEE3]',
      text: 'text-[#8A3343]',
      border: 'border-[#ECD0D6]',
      iconBg: 'bg-[#F2D1D8] text-[#8A3343]',
      hormoneEstrogen: 'Low & Baseline (~20 pg/mL)',
      hormoneProgesterone: 'Low Baseline (<1 ng/mL)',
      hormoneLH: 'Baseline Low (2-4 mIU/mL)',
      energyLevel: 'Restorative & Gentle',
      focusMood: 'Reflective, Calm, Intuitive',
      nutrition: 'Warm bone broths, iron-rich spinach, lentils, and calming herbal teas.',
      workout: 'Gentle yin yoga, walks in nature, and restorative stretching.'
    },
    FOLLICULAR: {
      bg: 'bg-gradient-to-br from-[#F0F7F3] to-[#DEECE2]',
      text: 'text-[#366348]',
      border: 'border-[#CEE2D5]',
      iconBg: 'bg-[#CEE5D7] text-[#366348]',
      hormoneEstrogen: 'Steadily Rising (~120 pg/mL)',
      hormoneProgesterone: 'Low (<1 ng/mL)',
      hormoneLH: 'Gradually Building',
      energyLevel: 'Rising Stamina & Motivation',
      focusMood: 'Creative, Optimistic, Sharp',
      nutrition: 'Fermented vegetables, lean protein, citrus, and vitamin C rich greens.',
      workout: 'Strength training, steady-state cardio, and learning new movement skills.'
    },
    OVULATION: {
      bg: 'bg-gradient-to-br from-[#EFF8F3] to-[#D5EDE0]',
      text: 'text-[#205235]',
      border: 'border-[#BFE0CE]',
      iconBg: 'bg-[#BFE0CE] text-[#205235]',
      hormoneEstrogen: 'Peak Surge (~300+ pg/mL)',
      hormoneProgesterone: 'Beginning to Rise post-ovulation',
      hormoneLH: 'Peak Surge Triggering Egg Release',
      energyLevel: 'Peak Physical & Social Vitality',
      focusMood: 'Confident, Communicative, Vibrant',
      nutrition: 'Berries, leafy greens, wild salmon, and zinc-rich pumpkin seeds.',
      workout: 'HIIT, heavy weightlifting, running, and group fitness classes.'
    },
    LUTEAL: {
      bg: 'bg-gradient-to-br from-[#F9F2F4] to-[#EEDDE2]',
      text: 'text-[#6C3943]',
      border: 'border-[#E5C9D1]',
      iconBg: 'bg-[#E5CCD3] text-[#6C3943]',
      hormoneEstrogen: 'Secondary Moderate Rise',
      hormoneProgesterone: 'Dominant Peak (~15-25 ng/mL)',
      hormoneLH: 'Returning to Baseline',
      energyLevel: 'Gradually Winding Down',
      focusMood: 'Detail-Oriented, Grounded, Sensitive',
      nutrition: 'Roasted root vegetables, dark chocolate, magnesium seeds, and complex carbs.',
      workout: 'Pilates, moderate resistance training, and evening wind-down yoga.'
    }
  };

  const currentPhaseData = phaseStyles[selectedDayCycle.currentPhase] || phaseStyles.FOLLICULAR;

  const hasLoggedData = Boolean(
    selectedDayLog && (
      (selectedDayLog.symptoms && selectedDayLog.symptoms.length > 0) ||
      (selectedDayLog.moods && selectedDayLog.moods.length > 0) ||
      selectedDayLog.flow ||
      selectedDayLog.bbt ||
      selectedDayLog.cervicalMucus ||
      selectedDayLog.notes ||
      selectedDayLog.pillTaken ||
      selectedDayLog.intimacy
    )
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1E191D] pb-28 relative font-sans select-none overflow-x-hidden">
      {/* Top Background: Silk Waves Artwork */}
      <div className="absolute top-0 left-0 right-0 h-[360px] pointer-events-none z-0 overflow-hidden">
        <img
          src="/assets/harmonized_waves_bg.jpg"
          alt="Fluid silk waves in sage green and blush rose"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-[#FDFCFB]" />
      </div>

      <div className="max-w-[430px] mx-auto relative z-10 flex flex-col">
        <MobileStatusBar />

        {/* Screen Header */}
        <header className="px-6 pt-3 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#543649]/70">Cycle Horizon</span>
            <h1 className="font-serif text-[30px] sm:text-[32px] font-bold text-[#1E191D] tracking-tight">
              Calendar
            </h1>
          </div>
          <button
            type="button"
            onClick={handleGoToToday}
            className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-xs text-xs font-bold text-[#543649] hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            Today
          </button>
        </header>

        {/* Main Content Area */}
        <main className="px-5 space-y-4">
          {/* Calendar Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[30px] bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-6"
          >
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-9 h-9 rounded-full bg-white/70 border border-[#EDE5DF] flex items-center justify-center text-[#1E191D] hover:bg-white active:scale-95 transition-all cursor-pointer"
                aria-label="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="font-serif text-[24px] font-bold text-[#1E191D] tracking-tight">
                {monthName} {year}
              </h2>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-9 h-9 rounded-full bg-white/70 border border-[#EDE5DF] flex items-center justify-center text-[#1E191D] hover:bg-white active:scale-95 transition-all cursor-pointer"
                aria-label="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 text-center mb-3">
              {weekdays.map((w) => (
                <span key={w} className="font-serif text-[13px] font-bold text-[#6B5E66]">
                  {w}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-2.5 text-center items-center">
              {/* Blank slots for previous month offset */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`blank-${idx}`} className="h-10" />
              ))}

              {/* Days of month */}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const day = idx + 1;
                const { dateStr, isToday, isSelected, marker } = getDayInfo(day);

                return (
                  <div
                    key={day}
                    onClick={() => {
                      setSelectedDate(new Date(year, month, day));
                    }}
                    className="flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-[14.5px] transition-all relative ${
                        isToday
                          ? 'bg-[#A5C2B2] text-[#1E191D] font-bold shadow-2xs'
                          : isSelected
                            ? 'bg-[#543649] text-white font-bold ring-2 ring-[#543649]/30'
                            : 'text-[#1E191D] font-medium hover:bg-black/5'
                      }`}
                    >
                      {day}
                    </div>

                    {/* Marker Icon */}
                    <div className="h-3.5 flex items-center justify-center mt-0.5">
                      {marker === 'period' && (
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#A64B5B] fill-current">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                      )}

                      {marker === 'ovulation' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3D6B52] border border-white" />
                      )}

                      {marker === 'fertile' && (
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#7CA28C] fill-current">
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-3.5 border-t border-[#EDE6E1] flex items-center justify-around text-[11px] text-[#63555D]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A64B5B]" />
                <span>Period</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#7CA28C]" />
                <span>Fertile Window</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3D6B52]" />
                <span>Ovulation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A5C2B2]" />
                <span>Today</span>
              </div>
            </div>
          </motion.div>

          {/* Selected Date Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-[24px] bg-white p-5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-[20px] font-bold text-[#1E191D] tracking-tight">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <span className="text-[11px] font-semibold text-[#7A6C74]">
                  Cycle Day {selectedDayCycle.currentDayOfCycle} of {settings.cycleLengthDays}
                </span>
              </div>

              {/* Direct Log action: opens modal to add or edit today's logs */}
              <button
                type="button"
                onClick={() => onOpenLogModal(selectedDateStr)}
                className="px-3.5 py-1.5 rounded-full bg-[#FAF4F7] text-[#543649] border border-[#ECDCE3] text-xs font-bold flex items-center gap-1 hover:bg-[#F3E8EE] active:scale-95 transition-all cursor-pointer shadow-2xs"
                title="Open logger to record symptoms, moods, or flow"
              >
                <Plus size={14} strokeWidth={2.4} />
                <span>{selectedDayLog ? 'Edit Log' : 'Log Symptoms'}</span>
              </button>
            </div>

            {/* Pill 1: Cycle Phase Prediction (Opens Dedicated Prediction Modal) */}
            <div 
              onClick={() => setShowPhasePredictionModal(true)}
              className="w-full rounded-2xl p-3.5 px-4 bg-gradient-to-r from-[#F4F8F5] via-[#E8F2EC] to-[#C9DFD2] border border-[#DAE8DF] flex items-center justify-between gap-3 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all group shadow-2xs"
              title="Tap to view detailed cycle phase forecast & hormone predictions"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#D3E7DC] text-[#47735B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Droplet size={17} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#1E191D] flex items-center gap-1.5">
                    <span>{selectedDayLog?.flow ? `Period Flow: ${selectedDayLog.flow}` : 'Cycle Phase Prediction'}</span>
                    <span className="text-[10px] font-semibold bg-[#47735B]/15 text-[#325942] px-1.5 py-0.2 rounded-full">
                      Forecast
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4A6354] truncate">
                    {selectedDayCycle.phaseDisplayName} • {selectedDayCycle.chanceOfPregnancy} Pregnancy Chance
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#47735B] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Pill 2: Logged Symptoms (Opens Dedicated Symptoms Review Modal) */}
            <div 
              onClick={() => setShowSymptomsDetailModal(true)}
              className="w-full rounded-2xl p-3.5 px-4 bg-gradient-to-r from-[#FAF4F3] via-[#F8ECEB] to-[#F1D0CE] border border-[#EED4D2] flex items-center justify-between gap-3 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all group shadow-2xs"
              title="Tap to review logged symptoms and health notes for this date"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#F3D7D5] text-[#93525E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Leaf size={17} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#1E191D] flex items-center gap-1.5">
                    <span>Logged Symptoms</span>
                    {hasLoggedData && (
                      <span className="text-[10px] font-semibold bg-[#93525E]/15 text-[#733B46] px-1.5 py-0.2 rounded-full">
                        {selectedDayLog?.symptoms?.length || 0} logged
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#7A4B54] truncate">
                    {selectedDayLog?.symptoms && selectedDayLog.symptoms.length > 0 
                      ? selectedDayLog.symptoms.join(', ') 
                      : (selectedDayLog?.moods && selectedDayLog.moods.length > 0)
                        ? `Mood: ${selectedDayLog.moods.join(', ')}`
                        : 'No symptoms logged yet • Tap to review'}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#93525E] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>
        </main>

        {/* iOS Home Indicator Bar */}
        <div className="pt-4 pb-2 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('HOME')}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>
      </div>

      {/* MODAL 1: CYCLE PHASE PREDICTION & HORMONE FORECAST */}
      <AnimatePresence>
        {showPhasePredictionModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPhasePredictionModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative z-10 w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Modal Drag Bar */}
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1 bg-stone-300 rounded-full" />
              </div>

              {/* Modal Header */}
              <div className="px-6 pt-3 pb-3 border-b border-[#EDE5DF] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EAF3EE] text-[#366348] flex items-center justify-center">
                    <Droplet size={17} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-serif text-[19px] font-bold text-[#1E191D]">
                      Cycle Phase Prediction
                    </h3>
                    <p className="text-[11.5px] text-[#7A6C74]">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPhasePredictionModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F5EFEA] hover:bg-[#EBE2DB] flex items-center justify-center text-[#543649] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content Scrollable */}
              <div className="p-6 overflow-y-auto space-y-4">
                {/* Hero Phase Card */}
                <div className={`rounded-2xl p-5 border ${currentPhaseData.border} ${currentPhaseData.bg} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#543649]/70">
                      Day {selectedDayCycle.currentDayOfCycle} of {settings.cycleLengthDays}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 text-[#1E191D] shadow-2xs">
                      {selectedDayCycle.chanceOfPregnancy} Fertility
                    </span>
                  </div>

                  <h4 className="font-serif text-[24px] font-bold text-[#1E191D]">
                    {selectedDayCycle.phaseDisplayName}
                  </h4>

                  <p className="text-[13px] text-[#44383F] leading-relaxed">
                    {selectedDayCycle.phaseDescription}
                  </p>

                  {/* Progress along cycle length */}
                  <div className="pt-1">
                    <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#543649] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, (selectedDayCycle.currentDayOfCycle / settings.cycleLengthDays) * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#7A6C74] font-medium mt-1">
                      <span>Day 1 (Period)</span>
                      <span>Day 14 (Ovulation)</span>
                      <span>Day {settings.cycleLengthDays} (End)</span>
                    </div>
                  </div>
                </div>

                {/* Hormonal Profile Predictions */}
                <div className="rounded-2xl p-4 bg-[#FAF7F5] border border-[#EDE5DF] space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#543649]" />
                    <h5 className="text-[13.5px] font-bold text-[#1E191D]">
                      Predicted Hormonal Activity
                    </h5>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="bg-white p-2.5 rounded-xl border border-[#ECE2DC]">
                      <span className="text-[10.5px] text-[#7A6C74] block font-medium">Estrogen</span>
                      <span className="font-bold text-[#1E191D]">{currentPhaseData.hormoneEstrogen}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#ECE2DC]">
                      <span className="text-[10.5px] text-[#7A6C74] block font-medium">Progesterone</span>
                      <span className="font-bold text-[#1E191D]">{currentPhaseData.hormoneProgesterone}</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#ECE2DC] text-[12px] flex items-center justify-between">
                    <div>
                      <span className="text-[10.5px] text-[#7A6C74] block font-medium">LH (Luteinizing Hormone)</span>
                      <span className="font-bold text-[#1E191D]">{currentPhaseData.hormoneLH}</span>
                    </div>
                    <Sparkles size={16} className="text-[#D48B68]" />
                  </div>
                </div>

                {/* Mind & Body Expectations */}
                <div className="rounded-2xl p-4 bg-[#FAF7F5] border border-[#EDE5DF] space-y-2">
                  <h5 className="text-[13.5px] font-bold text-[#1E191D] flex items-center gap-2">
                    <Sun size={16} className="text-[#D48B68]" />
                    <span>Mind &amp; Energy Forecast</span>
                  </h5>
                  <div className="space-y-1.5 text-[12.5px] text-[#44383F]">
                    <p>
                      <strong className="text-[#1E191D]">Energy:</strong> {currentPhaseData.energyLevel}
                    </p>
                    <p>
                      <strong className="text-[#1E191D]">Mindset:</strong> {currentPhaseData.focusMood}
                    </p>
                  </div>
                </div>

                {/* Nutrition & Movement Suggestions */}
                <div className="rounded-2xl p-4 bg-[#FAF7F5] border border-[#EDE5DF] space-y-2">
                  <h5 className="text-[13.5px] font-bold text-[#1E191D] flex items-center gap-2">
                    <Flame size={16} className="text-[#C86D7F]" />
                    <span>Holistic Recommendations</span>
                  </h5>
                  <div className="space-y-1.5 text-[12.5px] text-[#44383F]">
                    <p>
                      <strong className="text-[#1E191D]">Nourish:</strong> {currentPhaseData.nutrition}
                    </p>
                    <p>
                      <strong className="text-[#1E191D]">Movement:</strong> {currentPhaseData.workout}
                    </p>
                  </div>
                </div>

                {/* Navigation CTA Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhasePredictionModal(false);
                      onNavigate('FERTILITY_DETAIL');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#543649] hover:bg-[#432A39] text-white text-[13.5px] font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-xs"
                  >
                    <span>View In-Depth Fertility &amp; Ovulation Forecast</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPhasePredictionModal(false);
                      onNavigate('PERSONALIZED_INSIGHTS');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FAF4F7] hover:bg-[#F3E8EE] text-[#543649] border border-[#ECDCE3] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Phase Insights &amp; Hormone Guide</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: LOGGED SYMPTOMS & HEALTH REVIEW */}
      <AnimatePresence>
        {showSymptomsDetailModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSymptomsDetailModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative z-10 w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Modal Drag Bar */}
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1 bg-stone-300 rounded-full" />
              </div>

              {/* Modal Header */}
              <div className="px-6 pt-3 pb-3 border-b border-[#EDE5DF] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F3D7D5] text-[#93525E] flex items-center justify-center">
                    <Leaf size={17} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-serif text-[19px] font-bold text-[#1E191D]">
                      Logged Symptoms
                    </h3>
                    <p className="text-[11.5px] text-[#7A6C74]">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSymptomsDetailModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F5EFEA] hover:bg-[#EBE2DB] flex items-center justify-center text-[#543649] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content Scrollable */}
              <div className="p-6 overflow-y-auto space-y-4">
                {hasLoggedData ? (
                  <div className="space-y-4">
                    {/* Period Flow if logged */}
                    {selectedDayLog?.flow && (
                      <div className="p-3.5 rounded-2xl bg-[#FBF0F2] border border-[#F3D0D7] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Droplet size={18} className="text-[#A64B5B] fill-current" />
                          <div>
                            <span className="text-[11px] text-[#823343] font-semibold block">Menstrual Flow</span>
                            <span className="font-bold text-[14px] text-[#1E191D] capitalize">{selectedDayLog.flow}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#A64B5B] text-white">
                          Recorded
                        </span>
                      </div>
                    )}

                    {/* Symptoms logged chips */}
                    {selectedDayLog?.symptoms && selectedDayLog.symptoms.length > 0 && (
                      <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EDE5DF] space-y-2.5">
                        <span className="text-[12px] font-bold text-[#1E191D] block">
                          Reported Symptoms ({selectedDayLog.symptoms.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedDayLog.symptoms.map((symptom) => (
                            <span
                              key={symptom}
                              className="px-3 py-1.5 rounded-xl bg-[#F6ECEE] text-[#8A3B4A] border border-[#EED4D9] text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A64B5B]" />
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Moods logged chips */}
                    {selectedDayLog?.moods && selectedDayLog.moods.length > 0 && (
                      <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EDE5DF] space-y-2.5">
                        <span className="text-[12px] font-bold text-[#1E191D] block">
                          Emotional Well-Being ({selectedDayLog.moods.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedDayLog.moods.map((mood) => (
                            <span
                              key={mood}
                              className="px-3 py-1.5 rounded-xl bg-[#F0F7F3] text-[#366348] border border-[#CEE5D7] text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs"
                            >
                              <Smile size={13} className="text-[#366348]" />
                              {mood}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Biomarkers: BBT, Cervical Fluid, Pill, Intimacy */}
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      {selectedDayLog?.bbt && (
                        <div className="bg-[#FAF7F5] p-3 rounded-xl border border-[#EDE5DF]">
                          <span className="text-[10.5px] text-[#7A6C74] block font-medium">Basal Temp (BBT)</span>
                          <span className="font-bold text-[#1E191D]">{selectedDayLog.bbt}° {settings.temperatureUnit === 'Celsius' ? 'C' : 'F'}</span>
                        </div>
                      )}
                      {selectedDayLog?.cervicalMucus && (
                        <div className="bg-[#FAF7F5] p-3 rounded-xl border border-[#EDE5DF]">
                          <span className="text-[10.5px] text-[#7A6C74] block font-medium">Cervical Fluid</span>
                          <span className="font-bold text-[#1E191D] capitalize">{selectedDayLog.cervicalMucus.replace('_', ' ')}</span>
                        </div>
                      )}
                      {selectedDayLog?.pillTaken && (
                        <div className="bg-[#FAF7F5] p-3 rounded-xl border border-[#EDE5DF]">
                          <span className="text-[10.5px] text-[#7A6C74] block font-medium">Birth Control</span>
                          <span className="font-bold text-[#205235] flex items-center gap-1">
                            <Check size={13} /> Pill Taken
                          </span>
                        </div>
                      )}
                      {selectedDayLog?.intimacy && (
                        <div className="bg-[#FAF7F5] p-3 rounded-xl border border-[#EDE5DF]">
                          <span className="text-[10.5px] text-[#7A6C74] block font-medium">Intimacy</span>
                          <span className="font-bold text-[#A64B5B] flex items-center gap-1">
                            <Heart size={13} className="fill-current" /> Logged
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Personal Notes */}
                    {selectedDayLog?.notes && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#EDE5DF] text-[12.5px] text-[#44383F] italic">
                        "{selectedDayLog.notes}"
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty state when no symptoms logged for this date */
                  <div className="py-6 px-4 text-center rounded-2xl bg-[#FAF7F5] border border-dashed border-[#DDD0C8] space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#F5E8EB] text-[#A64B5B] flex items-center justify-center mx-auto">
                      <Leaf size={22} strokeWidth={1.7} />
                    </div>
                    <div>
                      <h4 className="font-serif text-[17px] font-bold text-[#1E191D]">
                        No Symptoms Logged for this Date
                      </h4>
                      <p className="text-[12px] text-[#7A6C74] mt-1 max-w-[280px] mx-auto leading-relaxed">
                        Track physical symptoms, cramps, energy, and mood for {monthName} {selectedDate.getDate()} to train Luna's pattern recognition engine.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSymptomsDetailModal(false);
                          onOpenLogModal(selectedDateStr);
                        }}
                        className="px-5 py-2.5 rounded-full bg-[#543649] hover:bg-[#432A39] text-white text-[13px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus size={15} strokeWidth={2.4} />
                        <span>Log Symptoms for this Date</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSymptomsDetailModal(false);
                      onOpenLogModal(selectedDateStr);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#543649] hover:bg-[#432A39] text-white text-[13.5px] font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus size={16} strokeWidth={2.2} />
                    <span>{hasLoggedData ? 'Edit or Add More Symptoms' : 'Log Daily Symptoms'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSymptomsDetailModal(false);
                        onNavigate('SYMPTOM_HISTORY');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#FAF4F7] hover:bg-[#F3E8EE] text-[#543649] border border-[#ECDCE3] text-[12.5px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <TrendingUp size={14} />
                      <span>Symptom History</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSymptomsDetailModal(false);
                        onNavigate('SYMPTOM_INTENSITY_LOG');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#FAF4F7] hover:bg-[#F3E8EE] text-[#543649] border border-[#ECDCE3] text-[12.5px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Activity size={14} />
                      <span>Rate Intensity</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

