import React from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  Sparkles, 
  Sliders, 
  Scale, 
  Pill, 
  ShieldCheck, 
  ArrowRight,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedWhatsNewScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedWhatsNewScreen: React.FC<ModernizedWhatsNewScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const updates = [
    {
      icon: <Sliders size={20} className="text-[#7F9EB8]" />,
      bg: 'bg-[#F2F7FA]',
      title: '5-Level Cramps Intensity Ruler',
      desc: 'Measure pelvic pain with precision from None to Severe, and log relief triggers like heating pads or electrolytes.'
    },
    {
      icon: <Scale size={20} className="text-[#3D5A80]" />,
      bg: 'bg-[#EDF2F7]',
      title: 'Body Metrics & 30-Day Trend Curve',
      desc: 'Visualize normal luteal fluid retention without guilt, featuring 30-day spline smoothing and lbs/kg toggles.'
    },
    {
      icon: <Pill size={20} className="text-[#4E7D68]" />,
      bg: 'bg-[#EEF5F1]',
      title: 'Supplement Morning & Night Stacks',
      desc: 'Separate your energizing daylight vitamins from restorative magnesium glycinate and melatonin sleep stacks.'
    },
    {
      icon: <ShieldCheck size={20} className="text-[#A05C66]" />,
      bg: 'bg-[#FDF2F4]',
      title: 'Enhanced Safe Mode & Data Ownership',
      desc: 'Zero-knowledge cloud backups and strict account deletion safeguards with permanent data scrubbing.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DF]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF8F5] pb-8 shadow-2xl overflow-x-hidden">
        
        {/* Top Header Banner with Soft Twilight Wave */}
        <div className="relative w-full h-[200px] bg-[#2F2942] overflow-hidden">
          <img 
            src="/assets/notif_twilight_waves_1788592270975.jpg" 
            alt="Header Wave" 
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
              onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
              className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>
          </div>

          {/* Center Insignia */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-6 z-20 pointer-events-none">
            <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md border border-white/35 flex items-center justify-center text-[#F6D799] mb-1 shadow-sm">
              <Sparkles size={22} />
            </div>
            <span className="text-[11.5px] font-bold tracking-[0.2em] text-white/90 uppercase">
              Release Notes
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 -mt-3 space-y-4 flex-1">
          
          <div className="text-center space-y-1">
            <span className="text-[11.5px] font-bold text-[#8A6684] uppercase tracking-wider bg-[#F3EAF2] px-3 py-0.5 rounded-full border border-[#E8DAE7]">
              Luna Version 2.4
            </span>
            <h1 className="font-serif text-[28px] sm:text-[30px] font-bold text-[#201524] tracking-tight">
              What’s New in Luna
            </h1>
            <p className="text-[13.5px] text-[#695867]">
              Designed with care for smoother tracking and calmer cycles.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-2.5">
            {updates.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="p-3.5 rounded-[22px] bg-white border border-[#EAE0D8] shadow-[0_3px_14px_rgba(0,0,0,0.02)] flex items-start gap-3.5"
              >
                <div className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#231726]">
                    {item.title}
                  </h4>
                  <p className="text-[12.5px] text-[#665764] leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
              className="w-full py-4 rounded-full bg-[#3B2241] hover:bg-[#2F1934] active:scale-[0.98] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(59,34,65,0.35)] transition-all cursor-pointer"
            >
              <span>Explore My Updates</span>
              <ArrowRight size={17} />
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

      </div>
    </div>
  );
};
