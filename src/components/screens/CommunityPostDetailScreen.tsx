import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Send
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

interface CommunityPostDetailScreenProps {
  onBack: () => void;
}

export const CommunityPostDetailScreen: React.FC<CommunityPostDetailScreenProps> = ({ onBack }) => {
  const { selectedPost, togglePostLike, addComment, settings } = useCycle();
  const [newComment, setNewComment] = useState('');
  const [activeReplyTo, setActiveReplyTo] = useState<string | null>(null);

  if (!selectedPost) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-6 text-center flex flex-col items-center justify-center space-y-4">
        <p className="text-stone-500 text-sm">No post selected</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-[#523446] text-white rounded-full text-xs font-semibold">
          Back to Community
        </button>
      </div>
    );
  }

  const post = selectedPost;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      if (selectedPost) {
        addComment(selectedPost.id, newComment.trim());
      } else {
        post.comments.push({
          id: `c_${Date.now()}`,
          authorName: settings.userName || 'You',
          authorAvatar: settings.avatarUrl || '/assets/avatar_emily_r_1788022630057.jpg',
          timeAgo: 'Just now',
          content: newComment.trim()
        });
      }
      setNewComment('');
      setActiveReplyTo(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Fluid Artwork Header with Back Button and Community Title */}
        <div className="relative w-full h-[180px] sm:h-[190px] overflow-hidden flex-shrink-0 bg-[#A6B2A8]">
          <img
            src="/assets/community_waves_header_1788068551419.jpg"
            alt="Fluid wavy background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />

          {/* Navigation Bar inside Header */}
          <div className="absolute top-5 inset-x-5 flex items-center justify-between text-white z-20">
            <button
              onClick={onBack}
              id="back_to_community_btn"
              className="p-1.5 -ml-1 text-white hover:opacity-80 transition-opacity cursor-pointer flex items-center"
            >
              <ChevronLeft size={26} strokeWidth={2.4} />
            </button>
            <h1 className="text-xl sm:text-[22px] font-sans font-medium text-white tracking-tight">
              Community
            </h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Content Body overlapping header */}
        <div className="flex-1 bg-[#FAF9F7] rounded-t-[36px] -mt-12 relative z-10 px-4 sm:px-5 pt-5 pb-24 flex flex-col space-y-5 overflow-y-auto no-scrollbar">
          
          {/* Main Post Card */}
          <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-[#EDE6E1] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3.5">
            {/* Title */}
            <h2 className="font-serif text-[24px] sm:text-[26px] font-normal text-[#1E191D] leading-tight tracking-tight">
              {post.title}
            </h2>

            {/* Author Row */}
            <div className="flex items-center gap-3 pt-1">
              <img
                src={post.authorAvatar || '/assets/avatar_sarah_j_1788022610469.jpg'}
                alt={post.authorName}
                className="w-11 h-11 rounded-full object-cover border border-[#EDE6E1]"
              />
              <div>
                <h3 className="text-sm font-bold text-[#1E191D] leading-none">
                  {post.authorName}
                </h3>
                <span className="text-[12px] text-[#7A6C74] font-medium block mt-0.5">
                  {post.timeAgo}
                </span>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-[13px] sm:text-[14px] text-[#362732] leading-relaxed pt-1">
              {post.content}
            </p>

            {/* Stats Row: Likes & Comments */}
            <div className="flex items-center gap-5 pt-2 text-[13px] text-[#362732] font-medium">
              <button
                type="button"
                onClick={() => selectedPost && togglePostLike(selectedPost.id)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-all cursor-pointer"
              >
                <Heart 
                  size={17} 
                  fill="#DE7D71" 
                  className="text-[#DE7D71]" 
                />
                <span>{post.likesCount} likes</span>
              </button>

              <div className="flex items-center gap-1.5">
                <MessageCircle size={17} className="text-[#362732]" />
                <span>{post.comments.length} comments</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-1">
            <h3 className="text-[18px] font-bold text-[#1E191D] px-1 tracking-tight">
              Comments
            </h3>

            {/* Comment Cards List */}
            <div className="space-y-2.5">
              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-[24px] p-4 border border-[#EDE6E1] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={comment.authorAvatar || '/assets/avatar_emily_r_1788022630057.jpg'}
                        alt={comment.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-[#EDE6E1]"
                      />
                      <div>
                        <h4 className="text-[13px] font-bold text-[#1E191D] leading-tight">
                          {comment.authorName}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#7A6C74] font-medium">
                      {comment.timeAgo}
                    </span>
                  </div>

                  <p className="text-[12px] sm:text-[13px] text-[#362732] leading-relaxed pl-0.5">
                    {comment.content}
                  </p>

                  {/* Reply Button Pill */}
                  <div className="pt-0.5">
                    <button
                      onClick={() => setActiveReplyTo(comment.authorName)}
                      className="px-3.5 py-1 rounded-full bg-[#EAE6EE] hover:bg-[#DDD7E2] text-[#4A3B43] text-[11px] font-medium transition-all cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Frosted Bottom Reply Input Bar above Navigation */}
        <div className="absolute bottom-2 inset-x-3 z-30 bg-[#9EB4A4]/50 backdrop-blur-md rounded-full p-1.5 border border-[#8DA394]/30 shadow-lg">
          <form
            onSubmit={handleSendComment}
            className="flex items-center bg-[#FAF9F7]/95 rounded-full px-4 py-2 border border-white/60"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={activeReplyTo ? `Reply to ${activeReplyTo}...` : 'Add a comment...'}
              className="flex-1 bg-transparent text-[13px] text-[#1E191D] placeholder:text-[#8E7E87] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="ml-2 text-[#7E9685] hover:text-[#5B7763] disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

