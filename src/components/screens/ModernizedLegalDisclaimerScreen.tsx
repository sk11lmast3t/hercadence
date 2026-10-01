import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  ShieldAlert, 
  Stethoscope, 
  AlertTriangle, 
  Lock, 
  Check, 
  FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedLegalDisclaimerScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedLegalDisclaimerScreen: React.FC<ModernizedLegalDisclaimerScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DF]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF8F5] pb-8 shadow-2xl overflow-x-hidden">
        
        {/* Top Header Banner with Soft Ribbons */}
        <div className="relative w-full h-[180px] bg-[#3B2844] overflow-hidden">
          <img 
            src="/assets/luna_wellness_purple_header_1788590868601.jpg" 
            alt="Silk Ribbon Banner" 
            className="w-full h-full object-cover opacity-85 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FAF8F5]" />

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
          <div className="absolute top-11 left-6 z-20">
            <button
              type="button"
              onClick={onBack || (() => onNavigate && onNavigate('PROFILE'))}
              className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>
          </div>

          {/* Insignia */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 z-20 pointer-events-none">
            <div className="w-8 h-8 text-[#E8D0E2] mb-1 flex items-center justify-center">
              <FileText size={24} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] font-bold tracking-[0.22em] text-[#F3E6F0] uppercase">
              Legal &amp; Clinical Safety
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 -mt-3 space-y-4 flex-1 overflow-y-auto">
          
          <div className="text-center space-y-1">
            <h1 className="font-serif text-[26px] sm:text-[28px] font-bold text-[#201524] tracking-tight">
              Clinical Disclaimer &amp; Terms
            </h1>
            <p className="text-[13px] text-[#695867]">
              Last updated: October 2024 • Version 2.4
            </p>
          </div>

          {/* Notice 1: Medical Advisory */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#ECE2DB] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#422247]">
              <Stethoscope size={18} />
              <h3 className="text-[14.5px] font-bold text-[#231526]">
                Not Medical Advice or Diagnosis
              </h3>
            </div>
            <p className="text-[12.5px] text-[#635461] leading-relaxed">
              HerCadence is designed as a cycle tracking utility for personal awareness. Content, insights, and cycle projections provided in the app do not constitute medical diagnosis, treatment, or professional clinical advice. Always consult a qualified OB/GYN or medical practitioner for health concerns.
            </p>
          </div>

          {/* Notice 2: Contraception Warning */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#F1D6DC] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#B04C58]">
              <AlertTriangle size={18} />
              <h3 className="text-[14.5px] font-bold text-[#2E161C]">
                Not a Form of Contraception
              </h3>
            </div>
            <p className="text-[12.5px] text-[#635461] leading-relaxed">
              Fertility window projections, luteal temperature curves, and ovulation predictions are statistical estimations. HerCadence is not approved as an independent birth control device and must never be utilized as the sole method of contraception or family planning.
            </p>
          </div>

          {/* Notice 3: Emergency Situations */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#ECE2DB] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#C86D7F]">
              <ShieldAlert size={18} />
              <h3 className="text-[14.5px] font-bold text-[#231526]">
                Acute Emergencies
              </h3>
            </div>
            <p className="text-[12.5px] text-[#635461] leading-relaxed">
              If you experience sudden severe unilateral pelvic pain, abnormal heavy hemorrhaging, high fever, or suspect an ectopic pregnancy, seek emergency medical care immediately (call 911 or visit the nearest emergency hospital).
            </p>
          </div>

          {/* Notice 4: Privacy & Ownership */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#ECE2DB] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#3D6B52]">
              <Lock size={18} />
              <h3 className="text-[14.5px] font-bold text-[#231526]">
                Zero-Knowledge Privacy Commitment
              </h3>
            </div>
            <p className="text-[12.5px] text-[#635461] leading-relaxed">
              Your biometric health data, cycle logs, and notes are encrypted. We never sell, lease, or monetize your reproductive data to third-party data brokers, insurers, or advertising platforms.
            </p>
          </div>

          {/* Acknowledge Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                showToast('Clinical terms acknowledged');
                setTimeout(() => {
                  if (onBack) onBack();
                  else if (onNavigate) onNavigate('PROFILE');
                }, 800);
              }}
              className="w-full py-3.5 rounded-full bg-[#3B2241] hover:bg-[#2F1934] active:scale-[0.98] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>I Understand &amp; Acknowledge</span>
            </button>
          </div>

        </div>

        {/* Bottom iOS Bar */}
        <div className="pt-4 pb-2 flex justify-center">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
            >
              <Check size={14} className="text-[#8BE1A5]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
