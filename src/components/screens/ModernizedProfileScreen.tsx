import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  SlidersHorizontal, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronDown,
  X,
  Check,
  Layers,
  HeartPulse,
  FileText,
  Smartphone,
  Pill,
  Users,
  Lock,
  Tag,
  Crown,
  ChevronRight,
  Droplet,
  ShieldCheck,
  Sparkles,
  Edit3,
  Receipt,
  Star,
  FileCheck,
  User,
  Camera,
  Upload,
  Scale,
  WifiOff,
  Dumbbell,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useCycle } from '../../context/CycleContext';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '../../hooks/useProfile';


interface ModernizedProfileScreenProps {
  onNavigate: (view: AppView) => void;
  onOpenDirectory?: () => void;
}

export const ModernizedProfileScreen: React.FC<ModernizedProfileScreenProps> = ({
  onNavigate,
  onOpenDirectory
}) => {
  const { settings, updateSettings } = useCycle();
  const { saveProfile } = useProfile();
  const { user, isSignedIn, isLoaded } = useUser();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [tempUnit, setTempUnit] = useState<'Celsius' | 'Fahrenheit'>('Fahrenheit');

  // Clerk identity as source of truth for display
  const displayName = isLoaded && isSignedIn && user
    ? (user.fullName || user.firstName || '')
    : (settings.userName || '');
  const displayEmail = isLoaded && isSignedIn && user
    ? (user.primaryEmailAddress?.emailAddress || '')
    : (settings.email || '');
  const displayAvatar = isLoaded && isSignedIn && user
    ? (user.imageUrl || '')
    : (settings.avatarUrl || '');

  // Account modal states — sync from Clerk when identity changes
  const [accountName, setAccountName] = useState(
    user?.fullName || user?.firstName || settings.userName || ''
  );
  const [accountEmail, setAccountEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || settings.email || ''
  );
  const [accountSavedToast, setAccountSavedToast] = useState(false);

  React.useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setAccountName(user.fullName || user.firstName || '');
      setAccountEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [isLoaded, isSignedIn, user]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updateSettings({ avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: accountName.trim(),
      email: accountEmail.trim()
    });
    saveProfile({
      userName: accountName.trim(),
      email: accountEmail.trim()
    });
    setAccountSavedToast(true);
    setTimeout(() => {
      setAccountSavedToast(false);
      setActiveModal(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1E191D] pb-28 relative font-sans select-none overflow-x-hidden">
      {/* Top Background: Silk Waves Artwork spanning top of screen */}
      <div className="absolute top-0 left-0 right-0 h-[360px] pointer-events-none z-0 overflow-hidden">
        <img
          src="/assets/harmonized_waves_bg.jpg"
          alt="Fluid silk waves in sage green and blush rose"
          className="w-full h-full object-cover object-top"
        />
        {/* Subtle linear fade into off-white screen bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-[#FDFCFB]" />
      </div>

      <div className="max-w-[430px] mx-auto relative z-10 flex flex-col">
        {/* Mobile Phone Status Bar (9:41, cellular, wifi, battery) */}
        {/* Mobile Phone Status Bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-1 text-[#4B3041] text-xs font-semibold">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-1.5 opacity-80">
            <span>●●●</span>
            <span>WiFi</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Screen Header */}
        <header className="px-6 pt-3 pb-3 flex items-center justify-between">
          <h1 className="font-serif text-[32px] sm:text-[34px] font-bold text-[#4B3041] tracking-tight">
            Profile
          </h1>
          {onOpenDirectory && (
            <button
              type="button"
              onClick={onOpenDirectory}
              className="w-10 h-10 rounded-full bg-white/70 hover:bg-white/95 border border-white/80 flex items-center justify-center text-[#4B3041] shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Open All Screens Directory"
              aria-label="Open Directory"
            >
              <MoreVertical size={20} />
            </button>
          )}
        </header>

        {/* Hidden File Input for Real Avatar Upload */}
        <input 
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* Main Content Area */}
        <main className="px-5 space-y-3 sm:space-y-3.5">
          {/* Card 1: User Profile Card (Supports Real Upload and Clean Initial State) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onNavigate('EDIT_PROFILE')}
            className="rounded-[30px] sm:rounded-[34px] bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_12px_36px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/90 active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar Frame */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/90 shadow-sm shrink-0 bg-gradient-to-br from-[#F5ECE8] to-[#E5DCD8] relative cursor-pointer group/avatar flex items-center justify-center text-[#7D6B78]"
                title="Tap to change profile picture"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="User profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : displayName ? (
                  <span className="font-serif text-[24px] font-bold text-[#55374C]">
                    {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <User size={34} strokeWidth={1.5} className="text-[#8A7985]" />
                )}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={18} />
                </div>
                {!settings.avatarUrl && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#55374C] text-white flex items-center justify-center shadow-xs border border-white">
                    <Camera size={12} strokeWidth={2.2} />
                  </div>
                )}
              </div>

              {/* User Meta Information */}
              <div className="min-w-0">
                <h2 className="font-serif text-[22px] sm:text-[24px] font-bold text-[#1E191D] tracking-tight truncate">
                  {displayName || 'Set Up Your Profile'}
                </h2>
                <p className="text-[13px] font-normal text-[#655763] mt-0.5 truncate">
                  {displayEmail || 'Tap to enter account details'}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] font-medium text-[#7D6B7A] bg-[#F2EAEF] px-2 py-0.5 rounded-full">
                    {settings.userName ? 'Active Member' : 'New Member'}
                  </span>
                  {!settings.avatarUrl && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-[11px] font-semibold text-[#8C525E] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Upload size={11} /> Upload Photo
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-[#FAF3F6] border border-[#E9DDE4] flex items-center justify-center text-[#55374C] group-hover:bg-[#55374C] group-hover:text-white transition-colors shrink-0">
              <Edit3 size={15} />
            </div>
          </motion.div>

          {/* Baseline Health & Body Metrics Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.03 }}
            onClick={() => onNavigate('INITIAL_BASELINE_SETUP')}
            className="rounded-[28px] bg-gradient-to-b from-[#FFFDFB] via-[#FAF5F2] to-[#F7ECE8] border border-[#EADBDA] shadow-[0_4px_24px_rgba(60,35,50,0.04)] p-5 cursor-pointer hover:border-[#D5A7B3] hover:shadow-[0_8px_30px_rgba(60,35,50,0.07)] transition-all group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#523446] text-[#F9EBE8] flex items-center justify-center shadow-xs">
                  <Scale size={17} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[16px] text-[#22171E] tracking-tight group-hover:text-[#523446] transition-colors">
                    Baseline Body &amp; Cycle Rhythm
                  </h3>
                  <p className="text-[11.5px] text-[#786470]">Calibrated to your natural physiology</p>
                </div>
              </div>
              <span className="text-[11.5px] font-semibold text-[#523446] bg-white/90 hover:bg-white px-3 py-1 rounded-full border border-[#E5D7DA] shadow-2xs flex items-center gap-1.5 transition-colors">
                <Sparkles size={12} className="text-[#9E6573]" />
                <span>Re-calibrate</span>
              </span>
            </div>

            {/* 4 Clean Metric Tiles */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 text-center border border-[#EFE5E0] shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#917E8A] block mb-0.5">Weight</span>
                <p className="text-[14px] font-extrabold text-[#22171E]">
                  {settings.baselineHealth?.weight || 59}
                  <span className="text-[10.5px] font-medium text-[#786470] ml-0.5">
                    {settings.baselineHealth?.weightUnit || settings.weightUnit || 'kg'}
                  </span>
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 text-center border border-[#EFE5E0] shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#917E8A] block mb-0.5">Height</span>
                <p className="text-[14px] font-extrabold text-[#22171E]">
                  {settings.baselineHealth?.heightCm || 165}
                  <span className="text-[10.5px] font-medium text-[#786470] ml-0.5">cm</span>
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 text-center border border-[#EFE5E0] shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#917E8A] block mb-0.5">Cycle</span>
                <p className="text-[14px] font-extrabold text-[#22171E]">
                  {settings.baselineHealth?.averageCycleLength || settings.cycleLengthDays}
                  <span className="text-[10.5px] font-medium text-[#786470] ml-0.5">d</span>
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 text-center border border-[#EFE5E0] shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#917E8A] block mb-0.5">Period</span>
                <p className="text-[14px] font-extrabold text-[#22171E]">
                  {settings.baselineHealth?.averagePeriodLength || settings.periodLengthDays}
                  <span className="text-[10.5px] font-medium text-[#786470] ml-0.5">d</span>
                </p>
              </div>
            </div>

            {/* Personalized Baseline Tags */}
            <div className="flex items-center gap-1.5 pt-2.5 flex-wrap">
              <span className="text-[10.5px] font-medium px-2.5 py-0.5 rounded-full bg-white/70 text-[#6B5361] border border-[#EDE2DC]">
                {settings.baselineHealth?.cycleRegularity || 'Regular Cycle'}
              </span>
              <span className="text-[10.5px] font-medium px-2.5 py-0.5 rounded-full bg-white/70 text-[#6B5361] border border-[#EDE2DC]">
                {settings.baselineHealth?.activityLevel || 'Active'}
              </span>
              {settings.baselineHealth?.birthControlMethod && (
                <span className="text-[10.5px] font-medium px-2.5 py-0.5 rounded-full bg-white/70 text-[#6B5361] border border-[#EDE2DC]">
                  {settings.baselineHealth.birthControlMethod}
                </span>
              )}
              <span className="text-[10.5px] font-medium px-2.5 py-0.5 rounded-full bg-[#F5E8EC] text-[#6E3544] border border-[#EBD5DC] ml-auto">
                {settings.baselineHealth?.primaryGoals?.[0] || 'Period & Ovulation Tracking'}
              </span>
            </div>
          </motion.div>

          {/* List of 5 Pill Menu Cards matching Image 3 */}
          <div className="space-y-3 sm:space-y-3.5 pt-1">
            {/* Item 1: Account Settings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              onClick={() => setActiveModal('account')}
              className="w-full rounded-full bg-white px-4 py-3.5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#D5E6DC] text-[#47735B] flex items-center justify-center shrink-0">
                  <Settings size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[15.5px] font-semibold text-[#1E191D]">
                  Account Settings
                </span>
              </div>
              <ChevronDown size={20} strokeWidth={1.8} className="text-[#8E848A] shrink-0" />
            </motion.div>

            {/* Item 2: Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={() => setActiveModal('preferences')}
              className="w-full rounded-full bg-white px-4 py-3.5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#EED5D6] text-[#8C525E] flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[15.5px] font-semibold text-[#1E191D]">
                  Preferences
                </span>
              </div>
              <ChevronDown size={20} strokeWidth={1.8} className="text-[#8E848A] shrink-0" />
            </motion.div>

            {/* Item 3: Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              onClick={() => setActiveModal('notifications')}
              className="w-full rounded-full bg-white px-4 py-3.5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F3DCDE] text-[#8C525E] flex items-center justify-center shrink-0">
                  <Bell size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[15.5px] font-semibold text-[#1E191D]">
                  Notifications
                </span>
              </div>
              <ChevronDown size={20} strokeWidth={1.8} className="text-[#8E848A] shrink-0" />
            </motion.div>

            {/* Item: Data Privacy & Security */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.17 }}
              onClick={() => onNavigate('DATA_PRIVACY_SECURITY')}
              className="w-full rounded-full bg-white px-4 py-3.5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5ECDC] text-[#A68853] flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[15.5px] font-semibold text-[#1E191D]">
                  Data Privacy &amp; Security
                </span>
              </div>
              <ChevronRight size={18} strokeWidth={1.8} className="text-[#8E848A] shrink-0" />
            </motion.div>

            {/* Item: Pregnancy Mode */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.19 }}
              onClick={() => onNavigate('PREGNANCY_MODE')}
              className="w-full rounded-full bg-white px-4 py-3.5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#DCEADB] text-[#47735B] flex items-center justify-center shrink-0">
                  <Sparkles size={18} strokeWidth={1.8} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15.5px] font-semibold text-[#1E191D]">
                    Pregnancy Mode
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5F0E4] text-[#47735B]">
                    Week 12
                  </span>
                </div>
              </div>
              <ChevronRight size={18} strokeWidth={1.8} className="text-[#8E848A] shrink-0" />
            </motion.div>

            {/* Item 4: Help & Support */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={() => onNavigate('SUPPORT_FAQ')}
              className="w-full rounded-full bg-white px-4 py-3.5 border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#D5E6DC] text-[#47735B] flex items-center justify-center shrink-0">
                  <HelpCircle size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[15.5px] font-semibold text-[#1E191D]">
                  Help &amp; Support (FAQs &amp; Chat)
                </span>
              </div>
              <ChevronRight size={18} strokeWidth={1.8} className="text-[#8E848A] shrink-0" />
            </motion.div>

            {/* Item 5: Logout with subtle Dusty Rose Gradient on Right */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              onClick={() => setActiveModal('logout')}
              className="w-full rounded-full bg-white border border-[#EDE5DF] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex items-center justify-between overflow-hidden cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all relative"
            >
              <div className="px-4 py-3.5 flex items-center gap-3.5 relative z-10">
                <div className="w-9 h-9 rounded-full bg-[#EED5D6] text-[#8C525E] flex items-center justify-center shrink-0">
                  <LogOut size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[15.5px] font-semibold text-[#1E191D]">
                  Logout
                </span>
              </div>

              {/* Soft Rose/Blush Glow Ribbon on the right matching Image 3 */}
              <div className="w-44 h-full absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#F3D7D7]/75 via-[#F7E5E5]/40 to-transparent pointer-events-none" />
            </motion.div>
          </div>

          {/* Mobile Home Screen App Installation Card */}
          {/* PWA install removed — native-only app */}



          {/* Premium Subscription & Membership Card */}
          <div className="rounded-[28px] overflow-hidden relative border border-[#E5C158]/35 bg-gradient-to-br from-[#231225] via-[#331836] to-[#1C0D1E] text-white shadow-[0_16px_36px_rgba(35,18,37,0.28)] p-5">
            {/* Ambient luxury starlight glow in the background */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-[#F5D880]/20 via-[#E8C265]/5 to-transparent blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#E5839C]/10 blur-2xl pointer-events-none" />

            {/* Top Row: Brand emblem, membership tier & active status */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-br from-[#FAD178] via-[#E5C158] to-[#996515] shadow-md">
                    <img
                      src="/assets/hercadence_logo.jpg"
                      alt="HerCadence"
                      className="w-full h-full rounded-[14px] object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-[#C59B27] to-[#FAD178] text-[#231225] flex items-center justify-center shadow-xs border-2 border-[#231225]">
                    <Crown size={10} strokeWidth={2.6} />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-serif font-bold text-white tracking-tight truncate">
                      {settings.isPremium ? 'HerCadence Luxe Member' : 'HerCadence Premium'}
                    </span>
                    <span className={settings.isPremium 
                      ? 'text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gradient-to-r from-[#FAD178]/25 to-[#E5C158]/20 text-[#FAD178] border border-[#FAD178]/40 shrink-0' 
                      : 'text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/15 text-white/90 border border-white/20 shrink-0'
                    }>
                      {settings.isPremium ? 'Active' : '7-Day Free Trial'}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#E0D2DC] truncate mt-0.5">
                    {settings.isPremium 
                      ? 'Renews Nov 14, 2025 • Apple In-App Purchase' 
                      : 'Unlock precision analytics, lab PDFs & wearable sync'}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Highlights Pills (for free tier overview) */}
            {!settings.isPremium && (
              <div className="relative z-10 mt-3.5 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-[10.5px] text-[#F3E7E1]">
                  <Sparkles size={11} className="text-[#FAD178]" />
                  Clinical PDF Reports
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-[10.5px] text-[#F3E7E1]">
                  <Sparkles size={11} className="text-[#FAD178]" />
                  Wearable &amp; Oura Sync
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-[10.5px] text-[#F3E7E1]">
                  <Sparkles size={11} className="text-[#FAD178]" />
                  Deep Hormone Insights
                </span>
              </div>
            )}

            {/* Call to Action Button Section */}
            <div className="relative z-10 mt-3.5">
              {!settings.isPremium ? (
                <div>
                  <button
                    type="button"
                    onClick={() => onNavigate('TRIAL_PAYWALL')}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#F7DA7C] via-[#EDC669] to-[#D8AA47] hover:from-[#FAE18C] hover:to-[#DEB352] text-[#241327] font-bold text-[13.5px] shadow-[0_8px_24px_rgba(237,198,105,0.32)] flex items-center justify-between group active:scale-[0.985] transition-all cursor-pointer border border-[#FFF0B3]/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#241327]/10 flex items-center justify-center">
                        <Crown size={15} className="text-[#241327]" />
                      </div>
                      <span className="tracking-tight font-bold">Start 7-Day Free Trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#241327]/12 text-[#241327] tracking-wider">
                        $0 Today
                      </span>
                      <ArrowRight size={16} className="text-[#241327] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#D8C7D2] mt-2">
                    <ShieldCheck size={12} className="text-[#FAD178]" />
                    <span>No charge today • Cancel anytime in Apple ID settings</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('TRIAL_PAYWALL')}
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/15 hover:bg-white/20 border border-white/25 text-white font-semibold text-[12.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <Crown size={14} className="text-[#FAD178]" />
                    <span>Manage Subscription</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('MANAGE_BILLING')}
                    className="py-2.5 px-3.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 text-white/90 text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <Receipt size={14} />
                    <span>Invoices</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Tools & Health Integrations Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[13px] font-bold text-[#1E191D] tracking-tight">
                Health Services &amp; Device Tools
              </span>
              <span className="text-[11px] text-[#7A6C74]">
                Dedicated Screens
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Offline Protection & Network Diagnostics */}
              <div
                onClick={() => onNavigate('OFFLINE_SYNC')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF9F6] to-[#FAF2EE] border border-[#ECD9CE] shadow-[0_4px_14px_rgba(84,54,73,0.06)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5 relative overflow-hidden group"
              >
                <div className="w-8 h-8 rounded-full bg-[#523446] text-[#FAF5F2] flex items-center justify-center shrink-0 shadow-2xs">
                  <WifiOff size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-[#1E191D] flex items-center gap-1.5 truncate">
                    <span>Offline Sync</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-400/25 text-emerald-900 border border-emerald-300/40">
                      Active
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Offline logs &amp; network</div>
                </div>
              </div>

              {/* Cycle-Synced Fitness & Meal Plans (Premium) */}
              <div
                onClick={() => onNavigate('CYCLE_SYNCED_FITNESS')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF5F8] to-[#F5ECF2] border border-[#E8D6E2] shadow-[0_4px_14px_rgba(84,54,73,0.06)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5 relative overflow-hidden group"
              >
                <div className="w-8 h-8 rounded-full bg-[#724862] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Dumbbell size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-[#1E191D] flex items-center gap-1.5 truncate">
                    <span>Phase Fitness</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-amber-400/25 text-amber-900 border border-amber-300/40">
                      PRO
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Sync workouts &amp; meals</div>
                </div>
              </div>

              {/* Medication & Supplements */}
              <div
                onClick={() => onNavigate('MEDICATION_TRACKER')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#E2EDF4] text-[#1E3A4B] flex items-center justify-center shrink-0">
                  <Pill size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Medication &amp; Vitamin</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Daily pills &amp; refills</div>
                </div>
              </div>

              {/* Hydration Tracker */}
              <div
                onClick={() => onNavigate('HYDRATION_TRACKER')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                  <Droplet size={16} fill="#0284C7" strokeWidth={0} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Hydration Tracker</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">3D liquid droplet log</div>
                </div>
              </div>

              {/* Medical Health Profile */}
              <div
                onClick={() => onNavigate('HEALTH_PROFILE')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAF2ED] text-[#41624F] flex items-center justify-center shrink-0">
                  <HeartPulse size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Medical Profile</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Blood &amp; diagnoses</div>
                </div>
              </div>

              {/* Doctors & Care Team */}
              <div
                onClick={() => onNavigate('DOCTORS_CARE_TEAM')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#DFEDE4] text-[#47735B] flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Care Team</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Doctor appointments</div>
                </div>
              </div>

              {/* Export Health Report */}
              <div
                onClick={() => onNavigate('EXPORT_HEALTH_REPORT')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#EDE8F2] text-[#543649] flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Export Report</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Clinical PDF export</div>
                </div>
              </div>

              {/* Connected Devices */}
              <div
                onClick={() => onNavigate('CONNECTED_DEVICES')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#F5EDDD] text-[#8B6B38] flex items-center justify-center shrink-0">
                  <Smartphone size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Connected Devices</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Apple Health &amp; Oura</div>
                </div>
              </div>

              {/* Birth Control */}
              <div
                onClick={() => onNavigate('BIRTH_CONTROL')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#FCECEE] text-[#8C525E] flex items-center justify-center shrink-0">
                  <Pill size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Birth Control</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Pill pack tracker</div>
                </div>
              </div>

              {/* Partner Sync */}
              <div
                onClick={() => onNavigate('PARTNER_SYNC')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#EBF4FA] text-[#34668A] flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Partner Sync</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Share cycle phases</div>
                </div>
              </div>

              {/* Passcode Lock */}
              <div
                onClick={() => onNavigate('PASSCODE_LOCK')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#F5EAEA] text-[#7D4646] flex items-center justify-center shrink-0">
                  <Lock size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Passcode &amp; PIN</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Biometric security</div>
                </div>
              </div>

              {/* Custom Symptom Tags */}
              <div
                onClick={() => onNavigate('CUSTOM_TAGS')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#F0EBE6] text-[#6A5A65] flex items-center justify-center shrink-0">
                  <Tag size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Custom Tags</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Manage symptoms</div>
                </div>
              </div>

              {/* What's New */}
              <div
                onClick={() => onNavigate('WHATS_NEW')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#EFE8F4] text-[#673E73] flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">What's New</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">v2.4 features &amp; notes</div>
                </div>
              </div>

              {/* App Review */}
              <div
                onClick={() => onNavigate('APP_REVIEW')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#FEF3D6] text-[#B87B14] flex items-center justify-center shrink-0">
                  <Star size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Rate HerCadence</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">App Store feedback</div>
                </div>
              </div>

              {/* Legal & Clinical Disclaimer */}
              <div
                onClick={() => onNavigate('TERMS_CLINICAL_DISCLAIMER')}
                className="p-3.5 rounded-2xl bg-white border border-[#EDE5DF] shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:border-[#D9CCC3] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5 col-span-2"
              >
                <div className="w-8 h-8 rounded-full bg-[#F5ECE8] text-[#9A4C3D] flex items-center justify-center shrink-0">
                  <FileCheck size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#1E191D] truncate">Terms &amp; Clinical Disclaimer</div>
                  <div className="text-[10.5px] text-[#7A6C74] truncate">Medical scope, non-contraceptive notice &amp; privacy rights</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Action Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white rounded-[28px] p-6 border border-[#EDE5DF] shadow-xl text-[#1E191D] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#F0EAE5] pb-3">
                <h3 className="font-serif text-[20px] font-bold text-[#1E191D]">
                  {activeModal === 'account' && 'Account Settings'}
                  {activeModal === 'preferences' && 'App Preferences'}
                  {activeModal === 'notifications' && 'Notifications'}
                  {activeModal === 'help' && 'Help & Support'}
                  {activeModal === 'logout' && 'Log Out'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Account Settings Content */}
              {activeModal === 'account' && (
                <form onSubmit={handleSaveAccount} className="space-y-3 text-[14px]">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2 rounded-xl border border-[#EDE5DF] bg-[#FAF8F6] text-neutral-800 text-sm focus:outline-none focus:border-[#543649]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-[#EDE5DF] bg-[#FAF8F6] text-neutral-800 text-sm focus:outline-none focus:border-[#543649]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F6] border border-[#EDE5DF]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F2EAE7] flex items-center justify-center text-[#543649]">
                        <Camera size={14} />
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-neutral-800">Profile Photo</div>
                        <div className="text-neutral-500">{settings.avatarUrl ? 'Photo uploaded' : 'No photo chosen'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => updateSettings({ avatarUrl: '' })}
                          className="text-xs font-semibold text-[#8C525E] hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white border border-[#E0D5CE] rounded-lg text-xs font-semibold text-[#543649] hover:bg-neutral-50 cursor-pointer shadow-2xs"
                      >
                        {settings.avatarUrl ? 'Change' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {accountSavedToast && (
                    <p className="text-xs text-emerald-700 font-semibold text-center bg-emerald-50 py-1.5 rounded-lg">
                      Profile saved successfully!
                    </p>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-full bg-[#543649] text-white font-medium text-xs sm:text-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Check size={16} />
                      Save Account Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        onNavigate('EDIT_PROFILE');
                      }}
                      className="w-full py-2 rounded-full border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      Open Full Profile Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-full py-1.5 text-neutral-500 text-xs font-medium hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Preferences Content */}
              {activeModal === 'preferences' && (
                <div className="space-y-3 text-[14px]">
                  <div className="flex items-center justify-between py-1">
                    <span className="font-medium text-neutral-700">Temperature Unit</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTempUnit('Celsius')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tempUnit === 'Celsius' ? 'bg-[#543649] text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        °C
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempUnit('Fahrenheit')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tempUnit === 'Fahrenheit' ? 'bg-[#543649] text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        °F
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-medium text-neutral-700">Cycle Length</span>
                    <span className="font-semibold text-neutral-800">28 days</span>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        onNavigate('APP_PREFERENCES');
                      }}
                      className="w-full py-2.5 rounded-full bg-[#543649] text-white font-medium text-xs sm:text-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <SlidersHorizontal size={16} />
                      Open Full App Preferences Screen
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Content */}
              {activeModal === 'notifications' && (
                <div className="space-y-3 text-[14px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-800">Cycle Reminders</div>
                      <div className="text-xs text-neutral-500">Alerts 2 days before period</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                        notificationsEnabled ? 'bg-[#543649] justify-end' : 'bg-neutral-200 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        onNavigate('NOTIFICATIONS');
                      }}
                      className="w-full py-2.5 rounded-full bg-[#543649] text-white font-medium text-xs sm:text-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Bell size={16} />
                      Open Notification Alerts Center
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Help & Support Content */}
              {activeModal === 'help' && (
                <div className="space-y-3 text-[14px]">
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Have questions or need assistance? Our women's health support and clinical team is here for you.
                  </p>
                  <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EDE5DF] space-y-1">
                    <div className="text-xs font-semibold text-[#543649]">Direct Care Hotline</div>
                    <div className="text-sm font-medium text-neutral-800">+1 (800) 427-6669</div>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        onNavigate('EMERGENCY_HELP');
                      }}
                      className="w-full py-2.5 rounded-full bg-[#543649] text-white font-medium text-xs sm:text-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle size={16} />
                      Open Emergency &amp; Crisis Support Screen
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Logout Confirmation */}
              {activeModal === 'logout' && (
                <div className="space-y-3 text-[14px]">
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Are you sure you want to log out? This will reset your active session on this device.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-2.5 rounded-full border border-neutral-300 text-neutral-700 font-medium text-sm hover:bg-neutral-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ userName: '', email: '', avatarUrl: '' });
                        setActiveModal(null);
                        onNavigate('LOGIN_GATEWAY');
                      }}
                      className="flex-1 py-2.5 rounded-full bg-[#8C525E] text-white font-medium text-sm hover:opacity-90 cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
