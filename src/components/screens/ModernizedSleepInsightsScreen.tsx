import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  Home, 
  Calendar as CalendarIcon, 
  Plus, 
  BarChart2, 
  User, 
  Moon, 
  Eye, 
  Activity, 
  Sparkles, 
  Clock, 
  ChevronLeft, 
  Check, 
  X,
  Share2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useSleep } from '../../features/sleep/hooks/useSleep';
import { sleepGuide } from '../../guides/guideRegistry';
import { useGuideProgress } from '../../guides/useGuideProgress';

interface ModernizedSleepInsightsScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export function getSleepSaveMessage(success: boolean, error: string | null): string {
  return success ? 'Sleep log saved to cloud' : error || 'Sleep log could not be saved';
}

export function calculateSleepDurationHours(bedtime: string, wakeTime: string): number | null {
  const bedtimeMinutes = parseSleepTime(bedtime);
  const wakeTimeMinutes = parseSleepTime(wakeTime);
  if (bedtimeMinutes === null || wakeTimeMinutes === null) return null;
  const difference = wakeTimeMinutes - bedtimeMinutes;
  return (difference <= 0 ? difference + 24 * 60 : difference) / 60;
}

function parseSleepTime(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

export function SleepStatusNotice({
  status,
  error,
}: {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  error: string | null;
}) {
  if (status === 'loading') {
    return <div role="status">Loading your sleep records...</div>;
  }
  if (status === 'error') {
    return <div role="alert">{error || 'Sleep records could not be loaded.'}</div>;
  }
  if (status === 'empty') {
    return <div>No sleep records yet. Log your first night below.</div>;
  }
  return null;
}

export function SleepStageUnavailable() {
  return <span>Not recorded</span>;
}

export const ModernizedSleepInsightsScreen: React.FC<ModernizedSleepInsightsScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { saveSleepLog, logs, status, isLoading, error: sleepError } = useSleep();
  const { isVisible: isGuideVisible, dismiss: dismissGuide, replay: replayGuide } = useGuideProgress(sleepGuide);
  const [selectedRange, setSelectedRange] = useState<'Today' | 'Weekly' | 'Monthly'>('Today');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [bedtime, setBedtime] = useState<string>('23:15');
  const [wakeTime, setWakeTime] = useState<string>('06:45');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const latestLog = logs[0];
  const sleepScore = latestLog?.quality === 'excellent' ? 100 : latestLog?.quality === 'good' ? 85 : latestLog?.quality === 'fair' ? 65 : latestLog?.quality === 'poor' ? 40 : 0;
  const totalSleepStr = latestLog?.durationHours != null ? `${Math.floor(latestLog.durationHours)}h ${Math.round((latestLog.durationHours % 1) * 60)}m` : '--';
  const recordedTime = latestLog?.bedtime && latestLog.wakeTime
    ? `${latestLog.bedtime} - ${latestLog.wakeTime}`
    : 'Times not recorded';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Horseshoe gauge calculation:
  // Sweep of 260 degrees (from 140deg to 400deg)
  const radius = 90;
  const strokeWidth = 14;
  const arcLength = 2 * Math.PI * radius * (260 / 360);
  const progressRatio = sleepScore / 100;
  const strokeDashoffset = arcLength * (1 - progressRatio);

  const handleSaveSleep = async () => {
    const today = new Date().toISOString().split('T')[0];
    const result = await saveSleepLog({
      logDate: today,
      bedtime,
      wakeTime,
      durationHours: calculateSleepDurationHours(bedtime, wakeTime),
      quality: 'good',
    });
    setShowLogModal(false);
    if (result.ok) {
      showToast(getSleepSaveMessage(true, null));
    } else {
      // Use the error returned directly from the operation to avoid reading
      // the stale closed-over hook state value before the next re-render.
      showToast(getSleepSaveMessage(false, result.errorMessage));
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0C1B] text-[#1E191D] flex justify-center selection:bg-[#43347C]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF9F7] pb-24 shadow-2xl overflow-x-hidden">
        
        {/* Top Twilight Silk Banner */}
        <div className="relative w-full h-[190px] overflow-hidden bg-[#181329]">
          <img 
            src="/assets/sleep_twilight_waves_1788590010147.jpg" 
            alt="Sleep Twilight Silk Waves" 
            className="w-full h-full object-cover opacity-90 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FAF9F7]" />

          {/* iOS Status Bar (White icons on dark background) */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-white/90 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41</span>
            <div className="flex items-center space-x-1.5 text-white/90">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Header Title with Stardust */}
          <div className="absolute top-12 left-0 right-0 px-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-8 h-8 -ml-1 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-[#C1BDDE] text-xs">✦</span>
                <h1 className="font-serif text-[30px] sm:text-[32px] font-normal text-white tracking-tight leading-none drop-shadow-sm">
                  Sleep Insights
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('PROFILE')}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all border border-white/20"
            >
              <User size={18} />
            </button>
          </div>
        </div>

        {/* Floating Main Content Container */}
        <div className="px-5 -mt-10 relative z-20 flex-1 space-y-4">

          {isLoading && (
            <div className="rounded-2xl bg-white px-4 py-3 text-center text-[13px] text-[#685F75] shadow-sm">
              <SleepStatusNotice status="loading" error={null} />
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-2xl bg-[#FFF1F0] px-4 py-3 text-center text-[13px] text-[#9A3F3A] shadow-sm">
              <SleepStatusNotice status="error" error={sleepError} />
            </div>
          )}
          {status === 'empty' && (
            <div className="rounded-2xl bg-white px-4 py-3 text-center text-[13px] text-[#685F75] shadow-sm">
              <SleepStatusNotice status="empty" error={null} />
            </div>
          )}
          {isGuideVisible && (
            <div role="dialog" aria-label="Sleep guide" className="rounded-2xl bg-[#F5F2F9] px-4 py-3 text-[#4E4466] shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold">{sleepGuide.steps[0].title}</p>
                  <p className="mt-1 text-[12px]">{sleepGuide.steps[0].body}</p>
                </div>
                <button type="button" onClick={dismissGuide} className="text-[12px] font-semibold">Dismiss</button>
              </div>
            </div>
          )}
          
          {/* Main Sleep Quality Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full bg-white rounded-[32px] p-6 shadow-[0_12px_36px_rgba(20,15,40,0.08)] border border-[#EFECE8] flex flex-col items-center text-center"
          >
            <h2 className="text-[17px] font-semibold text-[#1C1628] tracking-tight">
              Sleep Quality
            </h2>

            {/* Circular Horseshoe Gauge */}
            <div className="relative w-[210px] h-[195px] mt-3 flex items-center justify-center">
              <svg className="w-[210px] h-[210px] -rotate-[130deg]" viewBox="0 0 220 220">
                <defs>
                  <linearGradient id="sleepQualityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E194D" />
                    <stop offset="50%" stopColor="#312B75" />
                    <stop offset="100%" stopColor="#554699" />
                  </linearGradient>
                  <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Track Background */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke="#EDEAF4"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${arcLength} 9999`}
                />

                {/* Animated Value Arc */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke="url(#sleepQualityGradient)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  filter="url(#arcGlow)"
                  strokeDasharray={`${arcLength} 9999`}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Gauge Center Labels */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-2">
                <span className="text-[44px] font-bold text-[#191329] tracking-tight leading-none font-sans">
                  {sleepScore}%
                </span>
                <span className="text-[14px] font-medium text-[#463F56] mt-1">
                  {latestLog?.quality ? `${latestLog.quality[0].toUpperCase()}${latestLog.quality.slice(1)} Sleep` : 'No record'}
                </span>
              </div>
            </div>

            {/* Total Sleep stat */}
            <div className="mt-1">
              <div className="text-[26px] font-bold text-[#191329] tracking-tight leading-tight">
                {totalSleepStr}
              </div>
              <div className="text-[13px] font-medium text-[#7B7287]">
                Total Sleep
              </div>
            </div>

            {/* Feedback footnote */}
            <div className="mt-3.5 px-4 py-1.5 rounded-full bg-[#F5F2F9] text-[#4E4466] text-[13px] font-medium">
              {latestLog ? recordedTime : 'Your saved sleep records will appear here.'}
            </div>
          </motion.div>

          {/* Three Sleep Stage Frosted Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            
            {/* 1. Deep Sleep */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="bg-white/90 backdrop-blur-md rounded-[22px] p-3 border border-[#E9E4F0] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-full bg-[#EAEBF8] text-[#343F7C] flex items-center justify-center mb-1.5 shadow-xs">
                <Moon size={16} strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-medium text-[#685F75] leading-tight">
                Deep Sleep
              </span>
              <span className="text-[14px] font-bold text-[#1C1628] mt-0.5">
                <SleepStageUnavailable />
              </span>
            </motion.div>

            {/* 2. REM Sleep */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
              className="bg-white/90 backdrop-blur-md rounded-[22px] p-3 border border-[#F3E6EA] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-full bg-[#FAE8ED] text-[#A84F66] flex items-center justify-center mb-1.5 shadow-xs">
                <Activity size={16} strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-medium text-[#685F75] leading-tight">
                REM Sleep
              </span>
              <span className="text-[14px] font-bold text-[#1C1628] mt-0.5">
                <SleepStageUnavailable />
              </span>
            </motion.div>

            {/* 3. Awake */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.16 }}
              className="bg-white/90 backdrop-blur-md rounded-[22px] p-3 border border-[#E3ECE6] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-full bg-[#E5EFE8] text-[#477558] flex items-center justify-center mb-1.5 shadow-xs">
                <Eye size={16} strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-medium text-[#685F75] leading-tight">
                Awake
              </span>
              <span className="text-[14px] font-bold text-[#1C1628] mt-0.5">
                <SleepStageUnavailable />
              </span>
            </motion.div>

          </div>

          {latestLog && (
            <div className="rounded-[22px] bg-white/90 p-4 border border-[#E9E4F0] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
              <h2 className="font-serif text-[20px] font-normal text-[#1E191D] tracking-tight">Recent Sleep</h2>
              <div className="mt-2 space-y-2">
                {logs.slice(0, 7).map((log) => (
                  <div key={log.id || log.logDate} className="flex items-center justify-between border-b border-[#F0ECF3] py-2 last:border-0">
                    <span className="text-[13px] text-[#685F75]">{log.logDate}</span>
                    <span className="text-[13px] font-semibold text-[#1C1628]">
                      {log.durationHours == null ? 'Duration not recorded' : `${Math.floor(log.durationHours)}h ${Math.round((log.durationHours % 1) * 60)}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Button: Log or Adjust Sleep */}
          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              data-guide-target="sleep-log-action"
              className="flex-1 py-3 px-4 rounded-2xl bg-white border border-[#E7E2EE] text-[13.5px] font-bold text-[#2C243B] hover:bg-[#F9F7FC] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Clock size={16} className="text-[#554699]" />
              <span>Log Sleep Times</span>
            </button>
            <button
              type="button"
              onClick={replayGuide}
              className="px-3 rounded-2xl bg-white border border-[#E7E2EE] text-[12px] font-bold text-[#554699] hover:bg-[#F9F7FC] active:scale-[0.98] transition-all shadow-xs"
            >
              Guide
            </button>
            <button
              type="button"
              onClick={() => {
                showToast('Smart sensor sync is not connected');
              }}
              className="w-12 h-12 rounded-2xl bg-white border border-[#E7E2EE] flex items-center justify-center text-[#554699] hover:bg-[#F9F7FC] active:scale-95 transition-all shadow-xs"
              title="Sync Sensor"
            >
              <Sparkles size={18} />
            </button>
          </div>

        </div>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-transparent px-6 py-2.5 flex justify-between items-center z-30">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('HOME')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <Home size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <CalendarIcon size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="flex flex-col items-center -mt-3"
          >
            <div className="w-11 h-11 rounded-full bg-[#C8757F] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(200,117,127,0.35)] active:scale-95 transition-all">
              <Plus size={22} strokeWidth={2.2} />
            </div>
            <span className="text-[11px] font-medium text-[#736870] mt-0.5">Add</span>
          </button>

          {/* Active Insights Button with Green Bar matching screenshot */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('INSIGHTS')}
            className="flex flex-col items-center gap-1 text-[#477558] font-semibold transition-colors relative"
          >
            <BarChart2 size={20} strokeWidth={2.2} />
            <span className="text-[11px] font-semibold">Insights</span>
            <div className="w-8 h-0.5 rounded-full bg-[#477558] absolute -bottom-1" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('PROFILE')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <User size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Profile</span>
          </button>
        </nav>

        {/* iOS Home Indicator bar */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] pb-1 flex justify-center bg-transparent z-40 pointer-events-none">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('INSIGHTS'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

        {/* Modal: Sleep Times */}
        <AnimatePresence>
          {showLogModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-2xl border border-[#EDE5DF]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-[20px] font-bold text-[#1E181D]">
                    Log Sleep Schedule
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Bedtime
                    </label>
                    <input
                      type="time"
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[15px] font-medium text-[#221B20]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Wake Up Time
                    </label>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[15px] font-medium text-[#221B20]"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F2F9] text-[#4E4466] text-[12.5px] flex items-center gap-2.5">
                    <Info size={18} className="shrink-0 text-[#554699]" />
                    <span>Luteal phase sleep quality averages 15% lower due to progesterone fluctuations.</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-[#DDD3CB] text-[14px] font-semibold text-[#665A63]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSleep}
                    className="flex-1 py-3 rounded-2xl bg-[#312B75] text-white text-[14px] font-bold shadow-[0_4px_14px_rgba(49,43,117,0.3)] active:scale-[0.98]"
                  >
                    Save Log
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Feedback Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
            >
              <Check size={14} className="text-[#96D6A6]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
