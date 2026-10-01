import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  Search, 
  Play, 
  Home, 
  Calendar, 
  Plus, 
  BarChart2, 
  MessageCircle, 
  BookOpen, 
  ArrowLeft,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedSearchScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedSearchScreen: React.FC<ModernizedSearchScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItemModal, setActiveItemModal] = useState<{
    title: string;
    type: 'article' | 'video' | 'post';
    author?: string;
    content: string;
  } | null>(null);

  const articles = [
    {
      id: 'moon-sync',
      title: 'Syncing Your Cycle with the Moon',
      image: '/assets/moon_ocean_thumb_1788511415318.jpg',
      description: 'Understanding hormonal shifts and lunar energy',
      meta: 'By Dr. Anya Sharma · 4 min read',
      fullText: 'Throughout centuries, natural lunar rhythms have mirrored human circadian and infradian biology. Discover how nighttime dimming and lunar alignment can nurture melatonin synthesis and hormonal balance.'
    },
    {
      id: 'holistic-phase3',
      title: 'Holistic Nutrition for Phase 3',
      image: '/assets/nutrition_cycle_botanical_1788510548380.jpg',
      description: 'Foods to support luteal phase balance',
      meta: 'By Nutritionist Chloe Lee · 6 min read',
      fullText: 'During the luteal phase, progesterone surges naturally elevate resting metabolic rate. Incorporate magnesium-rich pumpkin seeds, sweet potatoes, and warming broths to ease PMS symptoms.'
    }
  ];

  const videos = [
    {
      id: 'morning-flow',
      title: '10-Minute Morning Flow for Energy',
      duration: '8:45',
      instructor: 'Yoga with Elara',
      image: '/assets/yoga_flow_thumb_1788511438629.jpg',
      fullText: 'A restorative morning yoga routine engineered to gently awaken the lymphatic system, release tension in the lower pelvis, and prime circulation.'
    }
  ];

  const communityPosts = [
    {
      id: 'herbal-teas',
      title: 'Herbal Teas for Cramps? Any favorites?',
      author: '@LunaLove',
      preview: 'I swear by ginger and chamomile, but looking for other suggestions...',
      replies: '15 replies',
      fullText: 'Looking for remedies during day 1 & 2! Peppermint helps with bloating, but what herbal blends have genuinely eased muscle contractions for you?'
    },
    {
      id: 'fertility-journey',
      title: 'My Fertility Journey Update',
      author: '@GracefulBloom',
      preview: 'Finally feeling hopeful after my latest appointment...',
      replies: '32 replies',
      fullText: 'After six months of tracking basal temperature and cervical patterns, our fertility specialist confirmed ovulation timing is regular! Sending warmth to everyone on this path.'
    }
  ];

  // Filtering based on search query
  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = communityPosts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-24 relative overflow-x-hidden font-sans select-none flex flex-col items-center">
      {/* Phone container */}
      <div className="w-full max-w-md bg-[#FAF9F7] min-h-screen relative flex flex-col justify-between shadow-2xl overflow-hidden">

        {/* Top Watercolor Fluid Header & Search Bar */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#FDEFEA] via-[#E6EFF8] to-[#E9F3EB] pt-3 pb-5 px-5">
          <img
            src="/assets/search_fluid_waves_1788511352312.jpg"
            alt="Pastel fluid watercolor swirls"
            className="w-full h-full object-cover object-center absolute inset-0 opacity-80"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* iOS Status Bar: 9:41, Cellular, Wifi, Battery */}
          <div className="relative z-20 w-full pt-1 flex items-center justify-between text-[#1E191D] text-[14px] font-semibold mb-3">
            <span className="flex items-center gap-1 font-semibold text-[14px]">
              9:41
            </span>
            <div className="flex items-center gap-2">
              <Signal size={14} strokeWidth={2.4} />
              <Wifi size={14} strokeWidth={2.4} />
              <Battery size={18} strokeWidth={2.4} />
            </div>
          </div>

          {/* Title & Back button */}
          <div className="relative z-20 flex items-center justify-between mb-3">
            <h1 className="font-serif text-[32px] sm:text-[34px] font-normal text-[#1E191D] tracking-tight leading-none">
              Search
            </h1>
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-[#554C53] hover:bg-white active:scale-95 transition-all cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft size={17} />
            </button>
          </div>

          {/* Frosted Pill Search Input */}
          <div className="relative z-20">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-[#8C7F87] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, videos, community..."
                className="w-full bg-white/85 backdrop-blur-md border border-white/70 rounded-2xl pl-11 pr-10 py-3 text-[14px] text-[#1E191D] placeholder:text-[#8E848A] shadow-[0_4px_16px_rgba(0,0,0,0.03)] outline-none focus:bg-white focus:border-[#D5C6BC] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 w-5 h-5 rounded-full bg-[#E5DCD6] text-[#554C53] flex items-center justify-center hover:bg-[#D5C6BC]"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Content Sections */}
        <div className="px-5 py-4 flex-1 flex flex-col gap-6 overflow-y-auto">

          {/* Section 1: Articles */}
          <div>
            <h2 className="font-serif text-[20px] font-normal text-[#1E191D] tracking-tight mb-3">
              Articles
            </h2>

            {filteredArticles.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/60 text-center text-[13px] text-[#7C747B]">
                No articles matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setActiveItemModal({
                      title: art.title,
                      type: 'article',
                      author: art.meta,
                      content: art.fullText
                    })}
                    className="bg-white rounded-[24px] p-3.5 border border-[#EFE8E3] shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-[#DFD3CB] active:scale-98 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Title and Thumbnail Row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-serif text-[13.5px] font-bold text-[#1E191D] leading-snug">
                          {art.title}
                        </h3>
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#EAE2DC]">
                          <img
                            src={art.image}
                            alt={art.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-[#6E646A] leading-relaxed line-clamp-2 mb-2">
                        {art.description}
                      </p>
                    </div>

                    <div className="text-[10.5px] text-[#8E848A] font-medium truncate">
                      {art.meta}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Videos */}
          <div>
            <h2 className="font-serif text-[20px] font-normal text-[#1E191D] tracking-tight mb-3">
              Videos
            </h2>

            {filteredVideos.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/60 text-center text-[13px] text-[#7C747B]">
                No videos matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setActiveItemModal({
                      title: vid.title,
                      type: 'video',
                      author: `${vid.instructor} · ${vid.duration}`,
                      content: vid.fullText
                    })}
                    className="bg-white rounded-[24px] p-3.5 sm:p-4 border border-[#EFE8E3] shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-[#DFD3CB] active:scale-98 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-[15px] font-bold text-[#1E191D] leading-snug mb-1">
                        {vid.title}
                      </h3>
                      <div className="text-[12px] text-[#7E747B] mb-0.5 font-medium">
                        {vid.duration}
                      </div>
                      <div className="text-[12.5px] text-[#554C53]">
                        {vid.instructor}
                      </div>
                    </div>

                    {/* Right video thumbnail with play overlay */}
                    <div className="relative w-28 h-18 sm:w-32 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#EAE2DC]">
                      <img
                        src={vid.image}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-[#1E191D] flex items-center justify-center shadow-md">
                          <Play size={14} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Community Posts */}
          <div>
            <h2 className="font-serif text-[20px] font-normal text-[#1E191D] tracking-tight mb-3">
              Community Posts
            </h2>

            {filteredPosts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/60 text-center text-[13px] text-[#7C747B]">
                No community discussions matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setActiveItemModal({
                      title: post.title,
                      type: 'post',
                      author: post.author,
                      content: post.fullText
                    })}
                    className="bg-white rounded-[24px] p-3.5 border border-[#EFE8E3] shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-[#DFD3CB] active:scale-98 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-serif text-[13.5px] font-bold text-[#1E191D] leading-snug mb-1">
                        {post.title}
                      </h3>
                      <div className="text-[11.5px] font-medium text-[#5A4E56] mb-1.5">
                        {post.author}
                      </div>
                      <p className="text-[11px] text-[#6E646A] leading-relaxed line-clamp-3 mb-3">
                        {post.preview}
                      </p>
                    </div>

                    <div className="text-[11px] font-medium text-[#8E848A]">
                      {post.replies}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Navigation Bar with Search highlighted matching screenshot */}
        <div className="bg-white/95 backdrop-blur-md border-t border-[#EDE5DF] px-6 py-2.5 flex items-center justify-between sticky bottom-0 z-30">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('HOME') : onBack()}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] transition-colors"
          >
            <Home size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] transition-colors"
          >
            <Calendar size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('FEELING_TODAY')}
            className="flex flex-col items-center -mt-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#523446] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(82,52,70,0.3)] active:scale-95 transition-all">
              <Plus size={22} strokeWidth={2.6} />
            </div>
            <span className="text-[10.5px] font-medium text-[#7F777E] mt-0.5">Add</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('INSIGHTS')}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] transition-colors"
          >
            <BarChart2 size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Insights</span>
          </button>

          {/* Active Search button with gold top indicator line */}
          <button
            type="button"
            className="flex flex-col items-center gap-0.5 text-[#C2964A]"
          >
            <div className="w-6 h-0.5 bg-[#C2964A] rounded-full -mt-2 mb-1" />
            <Search size={20} strokeWidth={2.2} />
            <span className="text-[10.5px] font-bold">Search</span>
          </button>
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full pb-2 flex justify-center bg-white">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>
      </div>

      {/* Content Preview / Read Modal */}
      <AnimatePresence>
        {activeItemModal && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#EDE5DF]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10.5px] font-bold tracking-wider uppercase text-[#C2964A] mb-1 block">
                    {activeItemModal.type}
                  </span>
                  <h3 className="text-[18px] font-serif font-bold text-[#1E191D] leading-snug">
                    {activeItemModal.title}
                  </h3>
                  {activeItemModal.author && (
                    <div className="text-[12px] text-[#7E747B] mt-1">
                      {activeItemModal.author}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItemModal(null)}
                  className="w-8 h-8 rounded-full bg-[#F5EFEB] text-[#6E646A] flex items-center justify-center hover:bg-[#EAE2DC] shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="my-4 p-4 rounded-2xl bg-[#FAF7F3] text-[13.5px] text-[#4F464D] leading-relaxed">
                {activeItemModal.content}
              </div>

              <button
                type="button"
                onClick={() => setActiveItemModal(null)}
                className="w-full py-3 rounded-full bg-[#1E191D] hover:bg-[#352D33] text-white font-semibold text-[13.5px] transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
