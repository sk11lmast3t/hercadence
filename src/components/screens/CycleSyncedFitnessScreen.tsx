import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Crown, 
  Sparkles, 
  Dumbbell, 
  Flame, 
  Heart, 
  Apple, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Zap,
  Activity,
  Calendar,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';
import { MobileStatusBar } from '../common/MobileStatusBar';

interface CycleSyncedFitnessScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const CycleSyncedFitnessScreen: React.FC<CycleSyncedFitnessScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { currentCycle, settings } = useCycle();
  const phaseName = currentCycle?.phaseDisplayName || 'Luteal Phase';
  const cycleDay = currentCycle?.currentDayOfCycle || 19;

  const [activeTab, setActiveTab] = useState<'workouts' | 'nutrition'>('workouts');

  const phaseFitnessData = {
    Menstrual: {
      tagline: 'Restoration & Gentle Mobility',
      energy: 'Low / Inward',
      focus: 'Pelvic release, restorative yoga & gentle walks',
      intensity: '20-40%',
      workouts: [
        { name: 'Yin Yoga for Pelvic Floor Relief', duration: '20 min', intensity: 'Gentle', calories: '65 kcal' },
        { name: 'Gentle Sunlight Walking & Breathwork', duration: '30 min', intensity: 'Low', calories: '110 kcal' },
        { name: 'Lower Back & Hip Opener Sequence', duration: '15 min', intensity: 'Gentle', calories: '50 kcal' }
      ],
      meals: [
        { meal: 'Breakfast', title: 'Warm Oatmeal with Blackstrap Molasses & Pumpkin Seeds', benefit: 'Iron & zinc repletion' },
        { meal: 'Lunch', title: 'Ginger-Turmeric Lentil Stew with Dark Leafy Greens', benefit: 'Anti-inflammatory warmth' },
        { meal: 'Dinner', title: 'Grass-Fed Beef or Tofu Bowl with Roasted Beets', benefit: 'Heme-iron restoration' }
      ]
    },
    Follicular: {
      tagline: 'Rising Energy & High Neuroplasticity',
      energy: 'High / Ascending',
      focus: 'Strength training, skill acquisition, light cardio',
      intensity: '60-80%',
      workouts: [
        { name: 'Progressive Resistance: Squat & Upper Body Pull', duration: '40 min', intensity: 'Moderate-High', calories: '240 kcal' },
        { name: 'Dynamic Vinyasa Flow with Inversions', duration: '35 min', intensity: 'Moderate', calories: '180 kcal' },
        { name: 'Tempo Interval Run (Zone 3/4)', duration: '25 min', intensity: 'High', calories: '260 kcal' }
      ],
      meals: [
        { meal: 'Breakfast', title: 'Matcha Protein Smoothie with Avocado & Flaxseeds', benefit: 'Estrogen balance & brain power' },
        { meal: 'Lunch', title: 'Quinoa Bowl with Sprouted Beans & Tahini Citrus Dressing', benefit: 'Clean complex carbohydrates' },
        { meal: 'Dinner', title: 'Pan-Seared Salmon with Steamed Broccoli & Sweet Potato', benefit: 'Omega-3s for cellular growth' }
      ]
    },
    Ovulatory: {
      tagline: 'Peak Stamina & Explosive Strength',
      energy: 'Peak / Maximal',
      focus: 'HIIT, heavy lifts, sprint intervals',
      intensity: '85-100%',
      workouts: [
        { name: 'HIIT Tabata Sprint Intervals', duration: '25 min', intensity: 'Peak', calories: '310 kcal' },
        { name: 'Max Effort Compound Lifts (Deadlifts/Press)', duration: '45 min', intensity: 'High', calories: '320 kcal' },
        { name: 'High-Energy Dance Cardio or Spin', duration: '45 min', intensity: 'High', calories: '350 kcal' }
      ],
      meals: [
        { meal: 'Breakfast', title: 'Spinach & Berry Anti-Aromatase Smoothie with Chia', benefit: 'Fiber to metabolize peak estrogen' },
        { meal: 'Lunch', title: 'Rainbow Crunch Salad with Grilled Chicken & Hemp Hearts', benefit: 'Glutathione precursors' },
        { meal: 'Dinner', title: 'Sesame Crusted Tuna with Cauliflower Rice & Asparagus', benefit: 'Light liver detoxification support' }
      ]
    },
    Luteal: {
      tagline: 'Strength Hypertrophy & Calming Cortisol',
      energy: 'Steady / Grounding',
      focus: 'Slow resistance training, Pilates, Zone 2 endurance',
      intensity: '50-70%',
      workouts: [
        { name: 'Reformer Pilates: Core & Glute Activation', duration: '35 min', intensity: 'Moderate', calories: '190 kcal' },
        { name: 'Slow Controlled Hypertrophy (Dumbbell Complex)', duration: '40 min', intensity: 'Moderate', calories: '220 kcal' },
        { name: 'Zone 2 Incline Walking with Weighted Vest', duration: '30 min', intensity: 'Low-Impact', calories: '210 kcal' }
      ],
      meals: [
        { meal: 'Breakfast', title: 'Warm Scrambled Eggs with Avocado, Spinach & Sea Salt', benefit: 'Choline & steady glucose' },
        { meal: 'Lunch', title: 'Warm Roasted Sweet Potato & Wild Salmon Salad Bowl', benefit: 'Serotonin precursors & Vitamin B6' },
        { meal: 'Dinner', title: 'Turkey & Herb Meatballs with Zucchini Noodles & Tomato Ragu', benefit: 'Tryptophan & magnesium for sleep' }
      ]
    }
  };

  const currentPhaseKey = (phaseName.includes('Menstrual') ? 'Menstrual' :
    phaseName.includes('Follicular') ? 'Follicular' :
    phaseName.includes('Ovulat') ? 'Ovulatory' : 'Luteal') as keyof typeof phaseFitnessData;

  const currentPlan = phaseFitnessData[currentPhaseKey] || phaseFitnessData.Luteal;

  const handleActionClick = () => {
    if (!settings.isPremium) {
      if (onNavigate) onNavigate('TRIAL_PAYWALL');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans selection:bg-[#DE9E8E]/30 overflow-x-hidden">
      {/* Mobile Screen Shell Frame */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* iOS Native Status Bar */}
        <MobileStatusBar />

        {/* Header Banner */}
        <div className="w-full bg-gradient-to-br from-[#3E2134] via-[#543649] to-[#6E425F] text-white px-5 pt-2 pb-7 relative overflow-hidden rounded-b-[28px] shadow-sm">
          <div className="absolute top-0 right-0 w-60 h-60 bg-[radial-gradient(circle_at_top_right,rgba(240,195,183,0.3),transparent_70%)] pointer-events-none" />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Back"
            >
              <ChevronLeft size={22} strokeWidth={2.2} />
            </button>

            <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FAD178]/20 text-[#FAD178] border border-[#FAD178]/30">
              <Crown size={12} className="text-[#FAD178]" />
              <span>Phase Conditioning</span>
            </div>
          </div>

        <div className="space-y-1.5 relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8D4DE] block">
            Cycle-Synced Conditioning
          </span>
          <h1 className="text-[26px] sm:text-[30px] font-serif font-normal text-white tracking-tight leading-tight">
            {phaseName} Protocol
          </h1>
          <p className="text-[13px] text-[#F3E5ED] leading-relaxed max-w-sm">
            {currentPlan.tagline}. Work with your biology, not against your hormones.
          </p>
        </div>

        {/* Phase Biomarker Quick Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 relative z-10 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
            <span className="text-[10px] text-white/70 block uppercase font-bold">Cycle Day</span>
            <span className="text-[14px] font-extrabold text-white">Day {cycleDay}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
            <span className="text-[10px] text-white/70 block uppercase font-bold">Energy Baseline</span>
            <span className="text-[14px] font-extrabold text-white">{currentPlan.energy}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
            <span className="text-[10px] text-white/70 block uppercase font-bold">Target Intensity</span>
            <span className="text-[14px] font-extrabold text-white">{currentPlan.intensity}</span>
          </div>
        </div>
      </div>

        {/* Main Content Area */}
        <main className="w-full px-5 -mt-3.5 relative z-10 space-y-4 pb-6">
        {/* Tab Switcher */}
        <div className="bg-white rounded-full p-1 border border-[#EDE5DF] shadow-xs flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 py-2.5 rounded-full text-[13.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'workouts'
                ? 'bg-[#523446] text-white shadow-xs'
                : 'text-[#6E5A67] hover:text-[#1E191D]'
            }`}
          >
            <Dumbbell size={15} />
            <span>Today's Workouts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 py-2.5 rounded-full text-[13.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'nutrition'
                ? 'bg-[#523446] text-white shadow-xs'
                : 'text-[#6E5A67] hover:text-[#1E191D]'
            }`}
          >
            <Apple size={15} />
            <span>Target Nutrition</span>
          </button>
        </div>

        {/* Content Section */}
        {activeTab === 'workouts' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] font-bold text-[#1E191D] tracking-tight">
                Recommended Movement
              </span>
              <span className="text-[11px] text-[#7A6C74]">
                Lowers cortisol &amp; optimizes tone
              </span>
            </div>

            {currentPlan.workouts.map((w, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={handleActionClick}
                className="bg-white rounded-[24px] p-4 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-[#D5A7B3] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF0F3] text-[#523446] flex items-center justify-center shrink-0">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1E191D] group-hover:text-[#523446] transition-colors">
                      {w.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11.5px] text-[#7A6C74] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {w.duration}
                      </span>
                      <span>•</span>
                      <span className="text-[#523446] font-medium">{w.intensity}</span>
                      <span>•</span>
                      <span>{w.calories}</span>
                    </div>
                  </div>
                </div>

                {!settings.isPremium ? (
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                    <Lock size={14} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#FAF5F2] text-[#523446] flex items-center justify-center group-hover:bg-[#523446] group-hover:text-white transition-colors">
                    <ArrowRight size={14} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] font-bold text-[#1E191D] tracking-tight">
                Hormone-Nourishing Meals
              </span>
              <span className="text-[11px] text-[#7A6C74]">
                Phase micronutrient fuel
              </span>
            </div>

            {currentPlan.meals.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={handleActionClick}
                className="bg-white rounded-[24px] p-4 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-1.5 group hover:border-[#D5A7B3] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E5D6F] bg-[#FAF0F3] px-2.5 py-0.5 rounded-full">
                    {m.meal}
                  </span>
                  {!settings.isPremium && (
                    <span className="text-[10.5px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown size={11} className="text-amber-500" />
                      Premium Recipe
                    </span>
                  )}
                </div>
                <h3 className="text-[14.5px] font-bold text-[#1E191D] group-hover:text-[#523446] transition-colors">
                  {m.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[12px] text-[#557361] font-medium pt-0.5">
                  <CheckCircle2 size={13} className="text-[#58A366]" />
                  <span>Clinical Benefit: {m.benefit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Premium Upgrade Floating CTA if not premium */}
        {!settings.isPremium && (
          <div className="rounded-[26px] bg-gradient-to-r from-[#38202F] via-[#523446] to-[#38202F] p-5 text-white shadow-lg space-y-3 text-center mt-6">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-300">
              <Crown size={20} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-white tracking-tight">
                Unlock Full Cycle Synchrony
              </h3>
              <p className="text-[12px] text-white/80 mt-1 max-w-xs mx-auto">
                Get full video follow-along workouts, 80+ phase-specific recipes, and automatic calorie adjustments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('TRIAL_PAYWALL')}
              className="w-full py-3 rounded-full bg-white text-[#523446] font-bold text-[14px] shadow-md hover:bg-neutral-100 active:scale-98 transition-all cursor-pointer"
            >
              Start 7-Day Free Trial
            </button>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};
