import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  MoreHorizontal, 
  Sun, 
  Moon, 
  Pill, 
  Plus, 
  Check, 
  X, 
  Fish, 
  Sparkles, 
  Leaf, 
  Calendar as CalendarIcon, 
  Search, 
  User, 
  RotateCcw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useMedication } from '../../hooks/useMedication';

interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  taken: boolean;
  iconType: 'sun' | 'fish' | 'probiotic' | 'moon' | 'herb' | 'leaf' | 'pill';
  timeStack: 'morning' | 'night';
}

interface ModernizedSupplementTrackerScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedSupplementTrackerScreen: React.FC<ModernizedSupplementTrackerScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { upsert } = useMedication();
  const [morningStack, setMorningStack] = useState<SupplementItem[]>([
    {
      id: 'm1',
      name: 'Vitamin D3 & K2',
      dosage: '5000 IU',
      taken: true,
      iconType: 'sun',
      timeStack: 'morning'
    },
    {
      id: 'm2',
      name: 'Omega-3 Fish Oil',
      dosage: '1000 mg',
      taken: true,
      iconType: 'fish',
      timeStack: 'morning'
    },
    {
      id: 'm3',
      name: 'Probiotic Complex',
      dosage: '25 Billion CFU',
      taken: true,
      iconType: 'probiotic',
      timeStack: 'morning'
    }
  ]);

  const [nightStack, setNightStack] = useState<SupplementItem[]>([
    {
      id: 'n1',
      name: 'Magnesium Glycinate',
      dosage: '200 mg',
      taken: false,
      iconType: 'moon',
      timeStack: 'night'
    },
    {
      id: 'n2',
      name: 'Ashwagandha Root',
      dosage: '600 mg',
      taken: true,
      iconType: 'herb',
      timeStack: 'night'
    },
    {
      id: 'n3',
      name: 'L-Theanine',
      dosage: '200 mg',
      taken: false,
      iconType: 'leaf',
      timeStack: 'night'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [targetStack, setTargetStack] = useState<'morning' | 'night'>('morning');
  const [newSuppName, setNewSuppName] = useState<string>('');
  const [newSuppDosage, setNewSuppDosage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const toggleMorning = (id: string) => {
    setMorningStack(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.taken;
        showToast(nextState ? `Marked ${item.name} as taken` : `Unmarked ${item.name}`);
        return { ...item, taken: nextState };
      }
      return item;
    }));
  };

  const toggleNight = (id: string) => {
    setNightStack(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.taken;
        showToast(nextState ? `Marked ${item.name} as taken` : `Unmarked ${item.name}`);
        return { ...item, taken: nextState };
      }
      return item;
    }));
  };

  const handleAddSupplement = async () => {
    if (!newSuppName.trim()) return;
    const newItem: SupplementItem = {
      id: `supp-${Date.now()}`,
      name: newSuppName.trim(),
      dosage: newSuppDosage.trim() || '1 Capsule',
      taken: false,
      iconType: 'pill',
      timeStack: targetStack
    };

    if (targetStack === 'morning') {
      setMorningStack(prev => [...prev, newItem]);
    } else {
      setNightStack(prev => [...prev, newItem]);
    }

    try {
      await upsert({
        name: newItem.name,
        dosage: newItem.dosage,
        frequency: targetStack === 'morning' ? 'Daily (Morning)' : 'Daily (Night)',
      });
    } catch (e) {
      console.error('Failed to sync supplement to cloud:', e);
    }

    setNewSuppName('');
    setNewSuppDosage('');
    setShowAddModal(false);
    showToast(`Added ${newItem.name} to ${targetStack} stack`);
  };

  const renderIcon = (type: SupplementItem['iconType']) => {
    switch (type) {
      case 'sun':
        return <Sun size={18} strokeWidth={1.8} className="text-[#3A3236]" />;
      case 'fish':
        return <Fish size={18} strokeWidth={1.8} className="text-[#3A3236]" />;
      case 'probiotic':
        return (
          <div className="w-[18px] h-[18px] flex items-center justify-center text-[#3A3236]">
            <Sparkles size={16} strokeWidth={1.8} />
          </div>
        );
      case 'moon':
        return <Moon size={18} strokeWidth={1.8} className="text-[#3A3236]" />;
      case 'herb':
        return <Leaf size={18} strokeWidth={1.8} className="text-[#3A3236]" />;
      case 'leaf':
        return <Leaf size={18} strokeWidth={1.8} className="text-[#3A3236]" />;
      default:
        return <Pill size={18} strokeWidth={1.8} className="text-[#3A3236]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#221B20] flex justify-center selection:bg-[#E2DDD6]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF7F3] pb-24 shadow-2xl overflow-x-hidden">
        
        {/* Top Celestial Watercolor Header */}
        <div className="relative w-full h-[180px] bg-[#FAF3EA] overflow-hidden">
          <img 
            src="/assets/supplements_banner_art_1788590026593.jpg" 
            alt="Supplement Botanical Watercolor" 
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#FAF7F3]" />

          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-neutral-800 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41 AM</span>
            <div className="flex items-center space-x-1.5 text-neutral-800">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Top Nav Buttons: < and ··· */}
          <div className="absolute top-11 left-0 right-0 px-6 flex items-center justify-between z-20">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2D2429] hover:bg-white active:scale-95 transition-all shadow-xs"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={() => showToast('Reminders set for 8:00 AM & 9:30 PM')}
              className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2D2429] hover:bg-white active:scale-95 transition-all shadow-xs"
            >
              <MoreHorizontal size={20} strokeWidth={2.2} />
            </button>
          </div>

          {/* Banner Title & Subtitle */}
          <div className="absolute bottom-2 left-0 right-0 text-center z-20 px-4">
            <h1 className="font-serif text-[32px] sm:text-[34px] font-medium tracking-tight text-[#1C161B] leading-none">
              Supplement Tracker
            </h1>
            <p className="text-[14px] font-medium text-[#70646B] mt-1 tracking-tight">
              Your daily wellness ritual
            </p>
          </div>
        </div>

        {/* Content Stacks Container */}
        <div className="px-5 pt-3 space-y-4 flex-1">
          
          {/* Card 1: Morning Stack */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white rounded-[26px] border border-[#EBE4DD] shadow-[0_4px_18px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 pt-4 pb-2 border-b border-[#F6EFEA]">
              <div className="flex items-center gap-2">
                <Sun size={20} strokeWidth={2} className="text-[#20181D]" />
                <h2 className="font-serif text-[20px] font-medium text-[#1E171C]">
                  Morning Stack
                </h2>
              </div>
              <p className="text-[13px] text-[#7A6E75] mt-0.5 font-medium">
                Daily essentials for energy.
              </p>
            </div>

            {/* Morning Rows */}
            <div className="divide-y divide-[#F5EFEB]">
              {morningStack.map((item) => (
                <div 
                  key={item.id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-6 flex items-center justify-center shrink-0">
                      {renderIcon(item.iconType)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14.5px] font-semibold text-[#1C161A] tracking-tight leading-snug truncate">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-[#867B82] font-medium">
                        {item.dosage}
                      </div>
                    </div>
                  </div>

                  {/* Pill icon & Toggle Switch */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-5 h-5 flex items-center justify-center text-[#9E8B62] -rotate-45 opacity-85">
                      <Pill size={17} strokeWidth={1.8} />
                    </div>
                    
                    {/* Custom Toggle Switch matching screenshot */}
                    <button
                      type="button"
                      onClick={() => toggleMorning(item.id)}
                      className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        item.taken ? 'bg-[#6D8F7B]' : 'bg-[#D2C8C8]'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`w-6 h-6 rounded-full bg-white shadow-xs ${
                          item.taken ? 'ml-auto' : 'mr-auto'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Supplement Button */}
            <button
              type="button"
              onClick={() => {
                setTargetStack('morning');
                setShowAddModal(true);
              }}
              className="w-full py-3.5 text-center text-[14.5px] font-medium text-[#221B20] hover:bg-[#FAF8F6] border-t border-[#F5EFEB] active:bg-[#F3EDE6] transition-colors"
            >
              Add Supplement
            </button>
          </motion.div>

          {/* Card 2: Night Stack */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="w-full bg-white rounded-[26px] border border-[#EBE4DD] shadow-[0_4px_18px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 pt-4 pb-2 border-b border-[#F6EFEA]">
              <div className="flex items-center gap-2">
                <Moon size={20} strokeWidth={2} className="text-[#20181D]" />
                <h2 className="font-serif text-[20px] font-medium text-[#1E171C]">
                  Night Stack
                </h2>
              </div>
              <p className="text-[13px] text-[#7A6E75] mt-0.5 font-medium">
                Supports restful sleep &amp; recovery.
              </p>
            </div>

            {/* Night Rows */}
            <div className="divide-y divide-[#F5EFEB]">
              {nightStack.map((item) => (
                <div 
                  key={item.id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-6 flex items-center justify-center shrink-0">
                      {renderIcon(item.iconType)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14.5px] font-semibold text-[#1C161A] tracking-tight leading-snug truncate">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-[#867B82] font-medium">
                        {item.dosage}
                      </div>
                    </div>
                  </div>

                  {/* Pill icon & Toggle Switch */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-5 h-5 flex items-center justify-center text-[#9E8B62] -rotate-45 opacity-85">
                      <Pill size={17} strokeWidth={1.8} />
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleNight(item.id)}
                      className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        item.taken ? 'bg-[#6D8F7B]' : 'bg-[#D2C8C8]'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`w-6 h-6 rounded-full bg-white shadow-xs ${
                          item.taken ? 'ml-auto' : 'mr-auto'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Supplement Button */}
            <button
              type="button"
              onClick={() => {
                setTargetStack('night');
                setShowAddModal(true);
              }}
              className="w-full py-3.5 text-center text-[14.5px] font-medium text-[#221B20] hover:bg-[#FAF8F6] border-t border-[#F5EFEB] active:bg-[#F3EDE6] transition-colors"
            >
              Add Supplement
            </button>
          </motion.div>

        </div>

        {/* Bottom Navigation Bar matching screenshot (Today, Cycle, Supplements [Active], Discover, Profile) */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-transparent px-6 py-2.5 flex justify-between items-center z-30">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('HOME')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <CalendarIcon size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Today</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <RotateCcw size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Cycle</span>
          </button>

          {/* Active Supplements Tab */}
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-[#1E191D] font-bold transition-colors relative"
          >
            <Pill size={20} strokeWidth={2.2} />
            <span className="text-[11px] font-bold">Supplements</span>
            <div className="w-10 h-0.5 bg-[#1E191D] rounded-full absolute -bottom-1" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('SEARCH_HUB')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <Search size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Discover</span>
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

        {/* iOS Home Indicator bar */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] pb-1 flex justify-center bg-transparent z-40 pointer-events-none">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

        {/* Modal: Add Supplement */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-2xl border border-[#EDE5DF]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-[20px] font-bold text-[#1E181D]">
                    Add to {targetStack === 'morning' ? 'Morning Stack' : 'Night Stack'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Supplement Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zinc Picolinate, CoQ10"
                      value={newSuppName}
                      onChange={(e) => setNewSuppName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[14px] text-[#221B20] focus:outline-none focus:border-[#6D8F7B]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 30 mg, 1 capsule"
                      value={newSuppDosage}
                      onChange={(e) => setNewSuppDosage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[14px] text-[#221B20] focus:outline-none focus:border-[#6D8F7B]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Stack Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTargetStack('morning')}
                        className={`py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                          targetStack === 'morning'
                            ? 'bg-[#6D8F7B] text-white border-[#6D8F7B]'
                            : 'bg-[#FAF8F6] text-[#6E616A] border-[#E3D9D1]'
                        }`}
                      >
                        Morning Stack
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetStack('night')}
                        className={`py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                          targetStack === 'night'
                            ? 'bg-[#6D8F7B] text-white border-[#6D8F7B]'
                            : 'bg-[#FAF8F6] text-[#6E616A] border-[#E3D9D1]'
                        }`}
                      >
                        Night Stack
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-[#DDD3CB] text-[14px] font-semibold text-[#665A63]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSupplement}
                    disabled={!newSuppName.trim()}
                    className="flex-1 py-3 rounded-2xl bg-[#6D8F7B] text-white text-[14px] font-bold shadow-[0_4px_14px_rgba(109,143,123,0.3)] disabled:opacity-50 active:scale-[0.98]"
                  >
                    Save Supplement
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
              <Check size={14} className="text-[#89BA9C]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
