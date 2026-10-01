import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Share2, Download, X } from 'lucide-react';

interface ExportSuccessScreenProps {
  onDone: () => void;
  reportTitle?: string;
}

export const ExportSuccessScreen: React.FC<ExportSuccessScreenProps> = ({ 
  onDone,
  reportTitle = 'Cycle_Health_Summary_2026.pdf'
}) => {
  const [showShareToast, setShowShareToast] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Cycle Health Summary',
          text: 'Here is my cycle health summary report for my doctor.',
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to in-app toast
      }
    }
    // Web fallback
    setShowShareToast(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Fullscreen Fluid Organic Waves Background matching screenshot */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/export_success_wavy_bg_1788418525710.jpg"
          alt="Fluid purple mauve waves background"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft overlay gradient to ensure high readability */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      </div>

      {/* Centered Floating Frosted Glass Card matching modernized_export_success_screen.png */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-[340px] rounded-[36px] bg-[#FAF6F4]/80 backdrop-blur-2xl border border-white/60 p-7 sm:p-8 shadow-[0_20px_50px_rgba(45,30,55,0.25)] flex flex-col items-center text-center"
      >
        {/* PDF Document Icon matching screenshot */}
        <div className="relative mb-6 drop-shadow-md">
          <div className="relative w-24 h-28 bg-white rounded-xl border border-[#EDE4E0] shadow-sm flex items-center justify-center overflow-hidden">
            {/* Folded Top-Right Corner */}
            <div className="absolute top-0 right-0 w-7 h-7 bg-[#EFE9E6] rounded-bl-lg shadow-2xs">
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[28px] border-t-white border-l-[28px] border-l-transparent" />
            </div>

            {/* Red PDF Header Label Badge */}
            <div className="absolute top-2 left-2 bg-[#E53935] text-white text-[11px] font-bold px-2 py-0.5 rounded-sm tracking-wider shadow-2xs">
              PDF
            </div>

            {/* Red Vector Ribbon / Squiggle Emblem */}
            <svg 
              viewBox="0 0 64 64" 
              className="w-12 h-12 mt-3 text-[#E53935]" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 46 C 18 36, 26 24, 32 20 C 35 18, 38 20, 36 26 C 34 32, 28 40, 24 44 C 20 48, 34 50, 44 42" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-[20px] sm:text-[22px] font-medium text-[#1E191D] tracking-tight leading-snug mb-7 px-1">
          Your health report has been successfully exported.
        </h2>

        {/* Deep Plum Pill Button: Share Report */}
        <button
          type="button"
          onClick={handleShare}
          id="export_share_report_btn"
          className="w-full py-4 px-6 rounded-full bg-[#483E62] hover:bg-[#3D3354] active:scale-[0.98] text-white text-[16px] font-medium tracking-wide shadow-[0_8px_20px_rgba(72,62,98,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          <span>Share Report</span>
        </button>
      </motion.div>

      {/* Done Text Button underneath */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        type="button"
        onClick={onDone}
        id="export_success_done_btn"
        className="relative z-10 mt-6 text-[17px] font-semibold text-[#3D3354] hover:text-[#251E33] active:scale-95 py-2 px-6 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-2xs transition-all cursor-pointer"
      >
        Done
      </motion.button>

      {/* Fallback Share Modal / Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 z-30 max-w-sm w-full mx-auto px-4"
          >
            <div className="bg-[#2A2333] text-white rounded-2xl p-4 shadow-xl border border-white/10 flex items-center justify-between gap-3">
              <div className="text-left overflow-hidden">
                <p className="text-xs font-semibold text-white/90 truncate">{reportTitle}</p>
                <p className="text-[11px] text-white/60">Ready to print or send to doctor</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => setShowShareToast(false)}
                  className="p-1.5 text-white/50 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
