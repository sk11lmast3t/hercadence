import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Check, 
  Watch, 
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Info,
  X,
  Sparkles,
  Thermometer,
  Heart,
  Moon,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';
import { Crown, Lock } from 'lucide-react';
import { formatDateToISO } from '../../utils/cycleCalculations';

interface ConnectedDevicesScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

interface IntegrationDevice {
  id: string;
  name: string;
  iconType: 'health_connect' | 'samsung' | 'apple' | 'google_fit' | 'oura' | 'garmin' | 'whoop' | 'fitbit';
  bgCircleColor: string;
  isConnected: boolean;
  lastSynced?: string;
  description: string;
  category: string;
}

export const ConnectedDevicesScreen: React.FC<ConnectedDevicesScreenProps> = ({ onBack, onNavigate }) => {
  const { settings, saveDayLog } = useCycle();
  const todayStr = formatDateToISO(new Date());

  const [devices, setDevices] = useState<IntegrationDevice[]>([
    {
      id: 'health_connect',
      name: 'Android Health Connect',
      iconType: 'health_connect',
      bgCircleColor: 'bg-[#E3F2FD]',
      isConnected: true,
      lastSynced: '8 mins ago',
      description: 'Google Pixel Watch, Galaxy Watch & Android ecosystem sync for BBT, resting HR, and sleep.',
      category: 'Android Native'
    },
    {
      id: 'oura_ring',
      name: 'Oura Ring Gen 3',
      iconType: 'oura',
      bgCircleColor: 'bg-[#F9F1E2]',
      isConnected: true,
      lastSynced: '25 mins ago',
      description: 'Continuous finger skin temperature deviations, HRV, and sleep staging.',
      category: 'Smart Ring'
    },
    {
      id: 'samsung_health',
      name: 'Samsung Health',
      iconType: 'samsung',
      bgCircleColor: 'bg-[#EDE7F6]',
      isConnected: false,
      lastSynced: 'Never',
      description: 'Galaxy Watch cycle temperature tracking and daily body composition.',
      category: 'Smartwatch'
    },
    {
      id: 'apple_health',
      name: 'Apple Health',
      iconType: 'apple',
      bgCircleColor: 'bg-[#FDECE7]',
      isConnected: false,
      lastSynced: 'Never',
      description: 'Wrist temperature tracking on Apple Watch Series 8/9/Ultra and cycle records.',
      category: 'iOS Ecosystem'
    },
    {
      id: 'garmin_connect',
      name: 'Garmin Connect',
      iconType: 'garmin',
      bgCircleColor: 'bg-[#E0F2F1]',
      isConnected: false,
      lastSynced: 'Never',
      description: 'Body Battery, nocturnal HRV status, and workout intensity.',
      category: 'Fitness Wearable'
    }
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<string>('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncedSummary, setSyncedSummary] = useState<{
    bbt: string;
    hr: number;
    sleep: string;
    hrv: number;
  } | null>(null);
  const [showCompatibleModal, setShowCompatibleModal] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const toggleDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === id) {
          const nextState = !dev.isConnected;
          setSyncToast(
            nextState 
              ? `${dev.name} successfully connected.` 
              : `${dev.name} disconnected.`
          );
          setTimeout(() => setSyncToast(null), 3000);
          return {
            ...dev,
            isConnected: nextState,
            lastSynced: nextState ? 'Just now' : 'Disconnected'
          };
        }
        return dev;
      })
    );
  };

  // Run interactive live simulation of Health Connect & Wearables sync
  const runWearablesSync = () => {
    if (!settings.isPremium) {
      if (onNavigate) {
        onNavigate('TRIAL_PAYWALL');
      }
      return;
    }
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(15);
    setSyncStep('Connecting to Android Health Connect & Oura API...');

    setTimeout(() => {
      setSyncProgress(45);
      setSyncStep('Reading nocturnal Basal Body Temperature sensor...');
    }, 700);

    setTimeout(() => {
      setSyncProgress(75);
      setSyncStep('Importing resting Heart Rate & Sleep architecture...');
    }, 1400);

    setTimeout(() => {
      setSyncProgress(100);
      setSyncStep('Finalizing cycle calibration...');
      
      const bbtVal = settings.temperatureUnit === 'Celsius' ? 36.68 : 98.02;
      // Save directly to today's log
      saveDayLog(todayStr, {
        bbt: bbtVal
      });

      setSyncedSummary({
        bbt: `${bbtVal}° ${settings.temperatureUnit === 'Celsius' ? 'C' : 'F'} (+0.22° shift)`,
        hr: 61,
        sleep: '7h 46m (Deep: 1h 38m)',
        hrv: 56
      });

      // Update last synced timestamps
      setDevices((prev) =>
        prev.map((d) => d.isConnected ? { ...d, lastSynced: 'Just now' } : d)
      );

      setIsSyncing(false);
      setSyncToast('Health Connect & Wearables synchronized successfully!');
      setTimeout(() => setSyncToast(null), 3500);
    }, 2100);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'health_connect':
        return (
          <div className="relative w-7 h-7 flex items-center justify-center">
            {/* Health Connect multi-color clover */}
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M12 2a5 5 0 0 0-5 5v1H6a5 5 0 0 0 0 10h1v1a5 5 0 0 0 10 0v-1h1a5 5 0 0 0 0-10h-1V7a5 5 0 0 0-5-5z" fill="#00838F" opacity="0.15" />
              <circle cx="9" cy="9" r="4" fill="#34A853" />
              <circle cx="15" cy="9" r="4" fill="#4285F4" />
              <circle cx="9" cy="15" r="4" fill="#FBBC05" />
              <circle cx="15" cy="15" r="4" fill="#EA4335" />
            </svg>
          </div>
        );
      case 'samsung':
        return (
          <div className="w-6 h-6 flex items-center justify-center text-[#2154B5]">
            <Activity size={22} strokeWidth={2.4} />
          </div>
        );
      case 'apple':
        return (
          <svg viewBox="0 0 170 170" className="w-6 h-6 fill-current text-[#1E191D]">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12.01-14.43-5.77-8.91-10.35-18.91-13.74-30-3.39-11.08-5.08-21.65-5.08-31.7 0-14.36 3.69-26.24 11.07-35.65 7.38-9.4 16.71-14.16 27.99-14.28 4.9.11 10.15 1.41 15.75 3.89 5.61 2.48 9.28 3.75 11.03 3.79 1.48 0 5.37-1.39 11.66-4.17 6.29-2.78 11.83-4.04 16.63-3.79 12.87.65 23.36 5.48 31.47 14.51-11.12 6.74-16.57 16.03-16.34 27.86.23 9.47 3.97 17.51 11.22 24.12 7.25 6.62 16.03 10.32 26.34 11.09-2.22 6.96-4.8 13.82-7.76 20.57zM119.22 33.64c0-7.07 2.61-13.78 7.82-20.12 5.22-6.35 11.75-10.42 19.59-12.22.42 1.3.63 2.5.63 3.59 0 7.07-2.67 13.9-8.01 20.49-5.34 6.58-11.81 10.63-19.41 12.14-.21-1.31-.62-2.6-6.62-3.88z" />
          </svg>
        );
      case 'garmin':
        return (
          <div className="w-6 h-6 flex items-center justify-center text-[#007CC3] font-black text-sm">
            ▲
          </div>
        );
      case 'oura':
        return (
          <div className="w-6 h-6 flex items-center justify-center text-[#785E2F]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth="2">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </div>
        );
      default:
        return <Watch size={22} className="text-[#543649]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1E191D] pb-32 relative font-sans selection:bg-[#DE9E8E]/30">
      {/* Top Header Watercolor Peach Art matching modernized_health_integrations_screen.png */}
      <div className="relative w-full h-[150px] sm:h-[170px] overflow-hidden">
        <img
          src="/assets/connected_devices_peach_botanical_1788418559808.jpg"
          alt="Peach watercolor wash with delicate gold botanical line art"
          className="w-full h-full object-cover object-center"
        />

        {/* Back Button */}
        <button
          onClick={onBack}
          id="connected_devices_back_btn"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#1E191D] hover:bg-white/90 active:scale-95 transition-all shadow-xs cursor-pointer"
          title="Back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>
      </div>

      <main className="max-w-md mx-auto px-5 sm:px-6 -mt-8 relative z-10 space-y-5">
        {/* Title and Subtitle */}
        <div className="pt-2">
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#1E191D] tracking-tight leading-tight">
            Connected Apps &amp; Devices
          </h1>
          <p className="text-[14px] text-[#7A6C74] font-medium mt-1">
            Manage your health data integrations &amp; Wearables
          </p>
        </div>

        {/* Wearable Sync Action Card */}
        <div className="bg-gradient-to-br from-[#2D1B26] via-[#3B2533] to-[#4D3143] rounded-[28px] p-5 text-white shadow-lg space-y-3.5 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle_at_top_right,rgba(222,158,142,0.25),transparent_70%)] pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-[#FAD5C9]">
                <Zap size={16} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white tracking-tight">Health Connect Sync</h3>
                <p className="text-[11px] text-[#E0CCD6]">Pixel Watch • Galaxy Watch • Oura Ring</p>
              </div>
            </div>

            <button
              type="button"
              onClick={runWearablesSync}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                isSyncing 
                  ? 'bg-white/20 text-white/70 cursor-not-allowed' 
                  : 'bg-white text-[#3B2533] hover:bg-[#FDF6F2] active:scale-95'
              }`}
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              {!settings.isPremium && (
                <Crown size={12} className="text-amber-300 ml-0.5" />
              )}
            </button>
          </div>

          {/* Sync Progress Bar */}
          {isSyncing && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5 pt-1"
            >
              <div className="flex justify-between text-[11px] text-[#E8D6DF]">
                <span>{syncStep}</span>
                <span>{syncProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#DE9E8E] to-[#9BC0A8]"
                  animate={{ width: `${syncProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Synced Biometrics Preview Grid */}
          {syncedSummary ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2 pt-1 relative z-10"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
                <div className="flex items-center gap-1.5 text-[11px] text-[#FFDDD4]">
                  <Thermometer size={12} />
                  <span>Basal Body Temp</span>
                </div>
                <p className="text-[13px] font-bold text-white mt-0.5">{syncedSummary.bbt}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
                <div className="flex items-center gap-1.5 text-[11px] text-[#FFDDD4]">
                  <Heart size={12} />
                  <span>Resting HR</span>
                </div>
                <p className="text-[13px] font-bold text-white mt-0.5">{syncedSummary.hr} bpm</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon size={14} className="text-[#DE9E8E]" />
                  <span className="text-[11.5px] text-[#F3E5ED]">Sleep Duration:</span>
                  <span className="text-[12px] font-bold text-white">{syncedSummary.sleep}</span>
                </div>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-semibold border border-emerald-500/30">
                  Synced
                </span>
              </div>
            </motion.div>
          ) : (
            <p className="text-[11.5px] text-[#E0CCD6] leading-snug">
              Sync automatically registers nighttime skin temperature deviations to predict your fertile window and confirm ovulation.
            </p>
          )}
        </div>

        {/* Integration Cards Stack matching screenshot */}
        <div className="space-y-3.5 pt-2">
          {devices.map((device) => (
            <motion.div
              key={device.id}
              layout
              className="bg-white rounded-[24px] p-4 sm:p-4.5 border border-[#EDE4DE] shadow-[0_4px_16px_rgba(0,0,0,0.025)] flex items-center justify-between gap-3 transition-all"
            >
              {/* Left Side: Avatar + Name */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-13 h-13 rounded-full ${device.bgCircleColor} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                  {renderIcon(device.iconType)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] sm:text-[17px] font-medium text-[#1E191D] tracking-tight truncate">
                    {device.name}
                  </h3>
                  <p className="text-[11px] text-[#7A6C74] font-medium truncate">
                    {device.isConnected ? `Synced: ${device.lastSynced}` : 'Sync disabled'}
                  </p>
                </div>
              </div>

              {/* Right Side: Status Badge + Toggle Switch */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Badge: Connected (green) or Connect (grey) */}
                <span
                  className={`text-[12px] font-semibold px-3 py-1 rounded-full transition-colors ${
                    device.isConnected
                      ? 'bg-[#EAF4EC] text-[#3D744D]'
                      : 'bg-[#F2EDE9] text-[#7F746E]'
                  }`}
                >
                  {device.isConnected ? 'Connected' : 'Connect'}
                </span>

                {/* iOS Style Pill Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={device.isConnected}
                  onClick={() => toggleDevice(device.id)}
                  id={`toggle_${device.id}`}
                  className={`w-13 h-7.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    device.isConnected ? 'bg-[#251E23]' : 'bg-[#D6CDC7]'
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`bg-white w-5.5 h-5.5 rounded-full shadow-sm ${
                      device.isConnected ? 'ml-auto' : 'mr-auto'
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* "See all compatible devices" Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowCompatibleModal(true)}
            id="see_compatible_devices_btn"
            className="w-full py-4 px-6 rounded-full bg-white hover:bg-[#FAF8F6] active:scale-[0.99] border border-[#E5DBD4] text-[#1E191D] text-[15px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>See all compatible devices</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="bg-[#FAF7F4] rounded-2xl p-4 border border-[#EFE8E3] flex items-start gap-3 mt-4">
          <ShieldCheck size={18} className="text-[#543649] flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <h4 className="text-[12px] font-bold text-[#1E191D]">End-to-End Privacy Guaranteed</h4>
            <p className="text-[11px] text-[#7A6C74] mt-0.5 leading-relaxed">
              Biometric and wearable data remains encrypted on your device and is only used to refine cycle and ovulation projections.
            </p>
          </div>
        </div>
      </main>

      {/* Compatible Devices Modal */}
      <AnimatePresence>
        {showCompatibleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-[#EDE4DE] space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE5]">
                <h3 className="text-[18px] font-bold text-[#1E191D]">Supported Devices &amp; Labs</h3>
                <button 
                  onClick={() => setShowCompatibleModal(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 text-[#7A6C74]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {[
                  { name: 'Fitbit / Pixel Watch', type: 'Skin Temp, Steps, Sleep', status: 'Available' },
                  { name: 'Whoop 4.0', type: 'Strain, Recovery, Skin Temp', status: 'Available' },
                  { name: 'Garmin Connect', type: 'Body Battery, Sleep Stages', status: 'Available' },
                  { name: 'Withings Health Mate', type: 'Body Cardio Scale, Sleep Pad', status: 'Available' },
                  { name: 'Natural Cycles Thermometer', type: 'Direct BBT Bluetooth', status: 'Available' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EDE4DE] flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-[#1E191D]">{item.name}</p>
                      <p className="text-[10.5px] text-[#7A6C74]">{item.type}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#543649] bg-white border border-[#E5DBD4] px-2.5 py-1 rounded-full">
                      Pair
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCompatibleModal(false)}
                className="w-full py-3 rounded-full bg-[#543649] text-white text-[14px] font-medium"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sync Toast Notification */}
      <AnimatePresence>
        {syncToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-[#251E23] text-white text-xs px-4 py-2.5 rounded-full shadow-lg border border-white/10 flex items-center gap-2"
          >
            <Check size={14} className="text-emerald-400" />
            <span>{syncToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
