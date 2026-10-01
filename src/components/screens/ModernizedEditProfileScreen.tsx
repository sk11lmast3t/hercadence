import React, { useState, useRef } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Check, 
  Lock, 
  Trash2, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useCycle } from '../../context/CycleContext';
import { useProfile } from '../../hooks/useProfile';

interface ModernizedEditProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedEditProfileScreen: React.FC<ModernizedEditProfileScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { settings, updateSettings } = useCycle();
  const { saveProfile } = useProfile();
  
  const nameParts = (settings.userName || '').trim().split(' ');
  const initialFirst = nameParts[0] || '';
  const initialLast = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState<string>(initialFirst);
  const [lastName, setLastName] = useState<string>(initialLast);
  const [pronouns, setPronouns] = useState<string>('');
  const [email, setEmail] = useState<string>(settings.email || '');
  const [phone, setPhone] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(settings.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        updateSettings({ avatarUrl: result });
        showToast('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    updateSettings({
      userName: fullName,
      email: email.trim(),
      avatarUrl: avatarUrl
    });
    saveProfile({
      userName: fullName,
      email: email.trim()
    });
    setTimeout(() => {
      setIsSaving(false);
      showToast('Profile updated successfully!');
      if (onBack) setTimeout(() => onBack(), 800);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DF]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF8F5] pb-10 shadow-2xl overflow-x-hidden">
        
        {/* Hidden File Input */}
        <input 
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* Top Header Banner */}
        <div className="relative w-full h-[180px] bg-[#E8E2EC] overflow-hidden">
          <img 
            src="/assets/luna_wellness_purple_header_1788590868601.jpg" 
            alt="Header Wave" 
            className="w-full h-full object-cover opacity-85 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FAF8F5]" />

          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-white/90 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41</span>
            <div className="flex items-center space-x-1.5 text-white/90">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="absolute top-11 left-0 right-0 px-6 flex items-center justify-between z-20">
            <button
              type="button"
              onClick={onBack || (() => onNavigate && onNavigate('PROFILE'))}
              className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>
            <span className="text-[17px] font-serif font-bold text-white tracking-wide">
              Edit Profile
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="text-[13.5px] font-bold text-white bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 hover:bg-white/30 active:scale-95 transition-all cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Profile Avatar Center Bubble */}
        <div className="flex flex-col items-center -mt-14 z-20 px-6">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
            title="Upload profile photo"
          >
            <div className="w-24 h-24 rounded-full p-1 bg-white shadow-xl ring-4 ring-[#FAF8F5] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5ECE8] to-[#E5DCD8]">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : firstName ? (
                <span className="font-serif text-[28px] font-bold text-[#55374C]">
                  {`${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()}
                </span>
              ) : (
                <User size={38} strokeWidth={1.5} className="text-[#8A7985]" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#422247] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
              <Camera size={14} />
            </div>
          </div>
          <button
            type="button"
            className="text-[12px] font-semibold text-[#664C61] mt-2 cursor-pointer hover:underline flex items-center gap-1" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={12} />
            <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
          </button>
        </div>

        {/* Form Fields Container */}
        <form onSubmit={handleSave} className="px-5 mt-4 space-y-4 flex-1">
          
          {/* Card 1: Personal Details */}
          <div className="bg-white rounded-[26px] p-5 border border-[#ECE2DB] shadow-[0_4px_18px_rgba(0,0,0,0.02)] space-y-3.5">
            <span className="text-[11px] font-bold text-[#867683] uppercase tracking-wider block">
              Personal Information
            </span>

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-[#645360] block mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D7D1] bg-[#FAF8F6] text-[14px] text-[#221B20] font-medium focus:outline-none focus:border-[#422247]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-[#645360] block mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Lin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D7D1] bg-[#FAF8F6] text-[14px] text-[#221B20] font-medium focus:outline-none focus:border-[#422247]"
                />
              </div>
            </div>

            {/* Pronouns */}
            <div>
              <label className="text-[11.5px] font-medium text-[#645360] block mb-1">
                Pronouns
              </label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="e.g. she / her"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D7D1] bg-[#FAF8F6] text-[14px] text-[#221B20] font-medium focus:outline-none focus:border-[#422247]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[11.5px] font-medium text-[#645360] block mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D7D1] bg-[#FAF8F6] text-[14px] text-[#221B20] font-medium focus:outline-none focus:border-[#422247]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-[11.5px] font-medium text-[#645360] block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D7D1] bg-[#FAF8F6] text-[14px] text-[#221B20] font-medium focus:outline-none focus:border-[#422247]"
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="text-[11.5px] font-medium text-[#645360] block mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D7D1] bg-[#FAF8F6] text-[14px] text-[#221B20] font-medium focus:outline-none focus:border-[#422247]"
              />
            </div>
          </div>

          {/* Card 2: Security & Password */}
          <div className="bg-white rounded-[26px] p-5 border border-[#ECE2DB] shadow-[0_4px_18px_rgba(0,0,0,0.02)] space-y-3">
            <span className="text-[11px] font-bold text-[#867683] uppercase tracking-wider block">
              Security &amp; Credentials
            </span>

            <div
              onClick={() => onNavigate && onNavigate('FORGOT_PASSWORD')}
              className="p-3 rounded-2xl bg-[#FAF7F9] border border-[#E8DFE5] flex items-center justify-between cursor-pointer hover:bg-[#F5EDF4] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#422247] flex items-center justify-center shadow-2xs">
                  <Lock size={15} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#2A1535]">
                    Change Password
                  </div>
                  <div className="text-[11px] text-[#7A6877]">
                    Last updated 3 months ago
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8F7C8D]" />
            </div>

            {/* Passcode Lock shortcut */}
            <div
              onClick={() => onNavigate && onNavigate('PASSCODE_LOCK')}
              className="p-3 rounded-2xl bg-[#FAF7F9] border border-[#E8DFE5] flex items-center justify-between cursor-pointer hover:bg-[#F5EDF4] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#422247] flex items-center justify-center shadow-2xs">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#2A1535]">
                    Passcode &amp; Face ID
                  </div>
                  <div className="text-[11px] text-[#7A6877]">
                    Enabled for health metrics
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8F7C8D]" />
            </div>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('DELETE_ACCOUNT')}
              className="w-full py-3 rounded-2xl border border-[#F1D5DA] bg-[#FFF8F9] text-[#B04C58] text-[13.5px] font-semibold flex items-center justify-center gap-2 hover:bg-[#FEECEF] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Trash2 size={16} />
              <span>Delete Account &amp; Erase Data</span>
            </button>
          </div>

        </form>

        {/* Bottom iOS Bar */}
        <div className="pt-4 pb-1 flex justify-center">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('PROFILE'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
            >
              <Check size={14} className="text-[#8BE1A5]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
