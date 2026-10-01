import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Home, 
  Calendar, 
  Plus, 
  BarChart2, 
  User,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedNutritionCategoryScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

interface NutritionItem {
  id: string;
  category: 'Recipes' | 'Articles';
  time: string;
  title: string;
  description: string;
  iconType: 'smoothie' | 'article' | 'soup';
  content?: string;
}

export const ModernizedNutritionCategoryScreen: React.FC<ModernizedNutritionCategoryScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [selectedItem, setSelectedItem] = useState<NutritionItem | null>(null);

  const items: NutritionItem[] = [
    {
      id: 'n1',
      category: 'Recipes',
      time: '5 min',
      title: 'Hormone-Balancing Smoothies',
      description: 'Boost energy and mood with these blends.',
      iconType: 'smoothie',
      content: 'Learn how to combine maca root, avocado, flax seeds, and antioxidant-rich berries to support balanced progesterone and estrogen during the luteal and follicular phases.'
    },
    {
      id: 'n2',
      category: 'Articles',
      time: '10 min read',
      title: 'Foods for Each Phase',
      description: 'Optimize your diet for your cycle.',
      iconType: 'article',
      content: 'Phase-specific nutrition provides targeted micronutrients: magnesium and iron during menstruation, clean complex carbs and zinc during follicular, fiber during ovulation, and B6 with healthy fats during luteal.'
    },
    {
      id: 'n3',
      category: 'Recipes',
      time: '30 min',
      title: 'Nourishing Soups & Stews',
      description: 'Warm, comforting meals for recovery.',
      iconType: 'soup',
      content: 'Rich bone broth or ginger-lentil stews infused with turmeric and leafy greens soothe digestive tension, calm inflammation, and replenish warming bodily energy.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#D1DEC6] text-[#1E191D] pb-24 font-sans select-none flex flex-col items-center">
      {/* Container Device Card matching modernized_nutrition_category_screen.png */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col justify-between shadow-2xl relative">
        
        <div className="px-6 pt-6 pb-4">
          {/* Top Bar with Back Arrow */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-[#F5F2ED] hover:bg-[#EAE6DF] text-[#1E191D] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft size={20} strokeWidth={2.4} />
            </button>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-[32px] sm:text-[34px] font-normal text-[#1E191D] tracking-tight leading-tight mb-4">
            Nutrition for Cycle
          </h1>

          {/* Hero Botanical Culinary Illustration Card */}
          <div className="w-full rounded-[26px] bg-[#FAF8F5] border border-[#EAE3D9] overflow-hidden mb-6 shadow-2xs">
            <img
              src="/assets/nutrition_cycle_botanical_1788510548380.jpg"
              alt="Nutrition for cycle botanical culinary still life"
              className="w-full h-[200px] object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Section: DISCOVER */}
          <div className="mb-6">
            <h2 className="text-[12px] font-bold text-[#8A8580] tracking-wider uppercase mb-3 px-1">
              DISCOVER
            </h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-[24px] p-4 border border-[#ECE6DE] hover:border-[#DDD5CB] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3.5 transition-all active:scale-[0.99] cursor-pointer"
                >
                  {/* Left Icon Square */}
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.iconType === 'article' 
                      ? 'bg-[#F8E7DF] text-[#7A4B3A]' 
                      : 'bg-[#E4EBE0] text-[#3D5236]'
                  }`}>
                    {item.iconType === 'smoothie' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 11a8 8 0 0 0 16 0H4z" />
                        <line x1="12" y1="19" x2="12" y2="21" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="15" y1="4" x2="10" y2="11" />
                      </svg>
                    )}

                    {item.iconType === 'article' && (
                      <BookOpen size={22} strokeWidth={1.8} />
                    )}

                    {item.iconType === 'soup' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12a8 8 0 0 0 16 0H4z" />
                        <line x1="12" y1="19" x2="12" y2="21" />
                        <path d="M9 5c0 2 2 2 2 4" />
                        <path d="M15 5c0 2-2 2-2 4" />
                      </svg>
                    )}
                  </div>

                  {/* Content details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[12.5px] font-medium text-[#7C7570]">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11.5px] text-[#8C8580] font-medium shrink-0">
                        <Clock size={12} strokeWidth={2.2} />
                        <span>{item.time}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-[15.5px] text-[#1E191D] tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-[#6B6560] leading-tight truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar matching screenshot */}
        <div className="bg-white border-t border-[#ECE6DE] px-7 py-3 flex items-center justify-between sticky bottom-0 z-30">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('HOME') : onBack()}
            className="text-[#4E5B4B] hover:text-[#2E3B2B] transition-colors"
          >
            <Home size={22} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="text-[#8A8580] hover:text-[#1E191D] transition-colors"
          >
            <Calendar size={22} strokeWidth={2} />
          </button>

          {/* Add Center Button */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-[#52684E] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <Plus size={22} strokeWidth={2.6} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('INSIGHTS')}
            className="text-[#8A8580] hover:text-[#1E191D] transition-colors"
          >
            <BarChart2 size={22} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('PROFILE')}
            className="text-[#8A8580] hover:text-[#1E191D] transition-colors"
          >
            <User size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-5 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#EDE7DF]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-bold text-[#52684E] bg-[#E4EBE0] px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedItem.category} • {selectedItem.time}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-[#F5F2ED] text-[#6B6560] flex items-center justify-center hover:bg-[#EAE6DF]"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="font-serif text-[22px] font-bold text-[#1E191D] mb-3 leading-tight">
                {selectedItem.title}
              </h3>

              <p className="text-[14.5px] text-[#4A4348] leading-relaxed mb-6">
                {selectedItem.content}
              </p>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 rounded-full bg-[#52684E] hover:bg-[#435540] text-white font-semibold text-[14.5px] transition-all active:scale-98 shadow-sm cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
