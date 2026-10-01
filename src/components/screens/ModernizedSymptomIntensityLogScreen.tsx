import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Pencil, 
  Home, 
  Plus, 
  BarChart2, 
  User, 
  Check, 
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useDailyLog } from '../../hooks/useDailyLog';

interface ModernizedSymptomIntensityLogScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
  initialSymptom?: string;
}

interface IntensityLevel {
  level: number;
  label: string;
  subtext: string;
}

const INTENSITY_LEVELS: IntensityLevel[] = [
  { level: 5, label: '5 Severe', subtext: 'Incapacitating, bed rest needed' },
  { level: 4, label: '4 Significant', subtext: 'Interferes with daily tasks' },
  { level: 3, label: '3 Moderate', subtext: 'Noticeable discomfort, manageable' },
  { level: 2, label: '2 Mild', subtext: 'Slight awareness, minimal impact' },
  { level: 1, label: '1 None', subtext: 'No symptoms felt' }
];

const AVAILABLE_SYMPTOMS = [
  'Cramps',
  'Headache',
  'Bloating',
  'Lower Back Pain',
  'Fatigue',
  'Breast Tenderness',
  'Mood Swings'
];

export const ModernizedSymptomIntensityLogScreen: React.FC<ModernizedSymptomIntensityLogScreenProps> = ({
  onBack,
  onNavigate,
  initialSymptom = 'Cramps'
}) => {
  const { logDay, isSaving } = useDailyLog();
  const [selectedSymptom, setSelectedSymptom] = useState<string>(initialSymptom);
  const [showSymptomDropdown, setShowSymptomDropdown] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('Mon, Oct 28');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = async () => {
    const currentLevelObj = INTENSITY_LEVELS.find(l => l.level === selectedLevel);
    const today = new Date().toISOString().split('T')[0];
    const intensityNote = `${selectedSymptom}: Level ${selectedLevel} (${currentLevelObj?.label.split(' ')[1] || 'Logged'})`;
    await logDay(today, {
      symptoms: [selectedSymptom.toLowerCase().replace(/ /g, '_')],
      notes: notes ? `${intensityNote} — ${notes}` : intensityNote,
    });
    showToast(`Saved ${selectedSymptom}: Level ${selectedLevel} (${currentLevelObj?.label.split(' ')[1] || 'Logged'})`);
    if (onBack) {
      setTimeout(() => onBack(), 900);
    }
  };

  const activeLevelObj = INTENSITY_LEVELS.find(l => l.level === selectedLevel) || INTENSITY_LEVELS[2];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DC]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FBF9F5] pb-24 shadow-2xl overflow-x-hidden">
        
        {/* Top Watercolor Silk Header Banner (Lilac & Seafoam Waves) */}
        <div className="relative w-full h-[190px] bg-[#F6F2F7] overflow-hidden">
          <img 
            src="/assets/cramps_watercolor_waves_1788590852294.jpg" 
            alt="Lilac and Seafoam Watercolor Waves" 
            className="w-full h-full object-cover opacity-90 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#FBF9F5]" />

          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-neutral-800 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41</span>
            <div className="flex items-center space-x-1.5 text-neutral-800">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Back Button */}
          {onBack && (
            <div className="absolute top-11 left-6 z-20">
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-white/75 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2D2429] hover:bg-white active:scale-95 transition-all shadow-xs"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}

          {/* Title & Date Pill matching screenshot */}
          <div className="absolute bottom-2 left-0 right-0 text-center z-20 px-4">
            {/* Symptom Switcher */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowSymptomDropdown(!showSymptomDropdown)}
                className="font-serif text-[32px] sm:text-[34px] font-medium text-[#465A72] tracking-tight leading-none inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity"
              >
                <span>{selectedSymptom} Intensity</span>
                <ChevronDown size={18} className="text-[#6D839E] opacity-75" />
              </button>

              {/* Symptom Dropdown Menu */}
              <AnimatePresence>
                {showSymptomDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#EDE5DF] py-2 z-50 text-left"
                  >
                    {AVAILABLE_SYMPTOMS.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          setSelectedSymptom(sym);
                          setShowSymptomDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-[13px] font-medium text-left hover:bg-[#F7F4F1] transition-colors flex items-center justify-between ${
                          selectedSymptom === sym ? 'text-[#465A72] font-bold bg-[#F4F6F9]' : 'text-[#3E343C]'
                        }`}
                      >
                        <span>{sym}</span>
                        {selectedSymptom === sym && <Check size={14} className="text-[#6D8DA9]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date Pill: 📅 Mon, Oct 28 */}
            <div className="mt-2.5 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-[#E7DEE4] shadow-xs text-[12.5px] font-semibold text-[#443840]">
                <CalendarIcon size={13} className="text-[#5E4D57]" />
                <span>{selectedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="px-5 pt-3 space-y-4 flex-1">
          
          {/* Main Card: Interactive Vertical Intensity Ruler */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#FAF5EE] rounded-[30px] p-6 border border-[#ECE2D5] shadow-[0_4px_22px_rgba(0,0,0,0.025)] flex flex-col justify-between"
          >
            {/* Vertical Scale Container */}
            <div className="relative py-2 px-3 flex flex-col items-center">
              
              {/* Vertical ruler track line matching screenshot */}
              <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-[3px] bg-[#B9CDDB] rounded-full" />

              {/* Intensity Levels list (5 down to 1) */}
              <div className="w-full space-y-8 relative z-10">
                {INTENSITY_LEVELS.map((lvl) => {
                  const isSelected = selectedLevel === lvl.level;

                  return (
                    <div
                      key={lvl.level}
                      onClick={() => setSelectedLevel(lvl.level)}
                      className="flex items-center cursor-pointer select-none group relative py-1"
                    >
                      {/* Left Label: e.g. "5 Severe", "3 Moderate" */}
                      <div className="w-[45%] pr-4 text-right">
                        <span
                          className={`text-[15px] font-medium transition-colors ${
                            isSelected
                              ? 'text-[#1E191D] font-bold'
                              : 'text-[#4A3F47] group-hover:text-[#1E191D]'
                          }`}
                        >
                          {lvl.label}
                        </span>
                      </div>

                      {/* Center Point / Interactive Thumb */}
                      <div className="w-[10%] flex justify-center items-center">
                        {isSelected ? (
                          // Glowing Concentric Circle Thumb matching screenshot
                          <motion.div
                            layoutId="sliderThumb"
                            className="w-8 h-8 rounded-full bg-[#B3CDE0]/50 flex items-center justify-center p-1 ring-2 ring-[#7F9EB8]/70 shadow-sm"
                          >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#EED5CA] to-[#FCEEE8] border border-[#C29D8D] shadow-inner" />
                          </motion.div>
                        ) : (
                          // Inactive Tick Dot
                          <div className="w-2.5 h-2.5 rounded-full bg-[#B2B5C4] group-hover:scale-125 transition-transform" />
                        )}
                      </div>

                      {/* Right Indicator: Active Callout pill matching "Level 3: Moderate" */}
                      <div className="w-[45%] pl-4 text-left">
                        {isSelected ? (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="leading-tight"
                          >
                            <div className="text-[14px] font-bold text-[#231A21]">
                              Level {lvl.level}:
                            </div>
                            <div className="text-[13.5px] font-semibold text-[#544650]">
                              {lvl.label.replace(/^\d+\s*/, '')}
                            </div>
                          </motion.div>
                        ) : (
                          <span className="text-[11px] text-[#A5979E] opacity-0 group-hover:opacity-60 transition-opacity">
                            Tap to select
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#ECE2D5] my-5" />

            {/* Notes Section matching screenshot */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#241B21]">
                <Pencil size={16} strokeWidth={2} className="text-[#32282F]" />
                <span className="text-[15px] font-bold tracking-tight">Notes</span>
              </div>

              <textarea
                rows={3}
                placeholder="Add notes on triggers or remedies..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-[#DFD3C5] bg-white text-[14px] text-[#221B20] placeholder-[#8E838B] focus:outline-none focus:border-[#7F9EB8] transition-colors resize-none shadow-xs"
              />
            </div>

            {/* Save Log Button matching screenshot */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3.5 rounded-2xl bg-[#85A6C0] hover:bg-[#7799B3] active:scale-[0.98] disabled:opacity-60 text-white text-[15.5px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(133,166,192,0.35)] transition-all"
              >
                <span>{isSaving ? 'Saving…' : 'Save Log'}</span>
                {!isSaving && <span className="text-lg leading-none">→</span>}
              </button>
            </div>

          </motion.div>

        </div>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-transparent px-6 py-2.5 flex justify-between items-center z-30">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('HOME')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <Home size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <CalendarIcon size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Calendar</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center -mt-3"
            onClick={handleSave}
          >
            <div className="w-11 h-11 rounded-full bg-[#85A6C0] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(133,166,192,0.35)] active:scale-95 transition-all">
              <Plus size={22} strokeWidth={2.2} />
            </div>
            <span className="text-[11px] font-medium text-[#736870] mt-0.5">Add</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('INSIGHTS')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <BarChart2 size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Insights</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('PROFILE')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <User size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Profile</span>
          </button>
        </nav>

        {/* iOS Home Indicator bar */}
        <div className="w-full pb-2 flex justify-center bg-white">
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
              className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
            >
              <Check size={14} className="text-[#84C79B]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
