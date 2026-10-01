import React, { useState, useEffect } from 'react';
import { X, Check, Droplets, Heart, Thermometer, Sparkles, Smile, Pill, Plus } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { DayLog } from '../../types';

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
}

export const LogEntryModal: React.FC<LogEntryModalProps> = ({ isOpen, onClose, dateStr }) => {
  const { dayLogs, saveDayLog, customMoodTags, customSymptomTags, settings, setCurrentView } = useCycle();

  const existingLog = dayLogs[dateStr] || {
    date: dateStr,
    flow: null,
    moods: [],
    symptoms: [],
    bbt: null,
    cervicalMucus: null,
    intimacy: false,
    pillTaken: false,
    notes: ''
  };

  const [flow, setFlow] = useState<DayLog['flow']>(existingLog.flow);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(existingLog.moods || []);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(existingLog.symptoms || []);
  const [bbt, setBbt] = useState<string>(existingLog.bbt ? String(existingLog.bbt) : '');
  const [cervicalMucus, setCervicalMucus] = useState<DayLog['cervicalMucus']>(existingLog.cervicalMucus);
  const [intimacy, setIntimacy] = useState<boolean>(!!existingLog.intimacy);
  const [pillTaken, setPillTaken] = useState<boolean>(!!existingLog.pillTaken);
  const [notes, setNotes] = useState<string>(existingLog.notes || '');

  useEffect(() => {
    if (isOpen) {
      const current = dayLogs[dateStr] || {
        date: dateStr,
        flow: null,
        moods: [],
        symptoms: [],
        bbt: null,
        cervicalMucus: null,
        intimacy: false,
        pillTaken: false,
        notes: ''
      };
      setFlow(current.flow);
      setSelectedMoods(current.moods || []);
      setSelectedSymptoms(current.symptoms || []);
      setBbt(current.bbt ? String(current.bbt) : '');
      setCervicalMucus(current.cervicalMucus);
      setIntimacy(!!current.intimacy);
      setPillTaken(!!current.pillTaken);
      setNotes(current.notes || '');
    }
  }, [isOpen, dateStr, dayLogs]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveDayLog(dateStr, {
      flow,
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      bbt: bbt ? parseFloat(bbt) : null,
      cervicalMucus,
      intimacy,
      pillTaken,
      notes
    });
    onClose();
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const flowOptions: { id: DayLog['flow']; label: string; color: string }[] = [
    { id: null, label: 'None', color: 'bg-stone-100 text-stone-700' },
    { id: 'spotting', label: 'Spotting', color: 'bg-rose-100 text-rose-800' },
    { id: 'light', label: 'Light', color: 'bg-rose-200 text-rose-900' },
    { id: 'medium', label: 'Medium', color: 'bg-rose-400 text-white' },
    { id: 'heavy', label: 'Heavy', color: 'bg-rose-600 text-white' },
  ];

  const mucusOptions: { id: DayLog['cervicalMucus']; label: string }[] = [
    { id: 'dry', label: 'Dry' },
    { id: 'sticky', label: 'Sticky' },
    { id: 'creamy', label: 'Creamy' },
    { id: 'egg_white', label: 'Egg White (Fertile)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-0 sm:p-4">
      <div
        id="log_entry_sheet_container"
        className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0EAE5] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <h3 className="text-xl font-serif font-semibold text-[#20171D]">Daily Log</h3>
            <p className="text-xs text-[#8E7E87]">{dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Menstrual Flow */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Droplets size={18} className="text-[#DE9E8E]" />
              <label className="text-sm font-semibold text-[#20171D]">Menstrual Flow</label>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {flowOptions.map((opt) => (
                <button
                  key={String(opt.id)}
                  type="button"
                  onClick={() => setFlow(opt.id)}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all text-center ${
                    flow === opt.id
                      ? 'border-[#523446] ring-2 ring-[#523446]/20 bg-[#523446] text-white shadow-sm'
                      : 'border-[#EAE0D9] bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Moods */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smile size={18} className="text-[#7D9688]" />
              <label className="text-sm font-semibold text-[#20171D]">Mood</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {customMoodTags.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#523446] text-white shadow-sm'
                        : 'bg-[#F4ECE7] text-[#523446] hover:bg-[#EAE0D9]'
                    }`}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Physical Symptoms */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[#DE9E8E]" />
              <label className="text-sm font-semibold text-[#20171D]">Symptoms</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {customSymptomTags.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#7D9688] text-white shadow-sm'
                        : 'bg-[#EBF1ED] text-[#415C4C] hover:bg-[#DFE9E3]'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: BBT and Pill Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BBT input */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4DE]">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer size={16} className="text-[#7D9688]" />
                <span className="text-xs font-semibold text-[#20171D]">
                  BBT ({settings.temperatureUnit === 'Celsius' ? '°C' : '°F'})
                </span>
              </div>
              <input
                type="number"
                step="0.01"
                placeholder={settings.temperatureUnit === 'Celsius' ? '36.65' : '97.90'}
                value={bbt}
                onChange={(e) => setBbt(e.target.value)}
                className="w-full bg-white border border-[#DDD0C8] rounded-xl px-3 py-1.5 text-sm text-[#20171D] focus:outline-none focus:ring-2 focus:ring-[#7D9688]"
              />
            </div>

            {/* Pill & Intimacy toggles */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4DE] flex flex-col justify-around">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-[#20171D] flex items-center gap-1.5">
                  <Pill size={15} className="text-[#523446]" /> Pill Taken
                </span>
                <input
                  type="checkbox"
                  checked={pillTaken}
                  onChange={(e) => setPillTaken(e.target.checked)}
                  className="w-4 h-4 text-[#523446] rounded focus:ring-[#523446]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#EBE1D9] mt-2">
                <span className="text-xs font-semibold text-[#20171D] flex items-center gap-1.5">
                  <Heart size={15} className="text-[#DE9E8E]" /> Intimacy
                </span>
                <input
                  type="checkbox"
                  checked={intimacy}
                  onChange={(e) => setIntimacy(e.target.checked)}
                  className="w-4 h-4 text-[#DE9E8E] rounded focus:ring-[#DE9E8E]"
                />
              </label>
            </div>
          </div>

          {/* Section 5: Cervical Fluid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#20171D]">Cervical Fluid</label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setCurrentView('MUCUS_LOG');
                }}
                className="text-xs text-[#523446] font-semibold hover:underline cursor-pointer"
              >
                Detailed Log Screen →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {mucusOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCervicalMucus(cervicalMucus === opt.id ? null : opt.id)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-left transition-all ${
                    cervicalMucus === opt.id
                      ? 'border-[#7D9688] bg-[#EBF1ED] text-[#364F40] font-semibold'
                      : 'border-[#EBE1D9] bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Notes */}
          <div>
            <label className="text-sm font-semibold text-[#20171D] block mb-2">Personal Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today? Any specific symptoms or thoughts..."
              className="w-full bg-white border border-[#DDD0C8] rounded-2xl p-3 text-sm text-[#20171D] focus:outline-none focus:ring-2 focus:ring-[#523446]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#F0EAE5] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-[#D8C9C1] text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#DE687F] to-[#CE516B] text-white text-sm font-semibold shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={18} />
            Save Log
          </button>
        </div>
      </div>
    </div>
  );
};
