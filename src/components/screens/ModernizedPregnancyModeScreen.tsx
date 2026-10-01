import React, { useState, useEffect } from 'react';
import { 
  Bluetooth, 
  Battery, 
  Home, 
  Calendar, 
  Plus, 
  BarChart2, 
  User, 
  Milk, 
  ClipboardList, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Check,
  Heart,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { usePregnancy } from '../../hooks/usePregnancy';

interface ModernizedPregnancyModeScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

interface WeekData {
  week: number;
  fruit: string;
  image: string;
  comparison: string;
  tip: string;
  babyLength: string;
  babyWeight: string;
}

export const ModernizedPregnancyModeScreen: React.FC<ModernizedPregnancyModeScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { load, save, profile } = usePregnancy();
  const [currentWeek, setCurrentWeek] = useState<number>(12);
  const [showSymptomModal, setShowSymptomModal] = useState<boolean>(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Mild Fatigue']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (profile?.week_number) {
      setCurrentWeek(profile.week_number);
    }
  }, [profile]);

  const weekLibrary: Record<number, WeekData> = {
    8: {
      week: 8,
      fruit: 'Raspberry',
      image: '/assets/pregnancy_lime_art_1788511286837.jpg',
      comparison: 'Baby is the size of a Raspberry',
      tip: 'Small, frequent meals can help ease morning nausea throughout the day.',
      babyLength: '1.6 cm',
      babyWeight: '1 g'
    },
    12: {
      week: 12,
      fruit: 'Lime',
      image: '/assets/pregnancy_lime_art_1788511286837.jpg',
      comparison: 'Baby is the size of a Lime',
      tip: 'Stay hydrated and listen to your body. Gentle walking is great for circulation.',
      babyLength: '5.4 cm',
      babyWeight: '14 g'
    },
    16: {
      week: 16,
      fruit: 'Avocado',
      image: '/assets/nutrition_cycle_botanical_1788510548380.jpg',
      comparison: 'Baby is the size of an Avocado',
      tip: 'Your energy levels might start rebounding as the second trimester begins.',
      babyLength: '11.6 cm',
      babyWeight: '100 g'
    },
    20: {
      week: 20,
      fruit: 'Banana',
      image: '/assets/pregnancy_lime_art_1788511286837.jpg',
      comparison: 'Baby is the size of a Banana',
      tip: 'You might start feeling the first gentle flutters and kicks this week.',
      babyLength: '25.6 cm',
      babyWeight: '300 g'
    }
  };

  const activeWeekData = weekLibrary[currentWeek] || weekLibrary[12];

  const pregnancySymptomOptions = [
    'Mild Fatigue',
    'Morning Nausea',
    'Food Cravings',
    'Aversion to Smells',
    'Breast Tenderness',
    'Frequent Urination',
    'Gentle Flutters',
    'Glowing Skin'
  ];

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleSaveSymptoms = () => {
    setShowSymptomModal(false);
    const todayStr = new Date().toISOString().slice(0, 10);
    save(todayStr, `Logged Symptoms: ${selectedSymptoms.join(', ')}`).catch(err => {
      console.error('Failed to save pregnancy log:', err);
    });
    setToastMessage(`Saved ${selectedSymptoms.length} pregnancy symptoms!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-24 relative overflow-x-hidden font-sans select-none flex flex-col items-center">
      {/* Phone container */}
      <div className="w-full max-w-md bg-[#FAF9F7] min-h-screen relative flex flex-col justify-between shadow-2xl overflow-hidden">

        {/* Status Bar matching modernized_pregnancy_mode_screen.png */}
        {/* Sprint, 9:41 AM, Bluetooth, 100% */}
        <div className="w-full pt-2.5 px-6 flex items-center justify-between text-[#1E191D] text-[13px] font-medium z-30">
          <span className="font-semibold text-[13.5px]">Sprint</span>
          <span className="font-semibold text-[13.5px]">9:41 AM</span>
          <div className="flex items-center gap-1.5 text-[#1E191D]">
            <Bluetooth size={14} />
            <span className="text-[12.5px] font-semibold">100%</span>
            <Battery size={17} className="fill-current" />
          </div>
        </div>

        {/* Top Header Bar */}
        <div className="px-6 pt-3 pb-1 flex items-center justify-between relative z-30">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-[#554C53] hover:bg-white shadow-xs cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-[20px] font-semibold text-[#1E191D] tracking-tight">
            Pregnancy Mode
          </h1>

          <div className="w-8 h-8" />
        </div>

        {/* Flowing Silk Waves Ribbon Header Artwork */}
        <div className="relative w-full h-[120px] sm:h-[135px] overflow-hidden -mt-2">
          <svg className="w-full h-full object-cover" viewBox="0 0 400 140" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveSage" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8DA38B" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#CAD8C5" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="waveRose" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DF9B98" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#CCA0AF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#D98A94" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="wavePlum" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9C7F93" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#6C5369" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Back Wave (Sage) */}
            <path
              d="M -20,40 C 60,90 140,10 240,70 C 320,110 380,50 420,70 L 420,-10 L -20,-10 Z"
              fill="url(#waveSage)"
            />

            {/* Middle Wave (Rose & Mauve) */}
            <path
              d="M -20,70 C 80,120 160,35 250,90 C 330,130 380,85 430,105 L 430,-10 L -20,-10 Z"
              fill="url(#waveRose)"
            />

            {/* Foreground Wave (Plum Ribbon) */}
            <path
              d="M -20,100 C 70,135 150,70 240,115 C 330,150 380,105 430,125 L 430,140 L -20,140 Z"
              fill="#FAF9F7"
            />
          </svg>
        </div>

        {/* Central Content Area */}
        <div className="px-6 -mt-2 flex-1 flex flex-col justify-center">

          {/* Central Hero Card matching modernized_pregnancy_mode_screen.png */}
          <div className="relative mb-6">
            {/* Outer Soft Coral/Rose Glow Aura */}
            <div className="absolute -inset-1.5 rounded-[36px] bg-gradient-to-r from-[#F6D2CF]/40 via-[#FDE4DB]/50 to-[#EAD4DC]/40 blur-xl pointer-events-none" />

            <div className="relative bg-white/95 backdrop-blur-md rounded-[32px] border border-[#F6E5DF] p-6 sm:p-7 text-center shadow-[0_12px_44px_rgba(240,195,195,0.4)]">
              
              {/* Week Switcher / Controls */}
              <div className="flex items-center justify-between mb-3 px-2">
                <button
                  type="button"
                  onClick={() => {
                    const weeks = [8, 12, 16, 20];
                    const idx = weeks.indexOf(currentWeek);
                    if (idx > 0) setCurrentWeek(weeks[idx - 1]);
                  }}
                  disabled={currentWeek === 8}
                  className="w-7 h-7 rounded-full bg-[#FAF5F2] text-[#6E646B] flex items-center justify-center hover:bg-[#F2EAE5] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft size={16} />
                </button>

                <h2 className="font-serif text-[32px] sm:text-[38px] font-normal text-[#483743] tracking-normal leading-none">
                  Week {activeWeekData.week}
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    const weeks = [8, 12, 16, 20];
                    const idx = weeks.indexOf(currentWeek);
                    if (idx < weeks.length - 1) setCurrentWeek(weeks[idx + 1]);
                  }}
                  disabled={currentWeek === 20}
                  className="w-7 h-7 rounded-full bg-[#FAF5F2] text-[#6E646B] flex items-center justify-center hover:bg-[#F2EAE5] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Next Week"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Photorealistic Lime / Fruit Centerpiece */}
              <div className="my-3 flex justify-center">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                  <img
                    src={activeWeekData.image}
                    alt={activeWeekData.fruit}
                    className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Subtitle Comparison */}
              <div className="text-[17px] sm:text-[18px] font-normal text-[#1E191D] tracking-tight">
                {activeWeekData.comparison}
              </div>

              {/* Quick stats pill */}
              <div className="mt-3 inline-flex items-center gap-3 px-3.5 py-1 rounded-full bg-[#F8F4F0] text-[11.5px] font-medium text-[#7C7178]">
                <span>Length: {activeWeekData.babyLength}</span>
                <span>•</span>
                <span>Weight: {activeWeekData.babyWeight}</span>
              </div>
            </div>
          </div>

          {/* Bottom Two Cards: Daily Pregnancy Tip & Symptom Log */}
          <div className="grid grid-cols-2 gap-3.5 mb-4">
            
            {/* Left Card: Daily Pregnancy Tip */}
            <div className="bg-white/95 rounded-[26px] p-4 sm:p-4.5 border border-[#F2ECE7] shadow-[0_4px_18px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[145px]">
              <div>
                {/* Icon in pill */}
                <div className="w-9 h-9 rounded-2xl bg-[#F8ECF0] text-[#A6546C] flex items-center justify-center mb-3">
                  <Milk size={18} strokeWidth={2} />
                </div>
                <h3 className="text-[14px] font-bold text-[#1E191D] tracking-tight mb-1.5 leading-snug">
                  Daily Pregnancy Tip
                </h3>
                <p className="text-[11.5px] text-[#6E646A] leading-relaxed">
                  {activeWeekData.tip}
                </p>
              </div>
            </div>

            {/* Right Card: Symptom Log */}
            <div className="bg-white/95 rounded-[26px] p-4 sm:p-4.5 border border-[#F2ECE7] shadow-[0_4px_18px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[145px]">
              <div>
                {/* Icon in pill */}
                <div className="w-9 h-9 rounded-2xl bg-[#F8ECF0] text-[#A6546C] flex items-center justify-center mb-3">
                  <ClipboardList size={18} strokeWidth={2} />
                </div>
                <h3 className="text-[14px] font-bold text-[#1E191D] tracking-tight mb-1.5 leading-snug">
                  Symptom Log
                </h3>
                <p className="text-[11.5px] text-[#6E646A] leading-relaxed mb-2">
                  Log your symptoms today for better insights.
                </p>
              </div>

              {/* Add Now link */}
              <button
                type="button"
                onClick={() => setShowSymptomModal(true)}
                className="text-left text-[13px] font-semibold text-[#678B78] hover:text-[#4F7360] transition-colors cursor-pointer"
              >
                Add Now
              </button>
            </div>

          </div>

        </div>

        {/* Bottom Navigation Bar */}
        <div className="bg-white/95 backdrop-blur-md border-t border-[#EAE3DC] px-6 py-2.5 flex items-center justify-between sticky bottom-0 z-30">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('HOME') : onBack()}
            className="flex flex-col items-center gap-0.5 text-[#5C7D64]"
          >
            <div className="w-6 h-0.5 bg-[#5C7D64] rounded-full -mt-2 mb-1" />
            <Home size={20} strokeWidth={2.2} />
            <span className="text-[10.5px] font-bold">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="flex flex-col items-center gap-0.5 text-[#7C757B] hover:text-[#1E191D] transition-colors"
          >
            <Calendar size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Calendar</span>
          </button>

          {/* Add Center Button */}
          <button
            type="button"
            onClick={() => setShowSymptomModal(true)}
            className="flex flex-col items-center -mt-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#5C7D64] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(92,125,100,0.35)] active:scale-95 transition-all">
              <Plus size={22} strokeWidth={2.6} />
            </div>
            <span className="text-[10.5px] font-medium text-[#7C757B] mt-0.5">Add</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('INSIGHTS')}
            className="flex flex-col items-center gap-0.5 text-[#7C757B] hover:text-[#1E191D] transition-colors"
          >
            <BarChart2 size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Insights</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('PROFILE')}
            className="flex flex-col items-center gap-0.5 text-[#7C757B] hover:text-[#1E191D] transition-colors"
          >
            <User size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Profile</span>
          </button>
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full pb-2 flex justify-center bg-white">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>
      </div>

      {/* Symptom Log Modal */}
      <AnimatePresence>
        {showSymptomModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#EDE5DF]"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[18px] font-serif font-bold text-[#1E191D]">
                    Pregnancy Symptoms
                  </h3>
                  <p className="text-[12px] text-[#7E747B]">
                    Week {activeWeekData.week} Daily Check-in
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSymptomModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F5EFEB] text-[#6E646A] flex items-center justify-center hover:bg-[#EAE2DC]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {pregnancySymptomOptions.map((opt) => {
                  const isSelected = selectedSymptoms.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleSymptom(opt)}
                      className={`p-2.5 rounded-2xl text-[12.5px] font-medium text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2F7F2] border-[#5C7D64] text-[#2C4832] font-semibold'
                          : 'bg-[#FDFBFA] border-[#E8DFD8] text-[#554C53] hover:border-[#D0C5BD]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleSaveSymptoms}
                className="w-full py-3 rounded-full bg-[#5C7D64] hover:bg-[#4D6D55] text-white font-bold text-[14px] shadow-sm active:scale-98 transition-all cursor-pointer"
              >
                Save Logged Symptoms
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1E191D] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full shadow-xl z-50 flex items-center gap-2"
          >
            <Check size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
