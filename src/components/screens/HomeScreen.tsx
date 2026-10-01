import React, { useState } from 'react';
import { 
  Sparkles, 
  Droplets, 
  Heart, 
  Thermometer, 
  Pill, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Smile, 
  Users, 
  Lock,
  RefreshCw,
  Plus,
  HeartHandshake,
  ShieldAlert,
  User,
  Utensils,
  Dumbbell,
  Flame,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';
import { formatDateToISO } from '../../utils/cycleCalculations';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

interface HomeScreenProps {
  onNavigate: (view: AppView) => void;
  onOpenLogModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onOpenLogModal }) => {
  const { currentCycle, settings, dayLogs, saveDayLog, setSelectedDate } = useCycle();
  const { user, isSignedIn } = useUser();

  const handleQuickToggleSymptom = (symptom: string) => {
    const currentSymptoms = todayLog?.symptoms || [];
    const updated = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];
    saveDayLog(todayStr, { symptoms: updated });
  };
  const [wellnessTab, setWellnessTab] = useState<'nutrition' | 'movement'>('nutrition');
  const [isWellnessExpanded, setIsWellnessExpanded] = useState(true);

  const todayStr = formatDateToISO(new Date());
  const todayLog = dayLogs[todayStr];

  // Recommendations for Cycle-Synced Daily Nutrition & Workout
  const phaseRecommendations = {
    MENSTRUAL: {
      accentColor: '#DE9E8E',
      badgeBg: 'bg-[#FDF0EC] text-[#6E3544]',
      nutrition: {
        focusTitle: 'Replenishing & Anti-inflammatory',
        macronutrient: 'Iron-Rich Soups & Minerals',
        recommendedFoods: ['Warm bone broth or dark miso', 'Steamed spinach & kale', 'Wild berries & pumpkin seeds', '70%+ Dark chocolate (Magnesium)'],
        hydrationTip: 'Ginger or cinnamon tea to soothe pelvic cramping.',
        calorieNote: 'Resting basal metabolic baseline'
      },
      movement: {
        focusTitle: 'Restorative & Gentle Unwinding',
        intensity: 'Low (Zone 1)',
        intensityPercent: 30,
        suggestedWorkouts: ['Yin Yoga & Deep Pelvic Stretches', '20-30 min Mindful Nature Walk', 'Diaphragmatic Breathwork'],
        guidance: 'Progesterone and estrogen are at baseline. Honor your body’s need for restoration and restorative sleep.'
      }
    },
    FOLLICULAR: {
      accentColor: '#9BC0A8',
      badgeBg: 'bg-[#EBF3EE] text-[#345942]',
      nutrition: {
        focusTitle: 'Vibrant & Estrogen-Metabolizing',
        macronutrient: 'Fermented Foods & Lean Proteins',
        recommendedFoods: ['Kimchi or organic sauerkraut', 'Sprouted grains & avocados', 'Wild caught salmon', 'Citrus fruits & broccoli sprouts'],
        hydrationTip: 'Lemon cucumber infused water for optimal cellular hydration.',
        calorieNote: 'High insulin sensitivity & sustained energy'
      },
      movement: {
        focusTitle: 'Dynamic Energy & Habit Building',
        intensity: 'Moderate to High (Zones 2-4)',
        intensityPercent: 70,
        suggestedWorkouts: ['Dynamic Reformer Pilates', 'Progressive Resistance Training', 'Brisk Trail Run or Cycling'],
        guidance: 'Rising estrogen accelerates muscle synthesis and mental alertness. Great window to try new fitness challenges.'
      }
    },
    OVULATION: {
      accentColor: '#E4B67C',
      badgeBg: 'bg-[#FDF6ED] text-[#784A1D]',
      nutrition: {
        focusTitle: 'Antioxidant & Fiber Rich',
        macronutrient: 'Cruciferous Greens & Glutathione',
        recommendedFoods: ['Asparagus & Brussels sprouts', 'Quinoa bowls with bell peppers', 'Chia pudding with fresh raspberries', 'Raw almonds & sunflower seeds'],
        hydrationTip: 'Coconut water with trace minerals to balance body heat.',
        calorieNote: 'Peak energetic stamina & metabolic turnover'
      },
      movement: {
        focusTitle: 'Peak Power & Stamina',
        intensity: 'High (Zone 4-5)',
        intensityPercent: 95,
        suggestedWorkouts: ['High-Intensity Interval Training (HIIT)', 'Compound Strength PRs (Deadlift/Squat)', 'Group Spin or Dance Cardio'],
        guidance: 'Estrogen and testosterone surge together. Maximum strength, fast-twitch motor recruitment, and social energy.'
      }
    },
    LUTEAL: {
      accentColor: '#C79CB7',
      badgeBg: 'bg-[#F9EEF4] text-[#54384B]',
      nutrition: {
        focusTitle: 'Slow-Burning & Progesterone Support',
        macronutrient: 'Complex Carbs, B6 & Magnesium',
        recommendedFoods: ['Roasted sweet potatoes & squash', 'Lentils & roasted chickpeas', 'Walnuts & raw sesame seeds', 'Organic poultry or edamame'],
        hydrationTip: 'Chamomile or roasted dandelion root tea to reduce luteal fluid retention.',
        calorieNote: '+100 to 250 kcal elevated metabolic rate'
      },
      movement: {
        focusTitle: 'Steady Endurance & Centered Strength',
        intensity: 'Moderate (Zones 2-3)',
        intensityPercent: 55,
        suggestedWorkouts: ['Slow-Tempo Resistance & Core Focus', 'Incline Treadmill or Hill Walking', 'Vinyasa Flow & Mat Pilates'],
        guidance: 'Progesterone elevates body temperature (+0.3°F). Stay hydrated and focus on controlled, rhythmic movement.'
      }
    }
  }[currentCycle.currentPhase];

  // Phase colors and styling
  const phaseTheme = {
    MENSTRUAL: {
      bg: 'from-[#82394D] via-[#6B2A3B] to-[#4A1B27]',
      accent: '#FFA5B7',
      badge: 'bg-[#FFA5B7]/25 text-[#FFE3E8] border border-[#FFA5B7]/30',
      glow: 'shadow-[0_14px_44px_rgba(214,86,116,0.35)]',
      progressStroke: '#FF88A3'
    },
    FOLLICULAR: {
      bg: 'from-[#5D7068] via-[#465E54] to-[#30453C]',
      accent: '#A8D4BC',
      badge: 'bg-[#A8D4BC]/20 text-[#E0F2E9] border border-[#A8D4BC]/30',
      glow: 'shadow-[0_12px_40px_rgba(85,111,98,0.3)]',
      progressStroke: '#A8D4BC'
    },
    OVULATION: {
      bg: 'from-[#8E5A44] via-[#754632] to-[#542F21]',
      accent: '#F7BA97',
      badge: 'bg-[#F7BA97]/25 text-[#FFE9DC] border border-[#F7BA97]/30',
      glow: 'shadow-[0_14px_40px_rgba(230,138,102,0.32)]',
      progressStroke: '#F7BA97'
    },
    LUTEAL: {
      bg: 'from-[#633B57] via-[#4F2B44] to-[#36192E]',
      accent: '#E5AECF',
      badge: 'bg-[#E5AECF]/25 text-[#FCECF6] border border-[#E5AECF]/30',
      glow: 'shadow-[0_14px_44px_rgba(184,86,146,0.32)]',
      progressStroke: '#E5AECF'
    }
  }[currentCycle.currentPhase];

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('PROFILE')}
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform flex items-center justify-center bg-[#FAF3F0] text-[#55374C]"
            title="Open Profile"
          >
            {settings.avatarUrl ? (
              <img
                src={settings.avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : settings.userName ? (
              <span className="font-serif font-bold text-sm">
                {settings.userName.slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <User size={18} strokeWidth={1.8} className="text-[#7A6C74]" />
            )}
          </button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <img
                src="/assets/hercadence_logo.jpg"
                alt="HerCadence Logo"
                className="w-4 h-4 rounded-full object-cover shadow-2xs border border-[#EAE0D9]"
                referrerPolicy="no-referrer"
              />
              <span className="text-[11px] font-bold text-[#523446] tracking-tight">HerCadence</span>
              <span className="text-stone-300 text-[10px]">•</span>
              <p className="text-[11px] font-medium text-[#7A6C74]">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <h1 className="text-xl font-serif font-bold text-[#20171D]">
              {settings.userName ? `Hello, ${settings.userName}` : 'Welcome'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SignedIn>
            <div className="flex items-center">
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-[#523446] hover:bg-[#3D2232] text-white text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <button
            onClick={() => onNavigate('NOTIFICATIONS')}
            className="p-2.5 rounded-full bg-white/80 border border-[#EDE4DE] text-[#523446] shadow-sm hover:bg-white transition-colors cursor-pointer"
            title="Alerts & Reminders"
          >
            <Sparkles size={18} />
          </button>
        </div>
      </header>

      {/* Modern Harmonized Views Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => onNavigate('HARMONIZED_DASHBOARD')}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FAF3F0] to-[#EFF6F2] border border-[#EDE4DE] text-[#482E3F] text-xs font-semibold hover:border-[#D0C0C8] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-[#8EA899]" />
          <span>Home Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('HARMONIZED_HOME')}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#EFF6F2] to-[#FAF3F0] border border-[#EDE4DE] text-[#482E3F] text-xs font-semibold hover:border-[#D0C0C8] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-[#DE9E8E]" />
          <span>Harmonized Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('HARMONIZED_CALENDAR')}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-[#EDE4DE] text-[#5C4D56] text-xs font-medium hover:border-[#D0C0C8] transition-all cursor-pointer shadow-2xs"
        >
          <span>Harmonized Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('HARMONIZED_INSIGHTS')}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-[#EDE4DE] text-[#5C4D56] text-xs font-medium hover:border-[#D0C0C8] transition-all cursor-pointer shadow-2xs"
        >
          <span>Harmonized Insights</span>
        </button>
      </div>

      {/* Main Cycle Status Hero Card */}
      <div
        id="hero_cycle_phase_card"
        className={`relative overflow-hidden rounded-[36px] bg-gradient-to-br ${phaseTheme.bg} text-white p-6 sm:p-7 ${phaseTheme.glow} transition-all`}
      >
        {/* Subtle background wave overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_top_right,white,transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Phase Badge */}
          <span className={`px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${phaseTheme.badge}`}>
            {currentCycle.phaseDisplayName}
          </span>

          {/* Central Circular Cycle Dial */}
          <div className="relative flex items-center justify-center w-40 h-40 my-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Active Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={phaseTheme.progressStroke}
                strokeWidth="6.5"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * currentCycle.currentDayOfCycle) / settings.cycleLengthDays}
                strokeLinecap="round"
                fill="transparent"
                className="drop-shadow-[0_0_8px_rgba(255,165,183,0.6)]"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                Day {currentCycle.currentDayOfCycle}
              </span>
              <span className="text-[11px] text-white/70 tracking-wide font-medium mt-0.5">
                of {settings.cycleLengthDays} days
              </span>
            </div>
          </div>

          {/* Pregnancy Probability & Period Countdown */}
          <div className="grid grid-cols-2 gap-3 w-full pt-1 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <p className="text-[11px] text-white/70">Chance of Pregnancy</p>
              <p className="text-sm font-semibold text-white mt-0.5">{currentCycle.chanceOfPregnancy}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <p className="text-[11px] text-white/70">Period In</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {currentCycle.daysUntilNextPeriod} {currentCycle.daysUntilNextPeriod === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          {/* Phase Guidance text */}
          <p className="text-xs text-white/80 leading-relaxed max-w-sm pt-1">
            {currentCycle.phaseDescription}
          </p>

          {/* Fast Log Button inside hero */}
          <button
            onClick={onOpenLogModal}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-white via-[#FFF5F7] to-white text-[#20171D] font-bold text-sm shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={18} className="text-[#D05670]" />
            <span>{todayLog ? 'Update Today’s Log' : 'Log Today’s Symptoms'}</span>
          </button>
        </div>
      </div>

      {/* Daily Hormone & Energy Forecast Widget (Pink Glow Theme) */}
      <div className="p-4 rounded-[26px] bg-gradient-to-br from-[#FFF5F7] via-[#FAF2F5] to-[#FBF0EE] border border-[#F5D8E1] shadow-[0_4px_18px_rgba(214,86,116,0.06)] relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#DE687F] to-[#F294A5] text-white flex items-center justify-center shadow-xs">
              <Sparkles size={14} />
            </div>
            <span className="text-[13px] font-bold text-[#452335] tracking-tight">
              Daily Hormone Forecast
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DE687F]/15 text-[#B63D57]">
            Day {currentCycle.currentDayOfCycle} • {currentCycle.phaseDisplayName}
          </span>
        </div>
        <p className="text-[12.5px] text-[#5C3949] leading-relaxed">
          {currentCycle.currentPhase === 'MENSTRUAL' && 'Estrogen and progesterone are at baseline. Your nervous system craves gentle warmth, hydration, and lower social demands.'}
          {currentCycle.currentPhase === 'FOLLICULAR' && 'Rising estradiol is sharpening your mental acuity, verbal fluency, and recovery speed. Ideal window for creative deep work!'}
          {currentCycle.currentPhase === 'OVULATION' && 'Luteinizing hormone and testosterone peak today. Confidence, physical strength, and communication are naturally heightened.'}
          {currentCycle.currentPhase === 'LUTEAL' && 'Progesterone is peaking to warm the core body. You may feel a desire for nesting, slower evenings, and steady magnesium intake.'}
        </p>
      </div>

      {/* 1-Tap Quick Symptom & Mood Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[12.5px] font-bold text-[#1E191D] flex items-center gap-1.5">
            <Zap size={14} className="text-[#D05670]" />
            <span>Quick-Log Symptoms</span>
          </span>
          <button
            onClick={onOpenLogModal}
            className="text-[11px] font-semibold text-[#D05670] hover:underline cursor-pointer"
          >
            All Logs →
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-[12px]">
          {[
            { id: 'Cramps', emoji: '🩸', label: 'Cramps' },
            { id: 'Bloating', emoji: '💧', label: 'Bloating' },
            { id: 'Fatigue', emoji: '😴', label: 'Fatigue' },
            { id: 'Headache', emoji: '⚡', label: 'Headache' },
            { id: 'Sweet Cravings', emoji: '🍫', label: 'Cravings' },
            { id: 'High Energy', emoji: '✨', label: 'High Energy' },
            { id: 'Calm', emoji: '🌸', label: 'Calm' },
            { id: 'Sensitive', emoji: '🫂', label: 'Sensitive' }
          ].map((item) => {
            const isSelected = (todayLog?.symptoms || []).includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleQuickToggleSymptom(item.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#DE687F] to-[#CE516B] text-white border-transparent shadow-[0_2px_8px_rgba(222,104,127,0.35)]'
                    : 'bg-white text-[#523446] border-[#F2DCE4] hover:border-[#DE687F]/40 hover:bg-[#FFF5F7]'
                }`}
              >
                <span>{item.emoji}</span>
                <span className="font-medium text-[11.5px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Feature Action Shortcuts */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={() => onNavigate('BBT_LOG')}
          className="p-3 bg-white rounded-2xl border border-[#EDE4DE] shadow-sm flex flex-col items-center text-center hover:border-[#7D9688] hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#EBF1ED] text-[#415C4C] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Thermometer size={20} />
          </div>
          <span className="text-[11px] font-semibold text-[#20171D]">BBT Log</span>
          <span className="text-[9px] text-[#8E7E87]">
            {todayLog?.bbt ? `${todayLog.bbt}°` : 'Track'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('BIRTH_CONTROL')}
          className="p-3 bg-white rounded-2xl border border-[#EDE4DE] shadow-sm flex flex-col items-center text-center hover:border-[#523446] hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#F2E8EC] text-[#523446] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Pill size={20} />
          </div>
          <span className="text-[11px] font-semibold text-[#20171D]">Pill Pack</span>
          <span className="text-[9px] text-[#8E7E87]">
            {settings.birthControl.currentPillIndex}/{settings.birthControl.packTotalPills}
          </span>
        </button>

        <button
          onClick={() => onNavigate('PARTNER_SYNC')}
          className="p-3 bg-white rounded-2xl border border-[#EDE4DE] shadow-sm flex flex-col items-center text-center hover:border-[#DE9E8E] hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#FDF0EC] text-[#DE9E8E] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <span className="text-[11px] font-semibold text-[#20171D]">Partner</span>
          <span className="text-[9px] text-[#8E7E87]">
            {settings.partnerSync.isEnabled ? 'Synced' : 'Connect'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('FEELING_TODAY')}
          className="p-3 bg-white rounded-2xl border border-[#EDE4DE] shadow-sm flex flex-col items-center text-center hover:border-[#E4B67C] hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#FCF4EB] text-[#C48C48] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Smile size={20} />
          </div>
          <span className="text-[11px] font-semibold text-[#20171D]">Mood</span>
          <span className="text-[9px] text-[#8E7E87]">
            {todayLog?.moods?.length ? todayLog.moods[0] : 'Check in'}
          </span>
        </button>
      </div>

      {/* Cycle-Synced Daily Nutrition & Movement Widget */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-[28px] p-5 border border-[#EDE4DE] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 relative overflow-hidden"
      >
        {/* Header with Phase Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF5F2] text-[#543649] flex items-center justify-center border border-[#EDE4DE]">
              {wellnessTab === 'nutrition' ? <Utensils size={16} /> : <Dumbbell size={16} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#1E191D] tracking-tight">Cycle-Synced Rhythm</h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${phaseRecommendations.badgeBg}`}>
                  {currentCycle.phaseDisplayName} Phase
                </span>
              </div>
              <p className="text-[11px] text-[#7A6C74]">
                Personalized for {settings.baselineHealth?.weight || 58} {settings.baselineHealth?.weightUnit || 'kg'} • {settings.baselineHealth?.activityLevel || 'Active'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWellnessExpanded(!isWellnessExpanded)}
            className="text-[11px] font-semibold text-[#543649] hover:underline"
          >
            {isWellnessExpanded ? 'Collapse' : 'Details'}
          </button>
        </div>

        {/* Nutrition vs Movement Segmented Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#F6F1ED] rounded-full border border-[#EDE4DE]">
          <button
            type="button"
            onClick={() => setWellnessTab('nutrition')}
            className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              wellnessTab === 'nutrition'
                ? 'bg-white text-[#20171D] shadow-xs'
                : 'text-[#7A6C74] hover:text-[#20171D]'
            }`}
          >
            <Utensils size={13} />
            <span>Nutrition Plate</span>
          </button>

          <button
            type="button"
            onClick={() => setWellnessTab('movement')}
            className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              wellnessTab === 'movement'
                ? 'bg-white text-[#20171D] shadow-xs'
                : 'text-[#7A6C74] hover:text-[#20171D]'
            }`}
          >
            <Dumbbell size={13} />
            <span>Movement Plan</span>
          </button>
        </div>

        {/* Tab Content with Spring Animation */}
        <AnimatePresence mode="wait">
          {isWellnessExpanded && wellnessTab === 'nutrition' && (
            <motion.div
              key="nutrition-content"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 pt-0.5 text-xs"
            >
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EDE4DE] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#543649] text-[13px]">
                    {phaseRecommendations.nutrition.focusTitle}
                  </span>
                  <span className="text-[10px] text-[#7A6C74] font-medium">
                    {phaseRecommendations.nutrition.calorieNote}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#7A6C74]">
                  Key Focus: <strong className="text-[#1E191D]">{phaseRecommendations.nutrition.macronutrient}</strong>
                </p>
              </div>

              {/* Recommended Foods Badges */}
              <div>
                <span className="text-[11px] font-semibold text-[#543649] uppercase tracking-wider block mb-1.5">
                  Optimal Phase Superfoods:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {phaseRecommendations.nutrition.recommendedFoods.map((food, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white border border-[#EDE4DE] flex items-center gap-1.5 text-[11.5px] text-[#1E191D]"
                    >
                      <CheckCircle2 size={13} className="text-[#87A997] flex-shrink-0" />
                      <span className="truncate">{food}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hydration Note */}
              <div className="p-2.5 bg-[#FAF6F3] rounded-xl border border-[#EDE4DE] flex items-center gap-2 text-[11.5px] text-[#634E5C]">
                <Droplets size={14} className="text-[#DE9E8E] flex-shrink-0" />
                <span><strong>Hydration:</strong> {phaseRecommendations.nutrition.hydrationTip}</span>
              </div>
            </motion.div>
          )}

          {isWellnessExpanded && wellnessTab === 'movement' && (
            <motion.div
              key="movement-content"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 pt-0.5 text-xs"
            >
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EDE4DE] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#543649] text-[13px]">
                    {phaseRecommendations.movement.focusTitle}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-[#543649] border border-[#EDE4DE]">
                    {phaseRecommendations.movement.intensity}
                  </span>
                </div>

                {/* Intensity meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] text-[#7A6C74]">
                    <span>Suggested Training Intensity</span>
                    <span>{phaseRecommendations.movement.intensityPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EDE4DE] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${phaseRecommendations.movement.intensityPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#87A997] to-[#DE9E8E]"
                    />
                  </div>
                </div>
              </div>

              {/* Suggested Workouts */}
              <div>
                <span className="text-[11px] font-semibold text-[#543649] uppercase tracking-wider block mb-1.5">
                  Suggested Workouts for Today:
                </span>
                <div className="space-y-1.5">
                  {phaseRecommendations.movement.suggestedWorkouts.map((workout, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-[#EDE4DE] flex items-center justify-between text-[11.5px] text-[#1E191D]"
                    >
                      <div className="flex items-center gap-2">
                        <Flame size={14} className="text-[#DE9E8E]" />
                        <span className="font-medium">{workout}</span>
                      </div>
                      <span className="text-[10px] text-[#8E7E87]">Synced</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physiological Guidance */}
              <p className="text-[11.5px] text-[#7A6C74] italic leading-relaxed px-1">
                "{phaseRecommendations.movement.guidance}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Holistic Phase & Hormone Wisdom (100% Offline & Deterministic) */}
      <div className="bg-white rounded-3xl p-5 border border-[#EDE4DE] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#F2E8EC] rounded-xl text-[#523446]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#20171D]">Phase Hormone Insights</h3>
              <p className="text-[11px] text-[#7A6C74]">Tailored to Day {currentCycle.currentDayOfCycle} • {currentCycle.phaseDisplayName}</p>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FAF5F2] text-[#523446] border border-[#EAE0D9]">
            {phaseRecommendations?.nutrition.calorieNote || 'Balanced Energy'}
          </span>
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE0D9]">
            <span className="font-semibold text-[#523446] block mb-1">🌿 Phase Overview</span>
            <p className="text-stone-700 leading-relaxed">
              {phaseRecommendations?.movement.guidance || 'Listen to your body’s natural rhythm today. Prioritize balanced rest and steady hydration.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-[#EBF1ED] rounded-xl text-[#334D3F]">
              <span className="font-semibold block mb-0.5">🥑 Nutrition Focus</span>
              <p className="text-[11px] leading-snug">{phaseRecommendations?.nutrition.focusTitle}</p>
              <p className="text-[10px] text-[#4F685B] mt-1">{phaseRecommendations?.nutrition.hydrationTip}</p>
            </div>
            <div className="p-2.5 bg-[#FDF0EC] rounded-xl text-[#6B3B30]">
              <span className="font-semibold block mb-0.5">🧘 Movement &amp; Energy</span>
              <p className="text-[11px] leading-snug">{phaseRecommendations?.movement.focusTitle}</p>
              <p className="text-[10px] text-[#824D41] mt-1">Intensity: {phaseRecommendations?.movement.intensity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Log Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#EDE4DE] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#20171D]">Today's Wellness Record</h3>
          <button
            onClick={() => {
              setSelectedDate(todayStr);
              onNavigate('CALENDAR');
            }}
            className="text-xs font-medium text-[#523446] hover:underline flex items-center gap-0.5"
          >
            View Calendar <ChevronRight size={14} />
          </button>
        </div>

        {todayLog && (todayLog.flow || todayLog.moods.length > 0 || todayLog.symptoms.length > 0 || todayLog.bbt || todayLog.notes) ? (
          <div className="space-y-2 text-xs">
            {todayLog.flow && (
              <div className="flex items-center gap-2">
                <span className="text-[#8E7E87] w-20">Flow:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-medium capitalize">
                  {todayLog.flow}
                </span>
              </div>
            )}

            {todayLog.bbt && (
              <div className="flex items-center gap-2">
                <span className="text-[#8E7E87] w-20">BBT:</span>
                <span className="font-semibold text-[#415C4C]">{todayLog.bbt}° {settings.temperatureUnit === 'Celsius' ? 'C' : 'F'}</span>
              </div>
            )}

            {todayLog.moods.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[#8E7E87] w-20 pt-0.5">Moods:</span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {todayLog.moods.map(m => (
                    <span key={m} className="px-2 py-0.5 bg-[#F2E8EC] text-[#523446] rounded-md text-[11px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {todayLog.symptoms.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[#8E7E87] w-20 pt-0.5">Symptoms:</span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {todayLog.symptoms.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-[#EBF1ED] text-[#415C4C] rounded-md text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {todayLog.notes && (
              <div className="pt-2 border-t border-[#F0EAE5] text-stone-600 italic">
                "{todayLog.notes}"
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#DDD0C8]">
            <p className="text-xs text-stone-500 mb-2">No symptoms or moods logged for today yet.</p>
            <button
              onClick={onOpenLogModal}
              className="px-4 py-1.5 bg-[#523446] text-white text-xs font-semibold rounded-full hover:bg-[#432A39]"
            >
              + Quick Log
            </button>
          </div>
        )}
      </div>

      {/* Next Cycle Events Timeline */}
      <div className="bg-white rounded-3xl p-5 border border-[#EDE4DE] shadow-sm">
        <h3 className="text-sm font-semibold text-[#20171D] mb-3">Predicted Milestones</h3>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FCF4EB] text-[#633F17]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D9822B]" />
              <div>
                <span className="font-semibold block">Fertile Window</span>
                <span className="text-[11px] text-stone-600">
                  {currentCycle.fertileWindowStart} to {currentCycle.fertileWindowEnd}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-medium">Ovulation ~ {currentCycle.nextOvulationDate}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FDF0EC] text-[#6E3544]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#DE9E8E]" />
              <div>
                <span className="font-semibold block">Next Period</span>
                <span className="text-[11px] text-stone-600">Expected start date</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold">{currentCycle.nextPeriodStartDate}</span>
          </div>
        </div>
      </div>

      {/* Quick Care & Support Cards */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => onNavigate('DOCTORS_CARE_TEAM')}
          className="bg-white hover:bg-[#FDFCFB] active:scale-[0.98] rounded-3xl p-4 border border-[#EDE4DE] shadow-xs flex flex-col justify-between text-left transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-[#F4EDE8] text-[#543649] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <HeartHandshake size={20} />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-[#1E191D] leading-snug">
              Care Team
            </h4>
            <p className="text-[11px] text-[#7A6C74] font-medium mt-0.5">
              Consult specialists & book visits
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('EMERGENCY_HELP')}
          className="bg-white hover:bg-[#FDFCFB] active:scale-[0.98] rounded-3xl p-4 border border-[#EDE4DE] shadow-xs flex flex-col justify-between text-left transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-[#EAEFEA] text-[#557A64] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-[#1E191D] leading-snug">
              Emergency
            </h4>
            <p className="text-[11px] text-[#7A6C74] font-medium mt-0.5">
              Crisis lines & direct doctor dial
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
