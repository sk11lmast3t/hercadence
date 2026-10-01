import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Calendar, 
  User, 
  Home, 
  HeartPulse, 
  MessageSquare, 
  Settings, 
  BookOpen, 
  Layers, 
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  Activity, 
  FileText, 
  Thermometer, 
  Pill, 
  TrendingUp, 
  Video, 
  Stethoscope, 
  CheckCircle2, 
  ShieldAlert, 
  Users, 
  SlidersHorizontal, 
  Bell, 
  Smartphone, 
  Tag, 
  Lock, 
  Crown, 
  Compass, 
  Key, 
  Smile,
  Check,
  Droplet,
  History,
  Dumbbell,
  ShieldCheck,
  Moon,
  HelpCircle,
  Scale,
  Trash2,
  WifiOff,
  Star,
  Receipt,
  KeyRound,
  CreditCard,
  Heart,
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ScreenItem {
  id: AppView;
  title: string;
  category: 'Home & Core' | 'Calendar & Fertility' | 'Insights & Wellness' | 'Care & Clinical' | 'Community' | 'Profile & Settings' | 'Onboarding';
  description: string;
  badge?: string;
  icon?: React.ElementType;
}

interface ScreenDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: AppView) => void;
  currentView: AppView;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  'Home & Core': { label: 'Home & Core', icon: Home, bg: 'bg-[#FCECEE]', text: 'text-[#8C525E]' },
  'Calendar & Fertility': { label: 'Calendar & Fertility', icon: Calendar, bg: 'bg-[#EAF2ED]', text: 'text-[#3E614D]' },
  'Insights & Wellness': { label: 'Insights & Wellness', icon: Sparkles, bg: 'bg-[#EDE8F2]', text: 'text-[#543649]' },
  'Care & Clinical': { label: 'Care & Clinical', icon: HeartPulse, bg: 'bg-[#FBF0EB]', text: 'text-[#A0523C]' },
  'Community': { label: 'Community', icon: MessageSquare, bg: 'bg-[#EBF4FA]', text: 'text-[#34668A]' },
  'Profile & Settings': { label: 'Profile & Settings', icon: User, bg: 'bg-[#F5EDDD]', text: 'text-[#8B6B38]' },
  'Onboarding': { label: 'Onboarding', icon: Compass, bg: 'bg-[#F7EBEF]', text: 'text-[#7B4458]' }
};

export const ScreenDirectoryModal: React.FC<ScreenDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  currentView
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const screens: ScreenItem[] = [
    // Home & Core
    {
      id: 'HOME',
      title: 'Cycle Forecast (Home)',
      category: 'Home & Core',
      description: "Silk waves header, High Energy forecast, Mood, Focus, Comfort & Wellness tip of the day",
      badge: 'Current Home',
      icon: Sparkles
    },
    {
      id: 'HARMONIZED_DASHBOARD',
      title: 'Circular Gauge Dashboard',
      category: 'Home & Core',
      description: 'Luteal phase ring countdown, 12 days until period, quick log shortcuts',
      icon: Activity
    },
    {
      id: 'HARMONIZED_HOME',
      title: 'Fertile Window & Symptoms Grid',
      category: 'Home & Core',
      description: 'Phase progress bar, Chance of getting pregnant card, logged symptoms chips',
      icon: Calendar
    },
    {
      id: 'CLASSIC_HOME',
      title: 'Classic Home Dashboard',
      category: 'Home & Core',
      description: 'Original high-contrast circular countdown gauge and symptom status cards',
      icon: Home
    },
    {
      id: 'FEELING_TODAY',
      title: 'Mood & Emotional Well-Being',
      category: 'Home & Core',
      description: 'Multi-emotion selector, emotional drivers check, and daily gratitude journaling',
      icon: Smile
    },
    {
      id: 'FOCUS_ENERGY_TRACKER',
      title: 'Focus & Mental Energy Tracker',
      category: 'Home & Core',
      description: 'Sustained attention meter, flow boosters, brain fog checklist, and phase correlation',
      badge: 'New',
      icon: Activity
    },
    {
      id: 'PHYSICAL_COMFORT_TRACKER',
      title: 'Physical Comfort & Somatic Tracker',
      category: 'Home & Core',
      description: 'Tactile somatic ease rating, targeted anatomical body zones, and relief interventions',
      badge: 'New',
      icon: Heart
    },
    {
      id: 'NOTIFICATION_INBOX',
      title: 'Activity & Notification Center',
      category: 'Home & Core',
      description: 'Twilight waves banner, period warnings, partner sync reactions, and clinical reminder alerts',
      badge: 'New',
      icon: Bell
    },
    {
      id: 'OFFLINE_SYNC',
      title: 'Offline Sync & Protection',
      category: 'Home & Core',
      description: 'Sage mist banner, local encrypted storage status, pending sync queue, and connection testing',
      badge: 'New',
      icon: WifiOff
    },
    {
      id: 'NOT_FOUND_404',
      title: 'Content Not Found (404)',
      category: 'Home & Core',
      description: 'Gentle recovery screen for missing or archived cycle notes with quick home and search shortcuts',
      badge: 'New',
      icon: Compass
    },
    {
      id: 'WHATS_NEW',
      title: "What's New in Version 2.4",
      category: 'Home & Core',
      description: 'Release notes showcase: 5-level cramps ruler, body metrics trend curves, and morning/night supplement stacks',
      badge: 'New',
      icon: Sparkles
    },

    // Calendar & Fertility
    {
      id: 'CALENDAR',
      title: 'Daily Calendar & Log',
      category: 'Calendar & Fertility',
      description: 'Interactive monthly cycle calendar with phase color dots and selected day overview',
      icon: Calendar
    },
    {
      id: 'HARMONIZED_CALENDAR',
      title: 'Harmonized Wave Calendar',
      category: 'Calendar & Fertility',
      description: 'Frosted calendar card with wave backdrop and detailed daily health tags',
      icon: Calendar
    },
    {
      id: 'FERTILITY_DETAIL',
      title: 'Fertility & Ovulation Detail',
      category: 'Calendar & Fertility',
      description: 'Detailed fertile window breakdown, LH surge predictor, and conception probability',
      icon: HeartPulse
    },
    {
      id: 'BBT_LOG',
      title: 'Basal Body Temp (BBT) Log',
      category: 'Calendar & Fertility',
      description: 'Biphasic temperature curve charting, thermometer sync, and cervical mucus tracking',
      icon: Thermometer
    },
    {
      id: 'BIRTH_CONTROL',
      title: 'Birth Control & Pill Tracker',
      category: 'Calendar & Fertility',
      description: 'Pill pack 28-day grid, daily reminder countdown, and adherence streak',
      icon: Pill
    },
    {
      id: 'MUCUS_LOG',
      title: 'Cervical Mucus Observation Log',
      category: 'Calendar & Fertility',
      description: 'Track cycle patterns, creamy/egg white/sticky observation cards, sensation and notes',
      badge: 'New',
      icon: Droplet
    },
    {
      id: 'SYMPTOM_HISTORY',
      title: 'Symptom History Journal',
      category: 'Calendar & Fertility',
      description: 'Monthly phase-grouped log (Follicular, Luteal, Menstrual) with rose intensity dot ratings',
      badge: 'New',
      icon: History
    },
    {
      id: 'SYMPTOM_INTENSITY_LOG',
      title: 'Cramps & Symptom Intensity Log',
      category: 'Calendar & Fertility',
      description: 'Lilac & seafoam watercolor waves, 5-level vertical intensity ruler, custom triggers, and remedy notes',
      badge: 'New',
      icon: Activity
    },

    // Insights & Wellness
    {
      id: 'CYCLE_SYNCED_FITNESS',
      title: 'Cycle-Synced Fitness & Nutrition',
      category: 'Insights & Wellness',
      description: 'Phase-specific training intensities, low-cortisol workouts, and hormone-balancing recipes',
      badge: 'Pro',
      icon: Dumbbell
    },
    {
      id: 'INSIGHTS',
      title: 'Modernized Insights & Waves',
      category: 'Insights & Wellness',
      description: 'Symptom trends with fluid ribbons, Cycle consistency gauge, and 29.6 Wellness Score',
      badge: 'Current Insights',
      icon: Sparkles
    },
    {
      id: 'HARMONIZED_INSIGHTS',
      title: 'Harmonized Weekly Trends',
      category: 'Insights & Wellness',
      description: '7-day wellness bars, cycle curve milestones, and sleep quality analytics',
      icon: Activity
    },
    {
      id: 'CLASSIC_INSIGHTS',
      title: 'Classic Mood & Energy Dual Wave',
      category: 'Insights & Wellness',
      description: 'Overlapping 30-day sinusoidal wave charts and key monthly metrics',
      icon: TrendingUp
    },
    {
      id: 'PERSONALIZED_INSIGHTS',
      title: 'Personalized Cycle Health Insights',
      category: 'Insights & Wellness',
      description: 'Pattern detection: luteal fatigue correlation, migraine triggers, and sleep notes',
      icon: Sparkles
    },
    {
      id: 'LUTEAL_ARTICLE',
      title: 'Luteal Phase Nutrition Guide',
      category: 'Insights & Wellness',
      description: 'Magnesium-rich foods, complex carbs, and cycle-syncing dietary recommendations',
      icon: BookOpen
    },
    {
      id: 'VIDEO_LIBRARY',
      title: 'Discovery Video Library',
      category: 'Insights & Wellness',
      description: 'Yoga for cramps, guided pelvic floor meditations, and breathwork flows',
      icon: Video
    },
    {
      id: 'HYDRATION_TRACKER',
      title: 'Hydration Tracker',
      category: 'Insights & Wellness',
      description: 'Fluid marble waves, 3D water droplet level, quick 250ml/500ml logging, and daily goal progress',
      badge: 'New',
      icon: Droplet
    },
    {
      id: 'NUTRITION_CYCLE',
      title: 'Nutrition for Cycle',
      category: 'Insights & Wellness',
      description: 'Cycle phase superfoods, hormone-balancing smoothies, phase articles, and soups',
      badge: 'New',
      icon: Sparkles
    },
    {
      id: 'PHYSICAL_ACTIVITY',
      title: 'Physical Activity',
      category: 'Insights & Wellness',
      description: 'Silk waves, 7,500 steps 75% radial ring, workouts & calories metrics, and weekly activity bar chart',
      badge: 'New',
      icon: Dumbbell
    },
    {
      id: 'PREGNANCY_MODE',
      title: 'Pregnancy Mode',
      category: 'Insights & Wellness',
      description: 'Week 12 lime hero illustration, baby growth comparisons, daily tip, and symptom check-in',
      badge: 'New',
      icon: Sparkles
    },
    {
      id: 'SEARCH_HUB',
      title: 'Search Hub',
      category: 'Insights & Wellness',
      description: 'Pastel fluid watercolor header, unified articles, video yoga flows, and community discussions',
      badge: 'New',
      icon: Search
    },
    {
      id: 'SLEEP_INSIGHTS',
      title: 'Sleep Insights & Quality',
      category: 'Insights & Wellness',
      description: 'Twilight silk waves, 85% good sleep horseshoe gauge, and deep/REM/awake phase bars',
      badge: 'New',
      icon: Moon
    },
    {
      id: 'BODY_METRICS',
      title: 'Body Metrics & Weight Tracker',
      category: 'Insights & Wellness',
      description: 'Periwinkle ribbon waves, 135.2 lbs current weight, 30-day luteal cycle flux trend curve, and unit toggling',
      badge: 'New',
      icon: Scale
    },

    // Care & Clinical
    {
      id: 'SUPPLEMENT_TRACKER',
      title: 'Supplement Tracker Ritual',
      category: 'Care & Clinical',
      description: 'Morning & Night stacks, D3, Omega-3, Probiotics, Magnesium, herbal toggles, and ritual builder',
      badge: 'New',
      icon: Pill
    },
    {
      id: 'MEDICATION_TRACKER',
      title: 'Medication & Supplements',
      category: 'Care & Clinical',
      description: "Today's schedule (Prenatal, Levothyroxine, Magnesium), take toggles, and pharmacy cabinet refills",
      badge: 'New',
      icon: Pill
    },
    {
      id: 'MEDICATION_HISTORY',
      title: 'Medication History',
      category: 'Care & Clinical',
      description: 'Vertical timeline journal with dates, dosage times, taken badges, and filter chips',
      badge: 'New',
      icon: History
    },
    {
      id: 'DOCTORS_CARE_TEAM',
      title: 'Doctors & Care Team',
      category: 'Care & Clinical',
      description: 'OB/GYN profiles, endocrinologist roster, message clinic, and appointments',
      icon: Stethoscope
    },
    {
      id: 'APPOINTMENT_DETAIL',
      title: 'Doctor Appointment Detail',
      category: 'Care & Clinical',
      description: 'Appointment date/time, clinic location, pre-visit checklist, and cycle report attachment',
      icon: Calendar
    },
    {
      id: 'EXPORT_HEALTH_REPORT',
      title: 'Export Health Report (PDF)',
      category: 'Care & Clinical',
      description: 'Generate clinical summary PDF with cycle regularity, symptom logs, and BBT charts',
      icon: FileText
    },
    {
      id: 'EXPORT_SUCCESS',
      title: 'Report Export Success',
      category: 'Care & Clinical',
      description: 'Download, print, or email your encrypted PDF report to your practitioner',
      icon: CheckCircle2
    },
    {
      id: 'EMERGENCY_HELP',
      title: 'Emergency Help & Crisis Lines',
      category: 'Care & Clinical',
      description: '24/7 Nurse helpline, severe pain assessment, crisis support, and urgent care directory',
      icon: ShieldAlert
    },

    // Community
    {
      id: 'COMMUNITY',
      title: 'Community Gateway',
      category: 'Community',
      description: 'Discussion feed, popular wellness topics, bookmarking, and member replies',
      icon: MessageSquare
    },
    {
      id: 'CREATE_POST',
      title: 'Create Community Post',
      category: 'Community',
      description: 'Draft discussions, select tags (PCOS, Nutrition, Fertility), and share advice',
      icon: MessageSquare
    },
    {
      id: 'POST_DETAIL',
      title: 'Post & Comments Detail',
      category: 'Community',
      description: 'Full conversation thread, member responses, and supportive upvoting',
      icon: MessageSquare
    },
    {
      id: 'PARTNER_SYNC',
      title: 'Partner Sync & Sharing',
      category: 'Community',
      description: 'Pair with partner via secure code, customize phase updates, and shared intimacy log',
      icon: Users
    },

    // Profile & Settings
    {
      id: 'PROFILE',
      title: 'User Profile & Settings',
      category: 'Profile & Settings',
      description: 'Personal photo, Add to Home Screen app install, Preferences, Notifications, Help & Logout',
      badge: 'Account',
      icon: User
    },
    {
      id: 'HEALTH_PROFILE',
      title: 'Medical Health Profile',
      category: 'Profile & Settings',
      description: 'Blood type, diagnoses (PCOS, Endometriosis), allergies, cycle history stats',
      icon: HeartPulse
    },
    {
      id: 'APP_PREFERENCES',
      title: 'Cycle Settings & Preferences',
      category: 'Profile & Settings',
      description: 'Cycle length, period duration, start of week, temperature units (°C/°F)',
      icon: SlidersHorizontal
    },
    {
      id: 'NOTIFICATIONS',
      title: 'Notification & Period Alerts',
      category: 'Profile & Settings',
      description: 'Period countdown reminders, fertile window alerts, medication timing',
      icon: Bell
    },
    {
      id: 'CONNECTED_DEVICES',
      title: 'Connected Wearables & Devices',
      category: 'Profile & Settings',
      description: 'Apple Health, Oura Ring, Whoop, Garmin, smart thermometer sync',
      icon: Smartphone
    },
    {
      id: 'CUSTOM_TAGS',
      title: 'Custom Symptom Tags',
      category: 'Profile & Settings',
      description: 'Manage personal symptom labels, dietary triggers, and flow intensities',
      icon: Tag
    },
    {
      id: 'PASSCODE_LOCK',
      title: 'Passcode & Biometric Lock',
      category: 'Profile & Settings',
      description: '4-digit PIN security, Face ID / Fingerprint protection for health data',
      icon: Lock
    },
    {
      id: 'PREMIUM',
      title: 'Premium Membership',
      category: 'Profile & Settings',
      description: 'Advanced hormone analytics, unlimited PDF exports, and direct provider chat',
      icon: Crown
    },
    {
      id: 'PARTNER_SYNC_DETAILS',
      title: 'Partner Sync Profile',
      category: 'Profile & Settings',
      description: 'Shared cycle phase dual slider, partner notes & reminders, upcoming important dates',
      badge: 'New',
      icon: Users
    },
    {
      id: 'DATA_PRIVACY_SECURITY',
      title: 'Data Privacy & Security',
      category: 'Profile & Settings',
      description: 'Blush gold marble banner, end-to-end encryption details, third-party sharing status, and account deletion',
      badge: 'New',
      icon: ShieldCheck
    },
    {
      id: 'DELETE_ACCOUNT',
      title: 'Delete Account & Data',
      category: 'Profile & Settings',
      description: 'Luna Wellness plum header, permanent deletion confirmation modal with DELETE safeguard verification',
      badge: 'New',
      icon: Trash2
    },
    {
      id: 'SUPPORT_FAQ',
      title: 'Help & FAQs Support Hub',
      category: 'Profile & Settings',
      description: 'Gold fluid ribbons banner, searchable FAQs, interactive Live Chat, and 24h Email support',
      badge: 'New',
      icon: HelpCircle
    },
    {
      id: 'EDIT_PROFILE',
      title: 'Edit Profile & Personal Info',
      category: 'Profile & Settings',
      description: 'Avatar photo uploader, pronouns, date of birth, and linked Apple/Google accounts',
      badge: 'New',
      icon: User
    },
    {
      id: 'TRIAL_PAYWALL',
      title: '7-Day Free Trial Paywall',
      category: 'Profile & Settings',
      description: 'Luxury plum & gold banner, annual/monthly plan toggles, and premium feature breakdown table',
      badge: 'New',
      icon: Crown
    },
    {
      id: 'MANAGE_BILLING',
      title: 'Manage Subscription & Invoices',
      category: 'Profile & Settings',
      description: 'Apple Pay billing status, renewal date, past payment receipts, and download PDF invoices',
      badge: 'New',
      icon: Receipt
    },
    {
      id: 'APP_REVIEW',
      title: 'App Store Rating & Feedback',
      category: 'Profile & Settings',
      description: 'Interactive 5-star rating sheet with dynamic routing for App Store reviews or direct feedback',
      badge: 'New',
      icon: Star
    },
    {
      id: 'TERMS_CLINICAL_DISCLAIMER',
      title: 'Terms & Clinical Disclaimer',
      category: 'Profile & Settings',
      description: 'Non-diagnostic medical limitations, contraception safety warnings, and emergency protocol notices',
      badge: 'New',
      icon: ShieldAlert
    },
    {
      id: 'CLASSIC_PROFILE',
      title: 'Classic Profile Hub',
      category: 'Profile & Settings',
      description: 'Original high-contrast profile menu with direct clinical links',
      icon: User
    },

    // Onboarding
    {
      id: 'INITIAL_BASELINE_SETUP',
      title: 'Initial Baseline Data Collection',
      category: 'Onboarding',
      description: 'First launch onboarding: Collects weight, height, age, average cycle length, period duration, symptoms & goals',
      badge: 'Onboarding',
      icon: Scale
    },
    {
      id: 'KOTLIN_ANDROID_CODE',
      title: 'Kotlin Android Native Codebase',
      category: 'Profile & Settings',
      description: 'Explore and copy the full native Kotlin codebase: Jetpack Compose, Room SQLite, ViewModel, Coroutines',
      badge: 'Native Android',
      icon: Code2
    },
    {
      id: 'FORGOT_PASSWORD',
      title: 'Forgot & Reset Password',
      category: 'Onboarding',
      description: 'Self-serve recovery: email entry, 6-digit verification code, and password strength meter',
      badge: 'New',
      icon: KeyRound
    },
    {
      id: 'WELLNESS_REMINDERS_PERMISSION',
      title: 'Wellness Reminders Permission',
      category: 'Onboarding',
      description: 'Unlock Your Wellness Journey notification prompt modal with leaf-bell accent',
      badge: 'New',
      icon: Bell
    },
    {
      id: 'ONBOARDING_WELCOME',
      title: 'Welcome Walkthrough',
      category: 'Onboarding',
      description: 'First-time setup: Welcome to your harmonious cycle wellness companion',
      icon: Compass
    },
    {
      id: 'ONBOARDING_UNDERSTOOD',
      title: 'Your Cycle Understood',
      category: 'Onboarding',
      description: 'Interactive hormone wave explanation: Follicular, Ovulation, and Luteal phases',
      icon: Activity
    },
    {
      id: 'ONBOARDING_TRACK_EASE',
      title: 'Track with Ease',
      category: 'Onboarding',
      description: 'Overview of single-tap logging for flow, moods, and energy',
      icon: Sparkles
    },
    {
      id: 'ONBOARDING_SUCCESS',
      title: 'Setup Complete & Ready',
      category: 'Onboarding',
      description: 'Personalized cycle prediction calibrated and ready for daily use',
      icon: CheckCircle2
    },
    {
      id: 'LOGIN_GATEWAY',
      title: 'Login & Authentication',
      category: 'Onboarding',
      description: 'Biometric sign-in, email login, and account recovery',
      icon: Key
    }
  ];

  const categories = [
    'All',
    'Home & Core',
    'Calendar & Fertility',
    'Insights & Wellness',
    'Care & Clinical',
    'Community',
    'Profile & Settings',
    'Onboarding'
  ];

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const checkCategoryScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 8);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  // Update indicators on mount, resize, and scroll
  useEffect(() => {
    if (!isOpen) return;
    const el = categoryScrollRef.current;
    if (!el) return;

    // Small delay to allow layout calculations
    const timer = setTimeout(checkCategoryScroll, 60);
    el.addEventListener('scroll', checkCategoryScroll, { passive: true });
    window.addEventListener('resize', checkCategoryScroll);

    // Wheel support for horizontal scrolling
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.85;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkCategoryScroll);
      window.removeEventListener('resize', checkCategoryScroll);
      el.removeEventListener('wheel', onWheel);
    };
  }, [isOpen, checkCategoryScroll]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    const offset = direction === 'left' ? -200 : 200;
    categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategory(cat);
    if (e?.currentTarget && categoryScrollRef.current) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
    listScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleListScroll = () => {
    if (listScrollRef.current) {
      setShowBackToTop(listScrollRef.current.scrollTop > 240);
    }
  };

  const filteredScreens = useMemo(() => {
    return screens.filter((screen) => {
      const matchesCategory = selectedCategory === 'All' || screen.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || 
        screen.title.toLowerCase().includes(query) || 
        screen.description.toLowerCase().includes(query) ||
        screen.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#311827]/40 backdrop-blur-md transition-all">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[520px] max-h-[88vh] bg-[#FAF7F2] rounded-[32px] sm:rounded-[36px] border border-[#E8DDD5] shadow-[0_24px_64px_rgba(43,24,37,0.18)] flex flex-col overflow-hidden text-[#1E191D]"
      >
        {/* Header with Warm Silk Glow */}
        <div className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-4 bg-gradient-to-b from-[#F6EBE6] via-[#FAF7F2] to-[#FAF7F2] border-b border-[#EDE5DF]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-[#EDE5DF] flex items-center justify-center text-[#543649]">
                <Layers size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-[22px] sm:text-[24px] font-bold text-[#4B3041] tracking-tight leading-tight">
                    All Application Pages
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#543649] text-white">
                    {screens.length}
                  </span>
                </div>
                <p className="text-[12.5px] text-[#7A6C74] font-medium mt-0.5">
                  Explore and test every view &amp; clinical tool
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#543649] border border-[#EDE5DF] shadow-2xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
              title="Close Directory"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Search Bar - Warm & Organic */}
          <div className="mt-4">
            <div className="relative flex items-center bg-white rounded-2xl border border-[#E5DAD1] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-[#543649] focus-within:ring-2 focus-within:ring-[#543649]/10 transition-all">
              <Search size={16} className="absolute left-3.5 text-[#8A7983]" />
              <input
                type="text"
                placeholder="Search by title, symptom, or tool (e.g., Doctor, BBT, Devices)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2.5 bg-transparent text-[13px] sm:text-[13.5px] text-[#20171D] placeholder-[#9E9098] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[11px] font-semibold text-[#8A7983] hover:text-[#543649] bg-[#F2ECE7] hover:bg-[#E8DFD9] px-2 py-0.5 rounded-full transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills (Smooth Horizontal Bar with Wheel & Arrows) */}
        <div className="relative border-b border-[#F0EBE6] bg-white/50 backdrop-blur-xs">
          {/* Left scroll fade & arrow button */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent z-10 flex items-center pl-2"
              >
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="w-6 h-6 rounded-full bg-white shadow-md border border-[#EDE5DF] text-[#543649] flex items-center justify-center hover:bg-[#FAF5F2] active:scale-90 transition-all cursor-pointer"
                  title="Scroll categories left"
                >
                  <ChevronLeft size={13} strokeWidth={2.4} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right scroll fade & arrow button */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent z-10 flex items-center justify-end pr-2"
              >
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="w-6 h-6 rounded-full bg-white shadow-md border border-[#EDE5DF] text-[#543649] flex items-center justify-center hover:bg-[#FAF5F2] active:scale-90 transition-all cursor-pointer"
                  title="Scroll categories right"
                >
                  <ChevronRight size={13} strokeWidth={2.4} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal scroll container */}
          <div
            ref={categoryScrollRef}
            className="px-5 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const config = CATEGORY_CONFIG[cat];
              const CategoryIcon = config ? config.icon : Layers;
              const count = cat === 'All' ? screens.length : screens.filter(s => s.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => handleSelectCategory(cat, e)}
                  className={`relative px-3 py-1.5 rounded-full whitespace-nowrap text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
                    isSelected
                      ? 'text-white shadow-2xs'
                      : 'bg-white/80 border border-[#EDE5DF] text-[#6A5A65] hover:bg-white hover:text-[#4B3041]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryPillBubble"
                      className="absolute inset-0 bg-[#543649] rounded-full -z-10 shadow-2xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <CategoryIcon size={13} strokeWidth={isSelected ? 2.2 : 1.8} />
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-[#F2EAE4] text-[#7A6C74]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Screen List - Luxurious Cards with Smooth Animated Transitions */}
        <div 
          ref={listScrollRef}
          onScroll={handleListScroll}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-3.5 space-y-2.5 overscroll-contain scroll-smooth custom-smooth-scroll relative"
        >
          {filteredScreens.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-[#F5EFEA] text-[#8C7A84] flex items-center justify-center mx-auto mb-3">
                <Search size={20} />
              </div>
              <h3 className="font-serif text-[17px] font-bold text-[#4B3041]">
                No matching screens found
              </h3>
              <p className="text-[12.5px] text-[#7A6C74] max-w-[280px] mx-auto mt-1">
                Try searching for a different keyword like "care", "bbt", "calendar", or "profile".
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-3.5 px-4 py-1.5 rounded-full bg-[#543649] text-white text-[12px] font-medium hover:opacity-95 cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}_${searchQuery || 'all'}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2.5"
              >
                {filteredScreens.map((screen, index) => {
                  const isCurrent = currentView === screen.id;
                  const catConfig = CATEGORY_CONFIG[screen.category];
                  const IconComponent = screen.icon || (catConfig ? catConfig.icon : Layers);
                  const badgeBg = catConfig ? catConfig.bg : 'bg-[#EDE8F2]';
                  const badgeText = catConfig ? catConfig.text : 'text-[#543649]';

                  return (
                    <motion.div
                      key={screen.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(index * 0.018, 0.15),
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      whileHover={{ y: -1.5, transition: { duration: 0.12 } }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        onSelectView(screen.id);
                        onClose();
                      }}
                      className={`p-3.5 sm:p-4 rounded-[24px] cursor-pointer transition-all border flex items-start justify-between gap-3.5 group ${
                        isCurrent 
                          ? 'bg-gradient-to-r from-[#FBF2F4] to-[#FAF4F7] border-[#DDBEC7] shadow-[0_4px_16px_rgba(84,54,73,0.08)]' 
                          : 'bg-white hover:bg-[#FFFFFF] border-[#EDE5DF] hover:border-[#DCCEC4] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_22px_rgba(60,35,50,0.06)]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Category Icon Badge */}
                        <div className={`w-10 h-10 rounded-2xl ${badgeBg} ${badgeText} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}>
                          <IconComponent size={18} strokeWidth={2} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-[14.5px] sm:text-[15px] text-[#20171D] group-hover:text-[#543649] transition-colors">
                              {screen.title}
                            </span>

                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#543649] text-white flex items-center gap-1">
                                <Check size={11} strokeWidth={2.5} />
                                Active View
                              </span>
                            )}

                            {screen.badge && !isCurrent && (
                              <span className="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EADFD7] text-[#543649]">
                                {screen.badge}
                              </span>
                            )}
                          </div>

                          <p className="text-[12px] text-[#6A5D66] leading-relaxed line-clamp-2">
                            {screen.description}
                          </p>

                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10.5px] font-semibold text-[#8A7983] bg-[#FAF6F2] px-2 py-0.5 rounded-full border border-[#F0EAE4]">
                              {screen.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Arrow */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all mt-1 ${
                        isCurrent 
                          ? 'bg-[#543649] text-white' 
                          : 'bg-[#FAF5F1] text-[#9E8F98] group-hover:bg-[#543649] group-hover:text-white group-hover:translate-x-0.5'
                      }`}>
                        <ChevronRight size={15} strokeWidth={2.2} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Floating Back to Top Button */}
          <AnimatePresence>
            {showBackToTop && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                className="sticky bottom-2 flex justify-end pointer-events-none z-20"
              >
                <button
                  type="button"
                  onClick={() => listScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#543649] hover:bg-[#432839] text-white text-[11.5px] font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <ArrowUp size={13} strokeWidth={2.5} />
                  <span>Back to Top</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Refined Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#EDE5DF] bg-white/80 backdrop-blur-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#7A6C74] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#41624F]" />
            <span>Showing <strong className="text-[#20171D]">{filteredScreens.length}</strong> of {screens.length} total screens</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#543649] hover:bg-[#432839] text-white font-medium text-[12px] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </motion.div>
    </div>
  );
};

