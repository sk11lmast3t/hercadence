import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

interface BirthControlScreenProps {
  onBack: () => void;
}

export const BirthControlScreen: React.FC<BirthControlScreenProps> = ({ onBack }) => {
  const { settings, updateSettings, dayLogs, saveDayLog } = useCycle();
  const bc = settings.birthControl;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dayLogs[todayStr];

  const [dailyPillReminder, setDailyPillReminder] = useState(settings.notifications.pillReminders);
  const [refillReminder, setRefillReminder] = useState(true);
  const [doctorVisitReminder, setDoctorVisitReminder] = useState(false);
  const [isTaken, setIsTaken] = useState(todayLog?.pillTaken ?? false);

  const handleTogglePill = () => {
    const nextState = !isTaken;
    setIsTaken(nextState);

    const todayDate = new Date().toISOString().split('T')[0];
    saveDayLog(todayDate, {
      pillTaken: nextState
    });

    if (nextState) {
      const nextIndex = bc.currentPillIndex < bc.packTotalPills ? bc.currentPillIndex + 1 : 1;
      updateSettings({
        birthControl: {
          ...bc,
          currentPillIndex: nextIndex,
          lastTakenTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          streakDays: bc.streakDays + 1
        }
      });
    }
  };

  const progressPercent = Math.min(100, Math.round((bc.currentPillIndex / bc.packTotalPills) * 100));
  const remainingDays = Math.max(0, bc.packTotalPills - bc.currentPillIndex);

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-32 relative overflow-x-hidden selection:bg-[#DE9E8E]/30">
      {/* Top Header Background with Organic Mint & Rose Curves */}
      <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden">
        <img
          src="/assets/bc_hero_art_1787934427835.jpg"
          alt="Birth Control Organic Fluid Ribbon Artwork"
          className="w-full h-full object-cover object-top"
        />
        {/* Soft bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF9F7]" />

        {/* Back Button */}
        <button
          onClick={onBack}
          id="bc_back_btn"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2A2328] hover:bg-white/70 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        {/* Centered Serif Titles in Header */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6 pointer-events-none text-center">
          <h1 className="font-serif text-[40px] sm:text-[44px] font-normal text-white drop-shadow-md tracking-tight leading-none">
            Birth Control
          </h1>
          <p className="text-[17px] sm:text-[18px] text-white/95 font-light pt-1 drop-shadow-sm">
            Cycle & Wellness
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-5 sm:px-6 space-y-4 -mt-10 relative z-10">
        {/* Card 1: Daily Pill Status */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 border border-[#EDE5DF] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center text-center space-y-4">
          <h2 className="font-serif text-[24px] text-[#20141E] tracking-tight">
            Daily Pill Status
          </h2>

          {/* Frosted Dual-tone Orb Interactive Button */}
          <button
            type="button"
            onClick={handleTogglePill}
            className="group relative w-36 h-36 rounded-full bg-gradient-to-br from-[#8DAAA0]/70 via-[#EACDC6]/65 to-[#E1BDB4]/80 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer transition-transform active:scale-95 hover:scale-105"
            title="Click to toggle taken status"
          >
            <div className="w-full h-full rounded-full bg-white/40 backdrop-blur-md border border-white/80 flex flex-col items-center justify-center text-white">
              {/* Checkmark SVG */}
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="font-serif text-[18px] text-white tracking-tight leading-snug">
                {isTaken ? 'Pill Taken!' : 'Take Your\nPill'}
              </span>
            </div>
          </button>

          {/* Status Subtitle */}
          <div className="space-y-1 pt-1">
            <p className="text-xs text-[#52444F] font-normal">
              Next pill: Today at {bc.reminderTime || '9:00 AM'}
            </p>
            <p className="text-xs font-medium text-[#20141E] flex items-center justify-center gap-1.5">
              <span>
                Status: {isTaken ? `Taken at ${bc.lastTakenTimestamp || '9:02 AM'}` : 'Not taken yet'}
              </span>
              {isTaken && (
                <span className="w-4 h-4 rounded-full bg-[#388E3C] text-white text-[10px] flex items-center justify-center font-bold">
                  ✓
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Card 2: Pack Progress */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 border border-[#EDE5DF] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="font-serif text-[24px] text-[#20141E] tracking-tight">
            Pack Progress
          </h2>

          <div className="flex items-center justify-between text-xs font-normal text-[#20141E]">
            <span>Current Pack: Day {bc.currentPillIndex}</span>
            <span>Remaining: {remainingDays} Days</span>
          </div>

          {/* Progress Bar Capsule */}
          <div className="relative w-full h-7 bg-[#E8EFEA] rounded-full p-1 flex items-center justify-between overflow-hidden">
            {/* Filled Progress Bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#8DAAA0] rounded-full flex items-center justify-end pr-2.5 transition-all duration-500"
              style={{ width: `${Math.max(12, progressPercent)}%` }}
            >
              {/* Pill Icon on indicator */}
              <div className="w-5 h-2.5 rounded-full bg-white rotate-45 shadow-sm border border-white/80" />
            </div>
            <span className="relative z-10 ml-auto pr-3 text-[11px] font-semibold text-[#52444F]">
              {bc.currentPillIndex}/{bc.packTotalPills} days
            </span>
          </div>

          {/* Refill Alert Warning */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#8A504A] pt-1">
            <span className="text-sm">⚠️</span>
            <span>Refill Soon: {Math.max(1, remainingDays <= 4 ? remainingDays : 4)} days left to order</span>
          </div>
        </div>

        {/* Card 3: Set Reminders */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 border border-[#EDE5DF] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="font-serif text-[24px] text-[#20141E] tracking-tight">
            Set Reminders
          </h2>

          {/* Row 1: Daily Pill Reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const nextVal = !dailyPillReminder;
                  setDailyPillReminder(nextVal);
                  updateSettings({
                    notifications: {
                      ...settings.notifications,
                      pillReminders: nextVal
                    }
                  });
                }}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                  dailyPillReminder ? 'bg-[#7A6178]' : 'bg-[#DDD3CB]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    dailyPillReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-normal text-[#20141E]">
                Daily Pill Reminder
              </span>
            </div>
            <span className="text-xs text-[#6C5F69] font-normal">
              {bc.reminderTime || '9:00 AM'}
            </span>
          </div>

          {/* Row 2: Refill Reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRefillReminder(!refillReminder)}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                  refillReminder ? 'bg-[#7A6178]' : 'bg-[#DDD3CB]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    refillReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-normal text-[#20141E]">
                Refill Reminder
              </span>
            </div>
            <span className="text-xs text-[#6C5F69] font-normal">
              3 Days Before
            </span>
          </div>

          {/* Row 3: Doctor Visit Reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDoctorVisitReminder(!doctorVisitReminder)}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                  doctorVisitReminder ? 'bg-[#7A6178]' : 'bg-[#DDD3CB]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    doctorVisitReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-normal text-[#20141E]">
                Doctor Visit Reminder
              </span>
            </div>
            <span className="text-xs text-[#6C5F69] font-normal">
              Set Date
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
