import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Smile, 
  Moon, 
  AlertTriangle, 
  CloudMoon, 
  Target, 
  Sparkles, 
  Heart, 
  Zap, 
  Frown, 
  Wind, 
  Brain, 
  Droplet, 
  BatteryLow, 
  CircleDot, 
  ChevronLeft, 
  X, 
  Check, 
  Trash2,
  Tag as TagIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { useCustomTags } from '../../hooks/useCustomTags';
import { formatDateToISO } from '../../utils/cycleCalculations';

interface CustomTagsScreenProps {
  onBack: () => void;
}

// Preset color map matching the reference design
const TAG_COLOR_PALETTE = [
  { id: 'sage', bg: 'bg-[#9CB39E]', hex: '#9CB39E', label: 'Sage Green' },
  { id: 'slate', bg: 'bg-[#6D6887]', hex: '#6D6887', label: 'Slate Indigo' },
  { id: 'terracotta', bg: 'bg-[#C67E77]', hex: '#C67E77', label: 'Dusty Coral' },
  { id: 'indigo', bg: 'bg-[#625E7C]', hex: '#625E7C', label: 'Muted Indigo' },
  { id: 'mauve', bg: 'bg-[#9C6E89]', hex: '#9C6E89', label: 'Plum Mauve' },
  { id: 'blush', bg: 'bg-[#C88581]', hex: '#C88581', label: 'Blush Rose' },
  { id: 'blue', bg: 'bg-[#636886]', hex: '#636886', label: 'Slate Blue' }
];

// Helper to determine aesthetic color & icon for known and custom tags
const getTagConfig = (tagName: string, isSymptom: boolean, index: number) => {
  const normalized = tagName.toLowerCase().trim();

  // Known Moods from reference design
  if (normalized === 'happy') return { bg: 'bg-[#9CB39E]', icon: Smile };
  if (normalized === 'calm') return { bg: 'bg-[#6D6887]', icon: Moon };
  if (normalized === 'anxiety' || normalized === 'anxious') return { bg: 'bg-[#C67E77]', icon: AlertTriangle };
  if (normalized === 'sleepy' || normalized === 'tired') return { bg: 'bg-[#625E7C]', icon: CloudMoon };
  if (normalized === 'focused') return { bg: 'bg-[#636886]', icon: Target };
  if (normalized === 'fatigey' || normalized === 'fatigue') return { bg: isSymptom ? 'bg-[#9BB49C]' : 'bg-[#9C6E89]', icon: isSymptom ? BatteryLow : Sparkles };
  if (normalized === 'excited') return { bg: 'bg-[#C88581]', icon: Heart };
  if (normalized === 'energetic') return { bg: 'bg-[#9BB49C]', icon: Zap };
  if (normalized === 'sad') return { bg: 'bg-[#686888]', icon: Frown };

  // Known Symptoms from reference design
  if (normalized === 'bloating') return { bg: 'bg-[#9CB39E]', icon: Wind };
  if (normalized === 'cramps') return { bg: 'bg-[#6D6887]', icon: Zap };
  if (normalized === 'headache' || normalized === 'migraine') return { bg: 'bg-[#625E7C]', icon: Brain };
  if (normalized === 'acne' || normalized === 'skin') return { bg: 'bg-[#C67E77]', icon: Droplet };
  if (normalized === 'breast tenderness' || normalized === 'tender breasts') return { bg: 'bg-[#6D6887]', icon: Heart };
  if (normalized === 'cravings') return { bg: 'bg-[#C88581]', icon: Heart };

  // Fallback cycled color palette
  const colorIndex = (index + (isSymptom ? 3 : 0)) % TAG_COLOR_PALETTE.length;
  return { 
    bg: TAG_COLOR_PALETTE[colorIndex].bg, 
    icon: isSymptom ? CircleDot : TagIcon 
  };
};

export const CustomTagsScreen: React.FC<CustomTagsScreenProps> = ({ onBack }) => {
  const { addTag, removeTag: deleteCustomTagDb } = useCustomTags();
  const { 
    customMoodTags, 
    customSymptomTags, 
    addCustomTag, 
    removeCustomTag,
    dayLogs, 
    saveDayLog 
  } = useCycle();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<'mood' | 'symptom'>('mood');
  const [selectedTagColor, setSelectedTagColor] = useState<string>('sage');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todayIso = formatDateToISO(new Date());
  const todayLog = dayLogs[todayIso] || {
    date: todayIso,
    flow: null,
    moods: [],
    symptoms: []
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Filter moods and symptoms by search query
  const filteredMoods = customMoodTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const filteredSymptoms = customSymptomTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleOpenAddModal = (category: 'mood' | 'symptom' = 'mood', initialName = '') => {
    setNewTagCategory(category);
    setNewTagName(initialName || searchQuery);
    setIsAddModalOpen(true);
  };

  const handleCreateTag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTagName.trim()) return;

    const trimmed = newTagName.trim();
    addCustomTag(newTagCategory, trimmed);
    await addTag(trimmed, newTagCategory, selectedTagColor);
    showToast(`Added "${trimmed}" to ${newTagCategory === 'mood' ? 'Moods' : 'Symptoms'}`);
    setNewTagName('');
    setSearchQuery('');
    setIsAddModalOpen(false);
  };

  const handleToggleTodayLog = (tag: string, isSymptom: boolean) => {
    if (isSymptom) {
      const current = todayLog.symptoms || [];
      const updated = current.includes(tag) 
        ? current.filter(s => s !== tag)
        : [...current, tag];
      saveDayLog(todayIso, { symptoms: updated });
      showToast(current.includes(tag) ? `Removed "${tag}" from today` : `Logged "${tag}" for today!`);
    } else {
      const current = todayLog.moods || [];
      const updated = current.includes(tag) 
        ? current.filter(m => m !== tag)
        : [...current, tag];
      saveDayLog(todayIso, { moods: updated });
      showToast(current.includes(tag) ? `Removed "${tag}" from today` : `Logged "${tag}" for today!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-36 selection:bg-[#DE9E8E]/30 relative overflow-x-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#251D22]/90 backdrop-blur-md text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/10"
          >
            <Check size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Graphic & Search Bar */}
      <div className="relative w-full overflow-hidden">
        {/* Wavy Pastel Header Background Art */}
        <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
          <img
            src="/assets/custom_tags_wavy_header_1788065540869.jpg"
            alt="Fluid pastel waves header"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle soft organic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-[#FAF9F7]" />
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          id="custom_tags_back_button"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2A2328] hover:bg-white/70 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        {/* Search Bar and + Button Overlay */}
        <div className="absolute bottom-4 left-0 right-0 px-4 sm:px-6 max-w-lg mx-auto flex items-center gap-2.5 z-10">
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-4 text-[#473D44] pointer-events-none">
              <Search size={18} strokeWidth={2.2} />
            </div>
            <input
              type="text"
              id="tag_search_input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleOpenAddModal('mood', searchQuery.trim());
                }
              }}
              placeholder="Search or add new tag"
              className="w-full pl-11 pr-4 py-3 bg-white/45 hover:bg-white/55 focus:bg-white/70 backdrop-blur-md border border-white/60 rounded-full text-sm font-medium text-[#20181E] placeholder-[#5C5058] shadow-[0_4px_14px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#8E7E87]/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-[#5C5058] hover:text-[#20181E] p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            id="tag_quick_add_button"
            onClick={() => handleOpenAddModal('mood')}
            className="w-12 h-12 rounded-full bg-white/45 hover:bg-white/65 active:scale-95 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2A2328] shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all cursor-pointer flex-shrink-0"
            aria-label="Add new tag"
          >
            <Plus size={22} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto px-5 sm:px-6 pt-5 space-y-8">
        {/* Section 1: Moods */}
        <section id="section_moods">
          <div className="flex items-baseline justify-between mb-3.5">
            <h1 className="font-serif text-[34px] sm:text-[38px] font-normal text-[#1E191D] tracking-tight leading-none">
              Moods
            </h1>
            <span className="text-xs font-medium text-[#8E7E87]">
              {filteredMoods.length} tags
            </span>
          </div>

          {filteredMoods.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {filteredMoods.map((tag, idx) => {
                const config = getTagConfig(tag, false, idx);
                const Icon = config.icon;
                const isLoggedToday = todayLog.moods?.includes(tag);

                return (
                  <motion.button
                    key={`mood_${tag}`}
                    id={`mood_tag_${tag.toLowerCase().replace(/\s+/g, '_')}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleToggleTodayLog(tag, false)}
                    className={`${config.bg} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.14)] transition-all cursor-pointer relative group`}
                  >
                    <Icon size={16} strokeWidth={2.2} className="flex-shrink-0" />
                    <span className="text-sm font-medium tracking-tight whitespace-nowrap">
                      {tag}
                    </span>
                    {isLoggedToday && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" title="Logged today" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/60 border border-stone-200/60 rounded-2xl p-4 text-center">
              <p className="text-xs text-[#8E7E87]">No moods matching "{searchQuery}"</p>
              <button
                onClick={() => handleOpenAddModal('mood', searchQuery)}
                className="mt-2 text-xs font-semibold text-[#523446] hover:underline"
              >
                + Create "{searchQuery}" as Mood
              </button>
            </div>
          )}
        </section>

        {/* Section 2: Symptoms */}
        <section id="section_symptoms">
          <div className="flex items-baseline justify-between mb-3.5">
            <h2 className="font-serif text-[34px] sm:text-[38px] font-normal text-[#1E191D] tracking-tight leading-none">
              Symptoms
            </h2>
            <span className="text-xs font-medium text-[#8E7E87]">
              {filteredSymptoms.length} tags
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {filteredSymptoms.map((tag, idx) => {
              const config = getTagConfig(tag, true, idx);
              const Icon = config.icon;
              const isLoggedToday = todayLog.symptoms?.includes(tag);

              return (
                <motion.button
                  key={`symptom_${tag}`}
                  id={`symptom_tag_${tag.toLowerCase().replace(/\s+/g, '_')}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleToggleTodayLog(tag, true)}
                  className={`${config.bg} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.14)] transition-all cursor-pointer relative group`}
                >
                  <Icon size={16} strokeWidth={2.2} className="flex-shrink-0" />
                  <span className="text-sm font-medium tracking-tight whitespace-nowrap">
                    {tag}
                  </span>
                  {isLoggedToday && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" title="Logged today" />
                  )}
                </motion.button>
              );
            })}

            {/* + Add New Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleOpenAddModal('symptom')}
              id="btn_add_new_symptom"
              className="bg-[#EFEAE6] hover:bg-[#E5DFDA] text-[#2C242A] border border-[#DDD3CB] px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer font-medium text-sm"
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>Add New</span>
            </motion.button>
          </div>
        </section>

        {/* Helpful Tip Box */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#EBE4DE] rounded-2xl p-4 text-[#6A5E66] text-xs leading-relaxed shadow-sm">
          <p className="font-semibold text-[#20181E] mb-1 flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#C67E77]" />
            Personalized Tracking
          </p>
          Tap any tag to quickly toggle it in your daily log. You can add custom feelings or physical changes anytime to tailor your cycle insights.
        </div>
      </main>

      {/* Add Custom Tag Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="relative w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl border border-[#EBE2DB] z-10 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-[#20181E]">
                  Create Custom Tag
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTag} className="space-y-4">
                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#665B62] uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF7F4] p-1 rounded-2xl border border-[#EBE2DB]">
                    <button
                      type="button"
                      onClick={() => setNewTagCategory('mood')}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        newTagCategory === 'mood'
                          ? 'bg-[#523446] text-white shadow-sm'
                          : 'text-[#665B62] hover:text-[#20181E]'
                      }`}
                    >
                      Mood
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTagCategory('symptom')}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        newTagCategory === 'symptom'
                          ? 'bg-[#523446] text-white shadow-sm'
                          : 'text-[#665B62] hover:text-[#20181E]'
                      }`}
                    >
                      Symptom
                    </button>
                  </div>
                </div>

                {/* Tag Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#665B62] uppercase tracking-wider mb-2">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder={newTagCategory === 'mood' ? 'e.g. Grateful, Restless' : 'e.g. Migraine, Nausea'}
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full bg-[#FAF7F4] border border-[#DDD3CB] rounded-2xl px-4 py-2.5 text-sm text-[#20181E] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#523446]"
                  />
                </div>

                {/* Submit button */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 border border-[#DDD3CB] rounded-2xl text-xs font-semibold text-[#665B62] hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#523446] hover:bg-[#412737] text-white rounded-2xl text-xs font-semibold shadow-md transition-colors"
                  >
                    Save Tag
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
