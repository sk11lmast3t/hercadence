import React from 'react';
import { 
  ChevronRight, 
  Clock,
  Sparkles,
  BookOpen,
  Video,
  HeartPulse,
  MessageSquare,
  Dumbbell,
  Search,
  Moon,
  Scale
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../../types';
import { getFeatureById } from '../../registry/featureRegistry';

const sleepFeature = getFeatureById('wellness.sleep');
import { MobileStatusBar } from '../common/MobileStatusBar';
import { useHealthInsights } from '../../hooks/useHealthInsights';

interface ModernizedInsightsScreenProps {
  onNavigate: (view: AppView) => void;
}

export const ModernizedInsightsScreen: React.FC<ModernizedInsightsScreenProps> = ({
  onNavigate
}) => {
  const { averageCycleLength, averagePeriodLength, totalLogsCount, topSymptoms, flowDays } = useHealthInsights();
  // Wellness score: simple composite — more logs = better score, capped at 100
  const wellnessScore = Math.min(100, Math.round((totalLogsCount / 90) * 100));
  const topSymptom = topSymptoms[0]?.name ?? 'No data yet';

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
        <header className="px-6 pt-3 pb-3">
          <h1 className="font-serif text-[32px] sm:text-[34px] font-bold text-[#4B3041] tracking-tight">
            Insights
          </h1>
        </header>

        {/* Main Content Area */}
        <main className="px-5 space-y-3.5 sm:space-y-4">
          {/* Card 1: Symptom Trends Frosted Glass Card with Fluid Wave Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[30px] sm:rounded-[34px] bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_12px_36px_rgba(0,0,0,0.04)] p-6 flex flex-col"
          >
            {/* Header with Chevron */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[22px] sm:text-[23px] font-bold text-[#1E191D] tracking-tight">
                Symptom Trends
              </h2>
              <ChevronRight size={20} strokeWidth={1.8} className="text-[#4A4247]" />
            </div>

            {/* Overlapping Fluid Organic Waves matching Image 2 */}
            <div className="relative w-full h-44 my-1 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 340 160" preserveAspectRatio="none">
                <defs>
                  {/* Sage Green Wave Fill */}
                  <linearGradient id="sageWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#87A997" stopOpacity="0.32" />
                    <stop offset="65%" stopColor="#87A997" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Dusty Rose Wave Fill */}
                  <linearGradient id="roseWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#BA8390" stopOpacity="0.30" />
                    <stop offset="70%" stopColor="#BA8390" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area for Dusty Rose Wave */}
                <path
                  d="M 0 145 C 30 140, 50 120, 85 125 C 130 130, 160 85, 205 90 C 245 95, 275 120, 340 100 L 340 160 L 0 160 Z"
                  fill="url(#roseWaveGradient)"
                />

                {/* Shaded Area for Sage Green Wave */}
                <path
                  d="M 0 140 C 35 120, 60 105, 95 118 C 120 128, 140 38, 165 42 C 190 46, 210 120, 245 105 C 275 92, 310 102, 340 115 L 340 160 L 0 160 Z"
                  fill="url(#sageWaveGradient)"
                />

                {/* Dusty Rose Stroke Line */}
                <path
                  d="M 0 145 C 30 140, 50 120, 85 125 C 130 130, 160 85, 205 90 C 245 95, 275 120, 340 100"
                  fill="none"
                  stroke="#BA8390"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                {/* Sage Green Stroke Line */}
                <path
                  d="M 0 140 C 35 120, 60 105, 95 118 C 120 128, 140 38, 165 42 C 190 46, 210 120, 245 105 C 275 92, 310 102, 340 115"
                  fill="none"
                  stroke="#87A997"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>

          {/* Card 2: Cycle Consistency */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-[26px] bg-white p-5 sm:p-6 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Header with Chevron */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-[20px] font-bold text-[#1E191D] tracking-tight">
                Cycle Consistency
              </h3>
              <ChevronRight size={20} strokeWidth={1.8} className="text-[#4A4247]" />
            </div>

            {/* Bottom Row: Gauge on Left, Metrics on Right */}
            <div className="flex items-center gap-6 pt-1">
              {/* Dual-Tone Circular Ring Gauge with Clock inside */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Base Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#EFE8E2"
                    strokeWidth="9"
                    fill="none"
                  />

                  {/* Sage Green Arc (Upper right) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#95B1A2"
                    strokeWidth="9"
                    strokeDasharray="125.66 251.32"
                    strokeDashoffset="0"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Dusty Rose Arc (Lower left) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#C89B9E"
                    strokeWidth="9"
                    strokeDasharray="125.66 251.32"
                    strokeDashoffset="125.66"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Centered Clock Icon */}
                <div className="absolute inset-0 flex items-center justify-center text-[#4A4247]">
                  <Clock size={20} strokeWidth={1.8} />
                </div>
              </div>

              {/* Text Metrics */}
              <div>
                <div className="font-serif text-[28px] sm:text-[30px] font-bold text-[#1E191D] leading-none">
                  {averageCycleLength} days
                </div>
                <div className="text-[13.5px] font-medium text-[#4A4247] mt-1.5">
                  Avg cycle length
                </div>
                <div className="text-[13.5px] font-medium text-[#4A4247] mt-0.5">
                  Period avg: {averagePeriodLength}d · {flowDays} flow days logged
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Wellness Score */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-[26px] bg-white p-5 sm:p-6 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Header with Chevron */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-[20px] font-bold text-[#1E191D] tracking-tight">
                Wellness Score
              </h3>
              <ChevronRight size={20} strokeWidth={1.8} className="text-[#4A4247]" />
            </div>

            {/* Bottom Row: Number on Left, Mini Sparkline on Right */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="font-serif text-[30px] sm:text-[32px] font-bold text-[#4B3041] leading-none">
                  {wellnessScore}%
                </div>
                <div className="text-[13px] font-medium text-[#4A4247] mt-1.5">
                  {totalLogsCount} logs · top symptom: {topSymptom}
                </div>
              </div>

              {/* Sage Green Wave Sparkline on Right */}
              <div className="w-36 sm:w-40 h-14 relative flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 160 55" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="scoreSparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#87A997" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Sparkline Fill */}
                  <path
                    d="M 5 45 Q 25 42, 45 40 T 80 20 T 115 34 T 155 22 L 155 55 L 5 55 Z"
                    fill="url(#scoreSparkGradient)"
                  />

                  {/* Sparkline Stroke */}
                  <path
                    d="M 5 45 Q 25 42, 45 40 T 80 20 T 115 34 T 155 22"
                    fill="none"
                    stroke="#87A997"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />

                  {/* Highlight Circle Dot on the highest crest */}
                  <circle
                    cx="80"
                    cy="20"
                    r="4.5"
                    fill="#87A997"
                    className="drop-shadow-xs"
                  />
                  <circle
                    cx="80"
                    cy="20"
                    r="2"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Deeper Insights & Clinical Portals */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[13px] font-bold text-[#1E191D] tracking-tight">
                Health Research &amp; Clinical Portals
              </span>
            </div>

            <div className="space-y-2">
              {/* Personalized Cycle Insights */}
              <div
                onClick={() => onNavigate('PERSONALIZED_INSIGHTS')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#EBF0EE] text-[#426450] flex items-center justify-center shrink-0">
                    <Sparkles size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Personalized Cycle Insights
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      Luteal fatigue patterns &amp; migraine correlations
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Nutrition for Cycle Guide */}
              <div
                onClick={() => onNavigate('NUTRITION_CYCLE')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#E5ECE0] text-[#3D5236] flex items-center justify-center shrink-0">
                    <BookOpen size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Nutrition for Cycle
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      Hormone-balancing smoothies, phase diets &amp; stews
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Sleep Insights & Quality */}
              <div
                onClick={() => onNavigate(sleepFeature.route)}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#EAE8F5] text-[#3F3675] flex items-center justify-center shrink-0">
                    <Moon size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Sleep Insights &amp; Quality
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      85% good sleep score, deep/REM metrics &amp; schedule
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Body Metrics & Weight Tracker */}
              <div
                onClick={() => onNavigate('BODY_METRICS')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#EAF0F8] text-[#3D5A80] flex items-center justify-center shrink-0">
                    <Scale size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Body Metrics &amp; Weight Tracker
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      135.2 lbs, 30-day luteal fluid trend curve &amp; logging
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Physical Activity Tracker */}
              <div
                onClick={() => onNavigate('PHYSICAL_ACTIVITY')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FCECE8] text-[#B05B64] flex items-center justify-center shrink-0">
                    <Dumbbell size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Physical Activity &amp; Workouts
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      7,500 steps, calorie burn &amp; weekly activity chart
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Search Hub */}
              <div
                onClick={() => onNavigate('SEARCH_HUB')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FBF0DD] text-[#A68032] flex items-center justify-center shrink-0">
                    <Search size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Search Articles &amp; Videos
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      Explore cycle-syncing, yoga flows &amp; community
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Luteal Phase Nutrition Article */}
              <div
                onClick={() => onNavigate('LUTEAL_ARTICLE')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FCECEE] text-[#8C525E] flex items-center justify-center shrink-0">
                    <BookOpen size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Luteal Phase Nutrition Guide
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      Magnesium rich recipes &amp; cycle syncing nutrition
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Discovery Video Library */}
              <div
                onClick={() => onNavigate('VIDEO_LIBRARY')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#EDE8F2] text-[#543649] flex items-center justify-center shrink-0">
                    <Video size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Movement &amp; Meditation Videos
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      Pelvic floor releases &amp; calming breathwork
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Doctor Care Team */}
              <div
                onClick={() => onNavigate('DOCTORS_CARE_TEAM')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#DFEDE4] text-[#47735B] flex items-center justify-center shrink-0">
                    <HeartPulse size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Doctors &amp; Clinical Care Team
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      OB/GYN appointments &amp; pre-visit report share
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>

              {/* Community Discussions */}
              <div
                onClick={() => onNavigate('COMMUNITY')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F5EDDD] text-[#8B6B38] flex items-center justify-center shrink-0">
                    <MessageSquare size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1E191D] truncate">
                      Community Discussions &amp; Support
                    </div>
                    <div className="text-[11px] text-[#7A6C74] truncate">
                      Connect with others in similar cycle phases
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#968A91] shrink-0" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
