export type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION' | 'LUTEAL';

export interface DayLog {
  date: string; // YYYY-MM-DD
  flow?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
  moods: string[];
  symptoms: string[];
  bbt?: number | null; // e.g. 36.6 or 97.8
  weight?: number | null; // daily logged weight
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'egg_white' | null;
  intimacy?: boolean;
  notes?: string;
  pillTaken?: boolean;
  focus?: string;
  focusLevel?: number;
  physicalComfort?: string;
  comfortLevel?: number;
}

export interface UserBaselineHealth {
  weight?: number;
  weightUnit?: 'kg' | 'lb';
  heightCm?: number;
  heightFeet?: number;
  heightInches?: number;
  heightUnit?: 'cm' | 'ft_in';
  age?: number;
  birthDate?: string;
  cycleRegularity?: 'Regular' | 'Somewhat Regular' | 'Irregular' | 'Not Sure';
  averageCycleLength?: number;
  averagePeriodLength?: number;
  primaryGoals?: string[];
  typicalSymptoms?: string[];
  sleepHoursBaseline?: number;
  activityLevel?: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  birthControlMethod?: string;
  completedAt?: string;
}

export interface UserSettings {
  userName: string;
  email: string;
  avatarUrl?: string;
  cycleLengthDays: number; // e.g. 28
  periodLengthDays: number; // e.g. 5
  lutealPhaseDays: number; // e.g. 14
  lastPeriodStartDate: string; // YYYY-MM-DD
  temperatureUnit: 'Celsius' | 'Fahrenheit';
  weightUnit: 'kg' | 'lb';
  startDayOfWeek: 'Sunday' | 'Monday';
  showWeekNumbers: boolean;
  language: string;
  region: string;
  isPasscodeEnabled: boolean;
  passcode?: string;
  isPremium: boolean;
  selectedGoal: 'PERIOD' | 'OVULATION' | 'PREGNANCY' | 'WELLNESS';
  hasCompletedBaseline?: boolean;
  baselineHealth?: UserBaselineHealth;
  notifications: {
    periodReminders: boolean;
    fertileWindowAlerts: boolean;
    pillReminders: boolean;
    dailyLogPrompt: boolean;
    periodReminderDaysBefore: number;
    pillReminderTime: string;
  };
  birthControl: {
    type: 'Pill' | 'IUD' | 'Implant' | 'Ring' | 'Patch' | 'Natural';
    brandName: string;
    packTotalPills: number;
    currentPillIndex: number;
    reminderTime: string;
    lastTakenTimestamp?: string;
    streakDays: number;
  };
  partnerSync: {
    isEnabled: boolean;
    partnerCode: string;
    connectedPartnerName?: string;
    sharePhase: boolean;
    shareSymptoms: boolean;
    shareMoods: boolean;
    shareNotes: boolean;
  };
}

export interface CycleCalculationResult {
  currentDayOfCycle: number;
  currentPhase: CyclePhase;
  daysUntilNextPeriod: number;
  nextPeriodStartDate: string;
  nextOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  phaseDisplayName: string;
  phaseDescription: string;
  phaseAdvice: string;
  chanceOfPregnancy: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  title: string;
  content: string;
  tags: string[];
  likesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
}

export interface VideoItem {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  category: 'Yoga' | 'Meditation' | 'Nutrition' | 'Mindfulness';
  thumbnailUrl: string;
  description: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  readTime: string;
  category: string;
  heroImage: string;
  content: string;
}

export interface DoctorAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string;
  time: string;
  notes: string;
  avatarUrl: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

export type AppView = 
  | 'HOME'
  | 'CALENDAR'
  | 'INSIGHTS'
  | 'PROFILE'
  | 'CLASSIC_HOME'
  | 'CLASSIC_INSIGHTS'
  | 'CLASSIC_PROFILE'
  | 'BBT_LOG'
  | 'BIRTH_CONTROL'
  | 'PARTNER_SYNC'
  | 'PASSCODE_LOCK'
  | 'PREMIUM'
  | 'APPOINTMENT_DETAIL'
  | 'DOCTORS_CARE_TEAM'
  | 'EMERGENCY_HELP'
  | 'EXPORT_HEALTH_REPORT'
  | 'EXPORT_SUCCESS'
  | 'FERTILITY_DETAIL'
  | 'CONNECTED_DEVICES'
  | 'HARMONIZED_DASHBOARD'
  | 'HARMONIZED_HOME'
  | 'HARMONIZED_CALENDAR'
  | 'HARMONIZED_INSIGHTS'
  | 'CUSTOM_TAGS'
  | 'HEALTH_PROFILE'
  | 'NOTIFICATIONS'
  | 'VIDEO_LIBRARY'
  | 'LUTEAL_ARTICLE'
  | 'PERSONALIZED_INSIGHTS'
  | 'COMMUNITY'
  | 'CREATE_POST'
  | 'POST_DETAIL'
  | 'FEELING_TODAY'
  | 'APP_PREFERENCES'
  | 'ONBOARDING_WELCOME'
  | 'ONBOARDING_UNDERSTOOD'
  | 'ONBOARDING_TRACK_EASE'
  | 'ONBOARDING_SUCCESS'
  | 'LOGIN_GATEWAY'
  | 'MEDICATION_TRACKER'
  | 'HYDRATION_TRACKER'
  | 'MEDICATION_HISTORY'
  | 'WELLNESS_REMINDERS_PERMISSION'
  | 'MUCUS_LOG'
  | 'NUTRITION_CYCLE'
  | 'PARTNER_SYNC_DETAILS'
  | 'PHYSICAL_ACTIVITY'
  | 'PREGNANCY_MODE'
  | 'DATA_PRIVACY_SECURITY'
  | 'SEARCH_HUB'
  | 'SYMPTOM_HISTORY'
  | 'SLEEP_INSIGHTS'
  | 'SUPPLEMENT_TRACKER'
  | 'SUPPORT_FAQ'
  | 'BODY_METRICS'
  | 'SYMPTOM_INTENSITY_LOG'
  | 'DELETE_ACCOUNT'
  | 'FORGOT_PASSWORD'
  | 'EDIT_PROFILE'
  | 'NOTIFICATION_INBOX'
  | 'OFFLINE_SYNC'
  | 'NOT_FOUND_404'
  | 'TRIAL_PAYWALL'
  | 'MANAGE_BILLING'
  | 'APP_REVIEW'
  | 'WHATS_NEW'
  | 'TERMS_CLINICAL_DISCLAIMER'
  | 'FOCUS_ENERGY_TRACKER'
  | 'PHYSICAL_COMFORT_TRACKER'
  | 'INITIAL_BASELINE_SETUP'
  | 'KOTLIN_ANDROID_CODE'
  | 'CYCLE_AI_ASSISTANT'
  | 'CYCLE_SYNCED_FITNESS'
  | 'TERMS_OF_SERVICE'
  | 'PRIVACY_POLICY';

