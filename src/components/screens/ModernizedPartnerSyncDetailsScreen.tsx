import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  MessageSquare, 
  Calendar, 
  Heart, 
  Cake, 
  RotateCcw, 
  Moon, 
  ArrowRight, 
  Home, 
  Plus, 
  BarChart2, 
  User, 
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useCycle } from '../../context/CycleContext';
import { usePartnerPermissions } from '../../hooks/usePartnerPermissions';

interface ModernizedPartnerSyncDetailsScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

interface SharedDate {
  id: string;
  iconType: 'heart' | 'cake' | 'cycle';
  title: string;
  date: string;
}

export const ModernizedPartnerSyncDetailsScreen: React.FC<ModernizedPartnerSyncDetailsScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { settings } = useCycle();
  const { load: loadPermissions, connection } = usePartnerPermissions();

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const partnerName = connection?.partner_name || settings.partnerSync?.connectedPartnerName || 'Partner';

  const [partnerPos, setPartnerPos] = useState<number>(38);
  const [userPos, setUserPos] = useState<number>(75);

  const [dates, setDates] = useState<SharedDate[]>([
    {
      id: 'd1',
      iconType: 'heart',
      title: 'Anniversary',
      date: 'Oct 15'
    },
    {
      id: 'd2',
      iconType: 'cake',
      title: `${partnerName}'s Birthday`,
      date: 'Nov 22'
    },
    {
      id: 'd3',
      iconType: 'cycle',
      title: 'Next Cycle Start (Est.)',
      date: 'Dec 1'
    }
  ]);

  const [showAddDateModal, setShowAddDateModal] = useState<boolean>(false);
  const [showAllNotesModal, setShowAllNotesModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    setDates(prev => [
      ...prev,
      {
        id: `d-${Date.now()}`,
        iconType: 'heart',
        title: newTitle,
        date: newDate
      }
    ]);
    setNewTitle('');
    setNewDate('');
    setShowAddDateModal(false);
    setToastMessage('Shared date added!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#1E191D] pb-24 relative overflow-x-hidden font-sans select-none">
      {/* Top Banner Artwork */}
      <div className="relative w-full h-[220px] overflow-hidden bg-gradient-to-b from-[#E7EEF8] via-[#F2EDF7] to-[#FCEEF2]">
        <img
          src="/assets/partner_sync_leaves_1788510588567.jpg"
          alt="Watercolor pastel leaves"
          className="w-full h-full object-cover object-top opacity-90 absolute inset-0"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Top Controls: Back Arrow (left) and Sliders/Settings (right) */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#1E191D] hover:bg-white/90 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('PARTNER_SYNC') : onBack()}
            className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#1E191D] hover:bg-white/90 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Partner Sync Settings"
          >
            <SlidersHorizontal size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Title and Subtitle */}
        <div className="absolute bottom-5 left-6 z-20 pointer-events-none">
          <h1 className="text-[28px] sm:text-[30px] font-bold text-[#1E191D] tracking-tight leading-tight">
            Partner Sync
          </h1>
          <p className="text-[14.5px] text-[#4A4348] font-medium mt-0.5">
            Partner Profile: {partnerName}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 sm:px-6 pt-4 max-w-lg mx-auto space-y-4">
        
        {/* Card 1: Shared Cycle Phase */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[28px] p-5 shadow-[0_8px_24px_rgba(200,210,225,0.22)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF4FA] flex items-center justify-center text-[#556987]">
              <Moon size={20} strokeWidth={2} />
            </div>
            <h2 className="font-bold text-[16px] text-[#1E191D] tracking-tight">
              Shared Cycle Phase
            </h2>
          </div>

          <h3 className="font-bold text-[16.5px] text-[#1E191D] tracking-tight mt-3">
            Current Phase: Follicular Phase
          </h3>
          <p className="text-[13px] text-[#55606E] font-medium mt-0.5">
            You are both in sync! Energy levels are rising.
          </p>

          {/* Interactive Dual Slider Track matching modernized_partner_sync_details.png */}
          <div className="relative mt-5 mb-2 pt-2 pb-2">
            {/* Track gradient */}
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#72C4DC] via-[#A8A0C8] to-[#C394AF] relative" />

            {/* Avatar Disc 1 (Partner - Cyan) */}
            <div 
              style={{ left: `${partnerPos}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white bg-[#72C4DC] shadow-[0_2px_8px_rgba(114,196,220,0.5)] flex items-center justify-center text-[10px] text-white font-bold cursor-pointer select-none active:scale-110 transition-transform"
              title={`${partnerName} (Follicular)`}
            >
              <Moon size={11} strokeWidth={2.4} fill="currentColor" />
            </div>

            {/* Avatar Disc 2 (You - Mauve) */}
            <div 
              style={{ left: `${userPos}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white bg-[#C394AF] shadow-[0_2px_8px_rgba(195,148,175,0.5)] flex items-center justify-center text-[10px] text-white font-bold cursor-pointer select-none active:scale-110 transition-transform"
              title="You (Follicular)"
            >
              <Moon size={11} strokeWidth={2.4} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Card 2: Notes from Partner */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[28px] p-5 shadow-[0_8px_24px_rgba(200,210,225,0.22)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF4FA] flex items-center justify-center text-[#556987]">
              <MessageSquare size={20} strokeWidth={2} />
            </div>
            <h2 className="font-bold text-[16px] text-[#1E191D] tracking-tight">
              Notes from Partner
            </h2>
          </div>

          <p className="font-medium text-[14.5px] text-[#1E191D] leading-relaxed mt-2.5 mb-1">
            Thinking of you! Can't wait for our weekend getaway. - {partnerName}
          </p>
          <span className="text-[12px] text-[#788290] font-medium block mb-4">
            Today, 10:30 AM
          </span>

          {/* View All Notes Button */}
          <button
            type="button"
            onClick={() => setShowAllNotesModal(true)}
            className="w-full py-3 rounded-2xl bg-white/80 hover:bg-white border border-[#E2EAF2] text-[#1E191D] font-semibold text-[13.5px] flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98 cursor-pointer"
          >
            <span>View All Notes</span>
            <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        {/* Card 3: Upcoming Important Dates */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-[28px] p-5 shadow-[0_8px_24px_rgba(200,210,225,0.22)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF4FA] flex items-center justify-center text-[#556987]">
              <Calendar size={20} strokeWidth={2} />
            </div>
            <h2 className="font-bold text-[16px] text-[#1E191D] tracking-tight">
              Upcoming Important Dates
            </h2>
          </div>

          <div className="space-y-3 pt-1">
            {dates.map((d) => (
              <div key={d.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-[#64748B] shrink-0">
                    {d.iconType === 'heart' && (
                      <Heart size={18} className="text-[#E17A8A]" fill="#E17A8A" />
                    )}
                    {d.iconType === 'cake' && (
                      <Cake size={18} className="text-[#8B7AE1]" />
                    )}
                    {d.iconType === 'cycle' && (
                      <RotateCcw size={18} className="text-[#5592B8]" />
                    )}
                  </div>
                  <span className="font-medium text-[14.5px] text-[#1E191D] truncate">
                    {d.title}
                  </span>
                </div>
                <span className="font-medium text-[13.5px] text-[#64748B] shrink-0">
                  {d.date}
                </span>
              </div>
            ))}
          </div>

          {/* Add Shared Date Button */}
          <button
            type="button"
            onClick={() => setShowAddDateModal(true)}
            className="w-full py-3 rounded-2xl bg-white/80 hover:bg-white border border-[#E2EAF2] text-[#1E191D] font-semibold text-[13.5px] flex items-center justify-center shadow-2xs transition-all active:scale-98 cursor-pointer mt-4"
          >
            Add Shared Date
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar matching screenshot */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-transparent px-6 py-2.5 flex items-center justify-between max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('HOME') : onBack()}
          className="text-[#64748B] hover:text-[#1E191D] transition-colors"
        >
          <Home size={22} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('CALENDAR')}
          className="text-[#64748B] hover:text-[#1E191D] transition-colors"
        >
          <Calendar size={22} strokeWidth={2} />
        </button>

        {/* Add tab with soft gradient center */}
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9B8FC9] to-[#C894B0] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
        >
          <Plus size={22} strokeWidth={2.4} />
        </button>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('INSIGHTS')}
          className="text-[#64748B] hover:text-[#1E191D] transition-colors"
        >
          <BarChart2 size={22} strokeWidth={2} />
        </button>

        {/* Profile (Active with Alex connected) */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('PROFILE')}
          className="flex flex-col items-center gap-0.5 text-[#1E191D]"
        >
          <User size={22} strokeWidth={2.4} />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>

      {/* Add Date Modal */}
      <AnimatePresence>
        {showAddDateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-[#E2EAF2]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-bold text-[#1E191D]">Add Shared Date</h3>
                <button
                  type="button"
                  onClick={() => setShowAddDateModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddDate} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748B] mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Weekend Trip"
                    className="w-full bg-[#F8FAFC] border border-[#E2EAF2] rounded-xl px-3.5 py-2.5 text-[14px] text-[#1E191D] focus:outline-none focus:border-[#72C4DC]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748B] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g. Dec 14"
                    className="w-full bg-[#F8FAFC] border border-[#E2EAF2] rounded-xl px-3.5 py-2.5 text-[14px] text-[#1E191D] focus:outline-none focus:border-[#72C4DC]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#523446] hover:bg-[#412737] text-white font-bold text-[14px] shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  Save Date
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* All Notes Modal */}
      <AnimatePresence>
        {showAllNotesModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#E2EAF2]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-[#1E191D]">Partner Notes</h3>
                <button
                  type="button"
                  onClick={() => setShowAllNotesModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2EAF2]">
                  <p className="text-[13.5px] text-[#1E191D] font-medium">
                    "Thinking of you! Can't wait for our weekend getaway."
                  </p>
                  <span className="text-[11px] text-[#788290] mt-1 block">Today, 10:30 AM • {partnerName}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2EAF2]">
                  <p className="text-[13.5px] text-[#1E191D] font-medium">
                    "Packed some hot tea and chocolates for you on the counter."
                  </p>
                  <span className="text-[11px] text-[#788290] mt-1 block">Yesterday, 7:15 PM • {partnerName}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllNotesModal(false)}
                className="w-full mt-4 py-2.5 rounded-2xl bg-[#523446] text-white font-medium text-[13.5px]"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
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
