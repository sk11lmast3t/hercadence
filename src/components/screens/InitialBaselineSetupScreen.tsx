import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Scale, 
  Ruler, 
  Calendar, 
  Activity, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Moon, 
  HeartHandshake, 
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { UserBaselineHealth } from '../../types';
import { formatDateToISO, addDays } from '../../utils/cycleCalculations';

interface InitialBaselineSetupScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
  isStandalone?: boolean;
}

export const InitialBaselineSetupScreen: React.FC<InitialBaselineSetupScreenProps> = ({
  onBack,
  onComplete,
  isStandalone = false
}) => {
  const { settings, updateSettings, setCurrentView } = useCycle();

  // Current step: 1 (Vitals/Weight), 2 (Cycle History), 3 (Symptoms & Birth Control), 4 (Health Goals & Lifestyle)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Form states initialized with existing user settings
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(settings.weightUnit || 'kg');
  const [weight, setWeight] = useState<number>(
    settings.baselineHealth?.weight || (settings.weightUnit === 'lb' ? 130 : 59)
  );

  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft_in'>(
    settings.baselineHealth?.heightUnit || 'cm'
  );
  const [heightCm, setHeightCm] = useState<number>(settings.baselineHealth?.heightCm || 165);
  const [heightFeet, setHeightFeet] = useState<number>(settings.baselineHealth?.heightFeet || 5);
  const [heightInches, setHeightInches] = useState<number>(settings.baselineHealth?.heightInches || 5);

  const [age, setAge] = useState<number>(settings.baselineHealth?.age || 26);
  const [cycleLength, setCycleLength] = useState<number>(settings.cycleLengthDays || 28);
  const [periodLength, setPeriodLength] = useState<number>(settings.periodLengthDays || 5);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(
    settings.lastPeriodStartDate || formatDateToISO(addDays(new Date(), -12))
  );
  const [cycleRegularity, setCycleRegularity] = useState<
    'Regular' | 'Somewhat Regular' | 'Irregular' | 'Not Sure'
  >(settings.baselineHealth?.cycleRegularity || 'Regular');

  const [birthControlMethod, setBirthControlMethod] = useState<string>(
    settings.baselineHealth?.birthControlMethod || 'Natural / None'
  );

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    settings.baselineHealth?.typicalSymptoms || ['Cramps', 'Fatigue', 'Bloating']
  );

  const [sleepHours, setSleepHours] = useState<number>(
    settings.baselineHealth?.sleepHoursBaseline || 7.5
  );

  const [activityLevel, setActivityLevel] = useState<
    'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active'
  >(settings.baselineHealth?.activityLevel || 'Moderately Active');

  const [primaryGoals, setPrimaryGoals] = useState<string[]>(
    settings.baselineHealth?.primaryGoals || [
      'Track menstrual cycle',
      'Understand hormonal rhythm',
      'Manage PMS symptoms'
    ]
  );

  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Common symptoms list with categories
  const availableSymptoms = [
    { id: 'Cramps', label: 'Cramps & Pelvic Ache', category: 'Physical' },
    { id: 'Fatigue', label: 'Fatigue & Low Energy', category: 'Energy' },
    { id: 'Bloating', label: 'Bloating & Water Retention', category: 'Digestive' },
    { id: 'Breast tenderness', label: 'Breast Tenderness', category: 'Physical' },
    { id: 'Mood swings', label: 'Mood Swings & Sensitivity', category: 'Emotional' },
    { id: 'Headaches', label: 'Hormonal Headaches', category: 'Physical' },
    { id: 'Acne', label: 'Skin Breakouts / Acne', category: 'Skin' },
    { id: 'Lower backache', label: 'Lower Back Ache', category: 'Physical' },
    { id: 'Insomnia', label: 'Sleep Disruption', category: 'Sleep' },
    { id: 'Food cravings', label: 'Sweet / Salty Cravings', category: 'Nutrition' },
    { id: 'Anxiety', label: 'Pre-period Anxiety', category: 'Emotional' },
    { id: 'Brain fog', label: 'Brain Fog & Focus Lag', category: 'Cognitive' }
  ];

  const birthControlOptions = [
    'Natural / None',
    'Combined Oral Pill',
    'Progestin-Only Mini Pill',
    'Hormonal IUD (Mirena/Kyleena)',
    'Copper IUD (Non-hormonal)',
    'Implant (Nexplanon)',
    'Vaginal Ring (NuvaRing)',
    'Contraceptive Patch',
    'Other / Prefer not to say'
  ];

  const goalOptions = [
    { id: 'Track menstrual cycle', title: 'Cycle & Period Tracking', desc: 'Accurate period forecasts and flow logs' },
    { id: 'Predict fertile window', title: 'Ovulation & Fertility', desc: 'Pinpoint fertile window and peak days' },
    { id: 'Understand hormonal rhythm', title: 'Hormonal Phase Harmony', desc: 'Sync energy, nutrition, and work with 4 phases' },
    { id: 'Manage PMS symptoms', title: 'PMS & Symptom Relief', desc: 'Recognize triggers and soften discomfort' },
    { id: 'Fitness & workout alignment', title: 'Cycle-Synced Fitness', desc: 'Match high/low intensity workouts to hormones' },
    { id: 'Conception / TTC', title: 'Trying to Conceive', desc: 'Detailed basal body temperature & LH tracking' }
  ];

  const toggleSymptom = (symId: string) => {
    if (selectedSymptoms.includes(symId)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symId]);
    }
  };

  const toggleGoal = (goalId: string) => {
    if (primaryGoals.includes(goalId)) {
      if (primaryGoals.length > 1) {
        setPrimaryGoals(primaryGoals.filter((g) => g !== goalId));
      }
    } else {
      setPrimaryGoals([...primaryGoals, goalId]);
    }
  };

  // Convert weight unit smoothly
  const handleWeightUnitChange = (newUnit: 'kg' | 'lb') => {
    if (newUnit === weightUnit) return;
    if (newUnit === 'lb') {
      setWeight(Math.round(weight * 2.20462));
    } else {
      setWeight(Math.round(weight / 2.20462));
    }
    setWeightUnit(newUnit);
  };

  // Calculate approximate BMI for wellness reference
  const calculatedHeightMeters = heightUnit === 'cm' 
    ? heightCm / 100 
    : ((heightFeet * 12) + heightInches) * 0.0254;
  const calculatedWeightKg = weightUnit === 'kg' ? weight : weight / 2.20462;
  const approximateBmi = calculatedHeightMeters > 0 
    ? (calculatedWeightKg / (calculatedHeightMeters * calculatedHeightMeters)).toFixed(1) 
    : '21.5';

  const handleSaveAndComplete = () => {
    const baselineData: UserBaselineHealth = {
      weight,
      weightUnit,
      heightCm: heightUnit === 'cm' ? heightCm : Math.round(((heightFeet * 12) + heightInches) * 2.54),
      heightFeet,
      heightInches,
      heightUnit,
      age,
      cycleRegularity,
      primaryGoals,
      typicalSymptoms: selectedSymptoms,
      sleepHoursBaseline: sleepHours,
      activityLevel,
      birthControlMethod,
      completedAt: new Date().toISOString()
    };

    const pendingOnboardingData = {
      userName: settings.userName || '',
      email: settings.email || '',
      cycleLengthDays: cycleLength,
      periodLengthDays: periodLength,
      lutealPhaseDays: 14,
      lastPeriodStartDate: lastPeriodDate,
      weightUnit,
      baselineHealth: baselineData,
    };

    try {
      localStorage.setItem('pendingOnboardingData', JSON.stringify(pendingOnboardingData));
    } catch (e) {
      console.error('Failed to store pendingOnboardingData:', e);
    }

    updateSettings({
      weightUnit,
      cycleLengthDays: cycleLength,
      periodLengthDays: periodLength,
      lastPeriodStartDate: lastPeriodDate,
      hasCompletedBaseline: true,
      baselineHealth: baselineData
    });

    setIsSavedSuccess(true);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        setCurrentView('LOGIN_GATEWAY');
      }
    }, 1000);
  };


  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#20171D] pb-24 font-sans selection:bg-[#EBD7D9]">
      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-[#EDE5DF]/60">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {onBack ? (
            <button
              onClick={onBack}
              id="baseline_back_btn"
              className="w-9 h-9 rounded-full bg-white border border-[#EDE5DF] flex items-center justify-center text-[#543649] hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wider text-[#8A576E] uppercase">
              <Sparkles size={14} />
              <span>Initial Setup</span>
            </div>
          )}

          <div className="text-center">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#8A576E]">
              Step {currentStep} of {totalSteps}
            </span>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === currentStep 
                      ? 'w-6 bg-[#543649]' 
                      : step < currentStep 
                        ? 'w-2 bg-[#8A576E]' 
                        : 'w-2 bg-[#E4D8D0]'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onComplete) onComplete();
              else setCurrentView('HOME');
            }}
            className="text-[12.5px] font-medium text-[#7D6B75] hover:text-[#543649] transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-lg mx-auto px-5 pt-5 space-y-6">
        {/* Step 1: Body Metrics & Vitals (Weight, Height, Age) */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Introductory Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBD7D9]/60 text-[#543649] text-[12px] font-semibold mb-2">
                <Scale size={13} />
                <span>Body Baseline &amp; Vitals</span>
              </div>
              <h2 className="font-serif text-[28px] font-bold text-[#3B2533] leading-tight">
                Let’s calibrate your body metrics
              </h2>
              <p className="text-[13.5px] text-[#6A5A64] mt-1.5 leading-relaxed">
                Hormonal fluctuations affect water retention and metabolism across your 4 cycle phases. These baseline vitals personalize your predictions.
              </p>
            </div>

            {/* Weight Input Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FAF4EF] text-[#8A576E] flex items-center justify-center">
                    <Scale size={16} />
                  </div>
                  <div>
                    <label className="text-[14px] font-bold text-[#3B2533] block">
                      Current Body Weight
                    </label>
                    <span className="text-[11.5px] text-[#7E6E77]">Track natural phase fluctuations</span>
                  </div>
                </div>

                {/* Unit Switcher */}
                <div className="bg-[#F5EDE8] p-1 rounded-xl flex items-center text-[12px] font-semibold">
                  <button
                    type="button"
                    onClick={() => handleWeightUnitChange('kg')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      weightUnit === 'kg' 
                        ? 'bg-white text-[#543649] shadow-xs' 
                        : 'text-[#84727D] hover:text-[#543649]'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWeightUnitChange('lb')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      weightUnit === 'lb' 
                        ? 'bg-white text-[#543649] shadow-xs' 
                        : 'text-[#84727D] hover:text-[#543649]'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>

              {/* Number Value Display & Quick Stepper */}
              <div className="flex items-center justify-between bg-[#FCFAF8] p-4 rounded-2xl border border-[#F0E8E2]">
                <button
                  type="button"
                  onClick={() => setWeight((prev) => Math.max(prev - 1, weightUnit === 'kg' ? 30 : 65))}
                  className="w-11 h-11 rounded-2xl bg-white border border-[#E8DED6] text-[#543649] font-bold text-lg flex items-center justify-center shadow-2xs hover:bg-[#F8F3F0] active:scale-95 transition-all cursor-pointer"
                >
                  -
                </button>

                <div className="text-center">
                  <div className="font-serif text-[38px] font-bold text-[#3B2533] tracking-tight flex items-baseline justify-center gap-1">
                    <span>{weight}</span>
                    <span className="text-base font-normal text-[#8A576E]">{weightUnit}</span>
                  </div>
                  <span className="text-[11.5px] text-[#84727D] font-medium">
                    {weightUnit === 'kg' ? `~${Math.round(weight * 2.20462)} lbs` : `~${Math.round(weight / 2.20462)} kg`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setWeight((prev) => Math.min(prev + 1, weightUnit === 'kg' ? 180 : 400))}
                  className="w-11 h-11 rounded-2xl bg-white border border-[#E8DED6] text-[#543649] font-bold text-lg flex items-center justify-center shadow-2xs hover:bg-[#F8F3F0] active:scale-95 transition-all cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Slider for smooth dragging */}
              <div>
                <input
                  type="range"
                  min={weightUnit === 'kg' ? 35 : 75}
                  max={weightUnit === 'kg' ? 140 : 310}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-[#543649] cursor-pointer h-2 bg-[#EFE7E1] rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-[#8E7E87] mt-1 font-medium">
                  <span>{weightUnit === 'kg' ? '35 kg' : '75 lbs'}</span>
                  <span>Healthy Range Baseline</span>
                  <span>{weightUnit === 'kg' ? '140 kg' : '310 lbs'}</span>
                </div>
              </div>
            </div>

            {/* Height Input Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FAF4EF] text-[#8A576E] flex items-center justify-center">
                    <Ruler size={16} />
                  </div>
                  <div>
                    <label className="text-[14px] font-bold text-[#3B2533] block">
                      Height
                    </label>
                    <span className="text-[11.5px] text-[#7E6E77]">Used for metabolic insights</span>
                  </div>
                </div>

                {/* Unit Switcher */}
                <div className="bg-[#F5EDE8] p-1 rounded-xl flex items-center text-[12px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setHeightUnit('cm')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      heightUnit === 'cm' 
                        ? 'bg-white text-[#543649] shadow-xs' 
                        : 'text-[#84727D] hover:text-[#543649]'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit('ft_in')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      heightUnit === 'ft_in' 
                        ? 'bg-white text-[#543649] shadow-xs' 
                        : 'text-[#84727D] hover:text-[#543649]'
                    }`}
                  >
                    ft/in
                  </button>
                </div>
              </div>

              {heightUnit === 'cm' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#FCFAF8] p-4 rounded-2xl border border-[#F0E8E2]">
                    <button
                      type="button"
                      onClick={() => setHeightCm((prev) => Math.max(prev - 1, 120))}
                      className="w-10 h-10 rounded-xl bg-white border border-[#E8DED6] text-[#543649] font-bold flex items-center justify-center shadow-2xs hover:bg-[#F8F3F0] cursor-pointer"
                    >
                      -
                    </button>
                    <div className="text-center font-serif text-[32px] font-bold text-[#3B2533]">
                      {heightCm} <span className="text-base font-normal text-[#8A576E]">cm</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHeightCm((prev) => Math.min(prev + 1, 220))}
                      className="w-10 h-10 rounded-xl bg-white border border-[#E8DED6] text-[#543649] font-bold flex items-center justify-center shadow-2xs hover:bg-[#F8F3F0] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="range"
                    min="130"
                    max="210"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-[#543649] cursor-pointer h-2 bg-[#EFE7E1] rounded-lg"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FCFAF8] p-3 rounded-2xl border border-[#F0E8E2] text-center">
                    <span className="text-[11px] font-medium text-[#7E6E77] block mb-1">Feet</span>
                    <select
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      className="w-full bg-white border border-[#E4D8D0] rounded-xl py-2 px-3 text-center font-bold text-[#3B2533] text-lg cursor-pointer"
                    >
                      {[4, 5, 6, 7].map((f) => (
                        <option key={f} value={f}>{f} ft</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-[#FCFAF8] p-3 rounded-2xl border border-[#F0E8E2] text-center">
                    <span className="text-[11px] font-medium text-[#7E6E77] block mb-1">Inches</span>
                    <select
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      className="w-full bg-white border border-[#E4D8D0] rounded-xl py-2 px-3 text-center font-bold text-[#3B2533] text-lg cursor-pointer"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i}>{i} in</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Age & Date of Birth */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[14px] font-bold text-[#3B2533] block">
                    Age
                  </label>
                  <span className="text-[11.5px] text-[#7E6E77]">Hormonal stages transition with age</span>
                </div>
                <div className="font-serif text-[24px] font-bold text-[#3B2533]">
                  {age} <span className="text-sm font-normal text-[#8A576E]">years</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAge((prev) => Math.max(prev - 1, 13))}
                  className="w-10 h-10 rounded-xl bg-[#FAF4EF] text-[#543649] font-bold flex items-center justify-center cursor-pointer hover:bg-[#F3ECE6]"
                >
                  -
                </button>
                <input
                  type="range"
                  min="14"
                  max="60"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="flex-1 accent-[#543649] cursor-pointer h-2 bg-[#EFE7E1] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setAge((prev) => Math.min(prev + 1, 60))}
                  className="w-10 h-10 rounded-xl bg-[#FAF4EF] text-[#543649] font-bold flex items-center justify-center cursor-pointer hover:bg-[#F3ECE6]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Summary Preview Chip */}
            <div className="bg-[#EBD7D9]/30 rounded-2xl p-3.5 border border-[#E0CAD1] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#543649] text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} />
              </div>
              <p className="text-[12px] text-[#543649] leading-snug">
                Your data stays strictly private and secure on your local mobile device storage.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Cycle & Period History */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBD7D9]/60 text-[#543649] text-[12px] font-semibold mb-2">
                <Calendar size={13} />
                <span>Menstrual Cycle History</span>
              </div>
              <h2 className="font-serif text-[28px] font-bold text-[#3B2533] leading-tight">
                Tell us about your typical cycle
              </h2>
              <p className="text-[13.5px] text-[#6A5A64] mt-1.5 leading-relaxed">
                Everyone's cycle is uniquely individual. An average cycle is between 24 and 35 days.
              </p>
            </div>

            {/* Cycle Length Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[14px] font-bold text-[#3B2533] block">
                    Average Cycle Length
                  </label>
                  <span className="text-[11.5px] text-[#7E6E77]">From day 1 of period to the day before next period</span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-[28px] font-bold text-[#543649]">{cycleLength}</span>
                  <span className="text-sm text-[#8A576E] ml-1 font-semibold">Days</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCycleLength((prev) => Math.max(prev - 1, 20))}
                  className="w-10 h-10 rounded-xl bg-[#FAF4EF] text-[#543649] font-bold flex items-center justify-center hover:bg-[#F3ECE6] cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="flex-1 accent-[#543649] cursor-pointer h-2 bg-[#EFE7E1] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setCycleLength((prev) => Math.min(prev + 1, 45))}
                  className="w-10 h-10 rounded-xl bg-[#FAF4EF] text-[#543649] font-bold flex items-center justify-center hover:bg-[#F3ECE6] cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="flex justify-between text-[11px] text-[#8E7E87]">
                <span>21 Days</span>
                <span className="font-medium text-[#543649]">Standard (28 Days)</span>
                <span>45 Days</span>
              </div>
            </div>

            {/* Period Bleeding Duration */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[14px] font-bold text-[#3B2533] block">
                    Period Bleeding Duration
                  </label>
                  <span className="text-[11.5px] text-[#7E6E77]">Number of days of bleeding / flow</span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-[28px] font-bold text-[#964E68]">{periodLength}</span>
                  <span className="text-sm text-[#964E68] ml-1 font-semibold">Days</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPeriodLength((prev) => Math.max(prev - 1, 2))}
                  className="w-10 h-10 rounded-xl bg-[#FAF4EF] text-[#543649] font-bold flex items-center justify-center hover:bg-[#F3ECE6] cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(Number(e.target.value))}
                  className="flex-1 accent-[#964E68] cursor-pointer h-2 bg-[#EFE7E1] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setPeriodLength((prev) => Math.min(prev + 1, 10))}
                  className="w-10 h-10 rounded-xl bg-[#FAF4EF] text-[#543649] font-bold flex items-center justify-center hover:bg-[#F3ECE6] cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="flex justify-between text-[11px] text-[#8E7E87]">
                <span>2 Days (Light)</span>
                <span className="font-medium text-[#964E68]">Typical (5 Days)</span>
                <span>10 Days</span>
              </div>
            </div>

            {/* Last Period Start Date */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <label className="text-[14px] font-bold text-[#3B2533] block">
                When did your last period start?
              </label>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="w-full bg-[#FAF4EF] border border-[#E5DCD4] rounded-2xl py-3 px-4 text-[#3B2533] font-semibold text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8A576E]/30 cursor-pointer"
              />
            </div>

            {/* Regularity Selection */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <label className="text-[14px] font-bold text-[#3B2533] block">
                How regular are your cycles?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'Regular', label: 'Very Regular', desc: 'Predictable (±1-2 days)' },
                  { key: 'Somewhat Regular', label: 'Somewhat Regular', desc: 'Varies by 3-5 days' },
                  { key: 'Irregular', label: 'Irregular', desc: 'Cycles vary widely' },
                  { key: 'Not Sure', label: 'Not Sure', desc: 'Tracking for first time' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setCycleRegularity(opt.key as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      cycleRegularity === opt.key
                        ? 'bg-[#543649] text-white border-[#543649] shadow-sm'
                        : 'bg-[#FAF7F4] text-[#3B2533] border-[#EDE4DC] hover:border-[#D5C2CC]'
                    }`}
                  >
                    <p className={`text-[13px] font-bold ${cycleRegularity === opt.key ? 'text-white' : 'text-[#3B2533]'}`}>
                      {opt.label}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${cycleRegularity === opt.key ? 'text-stone-300' : 'text-[#7A6C74]'}`}>
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Hormones, Contraception & Frequent Symptoms */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBD7D9]/60 text-[#543649] text-[12px] font-semibold mb-2">
                <Activity size={13} />
                <span>Symptoms &amp; Contraception</span>
              </div>
              <h2 className="font-serif text-[28px] font-bold text-[#3B2533] leading-tight">
                Your hormonal health backdrop
              </h2>
              <p className="text-[13.5px] text-[#6A5A64] mt-1.5 leading-relaxed">
                Select any recurring symptoms so the app can detect patterns and alert you before PMS peaks.
              </p>
            </div>

            {/* Birth Control Method */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <label className="text-[14px] font-bold text-[#3B2533] block">
                Contraception or Birth Control Method
              </label>
              <select
                value={birthControlMethod}
                onChange={(e) => setBirthControlMethod(e.target.value)}
                className="w-full bg-[#FAF4EF] border border-[#E5DCD4] rounded-2xl py-3 px-4 text-[#3B2533] font-semibold text-[14px] cursor-pointer focus:outline-none"
              >
                {birthControlOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <p className="text-[11.5px] text-[#84727D] leading-relaxed">
                Hormonal birth control modifies natural LH surges and temperature baselines. The app adjusts ovulation cues accordingly.
              </p>
            </div>

            {/* Typical Symptoms Checkbox Grid */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-bold text-[#3B2533]">
                  Common Symptoms You Experience
                </label>
                <span className="text-[11.5px] text-[#8A576E] font-semibold">
                  {selectedSymptoms.length} selected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {availableSymptoms.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym.id);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => toggleSymptom(sym.id)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2E5E8] border-[#8A576E] text-[#543649] font-semibold'
                          : 'bg-[#FCFAF8] border-[#EDE5DF] text-[#6A5A64] hover:border-[#DEC5D0]'
                      }`}
                    >
                      <span className="text-[12px] truncate">{sym.label}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#543649] text-white flex items-center justify-center flex-shrink-0 ml-1">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sleep & Lifestyle */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[14px] font-bold text-[#3B2533] block">
                    Average Nightly Sleep
                  </label>
                  <span className="text-[11.5px] text-[#7E6E77]">Luteal phase often elevates core temp</span>
                </div>
                <div className="font-serif text-[24px] font-bold text-[#543649]">
                  {sleepHours} <span className="text-sm font-normal text-[#8A576E]">hrs</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSleepHours((prev) => Math.max(prev - 0.5, 4))}
                  className="w-10 h-10 rounded-xl bg-[#FAF4EF] text-[#543649] font-bold flex items-center justify-center hover:bg-[#F3ECE6] cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="flex-1 accent-[#543649] cursor-pointer h-2 bg-[#EFE7E1] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSleepHours((prev) => Math.min(prev + 0.5, 12))}
                  className="w-10 h-10 rounded-xl bg-[#FAF4EF] text-[#543649] font-bold flex items-center justify-center hover:bg-[#F3ECE6] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Primary Goals & Summary */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBD7D9]/60 text-[#543649] text-[12px] font-semibold mb-2">
                <Sparkles size={13} />
                <span>Personal Goals</span>
              </div>
              <h2 className="font-serif text-[28px] font-bold text-[#3B2533] leading-tight">
                What are your main focus areas?
              </h2>
              <p className="text-[13.5px] text-[#6A5A64] mt-1.5 leading-relaxed">
                Choose all that apply. Your home screen dashboard, daily tips, and notifications will be tailored to these goals.
              </p>
            </div>

            {/* Goal Options List */}
            <div className="space-y-3">
              {goalOptions.map((goal) => {
                const isSelected = primaryGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#543649] text-white border-[#543649] shadow-sm'
                        : 'bg-white text-[#3B2533] border-[#EDE4DC] hover:border-[#D5C2CC]'
                    }`}
                  >
                    <div>
                      <h4 className={`text-[14px] font-bold ${isSelected ? 'text-white' : 'text-[#3B2533]'}`}>
                        {goal.title}
                      </h4>
                      <p className={`text-[12px] mt-0.5 ${isSelected ? 'text-stone-300' : 'text-[#7A6C74]'}`}>
                        {goal.desc}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-white text-[#543649]' : 'border border-[#D4C6CE]'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Final Overview Card */}
            <div className="bg-[#FAF4EF] rounded-3xl p-5 border border-[#E8DDD4] space-y-3">
              <h4 className="text-[13px] font-bold text-[#543649] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={16} />
                <span>Your Personalized Profile Summary</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[12.5px] text-[#3B2533] pt-1">
                <div className="bg-white p-3 rounded-xl border border-[#EDE5DF]">
                  <span className="text-[#84727D] block text-[11px]">Weight</span>
                  <span className="font-bold text-[#543649]">{weight} {weightUnit}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#EDE5DF]">
                  <span className="text-[#84727D] block text-[11px]">Cycle Length</span>
                  <span className="font-bold text-[#543649]">{cycleLength} Days</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#EDE5DF]">
                  <span className="text-[#84727D] block text-[11px]">Period Duration</span>
                  <span className="font-bold text-[#543649]">{periodLength} Days</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#EDE5DF]">
                  <span className="text-[#84727D] block text-[11px]">Cycle Regularity</span>
                  <span className="font-bold text-[#543649]">{cycleRegularity}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation & Action Footer Buttons */}
        <div className="pt-2 space-y-3">
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, totalSteps))}
              className="w-full py-4 px-6 rounded-2xl bg-[#543649] hover:bg-[#432A3B] text-white font-bold text-[15px] shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAndComplete}
              disabled={isSavedSuccess}
              className="w-full py-4 px-6 rounded-2xl bg-[#543649] hover:bg-[#432A3B] text-white font-bold text-[15px] shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-80"
            >
              {isSavedSuccess ? (
                <>
                  <Check size={18} strokeWidth={3} />
                  <span>Profile Calibrated &amp; Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Save &amp; Generate My Cycle Rhythm</span>
                </>
              )}
            </button>
          )}

          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              className="w-full py-3 px-6 rounded-2xl bg-transparent text-[#6A5A64] hover:text-[#543649] font-medium text-[13.5px] transition-colors cursor-pointer"
            >
              Previous Step
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
