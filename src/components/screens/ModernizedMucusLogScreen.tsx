import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Droplet, 
  Cloud, 
  Leaf, 
  Waves, 
  PenLine, 
  Check, 
  Home, 
  Calendar, 
  Plus, 
  BarChart2, 
  User,
  Signal, 
  Wifi, 
  Battery 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useDailyLog } from '../../hooks/useDailyLog';

interface ModernizedMucusLogScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

type MucusType = 'creamy' | 'egg_white' | 'sticky';

export const ModernizedMucusLogScreen: React.FC<ModernizedMucusLogScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { logDay, isSaving } = useDailyLog();
  const [selectedType, setSelectedType] = useState<MucusType>('egg_white');
  const [sensation, setSensation] = useState<string>('Slippery, lubricative');
  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0];
    await logDay(today, { cervicalMucus: selectedType, notes: notes || undefined });
    setToastMessage('Observation Saved Successfully');
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1E191D] pb-24 relative overflow-x-hidden font-sans select-none">
      {/* Top Header with Watercolor Strokes */}
      <div className="relative w-full h-[195px] overflow-hidden bg-gradient-to-b from-[#BEDEEB] via-[#E2EBF0] to-[#FCE1D4]">
        <img
          src="/assets/mucus_log_strokes_1788510605429.jpg"
          alt="Watercolor banner"
          className="w-full h-full object-cover object-center opacity-85 absolute inset-0"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Top iOS Status Bar */}
        <div className="relative z-20 w-full pt-3 px-8 flex items-center justify-between text-[#1E191D] text-[13px] font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <Signal size={14} strokeWidth={2.4} />
            <Wifi size={14} strokeWidth={2.4} />
            <Battery size={16} strokeWidth={2.4} />
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute top-10 left-5 z-20">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#1E191D] hover:bg-white/80 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* Header Title & Subtitle */}
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
          <h1 className="font-serif text-[30px] sm:text-[32px] font-bold text-[#1E191D] tracking-tight leading-tight">
            Cervical Mucus
          </h1>
          <p className="text-[14px] text-[#4A4348] font-normal mt-0.5">
            Track your cycle patterns
          </p>
        </div>
      </div>

      {/* Main Curved White Sheet */}
      <div className="relative -mt-4 bg-[#F8FAFC] rounded-t-[36px] px-5 sm:px-6 pt-6 pb-8 shadow-[0_-6px_24px_rgba(0,0,0,0.02)] max-w-lg mx-auto min-h-[calc(100vh-190px)]">
        
        {/* Date Line */}
        <h2 className="font-serif text-[21px] font-bold text-[#1E191D] tracking-tight mb-3">
          Today, October 26
        </h2>

        {/* Log New Entry Frosted Card */}
        <div className="w-full bg-white/80 backdrop-blur-md border border-white rounded-[22px] py-4 px-5 mb-6 flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(200,215,230,0.22)] cursor-pointer active:scale-[0.99] transition-all">
          <Droplet size={18} className="text-[#1E191D]" strokeWidth={2.2} />
          <span className="font-medium text-[15.5px] text-[#1E191D] tracking-tight">
            Log New Entry
          </span>
        </div>

        {/* Today's Observation Section */}
        <div className="mb-6">
          <h3 className="font-serif text-[19px] font-bold text-[#1E191D] tracking-tight mb-3">
            Today's Observation
          </h3>

          {/* Observations Container Card */}
          <div className="bg-white/80 backdrop-blur-md border border-[#E8EEF5] rounded-[26px] p-4 shadow-[0_4px_20px_rgba(200,215,230,0.18)]">
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Option 1: Creamy */}
              <button
                type="button"
                onClick={() => setSelectedType('creamy')}
                className={`flex flex-col items-center justify-between text-center p-3 rounded-[20px] transition-all cursor-pointer relative min-h-[145px] ${
                  selectedType === 'creamy'
                    ? 'bg-white border-2 border-[#8B80F9]/60 shadow-[0_4px_16px_rgba(139,128,249,0.15)]'
                    : 'bg-transparent border border-transparent hover:bg-white/50'
                }`}
              >
                {selectedType === 'creamy' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#8B80F9] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                
                {/* Icon Circle */}
                <div className="w-13 h-13 rounded-full bg-[#F0F5FA] flex items-center justify-center text-[#1E191D] mt-1 shadow-2xs">
                  <Cloud size={24} strokeWidth={1.8} />
                </div>

                <div className="mt-2">
                  <h4 className="font-bold text-[14px] text-[#1E191D] tracking-tight">
                    Creamy
                  </h4>
                  <p className="text-[11px] text-[#6B7280] leading-tight mt-0.5">
                    Creamy, crewm, lubricative
                  </p>
                </div>
              </button>

              {/* Option 2: Egg White (Highlighted) */}
              <button
                type="button"
                onClick={() => setSelectedType('egg_white')}
                className={`flex flex-col items-center justify-between text-center p-3 rounded-[20px] transition-all cursor-pointer relative min-h-[145px] ${
                  selectedType === 'egg_white'
                    ? 'bg-white border-2 border-[#8B80F9]/60 shadow-[0_6px_20px_rgba(139,128,249,0.18)]'
                    : 'bg-transparent border border-transparent hover:bg-white/50'
                }`}
              >
                {selectedType === 'egg_white' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#8B80F9] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Egg White Stretchy Droplet Icon */}
                <div className="w-13 h-13 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]/60 flex items-center justify-center text-[#1E191D] mt-1 shadow-2xs">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 6 4 C 8 8 10 11 10 15 C 10 17 11 19 12 19 C 13 19 14 17 14 15 C 14 11 16 8 18 4" />
                    <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                  </svg>
                </div>

                <div className="mt-2">
                  <h4 className="font-bold text-[14px] text-[#1E191D] tracking-tight">
                    Egg White
                  </h4>
                  <p className="text-[11px] text-[#4B5563] leading-tight mt-0.5">
                    Stretchy dropl in a raw egg
                  </p>
                </div>
              </button>

              {/* Option 3: Sticky */}
              <button
                type="button"
                onClick={() => setSelectedType('sticky')}
                className={`flex flex-col items-center justify-between text-center p-3 rounded-[20px] transition-all cursor-pointer relative min-h-[145px] ${
                  selectedType === 'sticky'
                    ? 'bg-white border-2 border-[#8B80F9]/60 shadow-[0_4px_16px_rgba(139,128,249,0.15)]'
                    : 'bg-transparent border border-transparent hover:bg-white/50'
                }`}
              >
                {selectedType === 'sticky' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#8B80F9] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Leaf Icon */}
                <div className="w-13 h-13 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#1E191D] mt-1 shadow-2xs">
                  <Leaf size={22} strokeWidth={1.8} />
                </div>

                <div className="mt-2">
                  <h4 className="font-bold text-[14px] text-[#1E191D] tracking-tight">
                    Sticky
                  </h4>
                  <p className="text-[11px] text-[#6B7280] leading-tight mt-0.5">
                    Sticky droplete linnew
                  </p>
                </div>
              </button>

            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="mb-8">
          <h3 className="font-serif text-[19px] font-bold text-[#1E191D] tracking-tight mb-3">
            Details
          </h3>

          <div className="space-y-3">
            {/* Sensation Card */}
            <div 
              onClick={() => {
                const options = ['Slippery, lubricative', 'Damp, slightly wet', 'Dry, smooth'];
                const next = options[(options.indexOf(sensation) + 1) % options.length];
                setSensation(next);
              }}
              className="bg-white/80 backdrop-blur-md border border-[#E8EEF5] rounded-[22px] px-4 py-3.5 flex items-center gap-3.5 shadow-[0_2px_12px_rgba(200,215,230,0.15)] cursor-pointer hover:bg-white transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F0F5FA] flex items-center justify-center text-[#1E191D] shrink-0">
                <Waves size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[15px] text-[#1E191D] tracking-tight">
                  Sensation
                </h4>
                <p className="text-[13px] text-[#6B7280] font-medium truncate">
                  {sensation}
                </p>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white/80 backdrop-blur-md border border-[#E8EEF5] rounded-[22px] px-4 py-3.5 shadow-[0_2px_12px_rgba(200,215,230,0.15)] transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F5FA] flex items-center justify-center text-[#1E191D] shrink-0">
                  <PenLine size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[15px] text-[#1E191D] tracking-tight">
                    Notes
                  </h4>
                  {isEditingNotes ? (
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={() => setIsEditingNotes(false)}
                      placeholder="Add additional notes about your observation..."
                      className="w-full text-[13px] text-[#1E191D] bg-transparent border-b border-[#8B80F9] outline-none pt-0.5"
                      autoFocus
                    />
                  ) : (
                    <p 
                      onClick={() => setIsEditingNotes(true)}
                      className="text-[13px] text-[#6B7280] font-medium truncate cursor-pointer hover:text-[#1E191D]"
                    >
                      {notes || 'Add additional notes about your observation...'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Entry Pill Button matching prompt image */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-full bg-gradient-to-r from-[#4A8FE2] via-[#6387DC] to-[#8C7CD8] hover:opacity-95 disabled:opacity-60 text-white font-medium text-[16px] shadow-[0_8px_24px_rgba(99,135,220,0.35)] active:scale-98 transition-all cursor-pointer text-center"
        >
          {isSaving ? 'Saving…' : 'Save Entry'}
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-transparent px-6 py-2.5 flex items-center justify-between max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('HOME') : onBack()}
          className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#1E191D] transition-colors"
        >
          <Home size={20} strokeWidth={2.2} />
          <span className="text-[11px] font-medium">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('CALENDAR')}
          className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#1E191D] transition-colors"
        >
          <Calendar size={20} strokeWidth={2.2} />
          <span className="text-[11px] font-medium">Calendar</span>
        </button>

        {/* Add Tab with purple accent */}
        <button
          type="button"
          className="flex flex-col items-center -mt-3 text-[#8B80F9]"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7B70EB] to-[#9C92F8] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(139,128,249,0.4)]">
            <Plus size={22} strokeWidth={2.6} />
          </div>
          <span className="text-[11px] font-bold text-[#8B80F9] mt-0.5">Add</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('INSIGHTS')}
          className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#1E191D] transition-colors"
        >
          <BarChart2 size={20} strokeWidth={2.2} />
          <span className="text-[11px] font-medium">Insights</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('PROFILE')}
          className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#1E191D] transition-colors"
        >
          <User size={20} strokeWidth={2.2} />
          <span className="text-[11px] font-medium">Profile</span>
        </button>
      </div>

      {/* Save Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1E191D] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full shadow-xl z-50 flex items-center gap-2"
          >
            <Check size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
