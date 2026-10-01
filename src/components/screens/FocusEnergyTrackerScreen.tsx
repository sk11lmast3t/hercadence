import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Sparkles, 
  Zap, 
  Target, 
  Feather, 
  Cloud, 
  Compass, 
  Check, 
  Brain, 
  Clock, 
  Coffee, 
  Headphones, 
  SunMedium, 
  Flame,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { formatDateToISO } from '../../utils/cycleCalculations';
import { MobileStatusBar } from '../common/MobileStatusBar';

interface FocusEnergyTrackerScreenProps {
  onBack: () => void;
}

export const FocusEnergyTrackerScreen: React.FC<FocusEnergyTrackerScreenProps> = ({ onBack }) => {
  const { currentCycle, dayLogs, saveDayLog } = useCycle();
  const todayStr = formatDateToISO(new Date());
  const existingLog = dayLogs[todayStr];

  const focusStates = [
    { id: 'Deep Flow', label: 'Deep Flow', icon: Zap, bg: 'bg-[#E8F2EC]', border: 'border-[#BDD4C8]', color: 'text-[#2D5A43]', desc: 'Immersed, high dopamine, effortless momentum' },
    { id: 'Sharp & Productive', label: 'Sharp & Focused', icon: Target, bg: 'bg-[#F2F4E8]', border: 'border-[#D4DFC0]', color: 'text-[#4A5D2E]', desc: 'Structured clarity, decisive execution' },
    { id: 'Calm & Steady', label: 'Calm Presence', icon: Feather, bg: 'bg-[#F5ECE8]', border: 'border-[#E3CDC7]', color: 'text-[#7D493E]', desc: 'Grounded, mindful pacing, minimal stress' },
    { id: 'Mild Brain Fog', label: 'Mild Brain Fog', icon: Cloud, bg: 'bg-[#EAEAF4]', border: 'border-[#D0CFE6]', color: 'text-[#4D4B73]', desc: 'Sluggish recall, requires extra cognitive effort' },
    { id: 'Scattered / Restless', label: 'Scattered & Restless', icon: Compass, bg: 'bg-[#FAF0E6]', border: 'border-[#E8D6C5]', color: 'text-[#7C5528]', desc: 'Task switching, wandering attention' },
  ];

  const focusBoosters = [
    { id: 'binaural', label: '40Hz Gamma Beats', icon: Headphones },
    { id: 'pomodoro', label: '25m Sprint Interval', icon: Clock },
    { id: 'matcha', label: 'L-Theanine & Green Tea', icon: Coffee },
    { id: 'walk', label: '10m Natural Sunlight Walk', icon: SunMedium },
    { id: 'single_task', label: 'Single Tab Lockdown', icon: Target },
  ];

  const brainFogChecklist = [
    'Word finding delay',
    'Difficulty prioritizing',
    'Open loop overwhelm',
    'Dopamine dip after noon',
    'Sensory overstimulation'
  ];

  const [selectedState, setSelectedState] = useState<string>(existingLog?.focus || 'Sharp & Productive');
  const [staminaLevel, setStaminaLevel] = useState<number>(existingLog?.focusLevel || 8);
  const [activeBoosters, setActiveBoosters] = useState<string[]>(['pomodoro']);
  const [activeFogItems, setActiveFogItems] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>(existingLog?.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const toggleBooster = (id: string) => {
    setActiveBoosters(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const toggleFogItem = (item: string) => {
    setActiveFogItems(prev => prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]);
  };

  const handleSave = () => {
    saveDayLog(todayStr, {
      focus: selectedState,
      focusLevel: staminaLevel,
      notes: notes ? (existingLog?.notes ? `${existingLog.notes} | Focus: ${notes}` : `Focus: ${notes}`) : existingLog?.notes
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onBack();
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1E191D] pb-12 relative font-sans select-none overflow-x-hidden">
      {/* Top Silk Wave Banner */}
      <div className="absolute top-0 left-0 right-0 h-[260px] pointer-events-none z-0 overflow-hidden">
        <img
          src="/assets/harmonized_waves_bg.jpg"
          alt="Silk waves background"
          className="w-full h-full object-cover object-top opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FDFCFB]/60 to-[#FDFCFB]" />
      </div>

      <div className="max-w-[430px] mx-auto relative z-10 flex flex-col">
        <MobileStatusBar />

        {/* Header Bar */}
        <header className="px-5 pt-3 pb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#1E191D] shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#543649]/70">Daily Cognitive Rhythm</span>
            <h1 className="font-serif text-[20px] font-bold text-[#1E191D] tracking-tight">Focus &amp; Mental Energy</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-[#4A5D2E]">
            <Brain size={20} />
          </div>
        </header>

        {/* Phase Context Pill */}
        <div className="px-5 pt-1 pb-3">
          <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-[#EBE3DC] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#BDD4C8] text-[#2D5A43] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-[#1E191D]">
                {currentCycle.phaseDisplayName} Focus Outlook
              </div>
              <div className="text-[11px] text-[#695D64] leading-snug">
                Estrogen supports prefrontal clarity. Great day for strategic planning &amp; creative flow.
              </div>
            </div>
          </div>
        </div>

        <main className="px-5 space-y-4 pt-1">
          {/* Section 1: Clarity State Selection */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <label className="text-[13px] font-bold text-[#1E191D] mb-3 block">
              How is your focus right now?
            </label>
            <div className="space-y-2.5">
              {focusStates.map((state) => {
                const Icon = state.icon;
                const isSelected = selectedState === state.id;
                return (
                  <button
                    key={state.id}
                    type="button"
                    onClick={() => setSelectedState(state.id)}
                    className={`w-full p-3 rounded-2xl text-left border flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? `${state.bg} ${state.border} ring-2 ring-[#2D5A43]/30 shadow-xs scale-[1.01]`
                        : 'bg-[#FAF8F5] border-[#EDE6E1] hover:bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${state.bg} ${state.color}`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-[#1E191D] flex items-center justify-between">
                        <span>{state.label}</span>
                        {isSelected && <Check size={16} className="text-[#2D5A43]" />}
                      </div>
                      <div className="text-[11px] text-[#7A6C74] truncate">{state.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Cognitive Stamina Gauge */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-bold text-[#1E191D]">Sustained Attention Meter</span>
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F2EC] text-[#2D5A43]">
                Level {staminaLevel} / 10
              </span>
            </div>
            <p className="text-[11px] text-[#7A6C74] mb-3">
              {staminaLevel >= 8 ? 'High cognitive reserve • Ideal for deep work sprints' : staminaLevel >= 5 ? 'Moderate stamina • Keep sessions under 35 minutes' : 'Low reserve • Pacing & gentle tasks recommended'}
            </p>
            <input
              type="range"
              min="1"
              max="10"
              value={staminaLevel}
              onChange={(e) => setStaminaLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-[#EFECE8] rounded-lg appearance-none cursor-pointer accent-[#2D5A43]"
            />
            <div className="flex justify-between text-[10px] text-[#9A8F95] mt-1.5 font-medium">
              <span>Depleted</span>
              <span>Balanced</span>
              <span>Peak Flow</span>
            </div>
          </section>

          {/* Section 3: Focus Aids & Boosters */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <span className="text-[13px] font-bold text-[#1E191D] mb-2.5 block">
              Flow Boosters Active Today
            </span>
            <div className="flex flex-wrap gap-2">
              {focusBoosters.map((booster) => {
                const Icon = booster.icon;
                const active = activeBoosters.includes(booster.id);
                return (
                  <button
                    key={booster.id}
                    type="button"
                    onClick={() => toggleBooster(booster.id)}
                    className={`px-3 py-2 rounded-xl text-[11.5px] font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#E8F2EC] border-[#BDD4C8] text-[#2D5A43] font-bold'
                        : 'bg-[#FAF8F5] border-[#EDE6E1] text-[#544850] hover:bg-white'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{booster.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 4: Brain Fog Symptoms */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-bold text-[#1E191D]">Brain Fog Check</span>
              <span className="text-[11px] text-[#7A6C74]">Optional check-in</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {brainFogChecklist.map((item) => {
                const active = activeFogItems.includes(item);
                return (
                  <div
                    key={item}
                    onClick={() => toggleFogItem(item)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-[11.5px] cursor-pointer transition-all ${
                      active ? 'bg-[#FAF2F2] border-[#E8C5C8] text-[#78373E]' : 'bg-[#FAF8F5] border-[#EDE6E1] text-[#5A4E55]'
                    }`}
                  >
                    <span>{item}</span>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${active ? 'bg-[#78373E] border-[#78373E] text-white' : 'border-[#D4C8CE]'}`}>
                      {active && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 5: Daily Intention & Notes */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <label className="text-[13px] font-bold text-[#1E191D] mb-1.5 block">
              Focus Intention / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Prioritizing slide deck before 2pm; took 15m walk..."
              rows={2}
              className="w-full bg-[#FAF8F5] border border-[#EDE6E1] rounded-xl p-3 text-xs text-[#1E191D] placeholder:text-[#9E9099] focus:outline-none focus:ring-1 focus:ring-[#2D5A43] resize-none"
            />
          </section>

          {/* Save Button */}
          <div className="pt-2 pb-6">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-4 bg-[#2D5A43] hover:bg-[#234835] active:scale-[0.98] text-white font-bold text-[16px] rounded-full shadow-[0_10px_25px_rgba(45,90,67,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check size={20} />
                  <span>Focus Saved!</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Save Focus Check-In</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
