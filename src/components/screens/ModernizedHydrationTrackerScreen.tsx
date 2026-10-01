import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Droplet, 
  Wifi, 
  Battery, 
  Signal,
  X,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useHydration } from '../../hooks/useHydration';
import { hydrationGuide } from '../../guides/guideRegistry';
import { useGuideProgress } from '../../guides/useGuideProgress';

interface ModernizedHydrationTrackerScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedHydrationTrackerScreen: React.FC<ModernizedHydrationTrackerScreenProps> = ({ 
  onBack,
}) => {
  const { load, saveLog, todayTotal, error: hookError, isLoading } = useHydration();
  const { isVisible: showGuide, dismiss: dismissGuide, replay: replayGuide } = useGuideProgress(hydrationGuide);
  const [currentMl, setCurrentMl] = useState<number>(0);
  const [goalMl] = useState<number>(2500);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('300');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setCurrentMl(todayTotal);
  }, [todayTotal]);

  const addWater = async (amount: number) => {
    setSaveErrorMessage(null);
    const updated = Math.min(currentMl + amount, goalMl * 2);
    setCurrentMl(updated);
    const todayStr = new Date().toISOString().slice(0, 10);
    const result = await saveLog({ logDate: todayStr, amountMl: updated, goalMl });
    if (!result.ok) {
      setSaveErrorMessage(result.errorMessage || 'Failed to save water log');
      setCurrentMl(currentMl); // revert optimistic update
    } else {
      setToastMessage(`+${amount}ml added`);
      setTimeout(() => setToastMessage(null), 2200);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0) {
      void addWater(val);
      setShowCustomModal(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const percentage = Math.min(100, Math.round((currentMl / goalMl) * 100));
  const currentL = (currentMl / 1000).toFixed(1);
  const goalL = (goalMl / 1000).toFixed(1);

  // Droplet liquid fill height percentage (clamped for natural water level)
  const fillPct = Math.max(15, Math.min(88, percentage));

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#182838] pb-28 relative overflow-x-hidden font-sans select-none">
      {/* Mobile Top Status Bar matching screenshot (9:41, icons) */}
      <div className="w-full pt-3 pb-1 px-7 flex items-center justify-between text-[#182838] text-[13px] font-semibold relative z-30 bg-[#A6D4EA]/30 backdrop-blur-xs">
        <span>9:41</span>
        <div className="flex items-center gap-2">
          <Signal size={14} strokeWidth={2.4} />
          <Wifi size={14} strokeWidth={2.4} />
          <Battery size={16} strokeWidth={2.4} />
        </div>
      </div>

      {/* Header with Fluid Pastel Marble Waves */}
      <div className="relative w-full h-[180px] overflow-hidden bg-gradient-to-b from-[#A2D3EA] via-[#E5EEF3] to-[#FCD5B5]">
        {/* Swirling Silk Marble Vector Canvas */}
        <svg
          viewBox="0 0 430 180"
          className="w-full h-full object-cover absolute inset-0"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="marbleSky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#96CFE8" />
              <stop offset="50%" stopColor="#BCDFF0" />
              <stop offset="100%" stopColor="#E2EFF7" />
            </linearGradient>

            <linearGradient id="marblePeach" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F9BC9D" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#FAD3BE" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#FCE5D6" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="marbleBlueWave" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#68BCE5" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#87D0EE" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Base Sky Blend */}
          <rect width="430" height="180" fill="url(#marbleSky)" />

          {/* Peach / Coral Marble Swirl */}
          <path
            d="M 0 40 C 90 90, 170 140, 260 110 C 340 80, 390 140, 430 120 L 430 180 L 0 180 Z"
            fill="url(#marblePeach)"
          />

          {/* Sky Blue Wave Ripple */}
          <path
            d="M 0 100 C 120 70, 220 160, 340 100 C 390 80, 420 120, 430 130 L 430 180 L 0 180 Z"
            fill="url(#marbleBlueWave)"
          />

          {/* Soft Cream Arc */}
          <path
            d="M 120 0 C 190 70, 280 90, 430 30 L 430 0 Z"
            fill="#FFF5ED"
            opacity="0.45"
          />
        </svg>

        {/* Back Arrow & Guide Replay */}
        <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-[#182838] hover:text-black p-2 transition-all active:scale-90 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={22} strokeWidth={2.4} />
          </button>
          {!showGuide && (
            <button
              type="button"
              onClick={replayGuide}
              className="text-[#182838] hover:text-black p-2 transition-all active:scale-90 cursor-pointer"
              title="Show Guide"
            >
              <HelpCircle size={20} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Centered Title & Date Header */}
        <div className="absolute bottom-5 left-0 right-0 text-center z-20 pointer-events-none">
          <h1 className="text-[26px] font-bold text-[#182838] tracking-tight">
            Hydration Tracker
          </h1>
          <p className="text-[14px] text-[#5E7082] font-medium mt-0.5">
            Today, {todayFormatted}
          </p>
        </div>
      </div>

      {/* Main Curved Card Sheet */}
      <div className="relative -mt-4 bg-[#FAF9F7] rounded-t-[40px] px-6 pt-5 pb-12 shadow-[0_-6px_24px_rgba(0,0,0,0.02)] max-w-lg mx-auto min-h-[calc(100vh-200px)] flex flex-col items-center">
        
        {/* Optional Guide Banner */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-4 bg-sky-50 border border-sky-200 text-sky-900 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs"
            >
              <div>
                <h4 className="font-bold text-sm text-sky-950">Track your daily water intake</h4>
                <p className="text-xs text-sky-800 mt-1">
                  Log your water consumption throughout the day to meet your personal hydration goal.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissGuide}
                className="text-sky-600 hover:text-sky-900 p-1 cursor-pointer"
                title="Dismiss guide"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        {(saveErrorMessage || hookError) && (
          <div className="w-full mb-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-3.5 flex items-center gap-3 text-sm font-medium">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span>{saveErrorMessage || hookError}</span>
          </div>
        )}

        {/* Central 3D Glass Water Droplet */}
        <div className="relative w-[215px] h-[265px] flex items-center justify-center my-3 select-none">
          {/* Subtle Ambient Liquid Glow */}
          <div className="absolute inset-0 bg-[#38BDF8]/18 rounded-full filter blur-xl -z-10 scale-90" />

          {/* 3D Glass Droplet SVG */}
          <svg
            viewBox="0 0 220 270"
            className="w-full h-full drop-shadow-[0_12px_28px_rgba(56,189,248,0.22)]"
          >
            <defs>
              <clipPath id="teardropClip">
                <path d="M 110 18 C 110 18, 198 115, 198 175 C 198 225, 158 258, 110 258 C 62 258, 22 225, 22 175 C 22 115, 110 18, 110 18 Z" />
              </clipPath>

              <linearGradient id="dropletWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4BBDEE" />
                <stop offset="45%" stopColor="#0B87C8" />
                <stop offset="100%" stopColor="#055B8B" />
              </linearGradient>

              <linearGradient id="topPeachReflect" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#FFF2E8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.3" />
              </linearGradient>

              <linearGradient id="glassSpecular" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Droplet Translucent Glass Shell */}
            <path
              d="M 110 18 C 110 18, 198 115, 198 175 C 198 225, 158 258, 110 258 C 62 258, 22 225, 22 175 C 22 115, 110 18, 110 18 Z"
              fill="url(#topPeachReflect)"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="2.5"
            />

            {/* Clipped Inside Water */}
            <g clipPath="url(#teardropClip)">
              <rect
                x="0"
                y={258 - (240 * fillPct) / 100}
                width="220"
                height="270"
                fill="url(#dropletWaterGrad)"
                className="transition-all duration-700 ease-out"
              />

              <path
                d={`M 0 ${258 - (240 * fillPct) / 100} Q 55 ${253 - (240 * fillPct) / 100} 110 ${258 - (240 * fillPct) / 100} T 220 ${258 - (240 * fillPct) / 100} L 220 270 L 0 270 Z`}
                fill="#38BDF8"
                opacity="0.8"
                className="transition-all duration-700 ease-out"
              />

              <path
                d={`M 0 ${260 - (240 * fillPct) / 100} Q 55 ${264 - (240 * fillPct) / 100} 110 ${260 - (240 * fillPct) / 100} T 220 ${260 - (240 * fillPct) / 100} L 220 270 L 0 270 Z`}
                fill="#E0F2FE"
                opacity="0.5"
                className="transition-all duration-700 ease-out"
              />

              <path
                d={`M 0 ${257 - (240 * fillPct) / 100} Q 55 ${252 - (240 * fillPct) / 100} 110 ${257 - (240 * fillPct) / 100} T 220 ${257 - (240 * fillPct) / 100}`}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                opacity="0.75"
                fill="none"
              />
            </g>

            {/* Outer Glass Curved Rim Highlight */}
            <path
              d="M 110 24 C 110 24, 188 116, 188 174 C 188 194, 180 214, 164 228 C 176 212, 182 194, 182 174 C 182 120, 110 34, 110 34 Z"
              fill="url(#glassSpecular)"
              opacity="0.85"
            />

            {/* Left Glass Specular Glint */}
            <path
              d="M 45 145 C 38 165, 40 190, 52 208"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />

            <ellipse 
              cx="75" 
              cy="150" 
              rx="7" 
              ry="16" 
              fill="#FFFFFF" 
              opacity="0.35" 
              transform="rotate(-22 75 150)" 
            />
          </svg>

          {/* Central Stats Text Inside Droplet */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-14 text-center pointer-events-none">
            <span className="text-[27px] font-bold text-[#0F2F42] tracking-tight leading-none drop-shadow-2xs">
              {isLoading ? '...' : `${currentL}L / ${goalL}L`}
            </span>
            <span className="text-[14px] font-medium text-[#1A4156] mt-1 tracking-wide">
              Goal
            </span>
          </div>
        </div>

        {/* 3 Frosted Quick-Add Cards */}
        <div 
          className="w-full grid grid-cols-3 gap-3.5 my-5"
          data-guide-target="hydration-add-action"
        >
          {/* 250ml Card */}
          <button
            type="button"
            onClick={() => void addWater(250)}
            className="bg-white/80 hover:bg-white border border-[#E2EAF0] backdrop-blur-md rounded-[22px] p-3.5 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(180,210,230,0.18)] cursor-pointer transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-1">
              <Droplet size={17} fill="#0284C7" strokeWidth={0} />
            </div>
            <span className="font-bold text-[14.5px] text-[#182838]">250ml</span>
            <span className="text-[14px] text-[#64748B] font-semibold leading-none mt-1">+</span>
          </button>

          {/* 500ml Card */}
          <button
            type="button"
            onClick={() => void addWater(500)}
            className="bg-white/80 hover:bg-white border border-[#E2EAF0] backdrop-blur-md rounded-[22px] p-3.5 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(180,210,230,0.18)] cursor-pointer transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-1">
              <div className="flex items-center -space-x-1">
                <Droplet size={12} fill="#0284C7" strokeWidth={0} />
                <Droplet size={16} fill="#0284C7" strokeWidth={0} />
              </div>
            </div>
            <span className="font-bold text-[14.5px] text-[#182838]">500ml</span>
            <span className="text-[14px] text-[#64748B] font-semibold leading-none mt-1">+</span>
          </button>

          {/* Custom Card */}
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="bg-white/80 hover:bg-white border border-[#E2EAF0] backdrop-blur-md rounded-[22px] p-3.5 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(180,210,230,0.18)] cursor-pointer transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#475569] flex items-center justify-center mb-1">
              <Droplet size={17} strokeWidth={2.2} />
            </div>
            <span className="font-bold text-[14.5px] text-[#182838]">Custom</span>
            <span className="text-[14px] text-[#64748B] font-semibold leading-none mt-1">+</span>
          </button>
        </div>

        {/* Pill Progress Bar */}
        <div className="w-full h-11 rounded-full border border-[#D0DFEB] bg-white/70 relative overflow-hidden flex items-center justify-between px-5 shadow-2xs">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-[#F6B69E] via-[#91CBE8] to-[#5BA5D6]"
          />

          <span className="relative z-10 text-[13px] font-semibold text-[#182838]">
            {percentage}% of Goal
          </span>

          <span className="relative z-10 text-[13px] font-medium text-[#556877]">
            Goal: {goalMl} ml
          </span>
        </div>
      </div>

      {/* Custom Water Entry Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-xl border border-[#E2E8F0]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-[#182838]">Add Water</h3>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748B] mb-1.5">
                    Amount (ml)
                  </label>
                  <input
                    type="number"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    min="50"
                    max="2000"
                    step="50"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-[16px] font-bold text-[#182838] focus:outline-none focus:border-[#38BDF8]"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-[14px] shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  Add to Today
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#182838] text-white text-[13px] font-semibold px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2"
          >
            <Check size={16} className="text-cyan-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
