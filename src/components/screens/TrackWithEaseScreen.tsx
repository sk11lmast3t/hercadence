import React from 'react';
import { motion } from 'motion/react';
import { Droplet, Smile, Leaf } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

interface TrackWithEaseScreenProps {
  onNext: () => void;
  onBack?: () => void;
}

export const TrackWithEaseScreen: React.FC<TrackWithEaseScreenProps> = ({ onNext }) => {
  return (
    <div className="w-full min-h-full bg-[#FAF9F7] flex flex-col justify-between relative selection:bg-[#DE9E8E]/30 pb-6">
      {/* Top Organic Fluid Waves Artwork */}
      <div className="relative w-full h-[230px] overflow-hidden flex-shrink-0">
        <img
          src="/assets/personalized_waves_bg_1787988997650.jpg"
          alt="Fluid wave pattern"
          className="w-full h-full object-cover object-top"
        />
        {/* Subtle bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF9F7]/90" />
      </div>

      {/* White Inner Card with Center Dial */}
      <div className="flex-1 px-6 sm:px-8 -mt-10 relative z-10 flex flex-col items-center justify-between pb-8">
          {/* Circular 4-Phase Donut Ring Dial */}
          <div className="relative w-[210px] h-[210px] flex items-center justify-center my-auto">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <defs>
                {/* Gradients for the 4 segments */}
                <linearGradient id="segmentRose" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C9756F" />
                  <stop offset="100%" stopColor="#D99B85" />
                </linearGradient>
                <linearGradient id="segmentGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DEAB72" />
                  <stop offset="100%" stopColor="#E2C48C" />
                </linearGradient>
                <linearGradient id="segmentSage" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7B9988" />
                  <stop offset="100%" stopColor="#9AB2A4" />
                </linearGradient>
                <linearGradient id="segmentMauve" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C89685" />
                  <stop offset="100%" stopColor="#B37C78" />
                </linearGradient>
              </defs>

              {/* Segment 1: Top Arc (Menstrual / Rose) */}
              <path
                d="M 92 24 A 76 76 0 0 1 176 92"
                fill="none"
                stroke="url(#segmentRose)"
                strokeWidth="28"
                strokeLinecap="round"
              />

              {/* Segment 2: Right Arc (Follicular / Gold) */}
              <path
                d="M 176 96 A 76 76 0 0 1 104 176"
                fill="none"
                stroke="url(#segmentGold)"
                strokeWidth="28"
                strokeLinecap="round"
              />

              {/* Segment 3: Bottom Arc (Ovulation / Sage) */}
              <path
                d="M 96 176 A 76 76 0 0 1 24 104"
                fill="none"
                stroke="url(#segmentSage)"
                strokeWidth="28"
                strokeLinecap="round"
              />

              {/* Segment 4: Left Arc (Luteal / Warm Mauve) */}
              <path
                d="M 24 96 A 76 76 0 0 1 88 24"
                fill="none"
                stroke="url(#segmentMauve)"
                strokeWidth="28"
                strokeLinecap="round"
              />

              {/* Icons inside the ring segments */}
              {/* Droplets on Top Arc */}
              <g transform="translate(98, 28) scale(0.7)">
                <path
                  d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                  fill="rgba(255,255,255,0.92)"
                />
              </g>
              <g transform="translate(124, 48) scale(0.65)">
                <path
                  d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                  fill="rgba(255,255,255,0.75)"
                />
              </g>

              {/* Smiley on Right Arc */}
              <g transform="translate(142, 106) scale(0.8)">
                <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" />
                <line x1="9" y1="9" x2="9.01" y2="9" stroke="rgba(255,255,255,0.95)" strokeWidth="3" strokeLinecap="round" />
                <line x1="15" y1="9" x2="15.01" y2="9" stroke="rgba(255,255,255,0.95)" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Leaf on Bottom Arc */}
              <g transform="translate(116, 146) scale(0.75)">
                <path
                  d="M11 20A7 7 0 0 1 4 13C4 7 11 3 11 3s7 4 7 10a7 7 0 0 1-7 7z M11 3v17"
                  fill="rgba(255,255,255,0.92)"
                />
              </g>

              {/* Gentle Smiley on Left Arc */}
              <g transform="translate(46, 78) scale(0.8)">
                <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" />
                <line x1="9" y1="9" x2="9.01" y2="9" stroke="rgba(255,255,255,0.95)" strokeWidth="3" strokeLinecap="round" />
                <line x1="15" y1="9" x2="15.01" y2="9" stroke="rgba(255,255,255,0.95)" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* Typography */}
          <div className="text-center space-y-3 pt-2">
            <h1 className="font-serif text-[38px] sm:text-[42px] font-normal text-[#1E191D] leading-tight tracking-tight">
              Track with ease.
            </h1>
            <p className="text-[17px] sm:text-[18px] text-[#4A3D47] font-normal leading-snug">
              Log your symptoms and<br />moods in seconds.
            </p>
          </div>

          {/* Next Button */}
          <div className="w-full pt-8">
            <button
              onClick={onNext}
              id="track_ease_next_btn"
              className="w-full py-4.5 bg-[#543649] hover:bg-[#432939] active:scale-[0.98] text-white font-sans font-medium text-[18px] rounded-full shadow-[0_10px_28px_rgba(84,54,73,0.32)] transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
    </div>
  );
};

