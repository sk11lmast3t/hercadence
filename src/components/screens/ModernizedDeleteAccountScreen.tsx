import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  AlertTriangle, 
  Check, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';

interface ModernizedDeleteAccountScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
  onAccountDeleted?: () => void;
}

export const ModernizedDeleteAccountScreen: React.FC<ModernizedDeleteAccountScreenProps> = ({
  onBack,
  onNavigate,
  onAccountDeleted
}) => {
  const { isDeleting, error: deleteError, deleted, deleteAccount } = useDeleteAccount();
  const [confirmationInput, setConfirmationInput] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Hook expects the typed phrase "DELETE_MY_ACCOUNT"
  const isConfirmed = confirmationInput.trim() === 'DELETE_MY_ACCOUNT';

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;
    try {
      await deleteAccount();
      setShowSuccessModal(true);
      onAccountDeleted?.();
    } catch {
      // deleteError is exposed by the hook for UI rendering
    }
  };


  return (
    <div className="min-h-screen bg-white text-[#221B20] flex justify-center selection:bg-[#EAE4DC]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-white pb-8 shadow-2xl overflow-x-hidden">
        
        {/* Top Header with Deep Plum/Mauve Silk Waves & Luna Wellness Branding */}
        <div className="relative w-full h-[220px] bg-[#3B1E48] overflow-hidden">
          <img 
            src="/assets/luna_wellness_purple_header_1788590868601.jpg" 
            alt="Luna Wellness Plum Silk Wave" 
            className="w-full h-full object-cover opacity-90 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/90" />

          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-white/90 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41</span>
            <div className="flex items-center space-x-1.5 text-white/90">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Back Button */}
          {onBack && (
            <div className="absolute top-11 left-6 z-20">
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/50 active:scale-95 transition-all shadow-xs"
              >
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>
            </div>
          )}

          {/* Lotus Icon & LUNA WELLNESS Brand matching screenshot */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 z-20">
            {/* Elegant Lotus SVG Flower */}
            <div className="w-10 h-10 text-[#714E69] mb-1.5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-9 h-9 text-[#5E365E]">
                <path d="M12 3C12 3 8 7.5 8 13C8 16 10 18.5 12 19C14 18.5 16 16 16 13C16 7.5 12 3 12 3Z" fill="#885A7E" fillOpacity="0.25" />
                <path d="M12 9C10 9 5 11 4 14C3 17 5 18.5 7 19C9.5 19.5 11.5 18 12 17.5" />
                <path d="M12 9C14 9 19 11 20 14C21 17 19 18.5 17 19C14.5 19.5 12.5 18 12 17.5" />
                <path d="M12 19V21M9 20.5L15 20.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[13px] font-bold tracking-[0.22em] text-[#422247] uppercase">
              Luna Wellness
            </span>
          </div>
        </div>

        {/* Floating Modal Card matching screenshot */}
        <div className="px-5 -mt-6 z-20 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full bg-white rounded-[32px] p-7 border border-[#F0E6EE] shadow-[0_12px_45px_rgba(59,30,72,0.09)] space-y-6"
          >
            {/* Title */}
            <h1 className="text-center font-bold text-[24px] sm:text-[26px] text-[#291435] tracking-tight">
              Delete Account &amp; Data
            </h1>

            {/* Warning Body */}
            <p className="text-center text-[15px] leading-relaxed text-[#3E2B43] font-normal px-1">
              This action is permanent and cannot be undone. All your cycle data, personal insights, and wellness history will be erased forever.
            </p>

            {/* Confirmation Input */}
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type 'DELETE_MY_ACCOUNT' to confirm"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-2xl border text-[15px] font-medium text-center transition-all focus:outline-none ${
                    isConfirmed 
                      ? 'border-[#943F5B] bg-[#FFF5F7] text-[#943F5B]' 
                      : 'border-[#E6D4DF] bg-white text-[#291435] placeholder-[#A0929D]'
                  }`}
                />
                {isConfirmed && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#943F5B]">
                    <Check size={18} strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <p className="text-[11.5px] text-center text-[#8D7B89]">
                Type exactly: <span className="font-bold text-[#4B224F] font-mono">DELETE_MY_ACCOUNT</span>
              </p>
            </div>

            {/* Action Buttons matching screenshot */}
            <div className="flex items-center gap-3 pt-2">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onBack || (() => onNavigate && onNavigate('PROFILE'))}
                className="flex-1 py-3 px-3 rounded-full border border-[#482855]/30 text-[#42264F] text-[13.5px] font-semibold hover:bg-[#FDF9FB] active:scale-[0.98] transition-all text-center whitespace-nowrap"
              >
                Cancel &amp; Keep Data
              </button>

              {/* Delete Forever Button */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                className={`flex-1 py-3 px-3 rounded-full text-white text-[13.5px] font-semibold transition-all text-center whitespace-nowrap ${
                  isConfirmed 
                    ? 'bg-[#432350] hover:bg-[#371A43] shadow-[0_6px_22px_rgba(67,35,80,0.45)] active:scale-[0.98] cursor-pointer' 
                    : 'bg-[#765D7F]/40 cursor-not-allowed text-white/70 shadow-none'
                }`}
              >
                {isDeleting ? 'Erasing...' : 'Delete Account Forever'}
              </button>
            </div>

            {/* Error message from hook */}
            {deleteError && (
              <p className="text-center text-[12px] text-red-600 mt-1">{deleteError}</p>
            )}

          </motion.div>

          {/* Privacy Note */}
          <div className="mt-8 text-center text-[12px] text-[#867584] flex items-center justify-center gap-1.5">
            <ShieldAlert size={14} className="text-[#867584]" />
            <span>GDPR &amp; HIPAA-compliant irreversible cryptographic erasure</span>
          </div>
        </div>

        {/* iOS Home Indicator bar matching screenshot */}
        <div className="pt-8 pb-2 flex justify-center">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-[340px] bg-white rounded-3xl p-6 text-center shadow-2xl border border-[#EDE5DF]"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F6EEF5] text-[#4A2251] flex items-center justify-center mb-4">
                  <Check size={28} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-[20px] text-[#291435] mb-2">
                  Data Erased Successfully
                </h3>
                <p className="text-[13.5px] text-[#695867] mb-6 leading-relaxed">
                  Your Luna account, local caches, and synchronized cloud metrics have been permanently cleared.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (onNavigate) onNavigate('ONBOARDING_WELCOME');
                  }}
                  className="w-full py-3 rounded-full bg-[#432350] text-white text-[14px] font-bold shadow-md active:scale-95"
                >
                  Return to Welcome
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
