import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  Star, 
  Heart, 
  MessageSquare, 
  Send, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedAppReviewScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedAppReviewScreen: React.FC<ModernizedAppReviewScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    showToast('Feedback received. Thank you for helping us grow!');
    setTimeout(() => {
      if (onBack) onBack();
      else if (onNavigate) onNavigate('HOME');
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DF]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF8F5] pb-8 shadow-2xl overflow-x-hidden">
        
        {/* Top Twilight / Mauve Header Banner */}
        <div className="relative w-full h-[190px] bg-[#3B2844] overflow-hidden">
          <img 
            src="/assets/notif_twilight_waves_1788592270975.jpg" 
            alt="Twilight Waves" 
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

          {/* Center Heart Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 z-20 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-[#FAD1D8] mb-1">
              <Heart size={20} fill="#FAD1D8" />
            </div>
            <span className="text-[12px] font-bold tracking-[0.2em] text-[#F3E6F0] uppercase">
              Community &amp; Trust
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 -mt-3 space-y-5 flex-1 flex flex-col justify-center">
          
          <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#ECE2DB] shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5">
            
            <div className="text-center space-y-1.5">
              <h2 className="font-serif text-[26px] font-bold text-[#251528] tracking-tight">
                Enjoying Luna Wellness?
              </h2>
              <p className="text-[13.5px] text-[#695767] leading-relaxed">
                Your feedback directly influences our medical advisory algorithms and privacy features.
              </p>
            </div>

            {/* 5-Star Interactive Rating */}
            <div className="flex justify-center items-center gap-2.5 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95"
                >
                  <Star 
                    size={34} 
                    className={`transition-colors ${
                      star <= rating 
                        ? 'text-[#F3B748] fill-[#F3B748]' 
                        : 'text-[#E5D9E2] fill-[#FAF6F9]'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {/* Dynamic Message based on star count */}
            <div className="text-center text-[13px] font-semibold text-[#422247]">
              {rating === 5 && '⭐️ Fantastic! You make our team smile.'}
              {rating === 4 && '✨ Thank you! We appreciate your support.'}
              {rating === 3 && '🌱 Thank you. Help us improve your experience.'}
              {rating <= 2 && '🙏 We are listening. Tell us what fell short.'}
            </div>

            {/* Action flow for 5 stars vs lower stars */}
            {rating >= 4 ? (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Opening Apple App Store review page...');
                  }}
                  className="w-full py-3.5 rounded-full bg-[#422247] hover:bg-[#341838] active:scale-[0.98] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(66,34,71,0.35)] transition-all cursor-pointer"
                >
                  <span>Leave App Store Review</span>
                  <ExternalLink size={16} />
                </button>

                <p className="text-[11.5px] text-[#7A6979] text-center">
                  Takes less than 30 seconds and helps other women discover non-invasive hormonal tracking.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3 pt-1">
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="What can we do to make Luna better for you?..."
                  className="w-full p-3.5 rounded-2xl border border-[#E3D7E0] bg-[#FAF8FA] text-[13.5px] text-[#2B1733] focus:outline-none focus:border-[#422247]"
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#422247] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Send size={15} />
                  <span>Send Direct Feedback</span>
                </button>
              </form>
            )}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
                className="text-[12.5px] font-semibold text-[#867584] hover:text-[#2E1832] transition-colors"
              >
                Maybe Later
              </button>
            </div>

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
