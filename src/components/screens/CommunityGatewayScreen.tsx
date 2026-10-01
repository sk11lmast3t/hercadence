import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Search, 
  Tag, 
  Sparkles 
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { AppView, CommunityPost } from '../../types';

interface CommunityGatewayScreenProps {
  onBack: () => void;
  onNavigate: (view: AppView) => void;
}

export const CommunityGatewayScreen: React.FC<CommunityGatewayScreenProps> = ({ onBack, onNavigate }) => {
  const { posts, togglePostLike, togglePostBookmark, setSelectedPost } = useCycle();
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tags = ['All', '#CycleTracking', '#HolisticHealth', '#Mindfulness', '#Nutrition', '#WellnessTips'];

  const filteredPosts = posts.filter(p => {
    const matchesTag = selectedTag === 'All' || p.tags.includes(selectedTag);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleOpenPost = (post: CommunityPost) => {
    setSelectedPost(post);
    onNavigate('POST_DETAIL');
  };

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-stone-100 text-stone-700 transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-xl font-serif font-bold text-[#20171D]">Community Circle</h1>
        <button
          onClick={() => onNavigate('CREATE_POST')}
          className="p-2.5 rounded-full bg-[#523446] text-white shadow-sm hover:bg-[#412737] transition-colors"
          title="Create New Post"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-[32px] overflow-hidden border border-[#EDE4DE] shadow-sm">
        <img
          src="/assets/community_embrace_art_1787988487172.jpg"
          alt="Community Circle"
          className="w-full h-36 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">
            Safe & Supportive Space
          </span>
          <h2 className="text-lg font-serif font-bold">Connect with Fellow Women</h2>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-3.5 text-[#8E7E87]" />
        <input
          type="text"
          placeholder="Search topics, experiences, questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#EDE4DE] rounded-2xl pl-11 pr-4 py-2.5 text-xs text-[#20171D] placeholder-[#8E7E87] focus:outline-none focus:ring-2 focus:ring-[#523446]"
        />
      </div>

      {/* Tag Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTag === tag
                ? 'bg-[#523446] text-white shadow-sm'
                : 'bg-white border border-[#EDE4DE] text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-[32px] p-5 border border-[#EDE4DE] shadow-sm hover:shadow-md transition-all space-y-3"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-[#EDE4DE]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#20171D]">{post.authorName}</h4>
                  <span className="text-[10px] text-[#7A6C74]">{post.timeAgo}</span>
                </div>
              </div>

              <button
                onClick={() => togglePostBookmark(post.id)}
                className="text-stone-400 hover:text-[#523446] p-1.5 transition-colors"
              >
                <Bookmark size={16} fill={post.isBookmarked ? '#523446' : 'none'} />
              </button>
            </div>

            {/* Post Content Body */}
            <div onClick={() => handleOpenPost(post)} className="cursor-pointer space-y-1.5">
              <h3 className="text-sm font-serif font-bold text-[#20171D] hover:text-[#523446]">
                {post.title}
              </h3>
              <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map(t => (
                <span key={t} className="text-[10px] font-semibold text-[#7D9688] bg-[#EBF1ED] px-2.5 py-0.5 rounded-md">
                  {t}
                </span>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE5] text-xs text-stone-500">
              <button
                onClick={() => togglePostLike(post.id)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                }`}
              >
                <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                <span>{post.likesCount}</span>
              </button>

              <button
                onClick={() => handleOpenPost(post)}
                className="flex items-center gap-1.5 hover:text-[#523446] transition-colors cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>{post.comments.length} comments</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
