import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Check,
  Send
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

interface CreatePostScreenProps {
  onBack: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onBack }) => {
  const { addPost } = useCycle();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '#CycleTracking',
    '#HolisticHealth'
  ]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTags = [
    '#CycleTracking',
    '#HolisticHealth',
    '#WellnessTips',
    '#Fertility',
    '#Mindfulness',
    '#Nutrition',
    '#CommunitySupport',
    '#AskTheExperts'
  ];

  const toggleTag = (t: string) => {
    setSelectedTags(prev =>
      prev.includes(t) ? prev.filter(tag => tag !== t) : [...prev, t]
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (content.trim()) {
      addPost(
        content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        content,
        selectedTags
      );
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onBack();
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Botanical Artwork Header with Title */}
        <div className="relative w-full h-[210px] sm:h-[220px] overflow-hidden flex-shrink-0 bg-[#F4F1EA]">
          <img
            src="/assets/botanical_post_header_1788068536281.jpg"
            alt="Botanical vintage floral illustration"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />

          {/* Floating Back Arrow Button */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/70 backdrop-blur-md text-[#1E191D] hover:bg-white transition-all shadow-xs cursor-pointer z-20"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Centered Title */}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none">
            <h1 className="font-serif text-[30px] sm:text-[34px] font-normal text-[#1E191D] tracking-tight">
              Create a New Post
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-4 sm:px-5 pt-3 pb-6 flex flex-col justify-between space-y-4">
          
          {/* Main White Card Container */}
          <div className="bg-white rounded-[32px] p-5 border border-[#EDE6E1] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            
            {/* Card Subtitle Prompt */}
            <h2 className="font-serif text-[18px] sm:text-[19px] font-normal text-[#1E191D] leading-snug">
              Share your thoughts, experiences, or questions...
            </h2>

            {/* Input Box with Character Counter */}
            <div className="relative border border-[#D5CBC3] rounded-2xl p-3.5 bg-white focus-within:ring-2 focus-within:ring-[#543649]/20 focus-within:border-[#543649] transition-all">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full bg-transparent text-sm sm:text-base text-[#1E191D] placeholder:text-[#9E9099] focus:outline-none resize-none"
              />
              <div className="text-right text-[12px] text-[#7A6C74] font-medium pt-1">
                {content.length}/500
              </div>
            </div>

            {/* Add Tags Section */}
            <div className="space-y-2 pt-1">
              <span className="text-[14px] font-medium text-[#1E191D] block">
                Add Tags
              </span>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-[12px] sm:text-[13px] font-normal transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EFE8EB] border-2 border-[#543649] text-[#543649] font-medium'
                          : 'bg-[#FAF9F7] border border-[#DDD0C8] text-[#4A3B43] hover:bg-[#F2ECEE]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar inside Card */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F0EAE5] text-[#543649]">
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className="p-1.5 hover:bg-[#FAF4F7] rounded-full transition-all cursor-pointer"
              >
                <Heart 
                  size={20} 
                  fill={isLiked ? '#DE7D71' : 'none'} 
                  className={isLiked ? 'text-[#DE7D71]' : 'text-[#362732]'} 
                />
              </button>

              <button
                type="button"
                className="p-1.5 hover:bg-[#FAF4F7] rounded-full transition-all cursor-pointer text-[#362732]"
              >
                <MessageCircle size={20} />
              </button>

              <button
                type="button"
                className="p-1.5 hover:bg-[#FAF4F7] rounded-full transition-all cursor-pointer text-[#362732]"
              >
                <Share2 size={20} />
              </button>

              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-1.5 hover:bg-[#FAF4F7] rounded-full transition-all cursor-pointer"
              >
                <Bookmark 
                  size={20} 
                  fill={isBookmarked ? '#543649' : 'none'} 
                  className={isBookmarked ? 'text-[#543649]' : 'text-[#362732]'} 
                />
              </button>
            </div>
          </div>

          {/* Primary Action Button: POST */}
          <div className="w-full pt-1">
            <button
              onClick={() => handleSubmit()}
              disabled={!content.trim() || isSubmitted}
              id="submit_community_post_btn"
              className="w-full py-4 bg-[#543649] hover:bg-[#432939] active:scale-[0.98] disabled:opacity-50 text-white font-sans font-semibold tracking-wider text-[17px] rounded-full shadow-[0_10px_28px_rgba(84,54,73,0.32)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitted ? (
                <>
                  <Check size={18} />
                  <span>POSTED!</span>
                </>
              ) : (
                <span>POST</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

