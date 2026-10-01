import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Smile, 
  Heart, 
  Sparkles, 
  AlertTriangle, 
  Zap, 
  Feather, 
  Coffee, 
  Check,
  Flame
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { formatDateToISO } from '../../utils/cycleCalculations';
import { MobileStatusBar } from '../common/MobileStatusBar';

interface HowAreYouFeelingScreenProps {
  onBack: () => void;
}

export const HowAreYouFeelingScreen: React.FC<HowAreYouFeelingScreenProps> = ({ onBack }) => {
  const { currentCycle, dayLogs, saveDayLog } = useCycle();
  const todayStr = formatDateToISO(new Date());
  const existingLog = dayLogs[todayStr] || { moods: [] };

  const moodOptions = [
    { id: 'Calm', label: 'Calm', icon: Feather, bg: 'bg-[#F2ECEE]', border: 'border-[#DFC6CF]', text: 'text-[#693E52]' },
    { id: 'Happy', label: 'Happy & Joyful', icon: Smile, bg: 'bg-[#E8F0EA]', border: 'border-[#C8DCCB]', text: 'text-[#355B3C]' },
    { id: 'Energized', label: 'High Energy', icon: Zap, bg: 'bg-[#FEF5E7]', border: 'border-[#F2DEC0]', text: 'text-[#875822]' },
    { id: 'Creative', label: 'Creative Flow', icon: Sparkles, bg: 'bg-[#F2EEF8]', border: 'border-[#D9CFEA]', text: 'text-[#59427A]' },
    { id: 'Reflective', label: 'Tender & Reflective', icon: Heart, bg: 'bg-[#FAF0E6]', border: 'border-[#E6D4C3]', text: 'text-[#7D5333]' },
    { id: 'Tired', label: 'Tired / Depleted', icon: Coffee, bg: 'bg-[#E8EFF2]', border: 'border-[#CADAE0]', text: 'text-[#365A69]' },
    { id: 'Anxious', label: 'Anxious / Overwhelmed', icon: AlertTriangle, bg: 'bg-[#FCEAE8]', border: 'border-[#ECCBC6]', text: 'text-[#853C35]' },
    { id: 'Irritable', label: 'Sensitive / Irritable', icon: Flame, bg: 'bg-[#FBF0F2]', border: 'border-[#ECD0D6]', text: 'text-[#853A48]' },
  ];

  const emotionalTriggers = [
    'Work deadlines',
    'Hormonal shift',
    'Deep sleep quality',
    'Caffeine sensitivity',
    'Social connection',
    'Alone time restorative'
  ];

  const [selectedMoods, setSelectedMoods] = useState<string[]>(
    existingLog.moods && existingLog.moods.length > 0 ? existingLog.moods : ['Calm', 'Happy']
  );
  const [activeTriggers, setActiveTriggers] = useState<string[]>(['Hormonal shift']);
  const [reflectionText, setReflectionText] = useState<string>(existingLog.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const toggleMood = (moodId: string) => {
    setSelectedMoods((prev) => {
      if (prev.includes(moodId)) {
        const next = prev.filter((m) => m !== moodId);
        return next.length > 0 ? next : [moodId];
      } else {
        return [...prev, moodId];
      }
    });
  };

  const toggleTrigger = (trigger: string) => {
    setActiveTriggers(prev => prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]);
  };

  const handleSave = () => {
    saveDayLog(todayStr, {
      moods: selectedMoods,
      notes: reflectionText ? (existingLog?.notes ? `${existingLog.notes} | Mood: ${reflectionText}` : `Mood: ${reflectionText}`) : existingLog?.notes
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onBack();
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans select-none overflow-x-hidden">
      {/* Top Embrace Artwork Banner */}
      <div className="absolute top-0 left-0 right-0 h-[280px] pointer-events-none z-0 overflow-hidden">
        <img
          src="/assets/feeling_embrace_circle_1788068519158.jpg"
          alt="Organic figures embracing artwork"
          className="w-full h-full object-cover object-top opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAF9F7]/60 to-[#FAF9F7]" />
      </div>

      <div className="max-w-[430px] mx-auto relative z-10 flex flex-col">
        <MobileStatusBar />

        {/* Header Bar */}
        <header className="px-5 pt-3 pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#1E191D] shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#543649]/70">Emotional Vitality</span>
            <h1 className="font-serif text-[20px] font-bold text-[#1E191D] tracking-tight">How Are You Feeling?</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-[#B05B64]">
            <Heart size={20} />
          </div>
        </header>

        {/* Phase Context Note */}
        <div className="px-5 pt-1 pb-3">
          <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-[#EBE3DC] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8C5C8] text-[#543649] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-[#1E191D]">
                {currentCycle.phaseDisplayName} Emotional Landscape
              </div>
              <div className="text-[11px] text-[#695D64] leading-snug">
                Your brain neurochemistry is naturally attuned to empathy and connection today.
              </div>
            </div>
          </div>
        </div>

        <main className="px-5 space-y-4 pt-1">
          {/* Section 1: Mood Grid Selection */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-bold text-[#1E191D]">
                Select One or More Emotions
              </span>
              <span className="text-[11px] text-[#7A6C74]">
                {selectedMoods.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moodOptions.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMoods.includes(mood.id);

                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => toggleMood(mood.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      isSelected
                        ? `${mood.bg} ${mood.border} ring-2 ring-[#543649]/30 shadow-2xs scale-[1.01]`
                        : 'bg-[#FAF8F5] border-[#EDE6E1] hover:bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${mood.bg} ${mood.text}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold text-[#1E191D] flex items-center justify-between">
                        <span className="truncate">{mood.label}</span>
                        {isSelected && <Check size={14} className="text-[#543649] shrink-0" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Emotional Drivers & Influences */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <span className="text-[13px] font-bold text-[#1E191D] mb-2.5 block">
              What is influencing your mood today?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {emotionalTriggers.map((trigger) => {
                const active = activeTriggers.includes(trigger);
                return (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    className={`px-3 py-1.5 rounded-xl text-[11.5px] font-medium border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#543649] text-white border-[#543649] font-bold shadow-2xs'
                        : 'bg-[#FAF8F5] border-[#EDE6E1] text-[#554951] hover:bg-white'
                    }`}
                  >
                    {trigger}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: Gentle Reflection Notes */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <label className="text-[13px] font-bold text-[#1E191D] mb-1.5 block">
              Daily Reflection / Gratitude
            </label>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What are you noticing emotionally? What did your body need today?"
              rows={3}
              className="w-full bg-[#FAF8F5] border border-[#EDE6E1] rounded-xl p-3 text-xs text-[#1E191D] placeholder:text-[#9E9099] focus:outline-none focus:ring-1 focus:ring-[#543649] resize-none"
            />
          </section>

          {/* Save Action */}
          <div className="pt-2 pb-6">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-4 bg-[#543649] hover:bg-[#432939] active:scale-[0.98] text-white font-bold text-[16px] rounded-full shadow-[0_10px_25px_rgba(84,54,73,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check size={20} />
                  <span>Mood Saved!</span>
                </>
              ) : (
                <>
                  <Smile size={18} />
                  <span>Save Mood Check-In</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
