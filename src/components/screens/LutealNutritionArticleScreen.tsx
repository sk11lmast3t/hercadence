import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface LutealNutritionArticleScreenProps {
  onBack: () => void;
}

export const LutealNutritionArticleScreen: React.FC<LutealNutritionArticleScreenProps> = ({ onBack }) => {
  const [selectedRelated, setSelectedRelated] = useState<string | null>(null);

  const relatedArticles = [
    {
      id: 'recipes',
      title: '5 Luteal Phase Recipes',
      image: '/assets/luteal_recipes_thumb_1787937767417.jpg',
      content: 'Nutrient-rich recipes including sweet potato quinoa bowls, roasted salmon with steamed broccoli, and pumpkin-sunflower seed smoothies.'
    },
    {
      id: 'progesterone',
      title: 'Understanding Progesterone',
      image: '/assets/progesterone_wellness_thumb_1787937824305.jpg',
      content: 'Progesterone supports your metabolic rate, mood equilibrium, and prepares the uterine lining for healthy hormonal harmony.'
    },
    {
      id: 'yoga',
      title: 'Gentle Yoga for PMS',
      image: '/assets/yoga_pms_thumb_1787937788166.jpg',
      content: 'Restorative yoga postures like child’s pose, supported bridge, and legs-up-the-wall to relieve pelvic tension and lower cortisol.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-32 relative overflow-x-hidden selection:bg-[#DE9E8E]/30">
      {/* Top Photographic Hero Header */}
      <div className="relative w-full h-[380px] sm:h-[420px] overflow-hidden">
        <img
          src="/assets/luteal_nutrition_tea_hero_1787937745306.jpg"
          alt="Optimizing nutrition spread with herbal tea, fruits and vegetables"
          className="w-full h-full object-cover object-center"
        />

        {/* Subtle bottom gradient to blend into white card */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FAF9F7]" />

        {/* Back Button */}
        <button
          onClick={onBack}
          id="article_back_btn"
          className="absolute top-5 left-5 z-20 w-11 h-11 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#2A2328] hover:bg-white/90 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={24} strokeWidth={2.4} />
        </button>
      </div>

      {/* Overlapping Article Content Card */}
      <main className="max-w-md mx-auto px-5 sm:px-6 -mt-20 relative z-10 space-y-6">
        <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#EFE8E3] shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
          {/* Article Title */}
          <h1 className="font-serif text-[32px] sm:text-[36px] font-normal text-[#1E191D] tracking-tight leading-[1.18]">
            Optimizing Nutrition for Your Luteal Phase
          </h1>

          {/* Divider */}
          <div className="h-px bg-[#ECE5DE]" />

          {/* Article Paragraph */}
          <div className="text-[14px] leading-[1.65] text-[#3E343C] space-y-3 font-normal">
            <p>
              The luteal phase, following ovulation and preceding menstruation, requires specific nutritional support. Focus on complex carbohydrates, magnesium-rich foods like leafy greens and nuts, and omega-3 fatty acids... Become flavours with moderately for achievement and have healthy and nutrient styles.
            </p>
            <p className="text-[#5D505B] text-[13.5px]">
              During this window, rising progesterone naturally raises your basal metabolic rate by 150–300 calories per day. Emphasize roasted root vegetables, warm herbal infusions like peppermint and chamomile, raw cacao, and healthy fats from avocado and walnuts to maintain steady blood glucose and balanced mood.
            </p>
          </div>

          {/* Related Articles Section */}
          <div className="pt-3 space-y-3">
            <h2 className="font-bold text-[16px] text-[#1E191D] tracking-tight">
              Related Articles
            </h2>

            {/* Horizontal Scroll Cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => setSelectedRelated(rel.id)}
                  className="flex-shrink-0 w-[145px] sm:w-[155px] bg-[#F5F2EE] rounded-[22px] overflow-hidden border border-[#EAE2DC] hover:border-[#D8CDC5] transition-all cursor-pointer group shadow-xs"
                >
                  <div className="p-3 pb-2">
                    <h3 className="text-[13px] font-semibold text-[#1E191D] leading-snug line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>
                  <div className="h-24 w-full overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modal for Related Article Quick View */}
      {selectedRelated && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          {(() => {
            const item = relatedArticles.find((a) => a.id === selectedRelated);
            if (!item) return null;
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EDE4DE] shadow-2xl space-y-4"
              >
                <div className="rounded-2xl overflow-hidden h-36">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1E191D]">{item.title}</h3>
                <p className="text-xs text-[#5D505B] leading-relaxed">{item.content}</p>
                <button
                  onClick={() => setSelectedRelated(null)}
                  className="w-full py-2.5 bg-[#523446] text-white text-xs font-semibold rounded-full hover:bg-[#412737] transition-all"
                >
                  Close
                </button>
              </motion.div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

