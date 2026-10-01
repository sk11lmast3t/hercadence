import React from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Sparkles, PenLine, Pill, Bell, ArrowRight } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';

interface NotificationAlertsScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const NotificationAlertsScreen: React.FC<NotificationAlertsScreenProps> = ({ onBack, onNavigate }) => {
  const { settings } = useCycle();
  const { savePreferences } = useNotificationPreferences();
  const notifs = settings.notifications;

  const toggleNotification = (key: keyof typeof notifs) => {
    savePreferences({
      [key]: !notifs[key]
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-32 relative overflow-x-hidden selection:bg-[#DE9E8E]/30">
      {/* Top Graphic Header Area with Flowing Artwork */}
      <div className="relative w-full">
        {/* Background Artwork */}
        <div className="relative w-full h-[320px] sm:h-[360px] overflow-hidden">
          <img
            src="/assets/notifications_alert_art_1787933857711.jpg"
            alt="Fluid abstract notifications background"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient merging */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF9F7]" />
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          id="notif_back_btn"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2A2328] hover:bg-white/70 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        {/* Floating Notification Glass Cards */}
        <div className="absolute inset-x-0 top-36 px-5 sm:px-6 max-w-md mx-auto space-y-3.5 z-10">
          {/* Card 1: Period Alert (Frosted Glass over art) */}
          <div className="bg-white/60 hover:bg-white/75 backdrop-blur-xl border border-white/70 rounded-[24px] p-4 flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#EBD8E2]/80 text-[#523446] flex items-center justify-center flex-shrink-0">
                <CalendarIcon size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1E191D] leading-tight">
                  Period Alert
                </h3>
                <p className="text-xs text-[#584D55] font-normal pt-0.5">
                  Estimated start in {notifs.periodReminderDaysBefore || 2} days
                </p>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <button
              type="button"
              onClick={() => toggleNotification('periodReminders')}
              aria-label="Toggle Period Alert"
              className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                notifs.periodReminders ? 'bg-[#523446]' : 'bg-[#DDD3CB]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  notifs.periodReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Card 2: Fertility Window */}
          <div className="bg-white/95 hover:bg-white border border-[#EFE8E3] rounded-[24px] p-4 flex items-center justify-between shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F0E5DE] text-[#523446] flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1E191D] leading-tight">
                  Fertility Window
                </h3>
                <p className="text-xs text-[#584D55] font-normal pt-0.5">
                  High chance of conception
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleNotification('fertileWindowAlerts')}
              aria-label="Toggle Fertility Window Alert"
              className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                notifs.fertileWindowAlerts ? 'bg-[#523446]' : 'bg-[#DDD3CB]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  notifs.fertileWindowAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Card 3: Daily Log Reminder */}
          <div className="bg-white/95 hover:bg-white border border-[#EFE8E3] rounded-[24px] p-4 flex items-center justify-between shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#EBE4EA] text-[#523446] flex items-center justify-center flex-shrink-0">
                <PenLine size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1E191D] leading-tight">
                  Daily Log Reminder
                </h3>
                <p className="text-xs text-[#584D55] font-normal pt-0.5">
                  Track your symptoms and mood
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleNotification('dailyLogPrompt')}
              aria-label="Toggle Daily Log Reminder"
              className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                notifs.dailyLogPrompt ? 'bg-[#523446]' : 'bg-[#DDD3CB]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  notifs.dailyLogPrompt ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Card 4: Medication/Pill */}
          <div className="bg-white/95 hover:bg-white border border-[#EFE8E3] rounded-[24px] p-4 flex items-center justify-between shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F0E5DE] text-[#523446] flex items-center justify-center flex-shrink-0">
                <Pill size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1E191D] leading-tight">
                  Medication/Pill
                </h3>
                <p className="text-xs text-[#584D55] font-normal pt-0.5">
                  Take your daily supplement
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleNotification('pillReminders')}
              aria-label="Toggle Medication Alert"
              className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                notifs.pillReminders ? 'bg-[#523446]' : 'bg-[#DDD3CB]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  notifs.pillReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Smart Reminders Permission Prompt Link */}
          {onNavigate && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('WELLNESS_REMINDERS_PERMISSION')}
                className="w-full py-3.5 px-4 bg-white/90 hover:bg-white border border-[#E8DFD8] rounded-[22px] flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.03)] active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6EEF3] text-[#523446] flex items-center justify-center">
                    <Bell size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-bold text-[#1E191D]">
                      Wellness Reminders Prompt
                    </div>
                    <div className="text-[11.5px] text-[#7A6C74]">
                      Preview smart cycle reminders activation screen
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#968A91]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
