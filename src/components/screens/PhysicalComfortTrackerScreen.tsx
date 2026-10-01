import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Sparkles, 
  Heart, 
  Activity, 
  Flame, 
  Check, 
  ShieldCheck, 
  Thermometer, 
  Wind, 
  Smile, 
  Droplet,
  Coffee,
  Bed
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { formatDateToISO } from '../../utils/cycleCalculations';
import { MobileStatusBar } from '../common/MobileStatusBar';

interface PhysicalComfortTrackerScreenProps {
  onBack: () => void;
}

export const PhysicalComfortTrackerScreen: React.FC<PhysicalComfortTrackerScreenProps> = ({ onBack }) => {
  const { currentCycle, dayLogs, saveDayLog } = useCycle();
  const todayStr = formatDateToISO(new Date());
  const existingLog = dayLogs[todayStr];

  const comfortPresets = [
    { id: 'Good, No Pain', label: 'Pristine & At Ease', icon: Smile, bg: 'bg-[#F2EADB]', border: 'border-[#E6DCC9]', color: 'text-[#615132]', desc: 'No pelvic or back tension, light somatic energy' },
    { id: 'Mild Tension', label: 'Mild Tightness', icon: Wind, bg: 'bg-[#F5ECE8]', border: 'border-[#E3CDC7]', color: 'text-[#7D493E]', desc: 'Subtle awareness in pelvis or lower back' },
    { id: 'Moderate Aches', label: 'Moderate Cramps / Ache', icon: Activity, bg: 'bg-[#FAF0E6]', border: 'border-[#E8D6C5]', color: 'text-[#7C5528]', desc: 'Noticeable cramps or lower back ache; relief helpful' },
    { id: 'High Discomfort', label: 'Acute Discomfort', icon: Flame, bg: 'bg-[#FAF2F2]', border: 'border-[#E8C5C8]', color: 'text-[#78373E]', desc: 'Strong cramping, heating pad or pain relief required' },
  ];

  const bodyZones = [
    { id: 'pelvis', zone: 'Pelvis & Uterus', options: ['Relaxed', 'Mild twinges', 'Dull ache', 'Cramping spasms'] },
    { id: 'lower_back', zone: 'Lower Back & Sacrum', options: ['Supple', 'Stiff', 'Dull ache', 'Heavy pulling'] },
    { id: 'digestive', zone: 'Belly & Digestive', options: ['Comfortable', 'Mild bloating', 'Water retention', 'Gas / Fullness'] },
    { id: 'chest', zone: 'Chest & Breasts', options: ['Zero tenderness', 'Sensitive to touch', 'Swollen / Heavy'] },
    { id: 'head', zone: 'Head & Neck', options: ['Clear', 'Tension tight', 'Sinus pressure', 'Migraine warning'] },
  ];

  const reliefInterventions = [
    { id: 'heat', label: 'Heating Pad applied', icon: Flame },
    { id: 'stretch', label: 'Pelvic Opening Stretches', icon: Activity },
    { id: 'magnesium', label: 'Magnesium & Electrolytes', icon: Droplet },
    { id: 'tea', label: 'Warm Chamomile / Ginger Tea', icon: Coffee },
    { id: 'bath', label: 'Warm Epsom Salt Soak', icon: Wind },
    { id: 'rest', label: 'Horizontal Rest & Breathwork', icon: Bed },
  ];

  const [selectedComfort, setSelectedComfort] = useState<string>(existingLog?.physicalComfort || 'Good, No Pain');
  const [comfortScore, setComfortScore] = useState<number>(existingLog?.comfortLevel || 9);
  const [zoneSelections, setZoneSelections] = useState<Record<string, string>>({
    pelvis: 'Relaxed',
    lower_back: 'Supple',
    digestive: 'Comfortable',
    chest: 'Zero tenderness',
    head: 'Clear'
  });
  const [activeReliefs, setActiveReliefs] = useState<string[]>(['tea']);
  const [notes, setNotes] = useState<string>(existingLog?.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const setZoneOption = (zoneId: string, option: string) => {
    setZoneSelections(prev => ({ ...prev, [zoneId]: option }));
  };

  const toggleRelief = (id: string) => {
    setActiveReliefs(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleSave = () => {
    saveDayLog(todayStr, {
      physicalComfort: selectedComfort,
      comfortLevel: comfortScore,
      notes: notes ? (existingLog?.notes ? `${existingLog.notes} | Comfort: ${notes}` : `Comfort: ${notes}`) : existingLog?.notes
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
          src="/assets/cramps_watercolor_waves_1788590852294.jpg"
          alt="Warm watercolor waves"
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#543649]/70">Somatic &amp; Body Ease</span>
            <h1 className="font-serif text-[20px] font-bold text-[#1E191D] tracking-tight">Physical Comfort</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-[#B05B64]">
            <Heart size={20} />
          </div>
        </header>

        {/* Phase Context Pill */}
        <div className="px-5 pt-1 pb-3">
          <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-[#EBE3DC] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F2EADB] text-[#615132] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-[#1E191D]">
                {currentCycle.phaseDisplayName} Body Rhythm
              </div>
              <div className="text-[11px] text-[#695D64] leading-snug">
                Progesterone levels support calm muscle tone. Keep fluid intake consistent to minimize retention.
              </div>
            </div>
          </div>
        </div>

        <main className="px-5 space-y-4 pt-1">
          {/* Section 1: Comfort Preset Selection */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <label className="text-[13px] font-bold text-[#1E191D] mb-3 block">
              Overall Physical Comfort Level
            </label>
            <div className="space-y-2.5">
              {comfortPresets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedComfort === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedComfort(preset.id)}
                    className={`w-full p-3 rounded-2xl text-left border flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? `${preset.bg} ${preset.border} ring-2 ring-[#7C5528]/30 shadow-xs scale-[1.01]`
                        : 'bg-[#FAF8F5] border-[#EDE6E1] hover:bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${preset.bg} ${preset.color}`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-[#1E191D] flex items-center justify-between">
                        <span>{preset.label}</span>
                        {isSelected && <Check size={16} className="text-[#615132]" />}
                      </div>
                      <div className="text-[11px] text-[#7A6C74] truncate">{preset.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Comfort Ease Slider (1 to 10) */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-bold text-[#1E191D]">Somatic Ease Score</span>
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#F2EADB] text-[#615132]">
                {comfortScore} / 10 Ease
              </span>
            </div>
            <p className="text-[11px] text-[#7A6C74] mb-3">
              {comfortScore >= 8 ? 'Body feels balanced and free of distress' : comfortScore >= 5 ? 'Manageable tension; warm compress and pacing recommended' : 'High cramps or discomfort; rest prioritized'}
            </p>
            <input
              type="range"
              min="1"
              max="10"
              value={comfortScore}
              onChange={(e) => setComfortScore(parseInt(e.target.value))}
              className="w-full h-2 bg-[#EFECE8] rounded-lg appearance-none cursor-pointer accent-[#7C5528]"
            />
            <div className="flex justify-between text-[10px] text-[#9A8F95] mt-1.5 font-medium">
              <span>Severe Cramps (1)</span>
              <span>Moderate (5)</span>
              <span>Total Ease (10)</span>
            </div>
          </section>

          {/* Section 3: Targeted Anatomical Zones */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <span className="text-[13px] font-bold text-[#1E191D] mb-3 block">
              Targeted Body Areas
            </span>
            <div className="space-y-3">
              {bodyZones.map((zone) => {
                const currentVal = zoneSelections[zone.id];
                return (
                  <div key={zone.id} className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EDE6E1]">
                    <div className="text-[12px] font-bold text-[#1E191D] mb-2">{zone.zone}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.options.map((opt) => {
                        const isMatch = currentVal === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setZoneOption(zone.id, opt)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                              isMatch
                                ? 'bg-[#543649] text-white font-bold shadow-2xs'
                                : 'bg-white text-[#5E5159] border border-[#E8E0DA] hover:border-[#CFBFCB]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 4: Relief Interventions */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <span className="text-[13px] font-bold text-[#1E191D] mb-2.5 block">
              Relief Interventions Applied Today
            </span>
            <div className="grid grid-cols-2 gap-2">
              {reliefInterventions.map((relief) => {
                const Icon = relief.icon;
                const active = activeReliefs.includes(relief.id);
                return (
                  <button
                    key={relief.id}
                    type="button"
                    onClick={() => toggleRelief(relief.id)}
                    className={`p-2.5 rounded-xl text-[11.5px] font-medium flex items-center gap-2 border transition-all text-left cursor-pointer ${
                      active
                        ? 'bg-[#F2EADB] border-[#E6DCC9] text-[#615132] font-bold'
                        : 'bg-[#FAF8F5] border-[#EDE6E1] text-[#544850] hover:bg-white'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-[#615132]' : 'text-[#8E8088]'} />
                    <span className="truncate">{relief.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 5: Somatic Journaling */}
          <section className="bg-white rounded-[26px] p-4.5 border border-[#EDE5DF] shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
            <label className="text-[13px] font-bold text-[#1E191D] mb-1.5 block">
              Body Notes &amp; Observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Cramping eased after 20m heating pad; feeling warm..."
              rows={2}
              className="w-full bg-[#FAF8F5] border border-[#EDE6E1] rounded-xl p-3 text-xs text-[#1E191D] placeholder:text-[#9E9099] focus:outline-none focus:ring-1 focus:ring-[#7C5528] resize-none"
            />
          </section>

          {/* Save Button */}
          <div className="pt-2 pb-6">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-4 bg-[#7C5528] hover:bg-[#68451E] active:scale-[0.98] text-white font-bold text-[16px] rounded-full shadow-[0_10px_25px_rgba(124,85,40,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check size={20} />
                  <span>Comfort Saved!</span>
                </>
              ) : (
                <>
                  <Heart size={18} />
                  <span>Save Comfort Check-In</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
