import React, { useState } from 'react';
import { 
  Play, 
  Signal, 
  Wifi, 
  Battery, 
  X, 
  ChevronRight, 
  Volume2, 
  RotateCcw, 
  Pause,
  ChevronLeft
} from 'lucide-react';

interface DiscoveryVideoLibraryScreenProps {
  onBack: () => void;
}

interface ArticleItem {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  image: string;
  content: string[];
}

interface CategoryCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  tag: string;
  image: string;
  bgGradient: string;
  colorTheme: string;
  details: string;
}

export const DiscoveryVideoLibraryScreen: React.FC<DiscoveryVideoLibraryScreenProps> = ({ onBack }) => {
  const [isPlayingHeroVideo, setIsPlayingHeroVideo] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryCard | null>(null);

  const categories: CategoryCard[] = [
    {
      id: 'nutrition_pcos',
      title: 'Nutrition for PCOS',
      subtitle: 'Nourish your body to manage symptoms',
      badge: 'Premium',
      tag: '8 videos & articles',
      image: '/assets/category_nutrition_pcos_1788023718517.jpg',
      bgGradient: 'bg-[#C78278]',
      colorTheme: '#C78278',
      details: 'Comprehensive whole-food nutrition guides, blood sugar stabilization protocols, inositol supplementation science, and gentle cycle-supportive recipes.'
    },
    {
      id: 'cycle_movement',
      title: 'Cycle-Synced Movement',
      subtitle: 'Workouts aligned with your energy levels',
      badge: 'Premium',
      tag: '12 videos',
      image: '/assets/category_yoga_movement_1788023732115.jpg',
      bgGradient: 'bg-[#829989]',
      colorTheme: '#829989',
      details: 'Follicular HIIT & strength training, luteal yin yoga, and restorative menstrual stretching designed to optimize hormone balance.'
    },
    {
      id: 'mindfulness_stress',
      title: 'Mindfulness & Stress',
      subtitle: 'Techniques to find your calm',
      badge: 'Premium',
      tag: '5 guided sessions',
      image: '/assets/category_mindfulness_breath_1788023746773.jpg',
      bgGradient: 'bg-[#5F8274]',
      colorTheme: '#5F8274',
      details: 'Somatic grounding, diaphragmatic breathwork, and guided meditation to regulate nervous system tone and cortisol spikes.'
    }
  ];

  const latestArticles: ArticleItem[] = [
    {
      id: 'luteal_understanding',
      title: 'Understanding Your Luteal Phase',
      subtitle: 'What to expect and how to support your body',
      readTime: '4 min read',
      image: '/assets/video_hero_balance_meditation_1788023702575.jpg',
      content: [
        'The luteal phase begins right after ovulation and lasts until the first day of your next period—typically 12 to 14 days.',
        'During this phase, progesterone becomes the dominant hormone, slightly elevating your basal body temperature and metabolic caloric expenditure.',
        'Support your progesterone synthesis with magnesium-rich foods, complex carbohydrates like roasted squash, and calming evening routines.'
      ]
    },
    {
      id: 'mood_recipes',
      title: '5 Mood-Boosting Recipes',
      subtitle: 'Simple, delicious, and hormone-friendly',
      readTime: '3 min read',
      image: '/assets/article_mood_recipes_thumb_1788023760344.jpg',
      content: [
        'Warm Quinoa & Roasted Veggie Bowl: Rich in B-vitamins and tryptophan for serotonin production.',
        'Pumpkin Seed & Dark Chocolate Bark: Packed with zinc and magnesium for premenstrual ease.',
        'Golden Turmeric Chamomile Tonic: Natural anti-inflammatory elixir to soothe smooth muscle cramping.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Header with iOS Status Bar and Centered Title */}
        <div className="pt-3 px-6 pb-2 flex-shrink-0">
          {/* iOS Status Bar */}
          <div className="flex items-center justify-between text-[#1E191D] text-xs font-semibold select-none mb-3">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal size={13} strokeWidth={2.4} />
              <Wifi size={13} strokeWidth={2.4} />
              <Battery size={15} strokeWidth={2.4} />
            </div>
          </div>

          {/* Centered Navigation Title */}
          <div className="relative flex items-center justify-center py-1">
            <button
              onClick={onBack}
              className="absolute left-0 p-1 -ml-1 text-[#1E191D] hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="font-sans text-[18px] sm:text-[19px] font-bold text-[#1E191D] tracking-tight">
              Discovery & Video
            </h1>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 px-4 sm:px-5 pt-2 pb-6 flex flex-col justify-between space-y-5 overflow-y-auto no-scrollbar">
          
          {/* Featured Video Section */}
          <div className="space-y-3">
            <div 
              onClick={() => setIsPlayingHeroVideo(true)}
              className="relative w-full h-[190px] sm:h-[200px] rounded-[28px] overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-[#EDE6E1] cursor-pointer group"
            >
              <img
                src="/assets/video_hero_balance_meditation_1788023702575.jpg"
                alt="Finding Balance: Guided Meditation"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              
              {/* Centered Translucent Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-all text-[#1E191D] pl-1">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Video Title and Metadata */}
            <div className="px-0.5 space-y-1">
              <h2 
                onClick={() => setIsPlayingHeroVideo(true)}
                className="text-[17px] sm:text-[18px] font-bold text-[#1E191D] leading-snug tracking-tight hover:text-[#543649] transition-colors cursor-pointer"
              >
                Finding Balance: A Guided Meditation for Hormonal Harmony
              </h2>
              <p className="text-[13px] text-[#7A6C74] font-medium">
                15 min • Cycle Phase: Luteal
              </p>
            </div>
          </div>

          {/* Featured Categories Carousel */}
          <div className="space-y-2.5">
            <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1E191D] px-0.5 tracking-tight">
              Featured Categories
            </h3>

            {/* Horizontal Scrolling Row */}
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1 snap-x">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="w-[124px] sm:w-[130px] rounded-[24px] overflow-hidden flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#EDE6E1] cursor-pointer group flex flex-col snap-start"
                >
                  {/* Top Image Card with Premium Badge */}
                  <div className="relative h-[110px] w-full bg-white overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Golden Premium Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#E5D7B7]/90 backdrop-blur-xs text-[#5C4524] text-[10px] font-semibold tracking-tight shadow-xs">
                      {cat.badge}
                    </div>
                  </div>

                  {/* Bottom Color Block */}
                  <div className={`${cat.bgGradient} p-2.5 sm:p-3 flex-1 flex flex-col justify-between text-white text-left space-y-1.5`}>
                    <div>
                      <h4 className="text-[12.5px] sm:text-[13px] font-bold leading-tight drop-shadow-2xs">
                        {cat.title}
                      </h4>
                      <p className="text-[10px] text-white/90 leading-tight mt-0.5 line-clamp-2">
                        {cat.subtitle}
                      </p>
                    </div>

                    <div className="pt-1">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-black/15 text-[9.5px] font-medium text-white/95">
                        {cat.tag}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Articles List */}
          <div className="space-y-2.5">
            <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1E191D] px-0.5 tracking-tight">
              Latest Articles
            </h3>

            <div className="space-y-2.5">
              {latestArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[22px] p-2.5 sm:p-3 border border-[#EDE6E1] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5 transition-all cursor-pointer group"
                >
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover flex-shrink-0 border border-[#EDE6E1]"
                  />
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="text-[14px] sm:text-[15px] font-bold text-[#1E191D] leading-snug truncate group-hover:text-[#543649] transition-colors">
                      {art.title}
                    </h4>
                    <p className="text-[12px] text-[#7A6C74] font-medium truncate mt-0.5">
                      {art.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {isPlayingHeroVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF9F7] rounded-[36px] max-w-sm w-full overflow-hidden border border-[#EDE6E1] shadow-2xl space-y-4">
            <div className="relative h-56 w-full bg-black">
              <img
                src="/assets/video_hero_balance_meditation_1788023702575.jpg"
                alt="Meditation video playing"
                className="w-full h-full object-cover opacity-85"
              />
              <button
                onClick={() => setIsPlayingHeroVideo(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 text-[#1E191D] flex items-center justify-center shadow-lg">
                  <Pause size={24} fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h3 className="text-base font-bold text-[#1E191D]">
                  Finding Balance: A Guided Meditation for Hormonal Harmony
                </h3>
                <p className="text-xs text-[#7A6C74] mt-1">15 min • Cycle Phase: Luteal</p>
              </div>

              {/* Fake Audio/Video Scrubber */}
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-[#EAE4DF] overflow-hidden">
                  <div className="w-1/3 h-full bg-[#543649] rounded-full" />
                </div>
                <div className="flex justify-between text-[11px] text-[#7A6C74]">
                  <span>05:12</span>
                  <span>15:00</span>
                </div>
              </div>

              <div className="flex items-center justify-around pt-2 text-[#543649]">
                <button className="p-2 hover:bg-[#F2E8EC] rounded-full transition-colors">
                  <RotateCcw size={20} />
                </button>
                <button 
                  onClick={() => setIsPlayingHeroVideo(false)}
                  className="px-6 py-2 bg-[#543649] text-white rounded-full text-xs font-semibold hover:bg-[#432939] transition-all"
                >
                  Close Player
                </button>
                <button className="p-2 hover:bg-[#F2E8EC] rounded-full transition-colors">
                  <Volume2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 border border-[#EDE6E1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#E5D7B7] text-[#5C4524] text-[10px] font-bold">
                  {selectedCategory.badge}
                </span>
                <h3 className="text-lg font-bold text-[#1E191D]">
                  {selectedCategory.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)} 
                className="p-1 rounded-full hover:bg-stone-100 text-stone-600"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-stone-600 leading-relaxed">
              {selectedCategory.details}
            </p>

            <div className="p-3 rounded-2xl bg-[#FAF9F7] border border-[#EDE6E1] space-y-2">
              <div className="flex justify-between items-center text-xs font-medium text-[#1E191D]">
                <span>Included content</span>
                <span className="text-[#543649] font-bold">{selectedCategory.tag}</span>
              </div>
              <div className="text-[11px] text-[#7A6C74]">
                Stream HD video courses and read physician-reviewed guides on any device.
              </div>
            </div>

            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full py-2.5 bg-[#543649] text-white text-xs font-medium rounded-full hover:bg-[#432939] transition-all cursor-pointer"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F7] rounded-[36px] max-w-md w-full max-h-[90vh] overflow-hidden border border-[#EDE4DE] shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
            <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase">
                  {selectedArticle.readTime}
                </span>
                <h3 className="font-serif text-xl font-normal mt-1 leading-tight">
                  {selectedArticle.title}
                </h3>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-stone-700 leading-relaxed text-xs sm:text-sm">
              <p className="font-serif italic text-sm text-[#543649] border-l-2 border-[#DE9E8E] pl-3">
                {selectedArticle.subtitle}
              </p>
              {selectedArticle.content.map((p, i) => (
                <p key={i} className="text-xs text-stone-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-[#EDE4DE] flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 bg-[#543649] text-white text-xs font-semibold rounded-full hover:bg-[#432939] transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


