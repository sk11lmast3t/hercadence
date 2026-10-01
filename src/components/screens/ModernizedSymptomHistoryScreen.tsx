import React, { useState, useMemo } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  Calendar as CalendarIcon, 
  Home, 
  Plus, 
  BarChart2, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Sparkles, 
  Droplet, 
  Moon, 
  Frown, 
  Smile, 
  Activity, 
  Check, 
  X,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useDailyLog } from '../../hooks/useDailyLog';

interface SymptomEntry {
  id: string;
  date: string;
  name: string;
  category: 'physical' | 'energy' | 'skin' | 'flow' | 'mood';
  intensity: number; // 1 to 3 dots
  iconType: 'headache' | 'energy' | 'skin' | 'cramps' | 'irritable' | 'flow' | 'fatigue';
}

interface PhaseGroup {
  id: string;
  phaseName: string;
  dateRange: string;
  entries: SymptomEntry[];
}

interface ModernizedSymptomHistoryScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedSymptomHistoryScreen: React.FC<ModernizedSymptomHistoryScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [currentMonth, setCurrentMonth] = useState<'September 2023' | 'October 2023' | 'November 2023'>('October 2023');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PHYSICAL' | 'MOOD' | 'FLOW'>('ALL');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<SymptomEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derive real entries from dayLogs, fall back to empty
  const { dayLogs, logDay } = useDailyLog();

  const derivedGroups = useMemo<PhaseGroup[]>(() => {
    const entries: SymptomEntry[] = [];
    Object.entries(dayLogs)
      .sort(([a], [b]) => b.localeCompare(a)) // newest first
      .forEach(([date, log]) => {
        const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        (log.symptoms ?? []).forEach((sym, i) => {
          entries.push({
            id: `${date}-sym-${i}`,
            date: displayDate,
            name: sym.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            category: 'physical',
            intensity: 2,
            iconType: 'cramps',
          });
        });
        (log.moods ?? []).forEach((mood, i) => {
          entries.push({
            id: `${date}-mood-${i}`,
            date: displayDate,
            name: mood.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            category: 'mood',
            intensity: 1,
            iconType: 'irritable',
          });
        });
        if (log.flow) {
          entries.push({
            id: `${date}-flow`,
            date: displayDate,
            name: `${log.flow.charAt(0).toUpperCase() + log.flow.slice(1)} Flow`,
            category: 'flow',
            intensity: log.flow === 'heavy' ? 3 : log.flow === 'medium' ? 2 : 1,
            iconType: 'flow',
          });
        }
      });

    if (entries.length === 0) {
      // No logged data yet — return a placeholder so the UI renders gracefully
      return [{
        id: 'empty',
        phaseName: 'No Entries Yet',
        dateRange: 'Start logging to see your history',
        entries: [],
      }];
    }

    return [{
      id: 'all-history',
      phaseName: 'Recent History',
      dateRange: `${entries[entries.length - 1]?.date ?? ''} – ${entries[0]?.date ?? ''}`,
      entries: entries.slice(0, 30),
    }];
  }, [dayLogs]);

  const [phaseGroups, setPhaseGroups] = useState<PhaseGroup[]>(derivedGroups);

  // Modal new symptom state
  const [newSymptomName, setNewSymptomName] = useState<string>('Tender Breasts');
  const [newSymptomDate, setNewSymptomDate] = useState<string>('Oct 20');
  const [newSymptomPhase, setNewSymptomPhase] = useState<string>('follicular-oct');
  const [newSymptomIntensity, setNewSymptomIntensity] = useState<number>(2);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateIntensity = (phaseId: string, entryId: string) => {
    setPhaseGroups(prev => prev.map(group => {
      if (group.id !== phaseId) return group;
      return {
        ...group,
        entries: group.entries.map(e => {
          if (e.id !== entryId) return e;
          const nextIntensity = (e.intensity % 3) + 1;
          return { ...e, intensity: nextIntensity };
        })
      };
    }));
    showToast('Updated symptom intensity');
  };

  const handleAddSymptom = async () => {
    const newEntry: SymptomEntry = {
      id: `s-${Date.now()}`,
      date: newSymptomDate,
      name: newSymptomName,
      category: 'physical',
      intensity: newSymptomIntensity,
      iconType: 'cramps'
    };

    // Persist to Supabase via today's daily log
    const today = new Date().toISOString().split('T')[0];
    await logDay(today, { symptoms: [newSymptomName.toLowerCase().replace(/ /g, '_')] });

    setPhaseGroups(prev => prev.map(group => {
      if (group.id === newSymptomPhase || group.id === 'all-history') {
        return {
          ...group,
          entries: [...group.entries, newEntry]
        };
      }
      return group;
    }));

    setShowLogModal(false);
    showToast(`Logged ${newSymptomName}`);
  };

  const renderIcon = (type: SymptomEntry['iconType']) => {
    switch (type) {
      case 'headache':
        return (
          <div className="w-8 h-8 rounded-full bg-[#F6E8DF] flex items-center justify-center text-[#B06E57]">
            <Activity size={16} />
          </div>
        );
      case 'energy':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FCE8DC] flex items-center justify-center text-[#D67C41]">
            <Zap size={16} />
          </div>
        );
      case 'skin':
        return (
          <div className="w-8 h-8 rounded-full bg-[#F8EAF3] flex items-center justify-center text-[#A6628A]">
            <Sparkles size={16} />
          </div>
        );
      case 'cramps':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EFE4EB] flex items-center justify-center text-[#955479]">
            <Zap size={16} />
          </div>
        );
      case 'irritable':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EDE7F2] flex items-center justify-center text-[#735A86]">
            <Frown size={16} />
          </div>
        );
      case 'flow':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FCE6E8] flex items-center justify-center text-[#C0495A]">
            <Droplet size={16} />
          </div>
        );
      case 'fatigue':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EDE8F4] flex items-center justify-center text-[#6A5A87]">
            <Moon size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#F3ECE5] flex items-center justify-center text-[#6D5D53]">
            <Smile size={16} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-[#221B20] flex justify-center selection:bg-[#F3D7D7]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FBF8F5] pb-24 shadow-2xl overflow-x-hidden">
        
        {/* iOS Status Bar */}
        <div className="pt-3 px-6 flex justify-between items-center text-xs font-semibold text-neutral-800 z-10 select-none">
          <span className="tracking-tight text-[14px]">9:41</span>
          <div className="flex items-center space-x-1.5 text-neutral-800">
            <Signal size={13} strokeWidth={2.5} />
            <Wifi size={13} strokeWidth={2.5} />
            <Battery size={18} strokeWidth={2.5} className="rotate-90" />
          </div>
        </div>

        {/* Header Navigation & Month Indicator */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 -ml-1.5 rounded-full flex items-center justify-center text-[#756A72] hover:bg-black/5 active:scale-95 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="px-3 py-1 rounded-full bg-white border border-[#E8DFD8] text-[12px] font-semibold text-[#665B63] hover:bg-neutral-50 active:scale-95 transition-all flex items-center gap-1 shadow-xs"
            >
              <Plus size={13} strokeWidth={2.2} />
              <span>Log Symptom</span>
            </button>
          </div>

          <h1 className="font-serif text-[34px] sm:text-[36px] font-medium tracking-tight text-[#1A1418] leading-tight">
            Symptom History
          </h1>

          {/* Month Switcher */}
          <div className="flex items-center gap-2 mt-2 text-[#463D43]">
            <CalendarIcon size={16} strokeWidth={2} className="text-[#887882]" />
            <div className="flex items-center gap-1.5 text-[15px] font-medium">
              <button 
                type="button"
                onClick={() => setCurrentMonth(prev => prev === 'November 2023' ? 'October 2023' : 'September 2023')}
                className="p-0.5 hover:bg-neutral-200/50 rounded-full transition-all text-[#887882]"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold text-[#251E23]">{currentMonth}</span>
              <button 
                type="button"
                onClick={() => setCurrentMonth(prev => prev === 'September 2023' ? 'October 2023' : 'November 2023')}
                className="p-0.5 hover:bg-neutral-200/50 rounded-full transition-all text-[#887882]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Phase Groups List */}
        <div className="px-5 mt-4 space-y-4 flex-1">
          {/* Cramps Intensity Banner */}
          {onNavigate && (
            <div
              onClick={() => onNavigate('SYMPTOM_INTENSITY_LOG')}
              className="rounded-[22px] bg-gradient-to-r from-[#F7F2F6] via-[#F4EFF3] to-[#E9DFE7] border border-[#E0D4DC] p-3.5 flex items-center justify-between cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white text-[#7F9EB8] flex items-center justify-center shadow-xs shrink-0">
                  <Activity size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-[#2A2027] tracking-tight">
                    Cramps &amp; Pain Intensity Ruler
                  </div>
                  <div className="text-[11.5px] text-[#786A74] font-medium truncate">
                    5-Level slider with triggers &amp; remedy notes
                  </div>
                </div>
              </div>
              <span className="text-[12px] font-bold text-[#4B3946] shrink-0 bg-white/80 px-3 py-1.5 rounded-full border border-white/90">
                Log →
              </span>
            </div>
          )}

          {phaseGroups.map((group, gIdx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: gIdx * 0.08 }}
              className="rounded-[22px] overflow-hidden bg-white border border-[#EDE4DE] shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
            >
              {/* Tan Header Banner */}
              <div className="bg-[#EFE5DD] px-4 py-2.5 border-b border-[#E8DDD5] flex items-center justify-between">
                <span className="font-serif text-[15.5px] font-medium text-[#291F24] tracking-tight">
                  {group.phaseName} ({group.dateRange})
                </span>
                <span className="text-[11px] font-bold text-[#83707B] uppercase tracking-wider">
                  {group.entries.length} logged
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#F3EDE8]">
                {group.entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleUpdateIntensity(group.id, entry.id)}
                    className="px-4 py-3.5 flex items-center justify-between hover:bg-[#FDFBF9] active:bg-[#F9F5F1] transition-colors cursor-pointer group"
                    title="Tap to cycle intensity (1-3 dots)"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-[13.5px] font-medium text-[#2C242A] w-12 shrink-0">
                        {entry.date}
                      </span>
                      {renderIcon(entry.iconType)}
                      <span className="text-[14.5px] font-medium text-[#1E181D] tracking-tight truncate">
                        {entry.name}
                      </span>
                    </div>

                    {/* Rose Intensity Dots */}
                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      {[1, 2, 3].map((dotIndex) => (
                        <div
                          key={dotIndex}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            dotIndex <= entry.intensity
                              ? 'bg-[#C8757F] shadow-[0_1px_4px_rgba(200,117,127,0.4)] scale-100'
                              : 'bg-transparent border border-transparent scale-75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Hint Footnote */}
          <div className="text-center py-2 text-[12px] text-[#9A8F97]">
            Tap any row to adjust intensity rating (1 to 3 dots)
          </div>
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
            className="flex flex-col items-center gap-1 text-[#C8757F] font-semibold transition-colors relative"
          >
            <CalendarIcon size={20} strokeWidth={2} />
            <span className="text-[11px] font-semibold">Calendar</span>
            <div className="w-1 h-1 rounded-full bg-[#C8757F] absolute -bottom-1" />
          </button>

          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="flex flex-col items-center -mt-3"
          >
            <div className="w-11 h-11 rounded-full bg-[#1E191D] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.25)] active:scale-95 transition-all">
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

        {/* Modal: Log New Symptom */}
        <AnimatePresence>
          {showLogModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-2xl border border-[#EDE5DF]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-[20px] font-bold text-[#1E181D]">
                    Log Symptom Entry
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Symptom Name
                    </label>
                    <input
                      type="text"
                      value={newSymptomName}
                      onChange={(e) => setNewSymptomName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[14px] text-[#221B20] focus:outline-none focus:border-[#C8757F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        value={newSymptomDate}
                        onChange={(e) => setNewSymptomDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[13.5px] text-[#221B20]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                        Phase
                      </label>
                      <select
                        value={newSymptomPhase}
                        onChange={(e) => setNewSymptomPhase(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[13px] text-[#221B20]"
                      >
                        <option value="follicular-oct">Follicular Phase</option>
                        <option value="luteal-oct">Luteal Phase</option>
                        <option value="menstrual-nov">Menstrual Phase</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1.5">
                      Intensity Level
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNewSymptomIntensity(num)}
                          className={`flex-1 py-2 rounded-xl text-[13px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            newSymptomIntensity === num
                              ? 'bg-[#C8757F] text-white border-[#C8757F] shadow-xs'
                              : 'bg-[#FAF8F6] text-[#6E616A] border-[#E3D9D1]'
                          }`}
                        >
                          <div className="flex gap-1">
                            {Array.from({ length: num }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${newSymptomIntensity === num ? 'bg-white' : 'bg-[#C8757F]'}`}
                              />
                            ))}
                          </div>
                          <span>Level {num}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-[#DDD3CB] text-[14px] font-semibold text-[#665A63]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSymptom}
                    className="flex-1 py-3 rounded-2xl bg-[#C8757F] text-white text-[14px] font-bold shadow-[0_4px_14px_rgba(200,117,127,0.3)] active:scale-[0.98]"
                  >
                    Save Entry
                  </button>
                </div>
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
              className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
            >
              <Check size={14} className="text-[#C8757F]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
