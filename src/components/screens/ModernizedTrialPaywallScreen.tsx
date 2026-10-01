import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Star, 
  Lock,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'motion/react';
import { useClerk } from '@clerk/clerk-react';
import { AppView } from '../../types';
import { useCycle } from '../../context/CycleContext';

interface ModernizedTrialPaywallScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
  onSuccess?: () => void;
}

export const ModernizedTrialPaywallScreen: React.FC<ModernizedTrialPaywallScreenProps> = ({
  onBack,
  onNavigate,
  onSuccess
}) => {
  const { signOut } = useClerk();
  const { updateSettings } = useCycle();
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isTrialStarted, setIsTrialStarted] = useState<boolean>(false);

  const handleStartTrial = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsTrialStarted(true);
      updateSettings({ isPremium: true });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else if (onNavigate) onNavigate('HOME');
      }, 1500);
    }, 1200);
  };

  const premiumFeatures = [
    {
      title: 'Hormone & Phase Rhythm Guidance',
      desc: 'Evidence-based guidance on cravings, PMS relief, mood shifts, and phase nutrition.'
    },
    {
      title: 'Cycle-Synced Fitness & Meal Plans',
      desc: 'Phase-specific workout intensity protocols and hormone-nourishing nutrition recipes.'
    },
    {
      title: 'Continuous Wearable & Biometric Sync',
      desc: 'Auto-import nocturnal BBT, resting HR, and sleep staging from Health Connect & Oura.'
    },
    {
      title: 'Comprehensive Clinical PDF Reports',
      desc: 'Export full cycle histories and physician-ready summaries for your OB/GYN.'
    },
    {
      title: 'Private Partner Care Sync',
      desc: 'Share cycle phases, comfort levels, and fertility windows seamlessly with your partner.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1E1124] text-white flex justify-center selection:bg-[#4D285B]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#1E1124] pb-8 shadow-2xl overflow-x-hidden">
        
        {/* Luxury Plum & Radiant Gold Header Banner */}
        <div className="relative w-full h-[230px] bg-[#2E1638] overflow-hidden">
          <img 
            src="/assets/luxury_gold_plum_waves_1788592307851.jpg" 
            alt="Luxury Waves" 
            className="w-full h-full object-cover opacity-85 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#1E1124]" />

          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-white/90 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41</span>
            <div className="flex items-center space-x-1.5 text-white/90">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Close Button */}
          <div className="absolute top-11 right-6 z-20">
            <button
              type="button"
              onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
            >
              <X size={17} strokeWidth={2.2} />
            </button>
          </div>

          {/* Center Luxury Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 z-20 pointer-events-none">
            <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37]/20 via-[#F3E5AB]/30 to-[#D4AF37]/20 border border-[#E5C158]/50 backdrop-blur-md flex items-center gap-1.5 shadow-lg mb-2">
              <Sparkles size={14} className="text-[#F6DC7A]" />
              <span className="text-[11.5px] font-bold tracking-[0.2em] uppercase text-[#FCEEB5]">
                LUNA PREMIUM
              </span>
            </div>
            <h1 className="font-serif text-[28px] sm:text-[30px] font-medium text-white tracking-tight text-center px-4 leading-tight">
              Unlock Full Body Harmony
            </h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 -mt-2 space-y-4 flex-1">
          
          {/* Plan Toggle Selector */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Annual */}
            <div
              onClick={() => setBillingCycle('annual')}
              className={`p-3.5 rounded-[22px] border transition-all cursor-pointer relative overflow-hidden ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-b from-[#3E1E49] to-[#2E1537] border-[#E5C158] shadow-[0_4px_20px_rgba(229,193,88,0.2)] ring-1 ring-[#E5C158]/50'
                  : 'bg-[#291632]/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="absolute top-2 right-2 bg-[#E5C158] text-[#1E1124] text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Save 48%
              </div>
              <div className="text-[12px] font-bold text-[#DBC6D6] uppercase tracking-wider">
                Annual Plan
              </div>
              <div className="text-[20px] font-bold text-white mt-0.5">
                $3.33 <span className="text-[12px] font-normal text-white/70">/mo</span>
              </div>
              <div className="text-[11px] text-[#A68EA0] mt-0.5">
                $39.99 billed yearly after 7-day trial
              </div>
            </div>

            {/* Monthly */}
            <div
              onClick={() => setBillingCycle('monthly')}
              className={`p-3.5 rounded-[22px] border transition-all cursor-pointer relative overflow-hidden ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-b from-[#3E1E49] to-[#2E1537] border-[#E5C158] shadow-[0_4px_20px_rgba(229,193,88,0.2)] ring-1 ring-[#E5C158]/50'
                  : 'bg-[#291632]/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-[12px] font-bold text-[#DBC6D6] uppercase tracking-wider">
                Monthly Plan
              </div>
              <div className="text-[20px] font-bold text-white mt-0.5">
                $6.99 <span className="text-[12px] font-normal text-white/70">/mo</span>
              </div>
              <div className="text-[11px] text-[#A68EA0] mt-0.5">
                Billed monthly. Cancel anytime easily.
              </div>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="bg-[#2B1633]/90 rounded-[26px] p-4.5 border border-white/10 space-y-3 shadow-md">
            <span className="text-[11px] font-bold text-[#E5C158] uppercase tracking-widest block">
              Everything Included in Trial
            </span>

            {premiumFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E5C158]/20 border border-[#E5C158]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="text-[#F6DC7A]" strokeWidth={2.6} />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-white leading-tight">
                    {feat.title}
                  </div>
                  <div className="text-[11.5px] text-[#BDA5B7] leading-tight mt-0.5">
                    {feat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Quote */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="flex gap-0.5 text-[#E5C158] shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} fill="#E5C158" />
              ))}
            </div>
            <p className="text-[11.5px] text-[#E0D2DC] italic leading-tight">
              "HerCadence's clinical PDF exports gave my gynecologist the exact hormone patterns we needed."
            </p>
          </div>

          {/* Main Action Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleStartTrial}
              disabled={isProcessing || isTrialStarted}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#E5C158] via-[#F4D77A] to-[#D4AF37] text-[#221226] text-[16px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_25px_rgba(229,193,88,0.4)] active:scale-[0.98] transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span>Activating Your Free Trial...</span>
              ) : isTrialStarted ? (
                <span>Welcome to HerCadence Premium! ✨</span>
              ) : (
                <>
                  <span>Start 7-Day Free Trial ($0 Today)</span>
                  <ArrowRight size={18} strokeWidth={2.4} />
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-[#A68FA1] flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-[#E5C158]" />
              <span>No charge today • Reminder email sent 2 days prior</span>
            </div>
          </div>

          {/* Sublinks */}
          <div className="flex items-center justify-center gap-4 text-[11.5px] text-[#A68FA1] pt-1">
            <button 
              type="button" 
              onClick={() => onNavigate && onNavigate('TERMS_CLINICAL_DISCLAIMER')}
              className="hover:underline"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button 
              type="button" 
              onClick={() => onNavigate && onNavigate('DATA_PRIVACY_SECURITY')}
              className="hover:underline"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              type="button" 
              onClick={() => signOut()}
              className="hover:underline text-rose-300/80 hover:text-rose-200"
            >
              Sign Out
            </button>
          </div>

        </div>

        {/* Bottom iOS Bar */}
        <div className="pt-4 pb-2 flex justify-center">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
            className="w-36 h-1.5 bg-white/40 hover:bg-white/70 rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

      </div>
    </div>
  );
};
