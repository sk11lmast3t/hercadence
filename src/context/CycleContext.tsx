/**
 * CycleContext.tsx
 *
 * Owns all legacy cycle/health state. The 10 profile + simple-preference fields
 * are owned by ProfilePreferencesProvider (mounted above this tree).
 * CycleContext composes `settings` from legacySettings + profilePreferences so
 * every existing consumer calling useCycle().settings sees an unchanged shape.
 *
 * Mount order (inside CycleProvider's render):
 *   ProfilePreferencesProvider
 *     └─ NavigationProvider
 *          └─ CycleContextValue   (inner component; reads both context slices)
 *               └─ children
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '../hooks/useSupabase';
import { NavigationProvider, useNavigation } from '../navigation/NavigationContext';
import {
  ProfilePreferencesProvider,
  useProfilePreferences,
  ProfilePreferences,
} from '../profilePreferences/ProfilePreferencesContext';
import {
  UserSettings,
  DayLog,
  AppView,
  CycleCalculationResult,
  CommunityPost,
  VideoItem,
  ArticleItem,
  DoctorAppointment,
} from '../types';
import { calculateCycleInfo, formatDateToISO, addDays } from '../utils/cycleCalculations';
import { CycleRepository } from '../features/cycle/CycleRepository';

// ── Storage keys ──────────────────────────────────────────────────────────────

const STORAGE_KEY_SETTINGS = 'cycle_tracker_user_settings';
const STORAGE_KEY_LOGS = 'cycle_tracker_day_logs';
const STORAGE_KEY_POSTS = 'cycle_tracker_community_posts';
const STORAGE_KEY_TAGS = 'cycle_tracker_custom_tags';

// ── The 10 owned keys (used for the updateSettings split) ─────────────────────

const PROFILE_PREFERENCE_KEYS: ReadonlySet<keyof ProfilePreferences> = new Set([
  'userName',
  'email',
  'avatarUrl',
  'temperatureUnit',
  'weightUnit',
  'startDayOfWeek',
  'showWeekNumbers',
  'language',
  'region',
  'selectedGoal',
]);

// ── Legacy settings type (UserSettings minus the 10 owned fields) ─────────────

type LegacySettings = Omit<
  UserSettings,
  | 'userName'
  | 'email'
  | 'avatarUrl'
  | 'temperatureUnit'
  | 'weightUnit'
  | 'startDayOfWeek'
  | 'showWeekNumbers'
  | 'language'
  | 'region'
  | 'selectedGoal'
>;

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultLastPeriod = formatDateToISO(addDays(new Date(), -12));

const initialLegacySettings: LegacySettings = {
  cycleLengthDays: 28,
  periodLengthDays: 5,
  lutealPhaseDays: 14,
  lastPeriodStartDate: defaultLastPeriod,
  isPasscodeEnabled: false,
  passcode: '',
  isPremium: false,
  hasCompletedBaseline: false,
  baselineHealth: {
    weight: 58,
    weightUnit: 'kg',
    heightCm: 165,
    heightFeet: 5,
    heightInches: 5,
    heightUnit: 'cm',
    age: 26,
    cycleRegularity: 'Regular',
    primaryGoals: ['Cycle Tracking', 'Hormonal Balance', 'Wellness & Energy'],
    typicalSymptoms: ['Cramps', 'Fatigue', 'Bloating'],
    sleepHoursBaseline: 7.5,
    activityLevel: 'Moderately Active',
    birthControlMethod: 'Natural / None',
  },
  notifications: {
    periodReminders: true,
    fertileWindowAlerts: true,
    pillReminders: false,
    dailyLogPrompt: true,
    periodReminderDaysBefore: 2,
    pillReminderTime: '08:00 AM',
  },
  birthControl: {
    type: 'Natural',
    brandName: '',
    packTotalPills: 28,
    currentPillIndex: 0,
    reminderTime: '09:00 AM',
    streakDays: 0,
  },
  partnerSync: {
    isEnabled: false,
    partnerCode: '',
    connectedPartnerName: '',
    sharePhase: true,
    shareSymptoms: true,
    shareMoods: true,
    shareNotes: false,
  },
};

// ── Static content ────────────────────────────────────────────────────────────

const initialPosts: CommunityPost[] = [
  {
    id: 'post_1',
    authorName: 'Tara K.',
    authorAvatar: '/assets/avatar_emily_r_1788022630057.jpg',
    timeAgo: '2 hours ago',
    title: 'Mindful Morning Routine',
    content:
      "Sharing my updated morning ritual for hormone balance and energy. It includes gentle stretching, a warm lemon water, and a 10-minute meditation. What are your favorite ways to start the day mindfully? Let's inspire each other!",
    tags: ['#CycleTracking', '#HolisticHealth', '#Mindfulness'],
    likesCount: 145,
    isLiked: false,
    isBookmarked: false,
    comments: [
      {
        id: 'c1',
        authorName: 'Emily R.',
        authorAvatar: '/assets/avatar_emily_r_1788022630057.jpg',
        timeAgo: '1 hour ago',
        content: "Love this! I've been trying to incorporate more stretching. Thanks for the reminder.",
      },
      {
        id: 'c2',
        authorName: 'Maria G.',
        authorAvatar: '/assets/avatar_maria_g_1788022652361.jpg',
        timeAgo: '45 mins ago',
        content: 'Meditation is a game-changer for me. Do you have any app recommendations?',
      },
    ],
  },
  {
    id: 'post_2',
    authorName: 'Elena Rostova',
    authorAvatar: '/assets/avatar_maria_g_1788022652361.jpg',
    timeAgo: '5 hours ago',
    title: 'Seed Cycling for Luteal Phase',
    content:
      'Sunflower and sesame seeds have significantly softened my PMS symptoms this cycle! Anyone else doing seed cycling protocol regularly?',
    tags: ['#Nutrition', '#WellnessTips', '#HolisticHealth'],
    likesCount: 92,
    isLiked: true,
    isBookmarked: true,
    comments: [
      {
        id: 'c3',
        authorName: 'Tara K.',
        authorAvatar: '/assets/avatar_emily_r_1788022630057.jpg',
        timeAgo: '3 hours ago',
        content: 'Yes! Combining them into evening oat bowls with pumpkin seeds is wonderful.',
      },
    ],
  },
];

const initialVideos: VideoItem[] = [
  {
    id: 'vid_1',
    title: 'Hormone Balance Meditation',
    instructor: 'Dr. Anya Sharma',
    duration: '15 min',
    category: 'Meditation',
    thumbnailUrl: '/assets/video_hero_balance_meditation_1788023702575.jpg',
    description:
      'A gentle vagus nerve stimulation meditation designed to lower cortisol and encourage balanced progesterone synthesis.',
  },
  {
    id: 'vid_2',
    title: 'Yin Yoga for Luteal Release',
    instructor: 'Clara Hughes',
    duration: '25 min',
    category: 'Yoga',
    thumbnailUrl: '/assets/category_yoga_movement_1788023732115.jpg',
    description: 'Deep hip opening postures to relieve lower back tension and soothe premenstrual cramps.',
  },
  {
    id: 'vid_3',
    title: 'Nutrient-Dense PCOS Kitchen',
    instructor: 'Chloe Chen, MS RD',
    duration: '18 min',
    category: 'Nutrition',
    thumbnailUrl: '/assets/category_nutrition_pcos_1788023718517.jpg',
    description: 'Stabilize blood glucose and reduce inflammation with 3 easy anti-inflammatory meals.',
  },
  {
    id: 'vid_4',
    title: 'Diaphragmatic Breath for Cramps',
    instructor: 'Aria Vance',
    duration: '10 min',
    category: 'Mindfulness',
    thumbnailUrl: '/assets/category_mindfulness_breath_1788023746773.jpg',
    description:
      'Calm the central nervous system with 4-7-8 breathing patterns and pelvic floor relaxation.',
  },
];

const initialArticles: ArticleItem[] = [
  {
    id: 'art_luteal',
    title: 'Nourishing the Luteal Phase',
    subtitle: 'Holistic nutrition and lifestyle strategies for natural hormone support.',
    author: 'Dr. Elena Vance, ND',
    readTime: '6 min read',
    category: 'Nutrition',
    heroImage: '/assets/luteal_nutrition_tea_hero_1787937745306.jpg',
    content: `The luteal phase represents the second half of your menstrual cycle, following ovulation. Progesterone rises to prepare the uterine lining and naturally increases your resting metabolic rate by roughly 100-300 calories daily.

### Essential Nutrients
1. **Magnesium & Vitamin B6**: Cruciferous greens, pumpkin seeds, dark chocolate (85%+), and avocados help metabolize estrogen smoothly.
2. **Complex Slow-Burning Carbs**: Roasted sweet potatoes, brown rice, and quinoa prevent rapid blood sugar dips that trigger mood swings.
3. **Anti-Inflammatory Herbal Teas**: Cinnamon, fresh ginger, and dandelion root assist liver detox and fluid balance.`,
  },
  {
    id: 'art_seed_cycling',
    title: 'Seed Cycling 101',
    subtitle:
      'The ancient ritual of synchronizing pumpkin, flax, sunflower, and sesame seeds with your cycle.',
    author: 'CycleCare Nutrition Team',
    readTime: '4 min read',
    category: 'Wellness',
    heroImage: '/assets/article_mood_recipes_thumb_1788023760344.jpg',
    content: `Seed cycling utilizes natural phytoestrogens and essential fatty acids to gently support hormone balance:
- **Days 1-14 (Follicular)**: 1 tbsp ground flax + 1 tbsp pumpkin seeds (supports healthy estrogen).
- **Days 15-28 (Luteal)**: 1 tbsp sunflower seeds + 1 tbsp sesame seeds (supports progesterone).`,
  },
];

const initialAppointment: DoctorAppointment = {
  id: '',
  doctorName: '',
  specialty: '',
  clinic: '',
  date: '',
  time: '',
  notes: '',
  avatarUrl: '',
  status: 'Pending',
};

// ── Context type (public shape — unchanged for all consumers) ─────────────────

interface CycleContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  dayLogs: Record<string, DayLog>;
  saveDayLog: (date: string, log: Partial<DayLog>) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentCycle: CycleCalculationResult;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  posts: CommunityPost[];
  addPost: (title: string, content: string, tags: string[]) => void;
  togglePostLike: (postId: string) => void;
  togglePostBookmark: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  selectedPost: CommunityPost | null;
  setSelectedPost: (post: CommunityPost | null) => void;
  videos: VideoItem[];
  articles: ArticleItem[];
  selectedArticle: ArticleItem | null;
  setSelectedArticle: (article: ArticleItem | null) => void;
  appointment: DoctorAppointment;
  updateAppointment: (appt: Partial<DoctorAppointment>) => void;
  customMoodTags: string[];
  customSymptomTags: string[];
  addCustomTag: (category: 'mood' | 'symptom', tag: string) => void;
  removeCustomTag: (category: 'mood' | 'symptom', tag: string) => void;
  isLogSheetOpen: boolean;
  setIsLogSheetOpen: (open: boolean) => void;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

// ── Helper: load only the legacy fields from localStorage ─────────────────────

function loadLegacySettings(): LegacySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserSettings>;
      // Merge with defaults so missing keys are populated
      return {
        cycleLengthDays: parsed.cycleLengthDays ?? initialLegacySettings.cycleLengthDays,
        periodLengthDays: parsed.periodLengthDays ?? initialLegacySettings.periodLengthDays,
        lutealPhaseDays: parsed.lutealPhaseDays ?? initialLegacySettings.lutealPhaseDays,
        lastPeriodStartDate:
          parsed.lastPeriodStartDate ?? initialLegacySettings.lastPeriodStartDate,
        isPasscodeEnabled:
          parsed.isPasscodeEnabled ?? initialLegacySettings.isPasscodeEnabled,
        passcode: parsed.passcode ?? initialLegacySettings.passcode,
        isPremium: parsed.isPremium ?? initialLegacySettings.isPremium,
        hasCompletedBaseline:
          parsed.hasCompletedBaseline ?? initialLegacySettings.hasCompletedBaseline,
        baselineHealth: parsed.baselineHealth ?? initialLegacySettings.baselineHealth,
        notifications: parsed.notifications ?? initialLegacySettings.notifications,
        birthControl: parsed.birthControl ?? initialLegacySettings.birthControl,
        partnerSync: parsed.partnerSync ?? initialLegacySettings.partnerSync,
      };
    }
  } catch {
    // Corrupt storage
  }
  return initialLegacySettings;
}

// ── CycleProvider ─────────────────────────────────────────────────────────────

export const CycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean-slate purge of legacy mock data (unchanged from before)
  if (typeof window !== 'undefined') {
    const CLEAN_SLATE_KEY = 'luna_clean_slate_ready_v2';
    if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
          const s = JSON.parse(savedSettings);
          if (
            s.userName === 'Maya' ||
            s.userName === 'Jane Doe' ||
            s.userName === 'Sarah J.' ||
            s.email === 'maya.wellness@gmail.com' ||
            s.email === 'janedoe01@gmail.com' ||
            (s.avatarUrl &&
              (s.avatarUrl.includes('jane_doe') || s.avatarUrl.includes('avatar_sarah_j')))
          ) {
            localStorage.removeItem(STORAGE_KEY_SETTINGS);
            localStorage.removeItem(STORAGE_KEY_LOGS);
          }
        }
      } catch {
        // Safe failover
      }
      localStorage.setItem(CLEAN_SLATE_KEY, 'true');
    }
  }

  // ── Legacy-owned state (does NOT include the 10 profile/preference fields) ───
  const [legacySettings, setLegacySettings] = useState<LegacySettings>(loadLegacySettings);

  const [dayLogs, setDayLogs] = useState<Record<string, DayLog>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      return saved ? JSON.parse(saved) : initialPosts;
    } catch {
      return initialPosts;
    }
  });

  const [customMoodTags, setCustomMoodTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TAGS + '_moods');
      return saved
        ? JSON.parse(saved)
        : ['Happy', 'Calm', 'Anxiety', 'Sleepy', 'Focused', 'Fatigey', 'Excited', 'Energetic', 'Sad'];
    } catch {
      return ['Happy', 'Calm', 'Anxiety', 'Sleepy', 'Focused', 'Fatigey', 'Excited', 'Energetic', 'Sad'];
    }
  });

  const [customSymptomTags, setCustomSymptomTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TAGS + '_symptoms');
      return saved
        ? JSON.parse(saved)
        : ['Bloating', 'Cramps', 'Headache', 'Acne', 'Fatigue', 'Breast Tenderness', 'Cravings'];
    } catch {
      return ['Bloating', 'Cramps', 'Headache', 'Acne', 'Fatigue', 'Breast Tenderness', 'Cravings'];
    }
  });

  const [selectedDate, setSelectedDate] = useState<string>(formatDateToISO(new Date()));
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(initialArticles[0]);
  const [appointment, setAppointment] = useState<DoctorAppointment>(initialAppointment);
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);

  // ── Persist custom tags ───────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_TAGS + '_moods', JSON.stringify(customMoodTags)); } catch {}
  }, [customMoodTags]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_TAGS + '_symptoms', JSON.stringify(customSymptomTags)); } catch {}
  }, [customSymptomTags]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(dayLogs)); } catch {}
  }, [dayLogs]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts)); } catch {}
  }, [posts]);

  // ── Supabase + repo ───────────────────────────────────────────────────────────
  const { userId } = useAuth();
  const supabase = useSupabase();
  const cycleRepository = useMemo(
    () => (userId ? new CycleRepository(supabase, userId) : null),
    [supabase, userId],
  );

  // ── Legacy updater ────────────────────────────────────────────────────────────
  // NOTE: updateSettings (the public API) lives in CycleContextValue so it can
  // close over both setLegacySettings AND updateProfilePreferences in one scope.

  const saveDayLog = (date: string, log: Partial<DayLog>) => {
    setDayLogs(prev => {
      const existing = prev[date] || { date, moods: [], symptoms: [] };
      return { ...prev, [date]: { ...existing, ...log, date } };
    });
  };

  const togglePostLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const isLiked = !p.isLiked;
        return { ...p, isLiked, likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1) };
      }),
    );
    setSelectedPost(prev =>
      prev && prev.id === postId
        ? {
            ...prev,
            isLiked: !prev.isLiked,
            likesCount: !prev.isLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1),
          }
        : prev,
    );
  };

  const togglePostBookmark = (postId: string) => {
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p)));
  };

  const addCustomTag = (category: 'mood' | 'symptom', tag: string) => {
    if (!tag.trim()) return;
    if (category === 'mood') {
      setCustomMoodTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
    } else {
      setCustomSymptomTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
    }
  };

  const removeCustomTag = (category: 'mood' | 'symptom', tag: string) => {
    if (category === 'mood') {
      setCustomMoodTags(prev => prev.filter(t => t !== tag));
    } else {
      setCustomSymptomTags(prev => prev.filter(t => t !== tag));
    }
  };

  const updateAppointment = (appt: Partial<DoctorAppointment>) => {
    setAppointment(prev => ({ ...prev, ...appt }));
  };

  const initialNavigationView: AppView = legacySettings.hasCompletedBaseline
    ? 'HOME'
    : 'INITIAL_BASELINE_SETUP';

  // ── Inner component: reads both slices, composes settings, exposes CycleContext ─

  const CycleContextValue: React.FC = () => {
    const { currentView, setCurrentView } = useNavigation();
    const { profilePreferences, updateProfilePreferences } = useProfilePreferences();

    // Compose the full UserSettings shape for all consumers — unchanged public API.
    const settings: UserSettings = useMemo(
      () => ({ ...legacySettings, ...profilePreferences }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [legacySettings, profilePreferences],
    );

    // ── Persistence: single writer for STORAGE_KEY_SETTINGS ───────────────────
    // Writes the composed object so pre-extraction payloads are forward-compatible.
    useEffect(() => {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      } catch {}
    }, [settings]);

    // ── Supabase hydration ─────────────────────────────────────────────────────
    useEffect(() => {
      if (!userId) return;
      let isMounted = true;

      const hydrateUserData = async () => {
        try {
          // 1. Daily logs
          const { data: logsData, error: logsErr } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('clerk_user_id', userId);

          if (!logsErr && logsData && isMounted) {
            const remoteLogs: Record<string, DayLog> = {};
            for (const r of logsData) {
              remoteLogs[r.log_date] = {
                date: r.log_date,
                flow: r.flow || null,
                cervicalMucus: r.cervical_mucus || null,
                bbt: r.bbt || null,
                moods: r.moods || [],
                symptoms: r.symptoms || [],
                notes: r.notes || undefined,
              };
            }
            setDayLogs(remoteLogs);
          }

          // 2. Profile row — owned fields go to the slice; cycle fields to legacy.
          const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('clerk_user_id', userId)
            .maybeSingle();

          if (!profileErr && profileData && isMounted) {
            // Profile-owned fields → slice (single owner)
            updateProfilePreferences({
              ...(profileData.user_name ? { userName: profileData.user_name } : {}),
              ...(profileData.email ? { email: profileData.email } : {}),
              ...(profileData.temperature_unit
                ? { temperatureUnit: profileData.temperature_unit }
                : {}),
              ...(profileData.weight_unit ? { weightUnit: profileData.weight_unit } : {}),
            });

            // Legacy cycle fields → legacySettings
            setLegacySettings(prev => ({
              ...prev,
              cycleLengthDays: profileData.cycle_length_days || prev.cycleLengthDays,
              periodLengthDays: profileData.period_length_days || prev.periodLengthDays,
              lutealPhaseDays: profileData.luteal_phase_days || prev.lutealPhaseDays,
              hasCompletedBaseline: true,
            }));
          }

          // 3. Latest cycle via repository → legacy
          const latestCycle = cycleRepository ? await cycleRepository.loadLatest() : null;
          if (latestCycle && isMounted) {
            setLegacySettings(prev => ({
              ...prev,
              lastPeriodStartDate: latestCycle.startDate,
              cycleLengthDays: latestCycle.cycleLengthDays || prev.cycleLengthDays,
              periodLengthDays: latestCycle.periodLengthDays || prev.periodLengthDays,
            }));
          }
        } catch (err) {
          console.error('[CycleContext] Hydration error:', err);
        }
      };

      hydrateUserData();
      return () => { isMounted = false; };
    // updateProfilePreferences is stable (from useState setter), safe in deps.
    }, [userId, updateProfilePreferences]);

    // ── updateSettings: split patch by owner ──────────────────────────────────
    // Both halves are applied synchronously inside one event-loop tick so
    // consumers never observe a half-applied patch.
    const updateSettings = (patch: Partial<UserSettings>) => {
      const profilePatch: Partial<ProfilePreferences> = {};
      const legacyPatch: Partial<LegacySettings> = {};

      for (const key of Object.keys(patch) as Array<keyof UserSettings>) {
        if (PROFILE_PREFERENCE_KEYS.has(key as keyof ProfilePreferences)) {
          (profilePatch as Record<string, unknown>)[key] = patch[key];
        } else {
          (legacyPatch as Record<string, unknown>)[key] = patch[key];
        }
      }

      if (Object.keys(profilePatch).length > 0) updateProfilePreferences(profilePatch);
      if (Object.keys(legacyPatch).length > 0) setLegacySettings(prev => ({ ...prev, ...legacyPatch }));
    };

    // ── Community helpers (read display name / avatar from composed settings) ──
    const addPost = (title: string, content: string, tags: string[]) => {
      const newPost: CommunityPost = {
        id: `post_${Date.now()}`,
        authorName: settings.userName || 'Community Member',
        authorAvatar: settings.avatarUrl || '',
        timeAgo: 'Just now',
        title: title || 'Community Reflection',
        content,
        tags: tags.length > 0 ? tags : ['#CycleTracking'],
        likesCount: 0,
        isLiked: false,
        isBookmarked: false,
        comments: [],
      };
      setPosts(prev => [newPost, ...prev]);
    };

    const addComment = (postId: string, content: string) => {
      const newComment = {
        id: `c_${Date.now()}`,
        authorName: settings.userName || 'You',
        authorAvatar: settings.avatarUrl || '',
        timeAgo: 'Just now',
        content,
      };
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p)),
      );
      setSelectedPost(prev =>
        prev && prev.id === postId
          ? { ...prev, comments: [...prev.comments, newComment] }
          : prev,
      );
    };

    // ── Cycle calculation ──────────────────────────────────────────────────────
    const currentCycle = calculateCycleInfo(
      legacySettings.lastPeriodStartDate,
      legacySettings.cycleLengthDays,
      legacySettings.periodLengthDays,
      legacySettings.lutealPhaseDays,
      new Date(),
    );

    return (
      <CycleContext.Provider
        value={{
          settings,
          updateSettings,
          dayLogs,
          saveDayLog,
          selectedDate,
          setSelectedDate,
          currentCycle,
          currentView,
          setCurrentView,
          posts,
          addPost,
          togglePostLike,
          togglePostBookmark,
          addComment,
          selectedPost,
          setSelectedPost,
          videos: initialVideos,
          articles: initialArticles,
          selectedArticle,
          setSelectedArticle,
          appointment,
          updateAppointment,
          customMoodTags,
          customSymptomTags,
          addCustomTag,
          removeCustomTag,
          isLogSheetOpen,
          setIsLogSheetOpen,
        }}
      >
        {children}
      </CycleContext.Provider>
    );
  };

  // ── Mount order: ProfilePreferencesProvider > NavigationProvider > CycleContextValue ──
  return (
    <ProfilePreferencesProvider>
      <NavigationProvider initialView={initialNavigationView}>
        <CycleContextValue />
      </NavigationProvider>
    </ProfilePreferencesProvider>
  );
};

// ── Public hook (unchanged API) ───────────────────────────────────────────────

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};
