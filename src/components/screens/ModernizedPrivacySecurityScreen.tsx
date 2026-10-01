import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  UserX, 
  Trash2, 
  Home, 
  Calendar, 
  Plus, 
  BarChart2, 
  User, 
  AlertTriangle, 
  Check, 
  X,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedPrivacySecurityScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedPrivacySecurityScreen: React.FC<ModernizedPrivacySecurityScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toLowerCase() === 'delete') {
      setShowDeleteModal(false);
      setDeleteConfirmationText('');
      setToastMessage('Account and local encrypted health cache cleared.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-[#1E191D] pb-24 relative overflow-x-hidden font-sans select-none flex flex-col items-center">
      {/* Phone container */}
      <div className="w-full max-w-md bg-[#FAF7F3] min-h-screen relative flex flex-col justify-between shadow-2xl overflow-hidden">

        {/* Top Watercolor & Gold Vein Banner */}
        <div className="relative w-full h-[145px] sm:h-[155px] overflow-hidden bg-gradient-to-r from-[#F7E7E5] via-[#EEDAD6] to-[#E3CEC9]">
          <img
            src="/assets/privacy_gold_vein_art_1788511313815.jpg"
            alt="Blush watercolor with gold vein ribbon"
            className="w-full h-full object-cover object-center absolute inset-0 opacity-90"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Curved white overlay mask to match exact wave cut in screenshot */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#FAF7F3] via-[#FAF7F3]/90 to-transparent" />

          {/* Back button + "< Back" */}
          <div className="relative z-20 pt-4 px-6">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[#1E191D] hover:opacity-75 transition-opacity cursor-pointer active:scale-95"
            >
              <ChevronLeft size={22} strokeWidth={2.4} className="text-[#1E191D]" />
              <span className="font-serif text-[17px] text-[#1E191D]">Back</span>
            </button>
          </div>

          {/* Screen Title: Data Privacy & Security */}
          <div className="relative z-20 px-6 pt-3">
            <h1 className="font-serif text-[27px] sm:text-[30px] font-normal text-[#1E191D] tracking-tight leading-tight">
              Data Privacy &amp; Security
            </h1>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 py-4 flex-1 flex flex-col gap-4">

          {/* Card 1: Data Encryption */}
          <div className="bg-white rounded-[26px] p-5 border border-[#EDE4DE] shadow-[0_4px_20px_rgba(0,0,0,0.025)] hover:border-[#DFD3CA] transition-all">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F8F3EA] text-[#A68853] flex items-center justify-center shrink-0">
                <ShieldCheck size={22} strokeWidth={1.9} />
              </div>
              <h2 className="font-serif text-[18px] sm:text-[19px] font-medium text-[#1E191D] tracking-tight">
                Data Encryption
              </h2>
            </div>
            <p className="text-[13.5px] text-[#554C53] leading-relaxed">
              Your data is protected with end-to-end encryption, ensuring it remains confidential and secure from unauthorized access.
            </p>
          </div>

          {/* Card 2: Third-Party Sharing */}
          <div className="bg-white rounded-[26px] p-5 border border-[#EDE4DE] shadow-[0_4px_20px_rgba(0,0,0,0.025)] hover:border-[#DFD3CA] transition-all">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F8F3EA] text-[#A68853] flex items-center justify-center shrink-0">
                <UserX size={22} strokeWidth={1.9} />
              </div>
              <h2 className="font-serif text-[18px] sm:text-[19px] font-medium text-[#1E191D] tracking-tight">
                Third-Party Sharing
              </h2>
            </div>
            <div className="mb-2">
              <span className="text-[13.5px] font-extrabold text-[#1E191D] tracking-wide">
                NONE
              </span>
            </div>
            <p className="text-[13.5px] text-[#554C53] leading-relaxed">
              We do not share your personal health data with any third parties for marketing or advertising purposes.
            </p>
          </div>

          {/* Card 3: Account Deletion */}
          <div className="bg-white rounded-[26px] p-5 border border-[#EDE4DE] shadow-[0_4px_20px_rgba(0,0,0,0.025)] hover:border-[#DFD3CA] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F8F3EA] text-[#A68853] flex items-center justify-center shrink-0">
                  <Trash2 size={22} strokeWidth={1.9} />
                </div>
                <h2 className="font-serif text-[18px] sm:text-[19px] font-medium text-[#1E191D] tracking-tight">
                  Account Deletion
                </h2>
              </div>
              <p className="text-[13.5px] text-[#554C53] leading-relaxed mb-5">
                You can permanently delete your account and all associated data at any time. This action is irreversible.
              </p>
            </div>

            {/* Prominent Dusty Terracotta / Rose Pill Button */}
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('DELETE_ACCOUNT') : setShowDeleteModal(true)}
              className="w-full py-3.5 rounded-2xl bg-[#C89B95] hover:bg-[#B88B85] active:scale-98 text-white font-serif font-medium text-[15.5px] tracking-wide shadow-xs transition-all cursor-pointer"
            >
              Delete Account
            </button>
          </div>

        </div>

        {/* Bottom Navigation Bar matching screenshot */}
        <div className="bg-white/95 backdrop-blur-md border-t border-[#EDE5DF] px-6 py-2.5 flex items-center justify-between sticky bottom-0 z-30">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('HOME') : onBack()}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] transition-colors"
          >
            <Home size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] transition-colors"
          >
            <Calendar size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('FEELING_TODAY')}
            className="flex flex-col items-center -mt-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#C89B95] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(200,155,149,0.35)] active:scale-95 transition-all">
              <Plus size={22} strokeWidth={2.6} />
            </div>
            <span className="text-[10.5px] font-medium text-[#7F777E] mt-0.5">Add</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('INSIGHTS')}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] transition-colors"
          >
            <BarChart2 size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Insights</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('PROFILE')}
            className="flex flex-col items-center gap-0.5 text-[#C89B95]"
          >
            <User size={20} strokeWidth={2.2} />
            <span className="text-[10.5px] font-bold">Profile</span>
          </button>
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full pb-2 flex justify-center bg-white">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('PROFILE'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#EDE5DF]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 text-[#B04C58]">
                  <AlertTriangle size={22} />
                  <h3 className="text-[18px] font-serif font-bold text-[#1E191D]">
                    Confirm Deletion
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F5EFEB] text-[#6E646A] flex items-center justify-center hover:bg-[#EAE2DC]"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-[13px] text-[#6E646A] leading-relaxed mb-4">
                This will delete your entire cycle tracking history, medical records, symptoms, and symptom tags. Type <strong className="text-[#1E191D]">delete</strong> below to confirm.
              </p>

              <input
                type="text"
                placeholder="type 'delete'"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full bg-[#FBF8F5] border border-[#E8DFD8] rounded-xl px-4 py-2.5 text-[14px] text-[#1E191D] outline-none mb-4"
              />

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#F0EAE5] text-[#554C53] font-semibold text-[13.5px] hover:bg-[#E5DCD6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationText.trim().toLowerCase() !== 'delete'}
                  className="flex-1 py-3 rounded-full bg-[#B04C58] hover:bg-[#993E49] disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-[13.5px] shadow-xs cursor-pointer"
                >
                  Delete Permanently
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
