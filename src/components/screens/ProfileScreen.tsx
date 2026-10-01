import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  RotateCcw, 
  Shield, 
  ChevronRight,
  Wifi,
  Battery,
  Signal,
  X,
  Check,
  FileText,
  HeartPulse,
  PhoneCall,
  Tag,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';




interface ProfileScreenProps {
  onNavigate: (view: AppView) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { settings, updateSettings } = useCycle();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-28 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Header Artwork with Status Bar */}
        <div className="relative w-full h-[230px] overflow-hidden flex-shrink-0">
          <img
            src="/assets/insights_header_waves_1788068502124.jpg"
            alt="Fluid wavy artwork"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />

          {/* iOS Status Bar Overlay */}
          <div className="absolute top-3 inset-x-7 flex items-center justify-between text-[#1E191D] text-xs font-semibold select-none">
            <span>9:41 AM</span>
            <div className="flex items-center gap-1.5">
              <Signal size={13} strokeWidth={2.4} />
              <Wifi size={13} strokeWidth={2.4} />
              <Battery size={15} strokeWidth={2.4} />
            </div>
          </div>
        </div>

        {/* Center Frosted Silhouette Avatar Overlapping Header & Body */}
        <div className="relative -mt-16 z-20 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/70 backdrop-blur-md p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-white/80 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#EBE7E1] flex items-center justify-center overflow-hidden relative">
              {/* Blurred Rose Silhouette Figure */}
              <div className="w-8 h-8 rounded-full bg-[#C98B84]/60 blur-[3px] absolute top-2.5" />
              <div className="w-14 h-12 rounded-t-full bg-[#C98B84]/50 blur-[4px] absolute -bottom-1" />
              <User size={34} strokeWidth={1.8} className="text-[#68535E]/80 relative z-10" />
            </div>
          </div>
        </div>

        {/* 4 Clean Rounded Menu Item Cards */}
        <div className="flex-1 px-5 sm:px-6 pt-5 pb-8 flex flex-col justify-center space-y-3.5">
          
          {/* Card 1: Account Info */}
          <button
            type="button"
            onClick={() => onNavigate('HEALTH_PROFILE')}
            id="menu_account_info_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#FCEAE8] flex items-center justify-center text-[#261E24] shadow-2xs flex-shrink-0">
                <User size={20} strokeWidth={1.8} />
              </div>
              <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight">
                Account Info
              </span>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Card 2: Notifications */}
          <button
            type="button"
            onClick={() => onNavigate('NOTIFICATIONS')}
            id="menu_notifications_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#FEF5E7] flex items-center justify-center text-[#261E24] shadow-2xs flex-shrink-0">
                <Bell size={20} strokeWidth={1.8} />
              </div>
              <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight">
                Notifications
              </span>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Card 3: Cycle Settings */}
          <button
            type="button"
            onClick={() => onNavigate('APP_PREFERENCES')}
            id="menu_cycle_settings_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#E8F0EA] flex items-center justify-center text-[#261E24] shadow-2xs flex-shrink-0">
                <RotateCcw size={20} strokeWidth={1.8} />
              </div>
              <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight">
                Cycle Settings
              </span>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Card 4: Privacy */}
          <button
            type="button"
            onClick={() => onNavigate('PASSCODE_LOCK')}
            id="menu_privacy_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#E6F0EE] flex items-center justify-center text-[#261E24] shadow-2xs flex-shrink-0">
                <Shield size={20} strokeWidth={1.8} />
              </div>
              <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight">
                Privacy
              </span>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Section Divider */}

          <div className="pt-2 pb-1 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E7E87]">
              Care & Clinical Tools
            </span>
            <div className="flex-1 border-t border-[#EDE6E1]" />
          </div>

          {/* Card 5: Export Health Report */}
          <button
            type="button"
            onClick={() => onNavigate('EXPORT_HEALTH_REPORT')}
            id="menu_export_report_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#F4EFF3] flex items-center justify-center text-[#543649] shadow-2xs flex-shrink-0">
                <FileText size={20} strokeWidth={1.8} />
              </div>
              <div className="text-left">
                <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight block">
                  Export Health Report
                </span>
                <span className="text-xs text-[#7A6C74]">Share PDF summary with doctor</span>
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Card 6: Doctors & Care Team */}
          <button
            type="button"
            onClick={() => onNavigate('DOCTORS_CARE_TEAM')}
            id="menu_care_team_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#EBF0ED] flex items-center justify-center text-[#41624F] shadow-2xs flex-shrink-0">
                <HeartPulse size={20} strokeWidth={1.8} />
              </div>
              <div className="text-left">
                <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight block">
                  Doctors & Care Team
                </span>
                <span className="text-xs text-[#7A6C74]">Specialists & consultations</span>
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Card 7: Emergency & Help */}
          <button
            type="button"
            onClick={() => onNavigate('EMERGENCY_HELP')}
            id="menu_emergency_help_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#FBF1F1] flex items-center justify-center text-[#B84E4E] shadow-2xs flex-shrink-0">
                <PhoneCall size={20} strokeWidth={1.8} />
              </div>
              <div className="text-left">
                <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight block">
                  Emergency & Help
                </span>
                <span className="text-xs text-[#7A6C74]">Hotlines & medical ID</span>
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Card 8: Custom Tags */}
          <button
            type="button"
            onClick={() => onNavigate('CUSTOM_TAGS')}
            id="menu_custom_tags_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#F7F2E8] flex items-center justify-center text-[#8C6D3B] shadow-2xs flex-shrink-0">
                <Tag size={20} strokeWidth={1.8} />
              </div>
              <div className="text-left">
                <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight block">
                  Custom Tags & Moods
                </span>
                <span className="text-xs text-[#7A6C74]">Personalize tracking vocabulary</span>
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Card 9: Connected Apps & Devices */}
          <button
            type="button"
            onClick={() => onNavigate('CONNECTED_DEVICES')}
            id="menu_connected_devices_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#FCEEEA] flex items-center justify-center text-[#B8624E] shadow-2xs flex-shrink-0">
                <Smartphone size={20} strokeWidth={1.8} />
              </div>
              <div className="text-left">
                <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight block">
                  Connected Apps & Devices
                </span>
                <span className="text-xs text-[#7A6C74]">Apple Health, Google Fit, Oura</span>
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>

          {/* Card 10: Fertility & Ovulation Detail */}
          <button
            type="button"
            onClick={() => onNavigate('FERTILITY_DETAIL')}
            id="menu_fertility_detail_btn"
            className="w-full bg-white hover:bg-[#FDFCFB] active:scale-[0.99] rounded-[24px] py-4 px-5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#F6EEF2] flex items-center justify-center text-[#8F556F] shadow-2xs flex-shrink-0">
                <Sparkles size={20} strokeWidth={1.8} />
              </div>
              <div className="text-left">
                <span className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] tracking-tight block">
                  Fertility & Ovulation
                </span>
                <span className="text-xs text-[#7A6C74]">Conception forecast & biomarkers</span>
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};


