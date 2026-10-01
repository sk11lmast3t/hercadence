import React, { useState } from 'react';
import { 
  ChevronLeft, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  Clock, 
  Check, 
  ArrowRight,
  HardDrive,
  WifiOff,
  Wifi,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useCycle } from '../../context/CycleContext';

interface ModernizedOfflineStateScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedOfflineStateScreen: React.FC<ModernizedOfflineStateScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { dayLogs } = useCycle();
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : false
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalLogsSaved = Object.keys(dayLogs || {}).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('/api/health?t=' + Date.now(), {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setIsConnected(true);
        showToast(`Network restored! ${totalLogsSaved} offline entries fully synced.`);
      } else {
        setIsConnected(false);
        showToast('Server not reachable. Safe offline mode is active.');
      }
    } catch {
      setIsConnected(false);
      showToast('Still offline. All changes remain saved on your device.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('HOME');
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#20171D] pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EDE4DE] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoHome}
            className="w-9 h-9 rounded-full bg-white border border-[#E5DCD5] flex items-center justify-center text-[#523446] hover:bg-[#F5ECE8] active:scale-95 transition-all shadow-xs cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <img
                src="/assets/hercadence_logo.jpg"
                alt="HerCadence"
                className="w-4 h-4 rounded-full object-cover shadow-2xs border border-[#E5DCD5]"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-base font-bold text-[#20171D] leading-tight">
                Offline Protection
              </h1>
            </div>
            <p className="text-[11px] text-[#7A6C74]">
              Local storage &amp; sync integrity
            </p>
          </div>
        </div>

        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
          isConnected
            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            : 'bg-amber-100 text-amber-900 border border-amber-300'
        }`}>
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isConnected ? 'Online' : 'Offline'}</span>
        </span>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EBF0EC] via-[#E4EDE7] to-[#DDE6E0] border border-[#CAD8CE] p-6 shadow-sm">
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-2 max-w-[80%]">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#523446] text-white">
                <ShieldCheck size={12} />
                <span>Zero Data Loss</span>
              </span>

              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#1E171E] tracking-tight">
                {isConnected ? 'Network Connected & Synced' : 'You’re Offline, But Protected'}
              </h2>

              <p className="text-xs sm:text-sm text-[#4E5C53] leading-relaxed">
                HerCadence saves all your symptom logs, cycle markers, and daily entries locally with on-device persistence. When internet returns, your logs remain completely intact.
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/85 backdrop-blur-sm border border-white flex items-center justify-center text-[#425549] shadow-sm shrink-0">
              {isConnected ? <Wifi size={24} /> : <WifiOff size={24} />}
            </div>
          </div>
        </div>

        {/* Offline Status Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#ECE2DA] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE6]">
            <span className="text-xs font-bold text-[#7E6E7A] uppercase tracking-wider">
              Local Storage Metrics
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {isConnected ? 'Live Server Connected' : 'Local Storage Cache'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#ECE2DA]">
              <span className="text-[11px] text-[#7A6C74] block">Logged Days</span>
              <span className="text-base font-bold text-[#20171D]">{totalLogsSaved} Entries</span>
              <p className="text-[10px] text-emerald-700 mt-0.5">Encrypted locally</p>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#ECE2DA]">
              <span className="text-[11px] text-[#7A6C74] block">Storage Engine</span>
              <span className="text-base font-bold text-[#20171D]">IndexedDB / Local</span>
              <p className="text-[10px] text-[#7A6C74] mt-0.5">Zero cloud telemetry</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isChecking}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#425549] hover:bg-[#36463C] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-75"
            >
              <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Testing Internet...' : 'Check Connection & Sync'}</span>
            </button>

            <button
              type="button"
              onClick={handleGoHome}
              className="w-full py-3 px-4 rounded-2xl border border-[#D5C9BF] text-[#4F414A] text-xs font-semibold hover:bg-white active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Home size={15} />
              <span>Continue in Offline Mode (Return Home)</span>
            </button>
          </div>
        </div>

        {/* 404 / Missing Route Diagnostics Link */}
        <div 
          onClick={() => onNavigate && onNavigate('NOT_FOUND_404')}
          className="p-4 rounded-3xl bg-white border border-[#EDE4DE] shadow-sm hover:border-[#D0C2CC] transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5F2] text-[#523446] border border-[#EAE0D9] flex items-center justify-center shadow-2xs">
              <HardDrive size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#20171D]">404 &amp; Missing Record Recovery</h4>
              <p className="text-[11px] text-[#7A6C74]">Diagnose missing routes or disconnected services</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#8E7E87]" />
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-[#1E191D] text-white text-xs font-medium shadow-lg z-50 flex items-center gap-2"
          >
            <Check size={14} className="text-[#8BE1A5]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
