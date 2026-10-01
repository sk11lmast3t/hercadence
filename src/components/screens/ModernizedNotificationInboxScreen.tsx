import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  Bell, 
  Calendar, 
  Heart, 
  Stethoscope, 
  Pill, 
  Droplet, 
  CheckCheck, 
  Trash2, 
  Check, 
  Sparkles,
  ArrowRight,
  Home,
  Plus,
  BarChart2,
  User,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedNotificationInboxScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

interface NotificationItem {
  id: string;
  category: 'cycle' | 'partner' | 'clinical' | 'medication' | 'wellness';
  title: string;
  body: string;
  timeAgo: string;
  isRead: boolean;
  actionLabel?: string;
  actionView?: AppView;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'cycle',
    title: 'Estimated Period in 2 Days',
    body: 'Your luteal phase is progressing as predicted. Consider resting and staying well-hydrated today.',
    timeAgo: '10m ago',
    isRead: false,
    actionLabel: 'View Forecast',
    actionView: 'HOME'
  },
  {
    id: 'n2',
    category: 'medication',
    title: 'Evening Magnesium & Zinc Reminder',
    body: 'Consistent supplementation supports muscle recovery and deeper restorative sleep during your luteal phase.',
    timeAgo: '1h ago',
    isRead: false,
    actionLabel: 'Open Tracker',
    actionView: 'MEDICATION_TRACKER'
  },
  {
    id: 'n3',
    category: 'partner',
    title: 'Alex Viewed Your Shared Forecast',
    body: 'Partner sync was updated with your current phase insights and comfort preferences.',
    timeAgo: '3h ago',
    isRead: false,
    actionLabel: 'Partner Sync',
    actionView: 'PARTNER_SYNC'
  },
  {
    id: 'n4',
    category: 'wellness',
    title: 'Daily Symptom & Mood Check-In',
    body: 'Take 30 seconds to log how your body is feeling today to keep your hormone trend analysis accurate.',
    timeAgo: '5h ago',
    isRead: true,
    actionLabel: 'Log Symptoms',
    actionView: 'SYMPTOM_INTENSITY_LOG'
  },
  {
    id: 'n5',
    category: 'clinical',
    title: 'Monthly Cycle Health Report Ready',
    body: 'Your 30-day comprehensive summary with basal temperatures, symptoms, and sleep trends is ready for your doctor.',
    timeAgo: 'Yesterday',
    isRead: true,
    actionLabel: 'Export Report',
    actionView: 'EXPORT_HEALTH_REPORT'
  }
];

export const ModernizedNotificationInboxScreen: React.FC<ModernizedNotificationInboxScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'cycle' | 'partner' | 'medication'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    showToast('Inbox cleared');
  };

  const handleResetSample = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Notifications refreshed');
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'cycle') return n.category === 'cycle' || n.category === 'wellness';
    if (activeFilter === 'partner') return n.category === 'partner' || n.category === 'clinical';
    if (activeFilter === 'medication') return n.category === 'medication';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const cycleCount = notifications.filter(n => n.category === 'cycle' || n.category === 'wellness').length;
  const partnerCount = notifications.filter(n => n.category === 'partner' || n.category === 'clinical').length;
  const medCount = notifications.filter(n => n.category === 'medication').length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cycle':
        return <Calendar size={18} className="text-[#C86D7F]" />;
      case 'partner':
        return <Heart size={18} className="text-[#E07A5F]" />;
      case 'medication':
        return <Pill size={18} className="text-[#5F927E]" />;
      case 'clinical':
        return <Stethoscope size={18} className="text-[#3D6B99]" />;
      default:
        return <Droplet size={18} className="text-[#5B85AA]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DF]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF8F5] shadow-2xl overflow-x-hidden">
        
        {/* Top Twilight Organic Wave Banner */}
        <div className="relative w-full h-[185px] bg-[#2E284A] overflow-hidden">
          <img 
            src="/assets/notif_twilight_waves_1788592270975.jpg" 
            alt="Twilight Waves" 
            className="w-full h-full object-cover opacity-90 scale-105"
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

          {/* Top Bar with Back and Actions */}
          <div className="absolute top-11 left-0 right-0 px-6 flex items-center justify-between z-20">
            <button
              type="button"
              onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[12px] font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 hover:bg-white/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          </div>

          {/* Title row */}
          <div className="absolute bottom-2 left-0 right-0 px-6 z-20 flex items-baseline justify-between">
            <h1 className="font-serif text-[32px] sm:text-[34px] font-medium tracking-tight text-[#1D1621] leading-none">
              Activity &amp; Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#C86D7F] text-white shadow-xs">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* Horizontal Filter Tabs Bar */}
        <div className="px-5 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'cycle', label: `Cycle (${cycleCount})` },
            { id: 'partner', label: `Partner (${partnerCount})` },
            { id: 'medication', label: `Medications (${medCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                activeFilter === tab.id
                  ? 'bg-[#372E4E] text-white shadow-xs'
                  : 'bg-white border border-[#E8DFD8] text-[#695E67] hover:bg-[#F6EFEA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification Cards List */}
        <div className="px-5 pt-3 space-y-3 flex-1 overflow-y-auto">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-14 text-center space-y-3"
              >
                <div className="w-14 h-14 mx-auto rounded-3xl bg-white border border-[#EDE4DC] text-[#7A6A76] flex items-center justify-center shadow-xs">
                  <Bell size={26} strokeWidth={1.8} />
                </div>
                <h3 className="font-serif text-[20px] font-bold text-[#2A1D27]">
                  All Caught Up!
                </h3>
                <p className="text-[13.5px] text-[#7D6E79] max-w-xs mx-auto">
                  You have no pending notifications. HerCadence will gently alert you when your cycle approaches key milestones.
                </p>
              </motion.div>
            ) : (
              filtered.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleToggleRead(item.id)}
                  className={`p-4 rounded-[24px] border transition-all cursor-pointer relative overflow-hidden ${
                    item.isRead
                      ? 'bg-white/70 border-[#EDE4DC] opacity-80 hover:opacity-100'
                      : 'bg-white border-[#E0D0DC] shadow-[0_4px_18px_rgba(55,46,78,0.04)] ring-1 ring-[#C86D7F]/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF6F8] border border-[#EDE2E8] flex items-center justify-center shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className={`text-[14.5px] font-bold truncate ${
                          item.isRead ? 'text-[#3E333C]' : 'text-[#201521]'
                        }`}>
                          {item.title}
                        </h4>
                        <span className="text-[11px] font-medium text-[#8F7E8A] shrink-0">
                          {item.timeAgo}
                        </span>
                      </div>

                      <p className="text-[12.5px] text-[#5C4F59] leading-relaxed line-clamp-2">
                        {item.body}
                      </p>

                      {/* Action Pill Button if available */}
                      {item.actionLabel && onNavigate && (
                        <div className="mt-2.5 pt-2 border-t border-[#F2ECE8] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.actionView) onNavigate(item.actionView);
                            }}
                            className="text-[12px] font-bold text-[#372E4E] hover:text-[#5B477D] flex items-center gap-1 group cursor-pointer"
                          >
                            <span>{item.actionLabel}</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1 text-[#AB9AA6] hover:text-[#B04C58] transition-colors"
                            title="Dismiss notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Action Footers: Clear / Reset */}
        <div className="px-6 pt-2 pb-2 text-center flex items-center justify-center gap-4">
          {notifications.length > 0 ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[12px] font-semibold text-[#877884] hover:text-[#B04C58] transition-colors cursor-pointer"
            >
              Clear All Alerts
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetSample}
              className="text-[12px] font-semibold text-[#372E4E] hover:text-[#5B477D] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Restore Sample Alerts</span>
            </button>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="bg-white/95 backdrop-blur-md border-t border-[#EDE5DF] px-6 py-2.5 flex items-center justify-between sticky bottom-0 z-30">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('HOME') : onBack ? onBack() : undefined}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#D17E86] active:scale-95 transition-all cursor-pointer"
          >
            <Home size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] active:scale-95 transition-all cursor-pointer"
          >
            <Calendar size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Calendar</span>
          </button>

          {/* Center Action Button */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('SYMPTOM_INTENSITY_LOG')}
            className="flex flex-col items-center -mt-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D6848A] to-[#E9AE98] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(214,132,138,0.35)] active:scale-95 group-hover:scale-105 transition-all">
              <Plus size={22} strokeWidth={2.6} />
            </div>
            <span className="text-[10.5px] font-medium text-[#7F777E] mt-0.5">Log</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('INSIGHTS')}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] active:scale-95 transition-all cursor-pointer"
          >
            <BarChart2 size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Insights</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('PROFILE')}
            className="flex flex-col items-center gap-0.5 text-[#7F777E] hover:text-[#1E191D] active:scale-95 transition-all cursor-pointer"
          >
            <User size={20} strokeWidth={2} />
            <span className="text-[10.5px] font-medium">Profile</span>
          </button>
        </div>

        {/* Bottom iOS Indicator - interactive tap to home/back */}
        <div className="pt-2 pb-2 flex justify-center bg-white">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('HOME') : onBack ? onBack() : undefined}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Indicator - Tap to return Home"
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
              className="fixed bottom-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
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
